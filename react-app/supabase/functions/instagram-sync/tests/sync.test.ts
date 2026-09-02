import { describe, expect, it, vi } from "vitest";
import { runSync } from "../sync.ts";
import type { DbResult, ServiceDatabase, SyncConfig, SyncLease } from "../types.ts";

const config: SyncConfig = {
  instagramAccessToken: "instagram-secret",
  instagramUserId: "user",
  instagramApiVersion: "v26.0",
  geminiApiKey: "gemini-secret",
  geminiModel: "model",
  syncSecret: "cron-secret",
  supabaseUrl: "https://project.supabase.co",
  supabaseServiceRoleKey: "service-secret",
};

function fakeDb(leaseOverrides: Partial<SyncLease> = {}) {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const lease: SyncLease = {
    acquired: true,
    run_id: "run-id",
    initial_sync_completed: true,
    last_seen_media_id: "watermark",
    last_seen_media_timestamp: "2026-09-01T00:00:00Z",
    ...leaseOverrides,
  };
  const db: ServiceDatabase = {
    rpc: async <T>(name: string, args: Record<string, unknown>): Promise<DbResult<T>> => {
      calls.push({ name, args });
      const data = name === "claim_instagram_sync_run"
        ? lease
        : name === "import_instagram_announcement"
        ? { created: true, imported: true }
        : null;
      return { data: data as T | null, error: null };
    },
    getRetryRows: vi.fn().mockResolvedValue({ data: [], error: null }),
    isAdmin: vi.fn(),
    getUser: vi.fn(),
    upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
    getPublicUrl: (_bucket, path) => `https://storage.example/${path}`,
  };
  return { db, calls };
}

