const CACHE_NAME = 'pocket-split-shell-v3';
const SHELL_PATHS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_PATHS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Safari refuses to let a service worker fulfil a navigation with a
// Response whose `.redirected` flag is true (Chrome tolerates this,
// Safari throws "Response served by service worker has redirections").
// Rebuild a clean, non-redirected Response with the same body/status
// before handing it back.
async function stripRedirectFlag(response) {
  if (!response || !response.redirected) return response;
  const body = await response.blob();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

// Network-first for the app shell: while this is actively being developed,
// always prefer the latest deployed version when online. The cache is only
// a fallback for offline use, not the default source of truth.
//
// Important: `fetch(event.request)` alone can still be quietly satisfied
// from the browser's ordinary HTTP cache, even though this looks like a
// "network" request — that's what let people get stuck on old versions
// despite this being called "network-first." Explicitly passing
// `cache: 'no-store'` forces a genuine round-trip to the server every time.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  const isShellFile = url.origin === self.location.origin && SHELL_PATHS.includes(url.pathname);
  if (!isShellFile) return;

  event.respondWith(
    fetch(event.request.url, { cache: 'no-store' })
      .then(stripRedirectFlag)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
