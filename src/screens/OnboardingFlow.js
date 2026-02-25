import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { logSecurity } from '../lib/logger';
import { 
  ArrowRight, 
  ArrowLeft, 
  Share2, 
  Users, 
  ShoppingBag, 
  MoreHorizontal, 
  Target, 
  TrendingUp, 
  Zap, 
  Flame, 
  CheckCircle2,
  Globe
} from 'lucide-react-native';





const CONTENT = {
  EN: {
    steps: ["Step 1 of 4", "Step 2 of 4", "Step 3 of 4", "Step 4 of 4"],
    discovery: {
      title: "Discovery Source",
      desc: "Help us understand how you reached our AI nutrition community.",
      sources: [
        { id: 'social', icon: Share2, title: 'Social Media', desc: 'Instagram, TikTok, or others' },
        { id: 'friends', icon: Users, title: 'Friends/Family', desc: 'Recommended by someone' },
        { id: 'store', icon: ShoppingBag, title: 'App Store', desc: 'Search or featured' },
        { id: 'other', icon: MoreHorizontal, title: 'Other', desc: 'None of the above' },
      ]
    },
    goal: {
      title: "What's your goal?",
      desc: "We'll tailor your experience based on this target.",
      options: [
        { id: 'lose_weight', icon: TrendingUp, title: 'Weight Loss', desc: 'Burn fat & get lean' },
        { id: 'maintain', icon: Target, title: 'Maintenance', desc: 'Stay at current weight' },
        { id: 'build_muscle', icon: Zap, title: 'Muscle Gain', desc: 'Bulk up & get stronger' },
      ]
    },
    details: {
      title: "Personal Details",
      desc: "This helps the AI calculate your perfect meal plans.",
      weight: "Weight (kg)",
      height: "Height (cm)",
      age: "Age",
      gender: "Gender",
      male: "Male",
      female: "Female",
      activity: "Activity Level",
      activityLevels: [
        { label: "Sedentary (Little exercise)", val: 1.2 },
        { label: "Light (1-3 days/week)", val: 1.375 },
        { label: "Moderate (3-5 days/week)", val: 1.55 },
        { label: "Active (6-7 days/week)", val: 1.725 }
      ]
    },
    result: {
      title: "Daily Goal",
      desc: "Based on your info, we recommend this daily intake.",
      modifierLose: "Includes a 400 kcal deficit for weight loss",
      modifierBuild: "Includes a 300 kcal surplus to build muscle",
      modifierMaintain: "Maintenance calories (no deficit/surplus)",
      completeBtn: "Complete Profile"
    },
    next: "Next Step",
    back: "Back"
  },
  FR: {
    steps: ["Étape 1 sur 4", "Étape 2 sur 4", "Étape 3 sur 4", "Étape 4 sur 4"],
    discovery: {
      title: "Source de découverte",
      desc: "Aidez-nous à comprendre comment vous avez connu notre application.",
      sources: [
        { id: 'social', icon: Share2, title: 'Réseaux Sociaux', desc: 'Instagram, TikTok, ou autres' },
        { id: 'friends', icon: Users, title: 'Amis/Famille', desc: 'Recommandé par un proche' },
        { id: 'store', icon: ShoppingBag, title: 'App Store', desc: 'Recherche ou mise en avant' },
        { id: 'other', icon: MoreHorizontal, title: 'Autre', desc: 'Aucune de ces réponses' },
      ]
    },
    goal: {
      title: "Quel est votre objectif ?",
      desc: "Nous adapterons votre expérience en fonction de cet objectif.",
      options: [
        { id: 'lose_weight', icon: TrendingUp, title: 'Perte de poids', desc: 'Brûler des graisses' },
        { id: 'maintain', icon: Target, title: 'Maintien', desc: 'Rester au poids actuel' },
        { id: 'build_muscle', icon: Zap, title: 'Prise de muscle', desc: 'Forcir et se muscler' },
      ]
    },
    details: {
      title: "Détails Personnels",
      desc: "Cela aide l'IA à calculer vos plans de repas parfaits.",
      weight: "Poids (kg)",
      height: "Taille (cm)",
      age: "Âge",
      gender: "Genre",
      male: "Homme",
      female: "Femme",
      activity: "Niveau d'activité",
      activityLevels: [
        { label: "Sédentaire (Peu d'exercice)", val: 1.2 },
        { label: "Léger (1-3 fois/sem.)", val: 1.375 },
        { label: "Modéré (3-5 fois/sem.)", val: 1.55 },
        { label: "Actif (6-7 fois/sem.)", val: 1.725 }
      ]
    },
    result: {
      title: "Objectif Quotidien",
      desc: "Selon vos infos, voici l'apport recommandé.",
      modifierLose: "Inclut un déficit de 400 kcal pour perdre du poids",
      modifierBuild: "Inclut un surplus de 300 kcal pour prendre du muscle",
      modifierMaintain: "Calories de maintien (aucun déficit/surplus)",
      completeBtn: "Terminer le Profil"
    },
    next: "Suivant",
    back: "Retour"
  }
};

