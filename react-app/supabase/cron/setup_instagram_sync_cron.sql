-- Run manually after the Edge Function has been deployed and both Vault secrets
-- named below have been created. This file contains no deploy-time secret values.
--
-- Required Vault names:
--   instagram_sync_project_url  e.g. https://PROJECT_REF.supabase.co
--   instagram_sync_secret       same value as Edge secret INSTAGRAM_SYNC_SECRET

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
declare
  old_job_id bigint;
begin
  if not exists (
    select 1 from vault.decrypted_secrets
    where name = 'instagram_sync_project_url'
      and nullif(decrypted_secret, '') is not null
  ) then
    raise exception 'Vault secret instagram_sync_project_url is missing';
  end if;
  if not exists (
    select 1 from vault.decrypted_secrets
    where name = 'instagram_sync_secret'
      and nullif(decrypted_secret, '') is not null
  ) then
    raise exception 'Vault secret instagram_sync_secret is missing';
  end if;

  select jobid into old_job_id
  from cron.job
  where jobname = 'instagram-announcement-sync';

  if old_job_id is not null then
    perform cron.unschedule(old_job_id);
  end if;

  perform cron.schedule(
    'instagram-announcement-sync',
    '*/15 * * * *',
    $job$
      select net.http_post(
        url := rtrim((
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'instagram_sync_project_url'
          limit 1
        ), '/') || '/functions/v1/instagram-sync',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-instagram-sync-secret', (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'instagram_sync_secret'
            limit 1
          )
        ),
        body := '{"trigger":"cron"}'::jsonb,
        timeout_milliseconds := 60000
      );
    $job$
  );
end;
$$;
