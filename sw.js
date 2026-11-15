/**
 * MedDiet Pro — Service Worker Ligero para Caché Offline y Carga Instantánea
 * Permite consultar el plan semanal, las 200 recetas y la lista de la compra
 * dentro del supermercado o en la cocina sin conexión a internet.
 */

const CACHE_NAME = 'meddiet-pro-cache-v4';
const STATIC_ASSETS = [
  './',
  'manifest.webmanifest',
  'assets/css/styles.css',
  'assets/js/app.js',
  'assets/js/engine.js',
  'assets/js/recipes_catalog.js',
  'assets/img/arroz_cubana.jpg',
  'assets/img/legumbres.jpg',
  'assets/img/garbanzos.jpg',
  'assets/img/alubias_ensalada.jpg',
  'assets/img/pescado.jpg',
  'assets/img/pescado_horno.jpg',
  'assets/img/pescado_azul.jpg',
  'assets/img/aves.jpg',
  'assets/img/guiso_ave.jpg',
  'assets/img/conejo_pollo_ajillo.jpg',
  'assets/img/albondigas_salsa.jpg',
  'assets/img/verduras.jpg',
  'assets/img/tortilla.jpg',
  'assets/img/revuelto.jpg',
  'assets/img/crema_verduras.jpg',
  'assets/img/gazpacho_salmorejo.jpg',
  'assets/img/verduras_rellenas.jpg',
  'assets/img/ensalada_huerta.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // No cachear descargas pesadas ZIP ni llamadas a API dinámicas
  if (url.pathname.endsWith('.zip') || url.pathname.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
