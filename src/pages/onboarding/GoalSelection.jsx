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

export default function GoalSelection() {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const { lang, toggleLanguage } = useLanguage();

  const content = {
    EN: {
      step: "Step 3 of 4",
      title: "Your Main Goal",
      description: "Let's customize your AI nutrition experience to fit your needs.",
      nextBtn: "Next Step",
      goals: [
        { id: 'lose_weight', icon: 'trending_down', title: 'Lose Weight', desc: 'Burn fat and get leaner' },
        { id: 'build_muscle', icon: 'fitness_center', title: 'Build Muscle', desc: 'Gain mass and strength' },
        { id: 'maintain', icon: 'balance', title: 'Maintain Weight', desc: 'Stay healthy and fit' },
        { id: 'eat_healthier', icon: 'local_florist', title: 'Eat Healthier', desc: 'Improve overall nutrition' },
      ]
    },
    FR: {
      step: "Étape 3 sur 4",
      title: "Votre Objectif Principal",
      description: "Personnalisons votre expérience nutritionnelle IA selon vos besoins.",
      nextBtn: "Étape suivante",
      goals: [
        { id: 'lose_weight', icon: 'trending_down', title: 'Perdre du poids', desc: 'Brûler des graisses et s\'affiner' },
        { id: 'build_muscle', icon: 'fitness_center', title: 'Prendre du muscle', desc: 'Gagner en masse et en force' },
        { id: 'maintain', icon: 'balance', title: 'Maintenir son poids', desc: 'Rester en forme et en bonne santé' },
        { id: 'eat_healthier', icon: 'local_florist', title: 'Manger plus sainement', desc: 'Améliorer sa nutrition globale' },
      ]
    },
    ES: {
      step: "Paso 3 de 4",
      title: "Tu Objetivo Principal",
      description: "Personalicemos tu experiencia de nutrición con IA según tus necesidades.",
      nextBtn: "Siguiente paso",
      goals: [
        { id: 'lose_weight', icon: 'trending_down', title: 'Perder peso', desc: 'Quemar grasa y adelgazar' },
        { id: 'build_muscle', icon: 'fitness_center', title: 'Ganar músculo', desc: 'Aumentar masa y fuerza' },
        { id: 'maintain', icon: 'balance', title: 'Mantener peso', desc: 'Mantenerse sano y en forma' },
        { id: 'eat_healthier', icon: 'local_florist', title: 'Comer más sano', desc: 'Mejorar la nutrición general' },
      ]
    }
  };

  const currentContent = content[lang] || content['EN'];

  const handleNext = async () => {
    if (selectedGoal) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase.from('profiles').upsert({
          id: session.user.id,
          email: session.user.email,
          goal: selectedGoal,
        }, { onConflict: 'id' });
        if (!error) {
          logSecurity('ONBOARDING_GOAL', 'INFO', { goal: selectedGoal });
        }
      }
    }
    navigate('/onboarding/details');
  };

  const handleBack = () => {
    navigate(-1);
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
            <button onClick={handleBack} className="w-10 h-10 flex items-center justify-start text-slate-900 dark:text-slate-100 active:scale-95 transition-transform">
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
            <div className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
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
            {currentContent.goals.map((goal) => (
              <label key={goal.id} className="block cursor-pointer group">
                <input 
                  className="hidden" 
                  name="goal" 
                  type="radio" 
                  checked={selectedGoal === goal.id}
                  onChange={() => setSelectedGoal(goal.id)}
                />
                <div className={`flex items-center p-5 rounded-xl border-2 transition-all duration-200 shadow-sm ${
                  selectedGoal === goal.id 
                    ? 'border-green-500 bg-green-500/5 dark:bg-green-400/10' 
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-green-500/40'
                }`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 transition-colors ${
                      selectedGoal === goal.id ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-600 dark:text-green-400'
                  }`}>
                    <span className="material-symbols-rounded text-2xl">{goal.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{goal.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{goal.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedGoal === goal.id ? 'border-green-500 bg-green-500' : 'border-slate-200 dark:border-slate-600'
                  }`}>
                    {selectedGoal === goal.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
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
            disabled={!selectedGoal}
            className={`w-full font-black text-lg h-14 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center ${
              selectedGoal 
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
