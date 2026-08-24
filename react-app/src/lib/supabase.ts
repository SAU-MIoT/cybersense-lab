import { createClient } from '@supabase/supabase-js';

// Production credentials from https://cybersenselab.sakarya.edu.tr/
const SUPABASE_URL = 'https://zyujjhhceasuwjmfatzy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Xo0e8awyWTd7mehZRDdyLQ__P3OuZjz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
