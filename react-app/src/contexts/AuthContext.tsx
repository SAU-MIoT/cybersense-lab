import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AdminSession } from '@/types';
import { supabase } from '@/lib/supabase';

const SESSION_KEY = 'cybersense_admin_session';

interface AuthContextType {
  session: AdminSession | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const saveSession = useCallback((s: AdminSession) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.session) throw new Error('Oturum oluşturulamadı.');

    const s: AdminSession = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token || '',
      expires_at: data.session.expires_at ? new Date(data.session.expires_at).getTime() / 1000 : 0,
      user: data.session.user ? { id: data.session.user.id, email: data.session.user.email || '' } : null,
    };
    saveSession(s);
  }, [saveSession]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    clearSession();
  }, [clearSession]);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!session) return null;
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at - now < 60) {
      try {
        const { data } = await supabase.auth.refreshSession({
          refresh_token: session.refresh_token,
        });
        if (data.session) {
          const s: AdminSession = {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token || '',
            expires_at: data.session.expires_at ? new Date(data.session.expires_at).getTime() / 1000 : 0,
            user: data.session.user ? { id: data.session.user.id, email: data.session.user.email || '' } : null,
          };
          saveSession(s);
          return s.access_token;
        }
      } catch {
        clearSession();
        return null;
      }
    }
    return session.access_token;
  }, [session, saveSession, clearSession]);

  return (
    <AuthContext.Provider value={{ session, isAdmin: !!session, isLoading, signIn, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
