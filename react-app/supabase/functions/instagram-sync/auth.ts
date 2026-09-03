import { constantTimeEqual } from "./core.ts";
import type { ServiceDatabase, Trigger } from "./types.ts";

export async function authorizeRequest(
  request: Request,
  db: ServiceDatabase,
  syncSecret: string,
): Promise<{ trigger?: Trigger; status?: 401 | 403 }> {
  const cronSecret = request.headers.get("x-instagram-sync-secret") ?? "";
  if (cronSecret && constantTimeEqual(cronSecret, syncSecret)) return { trigger: "cron" };

  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return { status: 401 };
  const jwt = match[1];
  // pg_net callers may use Authorization when a custom header is inconvenient.
  if (constantTimeEqual(jwt, syncSecret)) return { trigger: "cron" };
  const user = await db.getUser(jwt);
  if (user.error || !user.data) return { status: 401 };
  const admin = await db.isAdmin(user.data.id);
  if (admin.error || !admin.data) return { status: 403 };
  return { trigger: "manual" };
}
