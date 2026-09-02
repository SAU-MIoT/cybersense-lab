-- Instagram -> announcements database primitives.
-- Forward-only migration; existing announcement/admin policies are intentionally untouched.

create extension if not exists pgcrypto with schema extensions;

alter table public.announcements
  add column if not exists source_type text,
  add column if not exists source_external_id text,
  add column if not exists source_url text;

create unique index if not exists announcements_source_external_id_uidx
  on public.announcements (source_type, source_external_id)
  where source_type is not null and source_external_id is not null;

comment on column public.announcements.source_type is
  'Immutable origin metadata. Set by trusted import RPCs, not admin CRUD.';
comment on column public.announcements.source_external_id is
  'Immutable identifier assigned by the external source.';
comment on column public.announcements.source_url is
  'Immutable canonical URL supplied by the external source.';

create table if not exists public.instagram_imports (
  id uuid primary key default extensions.gen_random_uuid(),
  external_media_id text not null unique,
  media_type text not null,
  permalink text,
  media_timestamp timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'imported', 'retry', 'skipped')),
  announcement_id uuid references public.announcements(id) on delete set null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text check (last_error is null or char_length(last_error) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists instagram_imports_retry_idx
  on public.instagram_imports (updated_at, media_timestamp)
  where status = 'retry';

create table if not exists public.instagram_sync_runs (
  id uuid primary key default extensions.gen_random_uuid(),
  trigger text not null check (trigger in ('cron', 'manual')),
  status text not null default 'running'
    check (status in ('running', 'success', 'partial', 'failed', 'already_running')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  discovered_count integer not null default 0 check (discovered_count >= 0),
  imported_count integer not null default 0 check (imported_count >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  retry_count integer not null default 0 check (retry_count >= 0),
  last_error text check (last_error is null or char_length(last_error) <= 2000),
  check (
    (status = 'running' and finished_at is null)
    or (status <> 'running' and finished_at is not null)
  )
);

create index if not exists instagram_sync_runs_started_at_idx
  on public.instagram_sync_runs (started_at desc);

create table if not exists public.instagram_sync_state (
  singleton_key boolean primary key default true check (singleton_key),
  initial_sync_completed boolean not null default false,
  last_seen_media_id text,
  last_seen_media_timestamp timestamptz,
  last_success_at timestamptz,
  lock_token uuid,
  locked_until timestamptz,
  token_expires_at timestamptz,
  check (
    (lock_token is null and locked_until is null)
    or (lock_token is not null and locked_until is not null)
  )
);

insert into public.instagram_sync_state (singleton_key)
values (true)
on conflict (singleton_key) do nothing;

alter table public.instagram_imports enable row level security;
alter table public.instagram_sync_runs enable row level security;
alter table public.instagram_sync_state enable row level security;

-- No client policies are created. The service role bypasses RLS, while authenticated
-- admins receive a deliberately redacted projection through one RPC below.
revoke all on table public.instagram_imports from public, anon, authenticated;
revoke all on table public.instagram_sync_runs from public, anon, authenticated;
revoke all on table public.instagram_sync_state from public, anon, authenticated;
grant all on table public.instagram_imports to service_role;
grant all on table public.instagram_sync_runs to service_role;
grant all on table public.instagram_sync_state to service_role;

create or replace function public.set_instagram_import_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_instagram_import_updated_at on public.instagram_imports;
create trigger set_instagram_import_updated_at
before update on public.instagram_imports
for each row execute function public.set_instagram_import_updated_at();

-- Existing admin CRUD functions run as SECURITY DEFINER. JWT claims still identify
-- their caller, so this trigger keeps source metadata read-only for browser clients.
create or replace function public.protect_announcement_source_metadata()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  caller_role text := coalesce(auth.role(), '');
begin
  if caller_role in ('anon', 'authenticated') then
    if tg_op = 'INSERT' and (
      new.source_type is not null
      or new.source_external_id is not null
      or new.source_url is not null
    ) then
      raise exception 'announcement source metadata is read-only';
    elsif tg_op = 'UPDATE' and (
      new.source_type is distinct from old.source_type
      or new.source_external_id is distinct from old.source_external_id
      or new.source_url is distinct from old.source_url
    ) then
      raise exception 'announcement source metadata is read-only';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_announcement_source_metadata on public.announcements;
create trigger protect_announcement_source_metadata
before insert or update on public.announcements
for each row execute function public.protect_announcement_source_metadata();

create or replace function public.instagram_sanitize_error(p_error text)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  value text := nullif(btrim(p_error), '');
begin
  if value is null then
    return null;
  end if;
  value := regexp_replace(
    value,
    '(?i)(bearer[[:space:]]+)[A-Za-z0-9._~+/=-]+',
    E'\\1[REDACTED]',
    'g'
  );
  value := regexp_replace(
    value,
    '(?i)((access_token|api[_-]?key|secret|token)[[:space:]]*[:=][[:space:]]*)[^[:space:]&,;]+',
    E'\\1[REDACTED]',
    'g'
  );
  return left(value, 2000);
end;
$$;

create or replace function public.instagram_require_service_role()
returns void
language plpgsql
stable
set search_path = public, pg_temp
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.claim_instagram_sync_run(
  p_trigger text,
  p_lock_token uuid,
  p_lease_seconds integer
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  acquired boolean := false;
  run_id uuid;
  state_row public.instagram_sync_state%rowtype;
begin
  perform public.instagram_require_service_role();
  if p_trigger not in ('cron', 'manual') then
    raise exception 'invalid sync trigger';
  end if;
  if p_lock_token is null then
    raise exception 'lock token is required';
  end if;
  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 then
    raise exception 'lease seconds must be between 30 and 3600';
  end if;

  update public.instagram_sync_state
  set lock_token = p_lock_token,
      locked_until = clock_timestamp() + make_interval(secs => p_lease_seconds)
  where singleton_key = true
    and (locked_until is null or locked_until <= clock_timestamp())
  returning * into state_row;

  acquired := found;
  if not acquired then
    select * into strict state_row
    from public.instagram_sync_state
    where singleton_key = true;
  end if;

  insert into public.instagram_sync_runs (trigger, status, finished_at)
  values (
    p_trigger,
    case when acquired then 'running' else 'already_running' end,
    case when acquired then null else clock_timestamp() end
  )
  returning id into run_id;

  return json_build_object(
    'acquired', acquired,
    'run_id', run_id,
    'initial_sync_completed', state_row.initial_sync_completed,
    'last_seen_media_id', state_row.last_seen_media_id,
    'last_seen_media_timestamp', state_row.last_seen_media_timestamp
  );
end;
$$;

create or replace function public.finish_instagram_sync_run(
  p_run_id uuid,
  p_lock_token uuid,
  p_status text,
  p_discovered_count integer,
  p_imported_count integer,
  p_skipped_count integer,
  p_retry_count integer,
  p_last_error text,
  p_initial_sync_completed boolean,
  p_last_seen_media_id text,
  p_last_seen_media_timestamp timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.instagram_require_service_role();
  if p_status not in ('success', 'partial', 'failed') then
    raise exception 'invalid terminal sync status';
  end if;
  if p_discovered_count is null
     or p_imported_count is null
     or p_skipped_count is null
     or p_retry_count is null
     or least(p_discovered_count, p_imported_count, p_skipped_count, p_retry_count) < 0 then
    raise exception 'sync counters cannot be negative';
  end if;
  if p_initial_sync_completed is null then
    raise exception 'initial sync completion state is required';
  end if;

  update public.instagram_sync_state
  set initial_sync_completed = case
        when p_status in ('success', 'partial') then p_initial_sync_completed
        else initial_sync_completed
      end,
      last_seen_media_id = case
        when p_status in ('success', 'partial') then p_last_seen_media_id
        else last_seen_media_id
      end,
      last_seen_media_timestamp = case
        when p_status in ('success', 'partial') then p_last_seen_media_timestamp
        else last_seen_media_timestamp
      end,
      last_success_at = case when p_status = 'success' then clock_timestamp() else last_success_at end,
      lock_token = null,
      locked_until = null
  where singleton_key = true and lock_token = p_lock_token;

  if not found then
    raise exception 'sync lease is not owned by this caller' using errcode = '55000';
  end if;

  update public.instagram_sync_runs
  set status = p_status,
      finished_at = clock_timestamp(),
      discovered_count = p_discovered_count,
      imported_count = p_imported_count,
      skipped_count = p_skipped_count,
      retry_count = p_retry_count,
      last_error = public.instagram_sanitize_error(p_last_error)
  where id = p_run_id and status = 'running';

  if not found then
    raise exception 'running sync run not found' using errcode = '55000';
  end if;
end;
$$;

create or replace function public.stage_initial_instagram_imports(
  p_lock_token uuid,
  p_last_seen_media_id text,
  p_last_seen_media_timestamp timestamptz,
  p_items jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  item_count integer;
begin
  perform public.instagram_require_service_role();
  if p_lock_token is null then
    raise exception 'lock token is required';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'items must be a JSON array';
  end if;

  item_count := jsonb_array_length(p_items);
  if item_count > 2500 or octet_length(p_items::text) > 1048576 then
    raise exception 'initial import batch exceeds the allowed size';
  end if;
  if (p_last_seen_media_id is null) <> (p_last_seen_media_timestamp is null) then
    raise exception 'last-seen media id and timestamp must both be null or both be present';
  end if;
  if (item_count = 0 and p_last_seen_media_id is not null)
     or (item_count > 0 and p_last_seen_media_id is null) then
    raise exception 'empty batches require a null watermark and non-empty batches require a watermark';
  end if;
  if p_last_seen_media_id is not null and nullif(btrim(p_last_seen_media_id), '') is null then
    raise exception 'last-seen media id cannot be blank';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where jsonb_typeof(value) <> 'object'
       or jsonb_typeof(value -> 'external_media_id') is distinct from 'string'
       or nullif(btrim(value ->> 'external_media_id'), '') is null
       or jsonb_typeof(value -> 'media_type') is distinct from 'string'
       or nullif(btrim(value ->> 'media_type'), '') is null
       or jsonb_typeof(value -> 'media_timestamp') is distinct from 'string'
       or nullif(btrim(value ->> 'media_timestamp'), '') is null
       or (value ->> 'media_timestamp')::timestamptz is null
       or jsonb_typeof(value -> 'status') is distinct from 'string'
       or coalesce(value ->> 'status', '') not in ('pending', 'skipped')
       or ((value -> 'permalink') is not null and jsonb_typeof(value -> 'permalink') not in ('string', 'null'))
       or ((value -> 'last_error') is not null and jsonb_typeof(value -> 'last_error') not in ('string', 'null'))
       or value - array[
         'external_media_id',
         'media_type',
         'permalink',
         'media_timestamp',
         'status',
         'last_error'
       ]::text[] <> '{}'::jsonb
  ) then
    raise exception 'initial import item is missing a valid field or status';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    group by value ->> 'external_media_id'
    having count(*) > 1
  ) then
    raise exception 'initial import batch contains duplicate external media ids';
  end if;
  if (
    select count(*)
    from jsonb_array_elements(p_items) as item(value)
    where value ->> 'status' = 'pending'
  ) > 4 then
    raise exception 'initial import batch cannot contain more than four pending items';
  end if;
  if item_count > 0 and not exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where value ->> 'external_media_id' = p_last_seen_media_id
      and (value ->> 'media_timestamp')::timestamptz = p_last_seen_media_timestamp
  ) then
    raise exception 'initial import watermark must identify an item in the staged batch';
  end if;

  -- Locking the singleton row keeps lease ownership stable until the staged rows
  -- and watermark commit together.
  perform 1
  from public.instagram_sync_state
  where singleton_key = true
    and lock_token = p_lock_token
    and locked_until > clock_timestamp()
  for update;

  if not found then
    raise exception 'an active owned sync lease is required' using errcode = '55000';
  end if;

  insert into public.instagram_imports (
    external_media_id,
    media_type,
    permalink,
    media_timestamp,
    status,
    attempt_count,
    last_error
  )
  select
    value ->> 'external_media_id',
    value ->> 'media_type',
    nullif(value ->> 'permalink', ''),
    (value ->> 'media_timestamp')::timestamptz,
    value ->> 'status',
    0,
    public.instagram_sanitize_error(value ->> 'last_error')
  from jsonb_array_elements(p_items) as item(value)
  on conflict (external_media_id) do update
  set media_type = excluded.media_type,
      permalink = excluded.permalink,
      media_timestamp = excluded.media_timestamp,
      status = excluded.status,
      last_error = excluded.last_error
  where instagram_imports.status not in ('imported', 'skipped');

  update public.instagram_sync_state
  set last_seen_media_id = p_last_seen_media_id,
      last_seen_media_timestamp = p_last_seen_media_timestamp
  where singleton_key = true and lock_token = p_lock_token;

  if not found then
    raise exception 'sync lease ownership changed while staging' using errcode = '55000';
  end if;
end;
$$;

create or replace function public.import_instagram_announcement(
  p_external_media_id text,
  p_media_type text,
  p_permalink text,
  p_media_timestamp timestamptz,
  p_title text,
  p_content text,
  p_images jsonb
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  import_row public.instagram_imports%rowtype;
  new_announcement_id uuid;
  announcement_created boolean := false;
  image_item jsonb;
  image_index bigint;
begin
  perform public.instagram_require_service_role();
  if nullif(btrim(p_external_media_id), '') is null
     or nullif(btrim(p_media_type), '') is null
     or p_media_timestamp is null
     or nullif(btrim(p_title), '') is null
     or nullif(btrim(p_content), '') is null then
    raise exception 'external id, media type, timestamp, title, and content are required';
  end if;
  if p_media_type not in ('IMAGE', 'CAROUSEL_ALBUM') then
    raise exception 'only image media can be imported';
  end if;
  if char_length(p_title) > 120 then
    raise exception 'announcement title exceeds 120 characters';
  end if;
  if jsonb_typeof(p_images) <> 'array'
     or jsonb_array_length(p_images) = 0
     or jsonb_array_length(p_images) > 20 then
    raise exception 'images must be a non-empty JSON array of at most 20 items';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_images) as item(value)
    where jsonb_typeof(value) <> 'object'
       or nullif(btrim(coalesce(value ->> 'image_url', value ->> 'public_url')), '') is null
  ) then
    raise exception 'each image must contain a non-empty public_url or image_url';
  end if;

  insert into public.instagram_imports (
    external_media_id, media_type, permalink, media_timestamp, status
  ) values (
    p_external_media_id, p_media_type, p_permalink, p_media_timestamp, 'pending'
  )
  on conflict (external_media_id) do nothing;

  select * into strict import_row
  from public.instagram_imports
  where external_media_id = p_external_media_id
  for update;

  if import_row.status in ('imported', 'skipped') then
    return json_build_object(
      'created', false,
      'imported', import_row.status = 'imported',
      'status', import_row.status,
      'announcement_id', import_row.announcement_id
    );
  end if;

  select id into new_announcement_id
  from public.announcements
  where source_type = 'instagram' and source_external_id = p_external_media_id;

  if new_announcement_id is null then
    insert into public.announcements (
      title,
      content,
      publish_date,
      is_published,
      source_type,
      source_external_id,
      source_url
    ) values (
      btrim(p_title),
      p_content,
      p_media_timestamp,
      true,
      'instagram',
      p_external_media_id,
      p_permalink
    )
    returning id into new_announcement_id;
    announcement_created := true;

    for image_item, image_index in
      select value, ordinality
      from jsonb_array_elements(p_images) with ordinality
    loop
      insert into public.content_images (
        entity_type,
        entity_id,
        image_url,
        alt_text,
        sort_order,
        is_published
      ) values (
        'announcements',
        new_announcement_id,
        coalesce(image_item ->> 'image_url', image_item ->> 'public_url'),
        coalesce(image_item ->> 'alt_text', ''),
        (image_index - 1)::integer,
        true
      );
    end loop;
  end if;

  update public.instagram_imports
  set media_type = p_media_type,
      permalink = p_permalink,
      media_timestamp = p_media_timestamp,
      status = 'imported',
      announcement_id = new_announcement_id,
      attempt_count = greatest(attempt_count, 1),
      last_error = null
  where id = import_row.id;

  return json_build_object(
    'created', announcement_created,
    'imported', true,
    'status', 'imported',
    'announcement_id', new_announcement_id
  );
end;
$$;

create or replace function public.mark_instagram_import(
  p_external_media_id text,
  p_media_type text,
  p_permalink text,
  p_media_timestamp timestamptz,
  p_status text,
  p_last_error text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.instagram_require_service_role();
  if nullif(btrim(p_external_media_id), '') is null
     or nullif(btrim(p_media_type), '') is null
     or p_media_timestamp is null then
    raise exception 'external id, media type, and timestamp are required';
  end if;
  if p_status not in ('pending', 'retry', 'skipped') then
    raise exception 'mark status must be pending, retry, or skipped';
  end if;

  insert into public.instagram_imports (
    external_media_id,
    media_type,
    permalink,
    media_timestamp,
    status,
    attempt_count,
    last_error
  ) values (
    p_external_media_id,
    p_media_type,
    p_permalink,
    p_media_timestamp,
    p_status,
    case when p_status = 'pending' then 1 else 0 end,
    public.instagram_sanitize_error(p_last_error)
  )
  on conflict (external_media_id) do update
  set media_type = excluded.media_type,
      permalink = excluded.permalink,
      media_timestamp = excluded.media_timestamp,
      status = case
        when instagram_imports.status in ('imported', 'skipped') then instagram_imports.status
        else excluded.status
      end,
      attempt_count = case
        when instagram_imports.status in ('imported', 'skipped') then instagram_imports.attempt_count
        when excluded.status = 'pending' then instagram_imports.attempt_count + 1
        else instagram_imports.attempt_count
      end,
      last_error = case
        when instagram_imports.status in ('imported', 'skipped') then instagram_imports.last_error
        else excluded.last_error
      end;
end;
$$;

create or replace function public.admin_get_instagram_sync_status()
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  state_row public.instagram_sync_state%rowtype;
  last_run json;
begin
  if auth.uid() is null or not exists (
    select 1 from public.admin_users where user_id = auth.uid()
  ) then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  select * into strict state_row
  from public.instagram_sync_state
  where singleton_key = true;

  select json_build_object(
    'id', id,
    'trigger', trigger,
    'status', status,
    'started_at', started_at,
    'finished_at', finished_at,
    'discovered_count', discovered_count,
    'imported_count', imported_count,
    'skipped_count', skipped_count,
    'retry_count', retry_count,
    'last_error', last_error
  )
  into last_run
  from public.instagram_sync_runs
  order by started_at desc
  limit 1;

  return json_build_object(
    'initial_sync_completed', state_row.initial_sync_completed,
    'last_seen_media_id', state_row.last_seen_media_id,
    'last_seen_media_timestamp', state_row.last_seen_media_timestamp,
    'last_success_at', state_row.last_success_at,
    'token_expires_at', state_row.token_expires_at,
    'is_running', coalesce(state_row.locked_until > clock_timestamp(), false),
    'locked_until', case
      when state_row.locked_until > clock_timestamp() then state_row.locked_until
      else null
    end,
    'last_run', last_run
  );
end;
$$;

-- PostgreSQL grants EXECUTE to PUBLIC on new functions unless explicitly revoked.
revoke all on function public.set_instagram_import_updated_at() from public, anon, authenticated;
revoke all on function public.protect_announcement_source_metadata() from public, anon, authenticated;
revoke all on function public.instagram_sanitize_error(text) from public, anon, authenticated;
revoke all on function public.instagram_require_service_role() from public, anon, authenticated;
revoke all on function public.claim_instagram_sync_run(text, uuid, integer) from public, anon, authenticated;
revoke all on function public.finish_instagram_sync_run(uuid, uuid, text, integer, integer, integer, integer, text, boolean, text, timestamptz) from public, anon, authenticated;
revoke all on function public.stage_initial_instagram_imports(uuid, text, timestamptz, jsonb) from public, anon, authenticated;
revoke all on function public.import_instagram_announcement(text, text, text, timestamptz, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.mark_instagram_import(text, text, text, timestamptz, text, text) from public, anon, authenticated;
revoke all on function public.admin_get_instagram_sync_status() from public, anon;

grant execute on function public.claim_instagram_sync_run(text, uuid, integer) to service_role;
grant execute on function public.finish_instagram_sync_run(uuid, uuid, text, integer, integer, integer, integer, text, boolean, text, timestamptz) to service_role;
grant execute on function public.stage_initial_instagram_imports(uuid, text, timestamptz, jsonb) to service_role;
grant execute on function public.import_instagram_announcement(text, text, text, timestamptz, text, text, jsonb) to service_role;
grant execute on function public.mark_instagram_import(text, text, text, timestamptz, text, text) to service_role;
grant execute on function public.admin_get_instagram_sync_status() to authenticated;

comment on function public.claim_instagram_sync_run(text, uuid, integer) is
  'Atomically acquires a bounded Instagram sync lease and records the run.';
comment on function public.finish_instagram_sync_run(uuid, uuid, text, integer, integer, integer, integer, text, boolean, text, timestamptz) is
  'Atomically persists sync outcome/watermark and releases an owned lease.';
comment on function public.stage_initial_instagram_imports(uuid, text, timestamptz, jsonb) is
  'Stages the bounded initial batch and its watermark atomically under an owned lease.';
comment on function public.import_instagram_announcement(text, text, text, timestamptz, text, text, jsonb) is
  'Service-role-only idempotent transaction for announcement plus ordered images.';
comment on function public.admin_get_instagram_sync_status() is
  'Admin-only redacted sync state; never returns lock tokens or application secrets.';
