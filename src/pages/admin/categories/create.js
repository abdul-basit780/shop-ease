import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { 
  Tag, 
  ArrowLeft, 
  Save, 
  AlertCircle,
  CheckCircle,
  Package,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import { useAdminAuth } from '../utils/adminAuth';

// Layout Component (reusing from dashboard)
const AdminLayout = ({ children, title, subtitle }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading, isAdmin, user, handleLogout } = useAdminAuth();

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

  // Don't render anything if user is not admin
  if (!isAdmin) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Package, current: router.pathname === '/admin' },
    { name: 'Products', href: '/admin/products', icon: Package, current: router.pathname.startsWith('/admin/products') },
    { name: 'Categories', href: '/admin/categories', icon: Tag, current: router.pathname.startsWith('/admin/categories') },
    { name: 'Orders', href: '/admin/orders', icon: Package, current: router.pathname.startsWith('/admin/orders') },
    { name: 'Customers', href: '/admin/customers', icon: Package, current: router.pathname.startsWith('/admin/customers') },
    { name: 'Feedback', href: '/admin/feedback', icon: Package, current: router.pathname.startsWith('/admin/feedback') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 lg:left-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">SE</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ShopEase</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    item.current
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'admin@shopease.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-0 lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1f2937',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

// Card Component
const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
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
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-3',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : null}
      {children}
    </button>
  );
};

