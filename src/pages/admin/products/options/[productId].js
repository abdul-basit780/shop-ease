import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { 
  Package, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  AlertCircle,
  CheckCircle,
  Menu,
  LogOut,
  Tag,
  DollarSign,
  Package2
} from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

// Layout Component
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

export default function ProductOptions() {
  const router = useRouter();
  const { productId } = router.query;
  const [product, setProduct] = useState(null);
  const [optionTypes, setOptionTypes] = useState([]);
  const [optionTypeStats, setOptionTypeStats] = useState({}); // Store stats for each option type
  const [loading, setLoading] = useState(true);
  const [showCreateOptionType, setShowCreateOptionType] = useState(false);
  const [newOptionType, setNewOptionType] = useState({ name: '' });

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchOptionTypes();
    }
  }, [productId]);

  useEffect(() => {
    // Fetch stats for all option types when they change
    if (optionTypes.length > 0 && product) {
      fetchAllOptionTypeStats();
    }
  }, [optionTypes, product]);

  const fetchProduct = async () => {
    try {
      console.log('Fetching product:', productId);
      const response = await apiClient.get(`/api/admin/product/${productId}`);
      console.log('Product response:', response);

      if (response.success) {
        setProduct(response.product || response.data);
      } else {
        console.error('Failed to fetch product:', response.message);
        toast.error('Failed to load product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    }
  };

  const fetchOptionTypes = async () => {
    try {
      console.log('Fetching option types for product:', productId);
      const response = await apiClient.get(`/api/admin/option-type?productId=${productId}`);
      console.log('Option types response:', response);
      if (response.success) {
        setOptionTypes(response.data?.optionTypes || []);
      } else {
        console.error('Failed to fetch option types:', response.message);
      }
    } catch (error) {
      console.error('Error fetching option types:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOptionTypeStats = async () => {
    try {
      console.log('Fetching stats for option types:', optionTypes);
      const statsPromises = optionTypes.map(async (optionType) => {
        try {
          const optionTypeId = optionType.id || optionType._id;
          console.log(`Fetching values for option type: ${optionTypeId}`);
          const response = await apiClient.get(`/api/admin/option-value?optionTypeId=${optionTypeId}`);
          console.log(`Response for option type ${optionTypeId}:`, response);
          
          if (response.success) {
            const values = response.data?.optionValues || response.optionValues || [];
            console.log(`Found ${values.length} values for option type ${optionTypeId}:`, values);
            
            // Calculate stats
            const valueCount = values.length;
            const totalStock = values.reduce((sum, val) => sum + (parseInt(val.stock) || 0), 0);
            
            // Calculate price adjustment range (just the adjustments, not full prices)
            const priceAdjustments = values.map(val => parseFloat(val.price) || 0).filter(adj => !isNaN(adj));
            const minAdjustment = priceAdjustments.length > 0 ? Math.min(...priceAdjustments) : 0;
            const maxAdjustment = priceAdjustments.length > 0 ? Math.max(...priceAdjustments) : 0;
            
            return {
              optionTypeId: optionTypeId,
              valueCount,
              totalStock,
              minAdjustment: isNaN(minAdjustment) ? 0 : minAdjustment,
              maxAdjustment: isNaN(maxAdjustment) ? 0 : maxAdjustment,
              values: values // Store values for display in table
            };
          }
          console.warn(`No success response for option type ${optionTypeId}`);
          return {
            optionTypeId: optionTypeId,
            valueCount: 0,
            totalStock: 0,
            minAdjustment: 0,
            maxAdjustment: 0,
            values: []
          };
        } catch (error) {
          console.error(`Error fetching stats for option type ${optionType.id}:`, error);
          return {
            optionTypeId: optionType.id || optionType._id,
            valueCount: 0,
            totalStock: 0,
            minAdjustment: 0,
            maxAdjustment: 0,
            values: []
          };
        }
      });
      
      const statsResults = await Promise.all(statsPromises);
      console.log('All stats results:', statsResults);
      const statsMap = {};
      statsResults.forEach(stat => {
        statsMap[stat.optionTypeId] = stat;
      });
      console.log('Stats map:', statsMap);
      setOptionTypeStats(statsMap);
    } catch (error) {
      console.error('Error fetching option type stats:', error);
    }
  };

  const handleCreateOptionType = async (e) => {
    e.preventDefault();
    
    if (!newOptionType.name.trim()) {
      toast.error('Option type name is required');
      return;
    }

    try {
      console.log('Creating option type:', newOptionType);
      const response = await apiClient.post('/api/admin/option-type', {
        productId: productId,
        name: newOptionType.name.trim()
      });
      console.log('Create option type response:', response);
      if (response.success) {
        toast.success('Option type created successfully!');
        setNewOptionType({ name: '' });
        setShowCreateOptionType(false);
        await fetchOptionTypes();
        // Stats will be fetched automatically via useEffect
      } else {
        toast.error(response.message || 'Failed to create option type');
      }
    } catch (error) {
      console.error('Error creating option type:', error);
      toast.error('Failed to create option type');
    }
  };

  const handleDeleteOptionType = async (optionTypeId) => {
    if (!confirm('Are you sure you want to delete this option type? This will also delete all its values.')) {
      return;
    }

    try {
      console.log('Deleting option type:', optionTypeId);
      const response = await apiClient.delete(`/api/admin/option-type/${optionTypeId}`);
      console.log('Delete option type response:', response);
      if (response.success) {
        toast.success('Option type deleted successfully!');
        await fetchOptionTypes();
        // Stats will be updated automatically via useEffect
      } else {
        toast.error(response.message || 'Failed to delete option type');
      }
    } catch (error) {
      console.error('Error deleting option type:', error);
      toast.error('Failed to delete option type');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Product Options" subtitle="Loading product options...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Product Options" subtitle={`Manage variants for ${product?.name || 'Product'}`}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4">
          <Link href="/admin/products" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product Options</h2>
            <p className="text-gray-600">{product?.name || 'Product'}</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateOptionType(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Option Type
        </Button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Create Option Type Modal */}
        {showCreateOptionType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Create Option Type</h3>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleCreateOptionType} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option Type Name *
                    </label>
                    <input
                      type="text"
                      value={newOptionType.name}
                      onChange={(e) => setNewOptionType({ name: e.target.value })}
                      placeholder="e.g., Size, Color, Dimensions"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Examples: Size, Color, Material, Dimensions
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button type="submit" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Option Type
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateOptionType(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Option Types List */}
        {optionTypes.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Option Types</h3>
              <p className="text-gray-600 mb-6">
                This product doesn't have any option types yet. Add option types like Size, Color, or Dimensions to create product variants.
              </p>
              <Button onClick={() => setShowCreateOptionType(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Option Type
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-6">
            {optionTypes.map((optionType) => (
              <Card key={optionType.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Tag className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{optionType.name}</h3>
                        <p className="text-sm text-gray-600">Option Type</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:items-center">
                      <Link href={`/admin/products/options/${productId}/values/${optionType.id}`} className="flex-1 sm:flex-initial">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Edit className="h-4 w-4 mr-2" />
                          Manage Values
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDeleteOptionType(optionType.id)}
                        className="flex-1 sm:flex-initial w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {optionTypeStats[optionType.id]?.valueCount || 0}
                      </div>
                      <div className="text-sm text-blue-600">Values</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {optionTypeStats[optionType.id]?.totalStock || 0}
                      </div>
                      <div className="text-sm text-green-600">Total Stock</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm font-semibold text-purple-700 mb-3 text-center">Price Adjustments</div>
                      {(() => {
                        const optionTypeId = optionType.id || optionType._id;
                        const stats = optionTypeStats[optionTypeId];
                        const basePrice = parseFloat(product?.price) || 0;
                        
                        if (!stats) {
                          return (
                            <div className="text-center text-gray-500 text-sm py-2">Loading...</div>
                          );
                        }
                        
                        const values = stats.values || [];
                        if (values.length === 0 || stats.valueCount === 0) {
                          return (
                            <div className="text-center text-gray-500 text-sm py-2">No values</div>
                          );
                        }
                        
                        return (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {values.map((value, idx) => {
                              const adjustment = parseFloat(value.price);
                              if (isNaN(adjustment)) {
                                return null;
                              }
                              
                              const totalPrice = basePrice + adjustment;
                              const isPositive = adjustment >= 0;
                              const adjustmentDisplay = Math.abs(adjustment).toFixed(2);
                              const valueName = value.value || value.name || `Value ${idx + 1}`;
                              
                              return (
                                <div key={value.id || value._id || idx} className="bg-white rounded-md p-2.5 border border-purple-100 hover:border-purple-200 transition-colors">
                                  <div className="text-sm font-semibold text-gray-800 mb-1.5">{valueName}</div>
                                  <div className="grid grid-cols-1 gap-1 text-xs text-gray-600 sm:flex sm:items-center sm:justify-between sm:space-x-2">
                                    <div className="flex items-center gap-1">
                                      <span>Base:</span>
                                      <span className="font-medium text-gray-700">${basePrice.toFixed(2)}</span>
                                    </div>
                                    <span className="hidden sm:inline text-gray-400">+</span>
                                    <div className="flex items-center gap-1">
                                      <span>Adjustment:</span>
                                      <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {isPositive ? '+' : '-'}${adjustmentDisplay}
                                      </span>
                                    </div>
                                    <span className="hidden sm:inline text-gray-400">=</span>
                                    <div className="flex items-center gap-1">
                                      <span>Total:</span>
                                      <span className="font-semibold text-purple-700">${totalPrice.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
