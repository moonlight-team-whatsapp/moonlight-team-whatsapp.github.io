# Moonlight Team · web

Web estática (GitHub Pages) del roleplay de Genshin Impact **Moonlight Team**. Los datos viven en **Supabase** (proyecto `stedlptzaukqewtkzotg`).

## Estructura

```
/                 Páginas (cada .html es una URL pública: no moverlas, el índice las descubre aquí)
  index.html        Portada con el listado de páginas
  lista.html        Ocupados / reservados / buscados
  arbol.html        Árbol genealógico
  mooncard.html     Editor de MoonCards
  galeria.html      Galería de MoonCards (aprobación admin)
  registros.html    Estadísticas de actividad
  sanciones.html · contactos.html · anonimos.html · respaldo.html
  temporadas.html   Admin: temporadas de decoración (Navidad, Halloween…)
  sw.js             Service worker de los avisos push (tiene que estar en la raíz)
  favicon.png · luna.jpg   Se usan en metadatos y avisos, por eso están en la raíz
  robots.txt · sitemap.xml · google…html
css/              styles.css (estilos compartidos y temporadas)
js/               Código compartido
  supabase-sesion.js   Cliente único de Supabase
  supa-compat.js       Capa estilo Firestore sobre Supabase (las páginas importan de aquí)
  mooncard-principal.js  MoonCard principal de cada personaje
  temporadas.js        Cargador de temporadas + botón «Decoración»
  temas/               Un archivo por temporada (navidad.js, halloween.js…)
img/              Imágenes de la web
fonts/            Fuentes locales
sql/              Esquema de la base de datos (referencia; ya aplicado en Supabase)
docs/             Notas: MIGRACION.md, PENDIENTES.md
.github/          Despliegue y SEO automático (pages.yml, seo.yml, scripts/seo.py)
```

## Cosas a tener en cuenta
- **Las páginas se quedan en la raíz** a propósito: sus direcciones están compartidas y el índice las lista leyendo la raíz del repositorio.
- **Nueva temporada:** añadir una línea en `TEMAS` de `js/temporadas.js`, crear `js/temas/<id>.js`, sus estilos en `css/styles.css` (`html.<id> …`) y una fila en la tabla `temporadas`. Aparece sola en `temporadas.html`.
- **Vista previa de una temporada:** añadir `?tema=<id>` a cualquier dirección (`?tema=off` la apaga).
- Seguridad: toda la seguridad está en las políticas RLS de Supabase (`public.es_admin()`); la clave pública del código solo permite lo que las políticas dejan.
