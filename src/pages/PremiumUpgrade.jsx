// @ts-nocheck
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.3 } },
};

export default function PremiumUpgrade({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-display antialiased">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-[400px] max-h-[90vh] bg-[#1a2210] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden text-slate-100"
          >
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center" 
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCmnNAYreMBeFQXqpJPbATpoosJkHsUc4CzxPmivMQLPSqtEt3P_kEeDsimTnsA6hLwkNX4f4VrrOCvmKWHNQmBiM4RIHqTuhCgsSMVopl8dxvqDCU42Rqbmkqqu1L4KTwfdPbS-Ri7Co0goaoLU_9F8LYvfJVvcHsEQAzW7OzKYC1X85JARphbUnC4eC7V1GD4qghWET7WjUUMj9yaIDbBBXmKpu0Cy00lzFhjZH0nYIyCzWtzfpWcRwpJqQJYvoHkBN1MQ9DCRP_J")' }}
            ></div>
            <div 
              className="absolute inset-0 z-0 bg-[#1a2210]/80"
              style={{ background: 'linear-gradient(180deg, rgba(26, 34, 16, 0.4) 0%, rgba(26, 34, 16, 0.95) 60%, rgba(26, 34, 16, 1) 100%)' }}
            ></div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full w-full overflow-y-auto no-scrollbar p-6 pt-10 pb-8">
          
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 z-50 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
          >
            <span className="material-symbols-rounded block">close</span>
          </button>

          {/* Header / Logo Area */}
          <div className="flex justify-center mb-8 mt-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-[#9df425] text-4xl">eco</span>
              <h1 className="text-white text-2xl font-bold tracking-tight">Glymo AI</h1>
            </div>
          </div>

          {/* Hero Text */}
          <div className="text-center mb-8">
            <h2 className="text-white text-4xl font-bold leading-tight mb-2">Unlock Full<br/>Potential</h2>
            <p className="text-gray-300 text-lg font-medium">Get your dream body faster.</p>
          </div>

          {/* Plan Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white text-xl font-bold">Annual Plan</h3>
                <p className="text-[#9df425] text-sm font-medium mt-1">First 7 days free, then $59.99/year</p>
              </div>
              <span className="bg-[#9df425] text-[#1a2210] text-xs font-bold px-3 py-1 rounded-full">Save 50%</span>
            </div>
            
            <div className="flex items-baseline gap-1 text-white mb-6">
              <span className="text-5xl font-bold tracking-tight">$4.99</span>
              <span className="text-gray-400 text-lg font-medium">/mo</span>
              <span className="text-gray-500 text-sm ml-2 line-through">$9.99</span>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <span className="material-symbols-rounded text-[#9df425] text-[20px]">check_circle</span>
                <span>Unlimited AI Logging</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <span className="material-symbols-rounded text-[#9df425] text-[20px]">check_circle</span>
                <span>Advanced Macro Analysis</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <span className="material-symbols-rounded text-[#9df425] text-[20px]">check_circle</span>
                <span>Personalized Meal Plans</span>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-8 px-2">
            <div className="grid grid-cols-3 gap-4 mb-4 text-center border-b border-white/10 pb-2">
              <div className="text-left text-gray-400 text-sm font-medium">Features</div>
              <div className="text-gray-400 text-sm font-medium">Free</div>
              <div className="text-[#9df425] text-sm font-bold">Premium</div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 items-center text-center">
                <div className="text-left text-gray-200 text-sm">Food Scan</div>
                <div className="text-gray-400">
                  <span className="material-symbols-rounded text-[18px]">check</span>
                </div>
                <div className="text-[#9df425]">
                  <span className="material-symbols-rounded text-[18px]">check</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 items-center text-center">
                <div className="text-left text-gray-200 text-sm">Macro Details</div>
                <div className="text-gray-500">
                  <span className="material-symbols-rounded text-[18px]">close</span>
                </div>
                <div className="text-[#9df425]">
                  <span className="material-symbols-rounded text-[18px]">check</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 items-center text-center">
                <div className="text-left text-gray-200 text-sm">Recipes</div>
                <div className="text-gray-500 text-sm">Limited</div>
                <div className="text-[#9df425] font-bold text-sm">All Access</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 items-center text-center">
                <div className="text-left text-gray-200 text-sm">Ad-Free</div>
                <div className="text-gray-500">
                  <span className="material-symbols-rounded text-[18px]">close</span>
                </div>
                <div className="text-[#9df425]">
                  <span className="material-symbols-rounded text-[18px]">check</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-auto">
            <button 
              onClick={() => alert("Payment Processing Integration Pending")}
              className="w-full bg-[#9df425] hover:bg-[#8ce01f] text-[#1a2210] text-lg font-bold py-4 px-6 rounded-full transition-all duration-200 transform active:scale-95 shadow-lg shadow-[#9df425]/20 flex items-center justify-center gap-2"
            >
              Start 7-Day Free Trial
              <span className="material-symbols-rounded text-[24px]">arrow_forward</span>
            </button>
            <p className="text-center text-gray-400 text-xs mt-4">Cancel anytime in Settings &gt; Subscriptions.</p>
            
            <div className="flex justify-center gap-6 mt-4 pb-4">
              <button className="text-gray-500 text-xs hover:text-white transition-colors">Restore Purchase</button>
              <button className="text-gray-500 text-xs hover:text-white transition-colors">Terms</button>
              <button className="text-gray-500 text-xs hover:text-white transition-colors">Privacy</button>
            </div>
          </div>
          
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
