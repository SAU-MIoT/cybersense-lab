-- CyberSense live schema/security migration. Safe to run repeatedly.
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '120s';
SET LOCAL check_function_bodies = true;

ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS publish_date timestamptz NULL;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arastirma_alanlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ekip ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etkinlikler ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oduller ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ortaklar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_ayarlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yayinlar ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.admin_get_table_meta(p_table text)
RETURNS TABLE(table_name text, pk_col text, pk_type text, order_by text, insert_cols text[], update_cols text[], record_def text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public
AS $function$
BEGIN
  CASE p_table
    WHEN 'announcements' THEN
      table_name := 'announcements'; pk_col := 'id'; pk_type := 'uuid'; order_by := 'COALESCE(publish_date, created_at) DESC, created_at DESC';
      insert_cols := ARRAY['title','content','publish_date','is_published']; update_cols := insert_cols;
      record_def := 'title text, content text, publish_date timestamptz, is_published boolean';
    WHEN 'projects' THEN
      table_name := 'projects'; pk_col := 'id'; pk_type := 'uuid'; order_by := 'created_at DESC';
      insert_cols := ARRAY['title','description','image_url','github_url','demo_url','status','funder','date_range','progress_pct','is_published']; update_cols := insert_cols;
      record_def := 'title text, description text, image_url text, github_url text, demo_url text, status text, funder text, date_range text, progress_pct int, is_published boolean';
    WHEN 'etkinlikler' THEN
      table_name := 'etkinlikler'; pk_col := 'id'; pk_type := 'uuid'; order_by := 'event_date DESC';
      insert_cols := ARRAY['title','description','event_date','location','is_published']; update_cols := insert_cols;
      record_def := 'title text, description text, event_date timestamptz, location text, is_published boolean';
    WHEN 'arastirma_alanlari' THEN
      table_name := 'arastirma_alanlari'; pk_col := 'id'; pk_type := 'uuid'; order_by := 'sort_order ASC, created_at DESC';
      insert_cols := ARRAY['icon','title','description','sort_order','is_published']; update_cols := insert_cols;
      record_def := 'icon text, title text, description text, sort_order int, is_published boolean';
    WHEN 'ekip' THEN
      table_name := 'ekip'; pk_col := 'id'; pk_type := 'uuid'; order_by := 'priority DESC, sort_order ASC, created_at DESC';
      insert_cols := ARRAY['name','role','expertise','avatar_icon','email','linkedin_url','github_url','scholar_url','website_url','sort_order','priority','is_published']; update_cols := insert_cols;
      record_def := 'name text, role text, expertise text, avatar_icon text, email text, linkedin_url text, github_url text, scholar_url text, website_url text, sort_order int, priority int, is_published boolean';
    WHEN 'yayinlar' THEN
      table_name := 'yayinlar'; pk_col := 'id'; pk_type := 'uuid'; order_by := 'pub_year DESC, created_at DESC';
      insert_cols := ARRAY['title','authors','venue','pub_type','pub_year','pdf_url','doi_url','is_published']; update_cols := insert_cols;
      record_def := 'title text, authors text, venue text, pub_type text, pub_year int, pdf_url text, doi_url text, is_published boolean';
    WHEN 'oduller' THEN
      table_name := 'oduller'; pk_col := 'id'; pk_type := 'uuid'; order_by := 'sort_order ASC, year DESC';
      insert_cols := ARRAY['year','title','description','color_scheme','sort_order','is_published']; update_cols := insert_cols;
      record_def := 'year int, title text, description text, color_scheme text, sort_order int, is_published boolean';
    WHEN 'ortaklar' THEN
      table_name := 'ortaklar'; pk_col := 'id'; pk_type := 'uuid'; order_by := 'sort_order ASC, created_at DESC';
      insert_cols := ARRAY['name','icon','url','sort_order','is_published']; update_cols := insert_cols;
      record_def := 'name text, icon text, url text, sort_order int, is_published boolean';
    WHEN 'site_ayarlari' THEN
      table_name := 'site_ayarlari'; pk_col := 'key'; pk_type := 'text'; order_by := 'key ASC';
      insert_cols := ARRAY['key','value']; update_cols := ARRAY['value']; record_def := 'key text, value text';
    ELSE RAISE EXCEPTION 'Invalid admin table: %', p_table USING ERRCODE = '22023';
  END CASE;
  RETURN NEXT;
END;
$function$;

DO $constraints$
DECLARE item text[];
BEGIN
  FOREACH item SLICE 1 IN ARRAY ARRAY[
    ARRAY['projects','projects_status_check',$check$status IN ('active', 'done', 'plan')$check$],
    ARRAY['projects','projects_progress_pct_check','progress_pct BETWEEN 0 AND 100'],
    ARRAY['ekip','ekip_priority_check','priority BETWEEN 1 AND 4'],
    ARRAY['yayinlar','yayinlar_pub_type_check',$check$pub_type IN ('journal', 'conference')$check$],
    ARRAY['yayinlar','yayinlar_pub_year_check','pub_year BETWEEN 1900 AND 2100'],
    ARRAY['oduller','oduller_year_check','year BETWEEN 1900 AND 2100'],
    ARRAY['oduller','oduller_color_scheme_check',$check$color_scheme IN ('cyan', 'green', 'orange', 'purple')$check$]
  ] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid = format('public.%I', item[1])::regclass AND conname = item[2]) THEN
      EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (%s) NOT VALID', item[1], item[2], item[3]);
    END IF;
    EXECUTE format('ALTER TABLE public.%I VALIDATE CONSTRAINT %I', item[1], item[2]);
  END LOOP;
