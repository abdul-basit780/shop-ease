import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Package, 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Plus,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  LogOut,
  Menu,
  Settings,
  Tag,
  Trash2
} from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { useAdminAuth } from '../../utils/adminAuth';

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
    { name: 'Categories', href: '/admin/categories', icon: Package, current: router.pathname.startsWith('/admin/categories') },
    { name: 'Orders', href: '/admin/orders', icon: Package, current: router.pathname.startsWith('/admin/orders') },
    { name: 'Customers', href: '/admin/customers', icon: Package, current: router.pathname.startsWith('/admin/customers') },
    { name: 'Feedback', href: '/admin/feedback', icon: Package, current: router.pathname.startsWith('/admin/feedback') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Shop-Ease</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    item.current
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-gray-600">{subtitle}</p>}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Card Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardBody = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", size = "md", className = "", onClick, disabled = false, isLoading = false, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 focus:ring-primary-500 shadow-lg hover:shadow-xl",
    outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      )}
      {children}
    </button>
  );
};

export default function ProductEdit() {
  const router = useRouter();
  const { id } = router.query;
  const { isLoading, isAdmin } = useAdminAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  });
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [optionTypes, setOptionTypes] = useState([]);
  const [newOptions, setNewOptions] = useState([]);

  useEffect(() => {
    if (id && isAdmin) {
      fetchProduct();
      fetchCategories();
      fetchOptionTypes();
    }
  }, [id, isAdmin]);

  const fetchProduct = async () => {
    try {
      console.log('Fetching product with ID:', id);
      const response = await apiClient.get(`/api/admin/product/${id}`);
      console.log('Product response:', response);

      if (response.success) {
        // The API returns the product nested under data
        const product = response.data || response.product;
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          stock: product.stock?.toString() || '',
          category: product.categoryId || product.category || ''
        });
        
        // Set existing image if available
        if (product.img) {
          setImages([{ preview: product.img, isExisting: true }]);
        }
      } else {
        console.error('Failed to fetch product:', response.message);
        toast.error('Failed to load product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      
      if (error.response?.status === 404) {
        toast.error('Product not found');
        router.push('/admin/products');
      } else if (error.response?.status === 401) {
        toast.error('You are not authorized. Please login again.');
        router.push('/auth/login');
      } else {
        toast.error('Failed to load product. Please try again.');
      }
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await apiClient.get('/api/admin/category');
      console.log('Categories response:', response);
      
      if (response.success) {
        setCategories(response.data?.categories || response.categories || []);
      } else {
        console.error('Failed to fetch categories:', response.message);
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories. Please check your connection.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'Name must not exceed 200 characters';
    }
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = 'Description must not exceed 2000 characters';
    }
    
    // Price validation
    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price)) {
      newErrors.price = 'Valid price is required';
    } else if (price < 0) {
      newErrors.price = 'Price cannot be negative';
    } else if (price > 999999.99) {
      newErrors.price = 'Price cannot exceed 999999.99';
    }
    
    // Stock validation
    const stock = parseInt(formData.stock);
    if (!formData.stock || isNaN(stock)) {
      newErrors.stock = 'Valid stock quantity is required';
    } else if (!Number.isInteger(stock)) {
      newErrors.stock = 'Stock must be a whole number';
    } else if (stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    } else if (stock > 999999) {
      newErrors.stock = 'Stock cannot exceed 999999';
    }
    
    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchOptionTypes = async () => {
    try {
      const response = await apiClient.get(`/api/admin/option-type?productId=${id}`);
      if (response.success) {
        setOptionTypes(response.data?.optionTypes || []);
      }
    } catch (error) {
      console.error('Error fetching option types:', error);
    }
  };


  const handleDeleteOptionType = async (optionTypeId) => {
    if (!confirm('Are you sure you want to delete this option type? This will also delete all its values.')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/admin/option-type/${optionTypeId}`);
      if (response.success) {
        toast.success('Option type deleted successfully!');
        fetchOptionTypes();
      } else {
        toast.error(response.message || 'Failed to delete option type');
      }
    } catch (error) {
      console.error('Error deleting option type:', error);
      toast.error('Failed to delete option type');
    }
  };

  // New option management functions (for adding new option types with values)
  const addNewOption = () => {
    setNewOptions([...newOptions, { name: '', values: [{ value: '', name: '', price: 0, stock: 0, image: null }] }]);
  };

  const updateNewOptionName = (index, value) => {
    setNewOptions(newOptions.map((option, i) => i === index ? { ...option, name: value } : option));
  };

  const removeNewOption = (index) => {
    setNewOptions(newOptions.filter((_, i) => i !== index));
  };

  const addNewOptionValue = (optionIndex) => {
    setNewOptions(newOptions.map((option, i) => 
      i === optionIndex 
        ? { ...option, values: [...option.values, { value: '', name: '', price: 0, stock: 0, image: null }] }
        : option
    ));
  };

  const updateNewOptionValue = (optionIndex, valueIndex, newValue) => {
    setNewOptions(newOptions.map((option, i) => 
      i === optionIndex 
        ? { 
            ...option, 
            values: option.values.map((val, j) => 
              j === valueIndex 
                ? { ...val, name: newValue, value: newValue }
                : val
            )
          }
        : option
    ));
  };

  const updateNewOptionValuePrice = (optionIndex, valueIndex, price) => {
    setNewOptions(newOptions.map((option, i) => 
      i === optionIndex 
        ? { 
            ...option, 
            values: option.values.map((val, j) => 
              j === valueIndex ? { ...val, price: price } : val
            )
          }
        : option
    ));
  };

  const updateNewOptionValueStock = (optionIndex, valueIndex, stock) => {
    setNewOptions(newOptions.map((option, i) => 
      i === optionIndex 
        ? { 
            ...option, 
            values: option.values.map((val, j) => 
              j === valueIndex ? { ...val, stock: stock } : val
            )
          }
        : option
    ));
  };

  const removeNewOptionValue = (optionIndex, valueIndex) => {
    setNewOptions(newOptions.map((option, i) => 
      i === optionIndex 
        ? { ...option, values: option.values.filter((_, j) => j !== valueIndex) }
        : option
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      console.log('Updating product with data:', formData);
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form fields - map to backend expected format
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock);
      submitData.append('categoryId', formData.category);

      // Add new image if provided
      const newImage = images.find(img => !img.isExisting && img.file);
      if (newImage) {
        submitData.append('image', newImage.file);
      }

      console.log('Submitting to /admin/product/' + id);
      const response = await apiClient.put(`/api/admin/product/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Product update response:', response);

      if (response.success) {
        toast.success('Product updated successfully! 🎉');
        
        // Create new option types and values if any
        if (newOptions && newOptions.length > 0) {
          try {
            console.log('Creating new option types and values');
            
            const optionTypeResults = await Promise.all(
              newOptions
                .filter(option => option.name && option.name.trim())
                .map(async (option) => {
                  try {
                    const optionTypeResponse = await apiClient.post('/api/admin/option-type', {
                      productId: id,
                      name: option.name.trim()
                    });
                    
                    if (optionTypeResponse.success && optionTypeResponse.data) {
                      const optionTypeId = optionTypeResponse.data.id;
                      
                      if (option.values && option.values.length > 0) {
                        const valuesResults = await Promise.all(
                          option.values
                            .filter(val => val.value && val.value.trim() && val.image)
                            .map(async (val) => {
                              try {
                                const valueFormData = new FormData();
                                valueFormData.append('optionTypeId', optionTypeId);
                                valueFormData.append('value', val.value.trim());
                                valueFormData.append('price', parseFloat(val.price) || 0);
                                valueFormData.append('stock', parseInt(val.stock) || 0);
                                valueFormData.append('image', val.image);
                                
                                const valueResponse = await apiClient.post('/api/admin/option-value', valueFormData, {
                                  headers: {
                                    'Content-Type': 'multipart/form-data',
                                  },
                                });
                                
                                if (valueResponse.success) {
                                  console.log(`Created option value "${val.value}"`);
                                  return true;
                                } else {
                                  return false;
                                }
                              } catch (error) {
                                console.error(`Error creating value "${val.value}":`, error);
                                return false;
                              }
                            })
                        );
                        
                        return { valuesCreated: valuesResults.filter(r => r === true).length };
                      }
                      
                      return { valuesCreated: 0 };
                    }
                    
                    return null;
                  } catch (error) {
                    console.error(`Error creating option type "${option.name}":`, error);
                    return null;
                  }
                })
            );
            
            const validResults = optionTypeResults.filter(r => r !== null);
            const totalValuesCreated = validResults.reduce((sum, r) => sum + r.valuesCreated, 0);
            
            if (validResults.length > 0) {
              toast.success(`Created ${validResults.length} option type(s) with ${totalValuesCreated} value(s).`);
            }
          } catch (error) {
            console.error('Error creating options:', error);
          }
        }
        
        router.push('/admin/products');
      } else {
        toast.error(response.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle specific validation errors from backend
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Validation failed. Please check your input.';
        console.error('400 Error details:', error.response?.data);
        toast.error(errorMessage);
        
        // If there are specific field errors, show them
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      } else if (error.response?.status === 401) {
        toast.error('You are not authorized. Please login again.');
        router.push('/auth/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to update products.');
      } else if (error.response?.status === 404) {
        toast.error('Product not found.');
        router.push('/admin/products');
      } else if (error.response?.status === 409) {
        toast.error('A product with this name already exists in this category. Please choose a different name.');
      } else {
        toast.error('Failed to update product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if authentication is still loading or user is not admin
  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout title="Edit Product" subtitle="Update product information">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
            <p className="text-gray-600">Update the product information below</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link href={`/admin/products/options/${id}`}>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Options
            </Button>
          </Link>
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
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
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
                      placeholder="Enter product description"
                      rows={4}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none ${
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

                  {/* Price and Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                          errors.price ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                      />
                      {errors.price && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                          errors.stock ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                      />
                      {errors.stock && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.stock}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                        errors.category ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Product Images */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Product Image</h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  {/* Current Image */}
                  {images.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">Current Image</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.preview}
                              alt={`Product ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload New Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {images.length > 0 ? 'Replace Image' : 'Upload Image'}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG, WEBP up to 5MB
                        </span>
                      </label>
                    </div>
                    {errors.images && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.images}
                      </p>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Existing Options */}
              <Card>
                <CardHeader>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Existing Options</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage existing product variants</p>
                  </div>
                </CardHeader>
                <CardBody className="space-y-2">
                  {optionTypes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No options yet</p>
                    </div>
                  ) : (
                    optionTypes.map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Tag className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">{option.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/admin/products/options/${id}/values/${option.id}`}>
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteOptionType(option.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>

              {/* Add New Options */}
              <Card>
                <CardHeader>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Add New Options</h3>
                    <p className="text-sm text-gray-600 mt-1">Add new product variants with their values, pricing, and images</p>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-6">
                    {newOptions.map((option, optionIndex) => (
                      <div key={optionIndex} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) => updateNewOptionName(optionIndex, e.target.value)}
                            placeholder="Option name (e.g., Size, Color, Material)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewOption(optionIndex)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Values:</label>
                          {option.values.map((value, valueIndex) => (
                            <div key={valueIndex} className="border border-gray-200 rounded-lg p-3 space-y-3">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={value.value || value.name || value}
                                  onChange={(e) => updateNewOptionValue(optionIndex, valueIndex, e.target.value)}
                                  placeholder="Option value (e.g., Small, Red, Cotton)"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeNewOptionValue(optionIndex, valueIndex)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Price Adjustment</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={value.price || 0}
                                      onChange={(e) => updateNewOptionValuePrice(optionIndex, valueIndex, parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={value.stock || 0}
                                    onChange={(e) => updateNewOptionValueStock(optionIndex, valueIndex, parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Image *</label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setNewOptions(newOptions.map((opt, i) => 
                                          i === optionIndex 
                                            ? {
                                                ...opt,
                                                values: opt.values.map((val, j) => 
                                                  j === valueIndex ? { ...val, image: file } : val
                                                )
                                              }
                                            : opt
                                        ));
                                      }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addNewOptionValue(optionIndex)}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Value
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addNewOption}
                      className="flex items-center text-blue-600 hover:text-blue-700 font-medium border-2 border-dashed border-blue-300 hover:border-blue-400 rounded-lg p-4 w-full justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option Type
                    </button>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Actions */}
            <div className="space-y-6">
              <Card>
                <CardBody>
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      isLoading={loading}
                    >
                      <Save className="h-4 w-4" />
                      Update Product
                    </Button>
                    <Link href="/admin/products">
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
