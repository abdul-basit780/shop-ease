import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CreditCard, Banknote, MapPin, Check, ArrowLeft, Lock, ShoppingBag, Package } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { authService } from '@/lib/auth-service';
import { useCartWishlist } from '@/contexts/CartWishlistContext';
import AddressManager from '@/components/AddressManager';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// Stripe Payment Form Component
function StripeCheckoutForm({ cart, address, onPaymentSuccess, onPaymentError, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const shippingCost = cart.totalAmount >= 50 ? 0 : 9.99;
  const taxAmount = cart.totalAmount * 0.15;
  const finalTotal = cart.totalAmount + shippingCost + taxAmount;

   useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setError('Payment system is not configured. Please contact support.');
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe not loaded');
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      // Step 1: Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          address: {
            line1: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.zipCode,
            country: address.country || 'US',
          },
        },
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message);
        setProcessing(false);
        return;
      }

      // Step 2: Create order with Stripe payment method
      const orderData = {
        addressId: address.id,
        paymentMethod: 'stripe',
        stripePaymentMethodId: paymentMethod.id,
      };

      const response = await apiClient.post('/api/customer/order', orderData);

      if (!response.success) {
        throw new Error(response.message || response.error || 'Failed to create order');
      }

      // Step 3: Confirm payment with Stripe
      if (response.data.clientSecret) {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          response.data.clientSecret,
          {
            payment_method: paymentMethod.id,
          }
        );

        if (confirmError) {
          setError(confirmError.message);
          setProcessing(false);
          return;
        }

        // Payment successful
        if (paymentIntent.status === 'succeeded') {
          // Update payment status in backend
          try {
            await apiClient.patch(`/api/customer/order/${response.data.order.id}`, {
              action: 'confirmPayment'
            });
          } catch (confirmErr) {
            console.error('Failed to update payment status:', confirmErr);
          }

          onPaymentSuccess(response.data);
        } else {
          throw new Error(`Payment status: ${paymentIntent.status}`);
        }
      } else {
        throw new Error('No payment client secret received');
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
      onPaymentError(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border-2 border-gray-200 rounded-xl bg-white">
        <label className="block mb-2 font-semibold text-gray-900">Card Details</label>
        <div className="p-3 border-2 border-gray-300 rounded-lg bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl">
          <p className="font-semibold">Payment Failed</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold">${cart.totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : ''}`}>
            {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span className="font-semibold">${taxAmount.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
          <span>Total Amount</span>
          <span className="text-2xl text-blue-600">${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              <span>Pay ${finalTotal.toFixed(2)}</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
        <Lock className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false); // NEW: Track order completion
  const hasCheckedAuth = useRef(false);
  const hasCheckedCart = useRef(false); // NEW: Track if we've checked cart

  // Get cart from context
  const { cart, isLoadingCart, fetchCart } = useCartWishlist();
  
useEffect(() => {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  console.log('Stripe Key Loaded:', stripeKey ? 'Yes' : 'No');
  console.log('Key Type:', stripeKey?.startsWith('pk_live_') ? 'LIVE' : 
              stripeKey?.startsWith('pk_test_') ? 'TEST' : 'INVALID');
  console.log('Protocol:', window.location.protocol);
  console.log('Hostname:', window.location.hostname);
}, []);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    if (!authService.isAuthenticated()) {
      router.push('/auth/login?returnUrl=/customer/checkout');
      return;
    }

    const user = authService.getCurrentUser();
    if (user?.role === 'admin') {
      toast.error('This page is only accessible to customers', {
        icon: '🚫',
        duration: 1000,
      });
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
      return;
    }

    // Fetch cart if not already loaded
    if (!cart) {
      fetchCart();
    }
  }, [router, cart, fetchCart]);

  // Check if cart is empty ONLY once on mount, not during order processing
  useEffect(() => {
    if (hasCheckedCart.current || orderProcessing) return; // Don't check if order is processing
    
    if (!isLoadingCart && cart) {
      if (!cart.products || cart.products.length === 0) {
        hasCheckedCart.current = true; // Mark as checked
        toast.error('Your cart is empty');
        setTimeout(() => router.push('/customer/all-products'), 1500);
      } else {
        hasCheckedCart.current = true; // Mark as checked after confirming cart has items
      }
    }
  }, [isLoadingCart, cart, router, orderProcessing]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    if (address) {
      toast.success('Address selected', {
        icon: '📍',
        duration: 1500,
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address', {
        icon: '📍',
        duration: 2000,
      });
      return;
    }

    if (!cart || cart.products.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const unavailableProducts = cart.products.filter(p => !p.isAvailable);
    if (unavailableProducts.length > 0) {
      toast.error('Some products in your cart are unavailable', {
        icon: '⚠️',
      });
      return;
    }

    if (paymentMethod === 'stripe') {
      setShowStripeForm(true);
      return;
    }

    // Cash on Delivery
    setIsProcessing(true);
    setOrderProcessing(true); // Mark order as processing
    
    try {
      const orderData = {
        addressId: selectedAddress.id,
        paymentMethod: 'cash'
      };

      const response = await apiClient.post('/api/customer/order', orderData);

      if (response.success) {
        toast.success('Order placed successfully! 🎉', {
          duration: 2000,
        });
        
        // Clear cart - this will trigger context update
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/customer/orders/${response.data.order.id}`);
        }, 1000);
      } else {
        toast.error(response.message || response.error || 'Failed to place order');
        setOrderProcessing(false); // Reset on error
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to process order');
      setOrderProcessing(false); // Reset on error
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (orderData) => {
    setOrderProcessing(true); // Mark order as processing
    
    toast.success('Payment successful! Order placed. 🎉', {
      duration: 2000,
    });
    
    // Clear cart
    window.dispatchEvent(new Event('cartUpdated'));
    
    setTimeout(() => {
      router.push(`/customer/orders`);
    }, 1000);
  };

  const handlePaymentError = (error) => {
    toast.error(error.message || 'Payment failed. Please try again.');
    setShowStripeForm(false);
    setOrderProcessing(false); // Reset on error
  };

  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while order is being processed
  if (orderProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6 animate-pulse">
              <Lock className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Processing Your Order...</h2>
            <p className="text-gray-600 mb-8">Please wait while we complete your order</p>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link href="/customer/all-products">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105">
              Browse Products
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = cart.totalAmount >= 50 ? 0 : 9.99;
  const taxAmount = cart.totalAmount * 0.15;
  const finalTotal = cart.totalAmount + shippingCost + taxAmount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/customer/cart">
            <button className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Cart
            </button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order securely</p>
        </div>

        {!showStripeForm ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Address & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
                </div>

                <AddressManager 
                  mode="select"
                  onSelectAddress={handleAddressSelect}
                  selectedAddressId={selectedAddress?.id}
                  showAddButton={true}
                  allowEdit={true}
                  allowDelete={true}
                />

                {selectedAddress && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center space-x-2 text-green-700">
                      <Check className="h-5 w-5" />
                      <span className="font-semibold">Address selected for delivery</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => setPaymentMethod('cash')}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-sm'
                    }`}
                  >
                    {paymentMethod === 'cash' && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="flex items-center space-x-4 pr-8">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Banknote className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('stripe')}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-sm'
                    }`}
                  >
                    {paymentMethod === 'stripe' && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="flex items-center space-x-4 pr-8">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                        <p className="text-sm text-gray-600">Pay securely with Stripe</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {cart.products.map((item, idx) => (
                    <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.img ? (
                          <img 
                            src={item.img} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-blue-600 mt-1">${item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">${cart.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                      {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-2xl text-blue-600">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !selectedAddress}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span>{paymentMethod === 'stripe' ? 'Continue to Payment' : 'Place Order'}</span>
                    </>
                  )}
                </button>

                {!selectedAddress && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                    ⚠️ Please select a delivery address
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Payment Details</h2>
              </div>
              <Elements stripe={stripePromise}>
                <StripeCheckoutForm
                  cart={cart}
                  address={selectedAddress}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  onBack={() => setShowStripeForm(false)}
                />
              </Elements>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}