-- Esquema de Supabase (referencia; ya aplicado en el proyecto).
-- Colecciones de la web: una tabla por colección (id text + data jsonb).
create or replace function public.es_admin() returns boolean
language sql stable security invoker set search_path = ''
as $$ select (select auth.uid()) = 'bdfcb5e2-62c6-4419-9cb4-6f5151631d14'::uuid $$;

-- Para cada tabla de: miembros, ocupados, reservados, buscados, arbol, registros, paginas, ajustes
--   create table public.<t> (id text primary key, data jsonb not null default '{}');
--   alter table public.<t> enable row level security;
--   create policy "admin escribe" on public.<t> for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
--   -- todas menos miembros (solo admin):
--   create policy "todos leen" on public.<t> for select to anon, authenticated using (true);
-- Anónimos y suscripciones push: ver 1-base-de-datos.sql (gestión solo para es_admin()).
