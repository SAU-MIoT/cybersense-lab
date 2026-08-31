import { createClient } from '@supabase/supabase-js';

const configuredUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const configuredKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

if ((!configuredUrl || !configuredKey) && !import.meta.env.DEV) {
  throw new Error(
    'Supabase yapılandırması eksik. VITE_SUPABASE_URL ve VITE_SUPABASE_PUBLISHABLE_KEY değişkenlerini tanımlayın.',
  );
}

if (!configuredUrl || !configuredKey) {
  console.warn(
    'Supabase yapılandırması eksik; geliştirme ortamı geçici istemciyle başlatıldı.',
  );
}

const SUPABASE_URL = configuredUrl || 'https://placeholder.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = configuredKey || 'development-placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
