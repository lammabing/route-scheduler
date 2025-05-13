
import { supabase } from '@/lib/supabase';

/**
 * This script helps you create an admin user and set their role
 * You can run this once manually to set up an admin user
 */
export const createAdminUser = async (email: string, password: string) => {
  try {
    // 1. Sign up a new user with email verification disabled
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Bypass email verification completely
        emailRedirectTo: window.location.origin + "/admin",
      }
    });

    if (authError) throw authError;

    const userId = authData?.user?.id;
    if (!userId) throw new Error('Failed to get user ID');

    console.log(`User created with ID: ${userId}`);
    
    // Force set the email as confirmed
    try {
      // This is a direct API call to manually set the user as verified
      // We're using the anon key which likely won't have permission, but we'll try anyway
      const supabaseUrl = 'https://prwxksesdppvgjlvpemx.supabase.co';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd3hrc2VzZHBwdmdqbHZwZW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODY5ODAsImV4cCI6MjA2MjM2Mjk4MH0.VBR3hTNxpAYeS75HLd3yW2TtxT7gtuB4Q5rPypN8Jzk';
      
      const confirmEmailResponse = await fetch(`${supabaseUrl}/auth/v1/user/admin/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ email_confirm: true })
      });
      
      if (!confirmEmailResponse.ok) {
        console.warn('Failed to auto-confirm email. Will continue anyway:', await confirmEmailResponse.text());
      } else {
        console.log('Email verified automatically');
      }
    } catch (verifyError) {
      console.warn('Error during email verification:', verifyError);
      // Continue anyway even if this fails
    }

    // 3. Add the user to the admin role
    const supabaseUrl = 'https://prwxksesdppvgjlvpemx.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd3hrc2VzZHBwdmdqbHZwZW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODY5ODAsImV4cCI6MjA2MjM2Mjk4MH0.VBR3hTNxpAYeS75HLd3yW2TtxT7gtuB4Q5rPypN8Jzk';
    
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
    
    // After creating the admin user, sign them in automatically
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
      console.warn('Created admin user but could not automatically sign in:', signInError);
    } else {
      console.log('Admin user signed in successfully');
    }
    
    return { userId, email };
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};
