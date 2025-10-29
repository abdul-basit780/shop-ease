import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for admin authentication
 * Handles authentication check, loading state, and redirects
 * 
 * @returns {Object} - { isLoading, isAdmin, user, handleLogout }
 */
export const useAdminAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  const checkAdminAuth = () => {
    try {
      // Check if user is logged in
      const userData = localStorage.getItem('user');
      const authToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      if (!userData || !authToken) {
        toast.error('Please login to access admin panel');
        router.push('/auth/login');
        return false;
      }

      const user = JSON.parse(userData);
      
      // Check if user is admin
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        router.push('/');
        return false;
      }

      setUser(user);
      setIsAdmin(true);
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      toast.error('Authentication error. Please login again.');
      router.push('/auth/login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; max-age=0; path=/';
    toast.success('Logged out successfully! 👋');
    router.push('/auth/login');
  };

  return {
    isLoading,
    isAdmin,
    user,
    checkAuth: checkAdminAuth,
    handleLogout
  };
};

/**
 * Higher-order component for admin authentication
 * Wraps components with authentication check
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 * @returns {React.Component} - Wrapped component with auth check
 */
export const withAdminAuth = (WrappedComponent) => {
  return function AdminAuthWrapper(props) {
    const { isLoading, isAdmin } = useAdminAuth();

    // Show loading spinner while checking authentication
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      );
    }

    // Redirect if not admin
    if (!isAdmin) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

/**
 * Admin authentication guard component
 * Use this to wrap admin pages that need authentication
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {React.ReactNode} props.fallback - Fallback component to show while loading
 * @returns {React.Component} - Authentication guard
 */
export const AdminAuthGuard = ({ children, fallback }) => {
  const { isLoading, isAdmin } = useAdminAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    return null;
  }

  return children;
};

// Default export to prevent Next.js from treating this as a page
export default function AdminAuthUtils() {
  return null;
}
