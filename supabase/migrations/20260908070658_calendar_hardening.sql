create schema if not exists extensions;
grant usage on schema extensions to anon, authenticated, service_role;
alter extension btree_gist set schema extensions;
do $$ begin
  if to_regprocedure('public.handle_new_user()') is not null then
    revoke execute on function public.handle_new_user() from public, anon, authenticated;
  end if;
end $$;
