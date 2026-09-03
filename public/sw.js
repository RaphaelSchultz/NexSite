const CACHE_NAME = "nexnotas-app-shell-v2";
const APP_SHELL = ["/", "/dashboard", "/offline", "/manifest.webmanifest", "/favicon.svg", "/favicon.png", "/android-chrome-512x512.png", "/apple-touch-icon.png"];

function isPrivateRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith("/api/") || url.pathname.includes("/notas/") && (url.pathname.endsWith("/xml") || url.pathname.endsWith("/danfse"));
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || isPrivateRequest(request)) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline").then((response) => response || caches.match("/dashboard"))));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const safeAsset = ["/assets/", "/favicon", "/logo-", "/android-chrome", "/apple-touch-icon", "/manifest.webmanifest"].some((prefix) => url.pathname.startsWith(prefix));
      if (!safeAsset || !response.ok || response.type !== "basic") return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    })),
  );
});
