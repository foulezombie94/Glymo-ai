import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useMeals } from '../context/MealContext';
import PremiumUpgrade from './PremiumUpgrade';

import BmiWidget from '../components/BmiWidget';

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

export default function Dashboard() {
  const location = useLocation();
  const { getTotalsByRange, deleteMeal, loading, fetchWeightLogs } = useMeals();
  const [timeRange, setTimeRange] = useState('today');
  const { totals, percentages, meals } = getTotalsByRange(timeRange);
  const [selectedMeal, setSelectedMeal] = useState(null);

  useEffect(() => {
    if (fetchWeightLogs) {
      fetchWeightLogs();
    }
  }, [fetchWeightLogs]);
  
  // Show premium modal if coming from onboarding or profile
  const [showPremiumModal, setShowPremiumModal] = useState(
    location.state?.fromOnboarding === true || location.state?.showPremium === true
  );

  // Valeurs calculées dynamiquement depuis le contexte
  
  
  
  // Helper function to safely get images or fallback
  const getMealImage = (meal) => {
    return meal.image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ0vh-R2bBPLbGmcfqAbmMemmpfCQHvlTt56im37k12xfL7-NVEWBqLSTS87p56zdpJi4OPJ-TJxUtGGsTj_NEHsGdzuSVqs7bbnmCu1mRFAWG7ETNBYTJV_5fi8-m72QFC9lLPmH6kZNoUH0_kKfsfCV3By_yNRk2bQZiv8Y7Er0uW1A37B3kdcTqWx671OKp_0ESuoYnM7d-ZAb7wtDiFh_qaQ-EqcbHG7WZNZmqnz_N0-EGUoU2uJOO6p9kxYMyIsXxbieKN8hN";
  };

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center font-display">
        <div className="animate-spin text-[#6af425] material-symbols-rounded text-5xl">progress_activity</div>
      </div>
    );
  }

  return (
    <motion.div 
      className="text-slate-900 dark:text-slate-100 antialiased h-full font-display bg-[#f7f8f5] dark:bg-[#1a2210] selection:bg-[#9df425] selection:text-[#1a2210] overflow-hidden flex justify-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 h-full shadow-2xl relative overflow-hidden flex flex-col">
        {/* Status Bar */}
        <div className="px-8 pt-4 pb-2 flex justify-between items-center text-sm font-semibold z-10">
          <span>9:41</span>
          <div className="flex gap-1.5 items-center">
            <span className="material-symbols-rounded text-base">signal_cellular_4_bar</span>
            <span className="material-symbols-rounded text-base">wifi</span>
            <span className="material-symbols-rounded text-base">battery_very_low</span>
          </div>
        </div>

        {/* Header */}
        <header className="px-6 pb-6 flex justify-between items-center z-10"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <Link to="/profile" className="block w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity">
            <img 
              alt="User profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCroTqMPe_xV0ZFnpYoABSvVyaoh31KnSiJZav4iMdjOiTI4bkLPvpzzpDCpl_c0D2jR-RUHhvAYXOoY5l3XahVjT1R8ZNRXB4BI31Zof7pBElaDn0aMGKuerS8p4Pmw3AEWf-dA8y1Cgy64kC56j8RCkETLm5Tda0J0KdP6oEjOntqHkbiCUn235GlIN40"
            />
          </Link>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full flex gap-1">
            <button className="bg-white dark:bg-slate-700 px-6 py-1.5 rounded-full text-sm font-bold shadow-sm">Chart</button>
            <button className="px-6 py-1.5 rounded-full text-sm font-medium text-slate-500 dark:text-slate-400">Meals</button>
          </div>
          <button className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full">
            <span className="material-symbols-rounded">menu</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar z-10"
              style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>

          <section className="px-6 mb-10 mt-6">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
              <button onClick={() => setTimeRange('today')} className={`px-5 py-2 rounded-full whitespace-nowrap ${timeRange === 'today' ? 'bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100' : 'text-slate-400 text-sm font-medium'}`}>Today</button>
              <button onClick={() => setTimeRange('week')} className={`px-5 py-2 rounded-full whitespace-nowrap ${timeRange === 'week' ? 'bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100' : 'text-slate-400 text-sm font-medium'}`}>Week</button>
              <button onClick={() => setTimeRange('month')} className={`px-5 py-2 rounded-full whitespace-nowrap ${timeRange === 'month' ? 'bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100' : 'text-slate-400 text-sm font-medium'}`}>Month</button>
              <button onClick={() => setTimeRange('3months')} className={`px-5 py-2 rounded-full whitespace-nowrap ${timeRange === '3months' ? 'bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100' : 'text-slate-400 text-sm font-medium'}`}>3 Months</button>
            </div>
          </section>

          {/* Chart Section */}
          <section className="flex flex-col items-center justify-center relative mb-12">
            <div className="absolute inset-0 z-20 pointer-events-none">
              {/* Labels positionnement trigonométrique */}
              {(() => {
                if (totals.calories === 0) return null;
                
                // Rayon du cercle sur lequel placer les étiquettes (légèrement au bord du donut)
                const radius = 138; 
                const center = 130; // 260px / 2 (la taille du ".nutrition-chart-ring")

                // Le conic-gradient CSS commence avec "from 180deg", soit le BAS du cercle.
                // 180 degrés = Math.PI radians (offset = PI / 2 dans notre trigonométrie)
                const getCoords = (percent) => {
                  // Le sens horaire classique : angle = % * 2*PI
                  // L'offset pour démarrer "en bas" c'est + Math.PI/2 (par rapport à 0 qui est géométriquement à droite)
                  const angle = (percent / 100) * 2 * Math.PI + (Math.PI / 2); 
                  const x = center + radius * Math.cos(angle);
                  const y = center + radius * Math.sin(angle);
                  return { x, y };
                };

                // Calculs des centres idéaux de chaque segment de couleur
                // Protéines: de 0 à P
                const pCenterPercent = percentages.protein / 2;
                // Glucides: de P à P+C
                const cCenterPercent = percentages.protein + (percentages.carbs / 2);
                // Lipides: de P+C à 100
                const fCenterPercent = percentages.protein + percentages.carbs + (percentages.fats / 2);

                const pCoords = getCoords(pCenterPercent);
                const cCoords = getCoords(cCenterPercent);
                const fCoords = getCoords(fCenterPercent);

                return (
                  <div className="relative w-[260px] h-[260px] mx-auto">
                    {percentages.protein > 0 && (
                      <div 
                        className="absolute flex items-center gap-1.5 bg-white/80 dark:bg-black/80 backdrop-blur-md px-2 py-1 rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                        style={{ left: `${pCoords.x}px`, top: `${pCoords.y}px` }}
                      >
                        <span className="text-[10px] font-black tracking-wide text-[#8b93ff]">{percentages.protein}% P</span>
                      </div>
                    )}
                    {percentages.carbs > 0 && (
                      <div 
                        className="absolute flex items-center gap-1.5 bg-white/80 dark:bg-black/80 backdrop-blur-md px-2 py-1 rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                        style={{ left: `${cCoords.x}px`, top: `${cCoords.y}px` }}
                      >
                        <span className="text-[10px] font-black tracking-wide text-[#7ee0b3]">{percentages.carbs}% C</span>
                      </div>
                    )}
                    {percentages.fats > 0 && (
                      <div 
                        className="absolute flex items-center gap-1.5 bg-white/80 dark:bg-black/80 backdrop-blur-md px-2 py-1 rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                        style={{ left: `${fCoords.x}px`, top: `${fCoords.y}px` }}
                      >
                        <span className="text-[10px] font-black tracking-wide text-[#ffad84]">{percentages.fats}% F</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            
            <div 
              className="nutrition-chart-ring shadow-inner"
              style={{
                /*
                  Calcul du gradient conique (tarte) dynamique :
                  Protéines (indigo) -> de 0% à protein%
                  Glucides (vert) -> de protein% à protein+carbs%
                  Lipides (orange) -> de protein+carbs% à 100%
                  S'il n'y a pas de repas (0 0 0), on affiche du gris
                */
                background: totals.calories > 0 
                  ? `conic-gradient(
                      from 180deg,
                      #8b93ff 0% ${percentages.protein}%,
                      #7ee0b3 ${percentages.protein}% ${percentages.protein + percentages.carbs}%,
                      #ffad84 ${percentages.protein + percentages.carbs}% 100%
                    )`
                  : 'conic-gradient(from 180deg, #e2e8f0 0% 100%)'
              }}
            >
              <div className="z-10 text-center flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consumed:</span>
                <span className="text-5xl font-extrabold my-1">{totals.calories}</span>
                <span className="text-lg font-bold text-slate-600 dark:text-slate-300">Kcal</span>
              </div>
            </div>
          </section>

          {/* Meals Section */}
          <section className="px-6">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
              {meals.length > 0 ? (
                meals.map((meal, index) => {
                  const colors = ['orange', 'emerald', 'purple', 'blue'];
                  const colorMatch = colors[index % colors.length];
                  const bgClass = `bg-${colorMatch}-100 dark:bg-${colorMatch}-900/30`;
                  const textClass = `text-${colorMatch}-700 dark:text-${colorMatch}-300`;

                  return (
                    <div 
                      key={meal.id} 
                      onClick={() => setSelectedMeal(meal)}
                      className={`min-w-[130px] w-[130px] ${bgClass} rounded-2xl p-3 flex flex-col justify-between aspect-[3/4] cursor-pointer relative overflow-hidden group transition-transform hover:scale-[1.02]`}
                    >
                      <div className="absolute top-2 right-2 bg-white/80 dark:bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-lg text-[9px] font-bold z-10">{meal.calories} kcal</div>
                      <img alt={meal.name} className="w-16 h-16 object-cover rounded-xl mx-auto mt-4 shadow-lg rotate-1 group-hover:rotate-0 transition-transform" src={getMealImage(meal)}/>
                      <div className="mt-2">
                        <h3 className="font-bold text-xs line-clamp-1">{meal.name}</h3>
                        <p className={`text-[9px] ${textClass} line-clamp-1 mt-0.5`}>{meal.ingredients || "Scanned meal"}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center py-6 text-slate-400">
                  <span className="material-symbols-rounded text-4xl opacity-50 block mb-2">restaurant</span>
                  <p className="font-medium text-sm">No meals logged today</p>
                </div>
              )}
            </div>
          </section>

          {/* BMI Widget */}
          <section className="px-6 mt-4 pb-8">
            <BmiWidget />
          </section>

        </main>

        
        {/* Meal Detail Modal */}
        <AnimatePresence>
          {selectedMeal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedMeal(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full bg-white dark:bg-slate-900 rounded-t-[40px] p-6 pb-12 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-6" />
                
                <div className="flex gap-4 items-center mb-6">
                  <img src={getMealImage(selectedMeal)} alt={selectedMeal.name} className="w-24 h-24 rounded-3xl object-cover shadow-lg" />
                  <div>
                    <h2 className="text-2xl font-black">{selectedMeal.name}</h2>
                    <p className="text-slate-500 font-bold mt-1">{selectedMeal.calories} Kcal Total</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                    <span className="block text-indigo-500 text-[10px] uppercase font-bold mb-1">Protein</span>
                    <span className="font-bold text-lg">{selectedMeal.protein}g</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                    <span className="block text-emerald-500 text-[10px] uppercase font-bold mb-1">Carbs</span>
                    <span className="font-bold text-lg">{selectedMeal.carbs}g</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                    <span className="block text-orange-500 text-[10px] uppercase font-bold mb-1">Fats</span>
                    <span className="font-bold text-lg">{selectedMeal.fats}g</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">Ingredients</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl leading-relaxed">
                    {selectedMeal.ingredients || "No specific ingredients found."}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={async () => {
                      if(window.confirm("Êtes-vous sûr de vouloir supprimer ce repas ?")) {
                        await deleteMeal(selectedMeal.id);
                        setSelectedMeal(null);
                      }
                    }}
                    className="w-1/4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-4 rounded-2xl font-bold flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-rounded">delete</span>
                  </button>
                  <button 
                    onClick={() => setSelectedMeal(null)}
                    className="w-3/4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform"
                  >
                    Close Summary
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Upgrade Modal */}
        <PremiumUpgrade 
          isOpen={showPremiumModal} 
          onClose={() => setShowPremiumModal(false)} 
        />
      </div>
    </motion.div>
  );
}
