-- Allow an authenticated admin to move content between the announcement and
-- event sections without losing the record id, publication state, or images.
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '120s';
SET LOCAL check_function_bodies = true;

CREATE OR REPLACE FUNCTION public.admin_move_record(
  p_source_table text,
  p_id text,
  p_target_table text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  PERFORM public.admin_require_admin();

  IF (p_source_table, p_target_table) NOT IN (
    ('announcements', 'etkinlikler'),
    ('etkinlikler', 'announcements')
  ) THEN
    RAISE EXCEPTION 'Unsupported display section move: % -> %', p_source_table, p_target_table
      USING ERRCODE = '22023';
  END IF;

  IF p_source_table = 'announcements' THEN
    INSERT INTO public.etkinlikler (
      id, title, description, event_date, location, is_published, created_at
    )
    SELECT
      id,
      title,
      content,
      COALESCE(publish_date, created_at, now()),
      NULL,
      is_published,
      created_at
    FROM public.announcements
    WHERE id = p_id::uuid;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Record not found' USING ERRCODE = '02000';
    END IF;

    UPDATE public.content_images
    SET entity_type = 'etkinlikler'
    WHERE entity_type = 'announcements'
      AND entity_id = p_id::uuid;

    DELETE FROM public.announcements WHERE id = p_id::uuid;

    SELECT to_jsonb(e) INTO v_result
    FROM public.etkinlikler e
    WHERE e.id = p_id::uuid;
  ELSE
    INSERT INTO public.announcements (
      id, title, content, publish_date, is_published, created_at
    )
    SELECT
      id,
      title,
      COALESCE(description, ''),
      event_date,
      is_published,
      created_at
    FROM public.etkinlikler
    WHERE id = p_id::uuid;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Record not found' USING ERRCODE = '02000';
    END IF;

    UPDATE public.content_images
    SET entity_type = 'announcements'
    WHERE entity_type = 'etkinlikler'
      AND entity_id = p_id::uuid;

    DELETE FROM public.etkinlikler WHERE id = p_id::uuid;

    SELECT to_jsonb(a) INTO v_result
    FROM public.announcements a
    WHERE a.id = p_id::uuid;
  END IF;

  RETURN v_result || jsonb_build_object('display_section', p_target_table);
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_move_record(text, text, text)
FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_move_record(text, text, text) TO authenticated;

COMMIT;
