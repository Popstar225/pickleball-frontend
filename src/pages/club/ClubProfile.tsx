import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const ClubProfile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    clubName: 'Elite Pickleball Club',
    email: user?.email || '',
    phone: user?.phone || '',
    website: 'www.elitepickleball.com',
    address: '123 Pickleball Lane',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: '12345',
    clubType: 'recreational',
    membershipPlan: 'premium',
    description: 'Premier pickleball club offering world-class facilities and training programs for players of all skill levels.',
    profilePhoto: user?.profile_photo || '',
    operatingHours: '6:00 AM - 10:00 PM',
    foundedYear: '2020',
    totalCourts: '8',
    amenities: ['Pro Shop', 'Locker Rooms', 'Equipment Rental', 'Café', 'Parking']
  });

  // Mock club facilities
  const facilities = [
    {
      id: 1,
      name: 'Court 1-2',
      type: 'Indoor',
      surface: 'Professional',
      lighting: 'LED',
      status: 'Available'
    },
    {
      id: 2,
      name: 'Court 3-4',
      type: 'Indoor',
      surface: 'Professional',
      lighting: 'LED',
      status: 'Available'
    },
    {
      id: 3,
      name: 'Court 5-6',
      type: 'Outdoor',
      surface: 'Concrete',
      lighting: 'Natural',
      status: 'Available'
    },
    {
      id: 4,
      name: 'Court 7-8',
      type: 'Outdoor',
      surface: 'Concrete',
      lighting: 'Natural',
      status: 'Available'
    }
  ];

  // Mock club statistics
  const clubStats = {
    totalMembers: 156,
    activeMembers: 142,
    totalCourts: 8,
    monthlyRevenue: 12500,
    averageRating: 4.6,
    totalReviews: 234,
    yearsEstablished: 4,
    tournamentsHosted: 24,
    memberRetentionRate: 89
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically save to API
    console.log('Saving club profile:', profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setProfileData({
      clubName: 'Elite Pickleball Club',
      email: user?.email || '',
      phone: user?.phone || '',
      website: 'www.elitepickleball.com',
      address: '123 Pickleball Lane',
      city: user?.city || '',
      state: user?.state || '',
      zipCode: '12345',
      clubType: 'recreational',
      membershipPlan: 'premium',
      description: 'Premier pickleball club offering world-class facilities and training programs for players of all skill levels.',
      profilePhoto: user?.profile_photo || '',
      operatingHours: '6:00 AM - 10:00 PM',
      foundedYear: '2020',
      totalCourts: '8',
      amenities: ['Pro Shop', 'Locker Rooms', 'Equipment Rental', 'Café', 'Parking']
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="animate-on-scroll text-3xl font-bold text-gray-900 mb-2">Club Profile</h1>
            <p className="animate-on-scroll text-gray-600">Manage your club information and settings</p>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="animate-on-scroll flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button 
                  onClick={handleSave} 
                  className="animate-on-scroll flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-4-4l-4 4m0 0l4 4m-4-4v12" />
                  </svg>
                  <span>Save</span>
                </button>
                <button 
                  onClick={handleCancel} 
                  className="animate-on-scroll flex items-center space-x-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Club Information */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Basic Club Information</span>
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="clubName" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Club Name</label>
                  <input
                    id="clubName"
                    type="text"
                    value={profileData.clubName}
                    onChange={(e) => handleInputChange('clubName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="website" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    id="website"
                    type="url"
                    value={profileData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Club Description</label>
                  <textarea
                    id="description"
                    value={profileData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Describe your club, facilities, and programs..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Location & Address</span>
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="address" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    id="address"
                    type="text"
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      id="city"
                      type="text"
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      id="state"
                      type="text"
                      value={profileData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      id="zipCode"
                      type="text"
                      value={profileData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Club Details */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Club Details</span>
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="clubType" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Club Type</label>
                    <select
                      value={profileData.clubType}
                      onChange={(e) => handleInputChange('clubType', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="recreational">Recreational</option>
                      <option value="competitive">Competitive</option>
                      <option value="training">Training</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="membershipPlan" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Membership Plan</label>
                    <select
                      value={profileData.membershipPlan}
                      onChange={(e) => handleInputChange('membershipPlan', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="elite">Elite</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="foundedYear" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Founded Year</label>
                    <input
                      id="foundedYear"
                      type="text"
                      value={profileData.foundedYear}
                      onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="totalCourts" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Total Courts</label>
                    <input
                      id="totalCourts"
                      type="text"
                      value={profileData.totalCourts}
                      onChange={(e) => handleInputChange('totalCourts', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="operatingHours" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Operating Hours</label>
                  <input
                    id="operatingHours"
                    type="text"
                    value={profileData.operatingHours}
                    onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Facilities & Courts</span>
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {facilities.map((facility) => (
                    <div key={facility.id} className="animate-on-scroll p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{facility.name}</h4>
                          <p className="text-sm text-gray-600">{facility.type} • {facility.surface}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          facility.status === 'Available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {facility.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Surface:</span>
                          <p className="font-medium">{facility.surface}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Lighting:</span>
                          <p className="font-medium">{facility.lighting}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Club Logo */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="animate-on-scroll text-lg font-semibold text-gray-900">Club Logo</h3>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {profileData.profilePhoto ? (
                    <img src={profileData.profilePhoto} alt="Club Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {profileData.clubName.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <button className="animate-on-scroll px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors w-full text-sm">
                    Change Logo
                  </button>
                )}
              </div>
            </div>

            {/* Club Statistics */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>Club Stats</span>
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="animate-on-scroll text-2xl font-bold text-blue-600">{clubStats.totalMembers}</div>
                    <div className="animate-on-scroll text-sm text-gray-600">Total Members</div>
                  </div>
                  <div>
                    <div className="animate-on-scroll text-2xl font-bold text-green-600">{clubStats.totalCourts}</div>
                    <div className="animate-on-scroll text-sm text-gray-600">Total Courts</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="animate-on-scroll text-2xl font-bold text-purple-600">{clubStats.averageRating}</div>
                    <div className="animate-on-scroll text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div>
                    <div className="animate-on-scroll text-2xl font-bold text-orange-600">{clubStats.yearsEstablished}</div>
                    <div className="animate-on-scroll text-sm text-gray-600">Years Established</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="animate-on-scroll text-sm text-gray-600">Monthly Revenue</div>
                    <div className="animate-on-scroll font-medium">${clubStats.monthlyRevenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="animate-on-scroll text-lg font-semibold text-gray-900">Amenities</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-2">
                  {profileData.amenities.map((amenity, index) => (
                    <div key={index} className="animate-on-scroll flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="animate-on-scroll text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                <button className="animate-on-scroll w-full justify-start px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors text-left">
                  <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Manage Members
                </button>
                <button className="animate-on-scroll w-full justify-start px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors text-left">
                  <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Court Management
                </button>
                <button className="animate-on-scroll w-full justify-start px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors text-left">
                  <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubProfile; 