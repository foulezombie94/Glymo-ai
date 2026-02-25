import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Scan, User, List, Zap, Shield } from 'lucide-react-native';
import { View, ActivityIndicator, Alert, Text, StyleSheet, Platform } from 'react-native';
import { supabase, registerRefreshToken } from '../lib/supabase';
import HomeScreen from '../screens/HomeScreen.js';
import ScannerScreen from '../screens/ScannerScreen.js';
import ProfileScreen from '../screens/ProfileScreen.js';
import HistoryScreen from '../screens/HistoryScreen.js';
import LoginScreen from '../screens/LoginScreen.js';
import OnboardingFlow from '../screens/OnboardingFlow.js';
import ResultsDetailScreen from '../screens/ResultsDetailScreen.js';
import PremiumScreen from '../screens/PremiumScreen.js';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { borderTopWidth: 0, elevation: 0 },
        tabBarActiveTintColor: '#101828',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerScreen} 
        options={{ tabBarIcon: ({ color }) => <Scan color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ tabBarIcon: ({ color }) => <List color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const checkInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(currentSession);
          if (currentSession) {
            // Check onboarding status
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', currentSession.user.id)
              .single();
            setOnboardingCompleted(profile?.onboarding_completed === true);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      
      if (event === 'SIGNED_IN') {
        if (currentSession?.refresh_token) {
          await registerRefreshToken(currentSession.user.id, currentSession.refresh_token, currentSession.expires_at);
        }
        // Initial check on sign in
        const fetchProfile = async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', currentSession.user.id)
            .single();
          if (isMounted) setOnboardingCompleted(profile?.onboarding_completed === true);
        };
        fetchProfile();

        // Listen for profile changes (crucial for onboarding completion)
        const channel = supabase
          .channel('public:profiles')
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles',
            filter: `id=eq.${currentSession.user.id}`
          }, (payload) => {
            if (isMounted) setOnboardingCompleted(payload.new.onboarding_completed === true);
          })
          .subscribe();

        return () => supabase.removeChannel(channel);
      } else if (event === 'SIGNED_OUT') {
        setOnboardingCompleted(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <ActivityIndicator size="large" color="#101828" />
      </View>
    );
  }

  // Determine which screen to show based on auth and onboarding
  return (
    <Stack.Navigator id="AuthStack" screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={LoginScreen} />
      ) : !onboardingCompleted ? (
        // Redirect to Onboarding if not completed
        <Stack.Screen name="Onboarding" component={OnboardingFlow} />
      ) : (
        <Stack.Group>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="ResultsDetail" component={ResultsDetailScreen} />
          <Stack.Screen name="Premium" component={PremiumScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
