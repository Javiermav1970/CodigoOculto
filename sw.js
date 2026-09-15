const CACHE_NAME = 'codigo-oculto-v1';
const ASSETS = [
  './index.html',
  './index.css',
  './main.js',
  './config.js',
  './dom.js',
  './fx.js',
  './match.js',
  './mode-multi.js',
  './notes.js',
  './referee.js',
  './rooms.js',
  './timer.js',
  './ui.js',
  './audio.js',
  './image_uU8_cv.png'
];

// Instalar el Service Worker y almacenar en caché la interfaz visual
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar peticiones para carga instantánea offline de la UI
self.addEventListener('fetch', (e) => {
  // Ignorar las llamadas de WebSockets (Socket.io) para que viajen directo a Render
  if (e.request.url.includes('socket.io') || e.request.url.startsWith('http')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
