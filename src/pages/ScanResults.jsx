import { Link, useNavigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useMeals } from '../context/MealContext';
import { logSecurity } from '../lib/logger';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function ScanResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addMeal } = useMeals();
  
  const mealData = location.state?.mealData || {
    name: "Meal Analysis",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    ingredientsList: []
  };

  const handleConfirm = async () => {
    logSecurity('SCAN_PLATE', 'INFO', { meal_name: mealData.name, calories: mealData.calories });
    await addMeal(mealData);
    navigate('/');
  };

  return (
    <motion.div 
      className="bg-background-light dark:bg-background-dark font-inter text-slate-900 dark:text-slate-100 h-screen flex justify-center items-center p-0 sm:p-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="relative w-full max-w-[375px] h-full bg-white dark:bg-slate-900 sm:rounded-[40px] shadow-2xl overflow-hidden sm:border-[8px] border-slate-900 dark:border-slate-800">
        
        {/* Status Bar */}
        <div className="absolute top-0 w-full h-11 flex justify-between items-center px-8 z-50 text-white">
          <span className="text-sm font-semibold">9:41</span>
          <div className="flex items-center space-x-1.5">
            <span className="material-icons-round text-sm">signal_cellular_alt</span>
            <span className="material-icons-round text-sm">wifi</span>
            <span className="material-icons-round text-sm">battery_full</span>
          </div>
        </div>
        
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-3xl z-50"></div>
        
        <div className="h-full overflow-y-auto no-scrollbar pt-11 pb-44">
          {/* Image Header Section */}
          <div className="relative w-full aspect-square bg-slate-200 dark:bg-slate-800">
            <img 
              alt="Scanned Healthy Meal Bowl" 
              className="w-full h-full object-cover" 
              src={mealData.image_url}
            />
            <Link to="/scanner" className="absolute top-4 left-6 w-10 h-10 rounded-full bg-white/20 dark:bg-black/20 ios-blur flex items-center justify-center text-white">
              <span className="material-icons-round">arrow_back_ios_new</span>
            </Link>
            
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/3 p-2 bg-indigo-500/90 text-white rounded-xl ios-blur text-[10px] font-bold shadow-lg animate-pulse">
                SALMON <br/> <span className="text-xs">240 kcal</span>
              </div>
              <div className="absolute bottom-1/3 right-1/4 p-2 bg-emerald-500/90 text-white rounded-xl ios-blur text-[10px] font-bold shadow-lg">
                AVOCADO <br/> <span className="text-xs">160 kcal</span>
              </div>
              <div className="absolute inset-8 border-2 border-primary-results/40 rounded-3xl animate-pulse"></div>
            </div>
          </div>
          
          {/* Results Details */}
          <div className="px-6 -mt-8 relative z-10">
            <div className="bg-card-light dark:bg-card-dark rounded-t-[32px] p-6 shadow-xl space-y-8">
              
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Scan Results</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">AI identified 4 ingredients</p>
              </div>
              
              {/* Circular Chart Component */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle className="text-slate-100 dark:text-slate-700" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                    <circle cx="80" cy="80" fill="transparent" r="70" stroke="url(#gradient)" strokeDasharray="440" strokeDashoffset="110" strokeLinecap="round" strokeWidth="12"></circle>
                    <defs>
                      <linearGradient id="gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" stopColor="#818cf8"></stop>
                        <stop offset="100%" stopColor="#6366f1"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-4xl font-extrabold block">{mealData.calories}</span>
                    <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase">Kcal Total</span>
                  </div>
                </div>
              </div>
              
              {/* Macros Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center">
                  <span className="block text-[10px] font-bold text-indigo-500 uppercase mb-1">Protein</span>
                  <span className="text-lg font-bold">{mealData.protein}g</span>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (mealData.protein * 4 / (mealData.calories || 1)) * 100)}%` }}></div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center">
                  <span className="block text-[10px] font-bold text-emerald-500 uppercase mb-1">Carbs</span>
                  <span className="text-lg font-bold">{mealData.carbs}g</span>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (mealData.carbs * 4 / (mealData.calories || 1)) * 100)}%` }}></div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center">
                  <span className="block text-[10px] font-bold text-orange-500 uppercase mb-1">Fats</span>
                  <span className="text-lg font-bold">{mealData.fats}g</span>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (mealData.fats * 9 / (mealData.calories || 1)) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
              
              {/* Ingredients List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-bold text-lg">Ingredients</h3>
                  <p className="text-xs text-slate-400">{mealData.ingredientsList?.length || 0} identified</p>
                </div>
                
                <div className="space-y-3">
                  {mealData.ingredientsList?.map((ing, i) => (
                    <div key={i} className="flex items-center bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-transparent hover:border-primary-results/20 transition-all">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <span className="material-icons-round">{ing.icon || 'restaurant'}</span>
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-semibold">{ing.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{ing.weight_g}g • Est. Weight</p>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold">{ing.calories} kcal</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Macros: {ing.protein}P {ing.carbs}C</span>
                      </div>
                    </div>
                  ))}
                  {(!mealData.ingredientsList || mealData.ingredientsList.length === 0) && (
                    <p className="text-center text-slate-500 text-sm py-4 italic">No detailed ingredients breakdown available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 w-full p-6 pb-10 bg-gradient-to-t from-white via-white dark:from-slate-900 dark:via-slate-900 to-transparent">
          <button 
            onClick={handleConfirm}
            className="w-full bg-primary-results hover:bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center space-x-2 transition-transform active:scale-95"
          >
            <span className="material-icons-round">check_circle</span>
            <span>Confirm & Log Meal</span>
          </button>
        </div>
        
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
      </div>
    </motion.div>
  );
}
