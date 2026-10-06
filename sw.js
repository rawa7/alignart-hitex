// Network-first so redeploys show up immediately; the cache only keeps the booth running if the venue Wi-Fi drops.
const CACHE = "hitex-lucky-bag-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/alignart-logo-on-dark.png",
  "./assets/logo-mark.svg",
  "./assets/alignart-app-qr.svg",
  "./assets/app-icon-512.png",
  "./assets/fonts/Poppins-Bold.ttf",
  "./assets/fonts/Poppins-SemiBold.ttf",
  "./assets/fonts/OpenSans-Regular.ttf",
  "./assets/fonts/OpenSans-SemiBold.ttf",
  "./assets/fonts/NotoSansArabic-Regular.ttf",
  "./assets/fonts/NotoSansArabic-Bold.ttf",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(request, { cache: "no-cache" })
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true })),
  );
});
