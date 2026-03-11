import React from 'react';
import { 
  Calendar, 
  Plus, 
  Eye, 
  Edit3, 
  XCircle 
} from 'lucide-react';

interface Session {
  id: number;
  title: string;
  date: string;
  time: string;
  students: number;
  type: string;
  status: string;
  revenue: number;
}

interface SessionsProps {
  allSessions: Session[];
}

const Sessions: React.FC<SessionsProps> = ({ allSessions }) => {
  // Helper functions
  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'Private Session': return 'bg-purple-100 text-purple-800';
      case 'Group Session': return 'bg-blue-100 text-blue-800';
      case 'Tournament Prep': return 'bg-yellow-100 text-yellow-800';
      case 'Youth Programs': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSessionAction = (sessionId: number, action: string) => {
    console.log(`${action} session ${sessionId}`);
    // In real app, this would perform the action
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <span>Session Management</span>
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Schedule and Manage Training Sessions</h3>
            <button 
              onClick={() => handleSessionAction(0, 'create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 hover:shadow-lg flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Session</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Students</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allSessions.map((session) => (
                  <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4 font-medium">{session.title}</td>
                    <td className="py-3 px-4">
                      <div>{session.date}</div>
                      <div className="text-sm text-gray-600">{session.time}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getSessionTypeColor(session.type)}`}>
                        {session.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{session.students} student{session.students > 1 ? 's' : ''}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getSessionStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {session.revenue ? `$${session.revenue}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSessionAction(session.id, 'view')}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleSessionAction(session.id, 'edit')}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        {session.status === 'upcoming' && (
                          <button
                            onClick={() => handleSessionAction(session.id, 'cancel')}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sessions; 