import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Session } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  rpc: vi.fn(),
  authChange: undefined as ((event: string, session: Session | null) => void) | undefined,
  unsubscribe: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
    },
    rpc: mocks.rpc,
  },
}));

function makeSession(token: string, email = 'admin@example.com'): Session {
  return {
    access_token: token,
    refresh_token: `refresh-${token}`,
    expires_in: 3600,
    token_type: 'bearer',
    user: { id: `user-${token}`, email } as Session['user'],
  } as Session;
}

function AuthProbe() {
  const { session, isAdmin, isLoading, signIn, signOut } = useAuth();
  return (
    <div>
      <div data-testid="state">
        {isLoading ? 'loading' : 'ready'}:{isAdmin ? 'admin' : 'guest'}:{session?.access_token || 'none'}
      </div>
      <button onClick={() => void signIn('admin@example.com', 'secret')}>sign-in</button>
      <button onClick={() => void signOut()}>sign-out</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    mocks.authChange = undefined;
    mocks.unsubscribe.mockReset();
    mocks.getSession.mockReset();
    mocks.onAuthStateChange.mockReset().mockImplementation(callback => {
      mocks.authChange = callback;
      return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
    });
    mocks.signInWithPassword.mockReset();
    mocks.signOut.mockReset().mockResolvedValue({ error: null });
    mocks.rpc.mockReset();
  });

  it('opens an authenticated session only after admin_me confirms the user', async () => {
    const session = makeSession('initial-admin');
    mocks.getSession.mockResolvedValue({ data: { session }, error: null });
    mocks.rpc.mockResolvedValue({
      data: { user_id: session.user.id, email: session.user.email, display_name: 'Admin' },
      error: null,
    });

    render(<AuthProvider><AuthProbe /></AuthProvider>);

    expect(await screen.findByTestId('state')).toHaveTextContent('ready:admin:initial-admin');
    expect(mocks.rpc).toHaveBeenCalledWith('admin_me');
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it('rejects a normal authenticated user, forces sign-out, and leaves loading even when sign-out fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.getSession.mockResolvedValue({ data: { session: makeSession('not-admin') }, error: null });
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'forbidden' } });
    mocks.signOut.mockRejectedValue(new Error('network down'));

    render(<AuthProvider><AuthProbe /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('ready:guest:none'));
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith('Yetkisiz oturum kapatılamadı.', expect.any(Error));
  });

  it('keeps initial, refreshed, and signed-out state synchronized with Supabase auth events', async () => {
    const initial = makeSession('token-one');
    const refreshed = makeSession('token-two');
    mocks.getSession.mockResolvedValue({ data: { session: initial }, error: null });
    mocks.rpc.mockResolvedValue({
      data: { user_id: initial.user.id, email: initial.user.email, display_name: 'Admin' },
      error: null,
    });

    render(<AuthProvider><AuthProbe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('ready:admin:token-one'));

    act(() => mocks.authChange?.('TOKEN_REFRESHED', refreshed));
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('ready:admin:token-two'));

    act(() => mocks.authChange?.('SIGNED_OUT', null));
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('ready:guest:none'));
    expect(mocks.rpc).toHaveBeenCalledTimes(2);
  });

  it('validates a password sign-in with admin_me before exposing admin state', async () => {
    const user = userEvent.setup();
    const session = makeSession('password-admin');
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mocks.signInWithPassword.mockResolvedValue({ data: { session }, error: null });
    mocks.rpc.mockResolvedValue({
      data: { user_id: session.user.id, email: session.user.email, display_name: 'Admin' },
      error: null,
    });

    render(<AuthProvider><AuthProbe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('ready:guest:none'));
    await user.click(screen.getByRole('button', { name: 'sign-in' }));

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('ready:admin:password-admin'));
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'secret' });
  });
});
