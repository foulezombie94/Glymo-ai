-- ==========================================
-- VITALLY FULL SCHEMA (Supabase / PostgreSQL)
-- FINAL STABLE VERSION - FIXED RLS FOR LOOPS
-- ==========================================
-- 0. CLEANUP
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
DROP TRIGGER IF EXISTS on_user_banned ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_ban() CASCADE;
DROP TABLE IF EXISTS public.ingredients CASCADE;
DROP TABLE IF EXISTS public.meals CASCADE;
DROP TABLE IF EXISTS public.weight_logs CASCADE;
DROP TABLE IF EXISTS public.water_logs CASCADE;
DROP TABLE IF EXISTS public.refresh_tokens CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 2. PROFILES TABLE
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    weight DECIMAL,
    height DECIMAL,
    age INTEGER,
    gender TEXT,
    activity_level TEXT,
    goal TEXT,
    target_weight DECIMAL,
    calorie_goal INTEGER DEFAULT 2000,
    protein_goal INTEGER,
    carbs_goal INTEGER,
    fats_goal INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 3. MEALS TABLE
CREATE TABLE public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories INTEGER DEFAULT 0,
    protein DECIMAL DEFAULT 0,
    carbs DECIMAL DEFAULT 0,
    fats DECIMAL DEFAULT 0,
    fiber DECIMAL DEFAULT 0,
    sugars DECIMAL DEFAULT 0,
    saturated_fat DECIMAL DEFAULT 0,
    salt DECIMAL DEFAULT 0,
    barcode TEXT,
    brands TEXT,
    nutriscore_grade TEXT,
    ecoscore_grade TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 4. INGREDIENTS TABLE
CREATE TABLE public.ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL,
    unit TEXT DEFAULT 'g',
    calories INTEGER,
    protein DECIMAL,
    carbs DECIMAL,
    fats DECIMAL,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 5. WEIGHT LOGS TABLE
CREATE TABLE public.weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    weight DECIMAL NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 6. WATER LOGS TABLE
CREATE TABLE public.water_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 7. REFRESH TOKENS (SECURITY)
CREATE TABLE public.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- ==========================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
-- Profiles Policies: Full access to owner
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Standard Data Policies
CREATE POLICY "Users can manage own meals" ON meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ingredients" ON ingredients FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM meals
        WHERE meals.id = ingredients.meal_id
            AND meals.user_id = auth.uid()
    )
);
CREATE POLICY "Users can manage own weight logs" ON weight_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own water logs" ON water_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own refresh tokens" ON refresh_tokens FOR ALL USING (auth.uid() = user_id);
-- ==========================================
-- TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
INSERT INTO public.profiles (id, first_name, last_name)
VALUES (new.id, '', '');
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS trigger AS $$ BEGIN new.updated_at = now();
RETURN new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_profile_updated BEFORE
UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- ==========================================
-- INDEXES
-- ==========================================
-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_meals_user_id ON public.meals(user_id);
CREATE INDEX idx_weight_logs_user_id ON public.weight_logs(user_id);
CREATE INDEX idx_water_logs_user_id ON public.water_logs(user_id);
CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens(token);
CREATE INDEX idx_ingredients_meal_id ON public.ingredients(meal_id);