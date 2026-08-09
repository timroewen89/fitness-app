const CACHE_NAME = "momentum-v2.11.1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./logic.js",
  "./manifest.webmanifest",
  "./vendor/lucide.min.js",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Bij serverfouten (bv. 500) terugvallen op de gecachte kopie.
          if (!response || !response.ok) return caches.match("./index.html").then(cached => cached || response);
          const copy = response.clone();
          return caches.open(CACHE_NAME)
            .then(cache => cache.put("./index.html", copy))
            .catch(() => undefined)
            .then(() => response);
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // app.js en logic.js bevatten de applicatiecode: network-first, zodat updates
  // direct doorkomen (net als index.html) en offline de cache het overneemt.
  const pathname = new URL(event.request.url).pathname;
  if (pathname.endsWith("/app.js") || pathname.endsWith("/logic.js")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || !response.ok) return caches.match(event.request).then(cached => cached || response);
          const copy = response.clone();
          return caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, copy))
            .catch(() => undefined)
            .then(() => response);
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const copy = response.clone();
        return caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, copy))
          .catch(() => undefined)
          .then(() => response);
      }).catch(() => Response.error());
    })
  );
});
