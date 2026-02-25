import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logSecurity } from '../lib/logger';
import { startOfDay, endOfDay, subDays, startOfWeek, format, isSameDay } from 'date-fns';

const MealContext = createContext(null);

export const useMeals = () => {
  return useContext(MealContext);
};

export const MealProvider = ({ children }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [weightLogs, setWeightLogs] = useState([]);
  const [weightTrend, setWeightTrend] = useState({ diff: 0, latest: 0 });
  const [waterToday, setWaterToday] = useState(0);
  const [bmi, setBmi] = useState(0);
  const [userHeight, setUserHeight] = useState(null);

  // ─── Fetch functions ───────────────────────────────────
  const fetchMealsForUser = React.useCallback(async (uid) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        if (error.code !== '42P01') {
          console.error('Error fetching meals:', error);
        }
      } else if (data) {
        setMeals(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfileAndGoals = React.useCallback(async (uid) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
         if (error.code === 'PGRST116') {
           // Profile doesn't exist yet, wait for trigger or manual creation
           return;
         }
         console.error('Error fetching profile:', error);
         return;
      }

      if (profile) {
        if (profile.calorie_goal) setCalorieGoal(profile.calorie_goal);
        
        const h = Number(profile.height);
        if (h) setUserHeight(h);

        // Calculate BMI if we have weight (from logs or profile)
        const weightForBmi = weightLogs.length > 0 ? Number(weightLogs[0].weight) : Number(profile.weight);
        if (weightForBmi && h) {
          const hm = h / 100;
          setBmi(Number((weightForBmi / (hm * hm)).toFixed(1)));
        }

        // If no weight logs, use profile weight for trend
        if (weightLogs.length === 0 && profile.weight) {
          setWeightTrend({ latest: Number(profile.weight), diff: 0 });
        }
      }
    } catch (err) {
      console.error('Unexpected error in profile fetch:', err);
    }
  }, [weightLogs]);

  const fetchWaterLogs = React.useCallback(async () => {
    try {
      const todayStart = startOfDay(new Date()).toISOString();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('water_logs')
        .select('amount_ml')
        .eq('user_id', session.user.id)
        .gte('created_at', todayStart);

      if (error && error.code !== '42P01') {
        console.error('Error fetching water logs', error);
      } else if (data) {
        setWaterToday(data.reduce((sum, log) => sum + (Number(log.amount_ml) || 0), 0));
      }
    } catch (err) {
      console.error('Unexpected error fetching water', err);
    }
  }, []);

  const fetchWeightLogs = React.useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('logged_date', { ascending: false });

      if (error) {
        if (error.code !== '42P01') console.error('Error fetching weight logs', error);
      } else if (data && data.length > 0) {
        setWeightLogs(data);
        const latest = Number(data[0].weight);
        if (data.length >= 2) {
          const previous = Number(data[1].weight);
          setWeightTrend({ latest, diff: Number((latest - previous).toFixed(1)) });
        } else {
          setWeightTrend({ latest, diff: 0 });
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching weight', err);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id || null;
      if (uid) {
        fetchMealsForUser(uid);
        fetchProfileAndGoals(uid);
        fetchWeightLogs();
        fetchWaterLogs();
      } else {
        setMeals([]);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || null;
      if (uid) {
        fetchMealsForUser(uid);
        fetchProfileAndGoals(uid);
        fetchWeightLogs();
        fetchWaterLogs();
      } else {
        setMeals([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchMealsForUser, fetchWeightLogs, fetchWaterLogs]);

  const addMeal = React.useCallback(async (mealData) => {
    const tempId = Date.now().toString();
    const newMeal = {
      id: tempId,
      ...mealData,
      created_at: new Date().toISOString()
    };

    setMeals(prev => [newMeal, ...prev]);

    try {
      const { data, error } = await supabase
        .from('meals')
        .insert([{
          name: mealData.name,
          calories: mealData.calories,
          protein: mealData.protein,
          carbs: mealData.carbs,
          fats: mealData.fats,
          fiber: mealData.fiber ?? 0,
          sugars: mealData.sugars ?? 0,
          saturated_fat: mealData.saturated_fat ?? 0,
          salt: mealData.salt ?? 0,
          barcode: mealData.barcode ?? null,
          brands: mealData.brands ?? null,
          nutriscore_grade: mealData.nutriscore_grade ?? null,
          ecoscore_grade: mealData.ecoscore_grade ?? null,
          image_url: mealData.image_url ?? null,
        }])
        .select();

      if (error && error.code !== '42P01') {
        console.error('Failed to add meal:', error);
      } else if (data && data.length > 0) {
        setMeals(prev => prev.map(m => m.id === tempId ? data[0] : m));
      }
    } catch (err) {
      console.error('Unexpected error saving meal:', err);
    }
  }, []);

  const deleteMeal = React.useCallback(async (mealId) => {
    const previousMeals = [...meals];
    setMeals(prev => prev.filter(m => m.id !== mealId));

    try {
      const { error } = await supabase.from('meals').delete().eq('id', mealId);
      if (error && error.code !== '42P01') {
        console.error('Failed to delete meal:', error);
        setMeals(previousMeals);
      }
    } catch (err) {
      console.error('Unexpected error deleting meal:', err);
      setMeals(previousMeals);
    }
  }, [meals]);

  const getTotalsByRange = React.useCallback((range = 'today') => {
    const today = new Date();
    const end = endOfDay(today).getTime();
    let start;
    if (range === 'today') start = startOfDay(today).getTime();
    else if (range === 'week') start = startOfDay(subDays(today, 7)).getTime();
    else if (range === 'month') start = startOfDay(subDays(today, 30)).getTime();

    const filteredMeals = meals.filter(meal => {
      const t = new Date(meal.created_at).getTime();
      return t >= start && t <= end;
    });

    const totals = filteredMeals.reduce((acc, meal) => ({
      calories: acc.calories + (Number(meal.calories) || 0),
      protein: acc.protein + (Number(meal.protein) || 0),
      carbs: acc.carbs + (Number(meal.carbs) || 0),
      fats: acc.fats + (Number(meal.fats) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    return { totals, meals: filteredMeals };
  }, [meals]);

  const getWeeklyStats = React.useCallback(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    let totalWeeklyCalories = 0;

    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);

      const dayMeals = meals.filter(m => isSameDay(new Date(m.created_at), day));
      const dayTotals = dayMeals.reduce((acc, meal) => ({
        calories: acc.calories + (Number(meal.calories) || 0),
      }), { calories: 0 });

      totalWeeklyCalories += dayTotals.calories;

      return {
        day: format(day, 'EEE').toUpperCase(),
        total: Math.min(100, (dayTotals.calories / (calorieGoal || 2000)) * 100),
        rawCalories: dayTotals.calories
      };
    });

    return { weeklyData, totalWeeklyCalories };
  }, [meals, calorieGoal]);

  const contextValue = React.useMemo(() => ({
    meals, loading, addMeal, deleteMeal,
    getTotalsByRange, getWeeklyStats,
    weightTrend, weightLogs, waterToday, bmi, userHeight, calorieGoal,
    fetchWeightLogs, fetchWaterLogs
  }), [meals, loading, addMeal, deleteMeal, getTotalsByRange, getWeeklyStats, weightTrend, weightLogs, waterToday, bmi, userHeight, calorieGoal, fetchWeightLogs, fetchWaterLogs]);

  return (
    <MealContext.Provider value={contextValue}>
      {children}
    </MealContext.Provider>
  );
};
