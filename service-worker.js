// Service Worker for Ethical Hacker PWA
const CACHE_NAME = 'ethical-hacker-v1.2.0';

// Get the base path for GitHub Pages (handles repository subdirectory)
const basePath = self.location.pathname.split('/').slice(0, -1).join('/') || '';

// Function to get full URL for caching
function getCacheUrl(path) {
  // If path starts with /, use it as-is, otherwise prepend basePath
  if (path.startsWith('/')) {
    return new URL(path, self.location.origin).href;
  } else {
    return new URL(basePath + '/' + path, self.location.origin).href;
  }
}

const urlsToCache = [
  getCacheUrl('index.html'),
  getCacheUrl('styles.css'),
  getCacheUrl('game.js'),
  getCacheUrl('gamepad.js'),
  getCacheUrl('leaderboard.js'),
  getCacheUrl('sound-generator.js'),
  getCacheUrl('manifest.json')
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        // Cache files one by one to handle failures gracefully
        return Promise.allSettled(
          urlsToCache.map(url => 
            fetch(url)
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                } else {
                  console.warn('Service Worker: Failed to cache', url, response.status);
                }
              })
              .catch(error => {
                console.warn('Service Worker: Error caching', url, error);
              })
          )
        );
      })
      .then(() => {
        console.log('Service Worker: Cache complete');
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all old caches
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        // Force reload all clients to get new version
        return self.clients.claim();
      });
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, return offline page if available
        if (event.request.destination === 'document') {
          return caches.match(getCacheUrl('index.html'));
        }
        // Return a basic offline response for other requests
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});

// Handle background sync (for future features)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-leaderboard') {
    event.waitUntil(syncLeaderboard());
  }
});

function syncLeaderboard() {
  // Future: Sync leaderboard data when online
  return Promise.resolve();
}

