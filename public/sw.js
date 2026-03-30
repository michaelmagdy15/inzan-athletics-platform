self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.registration.unregister()
    .then(() => self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass through all requests directly to the network
});