END
$constraints$;

CREATE INDEX IF NOT EXISTS idx_announcements_public_date ON public.announcements (is_published, publish_date DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_images_entity ON public.content_images (entity_type, entity_id, sort_order, created_at);

DROP POLICY IF EXISTS "Anyone can read published announcements" ON public.announcements;
DROP POLICY IF EXISTS public_read_arastirma_alanlari ON public.arastirma_alanlari;
DROP POLICY IF EXISTS public_read_content_images ON public.content_images;
DROP POLICY IF EXISTS public_read_ekip ON public.ekip;
DROP POLICY IF EXISTS public_read_etkinlikler ON public.etkinlikler;
DROP POLICY IF EXISTS public_read_oduller ON public.oduller;
DROP POLICY IF EXISTS public_read_ortaklar ON public.ortaklar;
DROP POLICY IF EXISTS "Anyone can read published projects" ON public.projects;
DROP POLICY IF EXISTS public_read_site_ayarlari ON public.site_ayarlari;
DROP POLICY IF EXISTS public_read_yayinlar ON public.yayinlar;
CREATE POLICY "Anyone can read published announcements" ON public.announcements FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY public_read_arastirma_alanlari ON public.arastirma_alanlari FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY public_read_content_images ON public.content_images FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY public_read_ekip ON public.ekip FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY public_read_etkinlikler ON public.etkinlikler FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY public_read_oduller ON public.oduller FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY public_read_ortaklar ON public.ortaklar FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Anyone can read published projects" ON public.projects FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY public_read_site_ayarlari ON public.site_ayarlari FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY public_read_yayinlar ON public.yayinlar FOR SELECT TO anon, authenticated USING (is_published = true);

REVOKE ALL PRIVILEGES ON TABLE public.admin_users, public.announcements, public.arastirma_alanlari, public.content_images, public.ekip, public.etkinlikler, public.oduller, public.ortaklar, public.projects, public.site_ayarlari, public.yayinlar FROM anon, authenticated;
GRANT SELECT ON TABLE public.announcements, public.arastirma_alanlari, public.content_images, public.ekip, public.etkinlikler, public.oduller, public.ortaklar, public.projects, public.site_ayarlari, public.yayinlar TO anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.admin_users, public.announcements, public.arastirma_alanlari, public.content_images, public.ekip, public.etkinlikler, public.oduller, public.ortaklar, public.projects, public.site_ayarlari, public.yayinlar FROM service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_users, public.announcements, public.arastirma_alanlari, public.content_images, public.ekip, public.etkinlikler, public.oduller, public.ortaklar, public.projects, public.site_ayarlari, public.yayinlar TO service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

ALTER FUNCTION public.admin_assert_image_entity(text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.admin_create_record(text, jsonb) SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.admin_delete_record(text, text) SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.admin_get_table_meta(text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.admin_is_admin() SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.admin_list_record_images(text, uuid[]) SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.admin_list_records(text) SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.admin_me() SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.admin_require_admin() SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.admin_set_record_images(text, uuid, jsonb) SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.admin_update_record(text, text, jsonb) SET search_path = pg_catalog, public, auth;
ALTER FUNCTION public.admin_validate_json_keys(jsonb, text[]) SET search_path = pg_catalog, public;
ALTER FUNCTION public.rls_auto_enable() SET search_path = pg_catalog;

REVOKE ALL ON FUNCTION public.admin_assert_image_entity(text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.admin_create_record(text, jsonb) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.admin_delete_record(text, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.admin_get_table_meta(text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.admin_is_admin() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.admin_list_record_images(text, uuid[]) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.admin_list_records(text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.admin_me() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.admin_require_admin() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.admin_set_record_images(text, uuid, jsonb) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.admin_update_record(text, text, jsonb) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.admin_validate_json_keys(jsonb, text[]) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_create_record(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_record(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_record_images(text, uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_records(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_me() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_record_images(text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_record(text, text, jsonb) TO authenticated;
COMMIT;
