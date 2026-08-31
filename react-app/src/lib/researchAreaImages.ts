import { supabase } from '@/lib/supabase';

export const RESEARCH_IMAGE_BUCKET = 'research-area-images';
export const RESEARCH_IMAGE_PREFIX = 'research-areas';
export const TEAM_IMAGE_BUCKET = 'team-member-images';
export const TEAM_IMAGE_PREFIX = 'team-members';
export const PROJECT_IMAGE_BUCKET = 'project-images';
export const PROJECT_IMAGE_PREFIX = 'projects';
export const MAX_RESEARCH_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

const NORMALIZED_IMAGE_MAX_EDGE = 256;

export function validateResearchAreaImage(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Yalnızca JPG, PNG, WebP veya GIF görselleri yükleyebilirsiniz.');
  }
  if (file.size > MAX_RESEARCH_IMAGE_BYTES) {
    throw new Error('Görsel boyutu en fazla 5 MB olabilir.');
  }
}

function storageImagePathFromUrl(imageUrl: string, bucket: string, prefix: string): string | null {
  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return null;

    const path = decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
    return path.startsWith(`${prefix}/`) ? path : null;
  } catch {
    return null;
  }
}

export function researchImagePathFromUrl(imageUrl: string): string | null {
  return storageImagePathFromUrl(imageUrl, RESEARCH_IMAGE_BUCKET, RESEARCH_IMAGE_PREFIX);
}

export function teamMemberImagePathFromUrl(imageUrl: string): string | null {
  return storageImagePathFromUrl(imageUrl, TEAM_IMAGE_BUCKET, TEAM_IMAGE_PREFIX);
}

export function projectImagePathFromUrl(imageUrl: string): string | null {
  return storageImagePathFromUrl(imageUrl, PROJECT_IMAGE_BUCKET, PROJECT_IMAGE_PREFIX);
}

async function normalizeStorageImage(file: File, maxEdge: number): Promise<File> {
  // Animated GIFs must stay untouched. The other formats are reduced before
  // upload so Chromium does not have to rasterize very large transparent icons
  // directly into the small card slot (which can produce one-pixel artefacts).
  if (file.type === 'image/gif' || typeof createImageBitmap !== 'function') return file;

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.type === 'image/png') return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) return file;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'research-icon';
    return new File([blob], `${baseName}.png`, { type: 'image/png', lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}

async function uploadStorageImage(
  file: File,
  userId: string,
  bucket: string,
  prefix: string,
  maxEdge: number,
): Promise<{ path: string; publicUrl: string }> {
  validateResearchAreaImage(file);
  const normalizedFile = await normalizeStorageImage(file, maxEdge);
  const extension = ALLOWED_IMAGE_TYPES.get(normalizedFile.type)!;
  const path = `${prefix}/${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, normalizedFile, {
      cacheControl: '3600',
      contentType: normalizedFile.type,
      upsert: false,
    });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export function uploadResearchAreaImage(file: File, userId: string): Promise<{ path: string; publicUrl: string }> {
  return uploadStorageImage(file, userId, RESEARCH_IMAGE_BUCKET, RESEARCH_IMAGE_PREFIX, NORMALIZED_IMAGE_MAX_EDGE);
}

export function uploadTeamMemberImage(file: File, userId: string): Promise<{ path: string; publicUrl: string }> {
  return uploadStorageImage(file, userId, TEAM_IMAGE_BUCKET, TEAM_IMAGE_PREFIX, NORMALIZED_IMAGE_MAX_EDGE);
}

export function uploadProjectImage(file: File, userId: string): Promise<{ path: string; publicUrl: string }> {
  return uploadStorageImage(file, userId, PROJECT_IMAGE_BUCKET, PROJECT_IMAGE_PREFIX, 1600);
}

export async function removeResearchAreaImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(RESEARCH_IMAGE_BUCKET).remove([path]);
  if (error) throw error;
}

export async function removeTeamMemberImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(TEAM_IMAGE_BUCKET).remove([path]);
  if (error) throw error;
}

export async function removeProjectImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(PROJECT_IMAGE_BUCKET).remove([path]);
  if (error) throw error;
}
