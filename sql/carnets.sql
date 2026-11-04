create table public.carnets(
  miembro_id text primary key,
  token_hash text not null unique,
  creado timestamptz not null default now()
);
alter table public.carnets enable row level security;
create policy carnets_admin_sel on public.carnets for select using (public.es_admin());
create policy carnets_admin_ins on public.carnets for insert with check (public.es_admin());
create policy carnets_admin_upd on public.carnets for update using (public.es_admin()) with check (public.es_admin());
create policy carnets_admin_del on public.carnets for delete using (public.es_admin());
create or replace function public.carnet_miembro(token text) returns text
language sql stable security definer set search_path = '' as $$
  select miembro_id from public.carnets
  where token_hash = encode(extensions.digest(convert_to(token, 'utf8'), 'sha256'), 'hex')
$$;
revoke all on function public.carnet_miembro(text) from public;
grant execute on function public.carnet_miembro(text) to anon, authenticated;
