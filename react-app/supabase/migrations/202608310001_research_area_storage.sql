BEGIN;

-- Research-area visuals are public site assets. Only active application admins
-- may create or remove objects under the dedicated folder.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'research-area-images',
  'research-area-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Some existing Storage policies use this boolean helper directly. Calling it
-- only reveals whether the current JWT belongs to an active admin; it does not
-- grant table access or perform a write. Without EXECUTE, PostgreSQL aborts the
-- policy evaluation before it can return true for an admin.
REVOKE ALL ON FUNCTION public.admin_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_can_manage_research_images()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
      AND au.is_active = true
  );
$function$;

REVOKE ALL ON FUNCTION public.admin_can_manage_research_images() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_can_manage_research_images() TO authenticated;

DROP POLICY IF EXISTS admin_insert_research_images ON storage.objects;
DROP POLICY IF EXISTS admin_update_research_images ON storage.objects;
DROP POLICY IF EXISTS admin_delete_research_images ON storage.objects;

CREATE POLICY admin_insert_research_images
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'research-area-images'
  AND (storage.foldername(name))[1] = 'research-areas'
  AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
  AND public.admin_can_manage_research_images()
);

CREATE POLICY admin_update_research_images
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'research-area-images'
  AND (storage.foldername(name))[1] = 'research-areas'
  AND public.admin_can_manage_research_images()
)
WITH CHECK (
  bucket_id = 'research-area-images'
  AND (storage.foldername(name))[1] = 'research-areas'
  AND public.admin_can_manage_research_images()
);

CREATE POLICY admin_delete_research_images
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'research-area-images'
  AND (storage.foldername(name))[1] = 'research-areas'
  AND public.admin_can_manage_research_images()
);

COMMIT;
