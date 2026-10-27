-- Grupos de iglesia: capa extra al dúo y a los amigos.
-- Un usuario puede estar en varios. Tope cómodo: 30.

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '✦',
  color text not null default 'amber'
    check (color in ('amber', 'olive', 'terracotta', 'gold', 'dusk')),
  invite_code text not null unique,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists group_members_user_idx on public.group_members (user_id);
create index if not exists group_members_group_idx on public.group_members (group_id);

create table if not exists public.group_plans (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text,
  days integer not null,
  starts_on date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists group_plans_one_active
  on public.group_plans (group_id) where is_active;

create index if not exists group_plans_group_idx on public.group_plans (group_id);

create table if not exists public.group_plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.group_plans(id) on delete cascade,
  day_number integer not null,
  scripture_ref text not null,
  prompt text,
  unique (plan_id, day_number)
);

create index if not exists group_plan_days_plan_idx on public.group_plan_days (plan_id);

create table if not exists public.group_plan_completions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.group_plans(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  day_number integer not null,
  completed_on date not null default (timezone('America/Guatemala', now()))::date,
  used_grace boolean not null default false,
  created_at timestamptz not null default now(),
  unique (plan_id, user_id, completed_on)
);

create index if not exists group_plan_completions_plan_idx on public.group_plan_completions (plan_id);
create index if not exists group_plan_completions_user_idx on public.group_plan_completions (user_id);
create index if not exists group_plan_completions_day_idx on public.group_plan_completions (plan_id, completed_on);

create table if not exists public.group_prayers (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  is_anonymous boolean not null default false,
  is_answered boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists group_prayers_group_idx on public.group_prayers (group_id, created_at desc);

create table if not exists public.group_prayer_marks (
  prayer_id uuid not null references public.group_prayers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (prayer_id, user_id)
);

create index if not exists group_prayer_marks_user_idx on public.group_prayer_marks (user_id);

create table if not exists public.group_verse_comments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  day_key date not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists group_verse_comments_day_idx
  on public.group_verse_comments (group_id, day_key, created_at);

create table if not exists public.group_challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  week_start date not null,
  challenge_key text not null,
  title text not null,
  body text not null,
  target integer not null default 1,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (group_id, week_start)
);

create index if not exists group_challenges_group_idx on public.group_challenges (group_id, week_start desc);

create table if not exists public.group_challenge_checkins (
  challenge_id uuid not null references public.group_challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  progress integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create index if not exists group_challenge_checkins_user_idx on public.group_challenge_checkins (user_id);

create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_group_owner(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid() and role = 'owner'
  );
$$;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_plans enable row level security;
alter table public.group_plan_days enable row level security;
alter table public.group_plan_completions enable row level security;
alter table public.group_prayers enable row level security;
alter table public.group_prayer_marks enable row level security;
alter table public.group_verse_comments enable row level security;
alter table public.group_challenges enable row level security;
alter table public.group_challenge_checkins enable row level security;

create policy groups_select_member on public.groups for select to authenticated
  using (public.is_group_member(id));
create policy groups_update_owner on public.groups for update to authenticated
  using (public.is_group_owner(id))
  with check (public.is_group_owner(id));

create policy group_members_select on public.group_members for select to authenticated
  using (public.is_group_member(group_id) or user_id = auth.uid());

create policy group_plans_select on public.group_plans for select to authenticated
  using (public.is_group_member(group_id));
create policy group_plans_write_owner on public.group_plans for all to authenticated
  using (public.is_group_owner(group_id))
  with check (public.is_group_owner(group_id));

create policy group_plan_days_select on public.group_plan_days for select to authenticated
  using (exists (select 1 from public.group_plans p where p.id = plan_id and public.is_group_member(p.group_id)));
create policy group_plan_days_write_owner on public.group_plan_days for all to authenticated
  using (exists (select 1 from public.group_plans p where p.id = plan_id and public.is_group_owner(p.group_id)))
  with check (exists (select 1 from public.group_plans p where p.id = plan_id and public.is_group_owner(p.group_id)));

create policy group_plan_completions_select on public.group_plan_completions for select to authenticated
  using (exists (select 1 from public.group_plans p where p.id = plan_id and public.is_group_member(p.group_id)));
create policy group_plan_completions_insert_own on public.group_plan_completions for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.group_plans p where p.id = plan_id and public.is_group_member(p.group_id))
  );
