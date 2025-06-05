
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = 'https://prwxksesdppvgjlvpemx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd3hrc2VzZHBwdmdqbHZwZW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODY5ODAsImV4cCI6MjA2MjM2Mjk4MH0.VBR3hTNxpAYeS75HLd3yW2TtxT7gtuB4Q5rPypN8Jzk';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-bypass-rls': 'true'
    }
  }
});
