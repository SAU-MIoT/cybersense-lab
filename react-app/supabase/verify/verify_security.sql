-- Read-only post-migration checks. Every assertion must return ok = true.
WITH roles(role_name) AS (VALUES ('anon'::name), ('authenticated'::name)),
tables(table_name) AS (VALUES ('admin_users'::name),('announcements'::name),('arastirma_alanlari'::name),('content_images'::name),('ekip'::name),('etkinlikler'::name),('oduller'::name),('ortaklar'::name),('projects'::name),('site_ayarlari'::name),('yayinlar'::name)),
forbidden(privilege_type) AS (VALUES ('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER'))
SELECT 'browser_roles_have_no_direct_write_or_ddl_privileges' AS assertion,
  NOT EXISTS (SELECT 1 FROM roles r CROSS JOIN tables t CROSS JOIN forbidden p WHERE has_table_privilege(r.role_name, format('public.%I',t.table_name),p.privilege_type)) AS ok;

WITH tables(table_name) AS (VALUES ('announcements'::name),('arastirma_alanlari'::name),('content_images'::name),('ekip'::name),('etkinlikler'::name),('oduller'::name),('ortaklar'::name),('projects'::name),('site_ayarlari'::name),('yayinlar'::name))
SELECT 'both_browser_roles_can_select_public_tables' AS assertion,
  bool_and(has_table_privilege('anon',format('public.%I',table_name),'SELECT') AND has_table_privilege('authenticated',format('public.%I',table_name),'SELECT')) AS ok FROM tables;

SELECT 'browser_roles_cannot_read_admin_users' AS assertion,
  NOT has_table_privilege('anon','public.admin_users','SELECT') AND NOT has_table_privilege('authenticated','public.admin_users','SELECT') AS ok;

WITH tables(table_name) AS (VALUES ('admin_users'),('announcements'),('arastirma_alanlari'),('content_images'),('ekip'),('etkinlikler'),('oduller'),('ortaklar'),('projects'),('site_ayarlari'),('yayinlar'))
SELECT 'all_scoped_tables_have_rls_enabled' AS assertion,
  bool_and(c.relrowsecurity) AS ok
FROM tables t JOIN pg_catalog.pg_class c ON c.oid = format('public.%I', t.table_name)::regclass;

WITH expected(tab,pol) AS (VALUES
 ('announcements','Anyone can read published announcements'),('arastirma_alanlari','public_read_arastirma_alanlari'),
 ('content_images','public_read_content_images'),('ekip','public_read_ekip'),('etkinlikler','public_read_etkinlikler'),
 ('oduller','public_read_oduller'),('ortaklar','public_read_ortaklar'),('projects','Anyone can read published projects'),
 ('site_ayarlari','public_read_site_ayarlari'),('yayinlar','public_read_yayinlar'))
SELECT 'public_select_policies_cover_both_browser_roles' AS assertion,
  count(*)=(SELECT count(*) FROM expected) AS ok FROM expected e JOIN pg_catalog.pg_policies p
  ON p.schemaname='public' AND p.tablename=e.tab AND p.policyname=e.pol AND p.cmd='SELECT' AND p.roles @> ARRAY['anon','authenticated']::name[];

WITH rpc(sig) AS (VALUES ('public.admin_create_record(text,jsonb)'),('public.admin_delete_record(text,text)'),
 ('public.admin_list_record_images(text,uuid[])'),('public.admin_list_records(text)'),('public.admin_me()'),
 ('public.admin_set_record_images(text,uuid,jsonb)'),('public.admin_update_record(text,text,jsonb)'))
SELECT 'external_admin_rpcs_are_authenticated_only' AS assertion,
 bool_and(has_function_privilege('authenticated',sig,'EXECUTE') AND NOT has_function_privilege('anon',sig,'EXECUTE')) AS ok FROM rpc;

WITH helper(sig) AS (VALUES ('public.admin_assert_image_entity(text)'),('public.admin_get_table_meta(text)'),
 ('public.admin_require_admin()'),('public.admin_validate_json_keys(jsonb,text[])'),('public.rls_auto_enable()'))
SELECT 'admin_helpers_are_not_publicly_executable' AS assertion,
 bool_and(NOT has_function_privilege('anon',sig,'EXECUTE') AND NOT has_function_privilege('authenticated',sig,'EXECUTE')) AS ok FROM helper;

SELECT 'admin_boolean_check_is_authenticated_only' AS assertion,
  has_function_privilege('authenticated','public.admin_is_admin()','EXECUTE')
  AND NOT has_function_privilege('anon','public.admin_is_admin()','EXECUTE') AS ok;

WITH expected(rel,con) AS (VALUES ('public.projects'::regclass,'projects_status_check'),('public.projects'::regclass,'projects_progress_pct_check'),
 ('public.ekip'::regclass,'ekip_priority_check'),('public.yayinlar'::regclass,'yayinlar_pub_type_check'),('public.yayinlar'::regclass,'yayinlar_pub_year_check'),
 ('public.oduller'::regclass,'oduller_year_check'),('public.oduller'::regclass,'oduller_color_scheme_check'))
SELECT 'domain_checks_exist_and_are_validated' AS assertion, count(*)=(SELECT count(*) FROM expected) AS ok
FROM expected e JOIN pg_catalog.pg_constraint c ON c.conrelid=e.rel AND c.conname=e.con AND c.contype='c' AND c.convalidated;

SELECT 'announcement_publish_date_exists' AS assertion, EXISTS (SELECT 1 FROM information_schema.columns
 WHERE table_schema='public' AND table_name='announcements' AND column_name='publish_date' AND data_type='timestamp with time zone' AND is_nullable='YES') AS ok;

SELECT 'no_orphan_content_images' AS assertion, NOT EXISTS (SELECT 1 FROM public.content_images ci WHERE
 (ci.entity_type='announcements' AND NOT EXISTS (SELECT 1 FROM public.announcements a WHERE a.id=ci.entity_id)) OR
 (ci.entity_type='projects' AND NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id=ci.entity_id)) OR
 (ci.entity_type='etkinlikler' AND NOT EXISTS (SELECT 1 FROM public.etkinlikler e WHERE e.id=ci.entity_id))) AS ok;

SELECT 'no_legacy_project_urls_in_content_images' AS assertion,
  NOT EXISTS (SELECT 1 FROM public.content_images WHERE image_url LIKE '%zyuj%') AS ok;

-- Also run from clients: anon/authenticated published reads, non-admin RPC 42501,
-- rejected out-of-domain writes in a rolled-back transaction, and this migration twice.
