-- Remitente privado de los anónimos (referencia; ya aplicado). La función lo saca del carnet; la vista solo la leen admins.
alter table public.anonimos add column if not exists remitente text;
drop policy if exists "enviar anonimo" on public.anonimos;
create policy "enviar anonimo" on public.anonimos for insert to anon, authenticated with check (leido = false and remitente is null);
-- enviar_anonimo(p_para text[], p_texto text, p_token text) security definer: resuelve el carnet y guarda remitente.
-- Vista public.anonimos_remitentes (security_invoker): id, created_at, para, texto, miembro_id, personajes.
