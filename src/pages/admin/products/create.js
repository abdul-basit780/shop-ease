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
  Menu
} from 'lucide-react';
import { apiClient } from '../../../lib/api-client';

// Layout Component (reusing from dashboard)
const AdminLayout = ({ children, title, subtitle }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; max-age=0; path=/';
    toast.success('Logged out successfully! 👋');
    router.push('/auth/login');
  };

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

// Image Upload Component
const ImageUpload = ({ images, onImagesChange, maxImages = 5 }) => {
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files].slice(0, maxImages);
    onImagesChange(newImages);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Product Images
      </label>
      
      {/* Upload Area */}
      {images.length < maxImages && (
        <div className="mb-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden">
                {typeof image === 'string' ? (
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                )}
              </div>
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        {images.length} of {maxImages} images uploaded
      </p>
    </div>
  );
};

// Main Create Product Component
export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    subcategory: '',
    material: '',
    careInstructions: '',
    fitType: '',
    season: '',
    sizeGuide: '',
    options: [],
    isActive: true,
    isFeatured: false,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [createdProduct, setCreatedProduct] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, []);


  const fetchParentCategories = async () => {
    try {
      console.log('Fetching parent categories...');
      const response = await apiClient.get('/api/admin/category?parentId=null&limit=100');
      console.log('Parent categories response:', response);
      if (response.success) {
        const parentCats = response.data?.categories || [];
        console.log('Parent categories loaded:', parentCats);
        setParentCategories(parentCats);
      }
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

  const fetchCategories = async (parentId = null) => {
    try {
      console.log('Fetching categories...', parentId ? `for parent: ${parentId}` : 'all categories');
      const url = parentId ? `/api/admin/category?parentId=${parentId}&limit=100` : '/api/admin/category?limit=100';
      console.log('API URL:', url);
      
      // Check authentication token
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
      console.log('Auth token exists:', !!token);
      console.log('Auth token preview:', token ? token.substring(0, 10) + '...' : 'No token');
      
      const response = await apiClient.get(url);
      console.log('Categories response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      console.log('Response categories:', response.data?.categories || response.categories);
      
      if (response.success) {
        const categoriesData = response.data?.categories || [];
        console.log('Setting categories:', categoriesData);
        
        // WORKAROUND: Since backend doesn't return parentId, we'll track it locally
        // Get stored hierarchy from localStorage
        const storedHierarchy = JSON.parse(localStorage.getItem('categoryHierarchy') || '{}');
        console.log('Stored hierarchy from localStorage:', storedHierarchy);
        
        const processedCategories = categoriesData.map(cat => {
          // Check if we have stored parentId for this category
          const storedParentId = storedHierarchy[cat.id];
          const actualParentId = cat.parentId || storedParentId || null;
          
          return {
            ...cat,
            parentId: actualParentId,
            isParentCategory: !actualParentId
          };
        });
        
        setCategories(processedCategories);
        console.log('Categories set:', processedCategories);
        
        if (parentId && categoriesData.length === 0) {
          console.log('No subcategories found for parent:', parentId);
          console.log('Testing direct API call...');
          
          // Test direct API call to verify
          fetch(`/api/admin/category?parentId=${parentId}`)
            .then(response => response.json())
            .then(data => {
              console.log('Direct API test result:', data);
            })
            .catch(error => {
              console.error('Direct API test failed:', error);
            });
            
          toast('No subcategories found for this parent category. Create subcategories first.', {
            icon: 'ℹ️',
            style: {
              background: '#3B82F6',
              color: '#fff',
            },
          });
        }
      } else {
        console.error('Failed to fetch categories:', response.message);
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load categories. Please check your connection.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // If category changes, reset subcategory
    if (name === 'category') {
      setFormData(prev => ({ 
        ...prev, 
        category: value,
        subcategory: '' // Reset subcategory when category changes
      }));
      
      // Clear subcategory error when parent changes
      if (errors.subcategory) {
        setErrors(prev => ({ ...prev, subcategory: '' }));
      }
    }
    
    // Clear subcategory error when subcategory changes
    if (name === 'subcategory' && errors.subcategory) {
      setErrors(prev => ({ ...prev, subcategory: '' }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  // Option management functions
  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { name: '', values: [] }]
    }));
  };

  const updateOptionName = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? { ...option, name: value } : option)
    }));
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const addOptionValue = (optionIndex) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex 
          ? { ...option, values: [...option.values, { name: '', price: 0, stock: 0 }] }
          : option
      )
    }));
  };

  const updateOptionValue = (optionIndex, valueIndex, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex 
          ? { 
              ...option, 
              values: option.values.map((val, j) => 
                j === valueIndex 
                  ? { ...val, name: value }
                  : val
              )
            }
          : option
      )
    }));
  };

  const updateOptionValuePrice = (optionIndex, valueIndex, price) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex 
          ? { 
              ...option, 
              values: option.values.map((val, j) => 
                j === valueIndex 
                  ? { ...val, price: price }
                  : val
              )
            }
          : option
      )
    }));
  };

  const updateOptionValueStock = (optionIndex, valueIndex, stock) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex 
          ? { 
              ...option, 
              values: option.values.map((val, j) => 
                j === valueIndex 
                  ? { ...val, stock: stock }
                  : val
              )
            }
          : option
      )
    }));
  };

  const removeOptionValue = (optionIndex, valueIndex) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex 
          ? { ...option, values: option.values.filter((_, j) => j !== valueIndex) }
          : option
      )
    }));
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
      newErrors.category = 'Parent category is required';
    }
    
    // Subcategory validation - required if parent has subcategories
    const availableSubcategories = categories.filter(cat => cat.parentId === formData.category);
    if (formData.category && availableSubcategories.length > 0 && !formData.subcategory) {
      newErrors.subcategory = 'Subcategory is required for this parent category';
    }
    
    // Images validation (backend requires image)
    if (images.length === 0) {
      newErrors.images = 'Product image is required';
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
      console.log('Creating product with data:', formData);
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form fields - map to backend expected format
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock);
      // Use subcategory if selected, otherwise use parent category
      const selectedCategoryId = formData.subcategory || formData.category;
      submitData.append('categoryId', selectedCategoryId);

      // Add image (backend expects single 'image' field, not 'images')
      if (images.length > 0 && typeof images[0] === 'object') {
        submitData.append('image', images[0]);
      }

      console.log('Submitting to /admin/product');
      console.log('FormData contents:');
      for (let [key, value] of submitData.entries()) {
        console.log(key, ':', value);
      }
      
      const response = await apiClient.post('/api/admin/product', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Product creation response:', response);

      if (response.success) {
        toast.success('Product created successfully! 🎉');
        const product = response.data?.product || response.product;
        setCreatedProduct(product);
        
        // Show option to manage product options
        const productId = product?.id;
        if (productId) {
          const manageOptions = confirm('Product created! Would you like to add option types (Size, Color, etc.) for product variants?');
          if (manageOptions) {
            router.push(`/admin/products/options/${productId}`);
          } else {
            // Redirect to main products page
            router.push('/admin/products');
          }
        }
      } else {
        toast.error(response.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
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
        toast.error('You do not have permission to create products.');
      } else if (error.response?.status === 409) {
        toast.error('A product with this name already exists in this category. Please choose a different name.');
      } else {
        toast.error('Failed to create product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show success state after product creation
  if (createdProduct) {
    return (
      <AdminLayout title="Product Created!" subtitle="Your product has been successfully added">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardBody className="py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Created Successfully!</h2>
              <p className="text-gray-600 mb-6">
                "{createdProduct.name}" has been added to your catalog and is now available for customers.
              </p>
              
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    onClick={() => router.push(`/admin/products/options/${createdProduct.id}`)}
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Add Variants (Size, Color)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/products/view/${createdProduct.id}`)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Product
                  </Button>
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/products')}
                    className="flex-1"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Back to Products
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCreatedProduct(null);
                      setFormData({
                        name: '',
                        description: '',
                        price: '',
                        stock: '',
                        category: '',
                        brand: '',
                        sku: '',
                        weight: '',
                        material: '',
                        careInstructions: '',
                        fitType: '',
                        season: '',
                        sizeGuide: '',
                        features: [],
                        tags: [],
                        isActive: true,
                        isFeatured: false,
                      });
                      setImages([]);
                      setErrors({});
                    }}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Another
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Create Product" subtitle="Add a new product to your catalog">
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
            <h2 className="text-2xl font-bold text-gray-900">Create New Product</h2>
            <p className="text-gray-600">Fill in the details to add a new product to your catalog</p>
          </div>
        </div>
      </div>

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
                    rows={4}
                    placeholder="Enter product description"
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

                {/* Price and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                          errors.price ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
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


                {/* Category Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Parent Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                        errors.category ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                    >
                      {console.log('Total categories:', categories.length, 'Parent categories:', categories.filter(cat => !cat.parentId).length)}
                      <option value="">Select a parent category</option>
                      {categories.length === 0 ? (
                        <option value="" disabled>No categories found. Create categories first.</option>
                      ) : (
                        categories
                          .filter(category => !category.parentId) // Only show parent categories
                          .map((category) => {
                            console.log('Rendering category option:', category);
                            return (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            );
                          })
                      )}
                    </select>
                    {errors.category && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subcategory *
                    </label>
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleChange}
                      disabled={!formData.category || categories.filter(cat => cat.parentId === formData.category).length === 0}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                        errors.subcategory ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                      } ${(!formData.category || categories.filter(cat => cat.parentId === formData.category).length === 0) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select a subcategory</option>
                      {formData.category ? (
                        categories
                          .filter(cat => cat.parentId === formData.category)
                          .map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </option>
                          ))
                      ) : (
                        <option value="" disabled>Select a parent category first</option>
                      )}
                    </select>
                    {errors.subcategory && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.subcategory}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.category ? 
                        (categories.filter(cat => cat.parentId === formData.category).length > 0 ? 
                          'Available subcategories for the selected parent' : 
                          'No subcategories available for this parent category - subcategory selection disabled') :
                        'Choose a parent category to see available subcategories'
                      }
                    </p>
                </div>

                  </div>

              </CardBody>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
              </CardHeader>
              <CardBody>
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxImages={5}
                />
                {errors.images && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.images}
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Product Options */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Product Options</h3>
                <p className="text-sm text-gray-600">Add options like Size, Color, Material, etc. for product variants with individual pricing and stock</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {formData.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => updateOptionName(optionIndex, e.target.value)}
                          placeholder="Option name (e.g., Size, Color, Material)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(optionIndex)}
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
                                value={value.name || value}
                                onChange={(e) => updateOptionValue(optionIndex, valueIndex, e.target.value)}
                                placeholder="Option value (e.g., Small, Red, Cotton)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Price Adjustment</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={value.price || 0}
                                    onChange={(e) => updateOptionValuePrice(optionIndex, valueIndex, parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Additional price (can be negative for discounts)</p>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={value.stock || 0}
                                  onChange={(e) => updateOptionValueStock(optionIndex, valueIndex, parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">Available quantity for this option</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOptionValue(optionIndex)}
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
                    onClick={addOption}
                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium border-2 border-dashed border-blue-300 hover:border-blue-400 rounded-lg p-4 w-full justify-center transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option Type
                  </button>
                </div>
              </CardBody>
            </Card>


          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Status */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Product Status</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Featured</span>
                </label>
              </CardBody>
            </Card>

            {/* Clothing Details */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Clothing Details</h3>
                <p className="text-sm text-gray-600">Add specific details for clothing items</p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                    <input
                      type="text"
                      name="material"
                      value={formData.material || ''}
                      onChange={handleChange}
                      placeholder="e.g., 100% Cotton, Polyester, Denim"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Care Instructions</label>
                    <input
                      type="text"
                      name="careInstructions"
                      value={formData.careInstructions || ''}
                      onChange={handleChange}
                      placeholder="e.g., Machine wash cold, Hang dry"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fit Type</label>
                    <select
                      name="fitType"
                      value={formData.fitType || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select fit type</option>
                      <option value="Slim">Slim</option>
                      <option value="Regular">Regular</option>
                      <option value="Relaxed">Relaxed</option>
                      <option value="Oversized">Oversized</option>
                      <option value="Athletic">Athletic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                    <select
                      name="season"
                      value={formData.season || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select season</option>
                      <option value="All Season">All Season</option>
                      <option value="Summer">Summer</option>
                      <option value="Winter">Winter</option>
                      <option value="Spring">Spring</option>
                      <option value="Fall">Fall</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size Guide</label>
                  <textarea
                    name="sizeGuide"
                    value={formData.sizeGuide || ''}
                    onChange={handleChange}
                    rows="3"
                    placeholder="e.g., Small: Chest 34-36, Medium: Chest 38-40, Large: Chest 42-44"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Actions */}
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
                    Create Product
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
    </AdminLayout>
  );
}
