import { apiClient } from './api-client';
import Cookies from 'js-cookie';

export const authService = {
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.success && response.data) {
        Cookies.set('auth_token', response.data.token, { expires: 7 });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          // Dispatch event to update navbar and other components
          window.dispatchEvent(new Event('userLoggedIn'));
        }
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  },

  async register(data) {
    try {
      const response = await apiClient.post('/auth/register', data);
      
      // Handle nested success structure from your API
      if (response.success && response.data) {
        const userData = response.data.user || response.data;
        const token = response.data.token;
        
        if (token) {
          Cookies.set('auth_token', token, { expires: 7 });
        }
        
        if (typeof window !== 'undefined' && userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          // Dispatch event to update navbar and other components
          window.dispatchEvent(new Event('userLoggedIn'));
        }
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  },

  async logout() {
    Cookies.remove('auth_token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      // Dispatch event before redirect
      window.dispatchEvent(new Event('userLoggedOut'));
      // Small delay to allow components to update
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 100);
    }
  },

  async verifyEmail(token) {
    try {
      const response = await apiClient.post('/auth/verify-email', { token });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Email verification failed',
      };
    }
  },

  async resetPasswordRequest(email) {
    try {
      const response = await apiClient.post('/auth/reset-password-request', { email });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset request failed',
      };
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed',
      };
    }
  },

  async changePassword(oldPassword, newPassword) {
    try {
      const response = await apiClient.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed',
      };
    }
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return Cookies.get('auth_token') || null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};