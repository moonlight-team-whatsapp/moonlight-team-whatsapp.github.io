# Pendientes de la web (Moonlight Team)

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

## Resto de la web
- Encuestas / votaciones (Supabase)
- Calendario de eventos del team (no cumpleaños; avisos push)
- Manual: desactivar "Allow new users to sign up" en Supabase → Authentication
- Opcional: borrar Firestore antiguo
- Árbol: probar con datos reales las familias por separado y la sección "Sin familia"
