import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
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
  Package2,
  Save,
  X
} from 'lucide-react';
import { apiClient } from '../../../../../../lib/api-client';

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

export default function OptionValues() {
  const router = useRouter();
  const { productId, optionTypeId } = router.query;
  const [product, setProduct] = useState(null);
  const [optionType, setOptionType] = useState(null);
  const [optionValues, setOptionValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateValue, setShowCreateValue] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  const [newValue, setNewValue] = useState({ 
    value: '', 
    price: 0, 
    stock: 0 
  });

  useEffect(() => {
    if (productId && optionTypeId) {
      fetchProduct();
      fetchOptionType();
      fetchOptionValues();
    }
  }, [productId, optionTypeId]);

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/api/admin/product/${productId}`);
      if (response.success) {
        setProduct(response.product || response.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchOptionType = async () => {
    try {
      const response = await apiClient.get(`/admin/option-type/${optionTypeId}`);
      if (response.success) {
        setOptionType(response.optionType || response.data);
      }
    } catch (error) {
      console.error('Error fetching option type:', error);
    }
  };

  const fetchOptionValues = async () => {
    try {
      console.log('Fetching option values for option type:', optionTypeId);
      const response = await apiClient.get(`/admin/option-value?optionTypeId=${optionTypeId}`);
      console.log('Option values response:', response);

      if (response.success) {
        setOptionValues(response.data?.optionValues || response.optionValues || []);
      } else {
        console.error('Failed to fetch option values:', response.message);
        toast.error('Failed to load option values');
      }
    } catch (error) {
      console.error('Error fetching option values:', error);
      toast.error('Failed to load option values');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateValue = async (e) => {
    e.preventDefault();
    
    if (!newValue.value.trim()) {
      toast.error('Value is required');
      return;
    }

    try {
      console.log('Creating option value:', newValue);
      const response = await apiClient.post('/api/admin/option-value', {
        optionTypeId: optionTypeId,
        value: newValue.value.trim(),
        price: parseFloat(newValue.price) || 0,
        stock: parseInt(newValue.stock) || 0
      });
      console.log('Create option value response:', response);

      if (response.success) {
        toast.success('Option value created successfully!');
        setNewValue({ value: '', price: 0, stock: 0 });
        setShowCreateValue(false);
        fetchOptionValues();
      } else {
        toast.error(response.message || 'Failed to create option value');
      }
    } catch (error) {
      console.error('Error creating option value:', error);
      if (error.response?.status === 409) {
        toast.error('This value already exists for this option type');
      } else {
        toast.error('Failed to create option value');
      }
    }
  };

  const handleUpdateValue = async (e) => {
    e.preventDefault();
    
    if (!editingValue.value.trim()) {
      toast.error('Value is required');
      return;
    }

    try {
      console.log('Updating option value:', editingValue);
      const response = await apiClient.put(`/api/admin/option-value/${editingValue.id}`, {
        value: editingValue.value.trim(),
        price: parseFloat(editingValue.price) || 0,
        stock: parseInt(editingValue.stock) || 0
      });
      console.log('Update option value response:', response);

      if (response.success) {
        toast.success('Option value updated successfully!');
        setEditingValue(null);
        fetchOptionValues();
      } else {
        toast.error(response.message || 'Failed to update option value');
      }
    } catch (error) {
      console.error('Error updating option value:', error);
      if (error.response?.status === 409) {
        toast.error('This value already exists for this option type');
      } else {
        toast.error('Failed to update option value');
      }
    }
  };

  const handleDeleteValue = async (valueId) => {
    if (!confirm('Are you sure you want to delete this option value?')) {
      return;
    }

    try {
      console.log('Deleting option value:', valueId);
      const response = await apiClient.delete(`/api/admin/option-value/${valueId}`);
      console.log('Delete option value response:', response);

      if (response.success) {
        toast.success('Option value deleted successfully!');
        fetchOptionValues();
      } else {
        toast.error(response.message || 'Failed to delete option value');
      }
    } catch (error) {
      console.error('Error deleting option value:', error);
      toast.error('Failed to delete option value');
    }
  };

  const startEdit = (value) => {
    setEditingValue({ ...value });
  };

  const cancelEdit = () => {
    setEditingValue(null);
  };

  if (loading) {
    return (
      <AdminLayout title="Option Values" subtitle="Loading option values...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Option Values" subtitle={`Manage values for ${optionType?.name || 'Option Type'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href={`/admin/products/options/${productId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Options
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Option Values</h2>
            <p className="text-gray-600">{optionType?.name || 'Option Type'} for {product?.name || 'Product'}</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateValue(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Value
        </Button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Create/Edit Value Modal */}
        {(showCreateValue || editingValue) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingValue ? 'Edit Option Value' : 'Create Option Value'}
                </h3>
              </CardHeader>
              <CardBody>
                <form onSubmit={editingValue ? handleUpdateValue : handleCreateValue} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value *
                    </label>
                    <input
                      type="text"
                      value={editingValue ? editingValue.value : newValue.value}
                      onChange={(e) => {
                        if (editingValue) {
                          setEditingValue({ ...editingValue, value: e.target.value });
                        } else {
                          setNewValue({ ...newValue, value: e.target.value });
                        }
                      }}
                      placeholder="e.g., Small, Medium, Large"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Adjustment
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingValue ? editingValue.price : newValue.price}
                      onChange={(e) => {
                        if (editingValue) {
                          setEditingValue({ ...editingValue, price: e.target.value });
                        } else {
                          setNewValue({ ...newValue, price: e.target.value });
                        }
                      }}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Additional price (can be negative for discounts)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingValue ? editingValue.stock : newValue.stock}
                      onChange={(e) => {
                        if (editingValue) {
                          setEditingValue({ ...editingValue, stock: e.target.value });
                        } else {
                          setNewValue({ ...newValue, stock: e.target.value });
                        }
                      }}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button type="submit" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {editingValue ? 'Update Value' : 'Create Value'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        if (editingValue) {
                          cancelEdit();
                        } else {
                          setShowCreateValue(false);
                          setNewValue({ value: '', price: 0, stock: 0 });
                        }
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Option Values List */}
        {optionValues.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Option Values</h3>
              <p className="text-gray-600 mb-6">
                This option type doesn't have any values yet. Add values like Small, Medium, Large for Size options.
              </p>
              <Button onClick={() => setShowCreateValue(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Value
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optionValues.map((value) => (
              <Card key={value.id}>
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{value.value}</h3>
                      <p className="text-sm text-gray-600">Option Value</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => startEdit(value)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDeleteValue(value.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price Adjustment:</span>
                      <span className={`font-semibold ${value.price >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {value.price >= 0 ? '+' : ''}${value.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <span className="font-semibold text-gray-900">{value.stock}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Price:</span>
                      <span className="font-semibold text-blue-600">
                        ${((product?.price || 0) + value.price).toFixed(2)}
                      </span>
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
