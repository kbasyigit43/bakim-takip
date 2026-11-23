const C = 'major-bakim-v2';

const F = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(C).then(cache => cache.addAll(F))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith('major-bakim-') && key !== C)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (
    request.method !== 'GET' ||
    new URL(request.url).origin !== location.origin
  ) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && !request.url.includes('data.json')) {
          const copy = response.clone();
          caches.open(C).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cache = await caches.open(C);
        return (await cache.match(request)) || (await cache.match('index.html'));
      })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
