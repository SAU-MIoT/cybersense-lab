import { describe, expect, it, vi } from 'vitest';
import { getTableMeta } from '@/components/admin/adminTables';
import {
  attachRecordImages,
  publicQueryKeysFor,
  saveAdminRecord,
  toLocalDateTimeValue,
  type AdminRpc,
} from './adminRecords';

describe('admin record helpers', () => {
  it('attaches existing images to their records and supplies an empty list otherwise', () => {
    expect(attachRecordImages(
      [{ id: 'record-1' }, { id: 'record-2' }],
      [{ entity_id: 'record-1', image_url: 'https://img/one.webp' }],
    )).toEqual([
      { id: 'record-1', images: [{ image_url: 'https://img/one.webp' }] },
      { id: 'record-2', images: [] },
    ]);
  });

  it('uses the UUID returned by create RPC when saving images', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: { id: 'created-uuid' }, error: null })
      .mockResolvedValueOnce({ data: null, error: null }) as unknown as AdminRpc;

    await saveAdminRecord({
      table: 'announcements',
      tableDef: getTableMeta('announcements'),
      editing: null,
      formData: {
        title: 'News',
        content: 'Body',
        publish_date: '2026-08-27T12:30',
        is_published: true,
        _images: 'https://img/one.webp\n https://img/two.webp ',
      },
      rpc,
    });

    expect(rpc).toHaveBeenNthCalledWith(1, 'admin_create_record', expect.objectContaining({
      p_table: 'announcements',
    }));
    expect(rpc).toHaveBeenNthCalledWith(2, 'admin_set_record_images', {
      p_entity_type: 'announcements',
      p_entity_id: 'created-uuid',
      p_images: [
        { image_url: 'https://img/one.webp', alt_text: '', sort_order: 0, is_published: true },
        { image_url: 'https://img/two.webp', alt_text: '', sort_order: 1, is_published: true },
      ],
    });
  });

  it('always sends an empty image array on update so all existing images can be deleted', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: { id: 'existing-uuid' }, error: null })
      .mockResolvedValueOnce({ data: null, error: null }) as unknown as AdminRpc;

    await saveAdminRecord({
      table: 'announcements',
      tableDef: getTableMeta('announcements'),
      editing: { id: 'existing-uuid' },
      formData: { title: 'Updated', content: 'Body', publish_date: '', is_published: true, _images: '' },
      rpc,
    });

    expect(rpc).toHaveBeenNthCalledWith(2, 'admin_set_record_images', expect.objectContaining({
      p_entity_id: 'existing-uuid',
      p_images: [],
    }));
  });

  it('rejects an image RPC error and never invokes a direct-table fallback', async () => {
    const imageError = new Error('image RPC failed');
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: { id: 'created-uuid' }, error: null })
      .mockResolvedValueOnce({ data: null, error: imageError }) as unknown as AdminRpc;

    await expect(saveAdminRecord({
      table: 'announcements',
      tableDef: getTableMeta('announcements'),
      editing: null,
      formData: { title: 'News', content: 'Body', publish_date: '', is_published: true, _images: '' },
      rpc,
    })).rejects.toBe(imageError);
    expect(rpc).toHaveBeenCalledTimes(2);
  });

  it('returns all public query keys that must be invalidated after CRUD', () => {
    expect(publicQueryKeysFor('projects')).toEqual([['projects'], ['publicCounts']]);
    expect(publicQueryKeysFor('ekip')).toEqual([['team'], ['publicCounts']]);
    expect(publicQueryKeysFor('site_ayarlari')).toEqual([['siteSettings']]);
  });

  it('converts an ISO timestamp to a datetime-local value', () => {
    const value = toLocalDateTimeValue('2026-08-27T09:30:00.000Z');
    expect(value).toMatch(/^2026-08-27T\d{2}:30$/);
  });
});
