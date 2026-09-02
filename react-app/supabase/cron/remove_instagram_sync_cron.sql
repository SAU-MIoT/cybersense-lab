-- Operational rollback for the schedule only. It does not drop application data.
do $$
declare
  target_job_id bigint;
begin
  select jobid into target_job_id
  from cron.job
  where jobname = 'instagram-announcement-sync';

  if target_job_id is not null then
    perform cron.unschedule(target_job_id);
  end if;
end;
$$;

