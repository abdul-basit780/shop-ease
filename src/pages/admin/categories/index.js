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
      const response = await apiClient.get('/admin/category?parentId=null&limit=100');
      if (response.success) {
        const parents = response.data?.categories || response.categories || [];
        setParentCategories(parents);
      }
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      setRefreshing(true);
      
      // Fetch ALL categories first (no filtering)
      const response = await apiClient.get('/admin/category?limit=100');
      
      console.log('=== FULL API RESPONSE ===');
      console.log('Response:', response);
      console.log('Response data:', response.data);
      console.log('Response categories:', response.categories);
      
      if (response.success) {
        const allCategories = response.data?.categories || response.categories || [];
        
        console.log('=== ALL CATEGORIES FROM API ===');
        console.log('Raw categories:', allCategories);
        console.log('First category structure:', allCategories[0]);
        console.log('All category field names:', allCategories.map(cat => Object.keys(cat)));
        console.log('Sample category with all fields:', allCategories[0]);
        
        // Check if parentId is in the response but with different structure
        console.log('=== CHECKING FOR PARENTID IN RESPONSE ===');
        allCategories.forEach((cat, index) => {
          console.log(`Category ${index} (${cat.name}):`);
          console.log('  - Direct parentId:', cat.parentId);
          console.log('  - Direct parent_id:', cat.parent_id);
          console.log('  - Direct parentCategoryId:', cat.parentCategoryId);
          console.log('  - Direct parentCategory:', cat.parentCategory);
          console.log('  - All direct properties:', Object.getOwnPropertyNames(cat));
          console.log('  - JSON stringified:', JSON.stringify(cat));
        });
        
        // Process all categories and check for parentId field
        const processedCategories = allCategories.map(cat => {
          console.log('Processing category:', cat.name);
          console.log('  - parentId:', cat.parentId);
          console.log('  - parent_id:', cat.parent_id);
          console.log('  - parentCategoryId:', cat.parentCategoryId);
          console.log('  - parentCategory:', cat.parentCategory);
          console.log('  - has parentId field:', 'parentId' in cat);
          console.log('  - has parent_id field:', 'parent_id' in cat);
          console.log('  - has parentCategoryId field:', 'parentCategoryId' in cat);
          console.log('  - has parentCategory field:', 'parentCategory' in cat);
          console.log('  - All fields:', Object.keys(cat));
          
          // Try different possible field names for parent relationship
          const parentId = cat.parentId || cat.parent_id || cat.parentCategoryId || cat.parentCategory || null;
          
          console.log('  - Final parentId:', parentId);
          console.log('  - Is parent category:', !parentId);
          
          return {
            ...cat,
            parentId: parentId,
            isParentCategory: !parentId
          };
        });
        
        console.log('=== PROCESSED CATEGORIES ===');
        console.log('Processed:', processedCategories.map(c => ({ 
          id: c.id, 
          name: c.name, 
          parentId: c.parentId, 
          isParent: !c.parentId,
          hasParentIdField: 'parentId' in c
        })));
        
        // Separate parent and subcategories
        const parentCats = processedCategories.filter(cat => !cat.parentId);
        const subCats = processedCategories.filter(cat => cat.parentId);
        
        console.log('=== SEPARATED CATEGORIES ===');
        console.log('Parent categories:', parentCats.map(p => ({ id: p.id, name: p.name })));
        console.log('Subcategories:', subCats.map(s => ({ id: s.id, name: s.name, parentId: s.parentId })));
        console.log('Subcategories count:', subCats.length);
        
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
          console.log('Filtering: Show only subcategories');
        } else if (selectedParent) {
          // Show subcategories of specific parent
          filteredCategories = subCats.filter(cat => cat.parentId === selectedParent);
          console.log('Filtering: Show subcategories of parent', selectedParent);
        } else {
          // Default: Show only parent categories
          filteredCategories = parentCats;
          console.log('Filtering: Show only parent categories');
        }
        
        console.log('=== FINAL FILTERED CATEGORIES ===');
        console.log('Filtered categories:', filteredCategories.map(c => ({ id: c.id, name: c.name, parentId: c.parentId })));
        
        setCategories(filteredCategories);
        setParentCategories(parentCats);
        setCategorySubcategories(subcategoriesMap);
        setTotalPages(response.data?.pagination?.totalPages || response.pagination?.totalPages || 1);
      } else {
        console.error('API failed:', response);
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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
    fetchCategories();
  }, [currentPage, searchTerm, selectedParent, showSubcategories]);

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
        const response = await apiClient.delete(`/admin/category/${category.id}`);
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
          <Button
            variant="outline"
            onClick={handleRefresh}
            isLoading={refreshing}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              console.log('=== MANUAL DEBUG ===');
              console.log('Current categories:', categories);
              console.log('Parent categories:', parentCategories);
              console.log('Category subcategories:', categorySubcategories);
              fetchCategories();
            }}
          >
            Debug
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              console.log('=== COMPREHENSIVE SUBCATEGORY TEST ===');
              console.log('Starting comprehensive test...');
              
              if (parentCategories.length === 0) {
                console.log('❌ No parent categories available');
                toast.error('No parent categories available for testing');
                return;
              }
              
              const parentCategory = parentCategories[0];
              console.log('✅ Using parent category:', parentCategory);
              
              // Test 1: Check current API response structure
              console.log('=== TEST 1: CHECKING CURRENT API RESPONSE ===');
              try {
                const currentResponse = await apiClient.get('/admin/category?limit=5');
                console.log('Current API response:', currentResponse);
                console.log('Current categories structure:', currentResponse.data?.categories?.[0]);
                console.log('Available fields in first category:', Object.keys(currentResponse.data?.categories?.[0] || {}));
              } catch (error) {
                console.error('Error fetching current categories:', error);
              }
              
              // Test 2: Try creating subcategory with different field names
              console.log('=== TEST 2: CREATING SUBCATEGORY ===');
              const uniqueName = 'TEST_SUBCATEGORY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
              const testData = {
                name: uniqueName,
                description: 'Test subcategory for debugging - ' + new Date().toISOString(),
                parentId: parentCategory.id,
                parent_id: parentCategory.id,
                parentCategoryId: parentCategory.id,
                parentCategory: parentCategory.id
              };
              
              console.log('📤 Sending test data:', testData);
              console.log('📤 Parent category ID:', parentCategory.id);
              console.log('📤 Parent category name:', parentCategory.name);
              
              try {
                const response = await apiClient.post('/admin/category', testData);
                console.log('📥 Backend response:', response);
                console.log('📥 Response success:', response.success);
                console.log('📥 Response data:', response.data);
                console.log('📥 Response category:', response.category);
                
                if (response.success) {
                  console.log('✅ Subcategory created successfully');
                  toast.success('Test subcategory created! Checking response...');
                  
                  // Test 3: Check if the created subcategory has parentId
                  console.log('=== TEST 3: CHECKING CREATED SUBCATEGORY ===');
                  const createdCategory = response.data || response.category;
                  console.log('Created category:', createdCategory);
                  console.log('Created category fields:', Object.keys(createdCategory || {}));
                  console.log('Created category parentId:', createdCategory?.parentId);
                  console.log('Created category parent_id:', createdCategory?.parent_id);
                  console.log('Created category parentCategoryId:', createdCategory?.parentCategoryId);
                  console.log('Created category parentCategory:', createdCategory?.parentCategory);
                  
                  // Check if parentId is in the raw response
                  console.log('Full response object:', response);
                  console.log('Response data type:', typeof response.data);
                  console.log('Response data keys:', Object.keys(response.data || {}));
                  
                  // Check if parentId is nested somewhere
                  if (response.data && typeof response.data === 'object') {
                    console.log('Checking nested parentId fields...');
                    console.log('data.parentId:', response.data.parentId);
                    console.log('data.parent_id:', response.data.parent_id);
                    console.log('data.parentCategoryId:', response.data.parentCategoryId);
                    console.log('data.parentCategory:', response.data.parentCategory);
                  }
                  
                  // Test 4: Fetch all categories again to see if parentId is preserved
                  console.log('=== TEST 4: FETCHING ALL CATEGORIES AFTER CREATION ===');
                  setTimeout(async () => {
                    try {
                      const updatedResponse = await apiClient.get('/admin/category?limit=100');
                      console.log('Updated API response:', updatedResponse);
                      const allCategories = updatedResponse.data?.categories || updatedResponse.categories || [];
                      const testCategory = allCategories.find(cat => cat.name && cat.name.includes('TEST_SUBCATEGORY_'));
                      if (testCategory) {
                        console.log('✅ Found test category in API response:', testCategory);
                        console.log('Test category parentId:', testCategory.parentId);
                        console.log('Test category parent_id:', testCategory.parent_id);
                        console.log('Test category all fields:', Object.keys(testCategory));
                        
                        // Test 5: Try to fetch the specific category by ID
                        console.log('=== TEST 5: FETCHING SPECIFIC CATEGORY BY ID ===');
                        try {
                          const specificResponse = await apiClient.get(`/admin/category/${testCategory.id}`);
                          console.log('Specific category response:', specificResponse);
                          console.log('Specific category data:', specificResponse.data);
                          console.log('Specific category fields:', Object.keys(specificResponse.data || {}));
                          console.log('Specific category parentId:', specificResponse.data?.parentId);
                          console.log('Specific category parent_id:', specificResponse.data?.parent_id);
                        } catch (error) {
                          console.error('Error fetching specific category:', error);
                        }
                      } else {
                        console.log('❌ Test category not found in API response');
                        console.log('All category names:', allCategories.map(c => c.name));
                      }
                    } catch (error) {
                      console.error('Error fetching updated categories:', error);
                    }
                  }, 2000);
                  
                } else {
                  console.error('❌ Failed to create test subcategory:', response);
                  toast.error('Failed to create test subcategory: ' + (response.message || 'Unknown error'));
                }
              } catch (error) {
                console.error('❌ Error creating test subcategory:', error);
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);
                
                if (error.response?.status === 409) {
                  console.error('409 Conflict - Category might already exist or there is a naming conflict');
                  console.error('Conflict details:', error.response?.data);
                  toast.error('Conflict: Category might already exist or there is a naming conflict');
                } else if (error.response?.status === 400) {
                  console.error('400 Bad Request - Validation error');
                  console.error('Validation details:', error.response?.data);
                  toast.error('Validation error: ' + (error.response?.data?.message || 'Invalid data'));
                } else {
                  toast.error('Error creating test subcategory: ' + error.message);
                }
              }
            }}
          >
            🔬 Full Test
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              console.log('=== API ENDPOINT TEST ===');
              try {
                // Test the health endpoint
                const healthResponse = await apiClient.get('/api/health');
                console.log('Health check:', healthResponse);
                
                // Test a simple GET request
                const testResponse = await apiClient.get('/admin/category?limit=1');
                console.log('Simple GET test:', testResponse);
                console.log('Response structure:', {
                  success: testResponse.success,
                  data: testResponse.data,
                  categories: testResponse.categories,
                  message: testResponse.message
                });
                
                toast.success('API test completed - check console');
              } catch (error) {
                console.error('API test failed:', error);
                toast.error('API test failed: ' + error.message);
              }
            }}
          >
            🔍 API Test
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              console.log('=== MANUAL PARENTID TEST ===');
              if (categories.length > 0 && parentCategories.length > 0) {
                // Manually create a test subcategory in memory
                const testSubcategory = {
                  ...categories[0],
                  id: 'test-subcategory-' + Date.now(),
                  name: 'Manual Test Subcategory',
                  description: 'This is a manually created test subcategory',
                  parentId: parentCategories[0].id,
                  isParentCategory: false
                };
                
                console.log('Manually created subcategory:', testSubcategory);
                
                // Add it to the categories list temporarily
                const updatedCategories = [...categories, testSubcategory];
                setCategories(updatedCategories);
                
                // Update subcategories map
                const updatedSubcategoriesMap = { ...categorySubcategories };
                if (!updatedSubcategoriesMap[parentCategories[0].id]) {
                  updatedSubcategoriesMap[parentCategories[0].id] = [];
                }
                updatedSubcategoriesMap[parentCategories[0].id].push(testSubcategory);
                setCategorySubcategories(updatedSubcategoriesMap);
                
                console.log('Updated categories:', updatedCategories);
                console.log('Updated subcategories map:', updatedSubcategoriesMap);
                
                toast.success('Manual subcategory added - check if it shows correctly');
              } else {
                toast.error('No categories available for manual test');
              }
            }}
          >
            🧪 Manual Test
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              console.log('=== SIMPLE SUBCATEGORY TEST ===');
              if (parentCategories.length === 0) {
                toast.error('No parent categories available');
                return;
              }
              
              const simpleData = {
                name: 'Simple Test ' + Date.now(),
                description: 'Simple test subcategory',
                parentId: parentCategories[0].id
              };
              
              console.log('Simple test data:', simpleData);
              
              try {
                const response = await apiClient.post('/admin/category', simpleData);
                console.log('Simple test response:', response);
                toast.success('Simple subcategory created!');
                setTimeout(() => fetchCategories(), 1000);
              } catch (error) {
                console.error('Simple test error:', error);
                console.error('Error details:', {
                  status: error.status,
                  data: error.data,
                  message: error.message
                });
                toast.error('Simple test failed: ' + error.message);
              }
            }}
          >
            🔧 Simple Test
          </Button>
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/admin/categories/create">
            <Button variant="primary">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
            <Tag className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Parent Categories</p>
              <p className="text-2xl font-bold">{parentCategories.length}</p>
            </div>
            <Tag className="h-8 w-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Subcategories</p>
              <p className="text-2xl font-bold">
                {Object.values(categorySubcategories).reduce((total, subs) => total + subs.length, 0)}
              </p>
            </div>
            <Tag className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Products</p>
              <p className="text-2xl font-bold">
                {categories.reduce((total, cat) => total + (cat.productCount || 0), 0)}
              </p>
            </div>
            <Tag className="h-8 w-8 text-orange-200" />
          </div>
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

      {/* Debug Information */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Information</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Total Categories: {categories.length}</div>
          <div>Parent Categories: {parentCategories.length}</div>
          <div>Subcategories: {Object.values(categorySubcategories).reduce((total, subs) => total + subs.length, 0)}</div>
          <div>Show Subcategories: {showSubcategories ? 'Yes' : 'No'}</div>
          <div>Selected Parent: {selectedParent || 'None'}</div>
        </div>
      </div>

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
              <div className="text-sm text-gray-500 mb-4">
                Debug: Categories array length: {categories.length}
              </div>
              <button 
                onClick={() => {
                  console.log('=== MANUAL TEST ===');
                  fetchCategories();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test API Call
              </button>
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
                      <div className="flex items-center justify-between">
                        {/* Left Section - Category Info */}
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Category Icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isParentCategory 
                              ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                              : 'bg-gradient-to-br from-green-500 to-emerald-500'
                          }`}>
                            <Tag className="h-6 w-6 text-white" />
                          </div>

                          {/* Category Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
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
                                <span className="flex items-center text-blue-600">
                                  <Tag className="h-4 w-4 mr-1" />
                                  {subcategories.length} subcategories
                                </span>
                              )}
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(category.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Subcategories Preview */}
                            {subcategories.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm font-medium text-gray-700">Subcategories</p>
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    {subcategories.length}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {subcategories.slice(0, 4).map((sub) => (
                                    <div key={sub.id} className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 text-xs rounded-full">
                                      <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                        <Tag className="h-1.5 w-1.5 text-white" />
                                      </div>
                                      <span className="font-medium">{sub.name}</span>
                                    </div>
                                  ))}
                                  {subcategories.length > 4 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                      +{subcategories.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Section - Status and Actions */}
                        <div className="flex items-center space-x-4">
                          {/* Status */}
                          <div className="text-right">
                            <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                              category.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Sort: {category.sortOrder || 0}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(category)}
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(category)}
                              className="hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {isParentCategory && (
                              <button
                                onClick={() => handleCreateSubcategory(category)}
                                className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 rounded-lg transition-all duration-200 hover:shadow-sm group"
                                title="Create Subcategory"
                              >
                                <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                  <Tag className="h-3 w-3 text-white" />
                                </div>
                              </button>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(category)}
                              className="hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
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
        </>
      )}
    </AdminLayout>
  );
}
