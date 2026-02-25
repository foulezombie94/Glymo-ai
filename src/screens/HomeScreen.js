import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useMeals } from '../context/MealContext.js';
import { supabase } from '../lib/supabase';
import { 
  Zap, 
  ChevronRight, 
  TrendingUp, 
  Barcode, 
  Flame,
  ArrowUpRight,
  Scale
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';



const DonutChart = ({ calories, goal }) => {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(calories / (goal || 2000), 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-4xl font-black text-slate-900 dark:text-white">{calories}</Text>
        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">KCAL</Text>
      </View>
    </View>
  );
};

import PlatformButton from '../components/UI/PlatformButton';
import PlatformContainer from '../components/UI/PlatformContainer';

export default function HomeScreen({ navigation }) {
  const { 
    meals, 
    loading, 
    getTotalsByRange, 
    calorieGoal, 
    bmi, 
    weightTrend 
  } = useMeals();
  
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const { totals } = useMemo(() => getTotalsByRange('today'), [getTotalsByRange]);

  const displayName = profile?.full_name ? profile.full_name.split(' ')[0] : 'User';

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <PlatformContainer style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-6 pt-14 pb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Your Dashboard</Text>
            <Text className="text-3xl font-black text-slate-900 dark:text-white">Hello, {displayName}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm"
          >
            <Image 
              source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' }} 
              className="w-full h-full"
            />
          </TouchableOpacity>
        </View>

        {/* Calories Overview Card */}
        <View className="px-6 mb-8">
          <View className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none items-center">
            <DonutChart calories={totals.calories} goal={calorieGoal} />
            
            <View className="flex-row w-full justify-between mt-8 border-t border-slate-50 dark:border-slate-800 pt-8">
              <View className="items-center">
                <Text className="text-green-500 font-black text-xl">{totals.protein}g</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Protein</Text>
              </View>
              <View className="items-center">
                <Text className="text-blue-500 font-black text-xl">{totals.carbs}g</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Carbs</Text>
              </View>
              <View className="items-center">
                <Text className="text-orange-500 font-black text-xl">{totals.fats}g</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Fats</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Widgets */}
        <View className="px-6 mb-8 flex-row gap-4">
          <View className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-lg shadow-slate-100/50 dark:shadow-none">
            <View className="flex-row justify-between mb-4">
              <View className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-xl">
                <Scale size={20} color="#6366f1" />
              </View>
              <ArrowUpRight size={16} color="#94a3b8" />
            </View>
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">BMI</Text>
            <Text className="text-2xl font-black text-slate-900 dark:text-white">{bmi || '--'}</Text>
          </View>

          <View className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-lg shadow-slate-100/50 dark:shadow-none">
            <View className="flex-row justify-between mb-4">
              <View className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-xl">
                <TrendingUp size={20} color="#10b981" />
              </View>
              <ArrowUpRight size={16} color="#94a3b8" />
            </View>
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Weight</Text>
            <Text className="text-2xl font-black text-slate-900 dark:text-white">{weightTrend.latest} <Text className="text-xs font-bold text-slate-400">kg</Text></Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-black text-slate-900 dark:text-white mb-4">Add to Logs</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Scanner', { mode: 'ai' })}
              className="flex-1 bg-green-500 p-6 rounded-[32px] shadow-lg shadow-green-500/30 items-center justify-center"
            >
              <Zap size={28} color="white" fill="white" />
              <Text className="text-white font-black mt-2">AI Scan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('Scanner', { mode: 'barcode' })}
              className="flex-1 bg-slate-900 dark:bg-slate-800 p-6 rounded-[32px] shadow-lg shadow-slate-900/20 items-center justify-center"
            >
              <Barcode size={28} color="white" />
              <Text className="text-white font-black mt-2">Barcode</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Meal List */}
        <View className="px-6">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-lg font-black text-slate-900 dark:text-white">Recent Activity</Text>
            <PlatformButton 
              title="See all" 
              onPress={() => navigation.navigate('History')}
              style={{ backgroundColor: 'transparent', padding: 0 }}
              textStyle={{ color: '#22c55e', fontSize: 14, fontWeight: 'bold' }}
            />
          </View>

        {meals && meals.length > 0 ? (
          meals.slice(0, 3).map((meal) => (
            <TouchableOpacity 
              key={meal.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-3xl mb-3 flex-row items-center border border-slate-50 dark:border-slate-800"
            >
              <View className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden items-center justify-center">
                {meal.image_url ? (
                  <Image source={{ uri: meal.image_url }} className="w-full h-full" />
                ) : (
                  <Flame color="#22c55e" size={24} />
                )}
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-bold text-slate-900 dark:text-white text-base">{meal.name}</Text>
                <Text className="text-slate-400 text-xs font-semibold">{meal.calories} kcal • {new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <ChevronRight color="#CBD5E1" size={18} />
            </TouchableOpacity>
          ))
        ) : (
          <View className="p-10 bg-white dark:bg-slate-900 rounded-[32px] items-center border border-dashed border-slate-200 dark:border-slate-800">
             <Text className="text-slate-400 font-bold text-center">Track your first meal to see it here!</Text>
          </View>
        )}
      </View>
      </ScrollView>
    </PlatformContainer>
  );
}
