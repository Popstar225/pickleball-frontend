import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { AppDispatch } from '../../../store';
import { 
  fetchCoachStats, 
  fetchCoachSessions, 
  fetchStudentProgress, 
  fetchTrainingPlans, 
  fetchCredentials, 
  fetchRevenueData 
} from '../../../store/slices/coachDashboardSlice';
import Overview from './Overview';
import Sessions from './Sessions';
import Students from './Students';
import TrainingPlans from './TrainingPlans';
import Credentials from './Credentials';
import Revenue from './Revenue';

const CoachDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { 
    coachStats, 
    allSessions, 
    studentProgress, 
    trainingPlans, 
    credentials, 
    revenueData,
    loading,
    error 
  } = useSelector((state: RootState) => state.coachDashboard);
  
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all dashboard data on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCoachStats(user.id));
      dispatch(fetchCoachSessions(user.id));
      dispatch(fetchStudentProgress(user.id));
      dispatch(fetchTrainingPlans(user.id));
      dispatch(fetchCredentials(user.id));
      dispatch(fetchRevenueData(user.id));
    }
  }, [dispatch, user?.id]);

  // Loading state
  if (loading && !coachStats) {
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
  if (error && !coachStats) {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-on-scroll">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, Coach {user?.username || 'Coach'}!
          </h1>
          <p className="text-gray-600">
            Here's your coaching overview and upcoming sessions.
          </p>
        </div>

        {/* Main Content Tabs */}
        <div className="mb-8 animate-on-scroll">
          {/* Custom Tabs Implementation */}
          <div className="w-full">
            {/* Tab Navigation */}
            <div className="grid w-full grid-cols-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'sessions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Sessions
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'students'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('training')}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'training'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Training Plans
              </button>
              <button
                onClick={() => setActiveTab('credentials')}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'credentials'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Credentials
              </button>
              <button
                onClick={() => setActiveTab('revenue')}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'revenue'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Revenue
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="animate-on-scroll">
                  {coachStats ? (
                    <Overview 
                      coachStats={coachStats}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No coach statistics available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className="animate-on-scroll">
                  <Sessions allSessions={allSessions || []} />
                </div>
              )}

              {/* Students Tab */}
              {activeTab === 'students' && (
                <div className="animate-on-scroll">
                  <Students studentProgress={studentProgress || []} />
                </div>
              )}

              {/* Training Plans Tab */}
              {activeTab === 'training' && (
                <div className="animate-on-scroll">
                  <TrainingPlans trainingPlans={trainingPlans || []} />
                </div>
              )}

              {/* Credentials Tab */}
              {activeTab === 'credentials' && (
                <div className="animate-on-scroll">
                  <Credentials credentials={credentials || []} />
                </div>
              )}

              {/* Revenue Tab */}
              {activeTab === 'revenue' && (
                <div className="animate-on-scroll">
                  {revenueData && coachStats ? (
                    <Revenue revenueData={revenueData} coachStats={coachStats} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No revenue data available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard; 