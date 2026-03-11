import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { 
  fetchAdminMessages, 
  createAdminMessage, 
  updateAdminMessage, 
  deleteAdminMessage, 
  sendAdminMessage,
  fetchMessageStats,
  setSelectedMessage,
  clearSelectedMessage,
  setShowCompose,
  setComposeData,
  resetComposeData
} from '../../../store/slices/adminMessagesSlice';
import { AppDispatch } from '../../../store';

interface MessagingProps {
  messages?: any[];
}

const Messaging: React.FC<MessagingProps> = ({ messages: propMessages }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    messages, 
    selectedMessage, 
    showCompose, 
    composeData, 
    loading, 
    error, 
    stats: reduxStats 
  } = useSelector((state: RootState) => state.adminMessages);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Use prop messages if provided, otherwise use Redux state
  const displayMessages = propMessages || messages;

  useEffect(() => {
    if (!propMessages) {
      dispatch(fetchAdminMessages({}));
      dispatch(fetchMessageStats());
    }
  }, [dispatch, propMessages]);

  // Calculate stats from messages if not available from Redux
  const calculatedStats = reduxStats || {
    total: displayMessages.length,
    draft: displayMessages.filter(m => m.status === 'draft').length,
    scheduled: displayMessages.filter(m => m.status === 'scheduled').length,
    sent: displayMessages.filter(m => m.status === 'sent').length,
    cancelled: displayMessages.filter(m => m.status === 'cancelled').length
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'notification': return 'bg-green-100 text-green-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'newsletter': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'scheduled': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'sending': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'cancelled': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'draft': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      default: return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  const handleMessageAction = (messageId: string, action: string) => {
    // Handle message actions
    console.log(`Message ${action} for ID ${messageId}`);
  };

  const handleSendMessage = () => {
    // Handle message sending logic
    console.log('Sending message:', composeData);
    dispatch(createAdminMessage(composeData));
    dispatch(setShowCompose(false));
    dispatch(resetComposeData());
  };

  const generateReport = () => {
    // Generate messaging report
    console.log('Generating messaging report');
  };

  const filteredMessages = displayMessages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || message.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || message.message_type === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Use calculated stats instead of local stats
  const displayStats = calculatedStats;

  const categories = ['announcement', 'notification', 'alert', 'reminder', 'newsletter'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 animate-on-scroll">System Messaging</h2>
          <p className="text-gray-600 animate-on-scroll">Manage system-wide communications and announcements</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={generateReport} 
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Generate Report</span>
          </button>
          <button 
            onClick={() => dispatch(setShowCompose(true))} 
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Compose Message</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 animate-on-scroll">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Messages</h3>
            <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-blue-600">{displayStats.total}</div>
          <p className="text-xs text-gray-600">all messages</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 animate-on-scroll">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Sent</h3>
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-green-600">{displayStats.sent}</div>
          <p className="text-xs text-gray-600">successfully sent</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 animate-on-scroll">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Draft</h3>
            <svg className="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{displayStats.draft}</div>
          <p className="text-xs text-gray-600">draft messages</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 animate-on-scroll">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Scheduled</h3>
            <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-blue-600">{displayStats.scheduled}</div>
          <p className="text-xs text-gray-600">scheduled messages</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 animate-on-scroll">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Cancelled</h3>
            <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-red-600">{displayStats.cancelled}</div>
          <p className="text-xs text-gray-600">cancelled messages</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 animate-on-scroll">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search Messages</label>
            <div className="relative">
              <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                id="search"
                placeholder="Search by subject, sender, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Status Filter</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700">Priority Filter</label>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700">Category Filter</label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="announcement">Announcement</option>
              <option value="notification">Notification</option>
              <option value="alert">Alert</option>
              <option value="reminder">Reminder</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow-md p-6 animate-on-scroll">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">All Messages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div>
                      <div>{message.title}</div>
                      {message.tags && message.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {message.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {tag}
                            </span>
                          ))}
                          {message.tags.length > 2 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              +{message.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{message.sender_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                      <span className="capitalize">{message.priority}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(message.message_type)}`}>
                      <span className="capitalize">{message.message_type}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(message.status)}
                        <span className="capitalize">{message.status}</span>
                      </div>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-1">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>{message.total_recipients || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{message.sent_at || 'Not sent'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => dispatch(setSelectedMessage(message))}
                        className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 6v12a3 3 0 103-3H6a3 3 0 103 3V6a3 3 0 10-3 3h12a3 3 0 10-3-3" />
                        </svg>
                        View
                      </button>
                      {message.status === 'draft' && (
                        <button
                          onClick={() => handleMessageAction(message.id, 'edit')}
                          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      )}
                      {message.status === 'sent' && (
                        <>
                          <button
                            onClick={() => handleMessageAction(message.id, 'reply')}
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10a8 8 0 008 8v2M3 10a8 8 0 018-8V0C5 0 0 5 0 10h3zm8 0h3a8 8 0 018 8v2M11 12h2m-6 0H3" />
                            </svg>
                            Reply
                          </button>
                          <button
                            onClick={() => handleMessageAction(message.id, 'forward')}
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            Forward
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMessages.length === 0 && (
            <div className="text-center py-8">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-on-scroll">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Message Details</h3>
              <button onClick={() => dispatch(clearSelectedMessage())} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="font-medium">{selectedMessage.title}</p>
                </div>
                <div>
                  <label htmlFor="sender" className="block text-sm font-medium text-gray-700">Sender</label>
                  <p>{selectedMessage.sender_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                    <span className="capitalize">{selectedMessage.priority}</span>
                  </span>
                </div>
                <div>
                  <label htmlFor="message_type" className="block text-sm font-medium text-gray-700">Type</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selectedMessage.message_type)}`}>
                    <span className="capitalize">{selectedMessage.message_type}</span>
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedMessage.status)}
                      <span className="capitalize">{selectedMessage.status}</span>
                    </div>
                  </span>
                </div>
                <div>
                  <label htmlFor="sent_at" className="block text-sm font-medium text-gray-700">Sent At</label>
                  <p>{selectedMessage.sent_at || 'Not sent'}</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="recipients" className="block text-sm font-medium text-gray-700">Total Recipients</label>
                <p>{selectedMessage.total_recipients || 0}</p>
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>
              
              {selectedMessage.attachments.length > 0 && (
                <div>
                  <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">Attachments</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedMessage.attachments.map((attachment, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {attachment}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedMessage.tags.length > 0 && (
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedMessage.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button onClick={() => dispatch(clearSelectedMessage())} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Close
              </button>
              {selectedMessage.status === 'draft' && (
                <button
                  onClick={() => handleMessageAction(selectedMessage.id, 'edit')}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
              {selectedMessage.status === 'sent' && (
                <button
                  onClick={() => handleMessageAction(selectedMessage.id, 'reply')}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10a8 8 0 008 8v2M3 10a8 8 0 018-8V0C5 0 0 5 0 10h3zm8 0h3a8 8 0 018 8v2M11 12h2m-6 0H3" />
                  </svg>
                  Reply
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compose Message Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto animate-on-scroll">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Compose System Message</h3>
              <button onClick={() => dispatch(setShowCompose(false))} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="composeTitle" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="composeTitle"
                  value={composeData.title}
                  onChange={(e) => dispatch(setComposeData({...composeData, title: e.target.value}))}
                  placeholder="Enter message title"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="composePriority" className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    id="composePriority"
                    value={composeData.priority}
                    onChange={(e) => dispatch(setComposeData({...composeData, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'}))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>
                        <span className="capitalize">{priority}</span>
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="composeMessageType" className="block text-sm font-medium text-gray-700">Message Type</label>
                  <select
                    id="composeMessageType"
                    value={composeData.message_type}
                    onChange={(e) => dispatch(setComposeData({...composeData, message_type: e.target.value as 'announcement' | 'notification' | 'alert' | 'reminder' | 'newsletter'}))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        <span className="capitalize">{category}</span>
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="composeTargetAudience" className="block text-sm font-medium text-gray-700">Target Audience</label>
                <select
                  id="composeTargetAudience"
                  value={composeData.target_audience}
                  onChange={(e) => dispatch(setComposeData({...composeData, target_audience: e.target.value}))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all_users">All Users</option>
                  <option value="players">Players</option>
                  <option value="coaches">Coaches</option>
                  <option value="clubs">Clubs</option>
                  <option value="partners">Partners</option>
                  <option value="states">State Committees</option>
                  <option value="players_coaches">Players & Coaches</option>
                  <option value="business_users">Business Users</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="composeContent" className="block text-sm font-medium text-gray-700">Message Content</label>
                <textarea
                  id="composeContent"
                  value={composeData.content}
                  onChange={(e) => dispatch(setComposeData({...composeData, content: e.target.value}))}
                  placeholder="Enter your message content..."
                  rows={6}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="composeSendTime" className="block text-sm font-medium text-gray-700">Send Time</label>
                  <select
                    id="composeSendTime"
                    value={composeData.scheduled_send_at ? 'scheduled' : 'immediate'}
                    onChange={(e) => dispatch(setComposeData({
                      ...composeData, 
                      scheduled_send_at: e.target.value === 'scheduled' ? new Date().toISOString().slice(0, 16) : undefined
                    }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="immediate">Send Immediately</option>
                    <option value="scheduled">Schedule for Later</option>
                  </select>
                </div>
                
                {composeData.scheduled_send_at && (
                  <div>
                    <label htmlFor="composeScheduledTime" className="block text-sm font-medium text-gray-700">Scheduled Time</label>
                    <input
                      type="datetime-local"
                      id="composeScheduledTime"
                      value={composeData.scheduled_send_at}
                      onChange={(e) => dispatch(setComposeData({...composeData, scheduled_send_at: e.target.value}))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button onClick={() => dispatch(setShowCompose(false))} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Cancel
              </button>
              <button onClick={() => dispatch(setComposeData({...composeData, content: ''}))} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Save Draft
              </button>
              <button onClick={handleSendMessage} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10a8 8 0 008 8v2M3 10a8 8 0 018-8V0C5 0 0 5 0 10h3zm8 0h3a8 8 0 018 8v2M11 12h2m-6 0H3" />
                </svg>
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messaging; 