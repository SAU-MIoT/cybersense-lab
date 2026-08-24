-- CyberSense full Supabase restore bundle
-- Generated from 20260629_113338 at 2026-07-03T11:49:00.167Z
-- Run order in this file: Supabase prelude -> public schema -> data.
-- Target: a real Supabase project database. Supabase-managed schemas such as
-- auth/storage/realtime/vault are expected to already exist.

SET client_encoding = 'UTF8';
SET check_function_bodies = false;
SET client_min_messages = warning;

CREATE SCHEMA IF NOT EXISTS "extensions";
CREATE SCHEMA IF NOT EXISTS "vault";

-- ============================================================
-- Public schema
-- ============================================================

-- ============================================================
-- Schemas
-- ============================================================


CREATE SCHEMA IF NOT EXISTS "public";


-- ============================================================
-- Extensions
-- ============================================================


CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


-- ============================================================
-- Sequences
-- ============================================================




-- ============================================================
-- Functions
-- ============================================================


CREATE OR REPLACE FUNCTION public.admin_assert_image_entity(p_entity_type text)
 RETURNS void
 LANGUAGE plpgsql
 IMMUTABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_entity_type NOT IN ('announcements', 'projects', 'etkinlikler') THEN
    RAISE EXCEPTION 'Invalid image entity: %', p_entity_type USING ERRCODE = '22023';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_create_record(p_table text, p_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  meta record;
  v_cols text[];
  v_col_list text;
  v_result jsonb;
BEGIN
  PERFORM public.admin_require_admin();
  SELECT * INTO meta FROM public.admin_get_table_meta(p_table);
  PERFORM public.admin_validate_json_keys(p_data, meta.insert_cols);

  SELECT array_agg(col)
  INTO v_cols
  FROM unnest(meta.insert_cols) AS col
  WHERE p_data ? col;

  IF v_cols IS NULL OR array_length(v_cols, 1) IS NULL THEN
    RAISE EXCEPTION 'No writable columns supplied' USING ERRCODE = '22023';
  END IF;

  SELECT string_agg(format('%I', col), ', ')
  INTO v_col_list
  FROM unnest(v_cols) AS col;

  EXECUTE format(
    'WITH input AS (
       SELECT %1$s FROM jsonb_to_record($1) AS x(%2$s)
     ), inserted AS (
       INSERT INTO public.%3$I (%1$s)
       SELECT %1$s FROM input
       RETURNING *
     )
     SELECT to_jsonb(inserted) FROM inserted',
    v_col_list,
    meta.record_def,
    meta.table_name
  )
  INTO v_result
  USING p_data;

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_delete_record(p_table text, p_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  meta record;
  v_result jsonb;
BEGIN
  PERFORM public.admin_require_admin();
  SELECT * INTO meta FROM public.admin_get_table_meta(p_table);

  IF p_table IN ('announcements', 'projects', 'etkinlikler') THEN
    DELETE FROM public.content_images
    WHERE entity_type = p_table
      AND entity_id = p_id::uuid;
  END IF;

  EXECUTE format(
    'WITH deleted AS (
       DELETE FROM public.%1$I
       WHERE %2$I = $1::%3$s
       RETURNING *
     )
     SELECT to_jsonb(deleted) FROM deleted',
    meta.table_name,
    meta.pk_col,
    meta.pk_type
  )
  INTO v_result
  USING p_id;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Record not found' USING ERRCODE = '02000';
  END IF;

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_get_table_meta(p_table text)
 RETURNS TABLE(table_name text, pk_col text, pk_type text, order_by text, insert_cols text[], update_cols text[], record_def text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  CASE p_table
    WHEN 'announcements' THEN
      table_name := 'announcements';
      pk_col := 'id';
      pk_type := 'uuid';
      order_by := 'created_at DESC';
      insert_cols := ARRAY['title','content','is_published'];
      update_cols := insert_cols;
      record_def := 'title text, content text, is_published boolean';
    WHEN 'projects' THEN
      table_name := 'projects';
      pk_col := 'id';
      pk_type := 'uuid';
      order_by := 'created_at DESC';
      insert_cols := ARRAY['title','description','image_url','github_url','demo_url','status','funder','date_range','progress_pct','is_published'];
      update_cols := insert_cols;
      record_def := 'title text, description text, image_url text, github_url text, demo_url text, status text, funder text, date_range text, progress_pct int, is_published boolean';
    WHEN 'etkinlikler' THEN
      table_name := 'etkinlikler';
      pk_col := 'id';
      pk_type := 'uuid';
      order_by := 'event_date DESC';
      insert_cols := ARRAY['title','description','event_date','location','is_published'];
      update_cols := insert_cols;
      record_def := 'title text, description text, event_date timestamptz, location text, is_published boolean';
    WHEN 'arastirma_alanlari' THEN
      table_name := 'arastirma_alanlari';
      pk_col := 'id';
      pk_type := 'uuid';
      order_by := 'sort_order ASC, created_at DESC';
      insert_cols := ARRAY['icon','title','description','sort_order','is_published'];
      update_cols := insert_cols;
      record_def := 'icon text, title text, description text, sort_order int, is_published boolean';
    WHEN 'ekip' THEN
      table_name := 'ekip';
      pk_col := 'id';
      pk_type := 'uuid';
      order_by := 'priority DESC, sort_order ASC, created_at DESC';
      insert_cols := ARRAY['name','role','expertise','avatar_icon','email','linkedin_url','github_url','scholar_url','website_url','sort_order','priority','is_published'];
      update_cols := insert_cols;
      record_def := 'name text, role text, expertise text, avatar_icon text, email text, linkedin_url text, github_url text, scholar_url text, website_url text, sort_order int, priority int, is_published boolean';
    WHEN 'yayinlar' THEN
      table_name := 'yayinlar';
      pk_col := 'id';
      pk_type := 'uuid';
      order_by := 'pub_year DESC, created_at DESC';
      insert_cols := ARRAY['title','authors','venue','pub_type','pub_year','pdf_url','doi_url','is_published'];
      update_cols := insert_cols;
      record_def := 'title text, authors text, venue text, pub_type text, pub_year int, pdf_url text, doi_url text, is_published boolean';
    WHEN 'oduller' THEN
      table_name := 'oduller';
      pk_col := 'id';
      pk_type := 'uuid';
      order_by := 'sort_order ASC, year DESC';
      insert_cols := ARRAY['year','title','description','color_scheme','sort_order','is_published'];
      update_cols := insert_cols;
      record_def := 'year int, title text, description text, color_scheme text, sort_order int, is_published boolean';
    WHEN 'ortaklar' THEN
      table_name := 'ortaklar';
      pk_col := 'id';
      pk_type := 'uuid';
      order_by := 'sort_order ASC, created_at DESC';
      insert_cols := ARRAY['name','icon','url','sort_order','is_published'];
      update_cols := insert_cols;
      record_def := 'name text, icon text, url text, sort_order int, is_published boolean';
    WHEN 'site_ayarlari' THEN
      table_name := 'site_ayarlari';
      pk_col := 'key';
      pk_type := 'text';
      order_by := 'key ASC';
      insert_cols := ARRAY['key','value'];
      update_cols := ARRAY['value'];
      record_def := 'key text, value text';
    ELSE
      RAISE EXCEPTION 'Invalid admin table: %', p_table USING ERRCODE = '22023';
  END CASE;

  RETURN NEXT;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
      AND au.is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.admin_list_record_images(p_entity_type text, p_entity_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  PERFORM public.admin_require_admin();
  PERFORM public.admin_assert_image_entity(p_entity_type);

  SELECT COALESCE(jsonb_agg(to_jsonb(ci) ORDER BY ci.entity_id, ci.sort_order, ci.created_at), '[]'::jsonb)
  INTO v_result
  FROM public.content_images ci
  WHERE ci.entity_type = p_entity_type
    AND ci.entity_id = ANY(p_entity_ids);

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_list_records(p_table text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  meta record;
  v_result jsonb;
BEGIN
  PERFORM public.admin_require_admin();
  SELECT * INTO meta FROM public.admin_get_table_meta(p_table);

  EXECUTE format(
    'SELECT COALESCE(jsonb_agg(to_jsonb(t)), ''[]''::jsonb)
       FROM (SELECT * FROM public.%I ORDER BY %s) AS t',
    meta.table_name,
    meta.order_by
  )
  INTO v_result;

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_me()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_uid uuid;
  v_result jsonb;
BEGIN
  v_uid := public.admin_require_admin();

  SELECT jsonb_build_object(
    'user_id', au.user_id,
    'display_name', au.display_name,
    'email', u.email
  )
  INTO v_result
  FROM public.admin_users au
  LEFT JOIN auth.users u ON u.id = au.user_id
  WHERE au.user_id = v_uid
    AND au.is_active = true;

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_require_admin()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Admin session required' USING ERRCODE = '28000';
  END IF;

  IF NOT public.admin_is_admin() THEN
    RAISE EXCEPTION 'Admin permission required' USING ERRCODE = '42501';
  END IF;

  RETURN v_uid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_set_record_images(p_entity_type text, p_entity_id uuid, p_images jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_exists boolean;
  v_count int;
BEGIN
  PERFORM public.admin_require_admin();
  PERFORM public.admin_assert_image_entity(p_entity_type);

  EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I WHERE id = $1)', p_entity_type)
  INTO v_exists
  USING p_entity_id;

  IF NOT v_exists THEN
    RAISE EXCEPTION 'Record not found for images' USING ERRCODE = '02000';
  END IF;

  IF p_images IS NULL THEN
    p_images := '[]'::jsonb;
  END IF;

  IF jsonb_typeof(p_images) <> 'array' THEN
    RAISE EXCEPTION 'Images must be a JSON array' USING ERRCODE = '22023';
  END IF;

  DELETE FROM public.content_images
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id;

  WITH items AS (
    SELECT value, ordinality - 1 AS idx
    FROM jsonb_array_elements(p_images) WITH ORDINALITY AS t(value, ordinality)
  ),
  parsed AS (
    SELECT
      trim(CASE
        WHEN jsonb_typeof(value) = 'string' THEN value #>> '{}'
        ELSE value ->> 'image_url'
      END) AS image_url,
      NULLIF(trim(COALESCE(value ->> 'alt_text', '')), '') AS alt_text,
      COALESCE(NULLIF(value ->> 'sort_order', '')::int, idx) AS sort_order,
      COALESCE(NULLIF(value ->> 'is_published', '')::boolean, true) AS is_published
    FROM items
  )
  INSERT INTO public.content_images (entity_type, entity_id, image_url, alt_text, sort_order, is_published)
  SELECT p_entity_type, p_entity_id, image_url, alt_text, sort_order, is_published
  FROM parsed
  WHERE image_url IS NOT NULL
    AND image_url <> '';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN jsonb_build_object('entity_type', p_entity_type, 'entity_id', p_entity_id, 'count', v_count);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_record(p_table text, p_id text, p_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  meta record;
  v_cols text[];
  v_select_list text;
  v_assign_list text;
  v_touch text := '';
  v_result jsonb;
BEGIN
  PERFORM public.admin_require_admin();
  SELECT * INTO meta FROM public.admin_get_table_meta(p_table);
  PERFORM public.admin_validate_json_keys(p_data, meta.update_cols);

  SELECT array_agg(col)
  INTO v_cols
  FROM unnest(meta.update_cols) AS col
  WHERE p_data ? col;

  IF v_cols IS NULL OR array_length(v_cols, 1) IS NULL THEN
    RAISE EXCEPTION 'No writable columns supplied' USING ERRCODE = '22023';
  END IF;

  SELECT string_agg(format('%I', col), ', ')
  INTO v_select_list
  FROM unnest(v_cols) AS col;

  SELECT string_agg(format('%1$I = x.%1$I', col), ', ')
  INTO v_assign_list
  FROM unnest(v_cols) AS col;

  IF meta.table_name = 'site_ayarlari' THEN
    v_touch := ', updated_at = now()';
  END IF;

  EXECUTE format(
    'WITH input AS (
       SELECT %1$s FROM jsonb_to_record($1) AS x(%2$s)
     ), updated AS (
       UPDATE public.%3$I AS t
       SET %4$s%5$s
       FROM input AS x
       WHERE t.%6$I = $2::%7$s
       RETURNING t.*
     )
     SELECT to_jsonb(updated) FROM updated',
    v_select_list,
    meta.record_def,
    meta.table_name,
    v_assign_list,
    v_touch,
    meta.pk_col,
    meta.pk_type
  )
  INTO v_result
  USING p_data, p_id;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Record not found' USING ERRCODE = '02000';
  END IF;

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_validate_json_keys(p_data jsonb, p_allowed text[])
 RETURNS void
 LANGUAGE plpgsql
 IMMUTABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bad_key text;
BEGIN
  IF p_data IS NULL OR jsonb_typeof(p_data) <> 'object' THEN
    RAISE EXCEPTION 'JSON object expected' USING ERRCODE = '22023';
  END IF;

  SELECT key
  INTO v_bad_key
  FROM jsonb_object_keys(p_data) AS keys(key)
  WHERE NOT (key = ANY(p_allowed))
  LIMIT 1;

  IF v_bad_key IS NOT NULL THEN
    RAISE EXCEPTION 'Column is not allowed: %', v_bad_key USING ERRCODE = '42501';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;


-- ============================================================
-- Tables
-- ============================================================


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
  "user_id" uuid NOT NULL,
  "display_name" text DEFAULT 'Admin'::text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY "public"."admin_users" ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY (user_id);

ALTER TABLE ONLY "public"."admin_users" ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "public"."announcements" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL
);

ALTER TABLE ONLY "public"."announcements" ADD CONSTRAINT "announcements_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "public"."arastirma_alanlari" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "icon" text DEFAULT 'fa-shield'::text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY "public"."arastirma_alanlari" ADD CONSTRAINT "arastirma_alanlari_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."arastirma_alanlari" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "public"."content_images" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "image_url" text NOT NULL,
  "alt_text" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY "public"."content_images" ADD CONSTRAINT "content_images_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY "public"."content_images" ADD CONSTRAINT "content_images_entity_type_check" CHECK (entity_type = ANY (ARRAY['announcements'::text, 'projects'::text, 'etkinlikler'::text]));

ALTER TABLE ONLY "public"."content_images" ADD CONSTRAINT "content_images_image_url_check" CHECK (length(TRIM(BOTH FROM image_url)) > 0);

ALTER TABLE "public"."content_images" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "public"."ekip" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "role" text NOT NULL,
  "expertise" text,
  "avatar_icon" text DEFAULT 'fa-user'::text,
  "email" text,
  "linkedin_url" text,
  "github_url" text,
  "scholar_url" text,
  "website_url" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "priority" integer DEFAULT 1 NOT NULL
);

ALTER TABLE ONLY "public"."ekip" ADD CONSTRAINT "ekip_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."ekip" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "public"."etkinlikler" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "event_date" timestamp with time zone NOT NULL,
  "location" text,
  "is_published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY "public"."etkinlikler" ADD CONSTRAINT "etkinlikler_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."etkinlikler" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "public"."oduller" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "year" integer NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "color_scheme" text DEFAULT 'cyan'::text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY "public"."oduller" ADD CONSTRAINT "oduller_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."oduller" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "public"."ortaklar" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "icon" text DEFAULT 'fa-building'::text NOT NULL,
  "url" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY "public"."ortaklar" ADD CONSTRAINT "ortaklar_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."ortaklar" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "public"."projects" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "image_url" text,
  "github_url" text,
  "demo_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "status" text DEFAULT 'active'::text NOT NULL,
  "funder" text,
  "date_range" text,
  "progress_pct" integer DEFAULT 0 NOT NULL
);

