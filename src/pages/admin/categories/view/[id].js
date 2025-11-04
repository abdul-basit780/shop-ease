import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Tag, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Package,
  Menu,
  LogOut
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
    { name: 'Categories', href: '/admin/categories', icon: Tag, current: router.pathname.startsWith('/admin/categories') },
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

const Button = ({ children, variant = "primary", size = "md", className = "", onClick, disabled = false, ...props }) => {
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
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default function CategoryView() {
  const router = useRouter();
  const { id } = router.query;
  const { isLoading, isAdmin } = useAdminAuth();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [stats, setStats] = useState({
    productCount: 0,
    subcategoryCount: 0
  });

  useEffect(() => {
    if (id && isAdmin) {
      fetchCategory();
      fetchCategoryStats();
    }
  }, [id, isAdmin]);

  // Refresh stats when page becomes visible (e.g., when navigating back from product creation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && id) {
        fetchCategoryStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      console.log('Fetching category with ID:', id);
      console.log('API URL:', `/admin/category/${id}`);
      const response = await apiClient.get(`/api/admin/category/${id}`);
      console.log('Category response:', response);
      console.log('Response success:', response.success);
      console.log('Response category:', response.category);

      if (response.success) {
        // The API returns the category directly, not nested under data
        const categoryData = response.category || response.data;
        setCategory(categoryData);
        
        // If this is a subcategory, fetch the parent category
        if (categoryData.parentId) {
          fetchParentCategory(categoryData.parentId);
        }
      } else {
        console.error('Failed to fetch category:', response.message);
        setError(response.message || 'Failed to load category');
        toast.error('Failed to load category');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        setError('Category not found');
        toast.error('Category not found');
      } else if (error.response?.status === 401) {
        toast.error('You are not authorized. Please login again.');
        router.push('/auth/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view this category.');
      } else {
        setError('Failed to load category');
        toast.error('Failed to load category. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchParentCategory = async (parentId) => {
    try {
      console.log('Fetching parent category with ID:', parentId);
      const response = await apiClient.get(`/api/admin/category/${parentId}`);
      console.log('Parent category response:', response);
      
      if (response.success) {
        setParentCategory(response.category || response.data);
        console.log('Parent category loaded:', response.category || response.data);
      } else {
        console.error('Failed to fetch parent category:', response.message);
      }
    } catch (error) {
      console.error('Error fetching parent category:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchCategoryStats = async () => {
    try {
      console.log('Fetching category stats for ID:', id);
      
      // Get all categories to find subcategories
      const categoriesResponse = await apiClient.get('/api/admin/category?limit=100&includeDeleted=false');
      const allCategories = categoriesResponse.data?.categories || 
                           categoriesResponse.categories || [];
      
      // Find the current category
      const currentCategory = allCategories.find(cat => (cat.id || cat._id) === id);
      const isParentCategory = !currentCategory?.parentId;
      
      // Get subcategories (categories with this as parent)
      const subcategories = allCategories.filter(cat => {
        const catParentId = cat.parentId?.toString() || cat.parentId;
        const currentIdStr = (id || currentCategory?.id || currentCategory?._id).toString();
        return catParentId === currentIdStr;
      });
      const subcategoryCount = subcategories.length;
      
      // Calculate product count
      let productCount = 0;
      
      if (isParentCategory) {
        // For parent categories: count products directly in parent + all subcategories
        const categoryId = id || currentCategory?.id || currentCategory?._id;
        
        // Get products directly in parent category
        try {
          const parentProductsResponse = await apiClient.get(`/api/admin/product?categoryId=${categoryId}&limit=1`);
          const parentProductCount = parentProductsResponse.data?.pagination?.total || 
                                    parentProductsResponse.pagination?.total || 0;
          productCount += parentProductCount;
        } catch (error) {
          console.error('Error fetching parent category products:', error);
        }
        
        // Get products from all subcategories
        const subcategoryProductPromises = subcategories.map(async (sub) => {
          try {
            const subId = sub.id || sub._id;
            const response = await apiClient.get(`/api/admin/product?categoryId=${subId}&limit=1`);
            return response.data?.pagination?.total || response.pagination?.total || 0;
          } catch (error) {
            console.error(`Error fetching products for subcategory ${sub.name}:`, error);
            return 0;
          }
        });
        
        const subcategoryProductCounts = await Promise.all(subcategoryProductPromises);
        productCount += subcategoryProductCounts.reduce((sum, count) => sum + count, 0);
      } else {
        // For subcategories: count products directly in this subcategory
        try {
          const categoryId = id || currentCategory?.id || currentCategory?._id;
          const productsResponse = await apiClient.get(`/api/admin/product?categoryId=${categoryId}&limit=1`);
          productCount = productsResponse.data?.pagination?.total || 
                        productsResponse.pagination?.total || 0;
        } catch (error) {
          console.error('Error fetching subcategory products:', error);
        }
      }
      
      setStats({
        productCount,
        subcategoryCount
      });
      
      console.log('Category stats calculated:', { 
        productCount, 
        subcategoryCount, 
        isParentCategory,
        allCategories: allCategories.length 
      });
    } catch (error) {
      console.error('Error fetching category stats:', error);
      console.error('Error details:', error.response?.data);
      // Don't show error for stats, just use defaults
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting category with ID:', id);
      const response = await apiClient.delete(`/api/admin/category/${id}`);
      console.log('Delete response:', response);

      if (response.success) {
        toast.success('Category deleted successfully!');
        router.push('/admin/categories');
      } else {
        toast.error(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      
      if (error.response?.status === 401) {
        toast.error('You are not authorized. Please login again.');
        router.push('/auth/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to delete this category.');
      } else {
        toast.error('Failed to delete category. Please try again.');
      }
    }
  };

  // Don't render anything if authentication is still loading or user is not admin
  if (isLoading || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout title="Category Details" subtitle="Loading category information...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Category Details" subtitle="Error loading category">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Category</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => router.push('/admin/categories')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
            <Button variant="outline" onClick={fetchCategory}>
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!category) {
    return (
      <AdminLayout title="Category Details" subtitle="Category not found">
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Category Not Found</h3>
          <p className="text-gray-600 mb-4">The category you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push('/admin/categories')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Category Details" subtitle={`Viewing ${category.name}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/categories">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Categories
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchCategoryStats}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Stats
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
            <p className="text-gray-600">Category ID: {category.id}</p>
            {/* Breadcrumb Navigation */}
            {category.parentId && parentCategory && (
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Link href="/admin/categories" className="hover:text-gray-700">Categories</Link>
                <span className="mx-2">/</span>
                <Link href={`/admin/categories/view/${parentCategory.id}`} className="hover:text-gray-700">
                  {parentCategory.name}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{category.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/categories/edit/${category.id}`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Category
            </Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Category
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Details */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Category Information</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900 text-lg font-semibold">{category.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{category.description}</p>
                </div>
                {category.parentId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                    <p className="text-gray-900">
                      {parentCategory ? parentCategory.name : 'Loading...'}
                    </p>
                    {parentCategory && (
                      <Link href={`/admin/categories/view/${parentCategory.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                        View Parent Category →
                      </Link>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Category Statistics */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Category Statistics</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.productCount}</div>
                    <div className="text-sm text-blue-600">Products</div>
                    {!category.parentId && stats.subcategoryCount > 0 && (
                      <div className="text-xs text-blue-500 mt-1">
                        (Includes products from subcategories)
                      </div>
                    )}
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.subcategoryCount}</div>
                    <div className="text-sm text-green-600">Subcategories</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Status</h3>
              </CardHeader>
              <CardBody>
                <div className="flex items-center space-x-2">
                  {!category.deletedAt ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700 font-medium">Inactive</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {!category.deletedAt 
                    ? "This category is currently available for use."
                    : "This category has been deleted and is not available for use."}
                </p>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Link href={`/admin/categories/edit/${category.id}`} className="block">
                  <Button className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Category
                  </Button>
                </Link>
                <Link href="/admin/products/create" className="block">
                  <Button variant="outline" className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
                {!category.parentId && (
                  <Link href={`/admin/categories/create?parentId=${category.id}`} className="block">
                    <Button variant="outline" className="w-full">
                      <Tag className="h-4 w-4 mr-2" />
                      Create Subcategory
                    </Button>
                  </Link>
                )}
                <Button variant="danger" className="w-full mt-2" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Category
                </Button>
              </CardBody>
            </Card>

            {/* Category Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Category Information</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category ID:</span>
                  <span className="font-mono text-sm">{category.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-sm">{new Date(category.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span className="text-sm">{new Date(category.updatedAt).toLocaleDateString()}</span>
                </div>
                {category.sortOrder && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sort Order:</span>
                    <span className="text-sm">{category.sortOrder}</span>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
