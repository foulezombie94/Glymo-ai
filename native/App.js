import "./global.css";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MealProvider } from './src/context/MealContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <MealProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </MealProvider>
    </SafeAreaProvider>
  );
}
