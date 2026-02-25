/* eslint-disable react-refresh/only-export-components */
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

  // ─── Fetch functions (stable callbacks) ───────────────────────────────────
  const fetchMealsForUser = React.useCallback(async (uid) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', uid)           // ← only this user's meals
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        if (error.code === '42P01') {
          console.warn("Table 'meals' does not exist yet.");
        } else {
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

  const fetchWaterLogs = React.useCallback(async () => {
    try {
      const todayStart = startOfDay(new Date()).toISOString();
      const { data, error } = await supabase
        .from('water_logs')
        .select('amount_ml')
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
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .order('logged_date', { ascending: false });

      let currentWeightValue = 0;

      if (error) {
        if (error.code !== '42P01') console.error('Error fetching weight logs', error);
      } else if (data && data.length > 0) {
        setWeightLogs(data);
        currentWeightValue = Number(data[0].weight);
        if (data.length >= 2) {
          const latest = Number(data[0].weight);
          const previous = Number(data[1].weight);
          setWeightTrend({ latest, diff: Number((latest - previous).toFixed(1)) });
        } else {
          setWeightTrend({ latest: currentWeightValue, diff: 0 });
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('weight, height, calorie_goal')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          // Calorie goal from Supabase
          if (profile.calorie_goal) setCalorieGoal(profile.calorie_goal);

          if (currentWeightValue === 0 && profile.weight) {
            currentWeightValue = Number(profile.weight);
            setWeightTrend({ latest: currentWeightValue, diff: 0 });
          }
          if (profile.height) {
            const h = Number(profile.height);
            setUserHeight(h);
            if (currentWeightValue > 0) {
              const hm = h / 100;
              setBmi(Number((currentWeightValue / (hm * hm)).toFixed(1)));
            }
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching weight', err);
    }
  }, []);

  // ─── Auth state ───────────────────────────────────────────────────────────
  // Listen to login/logout/account switches and reload the meals for that user
  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id || null;
      if (uid) {
        fetchMealsForUser(uid);
        fetchWeightLogs();   // BMI depends on profile weight/height
        fetchWaterLogs();
      } else {
        setMeals([]);
        setLoading(false);
      }
    });

    // React to auth changes (login / logout / switch account)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || null;
      if (uid) {
        fetchMealsForUser(uid);
        fetchWeightLogs();
        fetchWaterLogs();
      } else {
        setMeals([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();

  }, [fetchMealsForUser, fetchWeightLogs, fetchWaterLogs]);

  // ─── Fetch meals (refresh) ────────────────────────────────────────────────
  const fetchMealsFromSupabase = React.useCallback(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) fetchMealsForUser(session.user.id);
    });
  }, [fetchMealsForUser]);

  // ─── Add meal ─────────────────────────────────────────────────────────────
  const addMeal = React.useCallback(async (mealData) => {
    const tempId = Date.now().toString();
    const newMeal = {
      id: tempId,
      ...mealData,
      ingredients: mealData.raw_ingredients_text || mealData.ingredients,
      created_at: new Date().toISOString()
    };

    // Optimistic update
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

      if (error) {
        if (error.code !== '42P01') {
          console.error('Failed to add meal to Supabase:', error);
        }
      } else if (data && data.length > 0) {
        const inserted = data[0];
        setMeals(prev => prev.map(m => m.id === tempId ? inserted : m));

        // Save linked ingredients if any
        if (mealData.ingredientsList && mealData.ingredientsList.length > 0) {
          const { error: ingError } = await supabase
            .from('ingredients')
            .insert(mealData.ingredientsList.map(ing => ({
              meal_id: inserted.id,
              name: ing.name,
              weight_g: ing.weight_g,
              calories: ing.calories,
              protein: ing.protein,
              carbs: ing.carbs,
              fats: ing.fats,
              icon: ing.icon
            })));
          if (ingError) console.error('Failed to add ingredients:', ingError);
        }
      }
    } catch (err) {
      console.error('Unexpected error saving meal:', err);
    }
  }, []);

  // ─── Delete meal ──────────────────────────────────────────────────────────
  const deleteMeal = React.useCallback(async (mealId) => {
    const previousMeals = [...meals];
    setMeals(prev => prev.filter(m => m.id !== mealId));

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);

      if (error) {
        if (error.code !== '42P01') {
          console.error('Failed to delete meal:', error);
          setMeals(previousMeals);
        }
      }
    } catch (err) {
      console.error('Unexpected error deleting meal:', err);
      setMeals(previousMeals);
    }
  }, [meals]);

  // ─── Derived stats ────────────────────────────────────────────────────────
  
  const getTotalsByRange = React.useCallback((range = 'today') => {
    const today = new Date();
    const end = endOfDay(today).getTime();
    let start;
    if (range === 'today')    start = startOfDay(today).getTime();
    else if (range === 'week')   start = startOfDay(subDays(today, 7)).getTime();
    else if (range === 'month')  start = startOfDay(subDays(today, 30)).getTime();
    else if (range === '3months') start = startOfDay(subDays(today, 90)).getTime();

    const filteredMeals = meals.filter(meal => {
      const t = new Date(meal.created_at).getTime();
      return t >= start && t <= end;
    });

    const totals = filteredMeals.reduce((acc, meal) => ({
      calories: acc.calories + (Number(meal.calories) || 0),
      protein:  acc.protein  + (Number(meal.protein)  || 0),
      carbs:    acc.carbs    + (Number(meal.carbs)    || 0),
      fats:     acc.fats     + (Number(meal.fats)     || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    const totalMacros = totals.protein + totals.carbs + totals.fats;
    const percentages = totalMacros > 0 ? {
      protein: Math.round((totals.protein / totalMacros) * 100),
      carbs:   Math.round((totals.carbs   / totalMacros) * 100),
      fats:    Math.round((totals.fats    / totalMacros) * 100),
    } : { protein: 0, carbs: 0, fats: 0 };

    return { totals, percentages, meals: filteredMeals };
  }, [meals]);

  const [calorieGoal, setCalorieGoal] = useState(2000);

  const getTodayTotals = React.useCallback(() => getTotalsByRange('today'), [getTotalsByRange]);

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
        protein:  acc.protein  + (Number(meal.protein)  || 0),
        carbs:    acc.carbs    + (Number(meal.carbs)    || 0),
        fats:     acc.fats     + (Number(meal.fats)     || 0),
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

      totalWeeklyCalories += dayTotals.calories;

      const totalMacros = dayTotals.protein + dayTotals.carbs + dayTotals.fats;
      const p = totalMacros > 0 ? Math.round((dayTotals.protein / totalMacros) * 100) : 0;
      const c = totalMacros > 0 ? Math.round((dayTotals.carbs   / totalMacros) * 100) : 0;
      const f = totalMacros > 0 ? Math.round((dayTotals.fats    / totalMacros) * 100) : 0;

      // Use calorieGoal from Supabase profile (state), not localStorage
      return {
        day: format(day, 'EEE').toUpperCase(),
        p, c, f,
        total: Math.min(100, (dayTotals.calories / (calorieGoal || 2000)) * 100),
        rawCalories: dayTotals.calories
      };
    });

    const dailyAverage = Math.round(totalWeeklyCalories / (today.getDay() === 0 ? 7 : today.getDay()));
    return { weeklyData, totalWeeklyCalories, dailyAverage };
  }, [meals, calorieGoal]);

  // ─── Weight & Water ───────────────────────────────────────────────────────
  const [weightLogs, setWeightLogs] = useState([]);
  const [weightTrend, setWeightTrend] = useState({ diff: 0, latest: 0 });
  const [waterToday, setWaterToday] = useState(0);
  const [bmi, setBmi] = useState(0);
  const [userHeight, setUserHeight] = useState(null);

  useEffect(() => {
    fetchWeightLogs();
    fetchWaterLogs();
  }, [fetchWeightLogs, fetchWaterLogs]);

  const contextValue = React.useMemo(() => ({
    meals, loading,
    addMeal, deleteMeal,
    getTodayTotals, getWeeklyStats, getTotalsByRange,
    weightTrend, weightLogs, waterToday, bmi, userHeight, calorieGoal,
    fetchMealsFromSupabase, fetchWeightLogs, fetchWaterLogs
  }), [
    meals, loading, 
    addMeal, deleteMeal, 
    getTodayTotals, getWeeklyStats, getTotalsByRange, 
    weightTrend, weightLogs, waterToday, bmi, userHeight, calorieGoal,
    fetchMealsFromSupabase, fetchWeightLogs, fetchWaterLogs
  ]);

  return (
    <MealContext.Provider value={contextValue}>
      {children}
    </MealContext.Provider>
  );
};
