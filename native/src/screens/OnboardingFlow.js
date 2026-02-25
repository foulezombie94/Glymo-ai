import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { ChevronRight, Target, Zap, TrendingUp, Info } from 'lucide-react-native';

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Data
  const [goal, setGoal] = useState('maintain');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const calorieGoal = calculateCalories();

      const { error } = await supabase
        .from('profiles')
        .update({
          goal,
          weight: parseFloat(weight),
          height: parseFloat(height),
          age: parseInt(age),
          gender,
          calorie_goal: calorieGoal,
          onboarding_completed: true
        })
        .eq('id', session.user.id);

      if (error) throw error;
      
      // The Navigator should automatically pick up the change via onAuthStateChange trigger if we force refresh or if we use a context
      // For now, let's just show success
      Alert.alert("Success", "Profile completed!");
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateCalories = () => {
    let mb = 0;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (gender === 'male') {
      mb = (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      mb = (10 * w) + (6.25 * h) - (5 * a) - 161;
    }
    let tdee = mb * 1.2; // Sedentary
    if (goal === 'lose_weight') tdee -= 400;
    else if (goal === 'build_muscle') tdee += 300;
    return Math.round(tdee);
  };

  if (step === 1) {
    return (
      <View className="flex-1 bg-white dark:bg-slate-900 px-8 pt-20">
        <Text className="text-3xl font-black text-slate-900 dark:text-white mb-4">What's your goal?</Text>
        <Text className="text-slate-500 mb-8">We'll tailor your experience based on this.</Text>
        
        {['lose_weight', 'maintain', 'build_muscle'].map((g) => (
          <TouchableOpacity 
            key={g}
            onPress={() => { setGoal(g); setStep(2); }}
            className={`p-6 rounded-3xl mb-4 border-2 ${goal === g ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}
          >
            <Text className={`text-lg font-bold ${goal === g ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
              {g.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900 px-8 pt-20">
      <Text className="text-3xl font-black text-slate-900 dark:text-white mb-4">A bit about you</Text>
      
      <View className="mb-6">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2">Weight (kg)</Text>
        <TextInput 
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-slate-900 dark:text-white"
        />
      </View>

      <View className="mb-6">
        <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2">Height (cm)</Text>
        <TextInput 
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-slate-900 dark:text-white"
        />
      </View>

      <TouchableOpacity 
        onPress={handleFinish}
        disabled={loading}
        className="bg-primary py-5 rounded-2xl mt-8 items-center"
      >
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-lg">Finish Setup</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
