import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AdminLayout } from '../index';
import { Users, Mail, Phone, MapPin, Calendar, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';

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

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, statusFilter]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      
      // Mock customers data
      const mockCustomers: Customer[] = [
        {
          id: 'CUST001',
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, USA',
          joinDate: '2024-01-15',
          orders: 12,
          totalSpent: 1250.75,
          status: 'active',
          lastOrder: '2024-03-20'
        },
        {
          id: 'CUST002',
          name: 'Mike Chen',
          email: 'mike.chen@email.com',
          phone: '+1 (555) 234-5678',
          location: 'San Francisco, USA',
          joinDate: '2024-02-03',
          orders: 8,
          totalSpent: 890.50,
          status: 'active',
          lastOrder: '2024-03-18'
        },
        {
          id: 'CUST003',
          name: 'Emma Wilson',
          email: 'emma.wilson@email.com',
          phone: '+1 (555) 345-6789',
          location: 'Chicago, USA',
          joinDate: '2024-01-28',
          orders: 5,
          totalSpent: 450.25,
          status: 'active',
          lastOrder: '2024-03-15'
        },
        {
          id: 'CUST004',
          name: 'David Brown',
          email: 'david.b@email.com',
          phone: '+1 (555) 456-7890',
          location: 'Miami, USA',
          joinDate: '2023-12-10',
          orders: 3,
          totalSpent: 275.00,
          status: 'inactive',
          lastOrder: '2024-02-28'
        },
        {
          id: 'CUST005',
          name: 'Lisa Rodriguez',
          email: 'lisa.r@email.com',
          phone: '+1 (555) 567-8901',
          location: 'Los Angeles, USA',
          joinDate: '2024-02-20',
          orders: 15,
          totalSpent: 2100.00,
          status: 'active',
          lastOrder: '2024-03-22'
        },
        {
          id: 'CUST006',
          name: 'James Wilson',
          email: 'james.w@email.com',
          phone: '+1 (555) 678-9012',
          location: 'Seattle, USA',
          joinDate: '2024-01-05',
          orders: 6,
          totalSpent: 620.80,
          status: 'active',
          lastOrder: '2024-03-19'
        },
        {
          id: 'CUST007',
          name: 'Maria Garcia',
          email: 'maria.g@email.com',
          phone: '+1 (555) 789-0123',
          location: 'Austin, USA',
          joinDate: '2023-11-15',
          orders: 2,
          totalSpent: 180.50,
          status: 'inactive',
          lastOrder: '2024-01-30'
        },
        {
          id: 'CUST008',
          name: 'Robert Kim',
          email: 'robert.k@email.com',
          phone: '+1 (555) 890-1234',
          location: 'Boston, USA',
          joinDate: '2024-03-01',
          orders: 4,
          totalSpent: 320.25,
          status: 'active',
          lastOrder: '2024-03-21'
        }
      ];
      
      setCustomers(mockCustomers);
      
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    setFilteredCustomers(filtered);
  };

  const deleteCustomer = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        setCustomers(prev => prev.filter(customer => customer.id !== id));
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout title="Customers Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Customers</h1>
            <p className="text-gray-600 mt-1">View and manage your customer database</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push('/admin/customers/add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search customers by name, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.reduce((sum, customer) => sum + customer.orders, 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${customers.reduce((sum, customer) => sum + customer.totalSpent, 0).toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customers...</p>
          </div>
        )}

        {/* Customers Table */}
        {!isLoading && filteredCustomers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Orders
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Total Spent
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Last Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                            <div className="text-xs text-gray-500">ID: {customer.id}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined {formatDate(customer.joinDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {customer.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {customer.phone}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {customer.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {customer.orders} orders
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${customer.totalSpent.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(customer.lastOrder)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => router.push(`/admin/customers/${customer.id}`)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md transition-colors border border-blue-200 text-xs font-medium flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                          <button 
                            onClick={() => router.push(`/admin/customers/edit/${customer.id}`)}
                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-md transition-colors border border-green-200 text-xs font-medium flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md transition-colors border border-red-200 text-xs font-medium flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{filteredCustomers.length}</span> customers
                </p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCustomers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-4">
              <Users className="w-20 h-20 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start building your customer database by adding your first customer.'
              }
            </p>
            {(searchTerm || statusFilter !== 'all') ? (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                Clear Filters
              </button>
            ) : (
              <button 
                onClick={() => router.push('/admin/customers/add')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium inline-flex items-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Add Your First Customer
              </button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}