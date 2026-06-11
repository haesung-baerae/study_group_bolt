import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  category: string;
  author_id: string;
  created_at: string;
};

export type StudyPost = {
  id: string;
  title: string;
  content: string;
  topic: string;
  author_id: string;
  created_at: string;
};

export type AttendanceRecord = {
  id: string;
  date: string;
  user_id: string;
  status: '출석' | '결석';
};
