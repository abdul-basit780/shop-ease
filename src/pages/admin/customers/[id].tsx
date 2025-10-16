import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AdminLayout } from '../index';
import { Users, Mail, Phone, MapPin, Calendar, ArrowLeft, Edit, ShoppingBag, DollarSign } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  orders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  lastOrder: string;
}

interface Order {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'processing' | 'pending';
  items: number;
}

export default function CustomerDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setIsLoading(true);
      
      // Mock customer data
      const mockCustomer: Customer = {
        id: id as string,
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, USA',
        joinDate: '2024-01-15',
        orders: 12,
        totalSpent: 1250.75,
        status: 'active',
        lastOrder: '2024-03-20'
      };

      // Mock orders data
      const mockOrders: Order[] = [
        { id: 'ORD-001', date: '2024-03-20', amount: 149.99, status: 'completed', items: 3 },
        { id: 'ORD-002', date: '2024-03-15', amount: 89.99, status: 'completed', items: 2 },
        { id: 'ORD-003', date: '2024-03-10', amount: 199.99, status: 'completed', items: 4 },
        { id: 'ORD-004', date: '2024-03-05', amount: 75.50, status: 'completed', items: 1 },
      ];

      setCustomer(mockCustomer);
      setOrders(mockOrders);
      
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Customer Details">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout title="Customer Not Found">
        <div className="text-center py-16">
          <Users className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Not Found</h3>
          <p className="text-gray-600 mb-6">The customer you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/customers')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Customers
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Customer Details">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin/customers')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <p className="text-gray-600">Customer ID: {customer.id}</p>
            </div>
          </div>
          <button 
            onClick={() => router.push(`/admin/customers/edit/${customer.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Customer
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-gray-900">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-gray-900">{customer.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Location</p>
                      <p className="text-gray-900">{customer.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Member Since</p>
                      <p className="text-gray-900">{formatDate(customer.joinDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{formatDate(order.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${order.amount}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Status</h3>
              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                customer.status === 'active' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {customer.status.toUpperCase()}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {customer.status === 'active' 
                  ? 'This customer is active and shopping regularly.'
                  : 'This customer has been inactive for a while.'
                }
              </p>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-600">Total Orders</span>
                  </div>
                  <span className="font-semibold text-gray-900">{customer.orders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-gray-600">Total Spent</span>
                  </div>
                  <span className="font-semibold text-gray-900">${customer.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="text-gray-600">Last Order</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatDate(customer.lastOrder)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}