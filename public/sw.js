/* Service worker Greenhouse Lab.
 * Tujuan: halaman belajar publik tetap bisa dibuka saat sinyal buruk.
 * PRIVASI: rute admin, API, dan penelitian TIDAK PERNAH di-cache atau dicegat. */
const VERSION = "gl-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const MAX_PAGES = 60;
const PRECACHE = ["/offline", "/", "/materi", "/simulasi", "/eksperimen", "/glosarium"];
const NEVER_HANDLE = ["/api/", "/admin", "/penelitian", "/auth"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok && res.type === "basic") cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const res = await fetch(request);
    if (res && res.ok && res.type === "basic") {
      cache.put(request, res.clone()).then(() => trim(PAGE_CACHE, MAX_PAGES));
    }
    return res;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const offline = await cache.match("/offline");
      if (offline) return offline;
    }
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER_HANDLE.some((p) => url.pathname.startsWith(p))) return;
  if (request.headers.has("authorization")) return;

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/pwa-icon" ||
    /\.(?:png|jpe?g|svg|webp|ico|woff2?|css|js)$/.test(url.pathname);

  event.respondWith(isStatic ? staleWhileRevalidate(request) : networkFirst(request));
});
