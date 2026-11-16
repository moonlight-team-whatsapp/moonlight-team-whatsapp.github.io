// Recibe los avisos push con la página cerrada y los muestra en la barra de notificaciones.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (er) {}
  e.waitUntil(self.registration.showNotification(d.titulo || '🌙 Nuevo anónimo', {
    body: d.cuerpo || '', icon: 'favicon.png', badge: 'favicon.png',
    tag: 'anonimo', renotify: true, vibrate: [120, 60, 120], data: { url: d.url || './anonimos.html' }
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './anonimos.html';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow(url);
  }));
});

// Música: guarda el audio en caché (sin conexión) y responde a Range para poder avanzar/retroceder.
const MC = 'musica-v1';
async function rango(req, res){
  const r = req.headers.get('range'); if (!r || !res) return res;
  const b = await res.clone().blob(), m = /bytes=(\d*)-(\d*)/.exec(r); if (!m) return res;
  const i = m[1] ? +m[1] : 0, f = m[2] ? Math.min(+m[2], b.size - 1) : b.size - 1;
  return new Response(b.slice(i, f + 1), { status: 206, headers: { 'Content-Type': b.type || 'audio/mpeg', 'Content-Range': `bytes ${i}-${f}/${b.size}`, 'Content-Length': f - i + 1, 'Accept-Ranges': 'bytes' } });
}
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.includes('/storage/v1/object/public/musica/')) return;
  e.respondWith((async () => {
    const c = await caches.open(MC), hit = await c.match(e.request.url);
    if (hit) return rango(e.request, hit);
    return fetch(e.request);
  })());
});
