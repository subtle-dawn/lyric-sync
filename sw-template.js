// Generated as sw.js by build-pwa.cjs; cache version is based on file contents.
const VERSION = '__VERSION__';
const ASSETS = __ASSETS__;
const scopeURL = new URL(self.registration.scope);
const PREFIX = 'lyric-sync:' + scopeURL.pathname + ':';
const CACHE_NAME = PREFIX + VERSION;
const assetURLs = new Set(ASSETS.map(path => new URL(path, scopeURL).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Dictionaries are included so the first controlled offline launch is complete.
    await cache.addAll(ASSETS.map(path => new Request(new URL(path, scopeURL), { cache: 'reload' })));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(PREFIX) && name !== CACHE_NAME) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== scopeURL.origin || !url.pathname.startsWith(scopeURL.pathname)) return;
  // The root and localized license queries share the same static cached page.
  if (url.pathname === scopeURL.pathname) url.pathname += 'index.html';
  url.search = '';
  url.hash = '';
  if (!assetURLs.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url.href);
    if (cached) return cached;
    const response = await fetch(new Request(url.href, { cache: 'reload' }));
    if (response.ok) {
      try { await cache.put(url.href, response.clone()); } catch (_) { /* Storage may be full. */ }
    }
    return response;
  })());
});
