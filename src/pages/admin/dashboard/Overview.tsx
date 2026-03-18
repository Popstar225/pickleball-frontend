import React from 'react';

interface OverviewProps {
  systemStats: {
    totalUsers: number;
    activeUsers: number;
    totalClubs: number;
    totalCourts: number;
    totalTournaments: number;
    monthlyRevenue: number;
    systemUptime: number;
    pendingApprovals: number;
    activeFederations: number;
    totalStates: number;
  };
  recentSystemEvents: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: string;
    severity: string;
    user: string;
  }>;
  pendingActions: Array<{
    id: number;
    type: string;
    count: number;
    description: string;
    priority: string;
  }>;
  timeRange: string;
  setTimeRange: (range: string) => void;
  showMessaging: boolean;
  setShowMessaging: (show: boolean) => void;
  messageData: any;
  setMessageData: (data: any) => void;
}

const Overview: React.FC<OverviewProps> = ({
  // systemStats,
  recentSystemEvents,
  pendingActions,
  timeRange,
  setTimeRange,
  showMessaging,
  setShowMessaging,
  messageData,
  setMessageData,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = () => {
    // Handle message sending logic
    console.log('Sending message:', messageData);
    setShowMessaging(false);
    setMessageData({
      subject: '',
      message: '',
      recipients: {
        players: false,
        coaches: false,
        clubs: false,
        partners: false,
        stateCommittees: false,
        admins: false,
      },
      priority: 'normal',
      sendImmediately: true,
      scheduledTime: '',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* System Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 animate-on-scroll">Total Users</p>
              <p className="text-2xl font-bold text-blue-600 animate-on-scroll">
                {/* formatNumber(systemStats.totalUsers) */}
              </p>
            </div>
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 animate-on-scroll">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 animate-on-scroll">Active Users</p>
              <p className="text-2xl font-bold text-green-600 animate-on-scroll">
                {/* {formatNumber(systemStats.activeUsers)} */}
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-100 text-green-600 animate-on-scroll">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 animate-on-scroll">Total Clubs</p>
              <p className="text-2xl font-bold text-purple-600 animate-on-scroll">
                {/* {formatNumber(systemStats.totalClubs)} */}
              </p>
            </div>
            <div className="p-2 rounded-full bg-purple-100 text-purple-600 animate-on-scroll">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 animate-on-scroll">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-600 animate-on-scroll">
                {/* {formatCurrency(systemStats.monthlyRevenue)} */}
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-100 text-green-600 animate-on-scroll">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 animate-on-scroll">System Uptime</p>
              <p className="text-2xl font-bold text-blue-600 animate-on-scroll">
                {/* {systemStats.systemUptime}% */}
              </p>
            </div>
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 animate-on-scroll">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 animate-on-scroll">Total Courts</p>
              <p className="text-2xl font-bold text-indigo-600 animate-on-scroll">
                {/* {formatNumber(systemStats.totalCourts)} */}
              </p>
            </div>
            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 animate-on-scroll">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 animate-on-scroll">
                Total Tournaments
              </p>
              <p className="text-2xl font-bold text-orange-600 animate-on-scroll">
                {/* {formatNumber(systemStats.totalTournaments)} */}
              </p>
            </div>
            <div className="p-2 rounded-full bg-orange-100 text-orange-600 animate-on-scroll">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 animate-on-scroll">
                Pending Approvals
              </p>
              <p className="text-2xl font-bold text-yellow-600 animate-on-scroll">
                {/* {systemStats.pendingApprovals} */}
              </p>
            </div>
            <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 animate-on-scroll">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 animate-on-scroll">
                Active Federations
              </p>
              <p className="text-2xl font-bold text-purple-600 animate-on-scroll">
                {/* {systemStats.activeFederations} */}
              </p>
            </div>
            <div className="p-2 rounded-full bg-purple-100 text-purple-600 animate-on-scroll">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300 animate-on-scroll">Total States</p>
              <p className="text-2xl font-bold text-red-600 animate-on-scroll">
                {/* {systemStats.totalStates} */}
              </p>
            </div>
            <div className="p-2 rounded-full bg-red-100 text-red-600 animate-on-scroll">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Selector and Messaging */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <label htmlFor="timeRange" className="text-sm font-medium animate-on-scroll">
            Time Range:
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        <button
          onClick={() => setShowMessaging(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>Send System Message</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent System Events */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 animate-on-scroll">
              <svg
                className="h-5 w-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Recent System Events</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentSystemEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg animate-on-scroll"
                >
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(
                        event.severity,
                      )} animate-on-scroll`}
                    >
                      {event.severity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 animate-on-scroll">
                      {event.type}
                    </p>
                    <p className="text-sm text-gray-300 animate-on-scroll">{event.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-300 animate-on-scroll">
                      <span className="animate-on-scroll">{event.timestamp}</span>
                      <span className="animate-on-scroll">•</span>
                      <span className="animate-on-scroll">{event.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 animate-on-scroll">
              <svg
                className="h-5 w-5 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Pending Actions</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-on-scroll"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 animate-on-scroll">{action.type}</h4>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          action.priority,
                        )} animate-on-scroll`}
                      >
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 animate-on-scroll">{action.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 animate-on-scroll">
                      {action.count}
                    </div>
                    <button className="px-3 py-1 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Message Modal */}
      {showMessaging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 animate-on-scroll">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold animate-on-scroll">Send System Message</h3>
              <button
                className="p-1 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 animate-on-scroll"
                onClick={() => setShowMessaging(false)}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={messageData.subject}
                  onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                  placeholder="Enter message subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={messageData.message}
                  onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                  placeholder="Enter your message"
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
                />
              </div>

              <div>
                <label className="text-sm font-medium animate-on-scroll">Recipients</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(messageData.recipients).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2 animate-on-scroll">
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) =>
                          setMessageData({
                            ...messageData,
                            recipients: {
                              ...messageData.recipients,
                              [key]: e.target.checked,
                            },
                          })
                        }
                        className="rounded focus:ring-2 focus:ring-blue-500 animate-on-scroll"
                      />
                      <span className="text-sm capitalize animate-on-scroll">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={messageData.priority}
                    onChange={(e) => setMessageData({ ...messageData, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sendTime"
                    className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll"
                  >
                    Send Time
                  </label>
                  <select
                    id="sendTime"
                    value={messageData.sendImmediately ? 'immediate' : 'scheduled'}
                    onChange={(e) =>
                      setMessageData({
                        ...messageData,
                        sendImmediately: e.target.value === 'immediate',
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
                  >
                    <option value="immediate">Send Immediately</option>
                    <option value="scheduled">Schedule for Later</option>
                  </select>
                </div>
              </div>

              {!messageData.sendImmediately && (
                <div>
                  <label
                    htmlFor="scheduledTime"
                    className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll"
                  >
                    Scheduled Time
                  </label>
                  <input
                    id="scheduledTime"
                    type="datetime-local"
                    value={messageData.scheduledTime}
                    onChange={(e) =>
                      setMessageData({ ...messageData, scheduledTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                onClick={() => setShowMessaging(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
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

export default Overview;
