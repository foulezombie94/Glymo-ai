import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  const pathname = location.pathname;

  // Cache navigation on onboarding and welcome screens
  const hideNav = [
    '/welcome', 
    '/onboarding/signup', 
    '/auth/signin', 
    '/onboarding/source', 
    '/onboarding/goal', 
    '/onboarding/details',
    '/scanner',
    '/barcode-scanner',
    '/results',
    '/barcode-result'
  ].includes(pathname);

  if (hideNav) return null;

  const isActive = (path) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav 
        className="mb-6 w-[92%] max-w-md bg-slate-900/80 dark:bg-white/90 backdrop-blur-xl h-18 rounded-full flex items-center justify-around px-6 py-4 shadow-2xl pointer-events-auto border border-white/10 dark:border-black/5"
        style={{
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}
      >
        <Link to="/" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/') ? 'text-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-300'}`}>
          <span className={`material-symbols-rounded ${isActive('/') ? 'fill-[1]' : ''}`}>home</span>
        </Link>
        
        <Link to="/barcode-scanner" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/barcode-scanner') ? 'text-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-300'}`}>
          <span className={`material-symbols-rounded ${isActive('/barcode-scanner') ? 'fill-[1]' : ''}`}>barcode_scanner</span>
        </Link>

        <div className="relative -top-8">
          <Link 
            to="/scanner" 
            className="w-16 h-16 bg-[#58ee2b] rounded-full flex items-center justify-center shadow-xl border-4 border-slate-900/80 dark:border-white transition-all transform hover:scale-105 active:scale-95"
            style={{ boxShadow: '0 0 20px rgba(88,238,43,0.4)' }}
          >
            <span className="material-symbols-rounded text-slate-900 text-3xl font-bold">add</span>
          </Link>
        </div>

        <Link to="/stats" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/stats') ? 'text-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-300'}`}>
          <span className={`material-symbols-rounded ${isActive('/stats') ? 'fill-[1]' : ''}`}>bar_chart</span>
        </Link>

        <Link to="/profile" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/profile') ? 'text-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-300'}`}>
          <span className={`material-symbols-rounded ${isActive('/profile') ? 'fill-[1]' : ''}`}>person</span>
        </Link>
      </nav>
      
      {/* Home Indicator line (mobile feel) */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-400/20 rounded-full z-50 pointer-events-none"></div>
    </div>
  );
}
