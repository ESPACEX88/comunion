-- Indexes on remaining FKs, initplan-safe auth.uid(), and no overlapping SELECT policies.

create index if not exists groups_created_by_idx on public.groups (created_by);
create index if not exists group_prayers_author_idx on public.group_prayers (author_id);
create index if not exists group_verse_comments_author_idx on public.group_verse_comments (author_id);
create index if not exists group_challenges_created_by_idx on public.group_challenges (created_by);

create or replace function public.group_new_code()
returns text
language plpgsql
security definer
set search_path to 'public'
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

revoke all on function public.group_new_code() from public, anon, authenticated;

drop policy if exists group_plans_write_owner on public.group_plans;
create policy group_plans_insert_owner on public.group_plans for insert to authenticated
  with check (public.is_group_owner(group_id));
create policy group_plans_update_owner on public.group_plans for update to authenticated
  using (public.is_group_owner(group_id))
  with check (public.is_group_owner(group_id));
create policy group_plans_delete_owner on public.group_plans for delete to authenticated
  using (public.is_group_owner(group_id));

drop policy if exists group_plan_days_write_owner on public.group_plan_days;
create policy group_plan_days_insert_owner on public.group_plan_days for insert to authenticated
  with check (exists (
    select 1 from public.group_plans p
    where p.id = plan_id and public.is_group_owner(p.group_id)
  ));
create policy group_plan_days_update_owner on public.group_plan_days for update to authenticated
  using (exists (
    select 1 from public.group_plans p
    where p.id = plan_id and public.is_group_owner(p.group_id)
  ))
  with check (exists (
    select 1 from public.group_plans p
    where p.id = plan_id and public.is_group_owner(p.group_id)
  ));
create policy group_plan_days_delete_owner on public.group_plan_days for delete to authenticated
  using (exists (
    select 1 from public.group_plans p
    where p.id = plan_id and public.is_group_owner(p.group_id)
  ));

drop policy if exists group_members_select on public.group_members;
create policy group_members_select on public.group_members for select to authenticated
  using (public.is_group_member(group_id) or user_id = (select auth.uid()));

drop policy if exists group_plan_completions_insert_own on public.group_plan_completions;
create policy group_plan_completions_insert_own on public.group_plan_completions for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.group_plans p where p.id = plan_id and public.is_group_member(p.group_id))
  );

drop policy if exists group_plan_completions_delete_own on public.group_plan_completions;
create policy group_plan_completions_delete_own on public.group_plan_completions for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists group_prayers_insert_own on public.group_prayers;
create policy group_prayers_insert_own on public.group_prayers for insert to authenticated
  with check (author_id = (select auth.uid()) and public.is_group_member(group_id));

drop policy if exists group_prayers_update_own on public.group_prayers;
create policy group_prayers_update_own on public.group_prayers for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

drop policy if exists group_prayers_delete_own on public.group_prayers;
create policy group_prayers_delete_own on public.group_prayers for delete to authenticated
  using (author_id = (select auth.uid()));

drop policy if exists group_prayer_marks_insert_own on public.group_prayer_marks;
create policy group_prayer_marks_insert_own on public.group_prayer_marks for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.group_prayers p where p.id = prayer_id and public.is_group_member(p.group_id))
  );

drop policy if exists group_prayer_marks_delete_own on public.group_prayer_marks;
create policy group_prayer_marks_delete_own on public.group_prayer_marks for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists group_verse_comments_insert_own on public.group_verse_comments;
create policy group_verse_comments_insert_own on public.group_verse_comments for insert to authenticated
  with check (author_id = (select auth.uid()) and public.is_group_member(group_id));

drop policy if exists group_verse_comments_delete_own on public.group_verse_comments;
create policy group_verse_comments_delete_own on public.group_verse_comments for delete to authenticated
  using (author_id = (select auth.uid()));

drop policy if exists group_challenges_write_owner on public.group_challenges;
create policy group_challenges_write_owner on public.group_challenges for insert to authenticated
  with check (public.is_group_owner(group_id) and created_by = (select auth.uid()));

drop policy if exists group_challenge_checkins_write_own on public.group_challenge_checkins;
create policy group_challenge_checkins_write_own on public.group_challenge_checkins for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.group_challenges c where c.id = challenge_id and public.is_group_member(c.group_id))
  );

drop policy if exists group_challenge_checkins_update_own on public.group_challenge_checkins;
create policy group_challenge_checkins_update_own on public.group_challenge_checkins for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
