import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { supabase, logoutUser } from '../lib/supabase.js';
import { 
  User, 
  Settings, 
  ChevronRight, 
  LogOut, 
  Shield, 
  Bell, 
  Ruler, 
  Scale, 
  Target,
  Zap,
  Camera,
  CheckCircle2,
  Lock
} from 'lucide-react-native';
import { useMeals } from '../context/MealContext.js';

export default function ProfileScreen({ navigation }) {
  const { calorieGoal, weightTrend, bmi, userHeight } = useMeals();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  
  // Editable State
  const [fullName, setFullName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setWeight(data.weight?.toString() || '');
          setHeight(data.height?.toString() || '');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          weight: parseFloat(weight),
          height: parseFloat(height),
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;
      Alert.alert("Succès", "Profil mis à jour !");
    } catch (err) {
      Alert.alert("Erreur", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <ScrollView className="flex-1 bg-[#f8fafc] dark:bg-slate-950" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View className="px-6 pt-16 pb-8 items-center bg-white dark:bg-slate-900 rounded-b-[50px] shadow-sm">
        <View className="relative">
          <View className="w-32 h-32 rounded-[48px] overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl">
            <Image 
              source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' }} 
              className="w-full h-full"
            />
          </View>
          <TouchableOpacity className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-2xl items-center justify-center border-4 border-white dark:border-slate-900">
            <Camera size={18} color="white" />
          </TouchableOpacity>
        </View>
        
        <Text className="text-2xl font-black text-slate-900 dark:text-white mt-6">{fullName || 'User'}</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Premium')}
          className="bg-green-500/10 px-4 py-1.5 rounded-full mt-2 flex-row items-center gap-1.5"
        >
           <Zap size={14} color="#22c55e" fill="#22c55e" />
           <Text className="text-green-600 font-bold text-xs uppercase tracking-widest">Premium Member</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Quick View */}
      <View className="flex-row px-6 -mt-6 gap-3">
         <View className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-3xl items-center shadow-sm border border-slate-50 dark:border-slate-800">
            <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">BMI</Text>
            <Text className="text-lg font-black text-slate-900 dark:text-white">{bmi}</Text>
         </View>
         <View className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-3xl items-center shadow-sm border border-slate-50 dark:border-slate-800">
            <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Goal</Text>
            <Text className="text-lg font-black text-slate-900 dark:text-white">{calorieGoal}</Text>
         </View>
      </View>

      {/* Personal Info */}
      <View className="px-6 mt-10">
        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Personal Information</Text>
        
        <View className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-50 dark:border-slate-800 shadow-sm">
           <View className="mb-6">
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2">Nom Complet</Text>
              <TextInput 
                value={fullName} onChangeText={setFullName}
                className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2"
              />
           </View>

           <View className="flex-row gap-4">
              <View className="flex-1">
                 <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2">Poids (kg)</Text>
                 <TextInput 
                   value={weight} onChangeText={setWeight} keyboardType="numeric"
                   className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2"
                 />
              </View>
              <View className="flex-1">
                 <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2">Taille (cm)</Text>
                 <TextInput 
                   value={height} onChangeText={setHeight} keyboardType="numeric"
                   className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2"
                 />
              </View>
           </View>

           <TouchableOpacity 
             onPress={handleUpdate}
             disabled={loading}
             className="bg-green-500 py-4 rounded-2xl items-center mt-8 active:scale-95"
           >
             {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-base">Sauvegarder les modifications</Text>}
           </TouchableOpacity>
        </View>
      </View>

      {/* Settings Sections */}
      <View className="px-6 mt-8">
        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Application</Text>
        
        <TouchableOpacity className="bg-white dark:bg-slate-900 p-5 rounded-[28px] mb-3 flex-row items-center justify-between shadow-sm border border-slate-50 dark:border-slate-800">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl items-center justify-center">
               <Shield color="#6366F1" size={20} />
            </View>
            <Text className="ml-4 font-bold text-slate-700 dark:text-slate-300">Confidentialité</Text>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>

        <TouchableOpacity className="bg-white dark:bg-slate-900 p-5 rounded-[28px] mb-3 flex-row items-center justify-between shadow-sm border border-slate-50 dark:border-slate-800">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-2xl items-center justify-center">
               <Bell color="#3B82F6" size={20} />
            </View>
            <Text className="ml-4 font-bold text-slate-700 dark:text-slate-300">Notifications</Text>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View className="px-6 mt-6">
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-50 dark:bg-red-900/10 p-5 rounded-[28px] flex-row items-center justify-center border border-red-100 dark:border-red-900/20"
        >
          <LogOut color="#EF4444" size={20} />
          <Text className="ml-3 font-black text-red-500">Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-center text-slate-400 text-[10px] font-bold mt-10 uppercase tracking-widest">Version 1.2.0 • Build 2026</Text>
    </ScrollView>
  );
}
