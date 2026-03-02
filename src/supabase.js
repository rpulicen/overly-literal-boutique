import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://esdxzoyeuoarrxuxjxnq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZHh6b3lldW9hcnJ4dXhqeG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MDIyMzAsImV4cCI6MjA1NjQ3ODIzMH0.m5lO0W0KscW7U999y7fO3V8P1uLpLqG9f_Xn-yG5-g8',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
