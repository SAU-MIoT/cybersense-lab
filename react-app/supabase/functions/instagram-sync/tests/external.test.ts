import { describe, expect, it, vi } from "vitest";
import { generateTitle, scanInstagram } from "../external.ts";

describe("Instagram pagination", () => {
  it("paginates until the existing watermark without returning it", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: [
          { id: "new2", caption: "two", media_type: "IMAGE", media_url: "https://cdn/2", timestamp: "2026-09-02T02:00:00Z" },
          { id: "new1", caption: "one", media_type: "IMAGE", media_url: "https://cdn/1", timestamp: "2026-09-02T01:00:00Z" },
        ],
        paging: { next: "https://graph.instagram.com/v26.0/u/media?after=x&access_token=leaked" },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: [
          { id: "old", caption: "old", media_type: "IMAGE", media_url: "https://cdn/0", timestamp: "2026-09-01T00:00:00Z" },
        ],
      }), { status: 200 }));

    const result = await scanInstagram("u", "v26.0", "server-token", {
      initial: false,
      lastSeenId: "old",
      lastSeenTimestamp: "2026-09-01T00:00:00Z",
    }, fetcher);
    expect(result.scanned.map(({ id }) => id)).toEqual(["new2", "new1"]);
    expect(result.newest?.id).toBe("new2");
    expect(String(fetcher.mock.calls[1][0])).toContain("access_token=server-token");
    expect(String(fetcher.mock.calls[1][0])).not.toContain("leaked");
  });

  it("stops initial pagination as soon as four suitable media are found", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [
      { id: "v", caption: "v", media_type: "VIDEO", timestamp: "2026-09-02T05:00:00Z" },
      ...["4", "3", "2", "1", "0"].map((id) => ({ id, caption: id, media_type: "IMAGE", media_url: `https://cdn/${id}`, timestamp: `2026-09-02T0${id}:00:00Z` })),
    ] }), { status: 200 }));
    const result = await scanInstagram("u", "v26.0", "token", {
      initial: true,
      lastSeenId: null,
      lastSeenTimestamp: null,
    }, fetcher);
    expect(result.scanned.map(({ id }) => id)).toEqual(["v", "4", "3", "2", "1"]);
  });

  it("rejects paging URLs outside the exact HTTPS Graph origin before adding a token", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: [{ id: "1", caption: "one", media_type: "IMAGE", media_url: "https://cdn/1", timestamp: "2026-09-02T00:00:00Z" }],
      paging: { next: "https://attacker.example/collect?after=x" },
    }), { status: 200 }));
    await expect(scanInstagram("u", "v26.0", "must-not-leak", {
      initial: false,
      lastSeenId: "old",
      lastSeenTimestamp: "2026-09-01T00:00:00Z",
    }, fetcher)).rejects.toThrow("instagram_invalid_paging_url");
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(String(fetcher.mock.calls[0][0])).not.toContain("attacker.example");
  });
});

describe("Gemini structured response", () => {
  it("requests JSON schema and validates the returned title", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify({ title: "Yeni laboratuvar duyurusu" }) }] } }],
    }), { status: 200 }));
    await expect(generateTitle("Tam açıklama", "model", "key", fetcher)).resolves
      .toBe("Yeni laboratuvar duyurusu");
    const init = fetcher.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body.generationConfig.responseMimeType).toBe("application/json");
    expect(body.generationConfig.responseJsonSchema.required).toEqual(["title"]);
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("key");
  });
});
