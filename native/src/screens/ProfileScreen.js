import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { supabase, logoutUser } from '../lib/supabase.js';
import { User, Settings, ChevronRight, LogOut, Shield, Bell, HelpCircle, Share2, List } from 'lucide-react-native';

export default function ProfileScreen() {
  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="px-6 pt-16 pb-8 items-center">
        <View className="relative">
          <View className="w-32 h-32 rounded-[48px] overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-2xl">
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' }} 
              className="w-full h-full"
            />
          </View>
          <View className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-2xl items-center justify-center border-4 border-white dark:border-slate-900">
            <View className="w-2 h-2 bg-white rounded-full" />
          </View>
        </View>
        
        <Text className="text-2xl font-black text-slate-900 dark:text-white mt-6">Alex Johnson</Text>
        <Text className="text-slate-500 dark:text-slate-400 font-medium">Premium Member</Text>
      </View>

      <View className="px-6 mb-8">
        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Personal Settings</Text>
        
        <TouchableOpacity className="bg-white dark:bg-slate-800 p-5 rounded-[32px] mb-3 flex-row items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl items-center justify-center">
               <User color="#6366F1" size={20} />
            </View>
            <Text className="ml-4 font-bold text-slate-700 dark:text-slate-300">Account Details</Text>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>

        <TouchableOpacity className="bg-white dark:bg-slate-800 p-5 rounded-[32px] mb-3 flex-row items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-2xl items-center justify-center">
               <Settings color="#F59E0B" size={20} />
            </View>
            <Text className="ml-4 font-bold text-slate-700 dark:text-slate-300">Preferences</Text>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>
      </View>

      <View className="px-6 mb-8">
        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">App Support</Text>
        
        <TouchableOpacity className="bg-white dark:bg-slate-800 p-5 rounded-[32px] mb-3 flex-row items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl items-center justify-center">
               <Shield color="#10B981" size={20} />
            </View>
            <Text className="ml-4 font-bold text-slate-700 dark:text-slate-300">Privacy & Security</Text>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>

        <TouchableOpacity className="bg-white dark:bg-slate-800 p-5 rounded-[32px] mb-3 flex-row items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-2xl items-center justify-center">
               <Bell color="#3B82F6" size={20} />
            </View>
            <Text className="ml-4 font-bold text-slate-700 dark:text-slate-300">Notifications</Text>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>
      </View>

      <View className="px-6">
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-50 dark:bg-red-900/10 p-5 rounded-[32px] flex-row items-center justify-center border border-red-100 dark:border-red-900/20 shadow-sm shadow-red-500/5"
        >
          <LogOut color="#EF4444" size={20} />
          <Text className="ml-3 font-black text-red-500">Log Out</Text>
        </TouchableOpacity>
        <Text className="text-center text-slate-400 text-xs mt-8 font-medium">Version 1.0.0 (Build 42)</Text>
      </View>
    </ScrollView>
  );
}
