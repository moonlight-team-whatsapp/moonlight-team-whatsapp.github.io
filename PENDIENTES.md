# Pendientes de la web (Moonlight Team)

## MoonCard (en este orden)
2. [ ] Guardar / cargar el diseño como archivo (para pasarlo entre dispositivos)
3. [ ] Plantillas rápidas por elemento (Anemo, Geo, Pyro…) con fondo, colores y adornos
4. [ ] Texto más flexible: posición (izq/centro/der), sombra o contorno, segundo campo (rol/edad)
5. [ ] Más adornos (símbolos del juego), rotación, delante/detrás; más formas de marco de la foto (corazón, hexágono, estrella)
6. [ ] Galería de MoonCards del equipo (Supabase; solo si la persona decide publicarla)
7. [ ] Detalles: reajuste automático de texto largo, vista previa mayor en móvil, guías de alineación al arrastrar

## Hecho en MoonCard
- Formatos de descarga (cuadrado, vertical 4:5, historia 9:16), PNG/JPG y botón Compartir (solo móviles compatibles)
- Deshacer / rehacer (botones sobre la tarjeta, Ctrl+Z / Ctrl+Y)
- Guardado automático en el navegador (IndexedDB)

## Resto de la web
- Encuestas / votaciones (Supabase)
- Calendario de eventos del team (no cumpleaños; avisos push)
- Manual: desactivar "Allow new users to sign up" en Supabase → Authentication
- Opcional: borrar Firestore antiguo
- Árbol: probar con datos reales las familias por separado y la sección "Sin familia"
