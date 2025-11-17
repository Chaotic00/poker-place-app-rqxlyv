
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
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await StorageService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.log('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const users = await StorageService.getUsers();
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        return { success: false, error: 'Invalid email or password' };
      }

      if (foundUser.status === 'pending') {
        return { success: false, error: 'Your account is pending approval.' };
      }

      if (foundUser.status === 'rejected') {
        return { success: false, error: 'Your account has been rejected.' };
      }

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
      await StorageService.clearCurrentUser();
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'status'> & { password: string }): Promise<{ success: boolean; error?: string }> => {
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
        status: 'pending',
      };

      await StorageService.saveUsers([...users, newUser]);
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
