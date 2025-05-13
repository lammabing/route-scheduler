
import { supabase } from '@/lib/supabase';

/**
 * This script helps you create an admin user and set their role
 * You can run this once manually to set up an admin user
 */
export const createAdminUser = async (email: string, password: string) => {
  try {
    // 1. Sign up a new user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    const userId = authData?.user?.id;
    if (!userId) throw new Error('Failed to get user ID');

    console.log(`User created with ID: ${userId}`);

    // 2. Add the user to the admin role - Use service role to bypass RLS
    // This requires that the user_roles table exists in Supabase
    // Use the REST API directly with the anon key
    const response = await fetch(`${supabase.supabaseUrl}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabase.supabaseKey,
        'Authorization': `Bearer ${supabase.supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([{ user_id: userId, role: 'admin' }])
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(`Failed to set admin role: ${response.status} ${response.statusText}`);
    }

    console.log(`User ${email} set as admin successfully`);
    return { userId, email };
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};
