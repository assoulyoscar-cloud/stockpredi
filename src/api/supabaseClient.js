import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase config missing - check env variables');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Capture un email dans la table emails
 */
export async function captureEmail(email, source = 'landing') {
  if (!supabase) {
    console.warn('Supabase non configure');
    return { success: false, error: 'Supabase non configure' };
  }
  const { data, error } = await supabase
    .from('emails')
    .insert({ email: email.trim().toLowerCase(), source });

  if (error) {
    // 23505 = unique violation (email déjà enregistré) → succès silencieux
    if (error.code === '23505') return { success: true, data: null };
    console.error('Supabase captureEmail error:', error.message);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/**
 * Retourne l utilisateur connecte ou null
 */
export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
}
