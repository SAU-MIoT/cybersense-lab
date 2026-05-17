import { supabase } from './supabase.js';

/**
 * Yayınlanmış duyuruları getirir (sadece SELECT — RLS ile korunuyor)
 */
export async function getAnnouncements(limit = null) {
  let query = supabase
    .from('announcements')
    .select('id, title, content, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Yayınlanmış projeleri getirir (sadece SELECT — RLS ile korunuyor)
 */
export async function getProjects(limit = null) {
  let query = supabase
    .from('projects')
    .select('id, title, description, image_url, github_url, demo_url, status, funder, date_range, progress_pct, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Yaklaşan etkinlikleri getirir
 */
export async function getEvents(limit = null) {
  let query = supabase
    .from('etkinlikler')
    .select('id, title, description, event_date, location')
    .eq('is_published', true)
    .order('event_date', { ascending: true });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Araştırma alanlarını getirir
 */
export async function getResearchAreas() {
  const { data, error } = await supabase
    .from('arastirma_alanlari')
    .select('id, icon, title, description, sort_order')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Ekip üyelerini getirir — önce priority (yüksek→düşük), sonra sort_order
 */
export async function getTeam(limit = null) {
  let query = supabase
    .from('ekip')
    .select('id, name, role, expertise, avatar_icon, email, linkedin_url, github_url, scholar_url, website_url, sort_order, priority')
    .eq('is_published', true)
    .order('priority', { ascending: false })
    .order('sort_order', { ascending: true });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Yayınları getirir
 */
export async function getPublications(limit = null) {
  let query = supabase
    .from('yayinlar')
    .select('id, title, authors, venue, pub_type, pub_year, pdf_url, doi_url')
    .eq('is_published', true)
    .order('pub_year', { ascending: false })
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Ödülleri getirir
 */
export async function getAwards() {
  const { data, error } = await supabase
    .from('oduller')
    .select('id, year, title, description, color_scheme, sort_order')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Site ayarlarını getirir — { key: value } objesi döner
 */
export async function getSiteSettings() {
  const { data, error } = await supabase
    .from('site_ayarlari')
    .select('key, value');

  if (error) throw error;
  const obj = {};
  (data || []).forEach(row => { obj[row.key] = row.value; });
  return obj;
}

/**
 * Ortakları getirir
 */
export async function getPartners() {
  const { data, error } = await supabase
    .from('ortaklar')
    .select('id, name, icon, url, sort_order')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

