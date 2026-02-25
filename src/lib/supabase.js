import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl = 'https://zvljdibztkelgkrnusti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bGpkaWJ6dGtlbGdrcm51c3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Mjg2MjksImV4cCI6MjA4NzQwNDYyOX0.QBpmUwMsb1EDndAJt__GqqGO0SzGGjyv7QO9xUrsz-w';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Register a refresh token in the custom management table
 */
export const registerRefreshToken = async (userId, token, expiresAt) => {
  try {
    const { error } = await supabase
      .from('refresh_tokens')
      .insert([{
        user_id: userId,
        token: token,
        expires_at: new Date(expiresAt * 1000).toISOString(),
        revoked: false,
        device_id: Platform.OS + '-' + (Math.random().toString(36).substring(7)), // Simple device ID
        user_agent: 'React Native (' + Platform.OS + ')'
      }]);
    if (error) console.error('Error registering refresh token:', error);
  } catch (_err) {
    console.error('Unexpected error registering token:', _err);
  }
};

/**
 * Revoke a refresh token in the custom management table
 * Mark it as revoked in the DB and remove from local storage
 */
export const logoutUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.refresh_token) {
      await supabase
        .from('refresh_tokens')
        .update({ revoked: true })
        .eq('token', session.refresh_token);
    }
    await supabase.auth.signOut();
  } catch (_err) {
    console.error('Logout error:', _err);
  }
};
