// WARNING: DO NOT USE RAUQOMDZ URL - ALWAYS USE esdxzoyeuoarrxuxjxnq
// CORRECT URL: https://esdxzoyeuoarrxuxjxnq.supabase.co
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Enforce correct database URL
if (supabaseUrl.includes('rauqomdz')) {
  throw new Error('CRITICAL: Wrong database URL detected! Must use esdxzoyeuoarrxuxjxnq.supabase.co');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
