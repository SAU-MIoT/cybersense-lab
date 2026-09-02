import { describe, expect, it } from "vitest";
import {
  extractPhotoImages,
  safeError,
  selectInitialMedia,
  skipReason,
  storagePath,
  validateGeminiTitle,
  validateImage,
} from "../core.ts";
import type { InstagramMedia } from "../types.ts";

const image = (id: string, caption = `caption ${id}`): InstagramMedia => ({
  id,
  caption,
  media_type: "IMAGE",
  media_url: `https://cdn.example/${id}`,
  timestamp: `2026-09-01T00:00:0${id}Z`,
});

describe("Instagram media rules", () => {
  it("keeps carousel photos in order and drops videos", () => {
    const media: InstagramMedia = {
      id: "99",
      caption: "Açıklama",
      media_type: "CAROUSEL_ALBUM",
      timestamp: "2026-09-01T00:00:00Z",
      children: { data: [
        { id: "a", media_type: "IMAGE", media_url: "https://cdn/a" },
        { id: "b", media_type: "VIDEO", media_url: "https://cdn/b" },
        { id: "c", media_type: "IMAGE", media_url: "https://cdn/c" },
      ] },
    };
    expect(extractPhotoImages(media).map(({ id }) => id)).toEqual(["a", "c"]);
    expect(skipReason(media)).toBeNull();
  });

  it("permanently rejects videos, empty captions and photo-less carousels", () => {
    expect(skipReason({ ...image("1"), media_type: "VIDEO" })).toBe("unsupported_video");
    expect(skipReason(image("2", "  "))).toBe("empty_caption");
    expect(skipReason({ ...image("3"), media_type: "CAROUSEL_ALBUM", children: { data: [] } }))
      .toBe("no_supported_images");
  });

  it("takes only the newest four eligible posts on first sync", () => {
    const media = [
      { ...image("1"), media_type: "VIDEO" },
      image("2"),
      image("3", ""),
      image("4"),
      image("5"),
      image("6"),
      image("7"),
    ];
    const selected = selectInitialMedia(media);
    expect(selected.processable.map(({ id }) => id)).toEqual(["2", "4", "5", "6"]);
    expect(selected.skipped.map(({ media: { id } }) => id)).toEqual(["1", "3"]);
    expect(selected.newest?.id).toBe("1");
  });
});

describe("output validation", () => {
  it("validates title JSON, length, hashtags and emoji", () => {
    expect(validateGeminiTitle({ title: "  Güvenli başlık  " })).toBe("Güvenli başlık");
    expect(() => validateGeminiTitle({ title: "#etiket" })).toThrow("hashtag");
    expect(() => validateGeminiTitle({ title: "Başlık 🚀" })).toThrow("emoji");
    expect(() => validateGeminiTitle({ title: "x".repeat(121) })).toThrow("length");
  });

  it("requires HTTP MIME to match the image magic bytes", () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 1]).buffer;
    expect(validateImage("image/jpeg; charset=binary", jpeg)).toEqual({ mime: "image/jpeg", extension: "jpg" });
    expect(() => validateImage("image/png", jpeg)).toThrow("mismatch");
    expect(() => validateImage("image/gif", jpeg)).toThrow("unsupported");
  });

  it("creates stable safe storage paths", () => {
    expect(storagePath("media/12", "image 1", "webp")).toBe("instagram/media_12/image_1.webp");
  });

  it("redacts URLs and credential-like values from errors", () => {
    const safe = safeError(new Error("token=abc https://host/path?access_token=xyz\nfailed"));
    expect(safe).not.toContain("abc");
    expect(safe).not.toContain("host");
    expect(safe).not.toContain("xyz");
  });
});
