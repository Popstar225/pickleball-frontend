import React from 'react';
import { 
  Users, 
  BookOpen, 
  Star, 
  Award,
  Calendar
} from 'lucide-react';

interface CoachStats {
  totalStudents: number;
  activeStudents: number;
  trainingSessions: number;
  sessionsThisMonth: number;
  averageRating: number;
  totalReviews: number;
  certifications: number;
  nextSession: string;
  nextSessionDate: string;
  upcomingSessions: number;
  recentAchievements: string[];
}

interface OverviewProps {
  coachStats: CoachStats;
}

const Overview: React.FC<OverviewProps> = ({ coachStats }) => {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Students</h3>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="pt-2">
            <div className="text-2xl font-bold text-blue-600">{coachStats.totalStudents}</div>
            <p className="text-xs text-gray-600">{coachStats.activeStudents} active</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Training Sessions</h3>
            <BookOpen className="h-4 w-4 text-green-500" />
          </div>
          <div className="pt-2">
            <div className="text-2xl font-bold text-green-600">{coachStats.trainingSessions}</div>
            <p className="text-xs text-gray-600">{coachStats.sessionsThisMonth} this month</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Average Rating</h3>
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="pt-2">
            <div className="text-2xl font-bold text-yellow-600">{coachStats.averageRating}</div>
            <p className="text-xs text-gray-600">{coachStats.totalReviews} reviews</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Certifications</h3>
            <Award className="h-4 w-4 text-purple-500" />
          </div>
          <div className="pt-2">
            <div className="text-2xl font-bold text-purple-600">{coachStats.certifications}</div>
            <p className="text-xs text-gray-600">active certifications</p>
          </div>
        </div>
      </div>

      {/* Next Session and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Session */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Next Training Session</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {coachStats.nextSession}
                </h3>
                <p className="text-gray-600 mb-4">
                  {new Date(coachStats.nextSessionDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <div className="flex justify-center space-x-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{coachStats.upcomingSessions}</div>
                    <div className="text-sm text-gray-600">Upcoming Sessions</div>
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 hover:shadow-lg">
                  View Session Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span>Recent Achievements</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {coachStats.recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{achievement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              className="h-20 flex-col space-y-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 hover:shadow-md"
            >
              <Users className="h-6 w-6 mx-auto" />
              <span>Manage Students</span>
            </button>
            <button 
              className="h-20 flex-col space-y-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 hover:shadow-md"
            >
              <Calendar className="h-6 w-6 mx-auto" />
              <span>Schedule Session</span>
            </button>
            <button 
              className="h-20 flex-col space-y-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 hover:shadow-md"
            >
              <BookOpen className="h-6 w-6 mx-auto" />
              <span>Training Plans</span>
            </button>
            <button 
              className="h-20 flex-col space-y-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 hover:shadow-md"
            >
              <Award className="h-6 w-6 mx-auto" />
              <span>My Credentials</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 