ALTER TABLE ONLY "public"."projects" ADD CONSTRAINT "projects_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "public"."site_ayarlari" (
  "key" text NOT NULL,
  "value" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY "public"."site_ayarlari" ADD CONSTRAINT "site_ayarlari_pkey" PRIMARY KEY (key);

ALTER TABLE "public"."site_ayarlari" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "public"."yayinlar" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "authors" text NOT NULL,
  "venue" text NOT NULL,
  "pub_type" text DEFAULT 'journal'::text NOT NULL,
  "pub_year" integer NOT NULL,
  "pdf_url" text,
  "doi_url" text,
  "is_published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY "public"."yayinlar" ADD CONSTRAINT "yayinlar_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."yayinlar" ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- Views
-- ============================================================




-- ============================================================
-- Indexes, Triggers, Policies, Grants
-- ============================================================


CREATE INDEX idx_content_images_entity ON public.content_images USING btree (entity_type, entity_id, sort_order, created_at);
CREATE POLICY "Anyone can read published announcements" ON "public"."announcements" AS PERMISSIVE FOR SELECT TO "anon" USING ((is_published = true));
CREATE POLICY "public_read_arastirma_alanlari" ON "public"."arastirma_alanlari" AS PERMISSIVE FOR SELECT TO "anon" USING ((is_published = true));
CREATE POLICY "public_read_content_images" ON "public"."content_images" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING ((is_published = true));
CREATE POLICY "public_read_ekip" ON "public"."ekip" AS PERMISSIVE FOR SELECT TO "anon" USING ((is_published = true));
CREATE POLICY "public_read_etkinlikler" ON "public"."etkinlikler" AS PERMISSIVE FOR SELECT TO "anon" USING ((is_published = true));
CREATE POLICY "public_read_oduller" ON "public"."oduller" AS PERMISSIVE FOR SELECT TO "anon" USING ((is_published = true));
CREATE POLICY "public_read_ortaklar" ON "public"."ortaklar" AS PERMISSIVE FOR SELECT TO "anon" USING ((is_published = true));
CREATE POLICY "Anyone can read published projects" ON "public"."projects" AS PERMISSIVE FOR SELECT TO "anon" USING ((is_published = true));
CREATE POLICY "public_read_site_ayarlari" ON "public"."site_ayarlari" AS PERMISSIVE FOR SELECT TO "anon" USING (true);
CREATE POLICY "public_read_yayinlar" ON "public"."yayinlar" AS PERMISSIVE FOR SELECT TO "anon" USING ((is_published = true));
GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."admin_users" TO "service_role";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."announcements" TO "anon";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."announcements" TO "authenticated";
GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."announcements" TO "service_role";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."arastirma_alanlari" TO "anon";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."arastirma_alanlari" TO "authenticated";
GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."arastirma_alanlari" TO "service_role";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."content_images" TO "anon";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."content_images" TO "authenticated";
GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."content_images" TO "service_role";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."ekip" TO "anon";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."ekip" TO "authenticated";
GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."ekip" TO "service_role";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."etkinlikler" TO "anon";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."etkinlikler" TO "authenticated";
GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."etkinlikler" TO "service_role";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."oduller" TO "anon";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."oduller" TO "authenticated";
GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."oduller" TO "service_role";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."ortaklar" TO "anon";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."ortaklar" TO "authenticated";
GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."ortaklar" TO "service_role";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."projects" TO "anon";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."projects" TO "authenticated";
GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."projects" TO "service_role";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."site_ayarlari" TO "anon";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."site_ayarlari" TO "authenticated";
GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."site_ayarlari" TO "service_role";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."yayinlar" TO "anon";
GRANT REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."yayinlar" TO "authenticated";
GRANT REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."yayinlar" TO "service_role";

