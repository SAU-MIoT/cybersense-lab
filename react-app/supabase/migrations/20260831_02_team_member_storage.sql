BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-member-images',
  'team-member-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS admin_insert_team_member_images ON storage.objects;
DROP POLICY IF EXISTS admin_update_team_member_images ON storage.objects;
DROP POLICY IF EXISTS admin_delete_team_member_images ON storage.objects;

CREATE POLICY admin_insert_team_member_images
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-member-images'
  AND (storage.foldername(name))[1] = 'team-members'
  AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
  AND public.admin_is_admin()
);

CREATE POLICY admin_update_team_member_images
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'team-member-images'
  AND (storage.foldername(name))[1] = 'team-members'
  AND public.admin_is_admin()
)
WITH CHECK (
  bucket_id = 'team-member-images'
  AND (storage.foldername(name))[1] = 'team-members'
  AND public.admin_is_admin()
);

CREATE POLICY admin_delete_team_member_images
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'team-member-images'
  AND (storage.foldername(name))[1] = 'team-members'
  AND public.admin_is_admin()
);

COMMIT;
