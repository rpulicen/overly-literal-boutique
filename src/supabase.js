import { createClient } from '@supabase/supabase-js';

// Hardcoded fallback to ensure we're using the new database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://esdxzoyeuoarrxuxjxnq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZHh6b3lldW9hcnJ4dXhqeG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4ODc4MzYsImV4cCI6MjA1NjQ2MzgzNn0.LFxQr6V9sD64cT7KRJPABhY3VB_tjptXB32xG6QWBMA';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Clear localStorage on initialization to remove old session data
if (typeof window !== 'undefined') {
  const currentUrl = localStorage.getItem('supabase.auth.url');
  if (currentUrl && !currentUrl.includes('esdxzoyeuoarrxuxjxnq')) {
    console.log('Clearing old database session data');
    localStorage.clear();
  }
  localStorage.setItem('supabase.auth.url', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
