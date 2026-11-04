# Pendientes de la web (Moonlight Team)

(El calendario de adviento está en marcha: tabla `adviento` creada, falta `adviento.html`.)

## MoonCard (en este orden)

## Hecho en MoonCard
- MoonCard principal por personaje (admin: «Hacer principal» en la galería): miniatura y tarjeta en la lista y el árbol
- Detalles: guías de centrado al arrastrar adornos, vista previa mayor en móvil, línea de rol que se encoge si es larga
- Galería (galeria.html): publicar con aprobación admin, máx. 3 por personaje, filtro por personaje y «Usar como plantilla». Tabla `mooncards` + bucket `mooncards` en Supabase
- 36 adornos, giro y delante/detrás; marcos de foto hexágono, corazón, estrella y rombo
- Texto flexible: posición izq/centro/der, sombra o contorno, campo «Rol o edad»
- Plantillas por elemento (pestaña Fondo) + 7 fondos nuevos
- Guardar / abrir el diseño como archivo (.mooncard.json)
- Formatos de descarga (cuadrado, vertical 4:5, historia 9:16), PNG/JPG y botón Compartir (solo móviles compatibles)
- Deshacer / rehacer (botones sobre la tarjeta, Ctrl+Z / Ctrl+Y)
- Guardado automático en el navegador (IndexedDB)

## Navidad / temporadas
- [x] Botón «Decoración: sí/no» para cada visitante
- [x] Página de admin `temporadas.html` (modo automática por fechas / siempre / apagada) + tabla `temporadas`; temas: Navidad y Halloween
- [ ] Mensajes por fecha (cuenta atrás, 24-25 dic, Nochevieja con fuegos, Reyes)
- [ ] Adornos y plantilla navideña en MoonCard
- [ ] Detalles interactivos (pulsar el trineo, nieve acumulada en tarjetas), escarcha, títulos con brillo
- [ ] Calendario de adviento: 24 puertas (1-24 dic), una sorpresa por día
- [ ] Nuevos temas a futuro (San Valentín, verano, cumpleaños del team…): se añaden en `temporadas.js` (lista TEMAS) + `tema-<id>.js` + CSS

## Resto de la web
- Encuestas / votaciones (Supabase)
- Calendario de eventos del team (no cumpleaños; avisos push)
- Manual: desactivar "Allow new users to sign up" en Supabase → Authentication
- Opcional: borrar Firestore antiguo
- Árbol: probar con datos reales las familias por separado y la sección "Sin familia"
