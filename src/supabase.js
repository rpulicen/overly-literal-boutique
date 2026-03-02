import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://esdxzoyeuoarrxuxjxnq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZHh6b3lldW9hcnJ4dXhqeG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4ODc4MzYsImV4cCI6MjA1NjQ2MzgzNn0.LFxQr6V9sD64cT7KRJPABhY3VB_tjptXB32xG6QWBMA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
