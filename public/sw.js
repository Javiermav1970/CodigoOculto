const CACHE_NAME = 'codigo-oculto-v1';
const ASSETS = [
  './index.html',
  // 💡 ¡CONEXIÓN MAESTRA DE ESTILOS FRAGMENTADOS!:
  './index.css',
  './style/variables.css',
  './style/base-ui.css',
  './style/gameplay.css',
  './style/multiplayer.css',
  './style/log-overlays.css',
  // Scripts principales del juego
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

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('socket.io') || e.request.url.startsWith('http')) return;
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
