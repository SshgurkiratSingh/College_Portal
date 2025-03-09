import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { cacheManager } from './cache';
import { NetworkStatus } from './networkStatus';

// Default cache TTL for different request types
const DEFAULT_CACHE_TTL = {
  GET: 1000 * 60 * 60, // 1 hour for GET requests
  POST: 0, // No caching for POST by default
  PUT: 0, // No caching for PUT by default
  DELETE: 0, // No caching for DELETE by default
};

export interface ApiClientOptions {
  cacheEnabled?: boolean;
  cacheTTL?: number;
  offlineEnabled?: boolean;
  forceNetwork?: boolean;
}

/**
 * Enhanced API client with caching and offline capability
 */
const apiClient = {
  /**
   * Make a GET request with caching support
   * @param url API URL to call
   * @param options Configuration options
   * @returns Promise with response data
   */
  async get<T>(url: string, options: ApiClientOptions = {}): Promise<T> {
    const {
      cacheEnabled = true,
      cacheTTL = DEFAULT_CACHE_TTL.GET,
      offlineEnabled = true,
      forceNetwork = false,
    } = options;
    
    // Create cache key based on URL
    const cacheKey = `get:${url}`;
    
    try {
      // Check if we should try to use cached data
      if (cacheEnabled && !forceNetwork) {
        const cachedData = await cacheManager.get<T>(cacheKey);
        if (cachedData) {
          console.log(`Using cached data for ${url}`);
          return cachedData;
        }
      }
      
      // If we're offline and there's no cached data, throw an error
      if (!NetworkStatus.isOnline && offlineEnabled) {
        throw new Error('You are currently offline and no cached data is available');
      }
      
      // Make the actual API call
      const response = await axios.get<T>(url);
      
      // Cache the response if caching is enabled
      if (cacheEnabled && response.data) {
        await cacheManager.set(cacheKey, response.data, { ttl: cacheTTL });
      }
      
      return response.data;
    } catch (error) {
      console.error(`API Client GET error for ${url}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a POST request with offline support
   * @param url API URL to call
   * @param data Data to send
   * @param options Configuration options
   * @returns Promise with response data
   */
  async post<T>(url: string, data: any, options: ApiClientOptions = {}): Promise<T> {
    const {
      cacheEnabled = false,
      cacheTTL = DEFAULT_CACHE_TTL.POST,
      offlineEnabled = true,
    } = options;
    
    try {
      // Check if we're offline
      if (!NetworkStatus.isOnline) {
        if (offlineEnabled) {
          // Store the action to be performed when back online
          await cacheManager.storeOfflineAction('POST', url, data);
          console.log(`Stored offline POST action for ${url}`);
          // Return optimistic response or throw an error
          return { success: true, offlineQueued: true } as any as T;
        } else {
          throw new Error('You are currently offline and offline mode is disabled');
        }
      }
      
      // Make the actual API call
      const response = await axios.post<T>(url, data);
      
      // Cache the response if needed
      if (cacheEnabled && response.data) {
        const cacheKey = `post:${url}:${JSON.stringify(data)}`;
        await cacheManager.set(cacheKey, response.data, { ttl: cacheTTL });
      }
      
      return response.data;
    } catch (error) {
      console.error(`API Client POST error for ${url}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a PUT request with offline support
   * @param url API URL to call
   * @param data Data to send
   * @param options Configuration options
   * @returns Promise with response data
   */
  async put<T>(url: string, data: any, options: ApiClientOptions = {}): Promise<T> {
    const {
      cacheEnabled = false,
      cacheTTL = DEFAULT_CACHE_TTL.PUT,
      offlineEnabled = true,
    } = options;
    
    try {
      // Check if we're offline
      if (!NetworkStatus.isOnline) {
        if (offlineEnabled) {
          // Store the action to be performed when back online
          await cacheManager.storeOfflineAction('PUT', url, data);
          console.log(`Stored offline PUT action for ${url}`);
          // Return optimistic response or throw an error
          return { success: true, offlineQueued: true } as any as T;
        } else {
          throw new Error('You are currently offline and offline mode is disabled');
        }
      }
      
      // Make the actual API call
      const response = await axios.put<T>(url, data);
      
      // Cache the response if needed
      if (cacheEnabled && response.data) {
        const cacheKey = `put:${url}:${JSON.stringify(data)}`;
        await cacheManager.set(cacheKey, response.data, { ttl: cacheTTL });
      }
      
      return response.data;
    } catch (error) {
      console.error(`API Client PUT error for ${url}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a DELETE request with offline support
   * @param url API URL to call
   * @param options Configuration options
   * @returns Promise with response data
   */
  async delete<T>(url: string, options: ApiClientOptions = {}): Promise<T> {
    const { offlineEnabled = true } = options;
    
    try {
      // Check if we're offline
      if (!NetworkStatus.isOnline) {
        if (offlineEnabled) {
          // Store the action to be performed when back online
          await cacheManager.storeOfflineAction('DELETE', url, {});
          console.log(`Stored offline DELETE action for ${url}`);
          // Return optimistic response or throw an error
          return { success: true, offlineQueued: true } as any as T;
        } else {
          throw new Error('You are currently offline and offline mode is disabled');
        }
      }
      
      // Make the actual API call
      const response = await axios.delete<T>(url);
      return response.data;
    } catch (error) {
      console.error(`API Client DELETE error for ${url}:`, error);
      throw error;
    }
  },
  
  /**
   * Process any pending offline actions
   * @returns Number of processed actions
   */
  async processPendingOfflineActions(): Promise<number> {
    if (!NetworkStatus.isOnline) {
      console.log('Still offline, cannot process pending actions');
      return 0;
    }
    
    try {
      const pendingActions = await cacheManager.getPendingOfflineActions();
      console.log(`Found ${pendingActions.length} pending offline actions`);
      
      if (pendingActions.length === 0) return 0;
      
      let processed = 0;
      
      for (const action of pendingActions) {
        try {
          switch (action.actionType) {
            case 'POST':
              await axios.post(action.url, action.payload);
              break;
            case 'PUT':
              await axios.put(action.url, action.payload);
              break;
            case 'DELETE':
              await axios.delete(action.url);
              break;
            // Add other actions as needed
          }
          
          // Remove the action after processing
          await cacheManager.removeOfflineAction(action.id);
          processed++;
        } catch (error) {
          console.error(`Failed to process offline action: ${action.actionType} ${action.url}`, error);
        }
      }
      
      return processed;
    } catch (error) {
      console.error('Error processing offline actions:', error);
      return 0;
    }
  },
  
  /**
   * Clear cached data
   * @param cacheKey Optional specific key to clear, clears all if not provided
   */
  async clearCache(cacheKey?: string): Promise<void> {
    if (cacheKey) {
      await cacheManager.delete(cacheKey);
    } else {
      // TODO: Add method to clear all cache if needed
    }
  }
};

// Setup listener to process offline actions when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online, processing pending actions');
    apiClient.processPendingOfflineActions();
  });
}

export default apiClient;