-- ============================================================
-- Public data
-- ============================================================

-- Data for "public"."admin_users"
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = '7a4fe8f2-1b97-47a5-88ee-ceeaa567463d'::uuid) THEN
    INSERT INTO "public"."admin_users" ("user_id", "display_name", "is_active", "created_at", "updated_at")
    VALUES ('7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', 'Ismail Butun', true, '2026-05-17T15:36:48.393Z', '2026-05-17T15:36:48.393Z')
    ON CONFLICT DO NOTHING;
  ELSE
    RAISE NOTICE 'Admin user 7a4fe8f2-1b97-47a5-88ee-ceeaa567463d auth.users icinde yok; public.admin_users satiri atlandi. Yeni projede admin kullaniciyi olusturup UUID ile ekleyin.';
  END IF;
END $$;

-- Data for "public"."announcements"
INSERT INTO "public"."announcements" ("id", "title", "content", "created_at", "is_published") VALUES ('69bec90c-ef38-40fa-9907-4cb666ec2e9d', 'SAÜ Milli Teknoloji Atölyesi''nde Bilim ve Teknoloji Haftası Programı', 'Sakarya Üniversitesi Milli Teknoloji Atölyesi''nde, 8-14 Mart Bilim ve Teknoloji Haftası kapsamında düzenlenen programda, teknoloji üretimi ve yapay zeka uygulamaları ele alındı.

8–14 Mart Bilim ve Teknoloji Haftası kapsamında Sakarya Üniversitesi Milli Teknoloji Atölyesi''nde düzenlenen programda, bilimsel üretim paketleri, üniversitelerin teknoloji geliştirmedeki rolü ve sanayide yapay zeka uygulamaları çeşitli oturumlarda seçildi. Programın sunumunda Rektör Yardımcıları Prof. Dr. Mehmet Barış Horzum, Prof. Dr. Halit Yaşar ve Prof. Konuşmalarda üniversitelerin teknolojik gelişmesindeki rol ile araştırma üniversitesi kapsamı çerçevesinde yürütülen çalışmalar değerlendirildi. Ayrıca üniversite–sanayi birleşiyor, uygulamalı eğitim ve gençlerin araştırma kültürünün gelişmesinin önemi vurgulanıyor.

Milli Teknoloji Atölyesi''nin sunduğu olanaklarla anlatıldı

Açılış bölümünde ayrıca Sakarya Üniversitesi bünyesinde kurulan Milli Teknoloji Atölyesinin üniversitenin araştırma ve teknoloji geliştirme vizyonu bölgesinin yeri seçildi. Atölyenin projelerinin gelişmesiyle aktifleşmesini destekleyen bir merkez olarak önemli bir rolün üstlendiği ifade edildi.

Program kapsamında Sakarya Üniversitesi Milli Teknoloji Atölyesi tanıtım sunumu gerçekleştirildi. Sunumda atölyenin kuruluş amacı, dağıtılan dağıtımlar ve dağıtım olanakları hakkında bilgi verildi. Tanıtımda atölyenin gençlerin proje geliştirme yeteneklerini artırmayı, teknoloji üretimine aktif katılımlarını sağlamayı ve disiplinler arası çalışmaları teşvik etmeyi hedeflediği belirtildi. Ayrıca atölyede yönetilen robotik, elektronik ve yazılımsal işbirliği ile uygulamalı eğitim paketlerine nasıl dahil edilebilecekleri hakkında bilgilendirme yapıldı.

Sanayide yeni trendler ve yapay zeka konuşuldu

Programın son bölümünde ise TÜBİTAK Bilim Söyleşisi adlı “Sanayide Yeni Trendler ve Yapay Zeka Uygulamaları” yer alıyor. Söyleşide yapay zekâ teknolojilerinin sanayi üretim geniş kullanım alanları ele alınırken, Endüstri 4.0 kapsamında veri analitiği, makine öğrenmesi ve otomasyon ölçümleri üretim değişimlerine katkıları değerlendirildi. Ayrıca otomasyon endüstriyelin önemli bileşenlerinden biri olan PLC sistemleri ve programlama boyutları hakkında bilgi verildi.

Söyleşide akıllı üretim sistemleri, kalite kontrol, bakım tahmin ve üretim çeşitliliği gibi alanlarda yapay zeka ve otomasyon teknolojilerinin sunduğu imkanlar da mevcutla paylaşıldı.', '2026-06-02T13:11:36.448Z', true) ON CONFLICT DO NOTHING;

-- Data for "public"."ekip"
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('f36a05b0-6402-42d0-b778-7da968720a77', 'İsmail Bütün', 'LİDER', 'Yazılım', 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-05-21T11:58:41.464Z', 4) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('b5854c91-9da8-4860-8598-6529a39b619c', 'Serhat Har', 'Developer', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-05-21T11:59:23.391Z', 3) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('e8251215-e599-4fb1-8651-45014d9d8fb8', 'Amro Baseet', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:12:05.545Z', 1) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('fea17365-a556-4a8e-80f9-dd797b1a0f2b', 'Moataz Armash', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:16:58.492Z', 2) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('f8b12e72-af04-4e98-a562-92b366a91509', 'Gökdeniz Demir', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:11:29.971Z', 2) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('a23aeb13-95a8-4589-966b-2226ea0ef78e', 'Sevcan Bayraktar', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:14:58.512Z', 2) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('b292ceb7-fc4b-48e6-989f-065dec9c96f3', 'Sarah Al Musawi', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:15:59.638Z', 2) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('09a797ca-e1e1-47a1-9390-1972902d58d5', 'Doğukan Ardahan', 'Developer', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:12:29.855Z', 2) ON CONFLICT DO NOTHING;

-- Data for "public"."ortaklar"
INSERT INTO "public"."ortaklar" ("id", "name", "icon", "url", "sort_order", "is_published", "created_at") VALUES ('523698d4-9a1f-4875-bbe0-6dc56829b779', 'TÜBİTAK', 'fa-atom', 'https://tubitak.gov.tr/', 1, true, '2026-05-16T18:00:27.359Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."ortaklar" ("id", "name", "icon", "url", "sort_order", "is_published", "created_at") VALUES ('8422d23b-dec0-46c1-b95f-496a3dd7d01b', 'SARGEM', 'fa-graduation-cap', '#', 6, true, '2026-05-16T18:00:27.359Z') ON CONFLICT DO NOTHING;

-- Data for "public"."projects"
INSERT INTO "public"."projects" ("id", "title", "description", "image_url", "github_url", "demo_url", "created_at", "is_published", "status", "funder", "date_range", "progress_pct") VALUES ('257d0641-2ae0-4ad8-9188-4ef380afb2b9', 'IoTNefes', 'Esentepe Kampüsü''nde hava kalitesini izleyen IoT (Nesnelerin İnterneti) tabanlı bir erken uyarı sistemidir. Projenin öne çıkan detayları şunlardır:Amaç: Kampüs içindeki hava kalitesini anlık olarak ölçmek, sürdürülebilirliğe katkı sağlamak ve riskli durumlarda yetkilileri uyarmak.Ölçülen Parametreler: Sıcaklık, nem, karbondioksit (CO₂) ve partikül madde değerleri.Çalışma Prensibi: Çeşitli noktalara yerleştirilen sensörler, verileri kablosuz altyapı ile merkezi bir ağa aktarır.', NULL, NULL, NULL, '2026-06-25T13:36:04.981Z', true, 'done', 'tübitak', '15/03/2025 - 15/08/2025', 100) ON CONFLICT DO NOTHING;

-- Data for "public"."site_ayarlari"
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('lab_adres', 'Sakarya Üniversitesi, Bilgisayar ve Bilişim Bilimleri Fakültesi, Esentepe Kampüsü, 54187 Serdivan / Sakarya', '2026-05-16T18:00:27.254Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('lab_telefon', '+90 (264) 295 XXXX', '2026-05-16T18:00:27.254Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('lab_calisma_saatleri', 'Pazartesi – Cuma: 09:00 – 17:00', '2026-05-16T18:00:27.254Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('kurulis_yili', '2025', '2026-05-16T18:00:27.254Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('lab_email', 'ibutun@sakarya.edu.tr', '2026-05-17T15:52:26.825Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('is_ortagi_sayisi', '2', '2026-05-17T16:15:34.055Z') ON CONFLICT DO NOTHING;

-- Restore bundle completed.
