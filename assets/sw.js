/* Tá Rolando? — service worker (app instalável e modo sem internet) */
const VERSION = "__VERSION__";
const BASE = "__BASE__";
const STATIC = "tr-static-" + VERSION;
const PAGES = "tr-pages";
const PRECACHE = [BASE + "/", BASE + "/offline/", BASE + "/indice.js?v=" + VERSION, BASE + "/style.css?v=" + VERSION, BASE + "/app.js?v=" + VERSION, BASE + "/icons/icon-192.png", BASE + "/manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(STATIC).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("tr-static-") && k !== STATIC).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Páginas e previsão: tenta a internet primeiro (previsão sempre nova) e guarda uma cópia.
// Sem internet: mostra a última cópia salva.
async function networkFirst(req) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(req);
    if (res.ok) { await cache.put(req, res.clone()); trim(cache); }
    return res;
  } catch (e) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === "navigate") return (await caches.match(BASE + "/offline/")) || Response.error();
    return Response.error();
  }
}
async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - 80; i++) await cache.delete(keys[i]);
}
// Arquivos fixos (estilo, scripts, ícones, fontes): usa o que já está salvo.
async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") (await caches.open(STATIC)).put(req, res.clone());
  return res;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html") || url.pathname.endsWith("/dados/hoje.json")) return e.respondWith(networkFirst(req));
    if (/\.(css|js|png|svg|webmanifest)$/.test(url.pathname)) return e.respondWith(cacheFirst(req));
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") return e.respondWith(cacheFirst(req));
});
