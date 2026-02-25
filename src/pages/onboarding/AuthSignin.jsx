// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { logSecurity } from '../../lib/logger';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.3 } },
};

export default function AuthSignin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      logSecurity('AUTH_LOGIN', 'WARN', { email, success: false, reason: signInError.message });
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data?.session) {
      logSecurity('AUTH_LOGIN', 'INFO', { email, success: true });
      navigate('/');
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="text-slate-900 dark:text-slate-100 antialiased h-full font-display bg-[#f7f8f5] dark:bg-[#1a2210] selection:bg-[#9df425] selection:text-[#1a2210] overflow-hidden"
    >
      {/* Background Organic Shapes */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 10% 20%, rgba(157, 244, 37, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(157, 244, 37, 0.08) 0%, transparent 40%)"
        }}
      ></div>

      <div className="relative z-10 flex flex-col h-full w-full max-w-[480px] mx-auto overflow-hidden bg-white dark:bg-slate-900 shadow-2xl">
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-6 py-8 safe-top">
          {/* Top App Bar / Logo Section */}
          <header className="flex flex-col items-center pt-8 pb-8">
            <div className="bg-[#9df425]/10 p-3 rounded-2xl mb-4 border border-[#9df425]/20 shadow-lg">
              <div className="text-[#9df425] flex size-10 items-center justify-center">
                <span className="material-symbols-rounded text-3xl leading-none">nutrition</span>
              </div>
            </div>
            <h2 className="text-[#9df425] text-sm font-black tracking-[0.3em] uppercase opacity-70">Glymo AI</h2>
          </header>

          {/* Welcome Text */}
          <div className="mb-8 text-center">
            <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-extrabold leading-tight mb-2">Welcome Back!</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Sign in to track your nutrition journey</p>
          </div>

          {/* Login Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSignIn}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium px-1 text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="rounded-xl flex items-center px-4 transition-all focus-within:ring-1 focus-within:ring-[#9df425]/50 focus-within:border-[#9df425]/50"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(157, 244, 37, 0.1)"
                  }}
              >
                <span className="material-symbols-rounded text-slate-400 text-xl mr-3">mail</span>
                <input 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 h-14 placeholder:text-slate-500 py-4 text-base outline-none" 
                  placeholder="name@example.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium px-1 text-slate-700 dark:text-slate-300">Password</label>
              <div className="rounded-xl flex items-center px-4 transition-all focus-within:ring-1 focus-within:ring-[#9df425]/50 focus-within:border-[#9df425]/50"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(157, 244, 37, 0.1)"
                  }}
              >
                <span className="material-symbols-rounded text-slate-400 text-xl mr-3">lock</span>
                <input 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 h-14 placeholder:text-slate-500 py-4 text-base outline-none" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  className="text-slate-400 hover:text-[#9df425] transition-colors h-full flex items-center" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-rounded text-xl leading-none">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-between pt-1">
              <button
                type="button"
                onClick={() => navigate('/welcome')}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium flex items-center gap-1"
              >
                <span className="material-symbols-rounded text-[18px]">arrow_back</span> Back
              </button>
              <a className="text-[#9df425] text-sm font-medium hover:underline underline-offset-4" href="#">Forgot Password?</a>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="bg-[#9df425] text-[#1a2210] font-black text-lg h-14 rounded-2xl mt-4 shadow-xl shadow-[#9df425]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-[#aef542] disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <span className="material-symbols-rounded font-bold">arrow_forward</span>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Or continue with</span>
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button className="h-14 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 transition-colors border border-slate-200 dark:border-slate-800" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
              <img alt="Google Logo" className="w-5 h-5 grayscale opacity-50 contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdJR6epMRAJH3jpdZ7Qn63n26h0u1EqmX46-S91pjWjKpCOIsxRLCBcQ3bS1lAUBIIAJkWOKcKqJbvnDAKTabMNIZNRTGmAaqr6Tl5_rNdoxWMfmeDpghk4j1o9Zb5hUMGQwz1etEFq4rQxEv37QDY2G9DXdyjjiUulOjxyyIJZee1qpaVjxw2Tl6ZV90uP6oIZrUj6g2-9VKPPKsq3g3nzmGThrgjo83G87WJNrc1mI1Du8HCKy4pxaFQsvJSjOVXXuW3qfcmC2lN"/>
              <span className="text-sm font-bold">Google</span>
            </button>
            <button className="h-14 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 transition-colors border border-slate-200 dark:border-slate-800" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
              <span className="material-symbols-rounded text-xl opacity-50">apple</span>
              <span className="text-sm font-bold">Apple</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto text-center pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 safe-bottom">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Don't have an account? 
            <button onClick={() => navigate('/onboarding/signup')} className="text-[#9df425] font-black hover:underline underline-offset-4 ml-2">Create an account</button>
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
