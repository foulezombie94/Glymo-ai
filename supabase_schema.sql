-- ============================================================
-- AI Calorie App (Glymo) - Schéma SQL "ULTIME"
-- Version: 2025-02-24 (Inclut security_logs & RLS)
-- ============================================================
-- 0. Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 1. Nettoyage (DROP)
DROP TABLE IF EXISTS security_logs CASCADE;
DROP TABLE IF EXISTS scan_history CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS meals CASCADE;
DROP TABLE IF EXISTS weight_logs CASCADE;
DROP TABLE IF EXISTS water_logs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
-- 2. PROFILES (Données utilisateur & Onboarding)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    discovery_source TEXT,
    goal TEXT,
    -- Mesures corporelles
    weight NUMERIC,
    target_weight NUMERIC,
    height NUMERIC,
    age INTEGER,
    gender TEXT,
    activity_level NUMERIC,
    -- Objectif
    calorie_goal INTEGER,
    -- Billing
    stripe_customer_id TEXT,
    premium_until TIMESTAMPTZ,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
-- Trigger auto-profile
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.profiles (id, email, full_name, avatar_url)
VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    ) ON CONFLICT (id) DO NOTHING;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- 3. MEALS (Repas & Scans nutritionnels)
CREATE TABLE meals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    image_url TEXT,
    -- Macros
    calories NUMERIC DEFAULT 0,
    protein NUMERIC DEFAULT 0,
    carbs NUMERIC DEFAULT 0,
    fats NUMERIC DEFAULT 0,
    -- Détails
    fiber NUMERIC DEFAULT 0,
    sugars NUMERIC DEFAULT 0,
    saturated_fat NUMERIC DEFAULT 0,
    salt NUMERIC DEFAULT 0,
    -- OpenFoodFacts / EAN
    barcode TEXT,
    brands TEXT,
    nutriscore_grade TEXT,
    ecoscore_grade TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own meals" ON meals FOR ALL USING (auth.uid() = user_id);
-- 4. INGREDIENTS (Détails des plats)
CREATE TABLE ingredients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    weight_g NUMERIC DEFAULT 100,
    calories NUMERIC DEFAULT 0,
    protein NUMERIC DEFAULT 0,
    carbs NUMERIC DEFAULT 0,
    fats NUMERIC DEFAULT 0,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ingredients" ON ingredients FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM meals
        WHERE id = ingredients.meal_id
            AND user_id = auth.uid()
    )
);
-- 5. WEIGHT & WATER (Santé)
CREATE TABLE weight_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid(),
    weight NUMERIC NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE water_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid(),
    amount_ml INTEGER NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage weight" ON weight_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage water" ON water_logs FOR ALL USING (auth.uid() = user_id);
-- 6. SECURITY_LOGS (La table "Ultime" de sécurité)
CREATE TABLE security_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE
    SET NULL DEFAULT auth.uid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        action_type TEXT NOT NULL,
        severity TEXT CHECK (
            severity IN ('INFO', 'WARN', 'ERROR', 'CRITICAL')
        ) DEFAULT 'INFO',
        ip_address INET,
        user_agent TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
);
-- 7. REFRESH_TOKENS (Gestion personnalisée des sessions)
CREATE TABLE refresh_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked BOOLEAN DEFAULT FALSE,
    device_id TEXT,
    user_agent TEXT
);
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own security logs" ON security_logs FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert security logs" ON security_logs FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can manage own refresh tokens" ON refresh_tokens FOR ALL USING (auth.uid() = user_id);
-- Pas d'UPDATE/DELETE pour garantir l'intégrité des logs
-- 8. INDEX POUR LES PERFORMANCES
CREATE INDEX idx_security_logs_user_date ON security_logs (user_id, created_at DESC);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens (token);
CREATE INDEX idx_meals_user_date ON meals (user_id, created_at DESC);
CREATE INDEX idx_weight_user_date ON weight_logs (user_id, logged_date DESC);
CREATE INDEX idx_water_user_date ON water_logs (user_id, logged_date DESC);
-- ============================================================
-- FIN DU SCRIPT. Copiez tout dans le SQL Editor de Supabase.
-- ============================================================