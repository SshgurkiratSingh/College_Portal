import { useState, useEffect } from 'react';

/**
 * Utility to track online/offline status
 * @returns An object with isOnline boolean and events to subscribe to status changes
 */
export const NetworkStatus = {
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  
  // Event listeners
  listeners: new Set<(online: boolean) => void>(),
  
  // Subscribe to network status changes
  subscribe(callback: (online: boolean) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  },
  
  // Notify all listeners about status change
  notify(online: boolean) {
    this.isOnline = online;
    this.listeners.forEach(listener => listener(online));
  },
  
  // Initialize event listeners
  init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.notify(true));
      window.addEventListener('offline', () => this.notify(false));
    }
  }
};

// Initialize the network status listeners
NetworkStatus.init();

/**
 * React hook to use network status in components
 * @returns Current online/offline status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(NetworkStatus.isOnline);
  
  useEffect(() => {
    const unsubscribe = NetworkStatus.subscribe((online) => {
      setIsOnline(online);
    });
    
    return unsubscribe;
  }, []);
  
  return isOnline;
}