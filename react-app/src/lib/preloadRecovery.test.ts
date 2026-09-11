import { describe, expect, it, vi } from 'vitest';
import { recoverFromPreloadError } from './preloadRecovery';

describe('preload recovery', () => {
  it('reloads once and prevents a stale chunk error from bubbling', () => {
    const event = new Event('vite:preloadError', { cancelable: true });
    const reload = vi.fn();
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(recoverFromPreloadError(event, { now: () => 100_000, reload, storage })).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(reload).toHaveBeenCalledOnce();

    const repeatedEvent = new Event('vite:preloadError', { cancelable: true });
    expect(recoverFromPreloadError(repeatedEvent, { now: () => 100_500, reload, storage })).toBe(false);
    expect(reload).toHaveBeenCalledOnce();
  });

  it('retries after the cooldown window', () => {
    const reload = vi.fn();
    const storage = {
      getItem: () => '100000',
      setItem: vi.fn(),
    };

    expect(recoverFromPreloadError(new Event('vite:preloadError'), {
      now: () => 160_001,
      reload,
      storage,
    })).toBe(true);
    expect(reload).toHaveBeenCalledOnce();
  });
});
