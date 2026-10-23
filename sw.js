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
