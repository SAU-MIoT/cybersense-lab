export type Trigger = "cron" | "manual";

export type InstagramMediaType = "IMAGE" | "CAROUSEL_ALBUM" | "VIDEO" | string;

export interface InstagramImage {
  id: string;
  media_type: InstagramMediaType;
  media_url?: string;
  thumbnail_url?: string;
}

export interface InstagramMedia extends InstagramImage {
  caption?: string;
  permalink?: string;
  timestamp: string;
  children?: { data?: InstagramImage[] };
}

export interface InstagramPage {
  data?: InstagramMedia[];
  paging?: { next?: string };
}

export interface SyncLease {
  acquired: boolean;
  run_id: string;
  initial_sync_completed: boolean;
  last_seen_media_id: string | null;
  last_seen_media_timestamp: string | null;
}

export interface SyncSummary {
  status: "success" | "partial" | "failed" | "already_running";
  discovered: number;
  imported: number;
  skipped: number;
  retrying: number;
}

export interface ImportImage {
  storage_path: string;
  public_url: string;
  sort_order: number;
}

export interface RetryRow {
  external_media_id: string;
  media_type: string;
  permalink: string | null;
  media_timestamp: string;
}

export interface DbResult<T = unknown> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

export interface ServiceDatabase {
  rpc<T = unknown>(name: string, args: Record<string, unknown>): Promise<DbResult<T>>;
  getRetryRows(limit: number): Promise<DbResult<RetryRow[]>>;
  isAdmin(userId: string): Promise<DbResult<boolean>>;
  getUser(jwt: string): Promise<DbResult<{ id: string }>>;
  upload(
    bucket: string,
    path: string,
    body: ArrayBuffer,
    options: { contentType: string; upsert: boolean },
  ): Promise<DbResult<unknown>>;
  getPublicUrl(bucket: string, path: string): string;
}

export interface SyncConfig {
  instagramAccessToken: string;
  instagramUserId: string;
  instagramApiVersion: string;
  geminiApiKey: string;
  geminiModel: string;
  syncSecret: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
}
