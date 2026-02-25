import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { X, CheckCircle2, Star, ArrowRight } from 'lucide-react-native';



const FeatureItem = ({ text }) => (
  <View className="flex-row items-center gap-3 mb-3">
    <View className="bg-green-500/20 p-1 rounded-full">
       <CheckCircle2 size={16} color="#22c55e" />
    </View>
    <Text className="text-slate-200 text-sm font-medium">{text}</Text>
  </View>
);

export default function PremiumScreen({ navigation }) {
  return (
    <View className="flex-1 bg-[#1a2210]">
      {/* Hero Image / Background */}
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=500' }} 
        className="absolute w-full h-full opacity-40"
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-[#1a2210]/70" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="pt-14 px-8 flex-row justify-between items-center mb-10">
           <View className="flex-row items-center gap-2">
              <Star size={24} color="#22c55e" fill="#22c55e" />
              <Text className="text-white text-xl font-black tracking-tight">Glymo Premium</Text>
           </View>
           <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center backdrop-blur-md"
          >
             <X size={20} color="white" />
           </TouchableOpacity>
        </View>

        {/* Hero Text */}
        <View className="px-8 mb-10">
           <Text className="text-white text-4xl font-black leading-tight mb-2">Unlock Your{"\n"}Full Potential</Text>
           <Text className="text-slate-400 text-lg font-bold">Get your dream body faster.</Text>
        </View>

        {/* Plan Card */}
        <View className="px-6 mb-10">
           <View className="bg-white/10 rounded-[40px] p-8 border border-white/20 backdrop-blur-xl">
              <View className="flex-row justify-between items-start mb-6">
                <View>
                  <Text className="text-white text-2xl font-black">Annual Plan</Text>
                  <Text className="text-green-500 font-bold mt-1 uppercase text-xs tracking-widest">7 days free, then $59.99/yr</Text>
                </View>
                <View className="bg-green-500 px-3 py-1 rounded-full">
                   <Text className="text-[#1a2210] font-black text-[10px] uppercase">Save 50%</Text>
                </View>
              </View>

              <View className="flex-row items-end gap-1 mb-8">
                 <Text className="text-6xl font-black text-white">$4.99</Text>
                 <Text className="text-slate-400 text-lg font-bold mb-2">/mo</Text>
                 <Text className="text-slate-500 text-sm mb-2 line-through ml-2">$9.99</Text>
              </View>

              <View className="mb-2">
                 <FeatureItem text="Unlimited AI Meal Scanning" />
                 <FeatureItem text="Advanced Macro Analysis" />
                 <FeatureItem text="Personalized Nutrition Coaching" />
                 <FeatureItem text="Ad-free Experience" />
              </View>
           </View>
        </View>

        {/* Sub CTA */}
        <View className="px-8 items-center">
           <TouchableOpacity 
             onPress={() => Alert.alert("Coming Soon", "Payment integration is in development.")}
             className="w-full bg-green-500 h-16 rounded-3xl flex-row items-center justify-center shadow-xl shadow-green-500/30 active:scale-[0.98]"
           >
              <Text className="text-[#1a2210] font-black text-lg mr-2">Start 7-Day Free Trial</Text>
              <ArrowRight size={20} color="#1a2210" />
           </TouchableOpacity>
           <Text className="text-slate-500 text-[10px] font-bold mt-4 uppercase tracking-widest">Cancel anytime in Settings</Text>
        </View>

        {/* Comparison Section */}
        <View className="mt-16 px-8 mb-20">
           <Text className="text-white font-black text-xl mb-6">Free vs Premium</Text>
           
           <View className="flex-row py-4 border-b border-white/10">
              <Text className="flex-1 text-slate-400 font-bold">Food Scan</Text>
              <Text className="w-12 text-center text-slate-500">5/day</Text>
              <Text className="w-12 text-center text-green-500 font-black">∞</Text>
           </View>
           <View className="flex-row py-4 border-b border-white/10">
              <Text className="flex-1 text-slate-400 font-bold">Macros</Text>
              <Text className="w-12 text-center text-slate-500">Basic</Text>
              <Text className="w-12 text-center text-green-500 font-black">Full</Text>
           </View>
           <View className="flex-row py-4">
              <Text className="flex-1 text-slate-400 font-bold">AI Support</Text>
              <View className="w-12 items-center"><X size={16} color="#64748b" /></View>
              <View className="w-12 items-center"><CheckCircle2 size={16} color="#22c55e" /></View>
           </View>
        </View>
      </ScrollView>

      {/* Footer Nav Parity */}
      <View className="absolute bottom-6 left-0 right-0 items-center">
         <View className="flex-row gap-8">
            <Text className="text-slate-600 font-bold text-[10px] uppercase">Terms</Text>
            <Text className="text-slate-600 font-bold text-[10px] uppercase">Privacy</Text>
            <Text className="text-slate-600 font-bold text-[10px] uppercase">Restore</Text>
         </View>
      </View>
    </View>
  );
}
