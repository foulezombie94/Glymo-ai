import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { 
  ArrowLeft, 
  Zap, 
  Flame, 
  Box, 
  PlusCircle,
  AlertCircle
} from 'lucide-react-native';
import { useMeals } from '../context/MealContext';
import { logSecurity } from '../lib/logger';



const MacroItem = ({ label, value, color, icon: Icon }) => (
  <View className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl items-center border border-slate-100 dark:border-slate-800">
    <View className={`w-8 h-8 rounded-full items-center justify-center mb-2`} style={{ backgroundColor: `${color}15` }}>
       <Icon size={16} color={color} />
    </View>
    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</Text>
    <Text className="text-lg font-black text-slate-900 dark:text-white">{value}g</Text>
  </View>
);

const ScoreBadge = ({ label, grade, color }) => {
  if (!grade) return null;
  return (
    <View className="flex-1 items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</Text>
      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: color }}>
        <Text className="text-white font-black text-lg uppercase">{grade.charAt(0)}</Text>
      </View>
    </View>
  );
};

export default function ResultsDetailScreen({ route, navigation }) {
  const { mealData } = route.params || {};
  const { addMeal } = useMeals();

  if (!mealData) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900 px-10">
        <AlertCircle size={64} color="#94a3b8" />
        <Text className="text-slate-500 font-bold text-center mt-4">Aucune donnée de repas trouvée.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-8 bg-green-500 px-8 py-4 rounded-full">
           <Text className="text-white font-bold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleConfirm = async () => {
    try {
      await addMeal(mealData);
      logSecurity('MEAL_LOGGED', 'INFO', { meal_name: mealData.name, source: 'scan' });
      navigation.navigate('Main', { screen: 'Dashboard' });
    } catch (_err) {
      console.error(_err);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Header Image */}
        <View className="relative w-full h-[350px]">
          <Image 
            source={{ uri: mealData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500' }} 
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/20" />
          
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="absolute top-14 left-6 w-12 h-12 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-6 -mt-10 bg-white dark:bg-slate-950 rounded-t-[50px] pt-10">
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 mr-4">
              <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Scan Results</Text>
              <Text className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{mealData.name}</Text>
              {mealData.brands && <Text className="text-green-600 font-bold mt-1">{mealData.brands}</Text>}
            </View>
            <View className="bg-green-500 p-4 rounded-3xl items-center justify-center shadow-lg shadow-green-500/40">
               <Text className="text-white font-black text-2xl">{mealData.calories}</Text>
               <Text className="text-white/80 text-[10px] font-bold uppercase">Kcal</Text>
            </View>
          </View>

          {/* AI Insight Box */}
          <View className="bg-green-500/10 p-6 rounded-[32px] border border-green-500/20 mb-8 overflow-hidden">
             <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center mr-3">
                   <Zap size={16} color="white" fill="white" />
                </View>
                <Text className="text-green-600 font-black uppercase tracking-widest text-xs">AI Nutrition Insight</Text>
             </View>
             <Text className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                Ce repas est riche en nutriments essentiels. {mealData.protein > 20 ? "Excellent apport en protéines pour la récupération musculaire." : "Bon équilibre général pour votre objectif."}
             </Text>
          </View>

          {/* Macros Grid */}
          <View className="flex-row gap-3 mb-8">
            <MacroItem label="Protein" value={mealData.protein} color="#22c55e" icon={Zap} />
            <MacroItem label="Carbs" value={mealData.carbs} color="#3b82f6" icon={Box} />
            <MacroItem label="Fats" value={mealData.fats} color="#f59e0b" icon={Flame} />
          </View>

          {/* Scores (if barcode) */}
          {(mealData.nutriscore_grade || mealData.ecoscore_grade) && (
            <View className="flex-row gap-4 mb-8">
               <ScoreBadge label="Nutri-Score" grade={mealData.nutriscore_grade} color="#22c55e" />
               <ScoreBadge label="Eco-Score" grade={mealData.ecoscore_grade} color="#10b981" />
            </View>
          )}

          {/* Details Section */}
          <View className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800">
             <Text className="text-slate-900 dark:text-white font-black text-lg mb-4">Détails Additionnels</Text>
             
             <View className="flex-row justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <Text className="text-slate-500 font-bold">Fibres</Text>
                <Text className="text-slate-900 dark:text-white font-black">{mealData.fiber || 0}g</Text>
             </View>
             <View className="flex-row justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <Text className="text-slate-500 font-bold">Sucres</Text>
                <Text className="text-slate-900 dark:text-white font-black">{mealData.sugars || 0}g</Text>
             </View>
             <View className="flex-row justify-between py-3">
                <Text className="text-slate-500 font-bold">Sel</Text>
                <Text className="text-slate-900 dark:text-white font-black">{mealData.salt || 0}g</Text>
             </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute bottom-10 left-6 right-6">
        <TouchableOpacity 
          onPress={handleConfirm}
          className="bg-green-500 h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-green-500/40 active:scale-[0.98]"
        >
          <PlusCircle size={24} color="white" />
          <Text className="text-white font-black text-lg ml-3">Ajouter à mon journal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
