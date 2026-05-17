import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { supabase } from './supabase.js';

const SESSION_KEY = 'cybersense_admin_session';
const AUTH_BASE = SUPABASE_URL + '/auth/v1';

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function authHeaders(token = null) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: 'Bearer ' + (token || SUPABASE_ANON_KEY),
    'Content-Type': 'application/json',
  };
}

function normalizeSession(payload) {
  const expiresAt = payload.expires_at || (nowSeconds() + (payload.expires_in || 3600));
  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_at: expiresAt,
    user: payload.user || null,
  };
}

export function getStoredSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent('cybersense:admin-session'));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent('cybersense:admin-session'));
}

async function authRequest(path, body, token = null) {
  const res = await fetch(AUTH_BASE + path, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  const payload = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(payload.msg || payload.error_description || payload.error || 'Auth request failed');
  }
  return payload;
}

export async function signIn(email, password) {
  const payload = await authRequest('/token?grant_type=password', { email, password });
  const session = normalizeSession(payload);
  saveSession(session);

  try {
    await getAdminProfile();
    return session;
  } catch (err) {
    clearSession();
    throw err;
  }
}

export async function refreshSession(force = false) {
  const session = getStoredSession();
  if (!session.refresh_token) return null;
  if (!force && session.expires_at && session.expires_at - nowSeconds() > 90) return session;

  try {
    const payload = await authRequest('/token?grant_type=refresh_token', {
      refresh_token: session.refresh_token,
    });
    const refreshed = normalizeSession(payload);
    saveSession(refreshed);
    return refreshed;
  } catch (err) {
    clearSession();
    throw err;
  }
}

export async function getAdminToken() {
  const session = await refreshSession(false);
  return session.access_token || null;
}

export async function getAdminProfile() {
  const token = await getAdminToken();
  if (!token) throw new Error('Admin oturumu bulunamadi.');

  const { data, error } = await supabase.rpc('admin_me', {}, { token });
  if (error) throw new Error('Admin yetkisi dogrulanamadi.');
  return data;
}

export async function requireAdmin() {
  try {
    return await getAdminProfile();
  } catch (err) {
    clearSession();
    const next = encodeURIComponent(location.pathname.split('/').pop() || 'admin.html');
    location.href = `login.html?next=${next}`;
    throw err;
  }
}

export async function signOut() {
  const session = getStoredSession();
  clearSession();
  if (!session.access_token) return;

  try {
    await fetch(AUTH_BASE + '/logout', {
      method: 'POST',
      headers: authHeaders(session.access_token),
    });
  } catch {
    // Local sign-out is enough for the static admin shell.
  }
}
