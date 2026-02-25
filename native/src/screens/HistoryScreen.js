import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ScrollView, Dimensions, Image } from 'react-native';
import { useMeals } from '../context/MealContext.js';
import { Trash2, ChevronRight, History as HistoryIcon, LayoutGrid, TrendingUp, Flame, Calendar, Award } from 'lucide-react-native';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

const AnalyticsCard = ({ title, value, unit, icon: Icon, color }) => (
  <View className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-50 dark:border-slate-800 shadow-sm">
    <View className="flex-row justify-between mb-3">
       <View className="p-2 rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon size={18} color={color} />
       </View>
    </View>
    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</Text>
    <Text className="text-xl font-black text-slate-900 dark:text-white">{value} <Text className="text-xs text-slate-400">{unit}</Text></Text>
  </View>
);

export default function HistoryScreen() {
  const { meals, deleteMeal, getWeeklyStats, calorieGoal } = useMeals();
  const { weeklyData, totalWeeklyCalories } = useMemo(() => getWeeklyStats(), [meals, getWeeklyStats]);

  const avgCalories = Math.round(totalWeeklyCalories / 7);

  const handleDelete = (id) => {
    Alert.alert(
      "Supprimer l'entrée",
      "Voulez-vous vraiment supprimer ce repas ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => deleteMeal(id) }
      ]
    );
  };

  const renderHeader = () => (
    <View className="px-6 pt-14 pb-8">
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Your Progress</Text>
          <Text className="text-3xl font-black text-slate-900 dark:text-white">Statistics</Text>
        </View>
        <TouchableOpacity className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl items-center justify-center shadow-sm">
           <HistoryIcon color="#22c55e" size={24} />
        </TouchableOpacity>
      </View>

      {/* Analytics Grid */}
      <View className="flex-row gap-4 mb-8">
         <AnalyticsCard title="Avg Daily" value={avgCalories} unit="kcal" icon={Flame} color="#22c55e" />
         <AnalyticsCard title="Weekly Total" value={totalWeeklyCalories} unit="kcal" icon={TrendingUp} color="#6366f1" />
      </View>

      {/* Chart Section */}
      <View className="bg-white dark:bg-slate-900 p-6 rounded-[40px] shadow-sm mb-8 border border-slate-50 dark:border-slate-800">
         <Text className="text-slate-900 dark:text-white font-black text-lg mb-6">Current Week</Text>
         <View className="flex-row justify-between items-end h-[120px] px-2">
            {weeklyData.map((day, i) => {
               const barHeight = Math.max(10, (day.rawCalories / (calorieGoal * 1.5)) * 100);
               return (
                  <View key={i} className="items-center">
                     <View 
                       className={`w-6 rounded-full ${day.rawCalories > calorieGoal ? 'bg-orange-400' : 'bg-green-500'}`} 
                       style={{ height: barHeight }} 
                     />
                     <Text className="text-[10px] font-bold text-slate-400 mt-2">{day.day}</Text>
                  </View>
               );
            })}
         </View>
      </View>

      <Text className="text-lg font-black text-slate-900 dark:text-white mb-4">Meal History</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="bg-white dark:bg-slate-900 p-4 rounded-3xl mb-3 flex-row items-center border border-slate-50 dark:border-slate-800 shadow-sm mx-6">
      <View className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl items-center justify-center overflow-hidden">
        {item.image_url ? (
           <Image source={{ uri: item.image_url }} className="w-full h-full" />
        ) : (
           <LayoutGrid color="#94A3B8" size={24} />
        )}
      </View>
      <View className="flex-1 ml-4">
        <Text className="font-bold text-slate-900 dark:text-white text-base" numberOfLines={1}>{item.name}</Text>
        <Text className="text-slate-400 text-xs font-semibold">{item.calories} kcal • {new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => handleDelete(item.id)}
        className="p-3 bg-red-50 dark:bg-red-900/10 rounded-2xl"
      >
        <Trash2 color="#EF4444" size={18} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-[#f8fafc] dark:bg-slate-950">
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 mx-6 bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
            <View className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
               <Calendar color="#94A3B8" size={32} />
            </View>
            <Text className="text-slate-500 dark:text-slate-400 font-bold">Aucun historique pour le moment</Text>
          </View>
        }
      />
    </View>
  );
}
