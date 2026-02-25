import React from 'react';
import { useMeals } from '../context/MealContext';

export default function BmiWidget() {
  const { bmi, getTodayTotals, weightTrend, calorieGoal } = useMeals();
  
  const currentBmi = bmi > 0 ? bmi : '--';
  const { totals } = getTodayTotals();
  const dailyGoal = calorieGoal || 2000;

  let bmiStatus = "N/A";
  let bmiColorClass = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  let activeDot = -1;

  if (bmi > 0) {
    if (bmi < 18.5) {
      bmiStatus = "Insuff.";
      bmiColorClass = "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30";
      activeDot = 0;
    } else if (bmi >= 18.5 && bmi < 25) {
      bmiStatus = "Sain";
      bmiColorClass = "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-200 dark:border-green-500/30";
      activeDot = 1;
    } else if (bmi >= 25 && bmi < 30) {
      bmiStatus = "Surpoids";
      bmiColorClass = "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30";
      activeDot = 2;
    } else {
      bmiStatus = "Obèse";
      bmiColorClass = "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-500/30";
      activeDot = 3;
    }
  }

  // Calculate cursor position (rough estimation based on standard ranges)
  let cursorPosition = 0;
  if (bmi > 0) {
     if (bmi < 15) cursorPosition = 5;
     else if (bmi >= 15 && bmi < 18.5) cursorPosition = 5 + ((bmi - 15) / 3.5) * 13;
     else if (bmi >= 18.5 && bmi < 25) cursorPosition = 18 + ((bmi - 18.5) / 6.5) * 25;
     else if (bmi >= 25 && bmi < 30) cursorPosition = 43 + ((bmi - 25) / 5) * 27;
     else if (bmi >= 30 && bmi < 40) cursorPosition = 70 + ((bmi - 30) / 10) * 25;
     else cursorPosition = 95;
  }
  
  if (cursorPosition > 100) cursorPosition = 100;

  return (
    <div className="w-full max-w-sm mx-auto mb-4">
      <div className="bg-white dark:bg-white/5 rounded-2xl p-4 shadow-sm dark:shadow-md relative overflow-hidden transition-all duration-300 border border-slate-100 dark:border-white/10">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-green-500/20 rounded-full blur-2xl pointer-events-none dark:block hidden"></div>
        
        <div className="flex justify-between items-start mb-2 relative z-10">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-emerald-100">Ton IMC</h2>
            <p className="text-[10px] text-slate-400 dark:text-emerald-300/70">Indice de Masse Corporelle</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:text-emerald-300 dark:hover:text-white transition-colors">
            <span className="material-symbols-rounded text-xl">help</span>
          </button>
        </div>
        
        <div className="flex items-baseline gap-2 mb-3 relative z-10">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{currentBmi}</span>
          {bmi > 0 && (
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-slate-500 dark:text-emerald-200/80">Ton rapport est</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 border ${bmiColorClass}`}>
                  {bmiStatus}
              </span>
            </div>
          )}
        </div>
        
        <div className="relative w-full h-5 mb-4 z-10">
          {/* Continuous bar — no gaps so cursor % aligns perfectly */}
          <div className="absolute inset-y-0 inset-x-0 flex items-center">
            <div className="w-full h-2 flex rounded-full overflow-hidden opacity-90">
              <div className="bg-blue-400"   style={{ width: '18%' }} />
              <div className="bg-green-500"  style={{ width: '25%' }} />
              <div className="bg-amber-400"  style={{ width: '27%' }} />
              <div className="bg-red-500 flex-1" />
            </div>
          </div>
          {bmi > 0 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 h-5 w-1.5 bg-slate-900 dark:bg-white rounded-full shadow-lg -translate-x-1/2 transition-all duration-500 ease-out z-20"
              style={{ left: `${cursorPosition}%` }}
            />
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-2 relative z-10">
          <div className="flex flex-col gap-1 group cursor-default">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full bg-blue-400 transition-transform ${activeDot === 0 ? 'scale-125 animate-pulse' : ''}`}></div>
              <span className={`text-[10px] uppercase font-bold truncate tracking-wide ${activeDot === 0 ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-emerald-200/60'}`}>Insuff.</span>
            </div>
            <span className={`text-xs pl-3.5 ${activeDot === 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-emerald-100'}`}>&lt;18.5</span>
          </div>
          
          <div className="flex flex-col gap-1 group cursor-default">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full bg-green-500 transition-transform ${activeDot === 1 ? 'scale-125 animate-pulse' : ''}`}></div>
              <span className={`text-[10px] uppercase font-bold truncate tracking-wide ${activeDot === 1 ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-emerald-200/60'}`}>Sain</span>
            </div>
            <span className={`text-xs pl-3.5 ${activeDot === 1 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-emerald-100'}`}>18.5–25</span>
          </div>
          
          <div className="flex flex-col gap-1 group cursor-default">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full bg-amber-400 transition-transform ${activeDot === 2 ? 'scale-125 animate-pulse' : ''}`}></div>
              <span className={`text-[10px] uppercase font-bold truncate tracking-wide ${activeDot === 2 ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-emerald-200/60'}`}>Surpoids</span>
            </div>
            <span className={`text-xs pl-3.5 ${activeDot === 2 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-emerald-100'}`}>25–30</span>
          </div>
          
          <div className="flex flex-col gap-1 group cursor-default">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full bg-red-500 transition-transform ${activeDot === 3 ? 'scale-125 animate-pulse' : ''}`}></div>
              <span className={`text-[10px] uppercase font-bold truncate tracking-wide ${activeDot === 3 ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-emerald-200/60'}`}>Obèse</span>
            </div>
            <span className={`text-xs pl-3.5 ${activeDot === 3 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-emerald-100'}`}>&gt;30.0</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex justify-between items-center relative z-10">
          <span className="text-[10px] font-medium text-slate-400 dark:text-emerald-400/80">Poids: {weightTrend?.latest || '--'} kg</span>
          <button className="flex items-center gap-0.5 text-[10px] font-bold text-green-500 hover:text-green-600 dark:hover:text-green-300 transition-colors">
            DETAILS
            <span className="material-symbols-rounded text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Burned Calories Sub-Widget */}
      <div className="mt-3 bg-white dark:bg-white/5 rounded-xl p-3 flex items-center justify-between border border-transparent dark:border-white/5 shadow-sm opacity-90">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-500 dark:text-orange-300">
            <span className="material-symbols-rounded text-lg">local_fire_department</span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-800 dark:text-white">Calories Absorbées</h3>
            <p className="text-[10px] text-slate-500 dark:text-emerald-200/60">Objectif: {dailyGoal} kcal</p>
          </div>
        </div>
        <span className="text-base font-bold text-slate-900 dark:text-white">{totals.calories}</span>
      </div>
    </div>
  );
}