// Main Create Category Component
export default function CreateCategoryPage() {
  const router = useRouter();
  const { isLoading, isAdmin } = useAdminAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: null,
  });
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubcategory, setIsSubcategory] = useState(false);
  const [showSubcategoryOptions, setShowSubcategoryOptions] = useState(false);

  const fetchParentCategories = async () => {
    try {
      const response = await apiClient.get('/api/admin/category?parentId=null&limit=100');
      if (response.success) {
        const parents = response.data?.categories || response.categories || [];
        setParentCategories(parents);
      }
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      // Check if we're creating a subcategory
      const urlParams = new URLSearchParams(window.location.search);
      const parentId = urlParams.get('parentId');
      if (parentId) {
        setFormData(prev => ({ ...prev, parentId: parentId }));
        setIsSubcategory(true);
      }
      fetchParentCategories();
    }
  }, [isAdmin]);

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
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must not exceed 100 characters';
    }
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Category description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }
    
    // Parent category validation for subcategories
    if (showSubcategoryOptions && !formData.parentId) {
      newErrors.parentId = 'Please select a parent category for subcategories';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      // Debug: Log the form data before sending
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Form data:', formData);
      console.log('Is subcategory:', isSubcategory);
      console.log('Show subcategory options:', showSubcategoryOptions);
      console.log('Parent ID:', formData.parentId);
      console.log('Parent ID type:', typeof formData.parentId);
      console.log('Parent ID truthy:', !!formData.parentId);
      
      // Map form data to backend expected format (matching Swagger API)
      const submitData = {
        name: formData.name,
        description: formData.description,
        parentId: formData.parentId || null  // Always include parentId, use null for parent categories
      };
      
      console.log('Submit data:', submitData);
      console.log('Submit data parentId:', submitData.parentId);
      
      // Debug API client configuration
      console.log('=== API CLIENT DEBUG ===');
      console.log('Base URL:', process.env.NEXT_PUBLIC_URL);
      console.log('Full URL will be:', `${process.env.NEXT_PUBLIC_URL}/api/admin/category`);
      console.log('Request data being sent:', submitData);
      console.log('Request data JSON:', JSON.stringify(submitData));
      console.log('Request data parentId specifically:', submitData.parentId);
      console.log('Request data parentId type:', typeof submitData.parentId);
      console.log('Request data parentId is null:', submitData.parentId === null);
      console.log('Request data parentId is undefined:', submitData.parentId === undefined);
      
      const response = await apiClient.post('/api/admin/category', submitData);

      console.log('=== API RESPONSE DEBUG ===');
      console.log('Full response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      console.log('Response category:', response.category);
      console.log('Created category parentId:', response.data?.parentId);
      console.log('Created category fields:', Object.keys(response.data || {}));

      if (response.success) {
        setLoading(false);
        
        const successMessage = isSubcategory ? 'Subcategory created successfully! 🎉' : 'Category created successfully! 🎉';
        toast.success(successMessage, {
          icon: "✅",
          style: {
            borderRadius: "12px",
            background: "#10b981",
            color: "#fff",
          },
        });
        
        // Wait 3 seconds to let user see the message, then redirect
        await new Promise((resolve) => setTimeout(resolve, 3000));
        
        await router.push('/admin/categories');
      } else {
        setLoading(false);
        toast.error(response.message || 'Failed to create category', {
          style: {
            borderRadius: "12px",
            background: "#ef4444",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      console.error('Error creating category:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle specific validation errors from backend
      if (error.response?.status === 400) {
        setLoading(false);
        const errorMessage = error.response?.data?.message || 'Validation failed. Please check your input.';
        toast.error(errorMessage, {
          style: {
            borderRadius: "12px",
            background: "#ef4444",
            color: "#fff",
          },
        });
        
        // If there are specific field errors, show them
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      } else if (error.response?.status === 409) {
        setLoading(false);
        const errorMessage = error.response?.data?.message || 'Category already exists or there is a conflict.';
        toast.error(`Conflict: ${errorMessage}`, {
          style: {
            borderRadius: "12px",
            background: "#ef4444",
            color: "#fff",
          },
        });
        console.error('409 Conflict details:', error.response?.data);
      } else if (error.response?.status === 401) {
        setLoading(false);
        toast.error('You are not authorized. Please login again.', {
          style: {
            borderRadius: "12px",
            background: "#ef4444",
            color: "#fff",
          },
        });
        router.push('/auth/login');
      } else if (error.response?.status === 403) {
        setLoading(false);
        toast.error('You do not have permission to create categories.', {
          style: {
            borderRadius: "12px",
            background: "#ef4444",
            color: "#fff",
          },
        });
      } else {
        setLoading(false);
        toast.error(`Failed to create category. Error: ${error.response?.status || 'Unknown error'}`, {
          style: {
            borderRadius: "12px",
            background: "#ef4444",
            color: "#fff",
          },
        });
      }
    }
  };

  // Don't render anything if authentication is still loading or user is not admin
  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout title="Create Category" subtitle="Add a new category to organize your products">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/categories">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Categories
            </Button>
          </Link>
          <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {showSubcategoryOptions ? 'Create New Subcategory' : 'Create New Category'}
              </h2>
              <p className="text-gray-600">
                {showSubcategoryOptions 
                  ? 'Fill in the details to add a new subcategory' 
                  : 'Fill in the details to add a new category'
                }
              </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter category name"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                        errors.name ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Enter category description"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                        errors.description ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Category Type Selection */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">Category Type</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSubcategoryOptions(!showSubcategoryOptions);
                          if (!showSubcategoryOptions) {
                            setIsSubcategory(false);
                            setFormData(prev => ({ ...prev, parentId: null }));
                          }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {showSubcategoryOptions ? 'Create Main Category' : 'Create as Subcategory'}
                      </button>
                  </div>
                    
                    {!showSubcategoryOptions ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Tag className="h-5 w-5 text-white" />
                        </div>
                  <div>
                          <span className="text-sm font-medium text-gray-700">Main Category</span>
                          <p className="text-xs text-gray-500">Top-level category</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Tag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                            <span className="text-sm font-medium text-gray-700">Subcategory</span>
                            <p className="text-xs text-gray-500">Belongs to a parent category</p>
                          </div>
                  </div>

                        {/* Parent Category Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Parent Category *
                    </label>
                          <select
                            name="parentId"
                            value={formData.parentId || ''}
                            onChange={(e) => {
                              const selectedParentId = e.target.value;
                              console.log('Parent category selected:', selectedParentId);
                              console.log('Setting parentId to:', selectedParentId);
                              setFormData(prev => ({ ...prev, parentId: selectedParentId }));
                              setIsSubcategory(!!selectedParentId);
                            }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                            required
                          >
                            <option value="">Choose a parent category</option>
                            {parentCategories.map((parent) => (
                              <option key={parent.id} value={parent.id}>
                                {parent.name}
                              </option>
                            ))}
                          </select>
                    <p className="mt-1 text-sm text-gray-500">
                            Select the parent category for this subcategory
                          </p>
                          {errors.parentId && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.parentId}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </CardBody>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">


              {/* Category Preview */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          showSubcategoryOptions 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-br from-blue-500 to-purple-500'
                        }`}>
                          <Tag className="h-6 w-6 text-white" />
                      </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                              {formData.name || (showSubcategoryOptions ? 'Subcategory Name' : 'Category Name')}
                        </h4>
                            {showSubcategoryOptions && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Subcategory
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                          {formData.description ? 
                              formData.description.substring(0, 60) + (formData.description.length > 60 ? '...' : '') :
                              (showSubcategoryOptions ? 'Subcategory description will appear here' : 'Category description will appear here')
                          }
                        </p>
                          {showSubcategoryOptions && formData.parentId && (
                            <div className="flex items-center space-x-1 text-xs text-blue-600">
                              <span>└─</span>
                              <span>Subcategory of: {parentCategories.find(p => p.id === formData.parentId)?.name || 'Loading...'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-400">
                          {showSubcategoryOptions ? 'Subcategory' : 'Main Category'}
                    </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Actions */}
              <Card>
                <CardBody>
                  <div className="space-y-3">

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                        showSubcategoryOptions 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-5 w-5 mr-2" />
                      )}
                      {showSubcategoryOptions ? 'Create Subcategory' : 'Create Category'}
                    </button>
                    <Link href="/admin/categories">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
