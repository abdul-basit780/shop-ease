import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Download,
  Calendar,
  CheckCircle,
  Tag,
  Menu,
  X,
  LogOut,
  Search,
  Star
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { toast } from 'react-hot-toast';
import { useAdminAuth } from './utils/adminAuth';

// AdminLayout Component
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

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dashboard..."
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

// Card Components
const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '', ...props }) => (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );

const CardBody = ({ children, className = '', ...props }) => (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );

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

// Stats Card Component
const StatCard = ({ title, value, subtitle, change, changeType, icon: Icon, color = 'blue', trend = false }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };

  const changeColorClasses = {
    increase: 'text-green-600 bg-green-100',
    decrease: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100',
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            {change && (
              <div className="flex items-center mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${changeColorClasses[changeType]}`}>
                  {change}
                </span>
                {trend && (
                  <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                )}
              </div>
            )}
          </div>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Low Stock Alert Component
const LowStockAlert = ({ products }) => {
  return (
    <Card className="animate-fade-in-up animation-delay-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            {products?.length || 0} items
          </span>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          {products && products.length > 0 ? (
            products.slice(0, 5).map((product) => (
              <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{product.stock} left</p>
                  <p className="text-sm text-gray-500">${product.price}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-gray-600">All products are well stocked!</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Recent Orders Component
const RecentOrders = ({ orders }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="animate-fade-in-up animation-delay-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <Link href="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{order._id?.slice(-6) || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{order.customer?.name || 'Unknown Customer'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status || 'Unknown'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No recent orders found</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Revenue Chart Component
const RevenueChart = ({ trends }) => {
  if (!trends || trends.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No revenue data available</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...trends.map(t => t.revenue || 0));

  return (
    <div className="space-y-2">
      {trends.slice(0, 7).map((item, index) => {
        const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{item.date || 'Date'}</span>
              <span className="font-medium text-gray-900">${(item.revenue || 0).toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// System Health Component
const SystemHealth = ({ health }) => {
  if (!health || !health.status) return null;

  const getStatusColor = (status) => {
    return status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <p className="text-xs text-gray-500 mb-1">Database Status</p>
        <p className="text-lg font-bold text-gray-900">
          {health.database?.status === 'connected' ? '✅ Connected' : '❌ Disconnected'}
        </p>
        {health.database?.latency && (
          <p className="text-xs text-gray-500 mt-1">{health.database.latency}ms</p>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <p className="text-xs text-gray-500 mb-1">Memory Usage</p>
        <p className="text-lg font-bold text-gray-900">{health.memory?.percentage || 0}%</p>
        <p className="text-xs text-gray-500 mt-1">
          {health.memory?.used || 0}MB / {health.memory?.total || 0}MB
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <p className="text-xs text-gray-500 mb-1">Environment</p>
        <p className="text-lg font-bold text-gray-900">{health.environment || 'Unknown'}</p>
        <p className="text-xs text-gray-500 mt-1">v{health.version || '1.0.0'}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <p className="text-xs text-gray-500 mb-1">Uptime</p>
        <p className="text-lg font-bold text-gray-900">
          {Math.round((health.uptime || 0) / 3600)}h {Math.round(((health.uptime || 0) % 3600) / 60)}m
        </p>
        <p className="text-xs text-gray-500 mt-1">{Math.round(health.uptime || 0)}s</p>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function AdminDashboard() {
  const router = useRouter();
  const { isLoading, isAdmin } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Set fallback data first
      setStats({
        overview: {
          totalOrders: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          totalProducts: 0
        },
        orders: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0
        },
        revenue: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0
        },
        customers: {
          newToday: 0,
          newThisWeek: 0,
          newThisMonth: 0
        },
        products: {
          total: 0,
          lowStock: 0,
          outOfStock: 0
        }
      });

      // Try to fetch real data
      try {
        const [statsResponse, revenueResponse, healthResponse] = await Promise.all([
          apiClient.get('/api/admin/dashboard/stats').catch(() => ({ data: null })),
          apiClient.get('/api/admin/dashboard/revenue?period=daily').catch(() => ({ data: null })),
          apiClient.get('/api/health').catch(() => ({ data: null }))
        ]);
        
        // Handle stats response - API returns { success, message, data }
        if (statsResponse?.success && statsResponse.data) {
          const data = statsResponse.data;
          
          setStats({
            overview: {
              totalOrders: data.overview?.orders?.total || 0,
              totalRevenue: data.overview?.revenue?.total || 0,
              totalCustomers: data.overview?.customers?.total || 0,
              totalProducts: data.overview?.products?.total || 0,
              avgOrderValue: data.overview?.revenue?.avgOrderValue || 0,
              avgRating: data.overview?.feedback?.avgRating || 0,
            },
            customers: {
              active: data.overview?.customers?.active || 0,
              blocked: data.overview?.customers?.blocked || 0,
              verified: data.overview?.customers?.verified || 0,
              unverified: data.overview?.customers?.unverified || 0,
              newCustomers: data.overview?.customers?.newCustomers || 0,
            },
            orders: {
              byStatus: data.overview?.orders?.byStatus || {},
              today: data.overview?.orders?.total || 0,
              thisWeek: 0,
              thisMonth: 0,
            },
            revenue: {
              today: 0,
              thisWeek: 0,
              thisMonth: data.overview?.revenue?.total || 0,
              avgOrderValue: data.overview?.revenue?.avgOrderValue || 0,
              orderCount: data.overview?.revenue?.orderCount || 0,
            },
            products: {
              total: data.overview?.products?.total || 0,
              active: data.overview?.products?.active || 0,
              deleted: data.overview?.products?.deleted || 0,
              lowStock: data.overview?.products?.lowStock || 0,
            },
            categories: {
              total: data.overview?.categories?.total || 0,
              active: data.overview?.categories?.active || 0,
              deleted: data.overview?.categories?.deleted || 0,
            },
            feedback: {
              total: data.overview?.feedback?.total || 0,
              avgRating: data.overview?.feedback?.avgRating || 0,
            },
            lowStockProducts: data.insights?.lowStockProducts || [],
            recentOrders: data.insights?.recentOrders || [],
            topSellingProducts: data.insights?.topSellingProducts || [],
            trends: data.trends?.revenueTrend || [],
          });
        }

        // Handle revenue response - API returns { success, message, data: { period, dateRange, data: [...] } }
        if (revenueResponse?.success && revenueResponse.data) {
          setRevenueData(revenueResponse.data);
        }

        // Handle health response - API returns { success, message, data }
        console.log('Health response:', healthResponse);
        
        if (healthResponse?.success && healthResponse.data) {
          console.log('Setting health data:', healthResponse.data);
          setHealthData(healthResponse.data);
        } else if (healthResponse?.data?.status) {
          // Handle case where response.data has the health object directly
          console.log('Setting health data (direct):', healthResponse.data);
          setHealthData(healthResponse.data);
        }
      } catch (apiError) {
        console.error('API calls failed:', apiError);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Don't render anything if authentication is still loading or user is not admin
  if (isLoading || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
          <div className="flex items-center space-x-4">
            <button
            onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
      </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={stats?.overview?.totalOrders || 0}
            change="+12%"
            changeType="increase"
            icon={ShoppingBag}
          />
        <StatCard
          title="Total Revenue"
            value={`$${stats?.overview?.totalRevenue?.toLocaleString() || 0}`}
            change="+8%"
          changeType="increase"
          icon={DollarSign}
        />
        <StatCard
          title="Total Customers"
            value={stats?.overview?.totalCustomers || 0}
            change="+15%"
          changeType="increase"
          icon={Users}
        />
        <StatCard
          title="Total Products"
            value={stats?.overview?.totalProducts || 0}
            change="+5%"
          changeType="increase"
          icon={Package}
        />
      </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
            title="Active Customers"
            value={stats?.customers?.active || 0}
            subtitle={`${stats?.customers?.blocked || 0} blocked`}
            color="green"
            icon={Users}
        />
        <StatCard
            title="Avg Order Value"
            value={`$${(stats?.overview?.avgOrderValue || 0).toFixed(2)}`}
            subtitle={`${stats?.overview?.totalOrders || 0} orders`}
          color="purple"
            icon={DollarSign}
        />
        <StatCard
            title="Avg Rating"
            value={(stats?.overview?.avgRating || 0).toFixed(1)}
            subtitle={`${stats?.feedback?.total || 0} reviews`}
            color="orange"
            icon={Star}
        />
      </div>

        {/* Top Selling Products */}
        {stats?.topSellingProducts && stats.topSellingProducts.length > 0 && (
          <Card>
        <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
        </CardHeader>
        <CardBody>
              <div className="space-y-4">
                {stats.topSellingProducts.slice(0, 5).map((product, index) => (
                  <div key={product.productId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{index + 1}</span>
              </div>
              <div>
                        <p className="font-medium text-gray-900">{product.name || 'Unknown Product'}</p>
                        <p className="text-sm text-gray-500">{product.totalSold || 0} sold</p>
              </div>
              </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${(product.revenue || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Revenue</p>
              </div>
              </div>
                ))}
          </div>
        </CardBody>
      </Card>
        )}

        {/* Revenue Trends */}
        {revenueData?.data && revenueData.data.length > 0 && (
          <Card>
        <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
              <p className="text-sm text-gray-600">
                Daily revenue over the past {revenueData.data.length} days
              </p>
        </CardHeader>
        <CardBody>
              <RevenueChart trends={revenueData.data} />
            </CardBody>
          </Card>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LowStockAlert products={stats?.lowStockProducts || []} />
          <RecentOrders orders={stats?.recentOrders || []} />
        </div>

        {/* System Health */}
        <SystemHealth health={healthData} />
      </div>
    </AdminLayout>
  );
}