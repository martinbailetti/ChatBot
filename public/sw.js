// Service Worker básico para Chatbot Demo
// Estrategia: cache-first para assets estáticos, network-first para navegación

const CACHE_NAME = 'chatbot-demo-v1'

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo intercepta peticiones del mismo origen
  if (url.origin !== location.origin) return

  // Navegación: network-first con fallback a index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html')
      )
    )
    return
  }

  // Assets estáticos: cache-first
  event.respondWith(
    caches.match(request).then(
      (cached) => cached ?? fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    )
  )
})
