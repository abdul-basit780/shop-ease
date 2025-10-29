import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  Package,
  Menu,
  X,
  LogOut,
  Calendar
} from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import { useAdminAuth } from '../utils/adminAuth';

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

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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

// Enhanced Category Card Component
const CategoryCard = ({ category, onEdit, onDelete, onView, onCreateSubcategory, parentCategories, subcategories = [] }) => {
  const parentCategory = parentCategories.find(p => p.id === category.parentId);
  const isParentCategory = !category.parentId;
  const hasSubcategories = subcategories.length > 0;
  
  return (
    <Card className={`hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
      isParentCategory ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white' : 'border-l-4 border-l-green-500'
    }`}>
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isParentCategory 
                ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                : 'bg-gradient-to-br from-green-500 to-emerald-500'
            }`}>
              {isParentCategory ? (
                <Tag className="h-6 w-6 text-white" />
              ) : (
                <Tag className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
                {isParentCategory && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Parent
                  </span>
                )}
                {!isParentCategory && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Subcategory
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {category.productCount || 0} products
                {hasSubcategories && (
                  <span className="ml-2 text-blue-600">
                    • {subcategories.length} subcategories
                  </span>
                )}
              </p>
              <div className="mt-1 text-xs text-gray-400">
                <span className="font-medium">Parent ID:</span> 
                <span className={`ml-1 px-2 py-1 rounded ${
                  category.parentId === null || category.parentId === undefined 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {category.parentId === null ? 'null' : category.parentId === undefined ? 'undefined' : category.parentId}
                </span>
              </div>
              {parentCategory && (
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-400">└─</span>
                  <span className="text-xs text-blue-600 ml-1">
                    Subcategory of: {parentCategory.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isParentCategory && (
              <span className="text-xs text-gray-500">
                {subcategories.length} subcategories
              </span>
            )}
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {category.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {category.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            category.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {category.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="text-xs text-gray-500">
            Created {new Date(category.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="space-y-3">
          {/* Category Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
            <span>Status: {category.isActive ? 'Active' : 'Inactive'}</span>
            <span>Sort: {category.sortOrder || 0}</span>
            <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(category)}
              className="flex-1"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(category)}
              className="flex-1"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(category)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Create Subcategory Button for Top-Level Categories */}
          {isParentCategory && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
              onClick={() => onCreateSubcategory(category)}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 rounded-xl transition-all duration-200 hover:shadow-md group"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Tag className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium">Add Subcategory</span>
                </div>
              </button>
            </div>
          )}

          {/* Subcategories List */}
          {hasSubcategories && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Subcategories</p>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  {subcategories.length}
                </span>
              </div>
              <div className="space-y-2">
                {subcategories.slice(0, 3).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Tag className="h-2 w-2 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                      {sub.productCount || 0} products
                    </span>
                  </div>
                ))}
                {subcategories.length > 3 && (
                  <div className="text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    +{subcategories.length - 3} more subcategories
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Main Categories Component
export default function CategoriesPage() {
  const router = useRouter();
  const { isLoading, isAdmin } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedParent, setSelectedParent] = useState(null);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const [categorySubcategories, setCategorySubcategories] = useState({});


  const fetchParentCategories = async () => {
    try {
      // Try with /api prefix first, fallback to direct call
      let response;
      try {
        response = await apiClient.get('/api/admin/category?parentId=null&limit=100');
      } catch (error) {
        response = await apiClient.get('/api/admin/category?parentId=null&limit=100');
      }
      
      if (response.success) {
        const parents = response.data?.categories || response.categories || [];
        setParentCategories(parents);
      }
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

  const fetchProductCounts = async (categories) => {
    try {
      console.log('Fetching product counts for categories:', categories.length);
      
      // Fetch product counts for each category
      const productCountPromises = categories.map(async (category) => {
        try {
          const response = await apiClient.get(`/api/admin/product?categoryId=${category.id}&limit=1`);
          const count = response.data?.pagination?.total || 0;
          console.log(`Category ${category.name}: ${count} products`);
          return { id: category.id, productCount: count };
        } catch (error) {
          console.error(`Error fetching product count for category ${category.name}:`, error);
          return { id: category.id, productCount: 0 };
        }
      });
      
      const productCounts = await Promise.all(productCountPromises);
      console.log('Product counts fetched:', productCounts);
      
      // Update categories with product counts
      setCategories(prevCategories => 
        prevCategories.map(category => {
          const countData = productCounts.find(pc => pc.id === category.id);
          return {
            ...category,
            productCount: countData?.productCount || 0
          };
        })
      );
      
      // Update parent categories with product counts
      setParentCategories(prevParentCategories =>
        prevParentCategories.map(category => {
          const countData = productCounts.find(pc => pc.id === category.id);
          return {
            ...category,
            productCount: countData?.productCount || 0
          };
        })
      );
      
      // Update subcategories with product counts
      setCategorySubcategories(prevSubcategories => {
        const updatedSubcategories = { ...prevSubcategories };
        Object.keys(updatedSubcategories).forEach(parentId => {
          updatedSubcategories[parentId] = updatedSubcategories[parentId].map(subcategory => {
            const countData = productCounts.find(pc => pc.id === subcategory.id);
            return {
              ...subcategory,
              productCount: countData?.productCount || 0
            };
          });
        });
        return updatedSubcategories;
      });
      
    } catch (error) {
      console.error('Error fetching product counts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      setRefreshing(true);
      
      // Fetch ALL categories first (no filtering)
      // Try with /api prefix first, fallback to direct call
      let response;
      try {
        // Try with explicit parameters to ensure parentId is included
        response = await apiClient.get('/api/admin/category?limit=100&includeDeleted=false');
      } catch (error) {
        response = await apiClient.get('/api/admin/category?limit=100&includeDeleted=false');
      }
      
      
      if (response.success) {
        const allCategories = response.data?.categories || response.categories || [];
        
        
        
        // Process all categories using the correct API format
        const processedCategories = allCategories.map(cat => {
          // Use the parentId directly from API (matching Swagger format)
          const parentId = cat.parentId;
          const isParentCategory = parentId === null || parentId === undefined;
          
          return {
            ...cat,
            parentId: parentId,
            isParentCategory: isParentCategory
          };
        });
        
        // Check if we have any subcategories
        const subcategoriesFound = processedCategories.filter(cat => cat.parentId);
        
        // Separate parent and subcategories
        const parentCats = processedCategories.filter(cat => !cat.parentId);
        const subCats = processedCategories.filter(cat => cat.parentId);
        
        
        // Force check: Look for any category that might be a subcategory but not detected
        console.log('=== FORCE CHECK FOR SUBCATEGORIES ===');
        const potentialSubcategories = processedCategories.filter(cat => {
          // Check if category name suggests it's a subcategory
          const isPotentialSub = cat.name.toLowerCase().includes('sub') || 
                                 cat.name.toLowerCase().includes('test') ||
                                 cat.name.toLowerCase().includes('child');
          console.log(`Category "${cat.name}" - potential sub: ${isPotentialSub}, parentId: ${cat.parentId}`);
          return isPotentialSub;
        });
        console.log('Potential subcategories found:', potentialSubcategories);
        
        // Check if the newly created subcategory is in the list
        const recentSubcategory = allCategories.find(cat => 
          cat.name && cat.name.includes('Test Subcategory')
        );
        if (recentSubcategory) {
          console.log('=== FOUND RECENT SUBCATEGORY ===');
          console.log('Recent subcategory:', recentSubcategory);
          console.log('Recent subcategory fields:', Object.keys(recentSubcategory));
          console.log('Recent subcategory parentId:', recentSubcategory.parentId);
          console.log('Recent subcategory parent_id:', recentSubcategory.parent_id);
          console.log('Recent subcategory parentCategoryId:', recentSubcategory.parentCategoryId);
          console.log('Recent subcategory parentCategory:', recentSubcategory.parentCategory);
          
          // Deep check for any parent-related field
          console.log('=== DEEP CHECK FOR PARENT FIELDS ===');
          const deepCheck = JSON.parse(JSON.stringify(recentSubcategory));
          console.log('Deep check result:', deepCheck);
          console.log('Deep check keys:', Object.keys(deepCheck));
          
          // Check if parentId is in the raw response but not in the processed object
          console.log('Raw response for recent subcategory:');
          const rawResponse = response.data?.categories || response.categories || [];
          const rawSubcategory = rawResponse.find(cat => 
            cat.name && cat.name.includes('Test Subcategory')
          );
          if (rawSubcategory) {
            console.log('Raw subcategory:', rawSubcategory);
            console.log('Raw subcategory parentId:', rawSubcategory.parentId);
            console.log('Raw subcategory parent_id:', rawSubcategory.parent_id);
          }
        } else {
          console.log('=== NO RECENT SUBCATEGORY FOUND ===');
          console.log('All category names:', allCategories.map(c => c.name));
        }
        
        // Group subcategories by parent ID
        const subcategoriesMap = {};
        subCats.forEach(cat => {
          if (cat.parentId) {
          if (!subcategoriesMap[cat.parentId]) {
            subcategoriesMap[cat.parentId] = [];
          }
          subcategoriesMap[cat.parentId].push(cat);
          }
        });
        
        console.log('=== SUBCATEGORIES MAP ===');
        console.log('Subcategories map:', subcategoriesMap);
        console.log('Subcategories map keys:', Object.keys(subcategoriesMap));
        console.log('Subcategories map values:', Object.values(subcategoriesMap));
        
        // Apply filtering based on current view mode
        let filteredCategories = [];
        
        if (showSubcategories && selectedParent === null) {
          // Show only subcategories
          filteredCategories = subCats;
        } else if (selectedParent) {
          // Show subcategories of specific parent
          filteredCategories = subCats.filter(cat => cat.parentId === selectedParent);
        } else {
          // Default: Show only parent categories
          filteredCategories = parentCats;
        }
        
        
        setCategories(filteredCategories);
        setParentCategories(parentCats);
        setCategorySubcategories(subcategoriesMap);
        setTotalPages(response.data?.pagination?.totalPages || response.pagination?.totalPages || 1);
        
        // Fetch product counts for all categories
        fetchProductCounts(allCategories);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('You are not authorized. Please login again.');
        router.push('/auth/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view categories.');
      } else {
        toast.error('Failed to load categories. Please check your connection.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCategories();
    }
  }, [currentPage, searchTerm, selectedParent, showSubcategories, isAdmin]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (category) => {
    router.push(`/admin/categories/edit/${category.id}`);
  };

  const handleView = (category) => {
    router.push(`/admin/categories/view/${category.id}`);
  };

  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        const response = await apiClient.delete(`/api/admin/category/${category.id}`);
        if (response.success) {
          toast.success('Category deleted successfully');
          fetchCategories();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const handleRefresh = () => {
    fetchCategories();
  };

  const handleParentFilter = (parentId) => {
    setSelectedParent(parentId);
    setCurrentPage(1);
  };

  const handleShowSubcategories = () => {
    setShowSubcategories(!showSubcategories);
    setSelectedParent(null);
    setCurrentPage(1);
  };

  const handleCreateSubcategory = (parentCategory) => {
    router.push(`/admin/categories/create?parentId=${parentCategory.id}`);
  };

  // Don't render anything if authentication is still loading or user is not admin
  if (isLoading || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout title="Categories" subtitle="Loading your categories...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Categories" subtitle="Manage your product categories and organization">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Categories</h2>
          <p className="text-gray-600">Organize your products with categories</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/admin/categories/create">
            <Button variant="primary">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleRefresh}
            isLoading={refreshing}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>


            {/* Subcategory Controls */}
            <div className="flex items-center space-x-4">
              {/* Parent Category Filter */}
              <select
                value={selectedParent || ''}
                onChange={(e) => handleParentFilter(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="null">Top Level Only</option>
                {parentCategories.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>

              {/* Show Subcategories Toggle */}
              <button
                onClick={handleShowSubcategories}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showSubcategories
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Tag className="h-4 w-4 inline mr-2" />
                {showSubcategories ? 'Show All Categories' : 'Show Subcategories Only'}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Categories Grid/List */}
      {categories.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first category'
                }
              </p>
              <Link href="/admin/categories/create">
                <Button variant="primary">
                  <Plus className="h-4 w-4" />
                  Add Your First Category
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  onCreateSubcategory={handleCreateSubcategory}
                  parentCategories={parentCategories}
                  subcategories={categorySubcategories[category.id] || []}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {categories.map((category) => {
                const parentCategory = parentCategories.find(p => p.id === category.parentId);
                const isParentCategory = !category.parentId;
                const subcategories = categorySubcategories[category.id] || [];
                
                return (
                  <Card key={category.id} className={`hover:shadow-lg transition-all duration-300 ${
                    isParentCategory 
                      ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white' 
                      : 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white'
                  }`}>
                    <CardBody>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {category.name}
                            </h3>
                            {isParentCategory ? (
                              <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                Parent
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                Subcategory
                              </span>
                            )}
                          </div>
                            
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {category.description || 'No description provided'}
                          </p>

                          {/* Hierarchy Info */}
                          {parentCategory && (
                            <div className="flex items-center text-xs text-blue-600 mb-2">
                              <span className="mr-1">└─</span>
                              <span>Subcategory of: {parentCategory.name}</span>
                            </div>
                          )}

                          {/* Stats Row */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Tag className="h-4 w-4 mr-1" />
                              {category.productCount || 0} products
                            </span>
                            {subcategories.length > 0 && (
                              <span className="flex items-center">
                                <span className="mr-1">└─</span>
                                {subcategories.length} subcategories
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(category)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isParentCategory && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateSubcategory(category)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}