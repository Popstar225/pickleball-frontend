import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchClubMembers } from '../../../store/slices/clubDashboardSlice';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  Star,
  Download,
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  MessageSquare,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../../lib/api';

interface Member {
  id: string;
  username: string;
  full_name: string;
  user_type: string;
  skill_level: string;
  membership_status: string;
  created_at: string;
  email?: string;
  phone?: string;
  profile_photo?: string;
  last_visit?: string;
  total_visits?: number;
  membership_expires_at?: string;
}

interface AddMemberData {
  username: string;
  full_name: string;
  email: string;
  phone: string;
  skill_level: string;
  membership_status: string;
  user_type: string;
}

interface EditMemberData {
  full_name: string;
  email: string;
  phone: string;
  skill_level: string;
  membership_status: string;
}

interface MembersProps {
  members: Member[];
}

const Members: React.FC<MembersProps> = ({ members: initialMembers }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error } = useSelector((state: RootState) => state.clubDashboard);
  
  const [members, setMembers] = useState<Member[]>(initialMembers || []);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [addMemberData, setAddMemberData] = useState<AddMemberData>({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    skill_level: '3.0',
    membership_status: 'basic',
    user_type: 'player'
  });

  const [editMemberData, setEditMemberData] = useState<EditMemberData>({
    full_name: '',
    email: '',
    phone: '',
    skill_level: '3.0',
    membership_status: 'basic'
  });

  const [contactData, setContactData] = useState({
    subject: '',
    message: ''
  });

  // Fetch members when component mounts
  useEffect(() => {
    if (user?.club_id) {
      refreshMembers();
    }
  }, [user?.club_id]);

  // Update local state when props change
  useEffect(() => {
    setMembers(initialMembers || []);
  }, [initialMembers]);

  const refreshMembers = async () => {
    if (!user?.club_id) return;
    
    setIsLoading(true);
    try {
      const result = await dispatch(fetchClubMembers(user.club_id)).unwrap();
      if (result) {
        setMembers(result);
        toast.success('Members refreshed successfully!');
      }
    } catch (error) {
      console.error('Error refreshing members:', error);
      toast.error('Failed to refresh members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!user?.club_id) {
      toast.error('User not authenticated');
      return;
    }

    if (!addMemberData.username || !addMemberData.full_name || !addMemberData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Create new user
      const response = await api.post('/users', {
        ...addMemberData,
        club_id: user.club_id,
        password: 'tempPassword123!', // Temporary password
        is_active: true
      }) as any;

      if (response && response.success) {
        toast.success('Member added successfully!');
        
        // Refresh members list
        await refreshMembers();
        
        // Reset form and close modal
        setAddMemberData({
          username: '',
          full_name: '',
          email: '',
          phone: '',
          skill_level: '3.0',
          membership_status: 'basic',
          user_type: 'player'
        });
        setShowAddModal(false);
      } else {
        const error = response?.message || 'Failed to add member';
        toast.error(error);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMember = async () => {
    if (!selectedMember) return;

    setIsLoading(true);
    try {
      const response = await api.put(`/users/${selectedMember.id}`, editMemberData) as any;

      if (response && response.success) {
        toast.success('Member updated successfully!');
        
        // Refresh members list
        await refreshMembers();
        
        // Close modal
        setShowEditModal(false);
        setSelectedMember(null);
      } else {
        const error = response?.message || 'Failed to update member';
        toast.error(error);
      }
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    setIsLoading(true);
    try {
      const response = await api.delete(`/users/${selectedMember.id}`) as any;

      if (response && response.success) {
        toast.success('Member removed successfully!');
        
        // Refresh members list
        await refreshMembers();
        
        // Close modal
        setShowDeleteModal(false);
        setSelectedMember(null);
      } else {
        const error = response?.message || 'Failed to remove member';
        toast.error(error);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactMember = async () => {
    if (!selectedMember || !contactData.subject || !contactData.message) {
      toast.error('Please fill in subject and message');
      return;
    }

    setIsLoading(true);
    try {
      // Send notification to member
      const response = await api.post('/notifications', {
        user_id: selectedMember.id,
        title: contactData.subject,
        message: contactData.message,
        type: 'message',
        priority: 'normal'
      }) as any;

      if (response && response.success) {
        toast.success('Message sent successfully!');
        
        // Reset form and close modal
        setContactData({ subject: '', message: '' });
        setShowContactModal(false);
        setSelectedMember(null);
      } else {
        const error = response?.message || 'Failed to send message';
        toast.error(error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMembers = () => {
    // Create CSV content
    const headers = ['Name', 'Username', 'Email', 'Phone', 'Type', 'Skill Level', 'Status', 'Join Date'];
    const csvContent = [
      headers.join(','),
      ...members.map(member => [
        member.full_name,
        member.username,
        member.email || '',
        member.phone || '',
        member.user_type,
        member.skill_level,
        member.membership_status,
        new Date(member.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `club-members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Members list exported successfully!');
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'suspended': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'expired': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || member.user_type.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || member.membership_status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.membership_status.toLowerCase() === 'active').length,
    premium: members.filter(m => m.membership_status.toLowerCase() === 'premium').length,
    vip: members.filter(m => m.membership_status.toLowerCase() === 'vip').length
  };

  const openEditModal = (member: Member) => {
    setSelectedMember(member);
    setEditMemberData({
      full_name: member.full_name,
      email: member.email || '',
      phone: member.phone || '',
      skill_level: member.skill_level,
      membership_status: member.membership_status
    });
    setShowEditModal(true);
  };

  const openContactModal = (member: Member) => {
    setSelectedMember(member);
    setContactData({ subject: '', message: '' });
    setShowContactModal(true);
  };

  const openDeleteModal = (member: Member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Member Management</h2>
          <p className="text-gray-600">Manage club members, memberships, and access</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refreshMembers}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button 
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center space-x-2"
            onClick={handleExportMembers}
          >
            <Download className="h-4 w-4" />
            <span>Export List</span>
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Members</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Premium Members</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.premium}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">VIP Members</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.vip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="player">Player</option>
                <option value="coach">Coach</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Members List</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {loading ? 'Loading members...' : 'No members found'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {member.profile_photo ? (
                            <img className="h-10 w-10 rounded-full" src={member.profile_photo} alt={member.full_name} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                          <div className="text-sm text-gray-500">{member.username}</div>
                          {member.email && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {member.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(member.user_type)}`}>
                        {member.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.skill_level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.membership_status)}`}>
                        {getStatusIcon(member.membership_status)}
                        <span className="ml-1">{member.membership_status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => openEditModal(member)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        
                        <button
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => openContactModal(member)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Contact
                        </button>
                        
                        <button
                          className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => openDeleteModal(member)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Member</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={addMemberData.username}
                    onChange={(e) => setAddMemberData({...addMemberData, username: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={addMemberData.full_name}
                    onChange={(e) => setAddMemberData({...addMemberData, full_name: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={addMemberData.email}
                    onChange={(e) => setAddMemberData({...addMemberData, email: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={addMemberData.phone}
                    onChange={(e) => setAddMemberData({...addMemberData, phone: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                  <select
                    value={addMemberData.user_type}
                    onChange={(e) => setAddMemberData({...addMemberData, user_type: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="player">Player</option>
                    <option value="coach">Coach</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                  <select
                    value={addMemberData.skill_level}
                    onChange={(e) => setAddMemberData({...addMemberData, skill_level: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2.5">2.5 - Beginner</option>
                    <option value="3.0">3.0 - Novice</option>
                    <option value="3.5">3.5 - Intermediate</option>
                    <option value="4.0">4.0 - Advanced</option>
                    <option value="4.5">4.5 - Expert</option>
                    <option value="5.0">5.0 - Professional</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Membership Status</label>
                  <select
                    value={addMemberData.membership_status}
                    onChange={(e) => setAddMemberData({...addMemberData, membership_status: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleAddMember}
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Member: {selectedMember.full_name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={editMemberData.full_name}
                    onChange={(e) => setEditMemberData({...editMemberData, full_name: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={editMemberData.email}
                    onChange={(e) => setEditMemberData({...editMemberData, email: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editMemberData.phone}
                    onChange={(e) => setEditMemberData({...editMemberData, phone: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                  <select
                    value={editMemberData.skill_level}
                    onChange={(e) => setEditMemberData({...editMemberData, skill_level: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2.5">2.5 - Beginner</option>
                    <option value="3.0">3.0 - Novice</option>
                    <option value="3.5">3.5 - Intermediate</option>
                    <option value="4.0">4.0 - Advanced</option>
                    <option value="4.5">4.5 - Expert</option>
                    <option value="5.0">5.0 - Professional</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Membership Status</label>
                  <select
                    value={editMemberData.membership_status}
                    onChange={(e) => setEditMemberData({...editMemberData, membership_status: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleEditMember}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Member Modal */}
      {showContactModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Member: {selectedMember.full_name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={contactData.subject}
                    onChange={(e) => setContactData({...contactData, subject: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter message subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    value={contactData.message}
                    onChange={(e) => setContactData({...contactData, message: e.target.value})}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your message"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowContactModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleContactMember}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Member Modal */}
      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Remove Member</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to remove <strong>{selectedMember.full_name}</strong> from the club? 
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  onClick={handleDeleteMember}
                  disabled={isLoading}
                >
                  {isLoading ? 'Removing...' : 'Remove Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members; 