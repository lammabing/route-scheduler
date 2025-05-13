
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
      options: {
        // Set email_confirm to true to bypass email verification
        emailRedirectTo: window.location.origin + "/admin"
      }
    });

    if (authError) throw authError;

    const userId = authData?.user?.id;
    if (!userId) throw new Error('Failed to get user ID');

    console.log(`User created with ID: ${userId}`);
    
    // 2. Attempt to manually confirm the user's email
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    );
    
    if (updateError) {
      console.warn('Unable to auto-verify email. User will need to verify via email.', updateError);
      // Continue anyway, as we'll try to add the admin role
    } else {
      console.log('Email verified automatically');
    }

    // 3. Add the user to the admin role - Use direct API call to bypass RLS
    // This requires that the user_roles table exists in Supabase
    const supabaseUrl = 'https://prwxksesdppvgjlvpemx.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd3hrc2VzZHBwdmdqbHZwZW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODY5ODAsImV4cCI6MjA2MjM2Mjk4MH0.VBR3hTNxpAYeS75HLd3yW2TtxT7gtuB4Q5rPypN8Jzk';
    
    // For admin operations, we need to use service role or a special admin API key
    // For this example, we're using the public key but this won't work unless RLS is configured to allow it
    const response = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([{ user_id: userId, role: 'admin' }])
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(`Failed to set admin role: ${response.status} ${response.statusText} - This is likely because the anonymous key doesn't have permission to insert into user_roles table. Enable a Row Level Security policy or use a service role key.`);
    }

    console.log(`User ${email} set as admin successfully`);
    
    // After creating the admin user, try to sign them in automatically
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
      console.warn('Created admin user but could not automatically sign in:', signInError);
      // This is not a fatal error, so we'll just return the user info
    } else {
      console.log('Admin user signed in successfully');
    }
    
    return { userId, email };
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};
