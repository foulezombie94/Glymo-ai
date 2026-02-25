import { supabase } from './supabase';
import { Platform } from 'react-native';

let cachedIp = null;

export const logSecurity = async (action, severity = 'INFO', metadata = {}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userAgent = `ReactNative/${Platform.OS} (${Platform.Version})`;
    
    if (!cachedIp) {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        cachedIp = data.ip;
      } catch (e) {
        console.warn('Could not fetch IP address for security log:', e);
      }
    }
    
    const { error } = await supabase
      .from('security_logs')
      .insert([{
        user_id: session?.user?.id || null,
        action_type: action,
        severity: severity,
        user_agent: userAgent,
        ip_address: cachedIp,
        metadata: metadata
      }]);

    if (error) {
      console.error('Failed to write security log:', error);
    }
  } catch (_err) {
    console.error('Unexpected error in logger:', _err);
  }
};
