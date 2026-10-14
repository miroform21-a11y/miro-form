-- MIROFORM CMS: drafts, change log, immutable publications, media registry, login throttling, Storage buckets.
--
-- Access model (no Supabase Auth):
--   * anon / authenticated (the publishable key): may only call cms_get_published(); every table and every other
--     function is closed to them (RLS on, no policies, privileges revoked).
--   * service_role (the secret key): used by the Next.js server only, after the admin session was verified.
--     service_role bypasses RLS, so the server checks are the real gate; RLS and the revokes guard against the
--     publishable key and against mistakes.

create extension if not exists pgcrypto;

/* ---------------- tables ---------------- */

create table public.cms_drafts (
  area text not null check (area in ('site', 'brief')),
  locale text not null check (locale in ('uk', 'en')),
  section text not null check (section ~ '^[A-Za-z]{1,40}$'),
  data jsonb not null,
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now(),
  primary key (area, locale, section)
);

create table public.cms_changes (
  id uuid primary key default gen_random_uuid(),
  area text not null check (area in ('site', 'brief')),
  locale text not null check (locale in ('uk', 'en')),
  section text not null,
  section_id text not null,
  section_title text not null,
  path text not null,
  field text not null,
  description text not null,
  -- before/after as JSON values; *_present = false means "the key did not exist" (optional fields)
  before_value jsonb,
  before_present boolean not null default true,
  after_value jsonb,
  after_present boolean not null default true,
  created_at timestamptz not null default now(),
  undone_at timestamptz
);
create index cms_changes_recent on public.cms_changes (created_at desc) where undone_at is null;

create table public.cms_publications (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  note text not null default '' check (length(note) <= 300),
  source text not null check (source in ('seed', 'publish', 'restore')),
  restored_from bigint references public.cms_publications (id),
  schema_version integer not null,
  snapshot jsonb not null,
  media_ids uuid[] not null default '{}'
);

-- exactly one row: which publication the site shows
create table public.cms_state (
  id boolean primary key default true check (id),
  current_publication_id bigint not null references public.cms_publications (id),
  updated_at timestamptz not null default now()
);

create table public.cms_media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video')),
  mime text not null check (mime in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4')),
  bytes bigint check (bytes > 0),
  width integer,
  height integer,
  sha256 text check (sha256 ~ '^[0-9a-f]{64}$'),
  original_name text not null default '' check (length(original_name) <= 200),
  draft_path text not null unique,
  public_path text unique,
  status text not null default 'pending' check (status in ('pending', 'ready')),
  created_at timestamptz not null default now()
);

-- login throttling shared by every server instance: one row per key and time window
create table public.cms_login_attempts (
  key text not null,
  window_start timestamptz not null,
  attempts integer not null default 0,
  primary key (key, window_start)
);

alter table public.cms_drafts enable row level security;
alter table public.cms_changes enable row level security;
alter table public.cms_publications enable row level security;
alter table public.cms_state enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_login_attempts enable row level security;
revoke all on public.cms_drafts, public.cms_changes, public.cms_publications, public.cms_state, public.cms_media, public.cms_login_attempts from public, anon, authenticated;
grant select, insert, update, delete on public.cms_drafts, public.cms_changes, public.cms_publications, public.cms_state, public.cms_media, public.cms_login_attempts to service_role;
revoke all on sequence public.cms_publications_id_seq from public, anon, authenticated;
grant usage, select on sequence public.cms_publications_id_seq to service_role;
-- no policies are created on purpose: with RLS on, anon/authenticated see and change nothing

/* ---------------- functions ---------------- */

-- The only public entry point: the snapshot the site currently shows (never drafts, history or old versions).
create or replace function public.cms_get_published()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object('id', p.id, 'createdAt', p.created_at, 'schemaVersion', p.schema_version, 'snapshot', p.snapshot)
  from public.cms_state s
  join public.cms_publications p on p.id = s.current_publication_id
  where s.id;
$$;

-- Atomic publish: insert the snapshot and switch the site to it in one transaction.
create or replace function public.cms_publish(p_snapshot jsonb, p_media_ids uuid[], p_note text, p_schema_version integer, p_source text)
returns bigint
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  new_id bigint;
begin
  if p_source not in ('seed', 'publish') then
    raise exception 'invalid source';
  end if;
  if jsonb_typeof(p_snapshot -> 'site') is distinct from 'object' or jsonb_typeof(p_snapshot -> 'brief') is distinct from 'object' then
    raise exception 'invalid snapshot';
  end if;
  insert into public.cms_publications (note, source, schema_version, snapshot, media_ids)
  values (coalesce(p_note, ''), p_source, p_schema_version, p_snapshot, coalesce(p_media_ids, '{}'))
  returning id into new_id;
  insert into public.cms_state (id, current_publication_id, updated_at)
  values (true, new_id, now())
  on conflict (id) do update set current_publication_id = excluded.current_publication_id, updated_at = now();
  return new_id;
