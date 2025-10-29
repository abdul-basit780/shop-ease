import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  User, Mail, Phone, Calendar, Briefcase, MapPin, 
  Edit2, Save, X, Camera, AlertCircle, CheckCircle, Send 
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { authService } from '@/lib/auth-service';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: '',
    occupation: '',
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/auth/login?returnUrl=/customer/profile');
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/customer/profile');
      
      if (response.success && response.data) {
        setProfile(response.data);
        
        // Format DOB correctly to avoid timezone issues
        let dobFormatted = '';
        if (response.data.dob) {
          // Extract just the date part (YYYY-MM-DD) without timezone conversion
          const dobDate = new Date(response.data.dob);
          const year = dobDate.getUTCFullYear();
          const month = String(dobDate.getUTCMonth() + 1).padStart(2, '0');
          const day = String(dobDate.getUTCDate()).padStart(2, '0');
          dobFormatted = `${year}-${month}-${day}`;
        }
        
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          dob: dobFormatted,
          gender: response.data.gender || '',
          occupation: response.data.occupation || '',
        });
        setImagePreview(response.data.profileImage || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let result;
      
      // If there's an image, use FormData
      if (profileImage) {
        const formDataToSend = new FormData();
        
        // Add text fields (only non-empty values)
        Object.keys(formData).forEach(key => {
          if (formData[key] && formData[key] !== '') {
            formDataToSend.append(key, formData[key]);
          }
        });

        // Add image
        formDataToSend.append('profileImage', profileImage);

        // Use fetch for FormData
        const token = authService.getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/customer/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataToSend,
        });

        result = await response.json();
      } else {
        // No image, send JSON data
        const updateData = {};
        
        // Only include fields that have values
        Object.keys(formData).forEach(key => {
          if (formData[key] && formData[key] !== '') {
            updateData[key] = formData[key];
          }
        });

        console.log('Sending update data:', updateData);

        // Check if there's at least one field to update
        if (Object.keys(updateData).length === 0) {
          toast.error('Please make at least one change');
          setIsSaving(false);
          return;
        }

        // Use apiClient for JSON
        result = await apiClient.put('/api/customer/profile', updateData);
      }

      if (result.success) {
        setProfile(result.data);
        setIsEditing(false);
        setProfileImage(null);
        setImagePreview(result.data.profileImage || null);
        
        // Update localStorage user data
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, name: result.data.name };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('userLoggedIn'));
        }
        
        toast.success('Profile updated successfully!', {
          icon: '✅',
        });
        
        // Refresh profile data
        await fetchProfile();
      } else {
        toast.error(result.error || result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    
    try {
      const response = await authService.sendVerificationEmail(profile.email);
      
      if (response.success) {
        toast.success('Verification email sent! Check your inbox.', {
          icon: '📧',
          duration: 5000,
        });
      } else {
        toast.error(response.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Error sending verification:', error);
      toast.error('Failed to send verification email');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setProfileImage(null);
    setImagePreview(profile?.profileImage || null);
    
    // Re-format DOB correctly
    let dobFormatted = '';
    if (profile?.dob) {
      const dobDate = new Date(profile.dob);
      const year = dobDate.getUTCFullYear();
      const month = String(dobDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dobDate.getUTCDate()).padStart(2, '0');
      dobFormatted = `${year}-${month}-${day}`;
    }
    
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      dob: dobFormatted,
      gender: profile?.gender || '',
      occupation: profile?.occupation || '',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-2xl mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Email Verification Banner */}
        {!profile.isVerified && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 p-6 rounded-xl shadow-md animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Verify Your Email Address
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Please verify your email address to access all features and secure your account.
                  </p>
                  <button
                    onClick={handleSendVerification}
                    disabled={isSendingVerification}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingVerification ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Verification Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Edit Button */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">My Profile</h1>
                  <p className="text-blue-100">Manage your personal information</p>
                </div>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all"
                >
                  <Edit2 className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={cancelEdit}
                    className="flex items-center space-x-2 px-4 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all"
                  >
                    <X className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Profile Image */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      profile.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-all shadow-lg">
                      <Camera className="h-5 w-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {profile.name || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Address
                  </label>
                  <div className="relative">
                    <p className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium">
                      {profile.email}
                    </p>
                    {profile.isVerified && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle className="h-5 w-5 text-green-600" title="Verified" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Phone Number
                  </label>
                  <p className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium">
                    {profile.phone || 'Not provided'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {profile.dob ? (() => {
                        // Extract just the date string (YYYY-MM-DD) to avoid any timezone issues
                        const dateStr = profile.dob.split('T')[0]; // "1996-09-03"
                        const [year, month, day] = dateStr.split('-');
                        
                        // Month names array
                        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
                        
                        return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
                      })() : 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium capitalize">
                      {profile.gender || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Briefcase className="inline h-4 w-4 mr-2" />
                    Occupation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                      placeholder="Enter occupation"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {profile.occupation || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Account Stats */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Account Status</p>
                    <p className={`text-lg font-bold ${profile.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <p className="text-sm text-purple-600 font-semibold mb-1">Total Orders</p>
                    <p className="text-lg font-bold text-gray-900">{profile.totalOrders || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-green-600 font-semibold mb-1">Member Since</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}