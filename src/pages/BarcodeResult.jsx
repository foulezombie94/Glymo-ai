import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useMeals } from '../context/MealContext';
import { logSecurity } from '../lib/logger';
import { supabase } from '../lib/supabase';
import { getAIRecommendation } from '../lib/nutrition';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

// Convert API grade (e.g. 'a-plus') to display label ('A+')
function gradeLabel(g) {
  if (!g) return '?';
  return g.toLowerCase().replace('-plus', '+').replace('-minus', '-').toUpperCase();
}

// Strip suffix (a-plus → a) for color lookup
function baseGrade(g) {
  return g?.toLowerCase().replace(/-.*$/, '') || '';
}

const nutriscoreColor = (g) => ({
  a: 'bg-green-500', b: 'bg-lime-400', c: 'bg-yellow-400', d: 'bg-orange-400', e: 'bg-red-500'
}[baseGrade(g)] || 'bg-slate-600');

const ecoscoreColor = (g) => ({
  a: 'bg-emerald-500', b: 'bg-lime-500', c: 'bg-yellow-500', d: 'bg-orange-500', e: 'bg-red-600'
}[baseGrade(g)] || 'bg-slate-600');

function InfoRow({ label, value, asBadges = false }) {
  if (!value) return null;
  const items = asBadges ? value.split(',').map(s => s.trim()).filter(Boolean) : null;
  return (
    <div className="flex gap-3 py-3 border-b border-white/5 last:border-0 min-w-0">
      <span className="text-slate-500 text-sm w-28 shrink-0 pt-0.5">{label}</span>
      {items ? (
        <div className="flex flex-wrap gap-1.5 flex-1">
          {items.map((item, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs">{item}</span>
          ))}
        </div>
      ) : (
        <span className="text-slate-200 text-sm flex-1 min-w-0" style={{ wordBreak: 'break-word' }}>{value}</span>
      )}
    </div>
  );
}

function MacroBar({ label, value, color, unit = 'g' }) {
  if (value == null) return null;
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10">
      <span className={`text-xs font-semibold mb-1 ${color}`}>{label}</span>
      <span className="text-lg font-bold text-white">{value}{unit}</span>
    </div>
  );
}

