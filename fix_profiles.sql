-- Drop the existing overly restrictive policies on profiles
DROP POLICY IF EXISTS "Les utilisateurs peuvent lire leur profil" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent MAJ leur profil" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent insérer leur profil" ON profiles;
-- Create more permissive policies that allow the trigger to work
CREATE POLICY "Enable insert for authenticated users only" ON profiles FOR
INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable select for users based on user_id" ON profiles FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Enable update for users based on id" ON profiles FOR
UPDATE USING (auth.uid() = id);
-- Make sure weight_logs policies are correct
DROP POLICY IF EXISTS "Users can insert their own weight" ON weight_logs;
DROP POLICY IF EXISTS "Users can select own weight" ON weight_logs;
CREATE POLICY "Enable insert for authenticated users only" ON weight_logs FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable read access for users based on user_id" ON weight_logs FOR
SELECT USING (auth.uid() = user_id);