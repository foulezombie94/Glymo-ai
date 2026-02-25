import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Zap, Eye, EyeOff, Mail, Lock, ChevronRight } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Input Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      
      if (isSignUp) {
        Alert.alert("Check your email", "We've sent you a confirmation link.");
      }
    } catch (err) {
      Alert.alert("Auth Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-slate-900"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white dark:bg-slate-900">
        <View className="flex-1 px-8 pt-20 pb-10">
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-primary dark:bg-slate-800 rounded-[30px] items-center justify-center shadow-2xl shadow-primary/20">
              <Zap color="white" size={40} />
            </View>
            <Text className="text-3xl font-black text-slate-900 dark:text-white mt-6 tracking-tight">
              Vitally<Text className="text-primary">.</Text>
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 mt-2 text-center text-lg">
              {isSignUp ? "Create your account" : "Welcome back to health"}
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2 ml-1">Email Address</Text>
              <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 border border-slate-100 dark:border-slate-700">
                <Mail color="#64748b" size={20} />
                <TextInput
                  className="flex-1 py-4 ml-3 text-slate-900 dark:text-white"
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-slate-700 dark:text-slate-300 font-bold mb-2 ml-1">Password</Text>
              <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 border border-slate-100 dark:border-slate-700">
                <Lock color="#64748b" size={20} />
                <TextInput
                  className="flex-1 py-4 ml-3 text-slate-900 dark:text-white"
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff color="#64748b" size={20} /> : <Eye color="#64748b" size={20} />}
                </TouchableOpacity>
              </View>
            </View>

            {!isSignUp && (
              <TouchableOpacity className="self-end mt-2">
                <Text className="text-primary font-bold">Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              className="bg-primary dark:bg-slate-800 py-5 rounded-2xl mt-8 flex-row items-center justify-center shadow-xl shadow-primary/20"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-black text-lg mr-2">
                    {isSignUp ? "Get Started" : "Sign In"}
                  </Text>
                  <ChevronRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-auto pt-10">
            <TouchableOpacity 
              onPress={() => setIsSignUp(!isSignUp)}
              className="flex-row justify-center py-4"
            >
              <Text className="text-slate-500 dark:text-slate-400 font-medium">
                {isSignUp ? "Already have an account?" : "New to Vitally?"}{' '}
                <Text className="text-primary font-bold">{isSignUp ? "Sign In" : "Create Account"}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
