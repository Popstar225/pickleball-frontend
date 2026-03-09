import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';

import { imageBaseURL } from '../../lib/const';
import { toast } from 'sonner';

const AdminProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile photo management functions
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profile_photo', file);

      const response = await fetch(`${imageBaseURL}/api/v1/auth/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Profile photo uploaded successfully!');
        // Refresh the page or update user data to show new photo
        window.location.reload();
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePhotoRemove = async () => {
    if (!user?.profile_photo) return;

    if (!confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    try {
      // For now, we'll just show a message since the backend doesn't have a remove endpoint
      // You can implement this later by adding a DELETE endpoint
      toast.info('Profile photo removal functionality coming soon!');
      
      // TODO: Implement actual photo removal when backend supports it
      // const response = await fetch(`${imageBaseURL}/api/v1/auth/profile/photo`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      
    } catch (error) {
      console.error('Photo removal error:', error);
      toast.error('Failed to remove photo');
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Mock admin profile data - now using Redux user data as defaults
  const [adminData, setAdminData] = useState({
    personalInfo: {
      firstName: user?.first_name || 'John',
      lastName: user?.last_name || 'Admin',
      email: user?.email || 'john.admin@pickleball.com',
      phone: user?.phone || '(555) 123-4567',
      title: user?.job_title || 'System Administrator',
      department: user?.preferences?.department || 'IT & Operations',
      bio: user?.bio || 'Experienced system administrator with 8+ years managing enterprise applications and user management systems.',
      profilePhoto: user?.profile_photo || null
    },
    systemAccess: {
      role: user?.user_type || 'super_admin',
      permissions: user?.preferences?.permissions || [
        'User Management',
        'System Configuration',
        'Database Administration',
        'Security Settings',
        'Analytics & Reporting',
        'Global Settings Management'
      ],
      lastLogin: user?.last_login ? new Date(user.last_login).toLocaleString() : '2024-03-25 10:30 AM',
      loginHistory: user?.preferences?.login_history || [
        { date: '2024-03-25 10:30 AM', ip: '192.168.1.100', location: 'Office' },
        { date: '2024-03-24 09:15 AM', ip: '192.168.1.100', location: 'Office' },
        { date: '2024-03-23 14:20 PM', ip: '10.0.0.50', location: 'Remote' }
      ]
    },
    security: {
      twoFactorEnabled: user?.preferences?.two_factor_enabled ?? true,
      lastPasswordChange: user?.preferences?.last_password_change || '2024-02-15',
      passwordExpiryDays: user?.preferences?.password_expiry_days || 45,
      failedLoginAttempts: user?.preferences?.failed_login_attempts || 0,
      accountLocked: user?.preferences?.account_locked ?? false,
      securityQuestions: user?.preferences?.security_questions || [
        { question: 'What was your first pet\'s name?', answer: '***' },
        { question: 'In what city were you born?', answer: '***' }
      ]
    },
    preferences: {
      language: user?.preferences?.language || 'English',
      timezone: user?.preferences?.timezone || 'America/New_York',
      dateFormat: user?.preferences?.date_format || 'MM/DD/YYYY',
      timeFormat: user?.preferences?.time_format || '12-hour',
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        sms: user?.preferences?.notifications?.sms ?? false,
        push: user?.preferences?.notifications?.push ?? true,
        systemAlerts: user?.preferences?.notifications?.system_alerts ?? true,
        userReports: user?.preferences?.notifications?.user_reports ?? true,
        securityEvents: user?.preferences?.notifications?.security_events ?? true
      }
    }
  });

  // Update admin data when user data changes
  React.useEffect(() => {
    if (user) {
      setAdminData({
        personalInfo: {
          firstName: user.first_name || 'John',
          lastName: user.last_name || 'Admin',
          email: user.email || 'john.admin@pickleball.com',
          phone: user.phone || '(555) 123-4567',
          title: user.job_title || 'System Administrator',
          department: user.preferences?.department || 'IT & Operations',
          bio: user.bio || 'Experienced system administrator with 8+ years managing enterprise applications and user management systems.',
          profilePhoto: user.profile_photo || null
        },
        systemAccess: {
          role: user.user_type || 'super_admin',
          permissions: user.preferences?.permissions || [
            'User Management',
            'System Configuration',
            'Database Administration',
            'Security Settings',
            'Analytics & Reporting',
            'Global Settings Management'
          ],
          lastLogin: user.last_login ? new Date(user.last_login).toLocaleString() : '2024-03-25 10:30 AM',
          loginHistory: user.preferences?.login_history || [
            { date: '2024-03-25 10:30 AM', ip: '192.168.1.100', location: 'Office' },
            { date: '2024-03-24 09:15 AM', ip: '192.168.1.100', location: 'Office' },
            { date: '2024-03-23 14:20 PM', ip: '10.0.0.50', location: 'Remote' }
          ]
        },
        security: {
          twoFactorEnabled: user.preferences?.two_factor_enabled ?? true,
          lastPasswordChange: user.preferences?.last_password_change || '2024-02-15',
          passwordExpiryDays: user.preferences?.password_expiry_days || 45,
          failedLoginAttempts: user.preferences?.failed_login_attempts || 0,
          accountLocked: user.preferences?.account_locked ?? false,
          securityQuestions: user.preferences?.security_questions || [
            { question: 'What was your first pet\'s name?', answer: '***' },
            { question: 'In what city were you born?', answer: '***' }
          ]
        },
        preferences: {
          language: user.preferences?.language || 'English',
          timezone: user.preferences?.timezone || 'America/New_York',
          dateFormat: user.preferences?.date_format || 'MM/DD/YYYY',
          timeFormat: user.preferences?.time_format || '12-hour',
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            sms: user.preferences?.notifications?.sms ?? false,
            push: user.preferences?.notifications?.push ?? true,
            systemAlerts: user.preferences?.notifications?.system_alerts ?? true,
            userReports: user.preferences?.notifications?.user_reports ?? true,
            securityEvents: user.preferences?.notifications?.security_events ?? true
          }
        }
      });
    }
  }, [user]);

  const [editedData, setEditedData] = useState(adminData);

  const handleSave = () => {
    setAdminData(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to current user data
    if (user) {
      setAdminData({
        personalInfo: {
          firstName: user.first_name || 'John',
          lastName: user.last_name || 'Admin',
          email: user.email || 'john.admin@pickleball.com',
          phone: user.phone || '(555) 123-4567',
          title: user.job_title || 'System Administrator',
          department: user.preferences?.department || 'IT & Operations',
          bio: user.bio || 'Experienced system administrator with 8+ years managing enterprise applications and user management systems.',
          profilePhoto: user.profile_photo || null
        },
        systemAccess: {
          role: user.user_type || 'super_admin',
          permissions: user.preferences?.permissions || [
            'User Management',
            'System Configuration',
            'Database Administration',
            'Security Settings',
            'Analytics & Reporting',
            'Global Settings Management'
          ],
          lastLogin: user.last_login ? new Date(user.last_login).toLocaleString() : '2024-03-25 10:30 AM',
          loginHistory: user.preferences?.login_history || [
            { date: '2024-03-25 10:30 AM', ip: '192.168.1.100', location: 'Office' },
            { date: '2024-03-24 09:15 AM', ip: '192.168.1.100', location: 'Office' },
            { date: '2024-03-23 14:20 PM', ip: '10.0.0.50', location: 'Remote' }
          ]
        },
        security: {
          twoFactorEnabled: user.preferences?.two_factor_enabled ?? true,
          lastPasswordChange: user.preferences?.last_password_change || '2024-02-15',
          passwordExpiryDays: user.preferences?.password_expiry_days || 45,
          failedLoginAttempts: user.preferences?.failed_login_attempts || 0,
          accountLocked: user.preferences?.account_locked ?? false,
          securityQuestions: user.preferences?.security_questions || [
            { question: 'What was your first pet\'s name?', answer: '***' },
            { question: 'In what city were you born?', answer: '***' }
          ]
        },
        preferences: {
          language: user.preferences?.language || 'English',
          timezone: user.preferences?.timezone || 'America/New_York',
          dateFormat: user.preferences?.date_format || 'MM/DD/YYYY',
          timeFormat: user.preferences?.time_format || '12-hour',
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            sms: user.preferences?.notifications?.sms ?? false,
            push: user.preferences?.notifications?.push ?? true,
            systemAlerts: user.preferences?.notifications?.system_alerts ?? true,
            userReports: user.preferences?.notifications?.user_reports ?? true,
            securityEvents: user.preferences?.notifications?.security_events ?? true
          }
        }
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleNotificationChange = (notification: string, value: boolean) => {
    setEditedData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [notification]: value
        }
      }
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Administrator';
      case 'moderator': return 'Moderator';
      default: return 'User';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-on-scroll">Admin Profile</h1>
            <p className="text-gray-600 animate-on-scroll">Manage your profile and system access settings</p>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave} 
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes</span>
                </button>
                <button 
                  onClick={handleCancel} 
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 animate-on-scroll">
                  <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Personal Information</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      value={isEditing ? editedData.personalInfo.firstName : (user?.first_name || adminData.personalInfo.firstName)}
                      onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      value={isEditing ? editedData.personalInfo.lastName : (user?.last_name || adminData.personalInfo.lastName)}
                      onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={isEditing ? editedData.personalInfo.email : (user?.email || adminData.personalInfo.email)}
                      onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Phone</label>
                    <input
                      id="phone"
                      type="text"
                      value={isEditing ? editedData.personalInfo.phone : (user?.phone || adminData.personalInfo.phone)}
                      onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                    />
                  </div>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Job Title</label>
                    <input
                      id="title"
                      type="text"
                      value={isEditing ? editedData.personalInfo.title : adminData.personalInfo.title}
                      onChange={(e) => handleInputChange('personalInfo', 'title', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Department</label>
                    <input
                      id="department"
                      type="text"
                      value={isEditing ? editedData.personalInfo.department : adminData.personalInfo.department}
                      onChange={(e) => handleInputChange('personalInfo', 'department', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Bio</label>
                  <textarea
                    id="bio"
                    value={isEditing ? editedData.personalInfo.bio : adminData.personalInfo.bio}
                    onChange={(e) => handleInputChange('personalInfo', 'bio', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  />
                </div>
              </div>
            </div>

            {/* System Access */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 animate-on-scroll">
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>System Access</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 animate-on-scroll">Role</label>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(adminData.systemAccess.role)} animate-on-scroll`}>
                      {getRoleDisplayName(adminData.systemAccess.role)}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 animate-on-scroll">Last Login</label>
                    <p className="text-sm text-gray-900 animate-on-scroll">{adminData.systemAccess.lastLogin}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Permissions</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {adminData.systemAccess.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center space-x-2 animate-on-scroll">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-on-scroll"></div>
                        <span className="text-sm text-gray-700 animate-on-scroll">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Recent Login History</label>
                  <div className="space-y-2 mt-2">
                    {adminData.systemAccess.loginHistory.map((login, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded animate-on-scroll">
                        <span className="animate-on-scroll">{login.date}</span>
                        <div className="flex items-center space-x-4 text-gray-600 animate-on-scroll">
                          <span className="animate-on-scroll">{login.ip}</span>
                          <span className="animate-on-scroll">{login.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 animate-on-scroll">
                  <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Preferences</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Language</label>
                    <select 
                      value={isEditing ? editedData.preferences.language : adminData.preferences.language} 
                      onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Timezone</label>
                    <select 
                      value={isEditing ? editedData.preferences.timezone : adminData.preferences.timezone} 
                      onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Notifications</label>
                  <div className="space-y-3 mt-2">
                    {Object.entries(adminData.preferences.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between animate-on-scroll">
                        <span className="text-sm text-gray-700 capitalize animate-on-scroll">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <input
                          type="checkbox"
                          checked={isEditing ? editedData.preferences.notifications[key as keyof typeof editedData.preferences.notifications] : value}
                          onChange={(e) => handleNotificationChange(key, e.target.checked)}
                          disabled={!isEditing}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 animate-on-scroll"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Photo */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 animate-on-scroll">Profile Photo</h3>
              </div>
              <div className="p-6 text-center">
                <div className="relative">
                  <div className="mx-auto ring-4 ring-white shadow-lg">
                    {user?.profile_photo ? (
                      <img
                        src={`${imageBaseURL}${user.profile_photo}`}
                        alt={user?.full_name || user?.username || 'Admin User'}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                        {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <button 
                      className="absolute bottom-2 right-2 rounded-full w-10 h-10 p-0 hover:scale-110 transition-transform duration-300 bg-white shadow-md border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 animate-on-scroll"
                      title="Change Profile Photo"
                      onClick={triggerFileUpload}
                      disabled={isUploading}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Show a small indicator when profile photo is available */}
                  {user?.profile_photo && (
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-on-scroll"
                      title="Profile photo uploaded"
                    />
                  )}
                </div>
                
                {/* Hidden file input for photo upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                
                {/* Status message */}
                {user?.profile_photo ? (
                  <div className="mt-2 text-xs text-green-600 flex items-center justify-center animate-on-scroll">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-on-scroll"></div>
                    Profile photo loaded successfully
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-500 flex items-center justify-center animate-on-scroll">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-on-scroll"></div>
                    No profile photo uploaded
                  </div>
                )}
                
                {isEditing && (
                  <div className="mt-4 space-y-2">
                    <button 
                      className="w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                      onClick={triggerFileUpload}
                      disabled={isUploading}
                    >
                      <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {isUploading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                    {user?.profile_photo && (
                      <button 
                        className="w-full px-3 py-2 bg-white text-red-600 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                        onClick={handlePhotoRemove}
                        disabled={isUploading}
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 animate-on-scroll">
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Security Status</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between animate-on-scroll">
                  <span className="text-sm animate-on-scroll">Two-Factor Auth</span>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${adminData.security.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} animate-on-scroll`}>
                    {adminData.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 animate-on-scroll">
                  <p className="animate-on-scroll">Last Password Change: {adminData.security.lastPasswordChange}</p>
                  <p className="animate-on-scroll">Password Expires: {adminData.security.passwordExpiryDays} days</p>
                </div>
                {adminData.security.failedLoginAttempts > 0 && (
                  <div className="flex items-center space-x-2 text-yellow-600 animate-on-scroll">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm animate-on-scroll">{adminData.security.failedLoginAttempts} failed login attempts</span>
                  </div>
                )}
                {adminData.security.accountLocked && (
                  <div className="flex items-center space-x-2 text-red-600 animate-on-scroll">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm animate-on-scroll">Account Locked</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 animate-on-scroll">Quick Stats</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-center animate-on-scroll">
                  <div className="text-2xl font-bold text-blue-600 animate-on-scroll">8+</div>
                  <p className="text-sm text-gray-600 animate-on-scroll">Years Experience</p>
                </div>
                <div className="text-center animate-on-scroll">
                  <div className="text-2xl font-bold text-green-600 animate-on-scroll">99.9%</div>
                  <p className="text-sm text-gray-600 animate-on-scroll">System Uptime</p>
                </div>
                <div className="text-center animate-on-scroll">
                  <div className="text-2xl font-bold text-purple-600 animate-on-scroll">24/7</div>
                  <p className="text-sm text-gray-600 animate-on-scroll">Support Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile; 