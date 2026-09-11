import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppErrorBoundary, { isChunkLoadError } from './AppErrorBoundary';

function BrokenChunk(): never {
  throw new Error('Failed to fetch dynamically imported module');
}

describe('AppErrorBoundary', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('recognizes stale deployment chunk errors', () => {
    expect(isChunkLoadError(new Error('Loading chunk 42 failed'))).toBe(true);
    expect(isChunkLoadError(new Error('ordinary render failure'))).toBe(false);
  });

  it('shows the refresh recovery message when a lazy chunk cannot load', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });

    render(
      <AppErrorBoundary>
        <BrokenChunk />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Site g\u00fcncellendi' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Sayfay\u0131 yenile' })).toBeInTheDocument();
  });
});
