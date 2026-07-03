/**
 * Offline service worker.
 *
 * Strategy:
 *  - Navigations (index.html): network-first so app updates land promptly,
 *    falling back to cache when offline.
 *  - Same-origin assets (hashed by Vite, immutable) and Google Fonts:
 *    cache-first with background fill.
 * Bump VERSION to invalidate old caches on deploy.
 */

const VERSION = 'v3';
const CACHE = `mahjong-${VERSION}`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  // Precache the shell AND the hashed assets it references — assets loaded
  // before the SW controls the page would otherwise never enter the cache,
  // leaving the first offline reload broken.
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch('./', { cache: 'no-cache' });
      await cache.put('./', res.clone());
      const html = await res.text();
      const urls = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css|png|svg|webmanifest))"/g)]
        .map((m) => m[1]);
      await Promise.all(urls.map((u) => cache.add(u).catch(() => {})));
    } catch {
      // offline install — runtime caching will fill in later
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !isFont) return;

  if (request.mode === 'navigate') {
    // Network-first for the app shell.
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match('./')))
    );
    return;
  }

  // Cache-first for assets and fonts.
  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((res) => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
