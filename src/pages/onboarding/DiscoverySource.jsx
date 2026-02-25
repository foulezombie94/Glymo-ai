import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { logSecurity } from '../../lib/logger';

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
};

export default function DiscoverySource() {
  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState(null);
  const { lang, toggleLanguage } = useLanguage();

  const content = {
    EN: {
      step: "Step 2 of 4",
      title: "Discovery Source",
      description: "Help us understand how you reached our AI nutrition community.",
      nextBtn: "Next Step",
      sources: [
        { id: 'social', icon: 'share', title: 'Social Media', desc: 'Instagram, TikTok, or others' },
        { id: 'friends', icon: 'group', title: 'Friends/Family', desc: 'Recommended by someone' },
        { id: 'store', icon: 'store', title: 'App Store', desc: 'Search or featured' },
        { id: 'other', icon: 'more_horiz', title: 'Other', desc: 'None of the above' },
      ]
    },
    FR: {
      step: "Étape 2 sur 4",
      title: "Source de découverte",
      description: "Aidez-nous à comprendre comment vous avez connu notre application.",
      nextBtn: "Étape suivante",
      sources: [
        { id: 'social', icon: 'share', title: 'Réseaux Sociaux', desc: 'Instagram, TikTok, ou autres' },
        { id: 'friends', icon: 'group', title: 'Amis/Famille', desc: 'Recommandé par un proche' },
        { id: 'store', icon: 'store', title: 'App Store', desc: 'Recherche ou mise en avant' },
        { id: 'other', icon: 'more_horiz', title: 'Autre', desc: 'Aucune de ces réponses' },
      ]
    },
    ES: {
      step: "Paso 2 de 4",
      title: "Fuente de descubrimiento",
      description: "Ayúdanos a entender cómo nos conociste.",
      nextBtn: "Siguiente paso",
      sources: [
        { id: 'social', icon: 'share', title: 'Redes Sociales', desc: 'Instagram, TikTok, u otras' },
        { id: 'friends', icon: 'group', title: 'Amigos/Familia', desc: 'Recomendado por alguien' },
        { id: 'store', icon: 'store', title: 'App Store', desc: 'Búsqueda o destacado' },
        { id: 'other', icon: 'more_horiz', title: 'Otro', desc: 'Ninguna de las opciones' },
      ]
    }
  };

  const currentContent = content[lang] || content['EN'];

  const handleNext = async () => {
    if (selectedSource) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase.from('profiles').upsert({
          id: session.user.id,
          email: session.user.email,
          discovery_source: selectedSource,
        }, { onConflict: 'id' });
        if (!error) {
          logSecurity('ONBOARDING_DISCOVERY', 'INFO', { source: selectedSource });
        }
      }
    }
    navigate('/onboarding/goal');
  };

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="text-slate-900 dark:text-slate-100 antialiased h-full font-display bg-[#f7f8f5] dark:bg-[#1a2210] overflow-hidden"
    >
      <div className="relative flex flex-col h-full w-full max-w-[430px] mx-auto bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">

        {/* Progress Header - Safe Area */}
        <div className="px-6 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md safe-top pb-3">
          <div className="flex justify-between items-center mb-4">
            <button className="w-10 h-10 flex items-center justify-start text-slate-900 dark:text-slate-100 opacity-50 cursor-not-allowed">
              <span className="material-symbols-rounded">arrow_back_ios_new</span>
            </button>
            <span className="text-sm font-semibold text-slate-500">{currentContent.step}</span>
            <button 
              onClick={toggleLanguage}
              className="h-10 px-3 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span className="material-symbols-rounded text-[18px]">language</span>
              <span className="text-xs font-bold tracking-wider">{lang}</span>
            </button>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-green-500/10 dark:bg-green-400/10 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 pt-8 pb-32 no-scrollbar z-10">
          <h1 className="text-3xl font-extrabold leading-tight mb-3">
            {currentContent.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-10">
            {currentContent.description}
          </p>

          {/* Options List */}
          <div className="space-y-4">
            {currentContent.sources.map((source) => (
              <label key={source.id} className="block cursor-pointer group">
                <input 
                  className="hidden" 
                  name="source" 
                  type="radio" 
                  checked={selectedSource === source.id}
                  onChange={() => setSelectedSource(source.id)}
                />
                <div className={`flex items-center p-5 rounded-xl border-2 transition-all duration-200 shadow-sm ${
                  selectedSource === source.id 
                    ? 'border-green-500 bg-green-500/5 dark:bg-green-400/10' 
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-green-500/40'
                }`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 transition-colors ${
                      selectedSource === source.id ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-600 dark:text-green-400'
                  }`}>
                    <span className="material-symbols-rounded text-2xl">{source.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{source.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{source.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedSource === source.id ? 'border-green-500 bg-green-500' : 'border-slate-200 dark:border-slate-600'
                  }`}>
                    {selectedSource === source.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </main>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-0 w-full px-6 z-20 bg-gradient-to-t from-white via-white/100 dark:from-slate-900 dark:via-slate-900/100 to-transparent safe-bottom pt-10">
          <button 
            onClick={handleNext}
            disabled={!selectedSource}
            className={`w-full font-black text-lg h-14 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center ${
              selectedSource 
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {currentContent.nextBtn}
          </button>
        </div>
        
        {/* Decorative Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-50 pointer-events-none opacity-30"></div>
      </div>
    </motion.div>
  );
}
