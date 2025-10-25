import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
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
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Reply,
  Grid,
  List
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
    { name: 'Categories', href: '/admin/categories', icon: Package, current: router.pathname.startsWith('/admin/categories') },
    { name: 'Orders', href: '/admin/orders', icon: Package, current: router.pathname.startsWith('/admin/orders') },
    { name: 'Customers', href: '/admin/customers', icon: Package, current: router.pathname.startsWith('/admin/customers') },
    { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare, current: router.pathname.startsWith('/admin/feedback') },
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
                  placeholder="Search feedback..."
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

// Rating Stars Component
const RatingStars = ({ rating, maxRating = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">({rating})</span>
    </div>
  );
};

// Feedback Type Badge Component
const FeedbackTypeBadge = ({ type }) => {
  const typeConfig = {
    review: { color: 'bg-blue-100 text-blue-800', icon: Star },
    complaint: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    suggestion: { color: 'bg-green-100 text-green-800', icon: ThumbsUp },
    question: { color: 'bg-purple-100 text-purple-800', icon: MessageSquare },
    bug: { color: 'bg-orange-100 text-orange-800', icon: Flag },
  };

  const config = typeConfig[type] || typeConfig.review;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

// Feedback Status Badge Component
const FeedbackStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    reviewed: { color: 'bg-blue-100 text-blue-800', icon: Eye },
    resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    closed: { color: 'bg-gray-100 text-gray-800', icon: X },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Feedback Card Component
const FeedbackCard = ({ feedback, onView, onReply }) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {feedback.customer?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {feedback.customer?.name || 'Anonymous'}
              </h3>
              <p className="text-xs text-gray-500">
                {new Date(feedback.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FeedbackTypeBadge type={feedback.type} />
            <FeedbackStatusBadge status={feedback.status} />
          </div>
        </div>
        
        {feedback.rating && (
          <div className="mb-3">
            <RatingStars rating={feedback.rating} />
          </div>
        )}
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {feedback.subject || 'No Subject'}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-3">
            {feedback.message || 'No message provided'}
          </p>
        </div>
        
        {feedback.product && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Product:</p>
            <p className="text-sm font-medium text-gray-900">
              {feedback.product.name}
            </p>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(feedback)}
            className="flex-1"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
          {feedback.status === 'pending' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onReply(feedback)}
              className="flex-1"
            >
              <Reply className="h-4 w-4" />
              Reply
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Main Feedback Component
export default function FeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);

  const fetchFeedbacks = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await apiClient.get(`/api/admin/feedback?${params}`).catch(() => apiClient.get(`/admin/feedback?${params}`));
      
      if (response.success) {
        setFeedbacks(response.feedbacks || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setStats(response.stats || null);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [currentPage, searchTerm, typeFilter, statusFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleView = (feedback) => {
    router.push(`/admin/feedback/view/${feedback._id}`);
  };

  const handleReply = (feedback) => {
    router.push(`/admin/feedback/reply/${feedback._id}`);
  };

  const handleRefresh = () => {
    fetchFeedbacks();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Feedback" subtitle="Loading customer feedback...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Feedback" subtitle="Manage customer feedback and reviews">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Feedback</h2>
          <p className="text-gray-600">Review and respond to customer feedback</p>
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
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.resolved || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageRating || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
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
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => handleTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="review">Review</option>
                <option value="complaint">Complaint</option>
                <option value="suggestion">Suggestion</option>
                <option value="question">Question</option>
                <option value="bug">Bug Report</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
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

      {/* Feedback Grid/List */}
      {feedbacks.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || typeFilter || statusFilter 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Customer feedback will appear here'
                }
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {feedbacks.map((feedback) => (
                <FeedbackCard
                  key={feedback._id}
                  feedback={feedback}
                  onView={handleView}
                  onReply={handleReply}
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
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {feedbacks.map((feedback) => (
                        <tr key={feedback._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-xs">
                                    {feedback.customer?.name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {feedback.customer?.name || 'Anonymous'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {feedback.customer?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <FeedbackTypeBadge type={feedback.type} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {feedback.subject || 'No subject'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {feedback.rating ? (
                              <RatingStars rating={feedback.rating} />
                            ) : (
                              <span className="text-sm text-gray-500">No rating</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <FeedbackStatusBadge status={feedback.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(feedback.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(feedback)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {feedback.status === 'pending' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleReply(feedback)}
                                >
                                  <Reply className="h-4 w-4" />
                                </Button>
                              )}
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


  const fetchFeedbacks = async () => {

    try {

      setRefreshing(true);

      const params = new URLSearchParams({

        page: currentPage.toString(),

        limit: '12',

        ...(searchTerm && { search: searchTerm }),

        ...(typeFilter && { type: typeFilter }),

        ...(statusFilter && { status: statusFilter }),

      });



      const response = await apiClient.get(`/admin/feedback?${params}`);

      

      if (response.success) {

        setFeedbacks(response.feedbacks || []);

        setTotalPages(response.pagination?.totalPages || 1);

        setStats(response.stats || null);

      }

    } catch (error) {

      console.error('Error fetching feedbacks:', error);

      toast.error('Failed to load feedback');

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };



  useEffect(() => {

    fetchFeedbacks();

  }, [currentPage, searchTerm, typeFilter, statusFilter]);



  const handleSearch = (e) => {

    setSearchTerm(e.target.value);

    setCurrentPage(1);

  };



  const handleTypeFilter = (type) => {

    setTypeFilter(type);

    setCurrentPage(1);

  };



  const handleStatusFilter = (status) => {

    setStatusFilter(status);

    setCurrentPage(1);

  };



  const handleView = (feedback) => {

    router.push(`/admin/feedback/view/${feedback._id}`);

  };



  const handleReply = (feedback) => {

    router.push(`/admin/feedback/reply/${feedback._id}`);

  };



  const handleRefresh = () => {

    fetchFeedbacks();

  };



  const formatDate = (dateString) => {

    return new Date(dateString).toLocaleDateString('en-US', {

      year: 'numeric',

      month: 'short',

      day: 'numeric',

      hour: '2-digit',

      minute: '2-digit'

    });

  };



  if (loading) {

    return (

      <AdminLayout title="Feedback" subtitle="Loading customer feedback...">

        <div className="flex items-center justify-center h-64">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

        </div>

      </AdminLayout>

    );

  }



  return (

    <AdminLayout title="Feedback" subtitle="Manage customer feedback and reviews">

      {/* Header Actions */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-2xl font-bold text-gray-900">Customer Feedback</h2>

          <p className="text-gray-600">Review and respond to customer feedback</p>

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

          <Button variant="secondary">

            <Download className="h-4 w-4" />

            Export

          </Button>

        </div>

      </div>



      {/* Stats Cards */}

      {stats && (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <Card>

            <CardBody>

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>

                  <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>

                </div>

                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">

                  <MessageSquare className="h-6 w-6 text-blue-600" />

                </div>

              </div>

            </CardBody>

          </Card>

          <Card>

            <CardBody>

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-600">Pending</p>

                  <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>

                </div>

                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">

                  <Clock className="h-6 w-6 text-yellow-600" />

                </div>

              </div>

            </CardBody>

          </Card>

          <Card>

            <CardBody>

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-600">Resolved</p>

                  <p className="text-3xl font-bold text-green-600">{stats.resolved || 0}</p>

                </div>

                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">

                  <CheckCircle className="h-6 w-6 text-green-600" />

                </div>

              </div>

            </CardBody>

          </Card>

          <Card>

            <CardBody>

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-600">Avg. Rating</p>

                  <p className="text-3xl font-bold text-gray-900">{stats.averageRating || 0}</p>

                </div>

                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">

                  <Star className="h-6 w-6 text-yellow-600" />

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

                placeholder="Search feedback..."

                value={searchTerm}

                onChange={handleSearch}

                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

              />

            </div>



            {/* Filters */}

            <div className="flex items-center space-x-4">

              {/* Type Filter */}

              <select

                value={typeFilter}

                onChange={(e) => handleTypeFilter(e.target.value)}

                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

              >

                <option value="">All Types</option>

                <option value="review">Review</option>

                <option value="complaint">Complaint</option>

                <option value="suggestion">Suggestion</option>

                <option value="question">Question</option>

                <option value="bug">Bug Report</option>

              </select>



              {/* Status Filter */}

              <select

                value={statusFilter}

                onChange={(e) => handleStatusFilter(e.target.value)}

                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

              >

                <option value="">All Statuses</option>

                <option value="pending">Pending</option>

                <option value="reviewed">Reviewed</option>

                <option value="resolved">Resolved</option>

                <option value="closed">Closed</option>

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



      {/* Feedback Grid/List */}

      {feedbacks.length === 0 ? (

        <Card>

          <CardBody>

            <div className="text-center py-12">

              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />

              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>

              <p className="text-gray-600 mb-6">

                {searchTerm || typeFilter || statusFilter 

                  ? 'Try adjusting your search or filter criteria'

                  : 'Customer feedback will appear here'

                }

              </p>

            </div>

          </CardBody>

        </Card>

      ) : (

        <>

          {viewMode === 'grid' ? (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

              {feedbacks.map((feedback) => (

                <FeedbackCard

                  key={feedback._id}

                  feedback={feedback}

                  onView={handleView}

                  onReply={handleReply}

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

                          Type

                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Subject

                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Rating

                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Status

                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Date

                        </th>

                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">

                          Actions

                        </th>

                      </tr>

                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">

                      {feedbacks.map((feedback) => (

                        <tr key={feedback._id} className="hover:bg-gray-50">

                          <td className="px-6 py-4 whitespace-nowrap">

                            <div className="flex items-center">

                              <div className="flex-shrink-0 h-8 w-8">

                                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">

                                  <span className="text-white font-semibold text-xs">

                                    {feedback.customer?.name?.charAt(0) || 'U'}

                                  </span>

                                </div>

                              </div>

                              <div className="ml-3">

                                <div className="text-sm font-medium text-gray-900">

                                  {feedback.customer?.name || 'Anonymous'}

                                </div>

                                <div className="text-sm text-gray-500">

                                  {feedback.customer?.email || 'No email'}

                                </div>

                              </div>

                            </div>

                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">

                            <FeedbackTypeBadge type={feedback.type} />

                          </td>

                          <td className="px-6 py-4">

                            <div className="text-sm text-gray-900 max-w-xs truncate">

                              {feedback.subject || 'No subject'}

                            </div>

                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">

                            {feedback.rating ? (

                              <RatingStars rating={feedback.rating} />

                            ) : (

                              <span className="text-sm text-gray-500">No rating</span>

                            )}

                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">

                            <FeedbackStatusBadge status={feedback.status} />

                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">

                            {formatDate(feedback.createdAt)}

                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                            <div className="flex items-center justify-end space-x-2">

                              <Button

                                variant="outline"

                                size="sm"

                                onClick={() => handleView(feedback)}

                              >

                                <Eye className="h-4 w-4" />

                              </Button>

                              {feedback.status === 'pending' && (

                                <Button

                                  variant="primary"

                                  size="sm"

                                  onClick={() => handleReply(feedback)}

                                >

                                  <Reply className="h-4 w-4" />

                                </Button>

                              )}

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


