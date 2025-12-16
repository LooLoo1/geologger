import type { LocationLog } from '@geologger/libs/types/location';

const DB_NAME = 'GeoLoggerDB';
const STORE_NAME = 'locations';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('userId', 'userId', { unique: false });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

export const storageService = {
  saveLocationOffline: async (location: LocationLog): Promise<void> => {
    try {
      const database = await initDB();
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      await new Promise<void>((resolve, reject) => {
        const locationId = location.id || `${location.userId}_${location.timestamp}`;
        const request = store.add({
          ...location,
          id: locationId,
          synced: false,
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to save location'));
      });
    } catch (error) {
      throw error;
    }
  },

  getUnsyncedLocations: async (): Promise<LocationLog[]> => {
    try {
      const database = await initDB();
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const locations = request.result
            .filter((item: LocationLog & { synced?: boolean }) => !item.synced)
            .map((item: LocationLog & { synced?: boolean }) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { synced, ...location } = item;
              return location;
            });
          resolve(locations);
        };
        request.onerror = () => reject(new Error('Failed to get unsynced locations'));
      });
    } catch {
      return [];
    }
  },

  markLocationsAsSynced: async (locationIds: string[]): Promise<void> => {
    try {
      const database = await initDB();
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const promises = locationIds.map(id => {
        return new Promise<void>((resolve, reject) => {
          const request = store.get(id);
          request.onsuccess = () => {
            const data = request.result;
            if (data) {
              data.synced = true;
              const updateRequest = store.put(data);
              updateRequest.onsuccess = () => resolve();
              updateRequest.onerror = () => reject(new Error('Failed to mark as synced'));
            } else {
              resolve();
            }
          };
          request.onerror = () => reject(new Error('Failed to get location'));
        });
      });
      
      await Promise.all(promises);
    } catch (error) {
      throw error;
    }
  },
};

