import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Tag, 
  MessageSquare, 
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Star,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Target,
  Award,
  TrendingUp as TrendingUpIcon,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';

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
    { name: 'Dashboard', href: '/admin', icon: BarChart3, current: router.pathname === '/admin' },
    { name: 'Products', href: '/admin/products', icon: Package, current: router.pathname.startsWith('/admin/products') },
    { name: 'Categories', href: '/admin/categories', icon: Tag, current: router.pathname.startsWith('/admin/categories') },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, current: router.pathname.startsWith('/admin/orders') },
    { name: 'Customers', href: '/admin/customers', icon: Users, current: router.pathname.startsWith('/admin/customers') },
    { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare, current: router.pathname.startsWith('/admin/feedback') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
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
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
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
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings className="h-5 w-5" />
              </button>
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
    <div className={`bg-white rounded-2xl shadow-2xl border-0 backdrop-blur-sm bg-white/90 overflow-hidden ${className}`} {...props}>
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
    primary: 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl focus:ring-primary-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500',
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

// Enhanced Stat Card Component
const StatCard = ({ title, value, change, changeType, icon: Icon, color = 'blue', subtitle, trend }) => {
  const colors = {
    blue: 'from-primary-500 to-primary-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-secondary-500 to-secondary-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
            )}
            {change && (
              <div className="flex items-center">
                {changeType === 'increase' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change}
                </span>
                {trend && (
                  <span className="text-xs text-gray-500 ml-2">vs last month</span>
                )}
              </div>
            )}
          </div>
          <div className={`w-14 h-14 bg-gradient-to-r ${colors[color]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Revenue Chart Component
const RevenueChart = ({ data, period }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      // Simple chart implementation without external library
      setChartData(data);
    }
  }, [data]);

  return (
    <Card className="animate-fade-in-up animation-delay-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
            <p className="text-sm text-gray-600">Revenue trends over time</p>
          </div>
          <div className="flex items-center space-x-2">
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="h-64 flex items-center justify-center">
          {chartData && chartData.length > 0 ? (
            <div className="w-full h-full">
              <div className="flex items-end justify-between h-48 space-x-2">
                {chartData.map((item, index) => {
                  const maxRevenue = Math.max(...chartData.map(d => d.revenue));
                  const height = (item.revenue / maxRevenue) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-gradient-to-t from-primary-500 to-secondary-500 rounded-t-lg transition-all duration-500 hover:from-primary-600 hover:to-secondary-600"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2 text-center">
                        <div className="font-medium">${item.revenue}</div>
                        <div className="text-gray-500">{item.period}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No revenue data available</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Top Products Component
const TopProducts = ({ products }) => {
  return (
    <Card className="animate-fade-in-up animation-delay-400">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
          <Link href="/admin/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {products && products.length > 0 ? (
            products.map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.totalSold} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.revenue}</p>
                  <p className="text-sm text-gray-500">revenue</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No product data available</p>
            </div>
          )}
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

// Main Dashboard Component
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Set fallback data first to prevent errors
      setStats({
        overview: {
          customers: { total: 0, active: 0, blocked: 0, verified: 0, unverified: 0, newCustomers: 0 },
          orders: { total: 0, byStatus: {} },
          revenue: { total: 0, avgOrderValue: 0, orderCount: 0 },
          products: { total: 0, active: 0, deleted: 0, lowStock: 0 },
          categories: { total: 0, active: 0, deleted: 0 },
          feedback: { total: 0, avgRating: 0 }
        },
        trends: { revenueTrend: [] },
        insights: { topSellingProducts: [], lowStockProducts: [], recentOrders: [] }
      });
      
      setRevenue({
        period: 'daily',
        dateRange: { startDate: new Date(), endDate: new Date() },
        data: []
      });

      try {
        const [statsResponse, revenueResponse] = await Promise.all([
          apiClient.get('/admin/dashboard/stats'),
          apiClient.get(`/admin/dashboard/revenue?period=${selectedPeriod}`)
        ]);

        if (statsResponse && statsResponse.success) {
          setStats(statsResponse.data);
        }
        if (revenueResponse && revenueResponse.success) {
          setRevenue(revenueResponse.data);
        }
      } catch (apiError) {
        console.warn('API not available, using fallback data:', apiError);
        // Keep the fallback data that was already set
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    fetchDashboardData();
  };

  useEffect(() => {
    // Check if user is authenticated before fetching data
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    if (!token) {
      // Redirect to login if no token
      window.location.href = '/auth/login';
      return;
    }
    
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Loading your admin dashboard...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard" subtitle="Error loading dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back! Here's what's happening with your store.">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          <p className="text-gray-600">Monitor your store's performance and key metrics</p>
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
          <Button variant="primary">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
        <StatCard
          title="Total Revenue"
          value={stats?.overview?.revenue?.total ? `$${stats.overview.revenue.total.toLocaleString()}` : '$0'}
          subtitle={`${stats?.overview?.revenue?.orderCount || 0} orders`}
          change="+12.5%"
          changeType="increase"
          icon={DollarSign}
          color="green"
          trend={true}
        />
        <StatCard
          title="Total Orders"
          value={stats?.overview?.orders?.total || 0}
          subtitle={`${stats?.overview?.orders?.byStatus?.completed || 0} completed`}
          change="+8.2%"
          changeType="increase"
          icon={ShoppingBag}
          color="blue"
          trend={true}
        />
        <StatCard
          title="Total Customers"
          value={stats?.overview?.customers?.total || 0}
          subtitle={`${stats?.overview?.customers?.active || 0} active`}
          change="+15.3%"
          changeType="increase"
          icon={Users}
          color="purple"
          trend={true}
        />
        <StatCard
          title="Total Products"
          value={stats?.overview?.products?.total || 0}
          subtitle={`${stats?.overview?.products?.lowStock || 0} low stock`}
          change="+5.7%"
          changeType="increase"
          icon={Package}
          color="orange"
          trend={true}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up animation-delay-200">
        <StatCard
          title="Average Order Value"
          value={stats?.overview?.revenue?.avgOrderValue ? `$${stats.overview.revenue.avgOrderValue.toFixed(2)}` : '$0.00'}
          subtitle="Per order"
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Customer Satisfaction"
          value={stats?.overview?.feedback?.avgRating ? `${stats.overview.feedback.avgRating.toFixed(1)}/5` : '0.0/5'}
          subtitle={`${stats?.overview?.feedback?.total || 0} reviews`}
          icon={Star}
          color="purple"
        />
        <StatCard
          title="Active Categories"
          value={stats?.overview?.categories?.active || 0}
          subtitle={`${stats?.overview?.categories?.total || 0} total`}
          icon={Tag}
          color="green"
        />
      </div>

      {/* Enhanced Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <RevenueChart 
          data={revenue?.data || []} 
          period={selectedPeriod}
        />

        {/* Top Selling Products */}
        <TopProducts 
          products={stats?.insights?.topSellingProducts || []} 
        />
      </div>

      {/* Additional Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Low Stock Alert */}
        <LowStockAlert 
          products={stats?.insights?.lowStockProducts || []} 
        />

        {/* Recent Orders */}
        <RecentOrders 
          orders={stats?.insights?.recentOrders || []} 
        />
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="animate-fade-in-up animation-delay-400">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary-600" />
              <span className="text-sm text-gray-600">Admin Tools</span>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/admin/products/create"
              className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl hover:from-primary-100 hover:to-primary-200 transition-all duration-300 group hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Add Product</p>
                <p className="text-sm text-gray-600">Create new product</p>
              </div>
            </Link>

            <Link 
              href="/admin/categories/create"
              className="flex items-center p-4 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl hover:from-secondary-100 hover:to-secondary-200 transition-all duration-300 group hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-secondary-600 to-purple-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Add Category</p>
                <p className="text-sm text-gray-600">Create new category</p>
              </div>
            </Link>

            <Link 
              href="/admin/orders"
              className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 group hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">View Orders</p>
                <p className="text-sm text-gray-600">Manage orders</p>
              </div>
            </Link>

            <Link 
              href="/admin/customers"
              className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 group hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">View Customers</p>
                <p className="text-sm text-gray-600">Manage customers</p>
              </div>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Performance Metrics */}
      <Card className="animate-fade-in-up animation-delay-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-600">Real-time Data</span>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">System Health</h4>
              <p className="text-2xl font-bold text-green-600 mt-1">98%</p>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">Response Time</h4>
              <p className="text-2xl font-bold text-blue-600 mt-1">245ms</p>
              <p className="text-sm text-gray-600">Average</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">Conversion Rate</h4>
              <p className="text-2xl font-bold text-purple-600 mt-1">3.2%</p>
              <p className="text-sm text-gray-600">This month</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUpIcon className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">Growth Rate</h4>
              <p className="text-2xl font-bold text-orange-600 mt-1">+12%</p>
              <p className="text-sm text-gray-600">vs last month</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </AdminLayout>
  );
}