end;
$$;

-- Rollback = a new publication with the old snapshot (history stays linear), switched atomically.
create or replace function public.cms_restore(p_publication_id bigint, p_note text)
returns bigint
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  src public.cms_publications;
  new_id bigint;
begin
  select * into src from public.cms_publications where id = p_publication_id;
  if not found then
    raise exception 'publication not found';
  end if;
  insert into public.cms_publications (note, source, restored_from, schema_version, snapshot, media_ids)
  values (coalesce(p_note, ''), 'restore', src.id, src.schema_version, src.snapshot, src.media_ids)
  returning id into new_id;
  update public.cms_state set current_publication_id = new_id, updated_at = now() where id;
  return new_id;
end;
$$;

-- Save one section with optimistic locking and record its field changes in the same transaction.
-- p_expected_version = 0 creates the row. Returns the new version; raises 'version conflict' if someone saved first.
create or replace function public.cms_save_draft(
  p_area text, p_locale text, p_section text, p_data jsonb, p_expected_version integer, p_changes jsonb, p_undo_change uuid default null
)
returns integer
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  new_version integer;
begin
  if p_expected_version = 0 then
    insert into public.cms_drafts (area, locale, section, data, version)
    values (p_area, p_locale, p_section, p_data, 1)
    on conflict do nothing
    returning version into new_version;
  else
    update public.cms_drafts
       set data = p_data, version = version + 1, updated_at = now()
     where area = p_area and locale = p_locale and section = p_section and version = p_expected_version
    returning version into new_version;
  end if;
  if new_version is null then
    raise exception 'version conflict';
  end if;

  insert into public.cms_changes (area, locale, section, section_id, section_title, path, field, description,
                                  before_value, before_present, after_value, after_present)
  select p_area, p_locale, p_section, c ->> 'sectionId', c ->> 'sectionTitle', c ->> 'path', c ->> 'field', c ->> 'description',
         c -> 'before', coalesce((c ->> 'beforePresent')::boolean, true), c -> 'after', coalesce((c ->> 'afterPresent')::boolean, true)
  from jsonb_array_elements(coalesce(p_changes, '[]'::jsonb)) as c;

  if p_undo_change is not null then
    update public.cms_changes set undone_at = now() where id = p_undo_change and undone_at is null;
    if not found then
      raise exception 'change already undone';
    end if;
  end if;
  return new_version;
end;
$$;

-- Throttle: counts an attempt BEFORE the password is checked, atomically (row lock), so parallel requests from
-- many instances cannot all pass the check. Returns true when this attempt is still within the limit.
create or replace function public.cms_take_login_slot(p_key text, p_window_seconds integer, p_limit integer)
returns boolean
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  n integer;
begin
  insert into public.cms_login_attempts (key, window_start, attempts)
  values (p_key, w, 1)
  on conflict (key, window_start) do update set attempts = public.cms_login_attempts.attempts + 1
  returning attempts into n;
  delete from public.cms_login_attempts where window_start < now() - interval '1 day';
  return n <= p_limit;
end;
$$;

revoke all on function public.cms_get_published() from public, anon, authenticated;
revoke all on function public.cms_publish(jsonb, uuid[], text, integer, text) from public, anon, authenticated;
revoke all on function public.cms_restore(bigint, text) from public, anon, authenticated;
revoke all on function public.cms_save_draft(text, text, text, jsonb, integer, jsonb, uuid) from public, anon, authenticated;
revoke all on function public.cms_take_login_slot(text, integer, integer) from public, anon, authenticated;

grant execute on function public.cms_get_published() to anon, authenticated, service_role;
grant execute on function public.cms_publish(jsonb, uuid[], text, integer, text) to service_role;
grant execute on function public.cms_restore(bigint, text) to service_role;
grant execute on function public.cms_save_draft(text, text, text, jsonb, integer, jsonb, uuid) to service_role;
grant execute on function public.cms_take_login_slot(text, integer, integer) to service_role;

/* ---------------- Storage ---------------- */

-- cms-drafts: private, files uploaded from the admin; served to the admin only through short-lived signed URLs.
-- cms-public: public read by URL (no listing policy), written only by the server when content is published.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cms-drafts', 'cms-drafts', false, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4']),
  ('cms-public', 'cms-public', true, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
-- No storage.objects policies for these buckets: anon/authenticated cannot list, read drafts, upload or delete.
