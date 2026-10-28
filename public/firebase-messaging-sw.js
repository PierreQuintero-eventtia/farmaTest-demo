// firebase-messaging-sw.js
// Service Worker oficial de Firebase Cloud Messaging para FarmaTest Chile

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Configuración de Firebase para segundo plano
firebase.initializeApp({
  apiKey: 'AIzaSyCtlQ8OFBhVbch-OOfx4DPN8kwKwgUs_iA',
  projectId: 'abiding-forge-101dl',
  messagingSenderId: '1040674823626',
  appId: '1:1040674823626:web:041dc4658223a55299c333'
});

const messaging = firebase.messaging();

// Handler para notificaciones recibidas con la app en segundo plano o cerrada
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notificación Push recibida en segundo plano:', payload);

  const title = payload.notification?.title || payload.data?.title || '⏰ FarmaTest Chile: ¡Hora de Estudio!';
  const body = payload.notification?.body || payload.data?.body || 'Mantén tu racha activa y repasa las normativas sanitarias SEREMI.';
  const icon = payload.notification?.icon || '/assets/icon-192.png';
  const tag = payload.data?.tag || 'farmatest-study-reminder';

  const notificationOptions = {
    body,
    icon,
    badge: icon,
    tag,
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: payload.data?.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open_app', title: 'Estudiar Ahora' },
      { action: 'dismiss', title: 'Más Tarde' }
    ]
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Listener cuando el usuario hace clic sobre la notificación push
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si la ventana ya está abierta, hacer foco sobre ella
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no está abierta, abrir nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
