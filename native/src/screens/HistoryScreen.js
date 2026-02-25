import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useMeals } from '../context/MealContext.js';
import { Trash2, ChevronRight, History as HistoryIcon, LayoutGrid } from 'lucide-react-native';

export default function HistoryScreen() {
  const { meals, deleteMeal } = useMeals();

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal entry?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMeal(id) }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View className="bg-white dark:bg-slate-800 p-4 rounded-3xl mb-3 flex-row items-center border border-slate-100 dark:border-slate-700 shadow-sm">
      <View className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl items-center justify-center">
        {item.image_url ? (
           <Text className="text-xl">🍲</Text>
        ) : (
           <LayoutGrid color="#94A3B8" size={24} />
        )}
      </View>
      <View className="flex-1 ml-4">
        <Text className="font-bold text-slate-900 dark:text-white text-lg">{item.name}</Text>
        <Text className="text-slate-500 dark:text-slate-400">{item.calories} kcal • {item.protein}g protein</Text>
      </View>
      <TouchableOpacity 
        onPress={() => handleDelete(item.id)}
        className="p-3 bg-red-50 dark:bg-red-900/10 rounded-2xl"
      >
        <Trash2 color="#EF4444" size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <View className="px-6 pt-12 pb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-slate-500 dark:text-slate-400 font-medium">Your progress</Text>
          <Text className="text-3xl font-black text-slate-900 dark:text-white mt-1">History</Text>
        </View>
        <View className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl items-center justify-center border border-slate-200 dark:border-slate-700">
          <HistoryIcon color="#64748b" size={24} />
        </View>
      </View>

      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-700">
            <View className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
               <ChevronRight color="#94A3B8" size={32} />
            </View>
            <Text className="text-slate-500 dark:text-slate-400 font-bold">No history found</Text>
          </View>
        }
      />
    </View>
  );
}
