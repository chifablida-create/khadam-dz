// Khadam DZ Stable Service Worker (v9 - Calm & Stable, No Reload Loop)
var CACHE_NAME = 'khadam-dz-universal-v9';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});
