-- Galería de MoonCards (referencia; ya aplicado). Imágenes y diseños en el bucket público «mooncards» (carpeta mc/).
create table public.mooncards(
  id uuid primary key default gen_random_uuid(),
  personaje text not null check (char_length(personaje) between 1 and 40),
  personaje_key text not null,
  autor text check (char_length(autor) <= 24),          -- sin uso (antes nombre del autor)
  titulo text check (char_length(titulo) <= 40),         -- nombre de la tarjeta
  img_path text not null check (img_path like 'mc/%'),
  diseno_path text not null check (diseno_path like 'mc/%'),
  aprobada boolean not null default false,
  principal boolean not null default false,
  creada timestamptz not null default now()
);
alter table public.mooncards enable row level security;
create index on public.mooncards (personaje_key);
create unique index mooncards_una_principal on public.mooncards (personaje_key) where principal;
-- Trigger mooncards_limite: máx. 5 tarjetas (reemplazo vía mooncard_reemplazar) por personaje, fuerza aprobada=false/principal=false al insertar
-- y quita «principal» si se cambia el personaje.
create policy mc_ver on public.mooncards for select using (aprobada or public.es_admin());
create policy mc_publicar on public.mooncards for insert to anon, authenticated with check (aprobada = false);
create policy mc_admin_upd on public.mooncards for update using (public.es_admin()) with check (public.es_admin());
create policy mc_admin_del on public.mooncards for delete using (public.es_admin());
-- Storage: bucket «mooncards» (público, 12 MB, png/jpeg/json); subir a mc/% (anon) o adv/% (admin); borrar solo admin.
