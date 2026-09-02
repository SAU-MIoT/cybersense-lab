import type { InstagramSyncStatus, InstagramSyncSummary } from '@/types';

export const INSTAGRAM_STATUS_RPC = 'admin_get_instagram_sync_status';
export const INSTAGRAM_SYNC_FUNCTION = 'instagram-sync';

interface RpcResult {
  data: unknown;
  error: unknown;
}

interface FunctionResult {
  data: unknown;
  error: unknown;
}

export interface InstagramSyncClient {
  rpc: (name: string) => PromiseLike<RpcResult>;
  functions: {
    invoke: (
      name: string,
      options: { headers: Record<string, string> },
    ) => PromiseLike<FunctionResult>;
  };
}

function objectValue(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) return objectValue(value[0]);
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function count(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function runStatus(value: unknown): InstagramSyncSummary['status'] {
  if (value === 'running' || value === 'partial' || value === 'failed' || value === 'already_running') {
    return value;
  }
  return 'success';
}

export function normalizeInstagramSyncSummary(value: unknown): InstagramSyncSummary {
  const row = objectValue(value);
  return {
    status: runStatus(row.status),
    discovered: count(row.discovered ?? row.discovered_count),
    imported: count(row.imported ?? row.imported_count),
    skipped: count(row.skipped ?? row.skipped_count),
    retrying: count(row.retrying ?? row.retry_count),
    trigger: row.trigger === 'cron' || row.trigger === 'manual' ? row.trigger : null,
    started_at: optionalString(row.started_at),
    finished_at: optionalString(row.finished_at),
    last_error: optionalString(row.last_error),
  };
}

export function normalizeInstagramSyncStatus(value: unknown): InstagramSyncStatus {
  const row = objectValue(value);
  const latestRunValue = row.latest_run ?? row.last_run;
  const hasFlatRun = row.status != null || row.run_status != null;
  const latestRun = latestRunValue != null
    ? normalizeInstagramSyncSummary(latestRunValue)
    : hasFlatRun
      ? normalizeInstagramSyncSummary({ ...row, status: row.run_status ?? row.status })
      : null;
  const expiresAt = optionalString(row.token_expires_at);
  const warningThreshold = Date.now() + (15 * 24 * 60 * 60 * 1000);
  const inferredRefreshWarning = Boolean(
    expiresAt && !Number.isNaN(Date.parse(expiresAt)) && Date.parse(expiresAt) <= warningThreshold,
  );

  return {
    configured: typeof row.configured === 'boolean'
      ? row.configured
      : typeof row.is_configured === 'boolean'
        ? row.is_configured
        : null,
    connected: typeof row.connected === 'boolean' ? row.connected : null,
    account_username: optionalString(row.account_username)?.replace(/^@/, '') || 'cybersenselab',
    initial_sync_completed: row.initial_sync_completed === true,
    last_seen_media_id: optionalString(row.last_seen_media_id),
    last_seen_media_timestamp: optionalString(row.last_seen_media_timestamp),
    last_success_at: optionalString(row.last_success_at),
    token_expires_at: expiresAt,
    token_refresh_required: row.token_refresh_required === true || inferredRefreshWarning,
    is_running: row.is_running === true,
    locked_until: optionalString(row.locked_until),
    latest_run: latestRun,
  };
}

export async function getInstagramSyncStatus(client: InstagramSyncClient): Promise<InstagramSyncStatus> {
  const { data, error } = await client.rpc(INSTAGRAM_STATUS_RPC);
  if (error) throw error;
  return normalizeInstagramSyncStatus(data);
}

export async function invokeInstagramSync(
  client: InstagramSyncClient,
  accessToken: string | undefined,
): Promise<InstagramSyncSummary> {
  if (!accessToken) throw new Error('Instagram eşitlemesi için geçerli bir admin oturumu gerekiyor.');

  const { data, error } = await client.functions.invoke(INSTAGRAM_SYNC_FUNCTION, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throw error;
  return normalizeInstagramSyncSummary(data);
}
