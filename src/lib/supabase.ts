
// Import the centralized Supabase client
import { supabase } from '../integrations/supabase/client';

// Re-export the supabase client
export { supabase };

// Function to check if we're using real credentials
export const isUsingRealCredentials = () => {
  // Since we're using the centralized client which has hardcoded credentials,
  // we're always using real credentials
  return true;
};
