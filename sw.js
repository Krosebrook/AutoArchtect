
const CACHE_NAME = 'autoarchitect-v2.5-prod';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => key !== CACHE_NAME && caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // AI API Calls: Network Only
  if (url.hostname.includes('googleapis.com')) {
    event.respondWith(fetch(event.request).catch(() => {
      return new Response(JSON.stringify({ error: "Offline: Synthesis Engine requires Uplink." }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }));
    return;
  }

  // Application Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request).then((res) => {
        const cacheCopy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
        return res;
      }).catch(() => null);
      return cached || networked;
    })
  );
});
