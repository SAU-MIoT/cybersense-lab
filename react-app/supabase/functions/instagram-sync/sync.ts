import { extractPhotoImages, safeError, selectInitialMedia, skipReason, storagePath } from "./core.ts";
import { downloadImage, fetchInstagramMedia, generateTitle, scanInstagram } from "./external.ts";
import type {
  ImportImage,
  InstagramMedia,
  ServiceDatabase,
  SyncConfig,
  SyncLease,
  SyncSummary,
  Trigger,
  RetryRow,
} from "./types.ts";

const BUCKET = "content-images";
const RETRY_LIMIT = 25;

async function rpcOrThrow<T>(
  db: ServiceDatabase,
  name: string,
  args: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await db.rpc<T>(name, args);
  if (error) throw new Error(`${name}_${error.code ?? "failed"}`);
  return data as T;
}

async function markImport(
  db: ServiceDatabase,
  media: InstagramMedia,
  status: "pending" | "retry" | "skipped",
  lastError: string | null,
): Promise<void> {
  await rpcOrThrow(db, "mark_instagram_import", {
    p_external_media_id: media.id,
    p_media_type: media.media_type,
    p_permalink: media.permalink ?? null,
    p_media_timestamp: media.timestamp,
    p_status: status,
    p_last_error: lastError,
  });
}

async function importOne(
  media: InstagramMedia,
  db: ServiceDatabase,
  config: SyncConfig,
  fetcher: typeof fetch,
  markPending = true,
): Promise<boolean> {
  const caption = media.caption?.trim();
  if (!caption) throw new Error("empty_caption");
  const images = extractPhotoImages(media);
  if (!images.length) throw new Error("no_supported_images");

  if (markPending) await markImport(db, media, "pending", null);
  const title = await generateTitle(caption, config.geminiModel, config.geminiApiKey, fetcher);
  const importedImages: ImportImage[] = [];
  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const downloaded = await downloadImage(image.media_url!, fetcher);
    const path = storagePath(media.id, image.id, downloaded.extension);
    const upload = await db.upload(BUCKET, path, downloaded.body, {
      contentType: downloaded.mime,
      upsert: true,
    });
    if (upload.error) throw new Error(`storage_upload_${upload.error.code ?? "failed"}`);
    importedImages.push({
      storage_path: path,
      public_url: db.getPublicUrl(BUCKET, path),
      sort_order: index,
    });
  }

  const result = await rpcOrThrow<{ created?: boolean; imported?: boolean }>(db, "import_instagram_announcement", {
    p_external_media_id: media.id,
    p_media_type: media.media_type,
    p_permalink: media.permalink ?? null,
    p_media_timestamp: media.timestamp,
    p_title: title,
    p_content: media.caption!,
    p_images: importedImages,
  });
  if (!result || result.imported !== true) throw new Error("import_rpc_invalid_result");
  return result.created === true;
}

function finalStatus(summary: SyncSummary): SyncSummary["status"] {
  if (!summary.retrying) return "success";
  // Discovery completed and every failed item has been persisted for retry, so the
  // watermark must still advance. "failed" is reserved for run-level failures.
  return "partial";
}

function retryRowAsMedia(row: RetryRow): InstagramMedia {
  return {
    id: row.external_media_id,
    media_type: row.media_type,
    permalink: row.permalink ?? undefined,
    timestamp: row.media_timestamp,
  };
}

