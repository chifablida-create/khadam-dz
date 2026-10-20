// Khadam DZ 24/7 Universal Service Worker (Compatible with Android 5.0+ to Android 15 & All Browsers)
var CACHE_NAME = 'khadam-dz-universal-v4';
var ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/lite'
];

// Install: precache offline shell & activate immediately for all devices
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS_TO_CACHE).catch(function() {});
    })
  );
});

// Activate: purge all older caches so every device immediately runs the newest update
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: Always fetch fresh updates when online, fallback to offline cache when offline
self.addEventListener('fetch', function(event) {
  var req = event.request;
  var url = req.url || '';

  // Never intercept non-GET requests, API endpoints, SSE live streams, or file downloads
  if (
    req.method !== 'GET' ||
    url.indexOf('/api/') !== -1 ||
    url.indexOf('/download/') !== -1 ||
    url.indexOf('/downloads/') !== -1 ||
    url.indexOf('chrome-extension') !== -1
  ) {
    return;
  }

  var isNavigationOrCode =
    req.mode === 'navigate' ||
    url.indexOf('.html') !== -1 ||
    url.indexOf('.tsx') !== -1 ||
    url.indexOf('.ts') !== -1 ||
    url.indexOf('.js') !== -1 ||
    url.indexOf('.css') !== -1;

  var fetchOptions = isNavigationOrCode ? { cache: 'no-cache' } : {};

  event.respondWith(
    fetch(req, fetchOptions)
      .then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          var responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(req, responseToCache);
          }).catch(function() {});
        }
        return networkResponse;
      })
      .catch(function() {
        return caches.match(req).then(function(cachedResponse) {
          return cachedResponse || caches.match('/index.html');
        });
      })
  );
});

// Message listener for Keep-Alive heartbeats & Global Force-Update across all Android versions
self.addEventListener('message', function(event) {
  var data = event.data || {};
  if (data.type === 'KEEP_ALIVE_PING') {
    if (event.source && typeof event.source.postMessage === 'function') {
      event.source.postMessage({
        type: 'KEEP_ALIVE_PONG',
        timestamp: Date.now(),
        status: 'live_active',
        cacheVersion: CACHE_NAME
      });
    }
  } else if (data.type === 'FORCE_UPDATE_ALL') {
    self.skipWaiting();
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.matchAll({ type: 'window' });
    }).then(function(clientsList) {
      for (var i = 0; i < clientsList.length; i++) {
        if (clientsList[i] && typeof clientsList[i].postMessage === 'function') {
          clientsList[i].postMessage({
            type: 'APP_UPDATED_READY',
            timestamp: Date.now()
          });
        }
      }
    }).catch(function() {});
  }
});
