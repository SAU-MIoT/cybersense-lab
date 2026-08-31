import type { AdminTableDef } from '@/types';

export interface AdminRecordRow {
  id?: string;
  key?: string;
  images?: { image_url: string }[];
  [key: string]: unknown;
}

export interface AdminImageRow {
  entity_id: string;
  image_url: string;
}

export type AdminRpc = (
  name: string,
  args: Record<string, unknown>,
) => PromiseLike<{ data: unknown; error: unknown }>;

export const IMAGE_TABLES = new Set(['announcements', 'projects', 'etkinlikler']);

const PUBLIC_QUERY_KEYS: Record<string, string[][]> = {
  announcements: [['announcements']],
  projects: [['projects'], ['publicCounts']],
  etkinlikler: [['events']],
  ekip: [['team'], ['publicCounts']],
  yayinlar: [['publications'], ['publicCounts']],
  arastirma_alanlari: [['researchAreas']],
  oduller: [['awards']],
  ortaklar: [['partners'], ['publicCounts']],
  site_ayarlari: [['siteSettings']],
};

export function publicQueryKeysFor(table: string): string[][] {
  return PUBLIC_QUERY_KEYS[table] || [];
}

export function attachRecordImages(records: AdminRecordRow[], images: AdminImageRow[]): AdminRecordRow[] {
  const imagesByRecord = new Map<string, Array<{ image_url: string }>>();
  images.forEach(image => {
    const key = String(image.entity_id);
    const current = imagesByRecord.get(key) || [];
    current.push({ image_url: image.image_url });
    imagesByRecord.set(key, current);
  });

  return records.map(record => ({
    ...record,
    images: record.id ? imagesByRecord.get(String(record.id)) || [] : [],
  }));
}

export function toLocalDateTimeValue(value: unknown): string {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoDateTime(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new Error('Geçerli bir tarih ve saat girin.');
  return date.toISOString();
}

export async function saveAdminRecord({ table, tableDef, editing, formData, rpc }: {
  table: string;
  tableDef: AdminTableDef;
  editing: AdminRecordRow | null;
  formData: Record<string, unknown>;
  rpc: AdminRpc;
}): Promise<AdminRecordRow> {
  const data: Record<string, unknown> = {};
  tableDef.fields.forEach(field => {
    if (field.virtual || (editing && field.createOnly)) return;
    const value = formData[field.name];
    if (field.type === 'number') data[field.name] = value === '' ? null : Number(value);
    else if (field.type === 'checkbox') data[field.name] = Boolean(value);
    else if (field.type === 'datetime-local') data[field.name] = toIsoDateTime(value);
    else data[field.name] = value === '' ? null : value;
  });

  let savedRecord: AdminRecordRow;
  if (editing) {
    const id = table === 'site_ayarlari' ? editing.key : editing.id;
    if (!id) throw new Error('Güncellenecek kayıt kimliği bulunamadı.');
    const { data: updated, error } = await rpc('admin_update_record', {
      p_table: table,
      p_id: id,
      p_data: data,
    });
    if (error) throw error;
    savedRecord = updated as AdminRecordRow;
  } else {
    const { data: created, error } = await rpc('admin_create_record', {
      p_table: table,
      p_data: data,
    });
    if (error) throw error;
    savedRecord = created as AdminRecordRow;
  }

  const imageField = tableDef.fields.find(field => field.virtual);
  if (imageField && IMAGE_TABLES.has(table)) {
    if (!savedRecord?.id) throw new Error('Görseller için kayıt kimliği alınamadı.');
    const imageUrls = String(formData[imageField.name] || '')
      .split('\n')
      .map(url => url.trim())
      .filter(Boolean);
    const { error } = await rpc('admin_set_record_images', {
      p_entity_type: table,
      p_entity_id: savedRecord.id,
      p_images: imageUrls.map((imageUrl, index) => ({
        image_url: imageUrl,
        alt_text: '',
        sort_order: index,
        is_published: true,
      })),
    });
    if (error) throw error;
  }

  return savedRecord;
}
