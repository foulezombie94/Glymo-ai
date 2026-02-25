import { supabase } from './supabase';

let cachedIp = null;

/**
 * Enregistre un événement de sécurité ou métier dans la table security_logs.
 * 
 * @param {string} action - L'identifiant de l'action (ex: AUTH_LOGIN, SCAN_EAN)
 * @param {'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'} severity - Le niveau d'importance
 * @param {Object} metadata - Données additionnelles au format JSON
 */
export const logSecurity = async (action, severity = 'INFO', metadata = {}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userAgent = navigator.userAgent;
    
    // Récupération de l'IP publique (mise en cache pour la session)
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
  } catch (err) {
    console.error('Unexpected error in logger:', err);
  }
};