create policy group_plan_completions_delete_own on public.group_plan_completions for delete to authenticated
  using (user_id = auth.uid());

create policy group_prayers_select on public.group_prayers for select to authenticated
  using (public.is_group_member(group_id));
create policy group_prayers_insert_own on public.group_prayers for insert to authenticated
  with check (author_id = auth.uid() and public.is_group_member(group_id));
create policy group_prayers_update_own on public.group_prayers for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());
create policy group_prayers_delete_own on public.group_prayers for delete to authenticated
  using (author_id = auth.uid());

create policy group_prayer_marks_select on public.group_prayer_marks for select to authenticated
  using (exists (select 1 from public.group_prayers p where p.id = prayer_id and public.is_group_member(p.group_id)));
create policy group_prayer_marks_insert_own on public.group_prayer_marks for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.group_prayers p where p.id = prayer_id and public.is_group_member(p.group_id))
  );
create policy group_prayer_marks_delete_own on public.group_prayer_marks for delete to authenticated
  using (user_id = auth.uid());

create policy group_verse_comments_select on public.group_verse_comments for select to authenticated
  using (public.is_group_member(group_id));
create policy group_verse_comments_insert_own on public.group_verse_comments for insert to authenticated
  with check (author_id = auth.uid() and public.is_group_member(group_id));
create policy group_verse_comments_delete_own on public.group_verse_comments for delete to authenticated
  using (author_id = auth.uid());

create policy group_challenges_select on public.group_challenges for select to authenticated
  using (public.is_group_member(group_id));
create policy group_challenges_write_owner on public.group_challenges for insert to authenticated
  with check (public.is_group_owner(group_id) and created_by = auth.uid());
create policy group_challenges_update_owner on public.group_challenges for update to authenticated
  using (public.is_group_owner(group_id))
  with check (public.is_group_owner(group_id));

create policy group_challenge_checkins_select on public.group_challenge_checkins for select to authenticated
  using (exists (select 1 from public.group_challenges c where c.id = challenge_id and public.is_group_member(c.group_id)));
create policy group_challenge_checkins_write_own on public.group_challenge_checkins for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.group_challenges c where c.id = challenge_id and public.is_group_member(c.group_id))
  );
create policy group_challenge_checkins_update_own on public.group_challenge_checkins for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.group_new_code()
returns text
language plpgsql
as $$
declare
  v_code text;
begin
  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.groups where invite_code = v_code);
  end loop;
  return v_code;
end;
$$;

create or replace function public.create_group(p_name text, p_emoji text default '✦', p_color text default 'amber')
returns public.groups
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_group public.groups;
  v_name text;
  v_emoji text;
  v_color text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  v_name := nullif(trim(p_name), '');
  if v_name is null or char_length(v_name) < 2 then
    raise exception 'Poné un nombre para el grupo.';
  end if;
  if char_length(v_name) > 48 then
    raise exception 'El nombre es muy largo.';
  end if;

  v_emoji := coalesce(nullif(trim(p_emoji), ''), '✦');
  v_color := coalesce(nullif(trim(p_color), ''), 'amber');
  if v_color not in ('amber', 'olive', 'terracotta', 'gold', 'dusk') then
    v_color := 'amber';
  end if;

  insert into public.groups (name, emoji, color, invite_code, created_by)
  values (v_name, v_emoji, v_color, public.group_new_code(), auth.uid())
  returning * into v_group;

  insert into public.group_members (group_id, user_id, role)
  values (v_group.id, auth.uid(), 'owner');

  return v_group;
end;
$$;

