
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

    // 2. Add the user to the admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role: 'admin' }]);

    if (roleError) throw roleError;

    console.log(`User ${email} set as admin successfully`);
    return { userId, email };
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};
