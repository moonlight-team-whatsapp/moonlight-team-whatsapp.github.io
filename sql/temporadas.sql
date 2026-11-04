-- Temporadas de decoración (referencia; ya aplicado). La gestiona temporadas.html.
create table public.temporadas(
  id text primary key check (id ~ '^[a-z0-9_-]{1,30}$'),
  modo text not null default 'auto' check (modo in ('auto','on','off')),
  desde text check (desde ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),   -- MM-DD, se repite cada año
  hasta text check (hasta ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),
  actualizado timestamptz not null default now()
);
alter table public.temporadas enable row level security;
create policy temp_ver on public.temporadas for select using (true);
create policy temp_ins on public.temporadas for insert with check (public.es_admin());
create policy temp_upd on public.temporadas for update using (public.es_admin()) with check (public.es_admin());
create policy temp_del on public.temporadas for delete using (public.es_admin());
