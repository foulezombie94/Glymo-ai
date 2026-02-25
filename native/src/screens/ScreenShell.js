import React from 'react';
import { View, Text } from 'react-native';

export default function ScreenShell({ title, children }) {
  return (
    <View className="flex-1 bg-white dark:bg-slate-900 px-6 pt-12">
      <Text className="text-2xl font-black text-slate-900 dark:text-white mb-6">{title}</Text>
      {children}
    </View>
  );
}
