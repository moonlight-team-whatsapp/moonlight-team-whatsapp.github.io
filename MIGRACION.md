# Migración Firestore → Supabase (proyecto `stedlptzaukqewtkzotg`)

Estado por fases (la web sigue funcionando con Firestore hasta que cada página se cambia):

1. [x] `respaldo.html`: botón admin que descarga todas las colecciones en `moonlight-respaldo.json`.
2. [x] Tablas en Supabase creadas (id + data jsonb, RLS solo admin escribe; miembros solo admin). Botón «Copiar a Supabase» en respaldo.html (repetible).
3. [x] `supa-compat.js`: capa que imita la API de Firestore/Firebase Auth sobre Supabase (probada con 19 pruebas). Las páginas solo tendrán que cambiar sus imports.
4. [ ] Probar la capa en vivo (botón «Probar Supabase» de respaldo.html).
5. [ ] CORTE ÚNICO: «Copiar a Supabase» (datos frescos) + cambiar los imports de todas las páginas en un solo commit
   (las páginas comparten datos: ocupados, miembros, árbol…, no se pueden pasar de una en una).
6. [ ] Limpieza: quitar Firebase, desactivar registros nuevos en Supabase Auth, borrar el doble login.

Reversible: el corte es cambiar imports; Firestore queda congelado con los datos del momento del corte.
