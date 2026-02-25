import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday } from 'date-fns';
import { useMeals } from '../context/MealContext';

function groupMealsByDate(mealList) {
  const groups = {};
  mealList.forEach(meal => {
    const d = new Date(meal.created_at);
    const key = format(d, 'yyyy-MM-dd');
    if (!groups[key]) groups[key] = { date: d, meals: [] };
    groups[key].meals.push(meal);
  });
  return Object.values(groups).sort((a, b) => b.date - a.date);
}

function dateLabel(date) {
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return 'Hier';
  return format(date, 'd MMMM yyyy');
}


export default function Statistics() {
  const navigate = useNavigate();
  const { getWeeklyStats, weightTrend, waterToday, bmi, userHeight, meals, deleteMeal } = useMeals();
  
  const { weeklyData, totalWeeklyCalories, dailyAverage } = getWeeklyStats();
  const groupedMeals = groupMealsByDate(meals);

  return (
    <div 
      className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex justify-center"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        {/* Status Bar */}
        <div className="px-8 pt-4 pb-2 flex justify-between items-center text-sm font-semibold z-10">
          <span>9:41</span>
          <div className="flex gap-1.5 items-center">
            <span className="material-symbols-rounded text-base">signal_cellular_4_bar</span>
            <span className="material-symbols-rounded text-base">wifi</span>
            <span className="material-symbols-rounded text-base">battery_full</span>
          </div>
        </div>

        {/* Header */}
        <header className="px-6 pt-4 pb-4 flex justify-between items-center z-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full active:scale-95 transition-transform">
            <span className="material-symbols-rounded">arrow_back_ios_new</span>
          </button>
          <h1 className="text-xl font-bold">Statistics</h1>
          <button className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full active:scale-95 transition-transform">
            <span className="material-symbols-rounded">calendar_today</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
          {/* Time Filter */}
          <section className="px-6 py-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full flex gap-1">
              <button className="flex-1 py-2 rounded-full text-sm font-medium text-slate-500">Today</button>
              <button className="flex-1 bg-white dark:bg-slate-700 py-2 rounded-full text-sm font-bold shadow-sm">Week</button>
              <button className="flex-1 py-2 rounded-full text-sm font-medium text-slate-500">Month</button>
            </div>
          </section>

          {/* Bar Chart Section */}
          <section className="px-6 mt-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Intake</p>
                  <h2 className="text-2xl font-extrabold">{dailyAverage.toLocaleString()} <span className="text-sm font-bold text-slate-400">kcal</span></h2>
                </div>
                <div className="flex gap-3 text-[10px] font-bold">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8b93ff]"></span> PRO</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#7ee0b3]"></span> CARB</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ffad84]"></span> FAT</div>
                </div>
              </div>

              <div className="h-48 flex items-end justify-between gap-2 pt-4">
                {weeklyData.map((dayData, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative cursor-pointer">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-50">
                      {dayData.rawCalories} kcal
                    </div>
                    
                    <div className="w-full flex flex-col-reverse rounded-t-lg overflow-hidden transition-all duration-500 ease-out group-hover:opacity-80" style={{ height: `${Math.max(2, dayData.total)}%` }}>
                      <div className="bg-[#8b93ff]" style={{ height: `${dayData.p}%` }}></div>
                      <div className="bg-[#7ee0b3]" style={{ height: `${dayData.c}%` }}></div>
                      <div className="bg-[#ffad84]" style={{ height: `${dayData.f}%` }}></div>
                    </div>
                    {/* Surligner le jour actuel (index 6 pour aujourd'hui avec 7 jours glissants, ou on peut le laisser tel quel) */}
                    <span className={`text-[10px] font-bold ${dayData.rawCalories > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{dayData.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Analytics Cards */}
          <section className="px-6 mt-8 grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-orange-50 dark:bg-orange-950/20 rounded-3xl p-6 flex justify-between items-center transition-transform active:scale-[0.98]">
              <div>
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">Total Calories</p>
                <h3 className="text-3xl font-extrabold text-orange-900 dark:text-orange-100">{totalWeeklyCalories.toLocaleString()}</h3>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">This Week</p>
              </div>
              <div className="w-16 h-16 bg-white dark:bg-orange-900/40 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-rounded text-orange-500 text-3xl">local_fire_department</span>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-3xl p-5 flex flex-col justify-between aspect-square transition-transform active:scale-[0.98]">
              <div className="w-10 h-10 bg-white dark:bg-blue-900/40 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-rounded text-blue-500">analytics</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">Daily Average</p>
                <h3 className="text-xl font-extrabold text-blue-900 dark:text-blue-100">{dailyAverage.toLocaleString()}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="material-symbols-rounded text-xs text-slate-500 font-bold">remove</span>
                  <span className="text-[10px] font-bold text-slate-500">0% vs last week</span>
                </div>
              </div>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl p-5 flex flex-col justify-between aspect-square transition-transform active:scale-[0.98]">
              <div className="w-10 h-10 bg-white dark:bg-emerald-900/40 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-rounded text-emerald-500">monitor_weight</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">Weight Trend</p>
                <h3 className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100">{weightTrend ? weightTrend.latest : 0} kg</h3>
                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                  {weightTrend && weightTrend.diff !== 0 
                    ? `${weightTrend.diff > 0 ? '+' : ''}${weightTrend.diff} kg change`
                    : 'No change recorded'}
                </p>
              </div>
            </div>

            {/* Water Card */}
            <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-3xl p-5 flex flex-col justify-between aspect-square transition-transform active:scale-[0.98]">
              <div className="w-10 h-10 bg-white dark:bg-cyan-900/40 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-rounded text-cyan-500">water_drop</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-0.5">Hydration</p>
                <h3 className="text-xl font-extrabold text-cyan-900 dark:text-cyan-100">{waterToday} ml</h3>
                <p className="text-[10px] text-cyan-600/70 dark:text-cyan-400/70 mt-1">Today's Intake</p>
              </div>
            </div>

            {/* BMI Card */}
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-3xl p-5 flex flex-col justify-between aspect-square transition-transform active:scale-[0.98]">
              <div className="w-10 h-10 bg-white dark:bg-purple-900/40 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-rounded text-purple-500">accessibility_new</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-0.5">BMI</p>
                <h3 className="text-xl font-extrabold text-purple-900 dark:text-purple-100">{bmi > 0 ? bmi : '--'}</h3>
                <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70 mt-1">Current Ratio</p>
              </div>
            </div>

            {/* Height Card */}
            <div className="bg-teal-50 dark:bg-teal-950/20 rounded-3xl p-5 flex flex-col justify-between aspect-square transition-transform active:scale-[0.98]">
              <div className="w-10 h-10 bg-white dark:bg-teal-900/40 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-rounded text-teal-500">height</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-0.5">Taille</p>
                <h3 className="text-xl font-extrabold text-teal-900 dark:text-teal-100">{userHeight ? `${userHeight} cm` : '--'}</h3>
                <p className="text-[10px] text-teal-600/70 dark:text-teal-400/70 mt-1">Profil</p>
              </div>
            </div>
          </section>
          {/* === MEAL HISTORY === */}
          <section className="px-6 mt-8">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Historique des repas</h2>
            {groupedMeals.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
                <span className="material-symbols-rounded text-5xl">restaurant</span>
                <p className="text-sm">Aucun repas enregistré</p>
              </div>
            ) : (
              groupedMeals.map(({ date, meals: dayMeals }) => {
                const dayTotal = dayMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0);
                return (
                  <div key={date.toISOString()} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{dateLabel(date)}</span>
                      <span className="text-xs text-slate-400">{dayTotal} kcal</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {dayMeals.map(meal => (
                        <div key={meal.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700">
                          {meal.image_url ? (
                            <img src={meal.image_url} alt={meal.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-rounded text-slate-400">restaurant</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{meal.name}</p>
                            <p className="text-xs text-slate-400">{meal.calories} kcal · P:{meal.protein}g C:{meal.carbs}g F:{meal.fats}g</p>
                          </div>
                          <button
                            onClick={() => deleteMeal(meal.id)}
                            className="flex-shrink-0 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <span className="material-symbols-rounded" style={{ fontSize: 20 }}>delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </main>

      </div>
    </div>
  );
}
