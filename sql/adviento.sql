-- Calendario de adviento (referencia; ya aplicado). Los visitantes solo leen las puertas ya abiertas (hora de Madrid).
create table public.adviento(
  dia int primary key check (dia between 1 and 24),
  titulo text check (char_length(titulo) <= 80),
  texto text check (char_length(texto) <= 600),
  enlace text check (char_length(enlace) <= 300),
  imagen_path text check (imagen_path is null or imagen_path like 'adv/%'),
  actualizado timestamptz not null default now()
);
alter table public.adviento enable row level security;
create policy adv_ver on public.adviento for select using (
  public.es_admin()
  or (extract(month from (now() at time zone 'Europe/Madrid')) = 12 and dia <= extract(day from (now() at time zone 'Europe/Madrid')))
  or extract(month from (now() at time zone 'Europe/Madrid')) = 1
);
create policy adv_ins on public.adviento for insert with check (public.es_admin());
create policy adv_upd on public.adviento for update using (public.es_admin()) with check (public.es_admin());
create policy adv_del on public.adviento for delete using (public.es_admin());

-- Migración «adviento_tipos»: tipo de puerta + datos del juego; los visitantes leen solo por funciones.
-- alter table public.adviento add column tipo text not null default 'mensaje' check (tipo in ('mensaje','imagen','frase','memoria','sopa','sudoku','quiz','puzle','wordle','adivina','laberinto','reto'));
-- alter table public.adviento add column datos jsonb not null default '{}'::jsonb;
-- adv_ver pasa a ser solo admin. Funciones security definer: adviento_hoy(), adviento_puerta(dia, token) (aplica la frase personal del carnet) y adviento_resumen().
-- Imágenes: bucket mooncards, ruta adv/… (políticas adv_subir / adv_actualizar, solo admin).
