import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { MealProvider } from './context/MealContext';
import { LanguageProvider } from './context/LanguageContext';
import { supabase } from './lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { BarcodeScanner as NativeScanner } from '@capacitor-mlkit/barcode-scanning';
import Navigation from './components/Navigation';

// Eagerly load core pages
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';

// Lazy load feature/heavy pages
const Scanner = lazy(() => import('./pages/Scanner'));
const ScanResults = lazy(() => import('./pages/ScanResults'));
const Statistics = lazy(() => import('./pages/Statistics'));
const Profile = lazy(() => import('./pages/Profile'));
const AuthSignup = lazy(() => import('./pages/onboarding/AuthSignup'));
const AuthSignin = lazy(() => import('./pages/onboarding/AuthSignin'));
const DiscoverySource = lazy(() => import('./pages/onboarding/DiscoverySource'));
const GoalSelection = lazy(() => import('./pages/onboarding/GoalSelection'));
const PersonalDetails = lazy(() => import('./pages/onboarding/PersonalDetails'));
const BarcodeScanner = lazy(() => import('./pages/BarcodeScanner'));
const BarcodeResult = lazy(() => import('./pages/BarcodeResult'));

// Loading Fallback for Suspense
const PageLoader = () => (
  <div className="h-full bg-[#102210] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-[#0fbd0f]/30 border-t-[#0fbd0f] rounded-full animate-spin"></div>
  </div>
);

// ─── Route Guard ───────────────────────────────────────────────────────────
// Shows a loader while checking auth, then decides:
//   • No session → /welcome
//   • Session but onboarding not done → allow onboarding routes, block app routes
//   • Session + onboarding done → allow app routes
function RouteGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (isMounted) navigate('/welcome', { replace: true });
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();
        
        const onboardingDone = profile?.onboarding_completed === true;
        const isOnboardingRoute = location.pathname.startsWith('/onboarding');

        if (!onboardingDone && !isOnboardingRoute && location.pathname !== '/welcome') {
          // If not completed and not on onboarding route, redir to welcome
          navigate('/welcome', { replace: true });
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (isMounted) navigate('/welcome', { replace: true });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Show spinner while we verify auth
  if (checking) return <PageLoader />;

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/onboarding/signup" element={<AuthSignup />} />
          <Route path="/auth/signin" element={<AuthSignin />} />
          <Route path="/onboarding/source" element={<RouteGuard><DiscoverySource /></RouteGuard>} />
          <Route path="/onboarding/goal" element={<RouteGuard><GoalSelection /></RouteGuard>} />
          <Route path="/onboarding/details" element={<RouteGuard><PersonalDetails /></RouteGuard>} />
          <Route path="/scanner" element={<RouteGuard><Scanner /></RouteGuard>} />
          <Route path="/results" element={<RouteGuard><ScanResults /></RouteGuard>} />
          <Route path="/stats" element={<RouteGuard><Statistics /></RouteGuard>} />
          <Route path="/profile" element={<RouteGuard><Profile /></RouteGuard>} />
          <Route path="/barcode-scanner" element={<RouteGuard><BarcodeScanner /></RouteGuard>} />
          <Route path="/barcode-result" element={<RouteGuard><BarcodeResult /></RouteGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  useEffect(() => {
    const checkPermissions = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Check if we already did this once to be super fast
          const hasRequested = localStorage.getItem('permissions_requested');
          if (!hasRequested) {
            // Request Camera for both ML Kit and Capacitor Camera
            await NativeScanner.requestPermissions();
            await Camera.requestPermissions();
            localStorage.setItem('permissions_requested', 'true');
          }
        } catch (err) {
          console.error("Global permission error:", err);
        }
      }
    };
    checkPermissions();
  }, []);

  return (
    <LanguageProvider>
      <MealProvider>
        <Router>
          <Navigation />
          <AnimatedRoutes />
        </Router>
      </MealProvider>
    </LanguageProvider>
  );
}

export default App;
