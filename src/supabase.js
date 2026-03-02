import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://esdxzoyeuoarrxuxjxnq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZHh6b3lldW9hcnJ4dXhqeG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MDIyMzAsImV4cCI6MjA1NjQ3ODIzMH0.m5lO0W0KscW7U999y7fO3V8P1uLpLqG9f_Xn-yG5-g8';

console.log('Using Project Ref: esdxzoyeuoarrxuxjxnq');

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
