import { apiClient } from './api-client';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const authService = {
  async login(credentials) {
    try {
      localStorage.removeItem('user')
      const response = await apiClient.post('/api/auth/login', credentials);
      
      if (response.success && response.data) {
        Cookies.set('auth_token', response.data.token, { expires: 7 });
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Dispatch event immediately
          window.dispatchEvent(new Event('userLoggedIn'));
          
          // Also dispatch with a slight delay to ensure all components are mounted
          setTimeout(() => {
            window.dispatchEvent(new Event('userLoggedIn'));
          }, 100);
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
      localStorage.removeItem('user')
      const response = await apiClient.post('/api/auth/register', data);
      
      // Handle nested success structure from your API
      if (response.success && response.data) {
        const userData = response.data.user || response.data;
        const token = response.data.token;
        
        if (token) {
          Cookies.set('auth_token', token, { expires: 7 });
        }
        
        if (typeof window !== 'undefined' && userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Dispatch event immediately
          window.dispatchEvent(new Event('userLoggedIn'));
          
          // Also dispatch with a slight delay to ensure all components are mounted
          setTimeout(() => {
            window.dispatchEvent(new Event('userLoggedIn'));
          }, 100);
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
      const response = await apiClient.post('/api/auth/verify-email', { token });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Email verification failed',
      };
    }
  },

  async sendVerificationEmail(email) {
    try {
      const response = await apiClient.post('/api/auth/send-verification', { email });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Failed to send verification email',
      };
    }
  },

  async resetPasswordRequest(email) {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Password reset request failed',
      };
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post('/api/auth/reset-password', {
        token,
        newPassword
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Password reset failed',
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

  // ✅ Check if token is valid (not expired)
  isTokenValid(token) {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      // Check if token is not expired (exp is in seconds, Date.now() is in milliseconds)
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      console.error("Invalid token:", error);
      return false;
    }
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    try {
      // First check if token is valid
      const token = this.getToken();
      if (!this.isTokenValid(token)) {
        // Token is expired or invalid, clear storage
        localStorage.removeItem('user');
        Cookies.remove('auth_token');
        return null;
      }
      
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  getToken() {
    return Cookies.get('auth_token') || null;
  },

  isAuthenticated() {
    const token = this.getToken();
    return this.isTokenValid(token);
  },
};