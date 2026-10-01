-- Salir del dúo: solo membresía. Auth y profiles no se tocan.
-- Si no queda nadie, se disuelve el dúo (planes en cascade).
-- Si queda la otra persona, sigue con el código y puede volver a invitar.

create or replace function public.leave_duo()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_duo_id uuid;
  v_left integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select duo_id into v_duo_id
    from public.duo_members
   where user_id = auth.uid();

  if v_duo_id is null then
    return;
  end if;

  delete from public.duo_members
   where user_id = auth.uid();

  select count(*) into v_left
    from public.duo_members
   where duo_id = v_duo_id;

  if v_left = 0 then
    delete from public.duos where id = v_duo_id;
  end if;
end;
$$;

grant execute on function public.leave_duo() to authenticated;
revoke all on function public.leave_duo() from anon, public;
