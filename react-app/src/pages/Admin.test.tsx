import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InstagramSyncStatus, InstagramSyncSummary } from '@/types';
import Admin from './Admin';

const mocks = vi.hoisted(() => ({
  getStatus: vi.fn(),
  invokeSync: vi.fn(),
  rpc: vi.fn(),
  toast: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAdmin: true,
    isLoading: false,
    session: { access_token: 'admin-jwt', user: { id: 'admin-id', email: 'admin@example.com' } },
    signOut: mocks.signOut,
  }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: mocks.rpc,
    functions: { invoke: vi.fn() },
  },
}));

vi.mock('@/lib/instagramSync', () => ({
  getInstagramSyncStatus: mocks.getStatus,
  invokeInstagramSync: mocks.invokeSync,
}));

vi.mock('react-hot-toast', () => {
  const toast = Object.assign(mocks.toast, {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  });
  return { default: toast };
});

const baseStatus: InstagramSyncStatus = {
  configured: true,
  connected: true,
  account_username: 'cybersenselab',
  initial_sync_completed: true,
  last_success_at: '2026-09-02T09:00:00Z',
  token_expires_at: '2099-01-01T00:00:00Z',
  token_refresh_required: false,
  is_running: false,
  latest_run: {
    status: 'success',
    trigger: 'cron',
    discovered: 3,
    imported: 2,
    skipped: 1,
    retrying: 0,
  },
};

function renderAdmin() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>
        <Admin />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('Admin Instagram sync card', () => {
  beforeEach(() => {
    mocks.getStatus.mockReset().mockResolvedValue(baseStatus);
    mocks.invokeSync.mockReset();
    mocks.rpc.mockReset().mockResolvedValue({ data: [], error: null });
  });

  it('shows an explicit loading state while the status RPC is pending', () => {
    mocks.getStatus.mockReturnValue(new Promise(() => undefined));
    mocks.rpc.mockReturnValue(new Promise(() => undefined));
    renderAdmin();
    expect(screen.getByRole('status')).toHaveTextContent('Durum yükleniyor');
    expect(screen.getByRole('button', { name: /Şimdi eşitle/i })).toBeDisabled();
  });

  it.each([
    ['success', 'Başarılı'],
    ['partial', 'Kısmi başarı'],
    ['failed', 'Başarısız'],
    ['already_running', 'Zaten çalışıyor'],
  ] as const)('renders the %s status returned by the admin RPC', async (status, label) => {
    mocks.getStatus.mockResolvedValue({
      ...baseStatus,
      latest_run: { ...baseStatus.latest_run, status } as InstagramSyncSummary,
    });
    renderAdmin();
    expect(await screen.findByText(label)).toBeInTheDocument();
  });

  it('labels absent server configuration metadata as unverified', async () => {
    mocks.getStatus.mockResolvedValue({ ...baseStatus, configured: null, connected: null });
    renderAdmin();

    expect(await screen.findByText('Sunucu yapılandırması doğrulanmadı')).toBeInTheDocument();
    expect(screen.queryByText('Hazır · Doğrulanmadı')).not.toBeInTheDocument();
  });

  it('uses the admin JWT, reports partial completion, and refreshes status after invoking sync', async () => {
    const user = userEvent.setup();
    mocks.invokeSync.mockResolvedValue({
      status: 'partial',
      discovered: 2,
      imported: 1,
      skipped: 0,
      retrying: 1,
    } satisfies InstagramSyncSummary);
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: /Şimdi eşitle/i }));

    await waitFor(() => expect(mocks.invokeSync).toHaveBeenCalledWith(expect.anything(), 'admin-jwt'));
    expect(mocks.toast).toHaveBeenCalledWith(expect.stringContaining('kısmen tamamlandı'), { icon: '⚠️' });
    await waitFor(() => expect(mocks.getStatus).toHaveBeenCalledTimes(2));
  });

  it('renders an Instagram source badge linking to the original announcement', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: [{
        id: 'announcement-1',
        title: 'Instagram duyurusu',
        source_type: 'instagram',
        source_url: 'https://www.instagram.com/p/example/',
        is_published: true,
      }],
      error: null,
    }).mockResolvedValueOnce({ data: [], error: null });
    renderAdmin();

    const badge = await screen.findByRole('link', { name: /Instagram/i });
    expect(badge).toHaveAttribute('href', 'https://www.instagram.com/p/example/');
    expect(badge).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
