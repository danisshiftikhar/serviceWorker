const CACHE_NAME = "my-cache-v3";
const API_PRODUCTS_BASE_URL = "https://dummyjson.com/products";

self.addEventListener("install", (event) => {
  console.log("installing service worker");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Cache the API response for the product data
        return cache.addAll([API_PRODUCTS_BASE_URL]);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(handleActivation());
});

const handleActivation = async () => {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((cacheName) => {
      if (cacheName !== CACHE_NAME) {
        return caches.delete(cacheName);
      }
    })
  );

  console.log("Service worker activated.");
};

self.addEventListener("fetch", (event) => {
  // Intercept fetch requests for the API_PRODUCTS_BASE_URL
  if (event.request.url.startsWith(API_PRODUCTS_BASE_URL)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            // If the response is present in the cache, return it
            return response;
          } else {
            // If the response is not present in the cache, fetch it from the network
            return fetch(event.request).then((networkResponse) => {
              // Cache the fetched response for future use
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
        });
      })
    );
  }
});
