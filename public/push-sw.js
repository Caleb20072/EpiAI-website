/* Service worker — notifications push Epi'AI (hors ligne) */
self.addEventListener('push', (event) => {
  let payload = { title: "Epi'AI", body: 'Nouvelle activité sur la plateforme', url: '/' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    if (event.data) payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/assets/epiai-logo.png',
      badge: '/assets/epiai-logo.png',
      tag: payload.tag || 'epiai-alert',
      data: { url: payload.url || '/' },
      requireInteraction: false,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
