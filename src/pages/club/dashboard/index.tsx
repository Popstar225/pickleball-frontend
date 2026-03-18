import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { AppDispatch } from '../../../store';
import { 
  fetchClubStats, 
  fetchClubMembers, 
  fetchClubTournaments, 
  fetchCourtBookings, 
  fetchClubInvoices, 
  fetchMicrositeConfig, 
  fetchUpcomingEvents, 
  fetchCourtStatus, 
  fetchTimeSlots,
  ClubMember
} from '../../../store/slices/clubDashboardSlice';

// Import dashboard components
import Overview from './Overview';
import CourtRental from './CourtRental';
import Tournaments from './Tournaments';
import Invoices from './Invoices';
import Microsite from './Microsite';
import Reports from './Reports';
import Members from './Members';

// Interface for the Members component
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

const ClubDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { 
    clubStats, 
    members, 
    tournaments, 
    courtBookings, 
    invoices, 
    micrositeConfig, 
    upcomingEvents, 
    courtStatus, 
    timeSlots,
    loading,
    error 
  } = useSelector((state: RootState) => state.clubDashboard);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourt, setSelectedCourt] = useState('all');

  // Fetch all dashboard data on component mount
  useEffect(() => {
    if (user?.club_id) {
      dispatch(fetchClubStats(user.club_id));
      dispatch(fetchClubMembers(user.club_id));
      dispatch(fetchClubTournaments(user.club_id));
      dispatch(fetchCourtBookings({ clubId: user.club_id, date: selectedDate }));
      dispatch(fetchClubInvoices(user.club_id));
      dispatch(fetchMicrositeConfig(user.club_id));
      dispatch(fetchUpcomingEvents(user.club_id));
      dispatch(fetchCourtStatus(user.club_id));
      dispatch(fetchTimeSlots(user.club_id));
    }
  }, [dispatch, user?.club_id, selectedDate]);

  // Loading state
  if (loading && !clubStats) {
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
  if (error && !clubStats) {
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













  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Registration Open': return 'bg-green-100 text-green-800';
      case 'Full': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMemberStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'basic':
      case 'premium':
      case 'vip':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'suspended':
      case 'expired':
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Map ClubMember to Member type for the Members component
  const mapClubMembersToMembers = (clubMembers: ClubMember[]): Member[] => {
    return clubMembers.map(member => ({
      id: member.id?.toString() || '',
      username: member.email?.split('@')[0] || member.name?.toLowerCase().replace(/\s+/g, '') || '',
      full_name: member.name || '',
      user_type: 'player',
      skill_level: '3.0',
      membership_status: member.type?.toLowerCase() || 'basic',
      created_at: member.joinDate || new Date().toISOString(),
      email: member.email || '',
      phone: member.phone || '',
      profile_photo: member.photo || '',
      last_visit: member.lastVisit || '',
      total_visits: member.totalVisits || 0,
      membership_expires_at: member.membershipExpiry || ''
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="animate-on-scroll text-3xl font-bold text-gray-900">Club Dashboard</h1>
              <p className="animate-on-scroll text-gray-300">Welcome back, {user?.name || 'Club Manager'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="animate-on-scroll text-sm text-gray-300">Elite Pickleball Club</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-8 overflow-x-auto pb-2 min-h-[60px]">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-300 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Overview
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'courts'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-300 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => setActiveTab('courts')}
              >
                <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Courts
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'tournaments'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-300 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => setActiveTab('tournaments')}
              >
                <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Tournaments
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'invoices'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-300 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => setActiveTab('invoices')}
              >
                <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Invoices
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'microsite'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-300 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => setActiveTab('microsite')}
              >
                <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                </svg>
                Microsite
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'reports'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-300 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => setActiveTab('reports')}
              >
                <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Reports
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'members'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-300 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => setActiveTab('members')}
              >
                <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Members
              </button>
            </div>
          </div>

          <div className="px-6 py-6 min-h-[400px]">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <Overview 
                clubStats={clubStats} 
                courtStatus={courtStatus || []} 
                onTabSelect={() => {
                  // Trigger data fetch when Overview tab is selected
                  if (user?.club_id) {
                    dispatch(fetchClubStats(user.club_id));
                    dispatch(fetchCourtStatus(user.club_id));
                    dispatch(fetchUpcomingEvents(user.club_id));
                    dispatch(fetchClubMembers(user.club_id));
                  }
                }}
              />
            )}

            {/* Court Rental Tab */}
            {activeTab === 'courts' && (
              <CourtRental
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedCourt={selectedCourt}
                setSelectedCourt={setSelectedCourt}
                timeSlots={timeSlots || []}
                courtBookings={courtBookings || {}}
              />
            )}

            {/* Tournaments Tab */}
            {activeTab === 'tournaments' && (
              <Tournaments tournaments={tournaments || []} />
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <Invoices invoices={invoices || []} />
            )}

            {/* Microsite Tab */}
            {activeTab === 'microsite' && (
              <Microsite micrositeConfig={micrositeConfig} />
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <Reports />
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <Members members={mapClubMembersToMembers(members || [])} />
            )}
          </div>
        </div>

        {/* Upcoming Events & Recent Members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Upcoming Events */}
          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Upcoming Events</span>
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {(upcomingEvents || []).map((event) => (
                  <div key={event.id} className="animate-on-scroll flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`animate-on-scroll w-10 h-10 rounded-full flex items-center justify-center ${
                        event.type === 'Tournament' ? 'bg-blue-100 text-blue-600' :
                        event.type === 'Training' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {event.type === 'Tournament' ? 
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg> :
                         event.type === 'Training' ? 
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg> :
                         <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>}
                      </div>
                      <div>
                        <h4 className="animate-on-scroll font-medium text-gray-900">{event.title}</h4>
                        <p className="animate-on-scroll text-sm text-gray-300">{event.date} at {event.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`animate-on-scroll inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <p className="animate-on-scroll text-sm text-gray-300 mt-1">{event.participants} participants</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Members */}
          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Recent Members</span>
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {mapClubMembersToMembers(members || []).slice(0, 3).map((member) => (
                  <div key={member.id} className="animate-on-scroll flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-10 w-10">
                        {member.profile_photo ? (
                          <img className="h-10 w-10 rounded-full" src={member.profile_photo} alt={member.full_name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                            {member.full_name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="animate-on-scroll font-medium text-gray-900">{member.full_name}</h4>
                        <p className="animate-on-scroll text-sm text-gray-300">{member.membership_status} • Joined: {member.created_at}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`animate-on-scroll inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMemberStatusColor(member.membership_status)}`}>
                        {member.membership_status}
                      </span>
                    </div>
                  </div>
                ))}
                <button 
                  className="animate-on-scroll inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setActiveTab('members')}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  View All Members
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="animate-on-scroll text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab('members')}
                  className="animate-on-scroll inline-flex flex-col items-center justify-center h-20 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 space-y-2"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>Manage Members</span>
                </button>
                <button 
                  onClick={() => setActiveTab('courts')}
                  className="animate-on-scroll inline-flex flex-col items-center justify-center h-20 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 space-y-2"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Court Management</span>
                </button>
                <button 
                  onClick={() => setActiveTab('tournaments')}
                  className="animate-on-scroll inline-flex flex-col items-center justify-center h-20 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 space-y-2"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Schedule Events</span>
                </button>
                <button 
                  onClick={() => setActiveTab('microsite')}
                  className="animate-on-scroll inline-flex flex-col items-center justify-center h-20 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 space-y-2"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Club Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDashboard; 