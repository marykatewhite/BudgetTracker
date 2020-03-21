// Cache every other file in the public folder
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", function(evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", event => {
  event
    .waitUntil(
      caches.keys().then(keysList => {
        return Promise.all(
          keysList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    )
    .then(() => self.clients.claim());
});

self.addEventListener("fetch", event => {
  if (event.request.url.includes("/api")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          });
      })
    );
  }
});

event.respondWith(
  caches.open(CACHE_NAME).then(cache => {
    return cache.match(event.request).then(response => {
      return response || fetch(event.request);
    });
  })
);
