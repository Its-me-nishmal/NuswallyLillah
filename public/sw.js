// Service Worker for Nuswally Lillah PWA
// Version 1.4.0 - Fixed Offline CDN Resource Serving

const CACHE_VERSION = 'v1.4';
const CACHE_NAMES = {
  appShell: `app-shell-${CACHE_VERSION}`,
  static: `static-assets-${CACHE_VERSION}`,
  fonts: `fonts-${CACHE_VERSION}`,
  cdn: `cdn-resources-${CACHE_VERSION}`,
  data: `data-${CACHE_VERSION}`,
  quran: `quran-api-${CACHE_VERSION}`,
  pdfs: `pdfs-${CACHE_VERSION}`
};

// Install event - cache everything upfront
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v1.4...');

  event.waitUntil(
    Promise.all([
      // App shell
      caches.open(CACHE_NAMES.appShell).then(cache => {
        return cache.addAll(['/', '/index.html', '/offline.html', '/manifest.json'])
          .catch(err => console.warn('[SW] App shell warning:', err));
      }),

      // Tailwind CSS - cache with exact URL
      caches.open(CACHE_NAMES.cdn).then(cache => {
        const tailwindUrl = 'https://cdn.tailwindcss.com/';
        console.log('[SW] Caching Tailwind...');
        return fetch(tailwindUrl, { mode: 'cors', credentials: 'omit' })
          .then(response => {
            if (response.ok) {
              cache.put(tailwindUrl, response);
              // Also cache without trailing slash
              cache.put('https://cdn.tailwindcss.com', response.clone());
              console.log('[SW] ✓ Tailwind cached');
            }
            return response;
          })
          .catch(err => console.warn('[SW] Tailwind cache failed:', err));
      }),

      // Google Fonts CSS
      caches.open(CACHE_NAMES.fonts).then(cache => {
        const fontsUrl = 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Scheherazade+New:wght@400;500;600;700&display=swap';
        console.log('[SW] Caching Google Fonts CSS...');
        return fetch(fontsUrl, { mode: 'cors', credentials: 'omit' })
          .then(response => {
            if (response.ok) {
              cache.put(fontsUrl, response);
              console.log('[SW] ✓ Google Fonts CSS cached');
              // After caching fonts CSS, cache the font files themselves
              return response.clone().text().then(css => {
                // Extract font file URLs from CSS
                const fontUrls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)]
                  .map(match => match[1]);

                return Promise.all(fontUrls.map(fontUrl => {
                  return fetch(fontUrl, { mode: 'cors', credentials: 'omit' })
                    .then(r => r.ok && cache.put(fontUrl, r))
                    .catch(e => console.warn('[SW] Font file cache failed:', e));
                }));
              });
            }
          })
          .catch(err => console.warn('[SW] Fonts CSS cache failed:', err));
      }),

      // Quran surah list
      caches.open(CACHE_NAMES.quran).then(cache => {
        return fetch('https://quranapi.pages.dev/api/surah.json')
          .then(r => r.ok && cache.put('https://quranapi.pages.dev/api/surah.json', r))
          .catch(err => console.warn('[SW] Quran list cache failed:', err));
      })
    ])
      .then(() => {
        console.log('[SW] ✅ Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => !Object.values(CACHE_NAMES).includes(n))
          .map(n => caches.delete(n))
      ))
      .then(() => {
        console.log('[SW] ✅ Activated');
        return self.clients.claim();
      })
  );
});

