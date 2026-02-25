import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useMeals } from '../context/MealContext.js';
import { LayoutGrid, List as ListIcon, Menu, Bell, Zap, ChevronRight, TrendingUp, Droplets, Target, Barcode } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { meals, stats } = useMeals();
  const [timeRange, setTimeRange] = useState('Today');

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900" contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View className="px-6 pt-12 pb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-slate-500 dark:text-slate-400 font-medium">Welcome back,</Text>
          <Text className="text-2xl font-black text-slate-900 dark:text-white">Alex Johnson</Text>
        </View>
        <TouchableOpacity className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl items-center justify-center border border-slate-200 dark:border-slate-700">
          <Bell color="#64748b" size={24} />
        </TouchableOpacity>
      </View>

      {/* Hero Stats Card */}
      <View className="px-6 mb-8">
        <View className="bg-primary dark:bg-slate-800 rounded-[32px] p-6 shadow-2xl shadow-primary/30">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-white/70 font-medium mb-1">Calories Remaining</Text>
              <Text className="text-4xl font-black text-white">1,450 <Text className="text-lg font-bold text-white/60">kcal</Text></Text>
            </View>
            <View className="bg-white/20 p-3 rounded-2xl border border-white/20">
              <TrendingUp color="white" size={24} />
            </View>
          </View>
          
          <View className="h-3 bg-white/10 rounded-full mb-6 overflow-hidden">
            <View className="h-full bg-white w-2/3 rounded-full" />
          </View>

          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-white font-bold text-lg">145g</Text>
              <Text className="text-white/60 text-xs font-medium uppercase tracking-tighter">Protein</Text>
            </View>
            <View className="w-[1px] h-8 bg-white/20" />
            <View className="items-center">
              <Text className="text-white font-bold text-lg">65g</Text>
              <Text className="text-white/60 text-xs font-medium uppercase tracking-tighter">Carbs</Text>
            </View>
            <View className="w-[1px] h-8 bg-white/20" />
            <View className="items-center">
              <Text className="text-white font-bold text-lg">42g</Text>
              <Text className="text-white/60 text-xs font-medium uppercase tracking-tighter">Fats</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-6 mb-8 flex-row gap-4">
        <TouchableOpacity 
          onPress={() => navigation.navigate('Scanner', { mode: 'ai' })}
          className="flex-1 bg-violet-50 dark:bg-violet-900/10 p-5 rounded-3xl border border-violet-100 dark:border-violet-900/20 items-center"
        >
          <View className="w-12 h-12 bg-violet-600 rounded-2xl items-center justify-center mb-3">
            <Zap color="white" size={24} />
          </View>
          <Text className="font-bold text-violet-900 dark:text-violet-300">Scan Meal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('Scanner', { mode: 'barcode' })}
          className="flex-1 bg-sky-50 dark:bg-sky-900/10 p-5 rounded-3xl border border-sky-100 dark:border-sky-900/20 items-center"
        >
          <View className="w-12 h-12 bg-sky-600 rounded-2xl items-center justify-center mb-3">
            <Barcode color="white" size={24} />
          </View>
          <Text className="font-bold text-sky-900 dark:text-sky-300">Scan Barcode</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Header */}
      <View className="px-6 mb-4 flex-row justify-between items-center">
        <Text className="text-xl font-black text-slate-900 dark:text-white">Recent Meals</Text>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Text className="text-primary font-bold">View All</Text>
        </TouchableOpacity>
      </View>

      {/* Meal List */}
      <View className="px-6">
        {meals && meals.length > 0 ? (
          meals.slice(0, 3).map((meal) => (
            <TouchableOpacity key={meal.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl mb-3 flex-row items-center border border-slate-100 dark:border-slate-700 shadow-sm">
              <View className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden items-center justify-center">
                {meal.image_url ? (
                  <Image source={{ uri: meal.image_url }} className="w-full h-full" />
                ) : (
                  <LayoutGrid color="#94A3B8" size={24} />
                )}
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-black text-slate-900 dark:text-white text-lg">{meal.name}</Text>
                <Text className="text-slate-500 dark:text-slate-400 font-medium">{meal.calories} kcal • {meal.protein}g protein</Text>
              </View>
              <ChevronRight color="#CBD5E1" size={20} />
            </TouchableOpacity>
          ))
        ) : (
          <View className="bg-slate-50 dark:bg-slate-800/50 p-12 rounded-[32px] items-center border border-dashed border-slate-200 dark:border-slate-700">
             <View className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                <Target color="#94A3B8" size={32} />
             </View>
             <Text className="text-slate-500 dark:text-slate-400 font-bold text-center">No meals logged yet. Start tracking to see your progress!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
