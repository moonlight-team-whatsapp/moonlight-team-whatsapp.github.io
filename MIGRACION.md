# Migración Firestore → Supabase (proyecto `stedlptzaukqewtkzotg`)

Estado por fases (la web sigue funcionando con Firestore hasta que cada página se cambia):

1. [x] `respaldo.html`: botón admin que descarga todas las colecciones en `moonlight-respaldo.json`.
2. [x] Tablas en Supabase creadas (id + data jsonb, RLS solo admin escribe; miembros solo admin). Botón «Copiar a Supabase» en respaldo.html (repetible).
3. [ ] Páginas simples: ajustes, paginas (índice), registros, buscados, reservados, ocupados.
4. [ ] Árbol, contactos, sanciones.
5. [ ] Cierre: quitar Firebase.

Reglas: cada página se cambia en su propio commit; Firestore no se toca hasta el final.
