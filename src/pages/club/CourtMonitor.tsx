import React, { useState } from 'react';

interface CourtPerformance {
  id: number;
  name: string;
  location: string;
  status: 'operational' | 'maintenance' | 'offline' | 'overloaded';
  uptime: number;
  responseTime: number;
  bookingsToday: number;
  utilization: number;
  lastMaintenance: string;
  nextMaintenance: string;
  issues: string[];
}

interface CourtMonitorProps {
  courtPerformance: CourtPerformance[];
}

const CourtMonitor: React.FC<CourtMonitorProps> = ({ courtPerformance }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedCourt, setSelectedCourt] = useState<CourtPerformance | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'overloaded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'maintenance': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'offline': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
      case 'overloaded': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
      default: return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-orange-600';
    if (utilization >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleCourtAction = (courtId: number, action: string) => {
    // Handle court actions
    console.log(`Court ${action} for ID ${courtId}`);
  };

  const generateReport = () => {
    // Generate court performance report
    console.log('Generating court performance report');
  };

  const filteredCourts = courtPerformance.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         court.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || court.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || court.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const stats = {
    total: courtPerformance.length,
    operational: courtPerformance.filter(c => c.status === 'operational').length,
    maintenance: courtPerformance.filter(c => c.status === 'maintenance').length,
    offline: courtPerformance.filter(c => c.status === 'offline').length,
    averageUptime: courtPerformance.reduce((sum, c) => sum + c.uptime, 0) / courtPerformance.length,
    totalBookings: courtPerformance.reduce((sum, c) => sum + c.bookingsToday, 0)
  };

  const locations = Array.from(new Set(courtPerformance.map(c => c.location)));

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 animate-on-scroll">Court Monitoring</h2>
          <p className="text-gray-600 animate-on-scroll">Monitor court performance and system health across all locations</p>
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
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Total Courts</p>
              <div className="text-2xl font-bold text-blue-600 animate-on-scroll">{stats.total}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">monitored courts</p>
            </div>
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 animate-on-scroll">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Operational</p>
              <div className="text-2xl font-bold text-green-600 animate-on-scroll">{stats.operational}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">fully operational</p>
            </div>
            <div className="p-2 rounded-full bg-green-100 text-green-600 animate-on-scroll">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Maintenance</p>
              <div className="text-2xl font-bold text-yellow-600 animate-on-scroll">{stats.maintenance}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">under maintenance</p>
            </div>
            <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 animate-on-scroll">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Offline</p>
              <div className="text-2xl font-bold text-red-600 animate-on-scroll">{stats.offline}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">currently offline</p>
            </div>
            <div className="p-2 rounded-full bg-red-100 text-red-600 animate-on-scroll">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Avg. Uptime</p>
              <div className="text-2xl font-bold text-purple-600 animate-on-scroll">{stats.averageUptime.toFixed(1)}%</div>
              <p className="text-xs text-gray-600 animate-on-scroll">system reliability</p>
            </div>
            <div className="p-2 rounded-full bg-purple-100 text-purple-600 animate-on-scroll">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Total Bookings</p>
              <div className="text-2xl font-bold text-green-600 animate-on-scroll">{stats.totalBookings}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">today</p>
            </div>
            <div className="p-2 rounded-full bg-green-100 text-green-600 animate-on-scroll">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Search Courts</label>
              <div className="relative">
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by court name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
                />
              </div>
            </div>
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Status Filter</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
              >
                <option value="all">All Statuses</option>
                <option value="operational">Operational</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
                <option value="overloaded">Overloaded</option>
              </select>
            </div>
            <div>
              <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Location Filter</label>
              <select 
                value={locationFilter} 
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
              >
                <option value="all">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L6.293 13H1a1 1 0 01-1-1V4z" />
                </svg>
                <span>Advanced Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Courts Performance Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 animate-on-scroll">Court Performance Overview</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 animate-on-scroll">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Court</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Uptime</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Response Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Bookings Today</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Utilization</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourts.map((court) => (
                  <tr key={court.id} className="border-b border-gray-100 hover:bg-gray-50 animate-on-scroll">
                    <td className="py-3 px-4 font-medium animate-on-scroll">{court.name}</td>
                    <td className="py-3 px-4 animate-on-scroll">{court.location}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(court.status)} animate-on-scroll`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(court.status)}
                          <span className="capitalize animate-on-scroll">{court.status}</span>
                        </div>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 animate-on-scroll">
                        <span className="font-medium animate-on-scroll">{court.uptime}%</span>
                        {court.uptime >= 95 ? (
                          <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                          </svg>
                        ) : court.uptime >= 80 ? (
                          <svg className="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={court.responseTime < 100 ? 'text-green-600' : 
                                     court.responseTime < 200 ? 'text-yellow-600' : 'text-red-600'}>
                        {court.responseTime}ms
                      </span>
                    </td>
                    <td className="py-3 px-4 animate-on-scroll">{court.bookingsToday}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${getUtilizationColor(court.utilization)} animate-on-scroll`}>
                        {court.utilization}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                          onClick={() => setSelectedCourt(court)}
                        >
                          <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Details
                        </button>
                        {court.status === 'offline' && (
                          <button
                            className="px-3 py-1 text-sm bg-white text-green-600 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                            onClick={() => handleCourtAction(court.id, 'restart')}
                          >
                            <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                            Restart
                          </button>
                        )}
                        {court.status === 'maintenance' && (
                          <button
                            className="px-3 py-1 text-sm bg-white text-blue-600 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                            onClick={() => handleCourtAction(court.id, 'complete')}
                          >
                            <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCourts.length === 0 && (
            <div className="text-center py-8 animate-on-scroll">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2 animate-on-scroll">No courts found</h3>
              <p className="text-gray-600 animate-on-scroll">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Court Detail Modal */}
      {selectedCourt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 animate-on-scroll">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold animate-on-scroll">Court Performance Details</h3>
              <button 
                className="p-1 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 animate-on-scroll"
                onClick={() => setSelectedCourt(null)}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Court Name</label>
                  <p className="font-medium animate-on-scroll">{selectedCourt.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Location</label>
                  <p className="animate-on-scroll">{selectedCourt.location}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Status</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedCourt.status)} animate-on-scroll`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedCourt.status)}
                      <span className="capitalize animate-on-scroll">{selectedCourt.status}</span>
                    </div>
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Uptime</label>
                  <p className="font-medium animate-on-scroll">{selectedCourt.uptime}%</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Response Time</label>
                  <p className={selectedCourt.responseTime < 100 ? 'text-green-600' : 
                              selectedCourt.responseTime < 200 ? 'text-yellow-600' : 'text-red-600'}>
                    {selectedCourt.responseTime}ms
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Utilization</label>
                  <p className={`font-medium ${getUtilizationColor(selectedCourt.utilization)} animate-on-scroll`}>
                    {selectedCourt.utilization}%
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Bookings Today</label>
                  <p className="animate-on-scroll">{selectedCourt.bookingsToday}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Last Maintenance</label>
                  <p className="animate-on-scroll">{selectedCourt.lastMaintenance}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 animate-on-scroll">Next Maintenance</label>
                <p className="animate-on-scroll">{selectedCourt.nextMaintenance}</p>
              </div>
              
              {selectedCourt.issues.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Current Issues</label>
                  <div className="mt-1 space-y-1">
                    {selectedCourt.issues.map((issue, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-red-600 animate-on-scroll">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="animate-on-scroll">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button 
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                onClick={() => setSelectedCourt(null)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                onClick={() => handleCourtAction(selectedCourt.id, 'configure')}
              >
                <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                Configure
              </button>
              <button
                onClick={() => handleCourtAction(selectedCourt.id, 'monitor')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
              >
                <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Monitor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourtMonitor; 