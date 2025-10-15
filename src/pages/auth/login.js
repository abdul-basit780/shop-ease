import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ShoppingBag, Sparkles, CheckCircle } from 'lucide-react';

// Layout Component
const Layout = ({ children }) => {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
};

// Button Component
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  isLoading = false,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl focus:ring-blue-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
};

// Card Components
const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Mock auth service - replace with your actual implementation
const authService = {
  async login(credentials) {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      // Handle nested data structure from your API
      if (data.success && data.data) {
        const token = data.data.token;
        const user = data.data.user;
        
        if (token) {
          // Store token in cookie or localStorage
          document.cookie = `auth_token=${token}; max-age=${7 * 24 * 60 * 60}; path=/`;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return {
          success: true,
          data: {
            user,
            token
          }
        };
      }
      
      return {
        success: false,
        error: data.message || 'Login failed'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      
      if (response.success) {
        toast.success('Welcome back! 🎉', {
          icon: '👋',
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
          },
        });
        
        // Redirect based on user role
        setTimeout(() => {
          if (response.data.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        }, 1000);
      } else {
        toast.error(response.error || 'Login failed', {
          style: {
            borderRadius: '12px',
            background: '#ef4444',
            color: '#fff',
          },
        });
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.', {
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-200 opacity-20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-purple-200 opacity-20 rounded-full blur-3xl top-1/3 right-10 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-purple-200 opacity-20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>
        </div>

        {/* Floating Shapes */}
        <div className="absolute top-20 left-[10%] animate-bounce">
          <div className="w-16 h-16 bg-blue-200/40 rounded-2xl rotate-45 backdrop-blur-sm"></div>
        </div>
        <div className="absolute bottom-32 right-[15%] animate-bounce">
          <div className="w-12 h-12 bg-purple-200/40 rounded-full backdrop-blur-sm"></div>
        </div>
        
        <div className="w-full max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Branding & Benefits */}
            <div className="hidden lg:block">
              <div className="text-center lg:text-left">
                {/* Logo */}
                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-all duration-500 shadow-2xl">
                    <span className="text-white font-extrabold text-3xl">S</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">ShopHub</h1>
                    <p className="text-sm text-gray-600">Smart Shopping Experience</p>
                  </div>
                </div>

                {/* Hero Text */}
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                  Welcome Back to Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-2">
                    Shopping Paradise! 🛍️
                  </span>
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Sign in to access personalized recommendations and exclusive deals
                </p>

                {/* Benefits List */}
                <div className="space-y-4 mb-8">
                  {[
                    { icon: Sparkles, text: 'Personalized Product Recommendations' },
                    { icon: ShoppingBag, text: 'Exclusive Member Deals & Discounts' },
                    { icon: CheckCircle, text: 'Fast & Secure Checkout Process' },
                  ].map((benefit, idx) => {
                    const Icon = benefit.icon;
                    return (
                      <div 
                        key={idx} 
                        className="flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{benefit.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Illustration/Stats */}
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">10K+</div>
                      <div className="text-sm text-gray-600">Happy Users</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-purple-600 mb-1">5K+</div>
                      <div className="text-sm text-gray-600">Products</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600 mb-1">98%</div>
                      <div className="text-sm text-gray-600">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-block w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-4 shadow-2xl">
                  <span className="text-white font-extrabold text-4xl">S</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                  Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Back</span>
                </h1>
                <p className="text-gray-600">Sign in to continue shopping</p>
              </div>

              <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
                <CardBody className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                            errors.email ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠️</span> {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                            errors.password ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠️</span> {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">Remember me</span>
                      </label>
                      <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl transition-all"
                        size="lg"
                        isLoading={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Signing in...
                          </span>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">New to ShopHub?</span>
                      </div>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center">
                      <Link href="/auth/register">
                        <button
                          type="button"
                          className="w-full px-6 py-3 text-blue-600 hover:text-blue-700 font-semibold border-2 border-blue-600 hover:border-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          Create New Account
                        </button>
                      </Link>
                    </div>
                  </form>
                </CardBody>
              </Card>
              
              {/* Trust Badge */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-md">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-semibold">Secure & Encrypted Login</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}