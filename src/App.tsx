import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { restoreAuthState } from './store/slices/authSlice';

import Header from '@/components/Header';
import Footer from './components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

// Pages
import routes from './routes';

const queryClient = new QueryClient();

/**
 * Inner component that uses useLocation to conditionally render header/footer
 */
const AppContent = () => {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');

  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [authRestored, setAuthRestored] = useState(false);

  useEffect(() => {
    // Restore authentication state from localStorage on app load
    // Wait for the async thunk to finish before rendering private routes
    (dispatch(restoreAuthState()) as any).finally(() => setAuthRestored(true));
  }, [dispatch]);

  // Helper to recursively render routes and subroutes
  const renderRoutes = (routesArr) =>
    routesArr.map((route) => {
      // Render public routes always
      if (route.public) {
        if (route.subroutes && Array.isArray(route.subroutes)) {
          return (
            <Route key={route.key} path={route.path} element={route.element}>
              {renderRoutes(route.subroutes)}
            </Route>
          );
        }
        return <Route key={route.key} path={route.path} element={route.element} />;
      }
      // Render private routes only if authenticated
      if (!route.public && isAuthenticated) {
        if (route.subroutes && Array.isArray(route.subroutes)) {
          return (
            <Route key={route.key} path={route.path} element={route.element}>
              {renderRoutes(route.subroutes)}
            </Route>
          );
        }
        return <Route key={route.key} path={route.path} element={route.element} />;
      }
      // Don't render anything for private routes when not authenticated
      return null;
    });

  if (!authRestored) return null;

  return (
    <>
      <ScrollToTop />
      {!isDashboard && <Header />}
      <Routes>{renderRoutes(routes)}</Routes>
      {!isDashboard && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
