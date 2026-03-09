import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { 
  fetchClubStats, 
  fetchCourtStatus, 
  fetchUpcomingEvents,
  fetchClubMembers 
} from '../../../store/slices/clubDashboardSlice';
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Clock,
  Plus,
  Settings,
  BarChart3,
  UserPlus,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface OverviewProps {
  clubStats: {
    totalMembers: number;
    activeMembers: number;
    totalCourts: number;
    availableCourts: number;
    upcomingEvents: number;
    monthlyRevenue: number;
    averageRating: number;
    totalReviews: number;
    recentActivities: string[];
  } | null;
  courtStatus: Array<{
    id: number;
    name: string;
    status: string;
    currentTime: string;
    nextBooking: string;
  }>;
  onTabSelect?: () => void; // Callback when tab is selected
}

const Overview: React.FC<OverviewProps> = ({ clubStats: initialClubStats, courtStatus: initialCourtStatus, onTabSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  
  // Local state for data
  const [localClubStats, setLocalClubStats] = useState(initialClubStats);
  const [localCourtStatus, setLocalCourtStatus] = useState(initialCourtStatus);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalClubStats(initialClubStats);
    setLocalCourtStatus(initialCourtStatus);
    
    // Set initial last updated timestamp if we have data
    if (initialClubStats || initialCourtStatus) {
      setLastUpdated(new Date());
    }
  }, [initialClubStats, initialCourtStatus]);

  // Refresh data function
  const refreshData = async () => {
    if (!user?.club_id) return;
    
    setIsLoading(true);
    try {
      const [statsResult, courtStatusResult, eventsResult, membersResult] = await Promise.all([
        dispatch(fetchClubStats(user.club_id)).unwrap(),
        dispatch(fetchCourtStatus(user.club_id)).unwrap(),
        dispatch(fetchUpcomingEvents(user.club_id)).unwrap(),
        dispatch(fetchClubMembers(user.club_id)).unwrap()
      ]);

      // Update local state with fresh data
      if (statsResult) {
        setLocalClubStats(statsResult);
      }
      if (courtStatusResult) {
        setLocalCourtStatus(courtStatusResult);
      }

      // Set last updated timestamp
      setLastUpdated(new Date());

      console.log('Data refreshed successfully:', { statsResult, courtStatusResult, eventsResult, membersResult });
      toast.success('Club data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh club data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (user?.club_id) {
      // Initial data fetch if we don't have data
      if (!localClubStats || !localCourtStatus) {
        refreshData();
      }
      
      const interval = setInterval(refreshData, 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [user?.club_id, localClubStats, localCourtStatus]);

  // Fetch data when tab is selected
  useEffect(() => {
    if (onTabSelect && user?.club_id) {
      // Call the callback to trigger data fetch from parent
      onTabSelect();
    }
  }, [onTabSelect, user?.club_id]);

  // Provide default values if localClubStats is null
  const stats = localClubStats || {
    totalMembers: 0,
    activeMembers: 0,
    totalCourts: 0,
    availableCourts: 0,
    upcomingEvents: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    recentActivities: []
  };

  // Use local court status or fallback to props
  const courtStatus = localCourtStatus || initialCourtStatus || [];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case 'occupied':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
      case 'maintenance':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Club Overview</h2>
          <p className="text-gray-600">Monitor your club's performance and status</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()} ({lastUpdated.toLocaleDateString()})
            </p>
          )}
          {isLoading && (
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
              Fetching latest data...
            </p>
          )}
        </div>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Key Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
              <p className="text-sm text-gray-500">
                {stats.totalMembers > 0 ? formatPercentage((stats.activeMembers / stats.totalMembers) * 100) : '0%'} active
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Courts */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCourts}</p>
              <p className="text-sm text-gray-500">
                {stats.availableCourts} available now
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12.5% from last month
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
              <p className="text-sm text-gray-500">
                {stats.totalReviews} reviews
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Court Status Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span>Court Status Overview</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {courtStatus && courtStatus.length > 0 ? (
                  courtStatus.map((court) => (
                    <div key={court.id} className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      court.status === 'Available' ? 'bg-green-50 border-green-200' :
                      court.status === 'Occupied' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          {getStatusIcon(court.status)}
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{court.name}</h4>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(court.status)}`}>
                          {court.status}
                        </span>
                        <p className="text-xs text-gray-600 mt-2">{court.currentTime}</p>
                        <p className="text-xs text-gray-500">Next: {court.nextBooking}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No court status information available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <span>Recent Activities</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{activity}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <span>Quick Actions</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 group">
              <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Add Member</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-all duration-200 group">
              <div className="p-3 bg-green-100 rounded-full mb-3 group-hover:bg-green-200 transition-colors">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Schedule Event</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-yellow-300 transition-all duration-200 group">
              <div className="p-3 bg-yellow-100 rounded-full mb-3 group-hover:bg-yellow-200 transition-colors">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Manage Courts</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-all duration-200 group">
              <div className="p-3 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200 transition-colors">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Membership Growth */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span>Membership Growth</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Members</span>
                <span className="text-lg font-semibold text-green-600">{stats.activeMembers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalMembers > 0 ? (stats.activeMembers / stats.totalMembers) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Total: {stats.totalMembers}</span>
                <span>{stats.totalMembers > 0 ? formatPercentage((stats.activeMembers / stats.totalMembers) * 100) : '0%'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Court Utilization */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span>Court Utilization</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available Courts</span>
                <span className="text-lg font-semibold text-green-600">{stats.availableCourts}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalCourts > 0 ? (stats.availableCourts / stats.totalCourts) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Total: {stats.totalCourts}</span>
                <span>{stats.totalCourts > 0 ? formatPercentage((stats.availableCourts / stats.totalCourts) * 100) : '0%'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 