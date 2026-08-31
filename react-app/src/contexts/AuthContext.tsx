import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AdminProfile {
  user_id: string;
  email: string | null;
  display_name: string | null;
}

interface AuthContextType {
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const activeToken = useRef<string | null>(null);
  const validations = useRef(new Map<string, Promise<boolean>>());

  const clearSessionState = useCallback(() => {
    setSession(null);
    setAdminProfile(null);
  }, []);

  const verifyAdmin = useCallback((nextSession: Session): Promise<boolean> => {
    const token = nextSession.access_token;
    activeToken.current = token;
    const pending = validations.current.get(token);
    if (pending) return pending;

    const validation = (async () => {
      const { data, error } = await supabase.rpc('admin_me');
      if (activeToken.current !== token) return false;

      if (error || !data) {
        activeToken.current = null;
        clearSessionState();
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Yetkisiz oturum kapatılamadı.', signOutError);
        }
        return false;
      }

      setSession(nextSession);
      setAdminProfile(data as unknown as AdminProfile);
      return true;
    })().finally(() => {
      validations.current.delete(token);
    });

    validations.current.set(token, validation);
    return validation;
  }, [clearSessionState]);

  useEffect(() => {
    let disposed = false;

    const handleSession = async (nextSession: Session | null) => {
      if (disposed) return;
      if (!nextSession) {
        activeToken.current = null;
        clearSessionState();
        setIsLoading(false);
        return;
      }

      const token = nextSession.access_token;
      activeToken.current = token;
      setIsLoading(true);
      await verifyAdmin(nextSession);
      // An unauthorized session clears activeToken before attempting sign-out.
      // Finish the initial loading state even if that sign-out request fails.
      if (!disposed && (activeToken.current === token || activeToken.current === null)) {
        setIsLoading(false);
      }
    };

    void supabase.auth.getSession().then(({ data, error }) => {
      if (disposed) return;
      if (error) {
        activeToken.current = null;
        clearSessionState();
        setIsLoading(false);
        return;
      }
      void handleSession(data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => {
        void handleSession(nextSession);
      }, 0);
    });

    return () => {
      disposed = true;
      authListener.subscription.unsubscribe();
    };
  }, [clearSessionState, verifyAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error('Oturum oluşturulamadı.');

      const allowed = await verifyAdmin(data.session);
      if (!allowed) throw new Error('Bu hesabın yönetim paneline erişim yetkisi yok.');
    } finally {
      setIsLoading(false);
    }
  }, [verifyAdmin]);

  const signOut = useCallback(async () => {
    activeToken.current = null;
    clearSessionState();
    await supabase.auth.signOut();
  }, [clearSessionState]);

  return (
    <AuthContext.Provider value={{ session, isAdmin: adminProfile !== null, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
