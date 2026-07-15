const CACHE_NAME = "swdemo-v3";
const INDEX_URL = new URL("./index.html", self.location).href;
const APP_ASSETS = [
    new URL("./", self.location).href,
    INDEX_URL,
    new URL("./app.js", self.location).href,
    new URL("./app.css", self.location).href
];

self.addEventListener("install", function(event) {
    event.waitUntil(
        (async function() {
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(APP_ASSETS);
            await self.skipWaiting();
        })()
    );
});

self.addEventListener("activate", function(event) {
    event.waitUntil(
        (async function() {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter(function(key) {
                        return key !== CACHE_NAME;
                    })
                    .map(function(key) {
                        return caches.delete(key);
                    })
            );
            await self.clients.claim();
        })()
    );
});

self.addEventListener("fetch", function(event) {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        (async function() {
            const cache = await caches.open(CACHE_NAME);

            if (event.request.mode === "navigate") {
                const cachedIndex = await cache.match(INDEX_URL);
                if (cachedIndex) {
                    return cachedIndex;
                }

                return fetch(event.request);
            }

            const cached = await cache.match(event.request, { ignoreSearch: true });
            if (cached) {
                return cached;
            }

            const networkResponse = await fetch(event.request);
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
        })()
    );
});