export default function OnboardingFlow() {
  const [lang, setLang] = useState('FR');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // State Data
  const [discoverySource, setDiscoverySource] = useState(null);
  const [goal, setGoal] = useState('maintain');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState(1.2);
  const [calorieGoal, setCalorieGoal] = useState(2000);

  const t = CONTENT[lang] || CONTENT.EN;

  // Calculate calories whenever relevant data changes
  useEffect(() => {
    let mb;
    const w = parseFloat(weight) || 70;
    const h = parseFloat(height) || 175;
    const a = parseInt(age) || 30;
    
    if (gender === 'male') {
      mb = (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      mb = (10 * w) + (6.25 * h) - (5 * a) - 161;
    }
    
    let tdee = mb * activity;
    if (goal === 'lose_weight') tdee -= 400;
    else if (goal === 'build_muscle') tdee += 300;
    
    if (tdee < 1200) tdee = 1200;
    setCalorieGoal(Math.round(tdee));
  }, [weight, height, age, gender, activity, goal]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'EN' ? 'FR' : 'EN');
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const profileUpdate = {
        id: session.user.id,
        email: session.user.email,
        goal,
        discovery_source: discoverySource,
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        gender,
        activity_level: activity,
        calorie_goal: calorieGoal,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileUpdate);

      if (error) throw error;
      
      // Log weight change
      await supabase.from('weight_logs').insert([{
         user_id: session.user.id,
         weight: parseFloat(weight),
         logged_date: new Date().toISOString().split('T')[0]
      }]);

      logSecurity('ONBOARDING_COMPLETE', 'INFO', { goal, weight });
      
      // Navigation will be handled by AppNavigator observing profiles table updates
    } catch (_err) {
      Alert.alert("Erreur", _err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View className="flex-1">
      <Text className="text-3xl font-black text-slate-900 dark:text-white mb-3">{t.discovery.title}</Text>
      <Text className="text-slate-500 dark:text-slate-400 text-lg mb-8">{t.discovery.desc}</Text>
      
      {t.discovery.sources.map((item) => (
        <TouchableOpacity 
          key={item.id}
          onPress={() => { setDiscoverySource(item.id); setStep(2); }}
          className={`flex-row items-center p-5 rounded-3xl mb-4 border-2 ${discoverySource === item.id ? 'border-green-500 bg-green-500/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50'}`}
        >
          <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${discoverySource === item.id ? 'bg-green-500' : 'bg-green-500/10'}`}>
            <item.icon size={24} color={discoverySource === item.id ? 'white' : '#22c55e'} />
          </View>
          <View className="flex-1">
            <Text className={`text-lg font-bold ${discoverySource === item.id ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>{item.title}</Text>
            <Text className="text-slate-500 text-sm">{item.desc}</Text>
          </View>
          {discoverySource === item.id && <CheckCircle2 size={24} color="#22c55e" />}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep2 = () => (
    <View className="flex-1">
      <Text className="text-3xl font-black text-slate-900 dark:text-white mb-3">{t.goal.title}</Text>
      <Text className="text-slate-500 dark:text-slate-400 text-lg mb-8">{t.goal.desc}</Text>
      
      {t.goal.options.map((item) => (
        <TouchableOpacity 
          key={item.id}
          onPress={() => { setGoal(item.id); setStep(3); }}
          className={`flex-row items-center p-6 rounded-3xl mb-4 border-2 ${goal === item.id ? 'border-green-500 bg-green-500/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50'}`}
        >
          <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${goal === item.id ? 'bg-green-500' : 'bg-green-500/10'}`}>
            <item.icon size={28} color={goal === item.id ? 'white' : '#22c55e'} />
          </View>
          <View className="flex-1">
            <Text className={`text-xl font-bold ${goal === item.id ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>{item.title}</Text>
            <Text className="text-slate-500 text-sm">{item.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t.details.title}</Text>
      <Text className="text-slate-500 dark:text-slate-400 text-lg mb-8">{t.details.desc}</Text>
      
      <View className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-6">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-4">{t.details.gender}</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={() => setGender('male')}
            className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border-2 ${gender === 'male' ? 'border-green-500 bg-white' : 'border-transparent bg-slate-200'}`}
          >
             <Text className={`font-bold ${gender === 'male' ? 'text-green-600' : 'text-slate-500'}`}>{t.details.male}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setGender('female')}
            className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border-2 ${gender === 'female' ? 'border-green-500 bg-white' : 'border-transparent bg-slate-200'}`}
          >
             <Text className={`font-bold ${gender === 'female' ? 'text-green-600' : 'text-slate-500'}`}>{t.details.female}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
           <Text className="text-slate-500 text-xs font-bold uppercase mb-2">{t.details.weight}</Text>
           <TextInput 
             value={weight} onChangeText={setWeight} keyboardType="numeric"
             className="text-2xl font-black text-slate-900 dark:text-white"
           />
        </View>
        <View className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
           <Text className="text-slate-500 text-xs font-bold uppercase mb-2">{t.details.height}</Text>
           <TextInput 
             value={height} onChangeText={setHeight} keyboardType="numeric"
             className="text-2xl font-black text-slate-900 dark:text-white"
           />
        </View>
      </View>

      <View className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 mb-6">
           <Text className="text-slate-500 text-xs font-bold uppercase mb-2">{t.details.age}</Text>
           <TextInput 
             value={age} onChangeText={setAge} keyboardType="numeric"
             className="text-2xl font-black text-slate-900 dark:text-white"
           />
      </View>

      <TouchableOpacity 
        onPress={() => setStep(4)}
        className="bg-green-500 py-5 rounded-2xl items-center shadow-lg shadow-green-500/30 active:scale-95 mb-10"
      >
        <Text className="text-white font-black text-lg">{t.next}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t.result.title}</Text>
      <Text className="text-slate-500 dark:text-slate-400 text-lg mb-8">{t.result.desc}</Text>
      
      <View className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-8">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-4">{t.details.activity}</Text>
        {t.details.activityLevels.map((lvl) => (
          <TouchableOpacity 
            key={lvl.val}
            onPress={() => setActivity(lvl.val)}
            className={`p-4 rounded-xl mb-2 flex-row items-center justify-between ${activity === lvl.val ? 'bg-green-500' : 'bg-slate-200'}`}
          >
            <Text className={`font-semibold ${activity === lvl.val ? 'text-white' : 'text-slate-600'}`}>{lvl.label}</Text>
            {activity === lvl.val && <CheckCircle2 size={18} color="white" />}
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-green-500/10 p-8 rounded-[40px] items-center mb-10 border border-green-500/20">
        <View className="bg-green-500 w-16 h-16 rounded-3xl items-center justify-center mb-4 shadow-lg shadow-green-500/40">
           <Flame size={32} color="white" fill="white" />
        </View>
        <Text className="text-5xl font-black text-green-600 mb-1">{calorieGoal}</Text>
        <Text className="text-green-600 font-bold uppercase tracking-widest text-xs mb-4">kcal / jour</Text>
        <Text className="text-slate-500 text-center text-sm font-medium px-4">
          {goal === 'lose_weight' ? t.result.modifierLose : goal === 'build_muscle' ? t.result.modifierBuild : t.result.modifierMaintain}
        </Text>
      </View>

      <TouchableOpacity 
        onPress={handleFinish}
        disabled={loading}
        className="bg-green-500 py-5 rounded-2xl items-center shadow-lg shadow-green-500/30 active:scale-95 mb-10"
      >
        {loading ? <ActivityIndicator color="white" /> : <View className="flex-row items-center gap-2">
          <Text className="text-white font-black text-lg">{t.result.completeBtn}</Text>
          <ArrowRight size={20} color="white" />
        </View>}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      {/* Header */}
      <View className="px-8 pt-16 flex-row items-center justify-between mb-8">
         <TouchableOpacity 
           onPress={() => step > 1 ? setStep(step - 1) : null}
           className={`w-12 h-12 rounded-full items-center justify-center bg-slate-100 dark:bg-slate-800 ${step === 1 ? 'opacity-0' : 'opacity-100'}`}
         >
           <ArrowLeft size={24} color="#64748b" />
         </TouchableOpacity>
         
         <View className="flex-row items-center gap-2">
           <View className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
             <View className="h-full bg-green-500 rounded-full" style={{ width: `${(step / 4) * 100}%` }} />
           </View>
           <Text className="text-xs font-bold text-slate-400">{t.steps[step-1]}</Text>
         </View>

         <TouchableOpacity 
           onPress={toggleLanguage}
           className="w-12 h-12 rounded-full items-center justify-center bg-slate-100 dark:bg-slate-800"
         >
           <Globe size={20} color="#64748b" />
         </TouchableOpacity>
      </View>

      <View className="flex-1 px-8 pb-10">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </View>
    </View>
  );
}
