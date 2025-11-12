import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  ArrowLeft,
  MessageSquare, 
  User, 
  Mail, 
  Phone, 
  Calendar,
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
  Reply,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Eye
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
          <Link
            href="/"
            className="flex items-center space-x-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 transition-colors hover:text-primary-600"
            aria-label="Go to ShopEase storefront"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">SE</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ShopEase</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </Link>
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

// Rating Stars Component
const RatingStars = ({ rating, maxRating = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
    </div>
  );
};

// Feedback Type Badge Component
const FeedbackTypeBadge = ({ type }) => {
  const typeConfig = {
    review: { color: 'bg-blue-100 text-blue-800', icon: Star, label: 'Review' },
    complaint: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Complaint' },
    suggestion: { color: 'bg-green-100 text-green-800', icon: ThumbsUp, label: 'Suggestion' },
    question: { color: 'bg-purple-100 text-purple-800', icon: MessageSquare, label: 'Question' },
    bug: { color: 'bg-orange-100 text-orange-800', icon: Flag, label: 'Bug' },
  };

  const config = typeConfig[type] || typeConfig.review;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-2" />
      {config.label || (type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown')}
    </span>
  );
};

// Feedback Status Badge Component
const FeedbackStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    reviewed: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Reviewed' },
    resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Resolved' },
    closed: { color: 'bg-gray-100 text-gray-800', icon: X, label: 'Closed' },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-2" />
      {config.label || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown')}
    </span>
  );
};

// Main Feedback View Component
export default function FeedbackViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isLoading, isAdmin } = useAdminAuth();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchFeedback = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      console.log('Fetching feedback:', id);
      const response = await apiClient.get(`/api/admin/feedback/${id}`);
      console.log('Feedback response:', response);
      
      if (response.success && response.data) {
        const feedbackData = response.data;
        // Handle productId - it might be an object or string
        if (feedbackData.productId && typeof feedbackData.productId === 'object') {
          feedbackData.productId = feedbackData.productId._id || feedbackData.productId.id || feedbackData.productId;
        }
        setFeedback(feedbackData);
      } else {
        toast.error(response.message || 'Feedback not found');
        router.push('/admin/feedback');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      if (error.response?.status === 404) {
        toast.error('Feedback not found');
        router.push('/admin/feedback');
      } else if (error.response?.status === 401) {
        toast.error('Unauthorized access');
        router.push('/auth/login');
      } else if (error.response?.status === 403) {
        toast.error('Access denied');
        router.push('/admin');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load feedback details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await apiClient.delete(`/api/admin/feedback/${id}`);
      console.log('Delete feedback response:', response);

      if (response.success) {
        toast.success('Feedback deleted successfully');
        router.push('/admin/feedback');
      } else {
        toast.error(response.message || 'Failed to delete feedback');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to delete feedback');
    } finally {
      setDeleting(false);
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

  useEffect(() => {
    if (id && isAdmin) {
      fetchFeedback();
    }
  }, [id, isAdmin]);

  // Don't render anything if authentication is still loading or user is not admin
  if (isLoading || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout title="Feedback Details" subtitle="Loading feedback information...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!feedback) {
    return (
      <AdminLayout title="Feedback Not Found" subtitle="The requested feedback could not be found">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Feedback Not Found</h3>
          <p className="text-gray-600 mb-6">The feedback you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/admin/feedback')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feedback
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Feedback #${feedback._id?.slice(-8)}`} subtitle="View feedback details and respond">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/feedback')}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feedback
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Feedback #{feedback._id?.slice(-8)}
            </h2>
            <p className="text-gray-600">
              From {feedback.customerId?.name || 'Anonymous'} • {formatDate(feedback.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:items-center">
          <Button
            variant="outline"
            onClick={fetchFeedback}
            isLoading={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleting}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feedback Details */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Feedback Details</h3>
                <div className="flex items-center space-x-2">
                  <FeedbackTypeBadge type={feedback.type} />
                  <FeedbackStatusBadge status={feedback.status} />
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Rating */}
                {feedback.rating && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Rating</h4>
                    <RatingStars rating={feedback.rating} />
                  </div>
                )}

                {/* Product Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Product</h4>
                  <p className="text-gray-700">{feedback.productName || 'No product specified'}</p>
                </div>

                {/* Comment */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Comment</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {feedback.comment || 'No comment provided'}
                    </p>
                  </div>
                </div>
              </div>
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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {feedback.customerId?.name || 'Anonymous'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {feedback.customerId?.email || 'No email'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{feedback.customerId?.email || 'No email'}</span>
                  </div>
                  
                  {feedback.customerId?.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{feedback.customerId.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted {formatDate(feedback.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Feedback Metadata */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Feedback Information</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <FeedbackTypeBadge type={feedback.type} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <FeedbackStatusBadge status={feedback.status} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-gray-600">Submitted</span>
                  <span className="text-sm font-medium">
                    {formatDate(feedback.createdAt)}
                  </span>
                </div>
                {feedback.updatedAt && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm font-medium">
                      {formatDate(feedback.updatedAt)}
                    </span>
                  </div>
                )}
                {feedback.rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rating</span>
                    <RatingStars rating={feedback.rating} />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

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
                  onClick={() => router.push(`/admin/customers/view/${feedback.customerId?._id}`)}
                >
                  <User className="h-4 w-4 mr-2" />
                  View Customer
                </Button>
                {feedback.productId && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const productId = typeof feedback.productId === 'object' 
                        ? (feedback.productId.id || feedback.productId._id || feedback.productId)
                        : feedback.productId;
                      router.push(`/admin/products/view/${productId}`);
                    }}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    View Product
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (feedback.customerId?.email) {
                      window.location.href = `mailto:${feedback.customerId.email}`;
                    } else {
                      toast.error('Customer email not available');
                    }
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Customer
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

