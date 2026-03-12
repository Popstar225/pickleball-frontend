import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const CoachProfile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
    dateOfBirth: user?.date_of_birth || '',
    coachingExperience: '5 years',
    specialization: 'Advanced Techniques',
    bio: 'Experienced pickleball coach specializing in advanced techniques and tournament preparation.',
    profilePhoto: user?.profile_photo || '',
    hourlyRate: '75',
    availability: 'Weekdays and Weekends'
  });

  // Mock coach credentials and certifications
  const credentials = [
    {
      id: 1,
      name: 'USAPA Level 3 Coach Certification',
      issuer: 'USA Pickleball Association',
      date: '2023-06-15',
      expiry: '2026-06-15',
      status: 'Active',
      level: 'Advanced'
    },
    {
      id: 2,
      name: 'Sports Psychology Certification',
      issuer: 'National Coaching Institute',
      date: '2022-09-20',
      expiry: '2025-09-20',
      status: 'Active',
      level: 'Intermediate'
    },
    {
      id: 3,
      name: 'First Aid & CPR Certification',
      issuer: 'American Red Cross',
      date: '2024-01-10',
      expiry: '2026-01-10',
      status: 'Active',
      level: 'Basic'
    }
  ];

  // Mock coaching statistics
  const coachingStats = {
    totalStudents: 24,
    activeStudents: 18,
    totalSessions: 156,
    averageRating: 4.8,
    totalReviews: 89,
    yearsExperience: 5,
    tournamentsCoached: 12,
    studentSuccessRate: 78
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically save to API
    console.log('Saving coach profile:', profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      phone: user?.phone || '',
      city: user?.city || '',
      state: user?.state || '',
      dateOfBirth: user?.date_of_birth || '',
      coachingExperience: '5 years',
      specialization: 'Advanced Techniques',
      bio: 'Experienced pickleball coach specializing in advanced techniques and tournament preparation.',
      profilePhoto: user?.profile_photo || '',
      hourlyRate: '75',
      availability: 'Weekdays and Weekends'
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="animate-on-scroll text-3xl font-bold text-gray-900 mb-2">Coach Profile</h1>
            <p className="animate-on-scroll text-gray-600">Manage your coaching information and credentials</p>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="animate-on-scroll inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button 
                  onClick={handleSave} 
                  className="animate-on-scroll inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save</span>
                </button>
                <button 
                  onClick={handleCancel} 
                  className="animate-on-scroll inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {/* Basic Information */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Basic Information</span>
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="username" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      id="username"
                      type="text"
                      value={profileData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      disabled={!isEditing}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Location</span>
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      id="city"
                      type="text"
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      id="state"
                      type="text"
                      value={profileData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!isEditing}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coaching Information */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Coaching Information</span>
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="coachingExperience" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input
                      id="coachingExperience"
                      type="text"
                      value={profileData.coachingExperience}
                      onChange={(e) => handleInputChange('coachingExperience', e.target.value)}
                      disabled={!isEditing}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="specialization" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input
                      id="specialization"
                      type="text"
                      value={profileData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      disabled={!isEditing}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hourlyRate" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                    <input
                      id="hourlyRate"
                      type="text"
                      value={profileData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      disabled={!isEditing}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="availability" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <input
                      id="availability"
                      type="text"
                      value={profileData.availability}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                      disabled={!isEditing}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="bio" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    id="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Credentials & Certifications */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span>Credentials & Certifications</span>
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {credentials.map((credential) => (
                    <div key={credential.id} className="animate-on-scroll p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="animate-on-scroll font-medium text-gray-900 mb-2">{credential.name}</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="animate-on-scroll text-gray-500">Issuer:</span>
                              <p className="animate-on-scroll font-medium">{credential.issuer}</p>
                            </div>
                            <div>
                              <span className="animate-on-scroll text-gray-500">Level:</span>
                              <p className="animate-on-scroll font-medium">{credential.level}</p>
                            </div>
                            <div>
                              <span className="animate-on-scroll text-gray-500">Date:</span>
                              <p className="animate-on-scroll font-medium">{credential.date}</p>
                            </div>
                            <div>
                              <span className="animate-on-scroll text-gray-500">Expiry:</span>
                              <p className="animate-on-scroll font-medium">{credential.expiry}</p>
                            </div>
                            <div>
                              <span className="animate-on-scroll text-gray-500">Status:</span>
                              <p className="animate-on-scroll font-medium">{credential.status}</p>
                            </div>
                          </div>
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
            {/* Profile Photo */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="animate-on-scroll text-lg font-semibold text-gray-900">Profile Photo</h3>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="flex-shrink-0 w-24 h-24 mx-auto mb-4">
                  {profileData.profilePhoto ? (
                    <img className="w-24 h-24 rounded-full" src={profileData.profilePhoto} alt="Profile" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-medium">
                      {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button className="animate-on-scroll inline-flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Change Photo
                  </button>
                )}
              </div>
            </div>

            {/* Coaching Statistics */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>Coaching Stats</span>
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="animate-on-scroll text-2xl font-bold text-blue-600">{coachingStats.totalStudents}</div>
                    <div className="animate-on-scroll text-sm text-gray-600">Total Students</div>
                  </div>
                  <div>
                    <div className="animate-on-scroll text-2xl font-bold text-green-600">{coachingStats.activeStudents}</div>
                    <div className="animate-on-scroll text-sm text-gray-600">Active Students</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="animate-on-scroll text-2xl font-bold text-purple-600">{coachingStats.averageRating}</div>
                    <div className="animate-on-scroll text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div>
                    <div className="animate-on-scroll text-2xl font-bold text-orange-600">{coachingStats.totalSessions}</div>
                    <div className="animate-on-scroll text-sm text-gray-600">Total Sessions</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="animate-on-scroll text-sm text-gray-600">Experience</div>
                    <div className="animate-on-scroll font-medium">{coachingStats.yearsExperience} years</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="animate-on-scroll text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                <button className="animate-on-scroll inline-flex items-center justify-start w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Manage Students
                </button>
                <button className="animate-on-scroll inline-flex items-center justify-start w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Sessions
                </button>
                <button className="animate-on-scroll inline-flex items-center justify-start w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  View Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachProfile; 