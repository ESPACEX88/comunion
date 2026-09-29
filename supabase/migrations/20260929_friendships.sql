-- Amigos: red más amplia que el dúo (el dúo sigue siendo la pareja de plan).
-- Aplicada en el proyecto Comunion zpjrfxbrfdapoufdvrqr.

create table if not exists public.friend_invites (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  code text not null unique,
  status text not null default 'open' check (status in ('open', 'used', 'cancelled')),
  used_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create unique index if not exists friend_invites_one_open_per_inviter
  on public.friend_invites (inviter_id)
  where status = 'open';

create index if not exists friend_invites_inviter_idx on public.friend_invites (inviter_id);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint friendships_ordered check (user_a < user_b),
  constraint friendships_unique unique (user_a, user_b)
);

create index if not exists friendships_user_a_idx on public.friendships (user_a);
create index if not exists friendships_user_b_idx on public.friendships (user_b);

alter table public.friend_invites enable row level security;
alter table public.friendships enable row level security;

drop policy if exists friend_invites_select_own on public.friend_invites;
create policy friend_invites_select_own
  on public.friend_invites for select
  to authenticated
  using (inviter_id = auth.uid() or used_by = auth.uid());

drop policy if exists friend_invites_update_own on public.friend_invites;
create policy friend_invites_update_own
  on public.friend_invites for update
  to authenticated
  using (inviter_id = auth.uid())
  with check (inviter_id = auth.uid());

drop policy if exists friendships_select_member on public.friendships;
create policy friendships_select_member
  on public.friendships for select
  to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());

drop policy if exists friendships_delete_member on public.friendships;
create policy friendships_delete_member
  on public.friendships for delete
  to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());

create or replace function public.create_friend_invite()
returns public.friend_invites
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_invite public.friend_invites;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.friend_invites
     set status = 'cancelled'
   where inviter_id = auth.uid()
     and status = 'open';

  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.friend_invites where code = v_code);
  end loop;

  insert into public.friend_invites (inviter_id, code, status)
  values (auth.uid(), v_code, 'open')
  returning * into v_invite;

  return v_invite;
end;
$$;

create or replace function public.accept_friend_invite(p_code text)
returns public.friendships
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_invite public.friend_invites;
  v_friend public.friendships;
  v_low uuid;
  v_high uuid;
  v_other uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_invite
    from public.friend_invites
   where code = upper(trim(p_code))
     and status = 'open';

  if v_invite.id is null then
    raise exception 'Código inválido o ya usado';
  end if;

  if v_invite.inviter_id = auth.uid() then
    raise exception 'Ese código es tuyo. Compartilo con otra persona.';
  end if;

  v_other := v_invite.inviter_id;
  if v_other < auth.uid() then
    v_low := v_other;
    v_high := auth.uid();
  else
    v_low := auth.uid();
    v_high := v_other;
  end if;

  insert into public.friendships (user_a, user_b)
  values (v_low, v_high)
  on conflict (user_a, user_b) do update set user_a = excluded.user_a
  returning * into v_friend;

  update public.friend_invites
     set status = 'used',
         used_by = auth.uid(),
         used_at = now()
   where id = v_invite.id;

  return v_friend;
end;
$$;

create or replace function public.cancel_friend_invite()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.friend_invites
     set status = 'cancelled'
   where inviter_id = auth.uid()
     and status = 'open';
end;
$$;

create or replace function public.unfriend(p_friend_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.friendships
   where (user_a = auth.uid() and user_b = p_friend_id)
      or (user_b = auth.uid() and user_a = p_friend_id);
end;
$$;

grant execute on function public.create_friend_invite() to authenticated;
grant execute on function public.accept_friend_invite(text) to authenticated;
grant execute on function public.cancel_friend_invite() to authenticated;
grant execute on function public.unfriend(uuid) to authenticated;

revoke all on function public.create_friend_invite() from anon, public;
revoke all on function public.accept_friend_invite(text) from anon, public;
revoke all on function public.cancel_friend_invite() from anon, public;
revoke all on function public.unfriend(uuid) from anon, public;
