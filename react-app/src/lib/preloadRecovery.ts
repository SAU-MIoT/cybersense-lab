const RECOVERY_KEY = 'cybersense:preload-recovery';
const RECOVERY_COOLDOWN_MS = 60_000;

interface RecoveryOptions {
  now?: () => number;
  reload?: () => void;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
}

export function recoverFromPreloadError(event: Event, options: RecoveryOptions = {}) {
  event.preventDefault();

  const now = options.now?.() ?? Date.now();
  const reload = options.reload ?? (() => window.location.reload());
  const storage = options.storage ?? window.sessionStorage;

  try {
    const lastAttempt = Number(storage.getItem(RECOVERY_KEY) || 0);
    if (lastAttempt && now - lastAttempt < RECOVERY_COOLDOWN_MS) return false;
    storage.setItem(RECOVERY_KEY, String(now));
  } catch {
    // Storage can be unavailable in privacy modes; a single browser reload is still useful.
  }

  reload();
  return true;
}

export function installPreloadErrorRecovery() {
  window.addEventListener('vite:preloadError', recoverFromPreloadError);
}
