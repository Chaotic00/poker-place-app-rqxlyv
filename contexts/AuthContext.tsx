
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { StorageService } from '@/utils/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'status'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize default data (demo users and tournaments)
      await StorageService.initializeDefaultData();
      console.log('Default data initialized');
      
      // Load current user
      await loadUser();
    } catch (error) {
      console.log('Error initializing app:', error);
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const currentUser = await StorageService.getCurrentUser();
      console.log('Loaded user:', currentUser?.email);
      setUser(currentUser);
    } catch (error) {
      console.log('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Login attempt for:', email);
      const users = await StorageService.getUsers();
      console.log('Total users in storage:', users.length);
      
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        console.log('User not found');
        return { success: false, error: 'Invalid email or password' };
      }

      console.log('User found:', foundUser.email, 'Status:', foundUser.status);

      // Check password
      if (foundUser.password !== password) {
        console.log('Invalid password');
        return { success: false, error: 'Invalid email or password' };
      }

      if (foundUser.status === 'pending') {
        console.log('Account pending approval');
        return { success: false, error: 'Your account is pending approval.' };
      }

      if (foundUser.status === 'rejected') {
        console.log('Account rejected');
        return { success: false, error: 'Your account has been rejected.' };
      }

      console.log('Login successful');
      await StorageService.setCurrentUser(foundUser);
      setUser(foundUser);
      return { success: true };
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = async () => {
    try {
      console.log('=== LOGOUT STARTED ===');
      console.log('Step 1: Clearing AsyncStorage');
      await StorageService.clearCurrentUser();
      console.log('Step 2: AsyncStorage cleared successfully');
      console.log('Step 3: Setting user state to null');
      setUser(null);
      console.log('Step 4: User state set to null');
      console.log('=== LOGOUT COMPLETED ===');
    } catch (error) {
      console.log('Logout error:', error);
      // Even if there's an error, set user to null to ensure logout
      setUser(null);
      throw error;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'status' | 'created_at'> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const users = await StorageService.getUsers();
      
      const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        return { success: false, error: 'An account with this email already exists' };
      }

      const newUser: User = {
        id: Date.now().toString(),
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        nickname: userData.nickname,
        password: userData.password,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      await StorageService.saveUsers([...users, newUser]);
      console.log('User registered:', newUser.email);
      return { success: true };
    } catch (error) {
      console.log('Registration error:', error);
      return { success: false, error: 'An error occurred during registration' };
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const users = await StorageService.getUsers();
      const updatedUser = users.find(u => u.id === user.id);
      if (updatedUser) {
        setUser(updatedUser);
        await StorageService.setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.log('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
