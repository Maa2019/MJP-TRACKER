/* MJP Tracker service worker
   IMPORTANT: every time you re-upload index.html, change the number in
   CACHE below (v2-1 -> v2-2 -> v2-3 ...). That is what tells the phones
   an update exists. If you forget, trainers keep seeing the old app. */
const CACHE = 'mjp-v2-2';
const FILES = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network first, so a fresh upload shows up as soon as there is signal.
   Falls back to cache when the trainer is offline in the field. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
