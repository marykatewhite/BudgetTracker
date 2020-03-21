// Cache every other file in the public folder
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

self.addEventListener("install", function(evt) {
  evt.waitUntil(
    caches.open(PRECACHE).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return cacheNames.filter(
          cacheName => !currentCaches.includes(cacheName)
        );
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});

// Serve static files from the cache
// Proceed with a network request when the resource is not in the cache
// Allows the page to be accessible offline
evt.respondWith(
  caches.open(CACHE_NAME).then(cache => {
    return cache.match(evt.request).then(response => {
      return response || fetch(evt.request);
    });
  })
);
