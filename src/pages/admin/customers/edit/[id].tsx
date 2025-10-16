import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AdminLayout } from '../../index';
import { Users, ArrowLeft, Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

// Mock customer data
const mockCustomers: Record<string, CustomerForm> = {
  'CUST001': {
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    joinDate: '2024-01-15',
    status: 'active'
  },
  'CUST002': {
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, USA',
    joinDate: '2024-02-03',
    status: 'active'
  },
  'CUST003': {
    name: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    phone: '+1 (555) 345-6789',
    location: 'Chicago, USA',
    joinDate: '2024-01-28',
    status: 'active'
  },
  'CUST004': {
    name: 'David Brown',
    email: 'david.b@email.com',
    phone: '+1 (555) 456-7890',
    location: 'Miami, USA',
    joinDate: '2023-12-10',
    status: 'inactive'
  },
  'CUST005': {
    name: 'Lisa Rodriguez',
    email: 'lisa.r@email.com',
    phone: '+1 (555) 567-8901',
    location: 'Los Angeles, USA',
    joinDate: '2024-02-20',
    status: 'active'
  },
  'CUST006': {
    name: 'James Wilson',
    email: 'james.w@email.com',
    phone: '+1 (555) 678-9012',
    location: 'Seattle, USA',
    joinDate: '2024-01-05',
    status: 'active'
  },
  'CUST007': {
    name: 'Maria Garcia',
    email: 'maria.g@email.com',
    phone: '+1 (555) 789-0123',
    location: 'Austin, USA',
    joinDate: '2023-11-15',
    status: 'inactive'
  },
  'CUST008': {
    name: 'Robert Kim',
    email: 'robert.k@email.com',
    phone: '+1 (555) 890-1234',
    location: 'Boston, USA',
    joinDate: '2024-03-01',
    status: 'active'
  }
};

export default function EditCustomer() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customerExists, setCustomerExists] = useState(true);
  const [formData, setFormData] = useState<CustomerForm>({
    name: '',
    email: '',
    phone: '',
    location: '',
    joinDate: '',
    status: 'active'
  });

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        setIsLoading(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const customer = mockCustomers[id as keyof typeof mockCustomers];
          if (customer) {
            setFormData(customer);
            setCustomerExists(true);
          } else {
            setCustomerExists(false);
          }
        } catch (error) {
          console.error('Error fetching customer:', error);
          setCustomerExists(false);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCustomer();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the mock customer data
      if (id) {
        mockCustomers[id as keyof typeof mockCustomers] = {
          ...mockCustomers[id as keyof typeof mockCustomers],
          ...formData
        };
      }
      
      console.log('Updated customer:', { id, ...formData });
      
      alert('Customer updated successfully!');
      router.push('/admin/customers');
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Error updating customer. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Customer">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => router.push('/admin/customers')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
              <p className="text-gray-600">Loading customer details...</p>
            </div>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!customerExists) {
    return (
      <AdminLayout title="Customer Not Found">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => router.push('/admin/customers')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Not Found</h1>
              <p className="text-gray-600">The customer you're looking for doesn't exist.</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Not Found</h3>
            <p className="text-gray-600 mb-6">Customer with ID "{id}" was not found.</p>
            <button
              onClick={() => router.push('/admin/customers')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Customers
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Customer">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.push('/admin/customers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
            <p className="text-gray-600">Update customer details for {id}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter customer full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="customer@email.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Join Date */}
              <div>
                <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Join Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    id="joinDate"
                    name="joinDate"
                    required
                    value={formData.joinDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin/customers')}
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
                    <Users className="h-4 w-4" />
                    Update Customer
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