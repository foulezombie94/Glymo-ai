import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { logSecurity } from '../../lib/logger';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function PersonalDetails() {
  const navigate = useNavigate();
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState(1.2);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [goal, setGoal] = useState('maintain');
  const { lang, toggleLanguage } = useLanguage();

  // Fetch goal from Supabase profile (set by GoalSelection step)
  useEffect(() => {
    const fetchGoal = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('goal')
          .eq('id', session.user.id)
          .single();
        if (data?.goal) setGoal(data.goal);
      }
    };
    fetchGoal();
  }, []);

  const content = {
    EN: {
      step: "Step 4 of 4",
      title: "Personal Details",
      description: "This helps the AI calculate your perfect meal plans and insights.",
      weightLabel: "Current Weight",
      heightLabel: "Height",
      ageLabel: "Age",
      genderLabel: "Gender",
      genderMale: "Male",
      genderFemale: "Female",
      activityLabel: "Activity Level",
      activitySedentary: "Sedentary (Little exercise)",
      activityLight: "Light (1-3 days/week)",
      activityModerate: "Moderate (3-5 days/week)",
      activityActive: "Active (6-7 days/week)",
      aiGoalTitle: "Daily Goal",
      aiGoalDesc: "Based on your info, we recommend this daily intake.",
      modifierLose: "Includes a 400 kcal deficit for weight loss",
      modifierBuild: "Includes a 300 kcal surplus to build muscle",
      modifierMaintain: "Maintenance calories (no deficit/surplus)",
      completeBtn: "Complete Profile"
    },
    FR: {
      step: "Étape 4 sur 4",
      title: "Détails Personnels",
      description: "Cela aide l'IA à calculer vos plans de repas parfaits.",
      weightLabel: "Poids Actuel",
      heightLabel: "Taille",
      ageLabel: "Âge",
      genderLabel: "Genre",
      genderMale: "Homme",
      genderFemale: "Femme",
      activityLabel: "Niveau d'activité",
      activitySedentary: "Sédentaire (Peu d'exercice)",
      activityLight: "Activité légère (1-3 fois/sem.)",
      activityModerate: "Activité modérée (3-5 fois/sem.)",
      activityActive: "Actif (6-7 fois/sem.)",
      aiGoalTitle: "Objectif Quotidien",
      aiGoalDesc: "Sur la base de vos infos, voici l'apport recommandé.",
      modifierLose: "Inclut un déficit de 400 kcal pour perdre du poids",
      modifierBuild: "Inclut un surplus de 300 kcal pour prendre du muscle",
      modifierMaintain: "Calories de maintien (aucun déficit/surplus)",
      completeBtn: "Terminer le Profil"
    },
    ES: {
      step: "Paso 4 de 4",
      title: "Detalles Personales",
      description: "Esto ayuda a la IA a calcular tus planes de comidas.",
      weightLabel: "Peso Actual",
      heightLabel: "Altura",
      ageLabel: "Edad",
      genderLabel: "Género",
      genderMale: "Hombre",
      genderFemale: "Mujer",
      activityLabel: "Nivel de actividad",
      activitySedentary: "Sedentario (Poco ejercicio)",
      activityLight: "Ligero (1-3 días/sem.)",
      activityModerate: "Moderado (3-5 días/sem.)",
      activityActive: "Activo (6-7 días/sem.)",
      aiGoalTitle: "Objetivo Diario",
      aiGoalDesc: "Basado en tu info, recomendamos este consumo.",
      modifierLose: "Incluye un déficit de 400 kcal para perder peso",
      modifierBuild: "Incluye un superávit de 300 kcal para ganar músculo",
      modifierMaintain: "Calorías de mantenimiento (sin déficit/superávit)",
      completeBtn: "Completar Perfil"
    }
  };

  const currentContent = content[lang] || content['EN'];
  const [modifierText, setModifierText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mb = 0;
    if (gender === 'male') {
      mb = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      mb = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    let tdee = mb * activity;

    if (goal === 'lose_weight') {
      tdee -= 400;
      setModifierText(currentContent.modifierLose);
    } else if (goal === 'build_muscle') {
      tdee += 300;
      setModifierText(currentContent.modifierBuild);
    } else {
      setModifierText(currentContent.modifierMaintain);
    }
    
    if (tdee < 1200) tdee = 1200;

    setCalorieGoal(Math.round(tdee));
  }, [weight, height, age, gender, activity, goal, currentContent]);


  const handleFinish = async () => {
    setLoading(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (session && !sessionError) {
        const profileUpdate = {
          id: session.user.id,
          email: session.user.email,
          goal: goal,
          height: height,
          weight: weight,
          age: age,
          gender: gender,
          activity_level: activity,
          calorie_goal: calorieGoal,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('profiles')
          .upsert(profileUpdate);

        if (updateError) {
          console.error("Supabase profile update error:", updateError);
        } else {
          logSecurity('ONBOARDING_COMPLETE', 'INFO', { goal, weight });
          await supabase.from('weight_logs').insert([{
             user_id: session.user.id,
             weight: weight,
             logged_date: new Date().toISOString().split('T')[0]
          }]);
        }
      }
    } catch (err) {
      console.error('Error verifying session or saving profile:', err);
    } finally {
      navigate('/', { replace: true, state: { fromOnboarding: true } });
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="text-slate-900 dark:text-slate-100 antialiased h-full font-display bg-[#f7f8f5] dark:bg-[#1a2210] overflow-hidden">
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
            <div className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 pt-8 pb-32 no-scrollbar z-10">
          <h1 className="text-3xl font-extrabold leading-tight mb-3">
            {currentContent.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-8">
            {currentContent.description}
          </p>

          <div className="space-y-6">
            {/* Gender Input */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-3">{currentContent.genderLabel}</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setGender('male')}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${gender === 'male' ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-green-500/50'}`}
                >
                  {currentContent.genderMale}
                </button>
                <button 
                  onClick={() => setGender('female')}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${gender === 'female' ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-green-500/50'}`}
                >
                  {currentContent.genderFemale}
                </button>
              </div>
            </div>

            {/* Age Input */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <label className="font-bold text-slate-700 dark:text-slate-300">{currentContent.ageLabel}</label>
                <div className="flex items-center bg-white dark:bg-slate-900 shadow-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
                  <input 
                    type="number" 
                    min="15" max="100" 
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-14 px-2 py-1 font-bold text-green-600 dark:text-green-400 bg-transparent text-center focus:outline-none appearance-none border-none ring-0"
                  />
                </div>
              </div>
              <input 
                type="range" 
                min="15" max="100" 
                value={age} 
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* Weight Input */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <label className="font-bold text-slate-700 dark:text-slate-300">{currentContent.weightLabel}</label>
                <div className="flex items-center bg-white dark:bg-slate-900 shadow-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
                  <input 
                    type="number" 
                    min="40" max="250" 
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 font-bold text-green-600 dark:text-green-400 bg-transparent text-right focus:outline-none appearance-none border-none ring-0"
                  />
                  <span className="font-bold text-green-600 dark:text-green-400 pr-2 pb-0.5 text-sm">kg</span>
                </div>
              </div>
              <input 
                type="range" 
                min="40" max="150" 
                value={weight} 
                onChange={(e) => setWeight(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* Height Input */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <label className="font-bold text-slate-700 dark:text-slate-300">{currentContent.heightLabel}</label>
                <div className="flex items-center bg-white dark:bg-slate-900 shadow-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
                  <input 
                    type="number" 
                    min="100" max="250" 
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 font-bold text-green-600 dark:text-green-400 bg-transparent text-right focus:outline-none appearance-none border-none ring-0"
                  />
                  <span className="font-bold text-green-600 dark:text-green-400 pr-2 pb-0.5 text-sm">cm</span>
                </div>
              </div>
              <input 
                type="range" 
                min="120" max="220" 
                value={height} 
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* Activity Level Select */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-3">{currentContent.activityLabel}</label>
              <div className="relative">
                <select 
                  value={activity}
                  onChange={(e) => setActivity(parseFloat(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 appearance-none outline-none focus:border-green-500"
                >
                  <option value={1.2}>{currentContent.activitySedentary}</option>
                  <option value={1.375}>{currentContent.activityLight}</option>
                  <option value={1.55}>{currentContent.activityModerate}</option>
                  <option value={1.725}>{currentContent.activityActive}</option>
                </select>
                <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            {/* Daily Calorie Goal Estimator */}
            <div className="bg-green-50 dark:bg-green-950/20 p-5 rounded-2xl border border-green-100 dark:border-green-900/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-rounded text-green-600 dark:text-green-400 text-xl">local_fire_department</span>
                <h3 className="font-bold text-green-900 dark:text-green-100">{currentContent.aiGoalTitle}</h3>
              </div>
              <p className="text-sm text-green-700/80 dark:text-green-400/80 mb-4">{currentContent.aiGoalDesc}</p>
              
              <div className="flex justify-center items-end gap-1 mb-2">
                <input 
                  type="number" 
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(parseInt(e.target.value) || 0)}
                  className="bg-transparent text-4xl font-extrabold text-center w-28 text-green-800 dark:text-green-200 border-b-2 border-green-300 dark:border-green-700 focus:outline-none focus:border-green-500 rounded-none p-0"
                />
                <span className="text-green-700 font-bold mb-1">kcal</span>
              </div>
              
              {modifierText && (
                <p className="text-center text-xs font-medium text-green-600/70 dark:text-green-400/70 italic mt-3 text-balance">
                  {modifierText}
                </p>
              )}
            </div>
          </div>
        </main>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-0 w-full px-6 z-20 bg-gradient-to-t from-white via-white/100 dark:from-slate-900 dark:via-slate-900/100 to-transparent safe-bottom pt-10">
          <button 
            onClick={handleFinish}
            disabled={loading}
            className={`w-full font-black text-lg h-14 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${loading ? 'bg-green-400 text-white/80 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30 active:scale-[0.98]'}`}
          >
            {loading ? (
              <>
                <span className="material-symbols-rounded animate-spin text-xl">progress_activity</span>
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>{currentContent.completeBtn}</span>
                <span className="material-symbols-rounded">check_circle</span>
              </>
            )}
          </button>
        </div>
        
        {/* Decorative Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-50 pointer-events-none opacity-30"></div>
      </div>
    </div>
  );
}