export async function runSync(
  trigger: Trigger,
  db: ServiceDatabase,
  config: SyncConfig,
  fetcher: typeof fetch = fetch,
): Promise<SyncSummary> {
  const lockToken = crypto.randomUUID();
  const lease = await rpcOrThrow<SyncLease>(db, "claim_instagram_sync_run", {
    p_trigger: trigger,
    p_lock_token: lockToken,
    p_lease_seconds: 600,
  });
  if (!lease.acquired) {
    return { status: "already_running", discovered: 0, imported: 0, skipped: 0, retrying: 0 };
  }

  const summary: SyncSummary = { status: "success", discovered: 0, imported: 0, skipped: 0, retrying: 0 };
  let newest: InstagramMedia | null = null;
  let criticalError: string | null = null;
  let firstItemError: string | null = null;
  let discoveryCompleted = false;
  const processedRetryIds = new Set<string>();

  try {
    const retryRows = await db.getRetryRows(RETRY_LIMIT);
    if (retryRows.error) throw new Error(`retry_query_${retryRows.error.code ?? "failed"}`);
    for (const row of retryRows.data ?? []) {
      processedRetryIds.add(row.external_media_id);
      let media: InstagramMedia | null = null;
      try {
        await markImport(db, retryRowAsMedia(row), "pending", null);
        media = await fetchInstagramMedia(
          row.external_media_id,
          config.instagramApiVersion,
          config.instagramAccessToken,
          fetcher,
        );
        const reason = skipReason(media);
        if (reason) {
          await markImport(db, media, "skipped", reason);
          summary.skipped += 1;
          continue;
        }
        const created = await importOne(media, db, config, fetcher, false);
        if (created) summary.imported += 1;
      } catch (error) {
        const itemError = safeError(error);
        firstItemError ??= itemError;
        summary.retrying += 1;
        try {
          await markImport(db, media ?? retryRowAsMedia(row), "retry", itemError);
        } catch {
          // The row was already durable as pending/retry before this attempt.
        }
      }
    }

    const stagedRecovery = !lease.initial_sync_completed && Boolean(lease.last_seen_media_id);
    if (stagedRecovery) {
      // The prior first run durably staged its exact cohort and watermark. Retrying
      // that cohort is sufficient; rescanning could accidentally widen the first import.
      discoveryCompleted = true;
      summary.status = finalStatus(summary);
    } else {
      const scan = await scanInstagram(
        config.instagramUserId,
        config.instagramApiVersion,
        config.instagramAccessToken,
        {
          initial: !lease.initial_sync_completed,
          lastSeenId: lease.last_seen_media_id,
          lastSeenTimestamp: lease.last_seen_media_timestamp,
          initialLimit: 4,
        },
        fetcher,
      );
      newest = scan.newest;
      const freshScanned = scan.scanned.filter((media) => !processedRetryIds.has(media.id));
      const selection = lease.initial_sync_completed
        ? {
          processable: freshScanned.filter((media) => !skipReason(media)),
          skipped: freshScanned.flatMap((media) => {
            const reason = skipReason(media);
            return reason ? [{ media, reason }] : [];
          }),
        }
        : selectInitialMedia(freshScanned, 4);
      summary.discovered = freshScanned.length;
      let persistenceFailed = false;

      if (!lease.initial_sync_completed) {
        const stagedItems = [
          ...selection.processable.map((media) => ({
            external_media_id: media.id,
            media_type: media.media_type,
            permalink: media.permalink ?? null,
            media_timestamp: media.timestamp,
            status: "pending",
            last_error: null,
          })),
          ...selection.skipped.map(({ media, reason }) => ({
            external_media_id: media.id,
            media_type: media.media_type,
            permalink: media.permalink ?? null,
            media_timestamp: media.timestamp,
            status: "skipped",
            last_error: reason,
          })),
        ];
        await rpcOrThrow(db, "stage_initial_instagram_imports", {
          p_lock_token: lockToken,
          p_last_seen_media_id: newest?.id ?? null,
          p_last_seen_media_timestamp: newest?.timestamp ?? null,
          p_items: stagedItems,
        });
        discoveryCompleted = true;
        summary.skipped += selection.skipped.length;
      } else {
        discoveryCompleted = true;
        for (const skipped of selection.skipped) {
          try {
            await markImport(db, skipped.media, "skipped", skipped.reason);
            summary.skipped += 1;
          } catch (error) {
            firstItemError ??= safeError(error);
            summary.retrying += 1;
            persistenceFailed = true;
          }
        }
      }

      for (const media of selection.processable) {
        try {
          const created = await importOne(
            media,
            db,
            config,
            fetcher,
            lease.initial_sync_completed,
          );
          if (created) summary.imported += 1;
        } catch (error) {
          const itemError = safeError(error);
          firstItemError ??= itemError;
          summary.retrying += 1;
          try {
            await markImport(db, media, "retry", itemError);
          } catch {
            // Do not advance the watermark if this failed item was not durably queued.
            persistenceFailed = true;
          }
        }
      }
      if (persistenceFailed) throw new Error("instagram_import_state_persistence_failed");
      summary.status = finalStatus(summary);
    }
  } catch (error) {
    criticalError = safeError(error);
    summary.status = "failed";
  } finally {
    const watermark = discoveryCompleted && newest && summary.status !== "failed" ? newest : null;
    try {
      await rpcOrThrow(db, "finish_instagram_sync_run", {
        p_run_id: lease.run_id,
        p_lock_token: lockToken,
        p_status: summary.status,
        p_discovered_count: summary.discovered,
        p_imported_count: summary.imported,
        p_skipped_count: summary.skipped,
        p_retry_count: summary.retrying,
        p_last_error: summary.status === "failed"
          ? criticalError ?? firstItemError
          : firstItemError ?? criticalError,
        p_initial_sync_completed: discoveryCompleted ? true : lease.initial_sync_completed,
        p_last_seen_media_id: watermark?.id ?? lease.last_seen_media_id,
        p_last_seen_media_timestamp: watermark?.timestamp ?? lease.last_seen_media_timestamp,
      });
    } catch {
      summary.status = "failed";
    }
  }
  return summary;
}
