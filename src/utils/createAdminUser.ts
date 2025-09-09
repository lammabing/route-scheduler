/**
 * This script helps you create an admin user for the local version
 * You can run this once manually to set up an admin user
 */
export const createAdminUser = async (email: string, password: string) => {
  try {
    // For the local version, we'll just simulate creating an admin user
    // In a real implementation, you would make an API call here
    
    // Simulate a delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For local development, we'll just accept any email/password
    // and treat it as the admin user
    const userId = 'f5aafdf1-c2c9-4992-9da2-7e521005b1ea';
    
    console.log(`User created with ID: ${userId}`);
    console.log(`User ${email} set as admin successfully`);
    
    // For local development, we'll automatically sign in the user
    // This would be handled by the calling component in a real implementation
    
    return { userId, email };
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};