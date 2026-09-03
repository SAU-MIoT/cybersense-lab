import { describe, expect, it, vi } from 'vitest';
import {
  getInstagramSyncStatus,
  invokeInstagramSync,
  normalizeInstagramSyncStatus,
  normalizeInstagramSyncSummary,
  type InstagramSyncClient,
} from './instagramSync';

describe('Instagram sync helpers', () => {
  it('normalizes the admin-safe database status RPC shape', () => {
    const status = normalizeInstagramSyncStatus({
      initial_sync_completed: true,
      last_seen_media_id: 'media-4',
      last_seen_media_timestamp: '2026-09-02T09:00:00Z',
      last_success_at: '2026-09-02T09:01:00Z',
      token_expires_at: '2099-01-01T00:00:00Z',
      is_running: false,
      locked_until: null,
      last_run: {
        trigger: 'cron',
        status: 'partial',
        discovered_count: 6,
        imported_count: 4,
        skipped_count: 1,
        retry_count: 1,
        last_error: 'Bir gönderi yeniden denenecek.',
      },
    });

    expect(status).toMatchObject({
      configured: null,
      account_username: 'cybersenselab',
      initial_sync_completed: true,
      last_seen_media_id: 'media-4',
      is_running: false,
      latest_run: {
        status: 'partial',
        trigger: 'cron',
        discovered: 6,
        imported: 4,
        skipped: 1,
        retrying: 1,
      },
    });
  });

  it('does not present missing server configuration metadata as ready', () => {
    expect(normalizeInstagramSyncStatus({ initial_sync_completed: false }).configured).toBeNull();
    expect(normalizeInstagramSyncStatus({ configured: true }).configured).toBe(true);
    expect(normalizeInstagramSyncStatus({ configured: false }).configured).toBe(false);
  });

  it.each(['success', 'partial', 'failed', 'already_running'] as const)(
    'keeps the %s function result and safely defaults absent counters',
    syncStatus => {
      expect(normalizeInstagramSyncSummary({ status: syncStatus })).toEqual(expect.objectContaining({
        status: syncStatus,
        discovered: 0,
        imported: 0,
        skipped: 0,
        retrying: 0,
      }));
    },
  );

  it('loads status only through the admin-safe RPC', async () => {
    const client = {
      rpc: vi.fn().mockResolvedValue({ data: { initial_sync_completed: false }, error: null }),
      functions: { invoke: vi.fn() },
    } as unknown as InstagramSyncClient;

    await getInstagramSyncStatus(client);

    expect(client.rpc).toHaveBeenCalledWith('admin_get_instagram_sync_status');
  });

  it('invokes the Edge Function with the current admin JWT', async () => {
    const client = {
      rpc: vi.fn(),
      functions: {
        invoke: vi.fn().mockResolvedValue({
          data: { status: 'success', discovered: 1, imported: 1, skipped: 0, retrying: 0 },
          error: null,
        }),
      },
    } as unknown as InstagramSyncClient;

    await expect(invokeInstagramSync(client, 'admin-jwt')).resolves.toEqual(expect.objectContaining({
      status: 'success',
      imported: 1,
    }));
    expect(client.functions.invoke).toHaveBeenCalledWith('instagram-sync', {
      headers: { Authorization: 'Bearer admin-jwt' },
    });
  });

  it('blocks a manual invocation without an admin session token', async () => {
    const client = {
      rpc: vi.fn(),
      functions: { invoke: vi.fn() },
    } as unknown as InstagramSyncClient;

    await expect(invokeInstagramSync(client, undefined)).rejects.toThrow('admin oturumu');
    expect(client.functions.invoke).not.toHaveBeenCalled();
  });
});
