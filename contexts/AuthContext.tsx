
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { StorageService } from '@/utils/storage';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'status'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  changePassword: (newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
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
      
      // Step 1: Clear user state immediately to trigger navigation guard
      console.log('Step 1: Setting user state to null');
      setUser(null);
      
      // Step 2: Clear AsyncStorage
      console.log('Step 2: Clearing AsyncStorage');
      await StorageService.clearCurrentUser();
      console.log('Step 3: AsyncStorage cleared successfully');
      
      // Step 3: Wait a moment for state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 4: Force navigation to welcome screen using replace
      console.log('Step 4: Navigating to welcome screen');
      router.replace('/welcome');
      
      console.log('=== LOGOUT COMPLETED ===');
    } catch (error) {
      console.log('Logout error:', error);
      // Even if there's an error, ensure we clear state and navigate
      setUser(null);
      await StorageService.clearCurrentUser().catch(e => console.log('Error clearing storage:', e));
      
      // Force navigation even on error
      setTimeout(() => {
        router.replace('/welcome');
      }, 100);
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

  const changePassword = async (newPassword: string, confirmPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('=== PASSWORD CHANGE STARTED ===');
      
      if (!user) {
        console.log('No user logged in');
        return { success: false, error: 'No user logged in' };
      }

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        console.log('Passwords do not match');
        return { success: false, error: 'Passwords do not match' };
      }

      // Validate password length
      if (newPassword.length < 6) {
        console.log('Password too short');
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Update password in storage
      console.log('Updating password for user:', user.email);
      const users = await StorageService.getUsers();
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, password: newPassword } : u
      );
      await StorageService.saveUsers(updatedUsers);
      console.log('Password updated successfully');

      // Log out the user
      console.log('Logging out user after password change');
      await logout();

      console.log('=== PASSWORD CHANGE COMPLETED ===');
      return { success: true };
    } catch (error) {
      console.log('Password change error:', error);
      return { success: false, error: 'An error occurred while changing password' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser, changePassword }}>
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
