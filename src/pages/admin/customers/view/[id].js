import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  ArrowLeft,
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  ShoppingBag,
  DollarSign,
  Star,
  Package,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  RefreshCw,
  Edit,
  Trash2,
  Menu,
  LogOut,
  TrendingUp,
  Activity,
  CreditCard,
  Truck
} from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { useAdminAuth } from '../../utils/adminAuth';

// Layout Component
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
    { name: 'Customers', href: '/admin/customers', icon: User, current: router.pathname.startsWith('/admin/customers') },
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

// Customer Status Badge Component
const CustomerStatusBadge = ({ status }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    inactive: { color: 'bg-red-100 text-red-800', icon: X },
    suspended: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    pending: { color: 'bg-blue-100 text-blue-800', icon: Clock },
  };

  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-2" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Main Customer View Component
export default function CustomerViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isLoading, isAdmin } = useAdminAuth();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchCustomer = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      console.log('Fetching customer:', id);
      const response = await apiClient.get(`/api/admin/customer/${id}`);
      console.log('Customer response:', response);
      
      // Handle both possible response structures (response.data or direct response)
      const responseData = response.data || response;
      
      if (responseData.success && responseData.customer) {
        setCustomer(responseData.customer);
      } else {
        toast.error(responseData.message || 'Customer not found');
        router.push('/admin/customers');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      if (error.response?.status === 404) {
        toast.error('Customer not found');
        router.push('/admin/customers');
      } else if (error.response?.status === 401) {
        toast.error('Unauthorized access');
        router.push('/auth/login');
      } else if (error.response?.status === 403) {
        toast.error('Access denied');
        router.push('/admin');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load customer details');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async () => {
    if (!id) return;
    
    try {
      setOrdersLoading(true);
      const response = await apiClient.get(`/api/admin/orders?customerId=${id}&limit=10`);
      
      // Handle both possible response structures (response.data or direct response)
      const responseData = response.data || response;
      
      if (responseData.success) {
        setOrders(responseData.orders || []);
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (id && isAdmin) {
      fetchCustomer();
      fetchCustomerOrders();
    }
  }, [id, isAdmin]);

  const handleToggleStatus = async () => {
    if (!customer) return;
    
    const newStatus = !customer.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} this customer?`)) {
      return;
    }

    try {
      const response = await apiClient.patch(`/api/admin/customer/${id}/status`, {
        isActive: newStatus
      });
      console.log('Toggle status response:', response);

      // Handle both possible response structures (response.data or direct response)
      const responseData = response.data || response;

      if (responseData.success) {
        toast.success(`Customer ${action}d successfully`);
        setCustomer(prev => ({ ...prev, isActive: newStatus }));
      } else {
        toast.error(responseData.message || `Failed to ${action} customer`);
      }
    } catch (error) {
      console.error('Error toggling customer status:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} customer`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Don't render anything if authentication is still loading or user is not admin
  if (isLoading || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout title="Customer Details" subtitle="Loading customer information...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout title="Customer Not Found" subtitle="The requested customer could not be found">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Not Found</h3>
          <p className="text-gray-600 mb-6">The customer you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/admin/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`${customer.name || 'Customer'}`} subtitle="View customer details and order history">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/customers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {customer.name || 'Unknown Customer'}
            </h2>
            <p className="text-gray-600">
              Customer since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={fetchCustomer}
            isLoading={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                <CustomerStatusBadge status={customer.status || 'active'} />
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {customer.name || 'Unknown Customer'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {customer.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email || 'No email'}</span>
                    </div>
                    
                    {customer.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(customer.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Address Information</h5>
                  {customer.address ? (
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{customer.address.name}</p>
                          <p>{customer.address.street}</p>
                          <p>{customer.address.city}, {customer.address.state} {customer.address.zipCode}</p>
                          <p>{customer.address.country}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No address information available</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Customer Statistics */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Customer Statistics</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <ShoppingBag className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{customer.totalOrders || 0}</p>
                  <p className="text-sm text-blue-600">Total Orders</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(customer.totalSpent || 0)}</p>
                  <p className="text-sm text-green-600">Total Spent</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900">{customer.avgOrderValue || 0}</p>
                  <p className="text-sm text-purple-600">Avg. Order Value</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/orders?customerId=${id}`)}
                >
                  View All Orders
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Order #{order.orderNumber || order._id?.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(order.total || 0)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No orders found for this customer</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/admin/orders?customerId=${id}`)}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View All Orders
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/admin/feedback?customerId=${id}`)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  View Feedback
                </Button>
                <Button
                  variant={customer?.isActive ? "danger" : "success"}
                  className="w-full"
                  onClick={handleToggleStatus}
                >
                  {customer?.isActive ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Deactivate Account
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate Account
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Customer Activity */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Activity Summary</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Order</span>
                  <span className="text-sm font-medium">
                    {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <CustomerStatusBadge status={customer.status || 'active'} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Verified</span>
                  <span className={`text-sm font-medium ${
                    customer.emailVerified ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {customer.emailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{customer.email || 'No email'}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="text-gray-900">
                      <p>{customer.address.street}</p>
                      <p>{customer.address.city}, {customer.address.state}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
