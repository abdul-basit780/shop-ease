import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Package,
  Menu,
  LogOut,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  Star,
  Grid,
  List,
  ToggleLeft,
  ToggleRight
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
    { name: 'Categories', href: '/admin/categories', icon: Package, current: router.pathname.startsWith('/admin/categories') },
    { name: 'Orders', href: '/admin/orders', icon: Package, current: router.pathname.startsWith('/admin/orders') },
    { name: 'Customers', href: '/admin/customers', icon: Users, current: router.pathname.startsWith('/admin/customers') },
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

// Customer Status Badge Component
const CustomerStatusBadge = ({ isActive }) => {
  // Default to active if isActive is undefined
  const isActiveStatus = isActive !== undefined ? isActive : true;
  
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    inactive: { color: 'bg-red-100 text-red-800', icon: X },
  };

  const status = isActiveStatus ? 'active' : 'inactive';
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Customer Card Component
const CustomerCard = ({ customer, onView, onToggleStatus }) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {customer.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {customer.name || 'Unknown Customer'}
              </h3>
              <p className="text-sm text-gray-500">
                {customer.email || 'No email'}
              </p>
            </div>
          </div>
          <div className="relative">
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          {customer.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {customer.phone}
            </div>
          )}
          {customer.dob && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              DOB: {customer.dob.split('T')[0]}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <CustomerStatusBadge isActive={customer.isActive} />
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {customer.gender || 'Not specified'}
            </div>
            <div className="text-sm text-gray-500">
              ID: {customer.id?.slice(-8) || 'Unknown'}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(customer)}
            className="flex-1"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(customer)}
            className="flex-1"
            style={{ 
              backgroundColor: customer.isActive ? '#EF4444' : '#10B981',
              color: 'white',
              borderColor: customer.isActive ? '#EF4444' : '#10B981'
            }}
          >
            {customer.isActive ? (
              <>
                <ToggleLeft className="h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <ToggleRight className="h-4 w-4" />
                Activate
              </>
            )}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

// Main Customers Component
export default function CustomersPage() {
  const router = useRouter();
  const { isLoading, isAdmin } = useAdminAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);

  const fetchCustomers = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { isActive: statusFilter === 'active' ? 'true' : statusFilter === 'inactive' ? 'false' : '' }),
      });

      // Fetch both customer list and dashboard stats
      const [customersResponse, dashboardResponse] = await Promise.all([
        apiClient.get(`/api/admin/customer?${params}`),
        apiClient.get('/api/admin/dashboard/stats').catch(() => ({ data: null }))
      ]);

      console.log('Customers response:', customersResponse);
      console.log('Dashboard response:', dashboardResponse);
      
      // Handle both possible response structures (response.data or direct response)
      const responseData = customersResponse.data || customersResponse;
      
      if (responseData.success) {
        const customersList = responseData.customers || [];
        setCustomers(customersList);
        setTotalPages(responseData.pagination?.totalPages || 1);
        
        // Use dashboard stats for accurate totals, fallback to page calculation
        const dashboardData = dashboardResponse?.data;
        const activeCount = customersList.filter(c => c.isActive === true).length;
        const inactiveCount = customersList.filter(c => c.isActive === false).length;
        
        const stats = {
          total: responseData.pagination?.total || customersList.length || 0,
          active: dashboardData?.overview?.customers?.active || activeCount,
          inactive: dashboardData?.overview?.customers?.blocked || inactiveCount,
          newThisMonth: dashboardData?.overview?.customers?.newCustomers || 0,
          avgOrderValue: 0, // Would need additional API call
        };
        setStats(stats);
      } else {
        console.error('Failed to fetch customers:', responseData.message);
        toast.error('Failed to load customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCustomers();
    }
  }, [currentPage, searchTerm, statusFilter, isAdmin]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleView = (customer) => {
    router.push(`/admin/customers/view/${customer.id}`);
  };

  const handleToggleStatus = async (customer) => {
    try {
      console.log('=== TOGGLE STATUS DEBUG ===');
      console.log('Customer ID:', customer.id);
      console.log('Current status from API:', customer.isActive);
      
      // Get auth token
      const authToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      if (!authToken) {
        toast.error('Authentication token not found. Please login again.');
        return;
      }

      // Determine what action to take based on current status
      const currentStatus = customer.isActive;
      const newStatus = !currentStatus;
      
      console.log('Current status:', currentStatus, 'New status:', newStatus);

      const response = await fetch(`/api/admin/customer/${customer.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);

      if (response.ok) {
        // Update customer in the local state immediately
        setCustomers(prev => prev.map(c => 
          c.id === customer.id ? { ...c, isActive: newStatus } : c
        ));
        toast.success(`Customer ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        console.log('SUCCESS: Status updated in database');
      } else {
        console.log('API Error - Status:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.log('API Error data:', errorData);
        toast.error(errorData.message || `Failed to update customer status (${response.status})`);
      }

    } catch (error) {
      console.error('CATCH ERROR:', error);
      toast.error('Error updating customer status');
    }
  };

  const handleRefresh = () => {
    fetchCustomers();
  };

  const handleExport = () => {
    if (customers.length === 0) {
      toast.error('No customers to export');
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'DOB', 'Gender', 'Status'];
    const csvContent = [
      headers.join(','),
      ...customers.map(customer => [
        `"${customer.name || ''}"`,
        `"${customer.email || ''}"`,
        `"${customer.phone || ''}"`,
        `"${customer.dob ? customer.dob.split('T')[0] : ''}"`,
        `"${customer.gender || ''}"`,
        `"${customer.isActive ? 'Active' : 'Inactive'}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Customers exported successfully!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Don't render anything if authentication is still loading or user is not admin
  if (isLoading || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout title="Customers" subtitle="Loading your customers...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Customers" subtitle="Manage your customer base and relationships">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600">View and manage your customer accounts</p>
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
            variant="outline"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Customers</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">All time</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active</p>
                  <p className="text-3xl font-bold text-green-900">{stats.active || 0}</p>
                  <p className="text-xs text-green-600 mt-1">Currently active</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">New This Month</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.newThisMonth || 0}</p>
                  <p className="text-xs text-purple-600 mt-1">Recent signups</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Avg. Order Value</p>
                  <p className="text-3xl font-bold text-orange-900">${stats.avgOrderValue || 0}</p>
                  <p className="text-xs text-orange-600 mt-1">Per customer</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

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
          </div>
        </CardBody>
      </Card>

      {/* Customers Grid/List */}
      {customers.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Customers will appear here when they register'
                }
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onView={handleView}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          ) : (
            <Card className="mb-8">
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          DOB
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {customer.name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.name || 'Unknown Customer'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {customer.id?.slice(-8) || 'Unknown'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.email || 'No email'}</div>
                            <div className="text-sm text-gray-500">{customer.phone || 'No phone'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {customer.gender || 'Not specified'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <CustomerStatusBadge isActive={customer.isActive} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.dob ? customer.dob.split('T')[0] : 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(customer)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(customer)}
                                style={{ 
                                  backgroundColor: customer.isActive ? '#EF4444' : '#10B981',
                                  color: 'white',
                                  borderColor: customer.isActive ? '#EF4444' : '#10B981'
                                }}
                              >
                                {customer.isActive ? (
                                  <ToggleLeft className="h-4 w-4" />
                                ) : (
                                  <ToggleRight className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
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
