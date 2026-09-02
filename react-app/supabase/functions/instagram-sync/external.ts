import { INSTAGRAM_FIELDS, validateGeminiTitle, validateImage } from "./core.ts";
import type { InstagramMedia, InstagramPage } from "./types.ts";

function graphUrl(apiVersion: string, path: string, token: string): URL {
  const url = new URL(`https://graph.instagram.com/${apiVersion}/${path}`);
  url.searchParams.set("access_token", token);
  return url;
}

async function graphJson<T>(url: URL, fetcher: typeof fetch): Promise<T> {
  const response = await fetcher(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`instagram_http_${response.status}`);
  return await response.json() as T;
}

export async function fetchInstagramMedia(
  mediaId: string,
  apiVersion: string,
  token: string,
  fetcher: typeof fetch = fetch,
): Promise<InstagramMedia> {
  const url = graphUrl(apiVersion, mediaId, token);
  url.searchParams.set("fields", INSTAGRAM_FIELDS);
  return await graphJson<InstagramMedia>(url, fetcher);
}

export interface ScanOptions {
  initial: boolean;
  lastSeenId: string | null;
  lastSeenTimestamp: string | null;
  initialLimit?: number;
  maxPages?: number;
}

export async function scanInstagram(
  userId: string,
  apiVersion: string,
  token: string,
  options: ScanOptions,
  fetcher: typeof fetch = fetch,
): Promise<{ scanned: InstagramMedia[]; newest: InstagramMedia | null }> {
  let next: URL | null = graphUrl(apiVersion, `${userId}/media`, token);
  next.searchParams.set("fields", INSTAGRAM_FIELDS);
  next.searchParams.set("limit", "25");
  const scanned: InstagramMedia[] = [];
  let suitable = 0;
  let newest: InstagramMedia | null = null;
  const maxPages = options.maxPages ?? 100;

  for (let pageNumber = 0; next && pageNumber < maxPages; pageNumber += 1) {
    const page: InstagramPage = await graphJson<InstagramPage>(next, fetcher);
    for (const item of page.data ?? []) {
      if (!newest) newest = item;
      if (!options.initial) {
        if (item.id === options.lastSeenId) return { scanned, newest };
        if (
          options.lastSeenTimestamp && Date.parse(item.timestamp) < Date.parse(options.lastSeenTimestamp)
        ) return { scanned, newest };
      }
      scanned.push(item);
      if (item.caption?.trim() && (item.media_type === "IMAGE" || item.media_type === "CAROUSEL_ALBUM")) {
        const hasPhoto = item.media_type === "IMAGE"
          ? Boolean(item.media_url)
          : (item.children?.data ?? []).some((child) => child.media_type === "IMAGE" && child.media_url);
        if (hasPhoto) suitable += 1;
      }
      if (options.initial && suitable >= (options.initialLimit ?? 4)) return { scanned, newest };
    }
    if (!page.paging?.next) return { scanned, newest };
    const candidate = new URL(page.paging.next);
    if (candidate.origin !== "https://graph.instagram.com") {
      throw new Error("instagram_invalid_paging_url");
    }
    // Meta normally includes the token in paging.next. Always replace it with the server secret.
    candidate.searchParams.set("access_token", token);
    next = candidate;
  }
  if (next) throw new Error("instagram_pagination_limit");
  return { scanned, newest };
}

export async function generateTitle(
  caption: string,
  model: string,
  apiKey: string,
  fetcher: typeof fetch = fetch,
): Promise<string> {
  const response = await fetcher(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{
            text: "Bu herkese açık Instagram açıklamasından Türkçe, olgusal, emojisiz ve hashtagsiz en fazla 120 karakterlik bir duyuru başlığı üret. Açıklamada bulunmayan kişi, kurum, tarih veya iddia ekleme.\n\nAçıklama:\n" + caption,
          }],
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: "object",
            properties: { title: { type: "string", maxLength: 120 } },
            required: ["title"],
            additionalProperties: false,
          },
        },
      }),
    },
  );
  if (!response.ok) throw new Error(`gemini_http_${response.status}`);
  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("gemini_empty_response");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("gemini_invalid_json");
  }
  return validateGeminiTitle(parsed);
}

export async function downloadImage(
  url: string,
  fetcher: typeof fetch = fetch,
): Promise<{ body: ArrayBuffer; mime: string; extension: string }> {
  const response = await fetcher(url, { redirect: "follow", headers: { Accept: "image/jpeg,image/png,image/webp" } });
  if (!response.ok) throw new Error(`image_http_${response.status}`);
  const body = await response.arrayBuffer();
  return { body, ...validateImage(response.headers.get("content-type"), body) };
}
