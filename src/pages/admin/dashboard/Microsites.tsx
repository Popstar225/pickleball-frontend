import React, { useState } from 'react';

interface Microsite {
  id: number;
  name: string;
  type: 'state' | 'club' | 'partner';
  status: 'active' | 'inactive' | 'pending' | 'maintenance';
  lastUpdated: string;
  contentIssues: number;
  needsReview: boolean;
  url: string;
  owner: string;
  region: string;
}

interface MicrositesProps {
  microsites: Microsite[];
}

const Microsites: React.FC<MicrositesProps> = ({ microsites }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMicrosite, setSelectedMicrosite] = useState<Microsite | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'state': return 'bg-blue-100 text-blue-800';
      case 'club': return 'bg-purple-100 text-purple-800';
      case 'partner': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'inactive': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'pending': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
      case 'maintenance': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
      default: return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
  };

  const handleMicrositeAction = (micrositeId: number, action: string) => {
    // Handle microsite actions
    console.log(`Microsite ${action} for ID ${micrositeId}`);
  };

  const generateReport = () => {
    // Generate microsite report
    console.log('Generating microsite report');
  };

  const filteredMicrosites = microsites.filter(microsite => {
    const matchesSearch = microsite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         microsite.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || microsite.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || microsite.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: microsites.length,
    active: microsites.filter(m => m.status === 'active').length,
    pending: microsites.filter(m => m.status === 'pending').length,
    issues: microsites.reduce((sum, m) => sum + m.contentIssues, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 animate-on-scroll">Microsite Management</h2>
          <p className="text-gray-600 animate-on-scroll">Monitor and manage all microsites across the platform</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Total Microsites</p>
              <div className="text-2xl font-bold text-blue-600 animate-on-scroll">{stats.total}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">active sites</p>
            </div>
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 animate-on-scroll">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Active Sites</p>
              <div className="text-2xl font-bold text-green-600 animate-on-scroll">{stats.active}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">currently live</p>
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
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Pending Review</p>
              <div className="text-2xl font-bold text-yellow-600 animate-on-scroll">{stats.pending}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">awaiting approval</p>
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
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Content Issues</p>
              <div className="text-2xl font-bold text-red-600 animate-on-scroll">{stats.issues}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">issues detected</p>
            </div>
            <div className="p-2 rounded-full bg-red-100 text-red-600 animate-on-scroll">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
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
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Search Microsites</label>
              <div className="relative">
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
                />
              </div>
            </div>
            <div>
              <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Type Filter</label>
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
              >
                <option value="all">All Types</option>
                <option value="state">State Committees</option>
                <option value="club">Clubs</option>
                <option value="partner">Partners</option>
              </select>
            </div>
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Status Filter</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-on-scroll"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="maintenance">Maintenance</option>
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

      {/* Microsites Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 animate-on-scroll">All Microsites</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 animate-on-scroll">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Owner</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Region</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Last Updated</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Issues</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMicrosites.map((microsite) => (
                  <tr key={microsite.id} className="border-b border-gray-100 hover:bg-gray-50 animate-on-scroll">
                    <td className="py-3 px-4 font-medium animate-on-scroll">
                      <div>
                        <div className="animate-on-scroll">{microsite.name}</div>
                        <div className="text-sm text-gray-500 animate-on-scroll">{microsite.url}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(microsite.type)} animate-on-scroll`}>
                        <div className="flex items-center space-x-1">
                          {microsite.type === 'state' && (
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                          {microsite.type === 'club' && (
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                          {microsite.type === 'partner' && (
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <span className="capitalize animate-on-scroll">{microsite.type}</span>
                        </div>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(microsite.status)} animate-on-scroll`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(microsite.status)}
                          <span className="capitalize animate-on-scroll">{microsite.status}</span>
                        </div>
                      </span>
                    </td>
                    <td className="py-3 px-4 animate-on-scroll">{microsite.owner}</td>
                    <td className="py-3 px-4 animate-on-scroll">{microsite.region}</td>
                    <td className="py-3 px-4 animate-on-scroll">{microsite.lastUpdated}</td>
                    <td className="py-3 px-4">
                      {microsite.contentIssues > 0 ? (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full animate-on-scroll">{microsite.contentIssues}</span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full animate-on-scroll">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                          onClick={() => window.open(microsite.url, '_blank')}
                        >
                          <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          className="px-3 py-1 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                          onClick={() => setSelectedMicrosite(microsite)}
                        >
                          <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Manage
                        </button>
                        {microsite.needsReview && (
                          <button
                            className="px-3 py-1 text-sm bg-white text-yellow-600 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                            onClick={() => handleMicrositeAction(microsite.id, 'review')}
                          >
                            <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMicrosites.length === 0 && (
            <div className="text-center py-8 animate-on-scroll">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2 animate-on-scroll">No microsites found</h3>
              <p className="text-gray-600 animate-on-scroll">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Microsite Detail Modal */}
      {selectedMicrosite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 animate-on-scroll">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold animate-on-scroll">Microsite Details</h3>
              <button 
                className="p-1 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 animate-on-scroll"
                onClick={() => setSelectedMicrosite(null)}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Name</label>
                  <p className="font-medium animate-on-scroll">{selectedMicrosite.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Type</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedMicrosite.type)} animate-on-scroll`}>
                    <span className="capitalize animate-on-scroll">{selectedMicrosite.type}</span>
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Owner</label>
                  <p className="animate-on-scroll">{selectedMicrosite.owner}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Region</label>
                  <p className="animate-on-scroll">{selectedMicrosite.region}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 animate-on-scroll">URL</label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded animate-on-scroll">
                    {selectedMicrosite.url}
                  </span>
                  <button
                    className="px-3 py-1 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                    onClick={() => window.open(selectedMicrosite.url, '_blank')}
                  >
                    <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Visit
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Status</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMicrosite.status)} animate-on-scroll`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedMicrosite.status)}
                      <span className="capitalize animate-on-scroll">{selectedMicrosite.status}</span>
                    </div>
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Last Updated</label>
                  <p className="animate-on-scroll">{selectedMicrosite.lastUpdated}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 animate-on-scroll">Content Issues</label>
                <div className="mt-1">
                  {selectedMicrosite.contentIssues > 0 ? (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full animate-on-scroll">{selectedMicrosite.contentIssues} issues detected</span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full animate-on-scroll">No issues detected</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button 
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                onClick={() => setSelectedMicrosite(null)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                onClick={() => handleMicrositeAction(selectedMicrosite.id, 'configure')}
              >
                <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configure
              </button>
              <button
                onClick={() => handleMicrositeAction(selectedMicrosite.id, 'manage')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
              >
                <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Manage Site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Microsites; 