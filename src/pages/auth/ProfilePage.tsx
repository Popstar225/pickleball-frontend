import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { updateUser } from '../../store/slices/usersSlice';
import { StateAutocomplete } from '@/components/ui/StateAutocomplete';

import { toast } from 'sonner';

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    first_name: string;
    last_name: string;
    state: string;
    city: string;
    phone: string;
    skill_level: '' | '2.5' | '3.5' | '4.5' | '5+';
  }>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    state: user?.state || '',
    city: user?.city || '',
    phone: user?.phone || '',
    skill_level: user?.skill_level || ''
  });

  // Update edit form when user data changes
  React.useEffect(() => {
    if (user) {
      // Split full_name into first_name and last_name for the form
      const fullName = user.full_name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setEditForm({
        first_name: firstName,
        last_name: lastName,
        state: user.state || '',
        city: user.city || '',
        phone: user.phone || '',
        skill_level: user.skill_level || ''
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset to current user data when canceling
      const fullName = user?.full_name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setEditForm({
        first_name: firstName,
        last_name: lastName,
        state: user?.state || '',
        city: user?.city || '',
        phone: user?.phone || '',
        skill_level: user?.skill_level || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      // Transform form data to match backend API expectations
      const userData = {
        full_name: `${editForm.first_name} ${editForm.last_name}`.trim(),
        state: editForm.state || undefined,
        city: editForm.city || undefined,
        phone: editForm.phone || undefined,
        skill_level: editForm.skill_level || undefined
      };

      await dispatch(updateUser({ id: user.id, userData }));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case '5+': return 'bg-purple-100 text-purple-800';
      case '4.5': return 'bg-orange-100 text-orange-800';
      case '3.5': return 'bg-green-100 text-green-800';
      case '2.5': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (fullName: string) => {
    const nameParts = fullName.split(' ');
    const first = nameParts[0]?.charAt(0) || '';
    const last = nameParts.slice(1).join(' ')?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white shadow-lg rounded-lg mx-4 my-8 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="animate-on-scroll text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              My Profile
            </h1>
            <p className="animate-on-scroll text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-600">
              Manage your account and track your pickleball journey
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="animate-on-scroll sticky top-8 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 text-center border-b border-gray-200">
                <div className="relative mx-auto mb-4">
                  <div className="animate-on-scroll w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {user.profile_photo ? (
                      <img src={user.profile_photo} alt={user.full_name || user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-600">
                        {getInitials(user.full_name)}
                      </span>
                    )}
                  </div>
                  <button
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 hover:scale-110 transition-transform duration-300 border border-gray-300 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <h2 className="animate-on-scroll text-2xl font-bold text-gray-900">
                  {user.full_name || user.username}
                </h2>
                <p className="animate-on-scroll text-lg text-gray-600">
                  @{user.username}
                </p>
                <div className="flex justify-center mt-4">
                  <span className={`animate-on-scroll px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(user.skill_level || '')}`}>
                    Level {user.skill_level || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="animate-on-scroll flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="animate-on-scroll flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.city && user.state && (
                  <div className="animate-on-scroll flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{user.city}, {user.state}</span>
                  </div>
                )}
                {user.date_of_birth && (
                  <div className="animate-on-scroll flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Born {formatDate(user.date_of_birth)}</span>
                  </div>
                )}
                <hr className="border-gray-200" />
                <div className="space-y-2">
                  <div className="animate-on-scroll flex justify-between text-sm">
                    <span className="text-gray-600">Member Since:</span>
                    <span>{formatDate(user.created_at)}</span>
                  </div>
                  <div className="animate-on-scroll flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMembershipStatusColor(user.membership_status)}`}>
                      {user.membership_status}
                    </span>
                  </div>
                  <div className="animate-on-scroll flex justify-between text-sm">
                    <span className="text-gray-600">Plan:</span>
                    <span className="capitalize">{user.subscription_plan}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="animate-on-scroll grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1">
                <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md shadow-sm">
                  Profile
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Rankings
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Statistics
                </button>
              </div>

              {/* Profile Tab Content */}
              <div className="space-y-6">
                <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="animate-on-scroll text-lg font-semibold text-gray-900">Personal Information</h3>
                        <p className="animate-on-scroll text-gray-600">
                          Update your profile information and preferences
                        </p>
                      </div>
                      <button
                        className={`px-3 py-2 text-sm font-medium rounded-md hover:scale-105 transition-transform duration-300 ${
                          isEditing 
                            ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        onClick={handleEditToggle}
                      >
                        {isEditing ? (
                          <>
                            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="px-6 py-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="first_name" className="animate-on-scroll block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          id="first_name"
                          value={isEditing ? editForm.first_name : (user.full_name?.split(' ')[0] || '')}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          className="animate-on-scroll w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="last_name" className="animate-on-scroll block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          id="last_name"
                          value={isEditing ? editForm.last_name : (user.full_name?.split(' ').slice(1).join(' ') || '')}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          className="animate-on-scroll w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="state" className="animate-on-scroll block text-sm font-medium text-gray-700">State</label>
                        <StateAutocomplete
                          value={isEditing ? editForm.state : user.state || ''}
                          onChange={(value) => handleInputChange('state', value)}
                          disabled={!isEditing}
                          placeholder="Search states..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="city" className="animate-on-scroll block text-sm font-medium text-gray-700">City</label>
                        <input
                          id="city"
                          type="text"
                          value={isEditing ? editForm.city : user.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          disabled={!isEditing}
                          className="animate-on-scroll w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="animate-on-scroll block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          id="phone"
                          type="tel"
                          value={isEditing ? editForm.phone : user.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          className="animate-on-scroll w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="skill_level" className="animate-on-scroll block text-sm font-medium text-gray-700">Skill Level</label>
                        <select
                          value={isEditing ? editForm.skill_level : user.skill_level || ''}
                          onChange={(e) => handleInputChange('skill_level', e.target.value)}
                          disabled={!isEditing}
                          className="animate-on-scroll w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">Select Skill Level</option>
                          <option value="2.5">2.5 - Beginner</option>
                          <option value="3.0">3.0 - Novice</option>
                          <option value="3.5">3.5 - Intermediate</option>
                          <option value="4.0">4.0 - Advanced</option>
                          <option value="4.5">4.5 - Expert</option>
                          <option value="5.0">5.0 - Professional</option>
                          <option value="5.5">5.5 - Elite</option>
                        </select>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors hover:scale-105 transition-transform duration-300"
                          onClick={handleEditToggle}
                        >
                          Cancel
                        </button>
                        <button 
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors hover:scale-105 transition-transform duration-300"
                          onClick={handleSave}
                        >
                          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-4-4l-4 4m0 0l4 4m-4-4v12" />
                          </svg>
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rankings Tab Content */}


              {/* Statistics Tab Content */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Activity Stats
                      </h3>
                    </div>
                    <div className="px-6 py-4 space-y-4">
                      <div className="animate-on-scroll flex justify-between items-center">
                        <span className="text-gray-600">Last Login</span>
                        <span className="font-semibold">
                          {user.last_login ? formatDate(user.last_login) : 'Never'}
                        </span>
                      </div>
                      <div className="animate-on-scroll flex justify-between items-center">
                        <span className="text-gray-600">Email Verified</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.email_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.email_verified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="animate-on-scroll flex justify-between items-center">
                        <span className="text-gray-600">Account Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Membership Info
                      </h3>
                    </div>
                    <div className="px-6 py-4 space-y-4">
                      <div className="animate-on-scroll flex justify-between items-center">
                        <span className="text-gray-600">Plan</span>
                        <span className="font-semibold capitalize">{user.subscription_plan}</span>
                      </div>
                      <div className="animate-on-scroll flex justify-between items-center">
                        <span className="text-gray-600">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMembershipStatusColor(user.membership_status)}`}>
                          {user.membership_status}
                        </span>
                      </div>
                      {user.membership_expires_at && (
                        <div className="animate-on-scroll flex justify-between items-center">
                          <span className="text-gray-600">Expires</span>
                          <span className="font-semibold">{formatDate(user.membership_expires_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 