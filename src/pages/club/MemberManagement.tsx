import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const MemberManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<number | null>(null);

  // Mock member data
  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Sarah M.',
      email: 'sarah.m@email.com',
      phone: '(555) 123-4567',
      membershipType: 'Premium',
      status: 'Active',
      joinDate: '2023-01-15',
      lastVisit: '2024-03-20',
      totalVisits: 45,
      membershipExpiry: '2024-12-31',
      photo: null
    },
    {
      id: 2,
      name: 'Mike R.',
      email: 'mike.r@email.com',
      phone: '(555) 234-5678',
      membershipType: 'Basic',
      status: 'Active',
      joinDate: '2023-03-20',
      lastVisit: '2024-03-18',
      totalVisits: 32,
      membershipExpiry: '2024-12-31',
      photo: null
    },
    {
      id: 3,
      name: 'Lisa K.',
      email: 'lisa.k@email.com',
      phone: '(555) 345-6789',
      membershipType: 'Premium',
      status: 'Active',
      joinDate: '2023-02-10',
      lastVisit: '2024-03-15',
      totalVisits: 67,
      membershipExpiry: '2024-12-31',
      photo: null
    },
    {
      id: 4,
      name: 'John D.',
      email: 'john.d@email.com',
      phone: '(555) 456-7890',
      membershipType: 'Basic',
      status: 'Inactive',
      joinDate: '2023-01-05',
      lastVisit: '2024-02-15',
      totalVisits: 28,
      membershipExpiry: '2024-02-28',
      photo: null
    }
  ]);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    membershipType: 'Basic'
  });

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      const member = {
        id: members.length + 1,
        ...newMember,
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0],
        lastVisit: new Date().toISOString().split('T')[0],
        totalVisits: 1,
        membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        photo: null
      };
      setMembers([...members, member]);
      setNewMember({
        name: '',
        email: '',
        phone: '',
        membershipType: 'Basic'
      });
      setIsAddingMember(false);
    }
  };

  const handleUpdateMember = (id: number, field: string, value: string) => {
    setMembers(members.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const handleDeleteMember = (id: number) => {
    setMembers(members.filter(member => member.id !== id));
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    const matchesType = filterType === 'all' || member.membershipType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Premium': return 'bg-purple-100 text-purple-800';
      case 'Basic': return 'bg-blue-100 text-blue-800';
      case 'Elite': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const memberStats = {
    total: members.length,
    active: members.filter(m => m.status === 'Active').length,
    premium: members.filter(m => m.membershipType === 'Premium').length,
    newThisMonth: members.filter(m => {
      const joinDate = new Date(m.joinDate);
      const now = new Date();
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="animate-on-scroll text-3xl font-bold text-gray-900 mb-2">Member Management</h1>
            <p className="animate-on-scroll text-gray-600">Manage your club's members and memberships</p>
          </div>
          <button 
            onClick={() => setIsAddingMember(true)} 
            className="animate-on-scroll flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Member</span>
          </button>
        </div>

        {/* Member Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="animate-on-scroll text-sm font-medium text-gray-900">Total Members</h3>
              <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="px-6 pb-4">
              <div className="animate-on-scroll text-2xl font-bold text-blue-600">{memberStats.total}</div>
              <p className="animate-on-scroll text-xs text-gray-600">registered members</p>
            </div>
          </div>

          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="animate-on-scroll text-sm font-medium text-gray-900">Active Members</h3>
              <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="px-6 pb-4">
              <div className="animate-on-scroll text-2xl font-bold text-green-600">{memberStats.active}</div>
              <p className="animate-on-scroll text-xs text-gray-600">currently active</p>
            </div>
          </div>

          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="animate-on-scroll text-sm font-medium text-gray-900">Premium Members</h3>
              <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="px-6 pb-4">
              <div className="animate-on-scroll text-2xl font-bold text-purple-600">{memberStats.premium}</div>
              <p className="animate-on-scroll text-xs text-gray-600">premium subscriptions</p>
            </div>
          </div>

          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="animate-on-scroll text-sm font-medium text-gray-900">New This Month</h3>
              <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="px-6 pb-4">
              <div className="animate-on-scroll text-2xl font-bold text-orange-600">{memberStats.newThisMonth}</div>
              <p className="animate-on-scroll text-xs text-gray-600">recent additions</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
          <div className="px-6 pt-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Search Members</label>
                <div className="relative">
                  <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="statusFilter" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label htmlFor="typeFilter" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Membership Type</label>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Elite">Elite</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Member Form */}
        {isAddingMember && (
          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="animate-on-scroll text-lg font-semibold text-gray-900">Add New Member</h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="memberName" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    id="memberName"
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="memberEmail" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    id="memberEmail"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="memberPhone" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    id="memberPhone"
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="memberType" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Membership Type</label>
                  <select 
                    value={newMember.membershipType} 
                    onChange={(e) => setNewMember({...newMember, membershipType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button 
                  onClick={handleAddMember}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Member
                </button>
                <button 
                  onClick={() => setIsAddingMember(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="animate-on-scroll font-medium text-gray-900">{member.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`animate-on-scroll inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                        <span className={`animate-on-scroll inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(member.membershipType)}`}>
                          {member.membershipType}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="animate-on-scroll text-sm text-gray-600">Last Visit</p>
                      <p className="animate-on-scroll font-medium">{member.lastVisit}</p>
                    </div>
                    <div className="text-right">
                      <p className="animate-on-scroll text-sm text-gray-600">Total Visits</p>
                      <p className="animate-on-scroll font-medium">{member.totalVisits}</p>
                    </div>
                    <div className="text-right">
                      <p className="animate-on-scroll text-sm text-gray-600">Expires</p>
                      <p className="animate-on-scroll font-medium">{member.membershipExpiry}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      className="animate-on-scroll px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                      onClick={() => setEditingMember(editingMember === member.id ? null : member.id)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      className="animate-on-scroll px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="animate-on-scroll flex items-center space-x-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{member.email}</span>
                    </div>
                    <div className="animate-on-scroll flex items-center space-x-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{member.phone}</span>
                    </div>
                    <div className="animate-on-scroll flex items-center space-x-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Joined: {member.joinDate}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Mode */}
                {editingMember === member.id && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="animate-on-scroll font-medium text-gray-900 mb-3">Edit Member</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select 
                          value={member.status} 
                          onChange={(e) => handleUpdateMember(member.id, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                      <div>
                        <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Membership Type</label>
                        <select 
                          value={member.membershipType} 
                          onChange={(e) => handleUpdateMember(member.id, 'membershipType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Basic">Basic</option>
                          <option value="Premium">Premium</option>
                          <option value="Elite">Elite</option>
                        </select>
                      </div>
                      <div>
                        <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={member.phone}
                          onChange={(e) => handleUpdateMember(member.id, 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="animate-on-scroll text-lg font-medium text-gray-900 mb-2">No members found</h3>
              <p className="animate-on-scroll text-gray-600">Try adjusting your search criteria or add a new member.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManagement; 