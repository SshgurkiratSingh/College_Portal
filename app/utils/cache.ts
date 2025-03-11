export interface CachedData<T> {
  data: T;
  timestamp: number;
  expires?: number; // Optional expiration timestamp
}

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  namespace?: string; // Namespace for the cache
}

const DEFAULT_TTL = 1000 * 200; // 200 seconds

/**
 * Utility class for managing offline cache with IndexedDB
 */
export class CacheManager {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'app-cache', version: number = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve(this.db);
      }

      if (typeof window === 'undefined') {
        return reject('IndexedDB is not available in server-side environment');
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => {
        console.error('Error opening IndexedDB', event);
        reject('Error opening IndexedDB');
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('offline-actions')) {
          db.createObjectStore('offline-actions', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const request = store.get(key);

        request.onerror = () => {
          reject('Error fetching from cache');
        };

        request.onsuccess = () => {
          const cachedItem = request.result as { key: string, value: CachedData<T> } | undefined;

          if (!cachedItem) {
            resolve(null);
            return;
          }

          if (cachedItem.value.expires && cachedItem.value.expires < Date.now()) {
            this.delete(key).catch(console.error);
            resolve(null);
            return;
          }

          resolve(cachedItem.value.data);
        };
      });
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, config: CacheConfig = {}): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');

        const now = Date.now();
        const ttl = config.ttl ?? DEFAULT_TTL;
        const expires = ttl > 0 ? now + ttl : undefined;

        const cachedValue: CachedData<T> = {
          data: value,
          timestamp: now,
          expires,
        };

        const request = store.put({ key, value: cachedValue });

        request.onerror = () => {
          reject('Error writing to cache');
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const request = store.delete(key);

        request.onerror = () => {
          reject('Error deleting from cache');
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Cache delete error:', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const request = store.clear();

        request.onerror = () => {
          reject('Error clearing cache');
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  async storeOfflineAction(actionType: string, url: string, payload: any): Promise<number> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['offline-actions'], 'readwrite');
        const store = transaction.objectStore('offline-actions');

        const action = {
          actionType,
          url,
          payload,
          timestamp: Date.now(),
        };

        const request = store.add(action);

        request.onerror = () => {
          reject('Error storing offline action');
        };

        request.onsuccess = () => {
          resolve(request.result as number);
        };
      });
    } catch (error) {
      console.error('Store offline action error:', error);
      throw error;
    }
  }

  async getPendingOfflineActions(): Promise<any[]> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['offline-actions'], 'readonly');
        const store = transaction.objectStore('offline-actions');
        const request = store.getAll();

        request.onerror = () => {
          reject('Error fetching offline actions');
        };

        request.onsuccess = () => {
          resolve(request.result || []);
        };
      });
    } catch (error) {
      console.error('Get offline actions error:', error);
      return [];
    }
  }

  async removeOfflineAction(id: number): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['offline-actions'], 'readwrite');
        const store = transaction.objectStore('offline-actions');
        const request = store.delete(id);

        request.onerror = () => {
          reject('Error removing offline action');
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Remove offline action error:', error);
      throw error;
    }
  }
}

// Singleton instance of the cache manager
export const cacheManager = new CacheManager();