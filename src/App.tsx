import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import { SplashScreenEnhanced } from "./components/SplashScreenEnhanced";
import { PWAInstaller } from "./components/PWAInstaller";
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { OfflineFallback } from "./components/OfflineFallback";
import { registerServiceWorker } from "./utils/pwaUtils";
import { ErrorBoundary } from "./components/ui/error-boundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on network errors when offline
        if (!navigator.onLine) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineFallback, setShowOfflineFallback] = useState(false);

  useEffect(() => {
    // Register enhanced service worker
    registerServiceWorker();

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineFallback(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      // Show offline fallback after a delay to avoid flashing
      setTimeout(() => {
        if (!navigator.onLine) {
          setShowOfflineFallback(true);
        }
      }, 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // App initialization
    const initializeApp = async () => {
      try {
        // Simulate app initialization with realistic timing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if we're in standalone mode (PWA)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone ||
                            document.referrer.includes('android-app://');
        
        if (isStandalone) {
          console.log('App running in PWA mode');
        }
        
        setIsAppReady(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsAppReady(true); // Continue anyway
      }
    };

    initializeApp();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Show offline fallback if we're offline and the page failed to load
  if (!isOnline && showOfflineFallback) {
    return <OfflineFallback />;
  }

  if (isLoading) {
    return (
      <SplashScreenEnhanced 
        onComplete={handleLoadingComplete}
        duration={3000}
      />
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <PWAInstaller />
          <PWAUpdatePrompt />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/results" element={
                <AuthLayout>
                  <Results />
                </AuthLayout>
              } />
              <Route path="/" element={
                <AuthLayout>
                  <Index />
                </AuthLayout>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;