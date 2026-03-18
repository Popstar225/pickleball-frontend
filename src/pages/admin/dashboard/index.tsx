import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { 
  fetchAdminSystemStats,
  fetchAdminSystemEvents,
  fetchAdminPendingActions,
  fetchAdminRankingIssues,
  fetchAdminMicrosites,
  fetchAdminCourtPerformance,
  fetchAdminAffiliations,
  fetchAdminMessages
} from '../../../store/slices/adminDashboardSlice';
import Overview from './Overview';
import Rankings from './Rankings';
import Microsites from './Microsites';
import CourtMonitor from './CourtMonitor';
import Affiliations from './Affiliations';
import Messaging from './Messaging';

const AdminDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Redux selectors for admin dashboard data
  const {
    systemStats,
    recentSystemEvents,
    pendingActions,
    rankingIssues,
    microsites,
    courtPerformance,
    affiliations,
    messages,
    loading,
    error
  } = useSelector((state: RootState) => state.adminDashboard);

  // Fetch all dashboard data on component mount
  useEffect(() => {
    dispatch(fetchAdminSystemStats());
    dispatch(fetchAdminSystemEvents());
    dispatch(fetchAdminPendingActions());
    dispatch(fetchAdminRankingIssues());
    dispatch(fetchAdminMicrosites());
    dispatch(fetchAdminCourtPerformance());
    dispatch(fetchAdminAffiliations());
    dispatch(fetchAdminMessages());
  }, [dispatch]);

  // Loading state
  if (loading && !systemStats) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !systemStats) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for messaging (will be handled by dedicated messaging page)
  const messageData = {
    subject: '',
    message: '',
    recipients: {
      players: false,
      coaches: false,
      clubs: false,
      partners: false,
      stateCommittees: false,
      admins: false
    },
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    sendImmediately: true,
    scheduledTime: ''
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-on-scroll">
            Welcome back, {user?.username || 'Super Admin'}!
          </h1>
          <p className="text-gray-300 animate-on-scroll">System-wide overview and performance metrics</p>
        </div>

                {/* Main Content Tabs */}
        <div className="mb-8">
          <div className="w-full">
            {/* Tab Navigation */}
            <div className="grid w-full grid-cols-6 bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 text-sm font-medium rounded-l-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-300 hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('rankings')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'rankings'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-300 hover:bg-gray-50'
                }`}
              >
                Rankings
              </button>
              <button
                onClick={() => setActiveTab('microsites')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'microsites'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-300 hover:bg-gray-50'
                }`}
              >
                Microsites
              </button>
              <button
                onClick={() => setActiveTab('court-monitor')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'court-monitor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-300 hover:bg-gray-50'
                }`}
              >
                Court Monitor
              </button>
              <button
                onClick={() => setActiveTab('affiliations')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'affiliations'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-300 hover:bg-gray-50'
                }`}
              >
                Affiliations
              </button>
              <button
                onClick={() => setActiveTab('messaging')}
                className={`px-4 py-3 text-sm font-medium rounded-r-lg transition-colors ${
                  activeTab === 'messaging'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-300 hover:bg-gray-50'
                }`}
              >
                Messaging
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === 'overview' && (
                <div>
                  <Overview
                    systemStats={systemStats}
                    recentSystemEvents={recentSystemEvents}
                    pendingActions={pendingActions}
                    timeRange="30"
                    setTimeRange={() => {}}
                    showMessaging={false}
                    setShowMessaging={() => {}}
                    messageData={messageData}
                    setMessageData={() => {}}
                  />
                </div>
              )}

              {activeTab === 'rankings' && (
                <div>
                  <Rankings rankingIssues={rankingIssues} />
                </div>
              )}

              {activeTab === 'microsites' && (
                <div>
                  <Microsites microsites={microsites} />
                </div>
              )}

              {activeTab === 'court-monitor' && (
                <div>
                  <CourtMonitor courtPerformance={courtPerformance} />
                </div>
              )}

              {activeTab === 'affiliations' && (
                <div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <Affiliations />
                  </div>
                </div>
              )}

              {activeTab === 'messaging' && (
                <div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <Messaging messages={messages} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional System Information can be added here if needed */}
      </div>
    </div>
  );
};

export default AdminDashboard; 