// Fetch - CRITICAL: Must intercept ALL requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // === CDN TAILWIND ===
  if (url.hostname === 'cdn.tailwindcss.com') {
    event.respondWith(
      caches.open(CACHE_NAMES.cdn).then(cache => {
        return cache.match(event.request)
          .then(cached => {
            if (cached) {
              console.log('[SW] ✓ Serving Tailwind from cache');
              return cached;
            }
            console.log('[SW] ↓ Fetching Tailwind...');
            return fetch(event.request, { mode: 'cors', credentials: 'omit' })
              .then(response => {
                if (response.ok) {
                  cache.put(event.request, response.clone());
                }
                return response;
              });
          });
      }).catch(err => {
        console.error('[SW] ❌ Tailwind failed:', err);
        throw err;
      })
    );
    return;
  }

  // === GOOGLE FONTS CSS ===
  if (url.hostname === 'fonts.googleapis.com') {
    event.respondWith(
      caches.open(CACHE_NAMES.fonts).then(cache => {
        return cache.match(event.request)
          .then(cached => {
            if (cached) {
              console.log('[SW] ✓ Serving Google Fonts CSS from cache');
              return cached;
            }
            console.log('[SW] ↓ Fetching Google Fonts CSS...');
            return fetch(event.request, { mode: 'cors', credentials: 'omit' })
              .then(response => {
                if (response.ok) {
                  cache.put(event.request, response.clone());
                }
                return response;
              });
          });
      }).catch(err => {
        console.error('[SW] ❌ Google Fonts CSS failed:', err);
        throw err;
      })
    );
    return;
  }

  // === GOOGLE FONTS FILES ===
  if (url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_NAMES.fonts).then(cache => {
        return cache.match(event.request)
          .then(cached => {
            if (cached) {
              console.log('[SW] ✓ Font file from cache');
              return cached;
            }
            return fetch(event.request, { mode: 'cors', credentials: 'omit' })
              .then(response => {
                if (response.ok) {
                  cache.put(event.request, response.clone());
                }
                return response;
              });
          });
      })
    );
    return;
  }

  // === EXTERNAL JS MODULES ===
  if (url.hostname === 'aistudiocdn.com') {
    event.respondWith(cacheFirstCORS(event.request, CACHE_NAMES.cdn));
    return;
  }

  // === WIKIPEDIA/WIKIMEDIA ===
  if (url.hostname.includes('wikimedia.org') || url.hostname.includes('wikipedia.org')) {
    event.respondWith(cacheFirstCORS(event.request, CACHE_NAMES.static));
    return;
  }

  // === QURAN API ===
  if (url.hostname === 'quranapi.pages.dev') {
    event.respondWith(networkFirstQuran(event.request));
    return;
  }

  // === AUDIO (DON'T CACHE) ===
  if (url.hostname.includes('the-quran-project.github.io') ||
    url.hostname.includes('mp3quran.net') ||
    url.hostname.includes('archive.org')) {
    return; // Let browser handle
  }

  // === SAME-ORIGIN RESOURCES ===
  if (url.origin !== location.origin) {
    return;
  }

  // Local resources
  if (url.pathname.endsWith('.pdf') || url.pathname.includes('/pdfs/')) {
    event.respondWith(cacheFirst(event.request, CACHE_NAMES.pdfs));
  } else if (url.pathname.endsWith('.mp3')) {
    return; // Don't cache audio
  } else if (url.pathname.endsWith('.json') && url.pathname.includes('/services/')) {
    event.respondWith(networkFirst(event.request, CACHE_NAMES.data));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request, CACHE_NAMES.static));
  } else if (isBundleFile(url)) {
    event.respondWith(cacheFirst(event.request, CACHE_NAMES.appShell));
  } else {
    event.respondWith(cacheFirst(event.request, CACHE_NAMES.appShell));
  }
});

// Helpers
function isStaticAsset(url) {
  return ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.ico']
    .some(ext => url.pathname.endsWith(ext));
}

function isBundleFile(url) {
  return url.pathname.endsWith('.js') || url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.tsx') || url.pathname.includes('/assets/') ||
    url.pathname.includes('/@');
}

// Cache strategies
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function cacheFirstCORS(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request, { mode: 'cors', credentials: 'omit' });
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(cacheName);
    return cache.match(request);
  }
}

async function networkFirstQuran(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAMES.quran);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.open(CACHE_NAMES.quran).then(c => c.match(request));
  }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(caches.keys().then(n => Promise.all(n.map(c => caches.delete(c)))));
  }
});

console.log('[SW] 🚀 v1.4 Ready - Fixed offline CDN resource serving');