import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div 
      className="text-slate-900 dark:text-slate-100 antialiased h-full font-display bg-[#f6f8f5] dark:bg-[#162210] overflow-hidden"
    >
      {/* Main Container */}
      <div 
        className="relative flex h-full w-full flex-col"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(106, 244, 37, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(106, 244, 37, 0.05) 0%, transparent 50%)'
        }}
      >
        {/* Background Pattern/Overlay */}
        <div className="absolute inset-0 z-0 h-full w-full pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#6af425]/10 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content Area */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center z-10">
          
          {/* Logo Section */}
          <div className="relative mb-14 flex h-48 w-48 items-center justify-center">
            {/* Decorative background glow */}
            <div className="absolute inset-0 bg-[#6af425]/20 blur-3xl rounded-full"></div>
            
            {/* Main Brand Mark */}
            <div className="relative flex h-40 w-40 flex-col items-center justify-center rounded-2xl border-2 border-[#6af425]/30 bg-[#162210]/90 p-4 backdrop-blur-md shadow-2xl">
              {/* Camera Viewfinder Corners */}
              <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-[#6af425]"></div>
              <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-[#6af425]"></div>
              <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-[#6af425]"></div>
              <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-[#6af425]"></div>
              
              {/* Image Placeholder */}
              <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-lg border-2 border-[#6af425]/20">
                <img className="h-full w-full object-cover" alt="Meal scan" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzMPBFTMKSNKKwxpDi8Ik_kqmOJDaVvWW2-vpY1YzXuGYApxds6FYnvfddTUBKxzEzP2SIJlOpmo3nS5CwoOXnuTprrDH-JFInA8g3fEmAwNG36JmHat4-xB1LuLontqo6BpFfBsWD0HGWXJWqPky6aEDphaeensgGOZrtExzdvtzjlLu8-H3UtjdcHRaQWnFe_RLNfnbN1dM-hAo3xuLcVNQxtDS7i6gY9f44h36H3ISOk6oSrtCk29eOO2d_rcuEAgceYt4WNM0w"/>
              </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="space-y-6 max-w-sm relative px-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Welcome to <br/><span className="text-[#6af425] text-5xl">Glymo AI</span>
            </h1>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-400 leading-relaxed px-4">
              Experience the future of nutrition with AI-powered calorie tracking.
            </p>
          </div>
        </div>

        {/* Bottom Action Area */}
        <div className="w-full px-8 pt-8 z-20 flex flex-col gap-4 max-w-sm mx-auto"
             style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
            {/* Primary CTA */}
            <button 
              onClick={() => navigate('/onboarding/signup')}
              className="group relative flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl bg-[#6af425] text-lg font-black text-[#162210] transition-all active:scale-[0.97] shadow-[0_10px_30px_-10px_rgba(106,244,37,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <span className="material-symbols-rounded font-bold">arrow_forward</span>
              </span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            
            {/* Secondary CTA */}
            <button 
              onClick={() => navigate('/auth/signin')}
              className="flex h-16 w-full items-center justify-center rounded-2xl border-2 border-slate-300 dark:border-white/10 text-lg font-bold text-slate-900 dark:text-white backdrop-blur-sm transition-all active:scale-[0.97] hover:bg-white/5"
            >
              Sign In
            </button>
            
            {/* Terms/Privacy */}
            <p className="mt-2 text-center text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 px-4 leading-relaxed">
              By continuing, you agree to our <a className="text-slate-900 dark:text-slate-300 underline underline-offset-4" href="#">Terms</a> & <a className="text-slate-900 dark:text-slate-300 underline underline-offset-4" href="#">Privacy</a>
            </p>
        </div>

        {/* Decorative Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-slate-300/20 dark:bg-white/10 rounded-full z-50 pointer-events-none"></div>
      </div>
    </div>
  );
}
