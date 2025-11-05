// pages/customer/orders/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, 
  XCircle, Truck, Calendar, AlertCircle, X, Star, MessageSquare
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { authService } from '@/lib/auth-service';
import FeedbackModal from '@/components/FeedbackModal';
import toast from 'react-hot-toast';

// Cancel Order Modal Component
function CancelOrderModal({ isOpen, onClose, onConfirm, isProcessing }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-modal-enter">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Cancel Order?
            </h3>
            <p className="text-gray-600">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
          </div>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold mb-1">Please note:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your order will be cancelled immediately</li>
                  <li>Refunds may take 5-7 business days</li>
                  <li>Items will be returned to stock</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keep Order
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span>Yes, Cancel Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Review Modal State
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    productId: null,
    productName: null,
    productImage: null,
    existingReview: null
  });
  const [productReviews, setProductReviews] = useState({});

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/auth/login?returnUrl=/customer/orders');
      return;
    }

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  useEffect(() => {
    if (order && order.products && order.status === 'completed') {
      const productIds = order.products.map(p => p.productId);
      fetchProductReviews(productIds);
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/api/customer/order/${id}`);
      
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductReviews = async (productIds) => {
    try {
      const currentUserId = authService.getCurrentUser()?.id;
      if (!currentUserId) return;

      const reviews = {};
      
      // Fetch feedbacks for each product
      for (const productId of productIds) {
        try {
          const response = await apiClient.get(
            `/api/public/products/${productId}/feedbacks?page=1&limit=100`
          );
          
          if (response.success && response.data?.feedbacks) {
            // Find user's review for this product - FIXED: Check both _id and id
            const userReview = response.data.feedbacks.find(
              f => {
                const customerId = f.customerId?._id || f.customerId?.id || f.customerId;
                return customerId === currentUserId;
              }
            );
            
            if (userReview) {
              reviews[productId] = userReview;
            }
          }
        } catch (error) {
          console.error(`Error fetching reviews for product ${productId}:`, error);
        }
      }
      
      setProductReviews(reviews);
    } catch (error) {
      console.error('Error fetching product reviews:', error);
    }
  };

  const handleOpenReviewModal = (product) => {
    setReviewModal({
      isOpen: true,
      productId: product.productId,
      productName: product.name,
      productImage: product.img,
      existingReview: productReviews[product.productId] || null
    });
  };

  const handleReviewSubmitted = () => {
    // Refresh product reviews after submission
    if (order && order.products) {
      const productIds = order.products.map(p => p.productId);
      fetchProductReviews(productIds);
    }
  };

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const response = await apiClient.patch(`/api/customer/order/${id}`);
      
      if (response.success) {
        toast.success('Order cancelled successfully! 🎉', {
          duration: 3000,
        });
        setOrder(response.data.order);
        setShowCancelModal(false);
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-8 w-8 text-yellow-600" />;
      case 'processing':
        return <Package className="h-8 w-8 text-blue-600" />;
      case 'shipped':
        return <Truck className="h-8 w-8 text-purple-600" />;
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Package className="h-8 w-8 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'completed':
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <Link href="/customer/orders">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Back to Orders
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link href="/customer/orders">
            <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 group">
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Orders
            </button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                Placed on {new Date(order.datetime).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-6 py-3 rounded-xl text-lg font-bold border-2 capitalize ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Status</h2>
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  {getStatusIcon(order.status)}
                </div>
              </div>
              <p className="text-center mt-4 text-gray-600">
                {order.status === 'pending' && 'Your order is being processed'}
                {order.status === 'processing' && 'We are preparing your order'}
                {order.status === 'shipped' && 'Your order is on the way'}
                {order.status === 'completed' && 'Your order has been delivered'}
                {order.status === 'cancelled' && 'This order has been cancelled'}
              </p>
            </div>

            {/* Products with Review Option */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Items ({order.products.length})
              </h2>
              <div className="space-y-4">
                {order.products.map((product, idx) => (
                  <div key={idx} className="border-2 border-gray-100 rounded-xl overflow-hidden hover:border-blue-200 transition-colors">
                    <div className="flex gap-4 p-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.img ? (
                          <img
                            src={product.img}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Quantity: {product.quantity} × ${product.price.toFixed(2)}
                        </p>
                        {product.selectedOptions && product.selectedOptions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {product.selectedOptions.map((opt, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                {opt.optionTypeName}: {opt.value}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-lg font-bold text-blue-600">
                          ${product.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Review Section - Only show for delivered orders */}
                    {order.status === 'completed' && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        {productReviews[product.productId] ? (
                          // Show existing review
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < productReviews[product.productId].rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                You rated this {productReviews[product.productId].rating}/5
                              </span>
                            </div>
                            <button
                              onClick={() => handleOpenReviewModal(product)}
                              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Edit Review
                            </button>
                          </div>
                        ) : (
                          // Show write review button
                          <button
                            onClick={() => handleOpenReviewModal(product)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                          >
                            <Star className="h-5 w-5" />
                            Write a Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{order.address}</p>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 space-y-6">
              {/* Order Summary */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">${((order.subtotal || order.totalAmount)).toFixed(2)}</span>
                  </div>
                  {(order.subtotal !== undefined) && (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span className="font-semibold">${(order.tax || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className={`font-semibold ${order.shipping === 0 ? 'text-green-600' : ''}`}>
                          {order.shipping === 0 ? 'FREE' : `$${(order.shipping || 0).toFixed(2)}`}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-2xl text-blue-600">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Payment</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {order.payment?.method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 capitalize ${getPaymentStatusColor(order.payment?.status)}`}>
                      {order.payment?.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold text-gray-900">
                      ${order.payment?.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cancel Order Button */}
              {order.canCancel && (
                <div className="border-t pt-6">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-red-600 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Cancel Order</span>
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    You can cancel this order before it's processed
                  </p>
                </div>
              )}

              {/* Help */}
              <div className="border-t pt-6">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Need Help?</p>
                    <p className="text-sm text-gray-600">
                      Contact our support team if you have any questions about your order.
                    </p>
                    <Link href="/contact">
                      <button className="mt-3 text-sm text-blue-600 font-semibold hover:text-blue-700">
                        Contact Support →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        isProcessing={isCancelling}
      />

      {/* Review Modal */}
      <FeedbackModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ ...reviewModal, isOpen: false })}
        productId={reviewModal.productId}
        orderId={order?.id}
        productName={reviewModal.productName}
        productImage={reviewModal.productImage}
        existingReview={reviewModal.existingReview}
        onReviewSubmitted={handleReviewSubmitted}
      />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-modal-enter { animation: modal-enter 0.3s ease-out; }
      `}</style>
    </div>
  );
}