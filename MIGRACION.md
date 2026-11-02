# Migración Firestore → Supabase (proyecto `stedlptzaukqewtkzotg`)

Estado por fases (la web sigue funcionando con Firestore hasta que cada página se cambia):

1. [x] `respaldo.html`: botón admin que descarga todas las colecciones en `moonlight-respaldo.json`.
2. [x] Tablas en Supabase creadas (id + data jsonb, RLS solo admin escribe; miembros solo admin). Botón «Copiar a Supabase» en respaldo.html (repetible).
3. [x] `supa-compat.js`: capa que imita la API de Firestore/Firebase Auth sobre Supabase (probada con 19 pruebas). Las páginas solo tendrán que cambiar sus imports.
4. [x] Probar la capa en vivo (botón «Probar Supabase» de respaldo.html).
5. [x] CORTE ÚNICO: «Copiar a Supabase» (datos frescos) + cambiar los imports de todas las páginas en un solo commit
   (las páginas comparten datos: ocupados, miembros, árbol…, no se pueden pasar de una en una).
6. [x] Limpieza: Firebase fuera de todas las páginas, doble login quitado, firestore.rules eliminado, respaldo.html ahora exporta desde Supabase.
   Pendiente a mano: desactivar «Allow new users to sign up» en Supabase → Authentication.

Reversible: el corte es cambiar imports; Firestore queda congelado con los datos del momento del corte.