describe("sync orchestration", () => {
  it("returns already_running without contacting external APIs", async () => {
    const { db } = fakeDb({ acquired: false });
    const fetcher = vi.fn();
    await expect(runSync("cron", db, config, fetcher)).resolves.toEqual({
      status: "already_running", discovered: 0, imported: 0, skipped: 0, retrying: 0,
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("does not call Gemini or Storage when there is no new media", async () => {
    const { db, calls } = fakeDb();
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: [{ id: "watermark", caption: "old", media_type: "IMAGE", media_url: "https://cdn/old", timestamp: "2026-09-01T00:00:00Z" }],
    }), { status: 200 }));
    const result = await runSync("manual", db, config, fetcher);
    expect(result).toEqual({ status: "success", discovered: 0, imported: 0, skipped: 0, retrying: 0 });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(db.upload).not.toHaveBeenCalled();
    expect(calls.map(({ name }) => name)).toEqual(["claim_instagram_sync_run", "finish_instagram_sync_run"]);
  });

  it("handles retries before scanning new media", async () => {
    const { db, calls } = fakeDb();
    vi.mocked(db.getRetryRows).mockResolvedValue({ data: [{
      external_media_id: "retry-id",
      media_type: "IMAGE",
      permalink: "https://instagram/retry",
      media_timestamp: "2026-08-31T00:00:00Z",
    }], error: null });
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 1]);
    const eventOrder: string[] = [];
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/retry-id?")) {
        eventOrder.push("retry-fetch");
        return new Response(JSON.stringify({ id: "retry-id", caption: "retry caption", media_type: "IMAGE", media_url: "https://cdn/retry", permalink: "https://instagram/retry", timestamp: "2026-08-31T00:00:00Z" }), { status: 200 });
      }
      if (url.includes("generativelanguage")) {
        eventOrder.push("gemini");
        return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{\"title\":\"Başlık\"}" }] } }] }), { status: 200 });
      }
      if (url.includes("cdn/retry")) {
        eventOrder.push("image");
        return new Response(jpeg, { status: 200, headers: { "content-type": "image/jpeg" } });
      }
      eventOrder.push("scan");
      return new Response(JSON.stringify({ data: [{ id: "watermark", caption: "old", media_type: "IMAGE", media_url: "https://cdn/old", timestamp: "2026-09-01T00:00:00Z" }] }), { status: 200 });
    });
    const result = await runSync("cron", db, config, fetcher);
    expect(eventOrder).toEqual(["retry-fetch", "gemini", "image", "scan"]);
    expect(result.imported).toBe(1);
    expect(calls.some(({ name }) => name === "import_instagram_announcement")).toBe(true);
    const importCall = calls.find(({ name }) => name === "import_instagram_announcement")!;
    expect(importCall.args.p_content).toBe("retry caption");
    expect(importCall.args.p_images).toEqual([{
      storage_path: "instagram/retry-id/retry-id.jpg",
      public_url: "https://storage.example/instagram/retry-id/retry-id.jpg",
      sort_order: 0,
    }]);
  });

  it("records Gemini failure as retry without importing an announcement", async () => {
    const { db, calls } = fakeDb();
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("generativelanguage")) return new Response("quota", { status: 429 });
      return new Response(JSON.stringify({ data: [
        { id: "new", caption: "new caption", media_type: "IMAGE", media_url: "https://cdn/new", timestamp: "2026-09-02T00:00:00Z" },
        { id: "watermark", caption: "old", media_type: "IMAGE", media_url: "https://cdn/old", timestamp: "2026-09-01T00:00:00Z" },
      ] }), { status: 200 });
    });
    const result = await runSync("cron", db, config, fetcher);
    expect(result).toMatchObject({ status: "partial", discovered: 1, imported: 0, retrying: 1 });
    expect(calls.some(({ name }) => name === "import_instagram_announcement")).toBe(false);
    const retry = calls.find(({ name, args }) => name === "mark_instagram_import" && args.p_status === "retry");
    expect(retry?.args.p_last_error).toBe("gemini_http_429");
    const finish = calls.find(({ name }) => name === "finish_instagram_sync_run")!;
    expect(finish.args.p_last_seen_media_id).toBe("new");
    expect(finish.args.p_last_error).toBe("gemini_http_429");
  });

  it("initial sync imports only four eligible posts and watermarks the newest skipped item", async () => {
    const { db, calls } = fakeDb({
      initial_sync_completed: false,
      last_seen_media_id: null,
      last_seen_media_timestamp: null,
    });
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 1]);
    const feed = [
      { id: "newest-video", caption: "video", media_type: "VIDEO", timestamp: "2026-09-02T06:00:00Z" },
      ...["4", "3", "2", "1", "too-old"].map((id, index) => ({
        id,
        caption: `caption ${id}`,
        media_type: "IMAGE",
        media_url: `https://cdn/${id}`,
        timestamp: `2026-09-02T0${5 - index}:00:00Z`,
      })),
    ];
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("generativelanguage")) {
        return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{\"title\":\"Başlık\"}" }] } }] }), { status: 200 });
      }
      if (url.includes("cdn/")) return new Response(jpeg, { status: 200, headers: { "content-type": "image/jpeg" } });
      return new Response(JSON.stringify({ data: feed }), { status: 200 });
    });
    const result = await runSync("cron", db, config, fetcher);
    expect(result).toMatchObject({ status: "success", discovered: 5, imported: 4, skipped: 1 });
    const importedIds = calls
      .filter(({ name }) => name === "import_instagram_announcement")
      .map(({ args }) => args.p_external_media_id);
    expect(importedIds).toEqual(["4", "3", "2", "1"]);
    expect(importedIds).not.toContain("too-old");
    const stageIndex = calls.findIndex(({ name }) => name === "stage_initial_instagram_imports");
    const firstImportIndex = calls.findIndex(({ name }) => name === "import_instagram_announcement");
    expect(stageIndex).toBeGreaterThan(0);
    expect(stageIndex).toBeLessThan(firstImportIndex);
    const stage = calls[stageIndex];
    expect(stage.args).toMatchObject({
      p_last_seen_media_id: "newest-video",
      p_last_seen_media_timestamp: "2026-09-02T06:00:00Z",
    });
    expect(stage.args.p_items).toEqual(expect.arrayContaining([
      expect.objectContaining({ external_media_id: "4", status: "pending", last_error: null }),
      expect.objectContaining({ external_media_id: "newest-video", status: "skipped", last_error: "unsupported_video" }),
    ]));
    expect(calls.some(({ name, args }) => name === "mark_instagram_import" &&
      args.p_external_media_id === "newest-video")).toBe(false);
    const finish = calls.find(({ name }) => name === "finish_instagram_sync_run")!;
    expect(finish.args).toMatchObject({
      p_initial_sync_completed: true,
      p_last_seen_media_id: "newest-video",
      p_last_seen_media_timestamp: "2026-09-02T06:00:00Z",
    });
  });

  it("turns a transactional import RPC failure into retry after deterministic uploads", async () => {
    const { db, calls } = fakeDb();
    const originalRpc = db.rpc.bind(db);
    db.rpc = async <T>(name: string, args: Record<string, unknown>): Promise<DbResult<T>> => {
      if (name === "import_instagram_announcement") {
        calls.push({ name, args });
        return { data: null, error: { message: "internal database detail", code: "TX_FAILED" } };
      }
      return await originalRpc<T>(name, args);
    };
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 1]);
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("generativelanguage")) {
        return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{\"title\":\"Başlık\"}" }] } }] }), { status: 200 });
      }
      if (url.includes("cdn/new")) return new Response(jpeg, { status: 200, headers: { "content-type": "image/jpeg" } });
      return new Response(JSON.stringify({ data: [
        { id: "new", caption: "unchanged caption", media_type: "IMAGE", media_url: "https://cdn/new", timestamp: "2026-09-02T00:00:00Z" },
        { id: "watermark", caption: "old", media_type: "IMAGE", media_url: "https://cdn/old", timestamp: "2026-09-01T00:00:00Z" },
      ] }), { status: 200 });
    });
    const result = await runSync("cron", db, config, fetcher);
    expect(result).toMatchObject({ status: "partial", imported: 0, retrying: 1 });
    expect(db.upload).toHaveBeenCalledTimes(1);
    expect(calls.filter(({ name }) => name === "import_instagram_announcement")).toHaveLength(1);
    expect(calls.some(({ name, args }) => name === "mark_instagram_import" &&
      args.p_status === "retry" && args.p_last_error === "import_instagram_announcement_TX_FAILED")).toBe(true);
  });

  it("does not advance the watermark when a failed new item cannot be queued", async () => {
    const { db, calls } = fakeDb();
    const originalRpc = db.rpc.bind(db);
    db.rpc = async <T>(name: string, args: Record<string, unknown>): Promise<DbResult<T>> => {
      if (name === "mark_instagram_import" && args.p_status === "retry") {
        calls.push({ name, args });
        return { data: null, error: { message: "db down", code: "DB_DOWN" } };
      }
      return await originalRpc<T>(name, args);
    };
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes("generativelanguage")) return new Response("quota", { status: 429 });
      return new Response(JSON.stringify({ data: [
        { id: "new", caption: "caption", media_type: "IMAGE", media_url: "https://cdn/new", timestamp: "2026-09-02T00:00:00Z" },
        { id: "watermark", caption: "old", media_type: "IMAGE", media_url: "https://cdn/old", timestamp: "2026-09-01T00:00:00Z" },
      ] }), { status: 200 });
    });
    const result = await runSync("cron", db, config, fetcher);
    expect(result.status).toBe("failed");
    const finish = calls.find(({ name }) => name === "finish_instagram_sync_run")!;
    expect(finish.args.p_last_seen_media_id).toBe("watermark");
    expect(finish.args.p_status).toBe("failed");
    expect(finish.args.p_last_error).toBe("instagram_import_state_persistence_failed");
  });

  it("recovers a staged initial cohort without rediscovering Instagram media", async () => {
    const { db, calls } = fakeDb({
      initial_sync_completed: false,
      last_seen_media_id: "staged-watermark",
      last_seen_media_timestamp: "2026-09-02T06:00:00Z",
    });
    vi.mocked(db.getRetryRows).mockResolvedValue({ data: [{
      external_media_id: "staged-image",
      media_type: "IMAGE",
      permalink: "https://instagram/staged",
      media_timestamp: "2026-09-02T05:00:00Z",
    }], error: null });
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 1]);
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/user/media")) throw new Error("discovery_must_not_run");
      if (url.includes("/staged-image?")) return new Response(JSON.stringify({
        id: "staged-image",
        caption: "staged caption",
        media_type: "IMAGE",
        media_url: "https://cdn/staged",
        timestamp: "2026-09-02T05:00:00Z",
      }), { status: 200 });
      if (url.includes("generativelanguage")) return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: "{\"title\":\"Başlık\"}" }] } }],
      }), { status: 200 });
      if (url.includes("cdn/staged")) return new Response(jpeg, { status: 200, headers: { "content-type": "image/jpeg" } });
      throw new Error(`unexpected_fetch_${url}`);
    });
    const result = await runSync("cron", db, config, fetcher);
    expect(result).toMatchObject({ status: "success", discovered: 0, imported: 1, retrying: 0 });
    expect(fetcher.mock.calls.some(([input]) => String(input).includes("/user/media"))).toBe(false);
    expect(calls.some(({ name }) => name === "stage_initial_instagram_imports")).toBe(false);
    const finish = calls.find(({ name }) => name === "finish_instagram_sync_run")!;
    expect(finish.args).toMatchObject({
      p_status: "success",
      p_initial_sync_completed: true,
      p_last_seen_media_id: "staged-watermark",
      p_last_seen_media_timestamp: "2026-09-02T06:00:00Z",
    });
  });

  it("fails before Gemini or Storage when initial staging fails", async () => {
    const { db, calls } = fakeDb({
      initial_sync_completed: false,
      last_seen_media_id: null,
      last_seen_media_timestamp: null,
    });
    const originalRpc = db.rpc.bind(db);
    db.rpc = async <T>(name: string, args: Record<string, unknown>): Promise<DbResult<T>> => {
      if (name === "stage_initial_instagram_imports") {
        calls.push({ name, args });
        return { data: null, error: { message: "stage failed", code: "STAGE_FAILED" } };
      }
      return await originalRpc<T>(name, args);
    };
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [
      { id: "new", caption: "caption", media_type: "IMAGE", media_url: "https://cdn/new", timestamp: "2026-09-02T00:00:00Z" },
    ] }), { status: 200 }));
    const result = await runSync("cron", db, config, fetcher);
    expect(result.status).toBe("failed");
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(db.upload).not.toHaveBeenCalled();
    expect(calls.some(({ name }) => name === "import_instagram_announcement")).toBe(false);
    const finish = calls.find(({ name }) => name === "finish_instagram_sync_run")!;
    expect(finish.args).toMatchObject({
      p_status: "failed",
      p_initial_sync_completed: false,
      p_last_seen_media_id: null,
      p_last_seen_media_timestamp: null,
      p_last_error: "stage_initial_instagram_imports_STAGE_FAILED",
    });
  });

  it("recovers pending rows and records fetch failures using stored metadata", async () => {
    const { db, calls } = fakeDb();
    vi.mocked(db.getRetryRows).mockResolvedValue({ data: [{
      external_media_id: "pending-id",
      media_type: "IMAGE",
      permalink: "https://instagram/pending",
      media_timestamp: "2026-08-30T00:00:00Z",
    }], error: null });
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes("/pending-id?")) return new Response("gone", { status: 503 });
      return new Response(JSON.stringify({ data: [
        { id: "watermark", caption: "old", media_type: "IMAGE", media_url: "https://cdn/old", timestamp: "2026-09-01T00:00:00Z" },
      ] }), { status: 200 });
    });
    const result = await runSync("cron", db, config, fetcher);
    expect(result).toMatchObject({ status: "partial", imported: 0, retrying: 1 });
    const marks = calls.filter(({ name }) => name === "mark_instagram_import");
    expect(marks.map(({ args }) => args.p_status)).toEqual(["pending", "retry"]);
    expect(marks[1].args).toMatchObject({
      p_external_media_id: "pending-id",
      p_media_type: "IMAGE",
      p_permalink: "https://instagram/pending",
      p_media_timestamp: "2026-08-30T00:00:00Z",
      p_last_error: "instagram_http_503",
    });
  });

  it("excludes a retried ID from discovery and counts only newly-created announcements", async () => {
    const { db, calls } = fakeDb();
    vi.mocked(db.getRetryRows).mockResolvedValue({ data: [{
      external_media_id: "same-id",
      media_type: "IMAGE",
      permalink: null,
      media_timestamp: "2026-09-02T00:00:00Z",
    }], error: null });
    const originalRpc = db.rpc.bind(db);
    db.rpc = async <T>(name: string, args: Record<string, unknown>): Promise<DbResult<T>> => {
      if (name === "import_instagram_announcement") {
        calls.push({ name, args });
        return { data: { created: false, imported: true } as T, error: null };
      }
      return await originalRpc<T>(name, args);
    };
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 1]);
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/same-id?")) return new Response(JSON.stringify({
        id: "same-id", caption: "same", media_type: "IMAGE", media_url: "https://cdn/same", timestamp: "2026-09-02T00:00:00Z",
      }), { status: 200 });
      if (url.includes("generativelanguage")) return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: "{\"title\":\"Başlık\"}" }] } }],
      }), { status: 200 });
      if (url.includes("cdn/same")) return new Response(jpeg, { status: 200, headers: { "content-type": "image/jpeg" } });
      return new Response(JSON.stringify({ data: [
        { id: "same-id", caption: "same", media_type: "IMAGE", media_url: "https://cdn/same", timestamp: "2026-09-02T00:00:00Z" },
        { id: "watermark", caption: "old", media_type: "IMAGE", media_url: "https://cdn/old", timestamp: "2026-09-01T00:00:00Z" },
      ] }), { status: 200 });
    });
    const result = await runSync("cron", db, config, fetcher);
    expect(result).toMatchObject({ status: "success", discovered: 0, imported: 0, retrying: 0 });
    expect(calls.filter(({ name }) => name === "import_instagram_announcement")).toHaveLength(1);
    expect(fetcher.mock.calls.filter(([input]) => String(input).includes("generativelanguage"))).toHaveLength(1);
  });
});
