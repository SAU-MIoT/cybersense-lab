import { describe, expect, it, vi } from "vitest";
import { authorizeRequest } from "../auth.ts";
import type { ServiceDatabase } from "../types.ts";

function authDb(user: { id: string } | null, admin: boolean): ServiceDatabase {
  return {
    rpc: vi.fn(),
    getRetryRows: vi.fn(),
    getUser: vi.fn().mockResolvedValue({ data: user, error: null }),
    isAdmin: vi.fn().mockResolvedValue({ data: admin, error: null }),
    upload: vi.fn(),
    getPublicUrl: vi.fn(),
  };
}

describe("request authorization", () => {
  it("accepts the cron secret without calling auth", async () => {
    const db = authDb(null, false);
    const request = new Request("https://edge.test", { headers: { "x-instagram-sync-secret": "cron-secret" } });
    await expect(authorizeRequest(request, db, "cron-secret")).resolves.toEqual({ trigger: "cron" });
    expect(db.getUser).not.toHaveBeenCalled();
  });

  it("accepts only JWTs whose user is in admin_users", async () => {
    const adminDb = authDb({ id: "admin-id" }, true);
    await expect(authorizeRequest(new Request("https://edge.test", {
      headers: { authorization: "Bearer user-jwt" },
    }), adminDb, "cron-secret")).resolves.toEqual({ trigger: "manual" });
    expect(adminDb.isAdmin).toHaveBeenCalledWith("admin-id");

    await expect(authorizeRequest(new Request("https://edge.test", {
      headers: { authorization: "Bearer non-admin-jwt" },
    }), authDb({ id: "user-id" }, false), "cron-secret")).resolves.toEqual({ status: 403 });
  });

  it("rejects missing and invalid JWTs", async () => {
    await expect(authorizeRequest(new Request("https://edge.test"), authDb(null, false), "secret"))
      .resolves.toEqual({ status: 401 });
    await expect(authorizeRequest(new Request("https://edge.test", {
      headers: { authorization: "Bearer invalid" },
    }), authDb(null, false), "secret")).resolves.toEqual({ status: 401 });
  });
});
