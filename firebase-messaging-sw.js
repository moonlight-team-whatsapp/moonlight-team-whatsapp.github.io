// Recibe los avisos push con la página cerrada y los muestra en la barra de notificaciones.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey: "AIzaSyCJw3MuQQrYZ7xaabbKhK5Q4fAAB5xzZsk",
  authDomain: "moonlight-teamm-947ee.firebaseapp.com",
  projectId: "moonlight-teamm-947ee",
  storageBucket: "moonlight-teamm-947ee.firebasestorage.app",
  messagingSenderId: "664050217208",
  appId: "1:664050217208:web:194120b9ab73b43a984b0d"
});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((p) => {
  const d = p.data || {};
  return self.registration.showNotification(d.titulo || '🌙 Nuevo anónimo', {
    body: d.cuerpo || '', icon: 'favicon.png', badge: 'favicon.png',
    tag: 'anonimo', renotify: true, vibrate: [120, 60, 120], data: { url: d.url || './anonimos.html' }
  });
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './anonimos.html';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow(url);
  }));
});
