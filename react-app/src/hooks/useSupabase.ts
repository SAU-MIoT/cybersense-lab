import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  Announcement, Project, Event, TeamMember, Publication,
  ResearchArea, Award, Partner, SiteSetting, PublicCounts, ContentImage,
} from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchTable<T>(table: string, queryBuilder: (q: any) => any): Promise<T[]> {
  const q = queryBuilder(supabase.from(table).select('*'));
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as T[];
}

// Tables that have related images in the `content_images` table
const IMAGE_ENTITIES = new Set(['announcements', 'projects', 'etkinlikler']);

/** Fetch related content_images and attach them to each row as `images`. */
async function attachContentImages<T extends { id: string }>(entityType: string, rows: T[]): Promise<(T & { images: ContentImage[] })[]> {
  if (!IMAGE_ENTITIES.has(entityType) || rows.length === 0) return rows as (T & { images: ContentImage[] })[];

  const ids = rows.map(r => String(r.id));
  const { data, error } = await supabase
    .from('content_images')
    .select('id, entity_type, entity_id, image_url, alt_text, sort_order, is_published')
    .eq('entity_type', entityType)
    .eq('is_published', true)
    .in('entity_id', ids)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  const byId = new Map<string, ContentImage[]>();
  (data || []).forEach(img => {
    const key = String(img.entity_id);
    if (!byId.has(key)) byId.set(key, []);
    byId.get(key)!.push(img as ContentImage);
  });

  return rows.map(r => ({ ...r, images: byId.get(String(r.id)) || [] }));
}

// ── Public Queries ──────────────────────────────────────────

export function useAnnouncements(limit?: number) {
  return useQuery({
    queryKey: ['announcements', limit],
    queryFn: async () => {
      const rows = await fetchTable<Announcement>('announcements', q =>
        q.eq('is_published', true).order('created_at', { ascending: false }).limit(100)
      );
      const sorted = [...rows].sort((left, right) => {
        const leftTime = Date.parse(left.publish_date || left.created_at) || 0;
        const rightTime = Date.parse(right.publish_date || right.created_at) || 0;
        return rightTime - leftTime;
      });
      const selected = limit ? sorted.slice(0, limit) : sorted;
      return attachContentImages('announcements', selected);
    },
  });
}

export function useProjects(limit?: number) {
  return useQuery({
    queryKey: ['projects', limit],
    queryFn: async () => {
      const rows = await fetchTable<Project>('projects', q =>
        q.eq('is_published', true).order('created_at', { ascending: false }).limit(limit || 100)
      );
      return attachContentImages('projects', rows);
    },
  });
}

export function useEvents(limit?: number) {
  return useQuery({
    queryKey: ['events', limit],
    queryFn: async () => {
      const rows = await fetchTable<Event>('etkinlikler', q =>
        q.eq('is_published', true).order('event_date', { ascending: true }).limit(limit || 100)
      );
      return attachContentImages('etkinlikler', rows);
    },
  });
}

export function useTeam(limit?: number) {
  return useQuery({
    queryKey: ['team', limit],
    queryFn: () => fetchTable<TeamMember>('ekip', q =>
      q.eq('is_published', true)
        .order('priority', { ascending: false })
        .order('sort_order', { ascending: true })
        .limit(limit || 100)
    ),
  });
}

export function usePublications(limit?: number) {
  return useQuery({
    queryKey: ['publications', limit],
    queryFn: () => fetchTable<Publication>('yayinlar', q =>
      q.eq('is_published', true)
        .order('pub_year', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit || 100)
    ),
  });
}

export function useResearchAreas() {
  return useQuery({
    queryKey: ['researchAreas'],
    queryFn: () => fetchTable<ResearchArea>('arastirma_alanlari', q =>
      q.eq('is_published', true).order('sort_order', { ascending: true })
    ),
  });
}

export function useAwards() {
  return useQuery({
    queryKey: ['awards'],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('oduller')
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return { items: (data || []) as Award[], count: count || 0 };
    },
  });
}

export function usePartners() {
  return useQuery({
    queryKey: ['partners'],
    queryFn: () => fetchTable<Partner>('ortaklar', q =>
      q.eq('is_published', true).order('sort_order', { ascending: true })
    ),
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_ayarlari').select('key,value');
      if (error) throw error;
      const obj: Record<string, string> = {};
      (data || []).forEach((row: SiteSetting) => { obj[row.key] = row.value; });
      return obj;
    },
  });
}

export function usePublicCounts() {
  return useQuery({
    queryKey: ['publicCounts'],
    queryFn: async (): Promise<PublicCounts> => {
      const tables = [
        { name: 'ekip', key: 'team' },
        { name: 'yayinlar', key: 'publications' },
        { name: 'ortaklar', key: 'partners' },
      ] as const;

      const results: Record<string, number> = {};

      for (const t of tables) {
        const { count, error } = await supabase
          .from(t.name)
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true);
        if (!error) results[t.key] = count || 0;
        else results[t.key] = 0;
      }

      const { count: projCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .eq('status', 'active');

      return {
        team: results.team || 0,
        publications: results.publications || 0,
        activeProjects: projCount || 0,
        partners: results.partners || 0,
      };
    },
    staleTime: 1000 * 60 * 10,
  });
}
