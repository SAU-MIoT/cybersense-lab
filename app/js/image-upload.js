/**
 * Client-side image preprocessing + Supabase Storage upload
 *
 * Pipeline:
 *   File (any format)
 *     → Canvas resize  (max 1200 × 900 px, preserves aspect ratio)
 *     → WebP encode    (quality 0.78 — good balance of size vs. sharpness)
 *     → Storage REST   POST /storage/v1/object/content-images/{path}
 *     → public URL
 *
 * Typical savings: 500 KB PNG → 60–130 KB WebP
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const BUCKET     = 'content-images';
const MAX_WIDTH  = 1200;
const MAX_HEIGHT = 900;
const QUALITY    = 0.78;

// ── Public API ────────────────────────────────────────────────────

/**
 * Compress a File/Blob and upload to Supabase Storage.
 * Returns the full public URL string.
 *
 * @param {File} file        – browser File object from <input type="file">
 * @param {string} adminToken – JWT access token from getAdminToken()
 * @returns {Promise<string>} – public URL
 */
export async function uploadImage(file, adminToken) {
  if (!adminToken) throw new Error('Yetki tokenı bulunamadı.');
  if (file.size > 30 * 1024 * 1024) throw new Error('Dosya 30 MB sınırını aşıyor.');

  const blob = await compressToWebp(file);
  return uploadBlob(blob, file.name, adminToken);
}

// ── Compression ───────────────────────────────────────────────────

/** Returns [w, h] scaled down so neither dimension exceeds max, preserving ratio. */
function scaleDims(w, h) {
  const scale = Math.min(1, MAX_WIDTH / w, MAX_HEIGHT / h);
  return [Math.round(w * scale), Math.round(h * scale)];
}

/**
 * Decode an image file with the browser's native Image,
 * draw onto a Canvas, then export as WebP Blob.
 */
function compressToWebp(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const [w, h] = scaleDims(img.naturalWidth || img.width, img.naturalHeight || img.height);
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled  = true;
      ctx.imageSmoothingQuality  = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('Canvas→Blob dönüşümü başarısız.'))),
        'image/webp',
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Görsel okunamadı. Desteklenen formatlar: JPEG, PNG, GIF, WebP, AVIF.'));
    };

    img.src = objectUrl;
  });
}

// ── Storage upload ────────────────────────────────────────────────

async function uploadBlob(blob, originalName, adminToken) {
  // Build a safe, unique storage path
  const base = (originalName || 'image')
    .replace(/\.[^.]+$/, '')           // drop original extension
    .replace(/[^a-zA-Z0-9_-]/g, '_')  // keep safe chars
    .slice(0, 60);
  const path      = `uploads/${Date.now()}-${base}.webp`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey:           SUPABASE_ANON_KEY,
      Authorization:   `Bearer ${adminToken}`,
      'Content-Type':  'image/webp',
      'x-upsert':      'false',
      'Cache-Control': '3600',
    },
    body: blob,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Depolama yükleme başarısız (${res.status}): ${txt}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}
