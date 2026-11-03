/* Service worker — PWA + notifications push Epi'AI */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/** Required for installability on many browsers — network passthrough. */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

self.addEventListener('push', (event) => {
  let payload = { title: "Epi'AI", body: 'Nouvelle activité sur la plateforme', url: '/fr/dashboard' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    if (event.data) payload.body = event.data.text();
  }

  const url = payload.url || '/fr/dashboard';
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: payload.tag || 'epiai-alert',
      renotify: Boolean(payload.tag),
      data: { url },
      requireInteraction: false,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let url = event.notification.data?.url || '/fr/dashboard';
  try {
    if (url.startsWith('/')) url = new URL(url, self.location.origin).href;
  } catch {
    url = self.location.origin + '/fr/dashboard';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            try {
              return client.navigate(url);
            } catch {
              /* older browsers */
            }
          }
          return client;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});
