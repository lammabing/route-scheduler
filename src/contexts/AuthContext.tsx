import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  session: any | null;
  user: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem('adminSession');
    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      setSession(sessionData);
      setUser(sessionData.user);
      setIsAdmin(sessionData.isAdmin || false);
    }
    setIsLoading(false);
  }, []);

  // Check if user has admin role
  const checkUserRole = async (userId: string) => {
    try {
      // For local version, we'll check our local user_roles table
      // In a real implementation, you would make an API call here
      // For now, we'll just check if it's our known admin user
      const isAdminUser = userId === 'f5aafdf1-c2c9-4992-9da2-7e521005b1ea';
      setIsAdmin(isAdminUser);
      return isAdminUser;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // For local version, we'll simulate authentication
      // In a real implementation, you would make an API call to verify credentials
      // For now, we'll accept any non-empty email/password and check if it matches our admin user
      
      // Simulate a delay for realism
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a mock user object
      const mockUser = {
        id: 'f5aafdf1-c2c9-4992-9da2-7e521005b1ea',
        email: email,
      };
      
      // Check if user has admin role
      const isAdminUser = await checkUserRole(mockUser.id);
      
      if (!isAdminUser) {
        throw new Error('User is not an administrator');
      }
      
      // Create session data
      const sessionData = {
        user: mockUser,
        isAdmin: isAdminUser,
      };
      
      // Store session in localStorage
      localStorage.setItem('adminSession', JSON.stringify(sessionData));
      
      setSession(sessionData);
      setUser(mockUser);
      
      toast.success('Logged in successfully');
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error('Login failed: ' + (error?.message || 'Invalid credentials'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Remove session from localStorage
      localStorage.removeItem('adminSession');
      
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      
      navigate('/admin/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};