create or replace function public.join_group(p_code text)
returns public.groups
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_group public.groups;
  v_count integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_group
    from public.groups
   where invite_code = upper(trim(p_code));

  if v_group.id is null then
    raise exception 'Código inválido.';
  end if;

  if exists (select 1 from public.group_members where group_id = v_group.id and user_id = auth.uid()) then
    return v_group;
  end if;

  select count(*) into v_count from public.group_members where group_id = v_group.id;
  if v_count >= 30 then
    raise exception 'Este grupo ya está lleno.';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (v_group.id, auth.uid(), 'member');

  return v_group;
end;
$$;

create or replace function public.leave_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_left integer;
  v_next uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (select 1 from public.group_members where group_id = p_group_id and user_id = auth.uid()) then
    return;
  end if;

  delete from public.group_members
   where group_id = p_group_id and user_id = auth.uid();

  select count(*) into v_left from public.group_members where group_id = p_group_id;

  if v_left = 0 then
    delete from public.groups where id = p_group_id;
    return;
  end if;

  if not exists (select 1 from public.group_members where group_id = p_group_id and role = 'owner') then
    select user_id into v_next
      from public.group_members
     where group_id = p_group_id
     order by joined_at
     limit 1;
    update public.group_members
       set role = 'owner'
     where group_id = p_group_id and user_id = v_next;
  end if;
end;
$$;

create or replace function public.remove_group_member(p_group_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_group_owner(p_group_id) then
    raise exception 'Solo quien creó el grupo puede sacar a alguien.';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Para salirte, usá Salir del grupo.';
  end if;

  delete from public.group_members
   where group_id = p_group_id and user_id = p_user_id;
end;
$$;

create or replace function public.rotate_group_code(p_group_id uuid)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_group_owner(p_group_id) then
    raise exception 'Solo quien cuida el grupo puede renovar el código.';
  end if;
  v_code := public.group_new_code();
  update public.groups set invite_code = v_code, updated_at = now() where id = p_group_id;
  return v_code;
end;
$$;

grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.is_group_owner(uuid) to authenticated;
grant execute on function public.create_group(text, text, text) to authenticated;
grant execute on function public.join_group(text) to authenticated;
grant execute on function public.leave_group(uuid) to authenticated;
grant execute on function public.remove_group_member(uuid, uuid) to authenticated;
grant execute on function public.rotate_group_code(uuid) to authenticated;

revoke all on function public.is_group_member(uuid) from anon, public;
revoke all on function public.is_group_owner(uuid) from anon, public;
revoke all on function public.create_group(text, text, text) from anon, public;
revoke all on function public.join_group(text) from anon, public;
revoke all on function public.leave_group(uuid) from anon, public;
revoke all on function public.remove_group_member(uuid, uuid) from anon, public;
revoke all on function public.rotate_group_code(uuid) from anon, public;
revoke all on function public.group_new_code() from public, anon, authenticated;

grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, update, delete on public.group_members to authenticated;
grant select, insert, update, delete on public.group_plans to authenticated;
grant select, insert, update, delete on public.group_plan_days to authenticated;
grant select, insert, update, delete on public.group_plan_completions to authenticated;
grant select, insert, update, delete on public.group_prayers to authenticated;
grant select, insert, update, delete on public.group_prayer_marks to authenticated;
grant select, insert, update, delete on public.group_verse_comments to authenticated;
grant select, insert, update, delete on public.group_challenges to authenticated;
grant select, insert, update, delete on public.group_challenge_checkins to authenticated;

alter table public.groups replica identity full;
alter table public.group_members replica identity full;
alter table public.group_plan_completions replica identity full;
alter table public.group_prayers replica identity full;
alter table public.group_prayer_marks replica identity full;
alter table public.group_verse_comments replica identity full;
alter table public.group_challenges replica identity full;
alter table public.group_challenge_checkins replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.group_plan_completions;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.group_prayers;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.group_prayer_marks;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.group_verse_comments;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.group_challenges;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.group_challenge_checkins;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.group_members;
  exception when duplicate_object then null;
  end;
end;
$$;
