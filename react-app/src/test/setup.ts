import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});