export default function BarcodeResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addMeal } = useMeals();

  const p = location.state?.productData || null;
  const [userGoal, setUserGoal] = React.useState('maintain');

  React.useEffect(() => {
    const fetchUserGoal = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('goal')
          .eq('id', session.user.id)
          .single();
        if (data?.goal) setUserGoal(data.goal);
      }
    };
    fetchUserGoal();
  }, []);

  const { recommendation, badge, score } = p ? getAIRecommendation(p, userGoal) : { recommendation: '', badge: '', score: 0 };

  const totalMacroCalories = p ? (p.protein || 0) * 4 + (p.carbs || 0) * 4 + (p.fats || 0) * 9 : 0;
  const proteinPct = totalMacroCalories > 0 ? Math.round(((p?.protein || 0) * 4 / totalMacroCalories) * 100) : 0;
  const carbsPct = totalMacroCalories > 0 ? Math.round(((p?.carbs || 0) * 4 / totalMacroCalories) * 100) : 0;
  const fatsPct = totalMacroCalories > 0 ? Math.round(((p?.fats || 0) * 9 / totalMacroCalories) * 100) : 0;

  const handleConfirm = async () => {
    if (!p) return;
    logSecurity('SCAN_EAN_CONFIRM', 'INFO', { barcode: p.barcode, name: p.name });
    await addMeal({
      name: p.name,
      calories: p.calories || 0,
      protein: p.protein || 0,
      carbs: p.carbs || 0,
      fats: p.fats || 0,
      image_url: p.image_url || null,
      barcode: p.barcode,
      nutriscore_grade: p.nutriscore_grade,
      ecoscore_grade: p.ecoscore_grade,
      brands: p.brands
    });
    navigate('/');
  };

  if (!p) {
    return (
      <div className="bg-background-dark h-screen flex flex-col items-center justify-center gap-4 text-white">
        <span className="material-symbols-rounded text-slate-500" style={{ fontSize: 64 }}>qr_code_scanner</span>
        <p className="text-slate-400">No product data. Please scan a barcode first.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-primary text-slate-900 rounded-xl font-bold">Go back</button>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-background-dark font-display h-screen text-slate-100"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="relative w-full max-w-md mx-auto h-full flex flex-col">

        {/* Top App Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-background-dark/80 backdrop-blur-md border-b border-white/5 flex-shrink-0">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <span className="font-bold text-white">Product Details</span>
          <div className="size-10" />
        </div>

        {/* Product Header */}
        <div className="flex items-center gap-4 px-5 py-5 bg-gradient-to-b from-zinc-800 to-background-dark border-b border-white/5 flex-shrink-0">
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-white/10 flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-rounded text-white/20" style={{ fontSize: 32 }}>no_photography</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white leading-tight">{p.name}</h1>
            {p.brands && <p className="text-primary text-sm font-medium mt-0.5">{p.brands}</p>}
            {p.quantity && <p className="text-slate-400 text-xs mt-1">📦 {p.quantity}</p>}
          </div>
        </div>

        <div className="flex-1 px-5 pb-32 flex flex-col gap-5 mt-4 overflow-y-auto no-scrollbar">

          {/* Scores Row */}
          {(p.nutriscore_grade || p.ecoscore_grade || p.nova_group) && (
            <div className="flex gap-3">
              {p.nutriscore_grade && (
                <div className="flex-1 flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-xs text-slate-400 font-medium">Nutri-Score</span>
                  <span className={`text-white font-black text-xl w-9 h-9 flex items-center justify-center rounded-full ${nutriscoreColor(p.nutriscore_grade)}`}>
                    {gradeLabel(p.nutriscore_grade)}
                  </span>
                </div>
              )}
              {p.ecoscore_grade && (
                <div className="flex-1 flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-xs text-slate-400 font-medium">Eco-Score</span>
                  <span className={`text-white font-black text-xl w-9 h-9 flex items-center justify-center rounded-full ${ecoscoreColor(p.ecoscore_grade)}`}>
                    {gradeLabel(p.ecoscore_grade)}
                  </span>
                </div>
              )}
              {p.nova_group && (
                <div className="flex-1 flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-xs text-slate-400 font-medium">NOVA</span>
                  <span className="text-white font-black text-xl w-9 h-9 flex items-center justify-center rounded-full bg-violet-500">
                    {p.nova_group}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Macros Section */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Nutrition / 100g</h2>
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-amber-400 font-semibold mb-1">Calories</span>
                <span className="text-lg font-bold text-white">{p.calories ?? '—'}</span>
                <span className="text-[10px] text-slate-500">kcal</span>
              </div>
              <MacroBar label="Protein" value={p.protein} color="text-primary" />
              <MacroBar label="Carbs" value={p.carbs} color="text-blue-400" />
              <MacroBar label="Fats" value={p.fats} color="text-orange-400" />
            </div>
            {/* Macro ratio bar */}
            {totalMacroCalories > 0 && (
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-1">
                <div className="bg-primary rounded-l-full transition-all" style={{ width: `${proteinPct}%` }} />
                <div className="bg-blue-400 transition-all" style={{ width: `${carbsPct}%` }} />
                <div className="bg-orange-400 rounded-r-full transition-all" style={{ width: `${fatsPct}%` }} />
              </div>
            )}
            {/* Extra nutrients */}
            {(p.sugars != null || p.fiber != null || p.saturated_fat != null || p.salt != null) && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                <MacroBar label="Sugars" value={p.sugars} color="text-pink-400" />
                <MacroBar label="Fiber" value={p.fiber} color="text-green-400" />
                <MacroBar label="Sat. Fat" value={p.saturated_fat} color="text-red-400" />
                <MacroBar label="Salt" value={p.salt} color="text-slate-300" />
              </div>
            )}
          </div>

          {/* AI Analysis Section */}
          <div className="bg-[#58ee2b]/10 border border-[#58ee2b]/20 rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span className="px-2 py-1 rounded-lg bg-[#58ee2b] text-[#142210] text-[10px] font-black tracking-widest uppercase shadow-lg">
                {badge}
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="size-16 rounded-2xl bg-[#142210] border-2 border-[#58ee2b]/50 flex items-center justify-center relative shadow-inner">
                  <span className="text-2xl font-black text-[#58ee2b]">{score}</span>
                  <span className="text-[10px] text-slate-500 font-bold absolute -bottom-1">/10</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">Health Score</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-rounded text-[#58ee2b] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <h3 className="text-[#58ee2b] font-bold text-sm tracking-wide uppercase">AI Insight</h3>
                </div>
                <p className="text-white text-base font-medium leading-snug">
                  {recommendation}
                </p>
              </div>
            </div>
            {/* Soft pulse effect */}
            <div className="absolute -bottom-10 -right-10 size-32 bg-[#58ee2b]/10 rounded-full blur-3xl animate-pulse" />
          </div>

          {/* Product Info */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Product Info</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4">
              <InfoRow label="Marques" value={p.brands} />
              <InfoRow label="Quantité" value={p.quantity} />
              <InfoRow label="Catégories" value={p.categories} asBadges />
              <InfoRow label="Labels" value={p.labels} asBadges />
              <InfoRow label="Origine" value={p.origins} asBadges />
              <InfoRow label="Fabrication" value={p.manufacturing_places} />
              <InfoRow label="Magasins" value={p.stores} asBadges />
              <InfoRow label="Pays de vente" value={p.countries} asBadges />
            </div>
          </div>

          {/* Ingredients */}
          {p.raw_ingredients_text && (
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ingrédients</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-slate-300 text-sm leading-relaxed">{p.raw_ingredients_text}</p>
              </div>
            </div>
          )}

          {/* Add to Diary Button */}
          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-primary hover:bg-green-400 text-slate-900 font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(88,238,43,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
          >
            <span className="material-symbols-rounded">add_circle</span>
            Add to Diary
          </button>
        </div>
      </div>
    </motion.div>
  );
}
