import { useState, useEffect } from 'react';
import { MapPin, Edit2, Trash2, Plus, X, Check } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function AddressManager({ 
  mode = 'manage', // 'manage' or 'select'
  onSelectAddress = null, // callback for checkout
  selectedAddressId = null, // for checkout selection
  showAddButton = true,
  allowEdit = true,
  allowDelete = true
}) {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/customer/address');
      if (response.success && response.data) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/api/customer/address', addressForm);
      if (response.success) {
        toast.success('Address added successfully!');
        setAddresses([...addresses, response.data]);
        setIsAddingAddress(false);
        setAddressForm({ street: '', city: '', state: '', zipCode: '' });
        
        // Auto-select new address in checkout mode
        if (mode === 'select' && onSelectAddress) {
          onSelectAddress(response.data);
        }
      }
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`/api/customer/address/${editingAddressId}`, addressForm);
      if (response.success) {
        toast.success('Address updated successfully!');
        setAddresses(addresses.map(addr => addr.id === editingAddressId ? response.data : addr));
        setEditingAddressId(null);
        setAddressForm({ street: '', city: '', state: '', zipCode: '' });
      }
    } catch (error) {
      toast.error('Failed to update address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await apiClient.delete(`/api/customer/address/${addressId}`);
      if (response.success) {
        toast.success('Address deleted successfully!');
        setAddresses(addresses.filter(addr => addr.id !== addressId));
        
        // Clear selection if deleted address was selected
        if (mode === 'select' && selectedAddressId === addressId && onSelectAddress) {
          onSelectAddress(null);
        }
      }
    } catch (error) {
      toast.error('Failed to delete address');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const startEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode
    });
    setIsAddingAddress(false);
  };

  const cancelAddressEdit = () => {
    setEditingAddressId(null);
    setIsAddingAddress(false);
    setAddressForm({ street: '', city: '', state: '', zipCode: '' });
  };

  const handleSelectAddress = (address) => {
    if (mode === 'select' && onSelectAddress) {
      onSelectAddress(address);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add/Edit Form */}
      {(isAddingAddress || editingAddressId) && (
        <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress} className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingAddressId ? 'Edit Address' : 'Add New Address'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
              <input
                type="text"
                name="street"
                value={addressForm.street}
                onChange={handleAddressChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={addressForm.city}
                onChange={handleAddressChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                placeholder="St John's"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">State/Province</label>
              <input
                type="text"
                name="state"
                value={addressForm.state}
                onChange={handleAddressChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                placeholder="NL"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Zip/Postal Code</label>
              <input
                type="text"
                name="zipCode"
                value={addressForm.zipCode}
                onChange={handleAddressChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                placeholder="A1B 1C1"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={cancelAddressEdit}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              {editingAddressId ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </form>
      )}

      {/* Address List */}
      {addresses.length === 0 && !isAddingAddress && !editingAddressId ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No addresses saved yet</p>
          <p className="text-gray-400 text-sm mt-2">Add your first delivery address</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => {
            const isSelected = mode === 'select' && selectedAddressId === address.id;
            
            return (
              <div
                key={address.id}
                onClick={() => handleSelectAddress(address)}
                className={`relative p-6 rounded-xl border-2 transition-all ${
                  mode === 'select' 
                    ? 'cursor-pointer hover:shadow-lg' 
                    : ''
                } ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:shadow-md'
                }`}
              >
                {/* Selection Indicator */}
                {mode === 'select' && isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="font-bold text-gray-900">
                      {mode === 'select' ? 'Delivery Address' : 'Address'}
                    </span>
                  </div>
                  
                  {/* Action Buttons - Only in manage mode */}
                  {mode === 'manage' && (
                    <div className="flex space-x-2">
                      {allowEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditAddress(address);
                          }}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {allowDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(address.id);
                          }}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-gray-700">
                  <p className="font-medium">{address.street}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Address Button */}
      {showAddButton && !isAddingAddress && !editingAddressId && addresses.length > 0 && (
        <button
          onClick={() => setIsAddingAddress(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Address</span>
        </button>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Address?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAddress(deleteConfirmId)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}