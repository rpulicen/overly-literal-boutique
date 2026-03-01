import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

localStorage.removeItem('sb-rauqomdzlqwdmpyhvyia-auth-token');

Object.keys(localStorage).forEach(key => {
  if (key.startsWith('sb-') && key.includes('auth-token')) {
    localStorage.removeItem(key);
  }
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
