-- Run with a privileged SQL role after migrations. Success returns one summary row;
-- any missing security or schema invariant raises an exception.

do $$
declare
  table_name text;
  function_signature text;
begin
  foreach table_name in array array[
    'instagram_imports',
    'instagram_sync_runs',
    'instagram_sync_state'
  ] loop
    if to_regclass('public.' || table_name) is null then
      raise exception 'missing table: public.%', table_name;
    end if;

    if not exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = table_name
        and c.relrowsecurity
    ) then
      raise exception 'RLS is not enabled on public.%', table_name;
    end if;

    if has_table_privilege('anon', 'public.' || table_name, 'select')
       or has_table_privilege('anon', 'public.' || table_name, 'insert')
       or has_table_privilege('authenticated', 'public.' || table_name, 'select')
       or has_table_privilege('authenticated', 'public.' || table_name, 'insert')
       or has_table_privilege('authenticated', 'public.' || table_name, 'update')
       or has_table_privilege('authenticated', 'public.' || table_name, 'delete') then
      raise exception 'client role has direct privileges on public.%', table_name;
    end if;
  end loop;

  if not exists (
    select 1
    from pg_attribute
    where attrelid = 'public.announcements'::regclass
      and attname = 'source_type'
      and not attisdropped
  ) or not exists (
    select 1
    from pg_attribute
    where attrelid = 'public.announcements'::regclass
      and attname = 'source_external_id'
      and not attisdropped
  ) or not exists (
    select 1
    from pg_attribute
    where attrelid = 'public.announcements'::regclass
      and attname = 'source_url'
      and not attisdropped
  ) then
    raise exception 'announcement source columns are incomplete';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'announcements_source_external_id_uidx'
      and indexdef ilike '%unique%'
      and indexdef ilike '%where%'
  ) then
    raise exception 'partial source unique index is missing';
  end if;

  foreach function_signature in array array[
    'public.claim_instagram_sync_run(text,uuid,integer)',
    'public.finish_instagram_sync_run(uuid,uuid,text,integer,integer,integer,integer,text,boolean,text,timestamp with time zone)',
    'public.stage_initial_instagram_imports(uuid,text,timestamp with time zone,jsonb)',
    'public.import_instagram_announcement(text,text,text,timestamp with time zone,text,text,jsonb)',
    'public.mark_instagram_import(text,text,text,timestamp with time zone,text,text)'
  ] loop
    if to_regprocedure(function_signature) is null then
      raise exception 'missing function: %', function_signature;
    end if;
    if has_function_privilege('anon', function_signature, 'execute')
       or has_function_privilege('authenticated', function_signature, 'execute') then
      raise exception 'client can execute service-only function: %', function_signature;
    end if;
    if not has_function_privilege('service_role', function_signature, 'execute') then
      raise exception 'service role cannot execute function: %', function_signature;
    end if;
    if not (
      select p.prosecdef
      from pg_proc p
      where p.oid = to_regprocedure(function_signature)
    ) then
      raise exception 'service RPC is not SECURITY DEFINER: %', function_signature;
    end if;
  end loop;

  function_signature := 'public.admin_get_instagram_sync_status()';
  if to_regprocedure(function_signature) is null then
    raise exception 'missing function: %', function_signature;
  end if;
  if has_function_privilege('anon', function_signature, 'execute')
     or not has_function_privilege('authenticated', function_signature, 'execute') then
    raise exception 'admin status RPC grants are incorrect';
  end if;
  if not (
    select p.prosecdef
    from pg_proc p
    where p.oid = to_regprocedure(function_signature)
  ) then
    raise exception 'admin status RPC is not SECURITY DEFINER';
  end if;

  if (select count(*) from public.instagram_sync_state) <> 1 then
    raise exception 'instagram_sync_state must contain exactly one row';
  end if;
end;
$$;

select
  'instagram announcement sync schema verified' as result,
  current_timestamp as verified_at;
