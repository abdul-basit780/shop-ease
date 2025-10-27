import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  ArrowLeft,
  ShoppingBag, 
  User, 
  MapPin, 
  CreditCard, 
  Package,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Truck,
  RefreshCw,
  Edit,
  Trash2,
  Menu,
  LogOut
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
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, current: router.pathname.startsWith('/admin/orders') },
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

// Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    processing: { color: 'bg-blue-100 text-blue-800', icon: Package },
    shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-800', icon: X },
    refunded: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-2" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Main Order View Component
export default function OrderViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      console.log('Fetching order:', id);
      const response = await apiClient.get(`/api/admin/orders/${id}`);
      console.log('Order response:', response);
      
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        toast.error(response.message || 'Order not found');
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      if (error.response?.status === 404) {
        toast.error('Order not found');
        router.push('/admin/orders');
      } else if (error.response?.status === 401) {
        toast.error('Unauthorized access');
        router.push('/auth/login');
      } else if (error.response?.status === 403) {
        toast.error('Access denied');
        router.push('/admin');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load order details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await apiClient.put(`/api/admin/orders/${id}`, {
        status: newStatus
      });
      console.log('Update status response:', response);

      if (response.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrder(prev => ({ ...prev, status: newStatus }));
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order? This will process a refund if payment was completed.')) {
      return;
    }

    try {
      setUpdating(true);
      const response = await apiClient.post(`/api/admin/orders/${id}/cancel`);
      console.log('Cancel order response:', response);

      if (response.success) {
        toast.success('Order cancelled successfully');
        setOrder(prev => ({ ...prev, status: 'cancelled' }));
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setUpdating(false);
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

  if (loading) {
    return (
      <AdminLayout title="Order Details" subtitle="Loading order information...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order Not Found" subtitle="The requested order could not be found">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Order #${order.orderNumber || order._id?.slice(-8)}`} subtitle="View order details and manage status">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/orders')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber || order._id?.slice(-8)}
            </h2>
            <p className="text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={fetchOrder}
            isLoading={updating}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <Button
              variant="danger"
              onClick={handleCancelOrder}
              isLoading={updating}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
                <OrderStatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <span className="font-medium">{order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order Date</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                {order.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="font-medium">{formatDate(order.updatedAt)}</span>
                  </div>
                )}
              </div>
              
              {/* Status Update Actions */}
              {order.status === 'pending' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => handleStatusUpdate('processing')}
                    isLoading={updating}
                    className="w-full"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Mark as Processing
                  </Button>
                </div>
              )}
              
              {order.status === 'processing' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => handleStatusUpdate('shipped')}
                    isLoading={updating}
                    className="w-full"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Mark as Shipped
                  </Button>
                </div>
              )}
              
              {order.status === 'shipped' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => handleStatusUpdate('completed')}
                    isLoading={updating}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
            </CardHeader>
            <CardBody>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        {item.product?.img ? (
                          <img
                            src={item.product.img}
                            alt={item.product.name}
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.product?.name || 'Unknown Product'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="mt-1">
                            {Object.entries(item.selectedOptions).map(([key, value]) => (
                              <span key={key} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No items found in this order</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.customer?.name || 'Unknown Customer'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customer?.email || 'No email'}
                    </p>
                  </div>
                </div>
                
                {order.customer?.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{order.customer.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{order.customer?.email || 'No email'}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
            </CardHeader>
            <CardBody>
              {order.shippingAddress ? (
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No shipping address provided</p>
              )}
            </CardBody>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <span className="font-medium">
                    {order.payment?.method || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <span className={`font-medium ${
                    order.payment?.status === 'completed' ? 'text-green-600' : 
                    order.payment?.status === 'pending' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {order.payment?.status || 'Unknown'}
                  </span>
                </div>
                {order.payment?.transactionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Transaction ID</span>
                    <span className="font-medium text-xs">
                      {order.payment.transactionId}
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(order.subtotal || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {formatCurrency(order.shippingCost || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tax</span>
                  <span className="font-medium">
                    {formatCurrency(order.tax || 0)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
