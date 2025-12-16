const CACHE_NAME = 'geologger-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Don't fail if some URLs can't be cached
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('Failed to cache some resources:', error);
        });
      })
  );
  // Activate immediately without waiting for other service workers
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Don't cache API requests or Next.js internal requests
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/_next/') ||
      url.pathname.startsWith('/sw.js')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise fetch from network
        return fetch(event.request).catch(() => {
          // If network fails and it's a navigation request, return a basic offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-locations') {
    event.waitUntil(syncLocations());
  }
});

// Periodic background sync for location logging (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-location-sync') {
    event.waitUntil(syncLocations());
  }
});

async function syncLocations() {
  try {
    console.log('Background sync triggered - syncing locations');
    
    // Get all clients (open app instances)
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
      type: 'window'
    });
    
    // Notify all clients to sync
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_LOCATIONS',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'LOG_LOCATION') {
    // Store location in IndexedDB for later sync
    event.waitUntil(storeLocationForSync(event.data.location));
  }
});

async function storeLocationForSync(location) {
  try {
    // Open IndexedDB
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('GeoLoggerDB', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('locations')) {
          const store = db.createObjectStore('locations', { keyPath: 'id', autoIncrement: true });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
    
    const transaction = db.transaction(['locations'], 'readwrite');
    const store = transaction.objectStore('locations');
    await store.add({
      ...location,
      synced: false,
      timestamp: location.timestamp || new Date().toISOString()
    });
    
    console.log('Location stored for sync:', location);
  } catch (error) {
    console.error('Failed to store location for sync:', error);
  }
}

