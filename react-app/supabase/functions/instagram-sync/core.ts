import type { InstagramImage, InstagramMedia } from "./types.ts";

export const INSTAGRAM_FIELDS =
  "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,children{id,media_type,media_url,thumbnail_url}";

export function constantTimeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  const length = Math.max(a.length, b.length);
  let mismatch = a.length ^ b.length;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return mismatch === 0;
}

export function extractPhotoImages(media: InstagramMedia): InstagramImage[] {
  if (media.media_type === "IMAGE" && media.media_url) {
    return [{ id: media.id, media_type: media.media_type, media_url: media.media_url }];
  }
  if (media.media_type !== "CAROUSEL_ALBUM") return [];
  return (media.children?.data ?? []).filter(
    (child) => child.media_type === "IMAGE" && Boolean(child.media_url),
  );
}

export function skipReason(media: InstagramMedia): string | null {
  if (!media.caption?.trim()) return "empty_caption";
  if (media.media_type === "VIDEO") return "unsupported_video";
  if (extractPhotoImages(media).length === 0) return "no_supported_images";
  return null;
}

export interface DiscoveryResult {
  processable: InstagramMedia[];
  skipped: Array<{ media: InstagramMedia; reason: string }>;
  newest: InstagramMedia | null;
}

/** Selects the media examined during an initial sync, stopping after four usable posts. */
export function selectInitialMedia(media: InstagramMedia[], limit = 4): DiscoveryResult {
  const processable: InstagramMedia[] = [];
  const skipped: Array<{ media: InstagramMedia; reason: string }> = [];
  for (const item of media) {
    const reason = skipReason(item);
    if (reason) skipped.push({ media: item, reason });
    else processable.push(item);
    if (processable.length === limit) break;
  }
  return { processable, skipped, newest: media[0] ?? null };
}

export function validateGeminiTitle(value: unknown): string {
  if (!value || typeof value !== "object" || !("title" in value)) {
    throw new Error("gemini_invalid_json");
  }
  const title = (value as { title: unknown }).title;
  if (typeof title !== "string") throw new Error("gemini_invalid_title");
  const normalized = title.trim();
  if (!normalized || normalized.length > 120) throw new Error("gemini_invalid_title_length");
  if (normalized.includes("#")) throw new Error("gemini_title_contains_hashtag");
  if (/\p{Extended_Pictographic}/u.test(normalized)) throw new Error("gemini_title_contains_emoji");
  return normalized;
}

const CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function detectedMime(bytes: Uint8Array): keyof typeof CONTENT_TYPES | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
    bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return "image/png";
  if (
    bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
  ) return "image/webp";
  return null;
}

export function validateImage(contentType: string | null, body: ArrayBuffer): {
  mime: string;
  extension: string;
} {
  const mime = (contentType ?? "").split(";", 1)[0].trim().toLowerCase();
  if (!(mime in CONTENT_TYPES)) throw new Error("image_unsupported_mime");
  if (body.byteLength === 0 || body.byteLength > 15 * 1024 * 1024) throw new Error("image_invalid_size");
  const sniffed = detectedMime(new Uint8Array(body));
  if (sniffed !== mime) throw new Error("image_mime_mismatch");
  return { mime, extension: CONTENT_TYPES[mime] };
}

export function storagePath(mediaId: string, imageId: string, extension: string): string {
  const safe = (value: string) => value.replace(/[^A-Za-z0-9_-]/g, "_");
  return `instagram/${safe(mediaId)}/${safe(imageId)}.${extension}`;
}

export function safeError(error: unknown): string {
  const raw = error instanceof Error ? error.message : "unexpected_error";
  const withoutUrls = raw.replace(/https?:\/\/\S+/gi, "[url]");
  const withoutAuth = withoutUrls.replace(/(bearer|token|secret|api[_-]?key)\s*[:=]?\s*\S+/gi, "$1=[redacted]");
  return withoutAuth.replace(/[\r\n]+/g, " ").slice(0, 300) || "unexpected_error";
}
