import { createClient } from "npm:@supabase/supabase-js@2";
import { authorizeRequest } from "./auth.ts";
import { runSync } from "./sync.ts";
import type { ServiceDatabase, SyncConfig } from "./types.ts";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "apikey, authorization, content-type, x-client-info, x-instagram-sync-secret",
};

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function readConfig(): SyncConfig {
  const required = (name: string): string => {
    const value = Deno.env.get(name)?.trim();
    if (!value) throw new Error(`missing_config_${name.toLowerCase()}`);
    return value;
  };
  return {
    instagramAccessToken: required("INSTAGRAM_ACCESS_TOKEN"),
    instagramUserId: required("INSTAGRAM_USER_ID"),
    instagramApiVersion: Deno.env.get("INSTAGRAM_GRAPH_API_VERSION")?.trim() || "v26.0",
    geminiApiKey: required("GEMINI_API_KEY"),
    geminiModel: Deno.env.get("GEMINI_MODEL")?.trim() || "gemini-3.5-flash-lite",
    syncSecret: required("INSTAGRAM_SYNC_SECRET"),
    supabaseUrl: required("SUPABASE_URL"),
    supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

function database(config: SyncConfig): ServiceDatabase {
  const client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return {
    rpc: async (name, args) => await client.rpc(name, args),
    getRetryRows: async (limit) => {
      const result = await client
        .from("instagram_imports")
        .select("external_media_id,media_type,permalink,media_timestamp")
        .in("status", ["pending", "retry"])
        .order("updated_at", { ascending: true })
        .limit(limit);
      return result as never;
    },
    isAdmin: async (userId) => {
      const result = await client
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
      return { data: Boolean(result.data), error: result.error };
    },
    getUser: async (jwt) => {
      const result = await client.auth.getUser(jwt);
      return { data: result.data.user ? { id: result.data.user.id } : null, error: result.error };
    },
    upload: async (bucket, path, body, options) =>
      await client.storage.from(bucket).upload(path, body, options),
    getPublicUrl: (bucket, path) => client.storage.from(bucket).getPublicUrl(path).data.publicUrl,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: jsonHeaders });
  if (request.method !== "POST") return response({ error: "method_not_allowed" }, 405);
  try {
    const config = readConfig();
    const db = database(config);
    const auth = await authorizeRequest(request, db, config.syncSecret);
    if (!auth.trigger) return response({ error: auth.status === 403 ? "forbidden" : "unauthorized" }, auth.status);
    return response(await runSync(auth.trigger, db, config));
  } catch {
    // Detailed failures are stored as sanitized run state; HTTP responses never echo upstream bodies or secrets.
    return response({
      status: "failed",
      discovered: 0,
      imported: 0,
      skipped: 0,
      retrying: 0,
    }, 500);
  }
});
