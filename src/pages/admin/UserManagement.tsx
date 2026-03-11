import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const UserManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUserType, setSelectedUserType] = useState('all');

  // Mock user data
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'john.doe',
      email: 'john.doe@email.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'player',
      userType: 'player',
      status: 'active',
      lastLogin: '2024-03-25 10:30 AM',
      joinDate: '2024-01-15',
      location: 'New York, NY',
      phone: '(555) 123-4567',
      profilePhoto: null,
      verified: true,
      twoFactorEnabled: false
    },
    {
      id: 2,
      username: 'jane.smith',
      email: 'jane.smith@email.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'coach',
      userType: 'coach',
      status: 'active',
      lastLogin: '2024-03-24 14:20 PM',
      joinDate: '2023-11-20',
      location: 'Los Angeles, CA',
      phone: '(555) 987-6543',
      profilePhoto: null,
      verified: true,
      twoFactorEnabled: true
    },
    {
      id: 3,
      username: 'mike.club',
      email: 'mike@eliteclub.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'admin',
      userType: 'club',
      status: 'active',
      lastLogin: '2024-03-25 09:15 AM',
      joinDate: '2023-08-10',
      location: 'Chicago, IL',
      phone: '(555) 456-7890',
      profilePhoto: null,
      verified: true,
      twoFactorEnabled: true
    },
    {
      id: 4,
      username: 'sarah.partner',
      email: 'sarah@courtsplus.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'partner',
      userType: 'partner',
      status: 'active',
      lastLogin: '2024-03-23 16:45 PM',
      joinDate: '2023-09-05',
      location: 'Miami, FL',
      phone: '(555) 789-0123',
      profilePhoto: null,
      verified: true,
      twoFactorEnabled: false
    },
    {
      id: 5,
      username: 'admin.state',
      email: 'admin@californiapb.com',
      firstName: 'Robert',
      lastName: 'Chen',
      role: 'state_admin',
      userType: 'state',
      status: 'active',
      lastLogin: '2024-03-25 08:00 AM',
      joinDate: '2023-06-15',
      location: 'Sacramento, CA',
      phone: '(555) 321-0987',
      profilePhoto: null,
      verified: true,
      twoFactorEnabled: true
    }
  ]);

  const [editingUser, setEditingUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    const matchesUserType = selectedUserType === 'all' || user.userType === selectedUserType;
    
    return matchesSearch && matchesRole && matchesStatus && matchesUserType;
  });

  const handleStatusChange = (userId: number, newStatus: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'state_admin': return 'bg-purple-100 text-purple-800';
      case 'coach': return 'bg-blue-100 text-blue-800';
      case 'club': return 'bg-green-100 text-green-800';
      case 'partner': return 'bg-orange-100 text-orange-800';
      case 'player': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'state_admin': return 'State Admin';
      case 'coach': return 'Coach';
      case 'club': return 'Club Admin';
      case 'partner': return 'Partner';
      case 'player': return 'Player';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 animate-on-scroll">User Management</h1>
          <p className="text-gray-600 mb-6 animate-on-scroll">
            Manage user accounts, roles, and permissions across the platform
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New User
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrator</option>
                  <option value="state_admin">State Admin</option>
                  <option value="coach">Coach</option>
                  <option value="club">Club Admin</option>
                  <option value="partner">Partner</option>
                  <option value="player">Player</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">User Type</label>
                <select
                  value={selectedUserType}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
                >
                  <option value="all">All Types</option>
                  <option value="player">Player</option>
                  <option value="coach">Coach</option>
                  <option value="club">Club</option>
                  <option value="partner">Partner</option>
                  <option value="state">State</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-on-scroll">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 animate-on-scroll">
              Users ({filteredUsers.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider animate-on-scroll">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider animate-on-scroll">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider animate-on-scroll">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider animate-on-scroll">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider animate-on-scroll">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors animate-on-scroll">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center animate-on-scroll">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 animate-on-scroll">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 animate-on-scroll">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400 animate-on-scroll">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)} animate-on-scroll`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)} animate-on-scroll`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 animate-on-scroll">
                      {user.lastLogin}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-900 transition-colors animate-on-scroll"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                          className={`transition-colors animate-on-scroll ${
                            user.status === 'active' 
                              ? 'text-yellow-600 hover:text-yellow-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 transition-colors animate-on-scroll"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-on-scroll" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 animate-on-scroll">No users found</h3>
              <p className="text-gray-600 mb-6 animate-on-scroll">
                Try adjusting your search criteria or create a new user.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
              >
                Create User
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement; 