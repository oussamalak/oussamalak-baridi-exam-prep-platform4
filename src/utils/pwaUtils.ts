// Enhanced PWA utility functions with better error handling and features

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  // Check if running in StackBlitz or WebContainer environment
  if (window.location.hostname.includes('stackblitz.io') || 
      window.location.hostname.includes('webcontainer.io') ||
      window.location.hostname.includes('bolt.new')) {
    console.log('Service Workers are not supported in this environment (StackBlitz/WebContainer)');
    return null;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify the app
              window.dispatchEvent(new CustomEvent('sw-update-available'));
            }
          });
        }
      });
      
      // Check for updates every 60 seconds when the app is active
      setInterval(() => {
        if (document.visibilityState === 'visible') {
          registration.update();
        }
      }, 60000);
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const result = await registration.unregister();
        console.log('Service Worker unregistered:', result);
        return result;
      }
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
  return false;
};

export const checkForUpdates = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return true;
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }
  return false;
};

export const isStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
};

export const isPWAInstallable = (): boolean => {
  return 'serviceWorker' in navigator && 
         !isStandalone() && 
         (window.location.protocol === 'https:' || window.location.hostname === 'localhost');
};

export const getInstallPrompt = (): Promise<Event | null> => {
  return new Promise((resolve) => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      resolve(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      resolve(null);
    }, 10000);
  });
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }
  return 'denied';
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      ...options,
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }
};

export const addToHomeScreen = (): void => {
  // For iOS Safari
  if ((navigator as any).standalone === false) {
    // Show instructions for iOS
    alert('لإضافة التطبيق إلى الشاشة الرئيسية:\n1. اضغط على زر المشاركة\n2. اختر "إضافة إلى الشاشة الرئيسية"');
  }
};

// Enhanced cache management utilities
export const clearAppCache = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('App cache cleared');
      
      // Also clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear IndexedDB if needed
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            if (db.name) {
              return new Promise((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(db.name!);
                deleteReq.onsuccess = () => resolve(undefined);
                deleteReq.onerror = () => reject(deleteReq.error);
              });
            }
          })
        );
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
};

export const getCacheSize = async (): Promise<number> => {
  if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.error('Failed to get cache size:', error);
    }
  }
  return 0;
};

// Enhanced network status utilities
export const getNetworkStatus = (): {
  isOnline: boolean;
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} => {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  return {
    isOnline: navigator.onLine,
    connectionType: connection?.type,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  };
};

export const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
};

// Performance monitoring
export const measurePerformance = (): {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
} => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  return {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
  };
};

// App update utilities
export const skipWaiting = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
};

export const reloadApp = (): void => {
  window.location.reload();
};

// Device capabilities detection
export const getDeviceCapabilities = () => {
  return {
    standalone: isStandalone(),
    installable: isPWAInstallable(),
    notifications: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    storage: 'storage' in navigator,
    indexedDB: 'indexedDB' in window,
    webShare: 'share' in navigator,
    clipboard: 'clipboard' in navigator,
    geolocation: 'geolocation' in navigator,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    vibration: 'vibrate' in navigator,
    battery: 'getBattery' in navigator,
    connection: 'connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator,
  };
};

// App installation tracking
export const trackInstallation = () => {
  // Track when app is installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    // You can send analytics here
  });
  
  // Track when install prompt is shown
  window.addEventListener('beforeinstallprompt', () => {
    console.log('Install prompt shown');
    // You can send analytics here
  });
};

// Initialize PWA utilities
export const initializePWA = () => {
  trackInstallation();
  
  // Log device capabilities
  console.log('Device capabilities:', getDeviceCapabilities());
  
  // Log performance metrics after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('Performance metrics:', measurePerformance());
    }, 1000);
  });
};