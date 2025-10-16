import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AdminLayout } from '../../index';
import { ShoppingBag, ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';

interface OrderForm {
  customer: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  date: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  shipping: string;
  shippingAddress: string;
  trackingNumber: string;
}

// Mock order data
const mockOrders: Record<string, OrderForm> = {
  'ORD-001': {
    customer: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com',
    customerPhone: '+1 (555) 123-4567',
    customerAddress: '123 Main St, New York, NY 10001, USA',
    date: '2024-03-20',
    amount: 149.99,
    status: 'delivered',
    payment: 'paid',
    paymentMethod: 'Credit Card',
    shipping: 'Express',
    shippingAddress: '123 Main St, New York, NY 10001, USA',
    trackingNumber: 'TRK123456789'
  },
  'ORD-002': {
    customer: 'Mike Chen',
    customerEmail: 'mike.chen@email.com',
    customerPhone: '+1 (555) 234-5678',
    customerAddress: '456 Oak Ave, San Francisco, CA 94102, USA',
    date: '2024-03-19',
    amount: 299.50,
    status: 'shipped',
    payment: 'paid',
    paymentMethod: 'PayPal',
    shipping: 'Standard',
    shippingAddress: '456 Oak Ave, San Francisco, CA 94102, USA',
    trackingNumber: 'TRK987654321'
  },
  'ORD-003': {
    customer: 'Emma Wilson',
    customerEmail: 'emma.wilson@email.com',
    customerPhone: '+1 (555) 345-6789',
    customerAddress: '789 Pine St, Chicago, IL 60601, USA',
    date: '2024-03-18',
    amount: 89.99,
    status: 'processing',
    payment: 'paid',
    paymentMethod: 'Credit Card',
    shipping: 'Express',
    shippingAddress: '789 Pine St, Chicago, IL 60601, USA',
    trackingNumber: 'TRK456789123'
  },
  'ORD-004': {
    customer: 'David Brown',
    customerEmail: 'david.b@email.com',
    customerPhone: '+1 (555) 456-7890',
    customerAddress: '321 Beach Blvd, Miami, FL 33101, USA',
    date: '2024-03-17',
    amount: 199.99,
    status: 'pending',
    payment: 'pending',
    paymentMethod: 'Credit Card',
    shipping: 'Standard',
    shippingAddress: '321 Beach Blvd, Miami, FL 33101, USA',
    trackingNumber: ''
  },
  'ORD-005': {
    customer: 'Lisa Rodriguez',
    customerEmail: 'lisa.r@email.com',
    customerPhone: '+1 (555) 567-8901',
    customerAddress: '654 Sunset Blvd, Los Angeles, CA 90001, USA',
    date: '2024-03-16',
    amount: 75.50,
    status: 'delivered',
    payment: 'paid',
    paymentMethod: 'Credit Card',
    shipping: 'Express',
    shippingAddress: '654 Sunset Blvd, Los Angeles, CA 90001, USA',
    trackingNumber: 'TRK789123456'
  }
};

export default function EditOrder() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [orderExists, setOrderExists] = useState(true);
  const [formData, setFormData] = useState<OrderForm>({
    customer: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    date: '',
    amount: 0,
    status: 'pending',
    payment: 'pending',
    paymentMethod: '',
    shipping: '',
    shippingAddress: '',
    trackingNumber: ''
  });

  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        setIsLoading(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const order = mockOrders[id as keyof typeof mockOrders];
          if (order) {
            setFormData(order);
            setOrderExists(true);
          } else {
            setOrderExists(false);
          }
        } catch (error) {
          console.error('Error fetching order:', error);
          setOrderExists(false);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrder();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the mock order data
      if (id) {
        mockOrders[id as keyof typeof mockOrders] = {
          ...mockOrders[id as keyof typeof mockOrders],
          ...formData
        };
      }
      
      console.log('Updated order:', { id, ...formData });
      
      alert('Order updated successfully!');
      router.push('/admin/orders');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const getStatusIcon = (status: OrderForm['status']) => {
    const icons = {
      pending: Clock,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle
    };
    const Icon = icons[status];
    return <Icon className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Order">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => router.push('/admin/orders')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Order</h1>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!orderExists) {
    return (
      <AdminLayout title="Order Not Found">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => router.push('/admin/orders')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
              <p className="text-gray-600">The order you're looking for doesn't exist.</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-600 mb-6">Order with ID "{id}" was not found.</p>
            <button
              onClick={() => router.push('/admin/orders')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Order">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.push('/admin/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Order</h1>
            <p className="text-gray-600">Update order details for {id}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order ID (Read-only) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  {id}
                </div>
                <p className="text-xs text-gray-500 mt-1">Order ID cannot be changed</p>
              </div>

              {/* Customer Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Customer Information</h3>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="customer"
                  name="customer"
                  required
                  value={formData.customer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  required
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="customer@email.com"
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  required
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Address *
                </label>
                <textarea
                  id="customerAddress"
                  name="customerAddress"
                  required
                  rows={3}
                  value={formData.customerAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full address"
                />
              </div>

              {/* Order Details */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Order Details</h3>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Amount ($) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleNumberChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="payment" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status *
                </label>
                <select
                  id="payment"
                  name="payment"
                  required
                  value={formData.payment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  required
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Method</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>

              <div>
                <label htmlFor="shipping" className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Method *
                </label>
                <select
                  id="shipping"
                  name="shipping"
                  required
                  value={formData.shipping}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Method</option>
                  <option value="Standard">Standard</option>
                  <option value="Express">Express</option>
                  <option value="Overnight">Overnight</option>
                  <option value="International">International</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Address *
                </label>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  required
                  rows={3}
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter shipping address"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  name="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tracking number"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if no tracking number available</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin/orders')}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Update Order
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}