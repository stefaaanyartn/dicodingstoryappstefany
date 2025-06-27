const CACHE_NAME = 'story-app-v1';
const IMAGE_CACHE = 'story-images';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/bundle.js',
  '/styles.css',
  '/icons/web-app-manifest-192x192.png',
  '/icons/web-app-manifest-512x512.png',
  '/icons/favicon-96x96.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== IMAGE_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  if (
    url.includes('/sockjs-node') ||
    request.headers.get('accept')?.includes('text/event-stream')
  ) {
    return;
  }

  if (url.includes('favicon')) {
    return;
  }

  const isImageFromAPI =
    request.destination === 'image' &&
    url.includes('https://story-api.dicoding.dev/images/stories/');

  if (isImageFromAPI) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (err) {
          console.warn('Image fetch failed:', url, err);
          return new Response('', { status: 503, statusText: 'Image unavailable' });
        }
      })
    );
    return;
  }

  if (STATIC_ASSETS.includes(new URL(url).pathname)) {
    event.respondWith(
      caches.match(request).then((res) => res || fetch(request))
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
