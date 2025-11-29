import { create } from 'zustand';
import { authAPI } from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials) => {
    try {
      const { data } = await authAPI.login(credentials);
      
      console.log('✅ Login SUCCESS:', data);
      console.log('📝 Access token:', data.access?.substring(0, 20) + '...');
      console.log('📝 Refresh token:', data.refresh?.substring(0, 20) + '...');
      console.log('👤 User:', data.user);
      
      // Сохраняем токены
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      console.log('💾 Tokens saved to localStorage');
      console.log('💾 Access in storage:', localStorage.getItem('access_token')?.substring(0, 20) + '...');
      
      // Устанавливаем состояние
      set({ 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data);
      return { success: false, error: error.response?.data };
    }
  },

  register: async (userData) => {
    try {
      const { data } = await authAPI.register(userData);
      console.log('✅ Register SUCCESS:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Register error:', error.response?.data);
      return { success: false, error: error.response?.data };
    }
  },

  logout: async () => {
    console.log('🚪 Logging out...');
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      console.log('🗑️ Tokens removed from localStorage');
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    console.log('🔍 Checking auth...');
    
    const token = localStorage.getItem('access_token');
    console.log('📝 Token exists:', !!token);
    
    if (!token) {
      console.log('❌ No token found, setting unauthenticated');
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    console.log('📝 Token:', token.substring(0, 20) + '...');

    try {
      console.log('📡 Fetching user data...');
      const { data } = await authAPI.me();
      console.log('✅ Auth check SUCCESS:', data);
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('❌ Auth check FAILED:', error.response?.status, error.response?.data);
      console.log('🗑️ Removing invalid tokens');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
