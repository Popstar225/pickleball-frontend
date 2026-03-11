import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { 
  fetchRankingIssues, 
  approveRankingIssue, 
  rejectRankingIssue,
  fetchRankingStats,
  exportRankingsReport,
  setSelectedIssue,
  clearSelectedIssue
} from '../../../store/slices/rankingsSlice';
import { AppDispatch } from '../../../store';

interface RankingIssue {
  id: string;
  player_id: string;
  player_name: string;
  player_email: string;
  current_rank: number;
  requested_rank: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
}

interface RankingsProps {
  rankingIssues?: RankingIssue[];
}

const Rankings: React.FC<RankingsProps> = ({ rankingIssues: propRankingIssues }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    rankingIssues, 
    selectedIssue, 
    loading, 
    error, 
    stats 
  } = useSelector((state: RootState) => state.adminRankings);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewNotes, setReviewNotes] = useState('');
  const [newRank, setNewRank] = useState<number | ''>('');

  // Use prop ranking issues if provided, otherwise use Redux state
  const displayRankingIssues = propRankingIssues || rankingIssues;

  useEffect(() => {
    if (!propRankingIssues) {
      dispatch(fetchRankingIssues({}));
      dispatch(fetchRankingStats());
    }
  }, [dispatch, propRankingIssues]);

  // Calculate stats from ranking issues if not available from Redux
  const calculatedStats = stats || {
    total: displayRankingIssues.length,
    pending: displayRankingIssues.filter(i => i.status === 'pending').length,
    approved: displayRankingIssues.filter(i => i.status === 'approved').length,
    rejected: displayRankingIssues.filter(i => i.status === 'rejected').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'approved': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'rejected': return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      default: return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
  };

  const handleRankingAction = (issueId: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      dispatch(approveRankingIssue({ 
        id: issueId, 
        newRank: selectedIssue?.requested_rank || 0,
        notes: 'Approved by admin'
      }));
    } else {
      dispatch(rejectRankingIssue({ 
        id: issueId, 
        notes: 'Rejected by admin'
      }));
    }
  };

  const generateCSVReport = () => {
    dispatch(exportRankingsReport({ format: 'csv' }));
  };

  const filteredIssues = displayRankingIssues.filter(issue => {
    const matchesSearch = issue.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Use calculated stats instead of local stats
  const displayStats = calculatedStats;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 animate-on-scroll">Rankings Management</h2>
          <p className="text-gray-600 animate-on-scroll">Manage player ranking requests and adjustments</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={generateCSVReport} 
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Total Requests</p>
              <div className="text-2xl font-bold text-blue-600 animate-on-scroll">{stats.total}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">ranking requests</p>
            </div>
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 animate-on-scroll">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Pending Review</p>
              <div className="text-2xl font-bold text-yellow-600 animate-on-scroll">{stats.pending}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">awaiting decision</p>
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
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Approved</p>
              <div className="text-2xl font-bold text-green-600 animate-on-scroll">{stats.approved}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">rankings updated</p>
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
              <p className="text-sm font-medium text-gray-600 animate-on-scroll">Rejected</p>
              <div className="text-2xl font-bold text-red-600 animate-on-scroll">{stats.rejected}</div>
              <p className="text-xs text-gray-600 animate-on-scroll">requests denied</p>
            </div>
            <div className="p-2 rounded-full bg-red-100 text-red-600 animate-on-scroll">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">Search Requests</label>
              <div className="relative">
                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by player name or reason..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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

      {/* Rankings Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 animate-on-scroll">Ranking Requests</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 animate-on-scroll">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Player</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Current Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Requested Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Reason</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 animate-on-scroll">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="border-b border-gray-100 hover:bg-gray-50 animate-on-scroll">
                    <td className="py-3 px-4 font-medium animate-on-scroll">{issue.player_name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md animate-on-scroll">#{issue.current_rank}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md animate-on-scroll">#{issue.requested_rank}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate" title={issue.reason}>
                      <span className="animate-on-scroll">{issue.reason}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(issue.status)} animate-on-scroll`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(issue.status)}
                          <span className="capitalize animate-on-scroll">{issue.status}</span>
                        </div>
                      </span>
                    </td>
                    <td className="py-3 px-4 animate-on-scroll">{issue.submitted_at}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                          onClick={() => dispatch(setSelectedIssue(issue))}
                        >
                          <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        {issue.status === 'pending' && (
                          <>
                            <button
                              className="px-3 py-1 text-sm bg-white text-green-600 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                              onClick={() => handleRankingAction(issue.id, 'approve')}
                            >
                              <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Approve
                            </button>
                            <button
                              className="px-3 py-1 text-sm bg-white text-red-600 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                              onClick={() => handleRankingAction(issue.id, 'reject')}
                            >
                              <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredIssues.length === 0 && (
            <div className="text-center py-8 animate-on-scroll">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2 animate-on-scroll">No ranking requests found</h3>
              <p className="text-gray-600 animate-on-scroll">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 animate-on-scroll">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold animate-on-scroll">Ranking Request Details</h3>
              <button 
                className="p-1 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 animate-on-scroll"
                onClick={() => dispatch(clearSelectedIssue())}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Player</label>
                  <p className="font-medium animate-on-scroll">{selectedIssue.player_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Submitted</label>
                  <p className="animate-on-scroll">{selectedIssue.submitted_at}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Current Rank</label>
                  <span className="inline-block px-3 py-1 text-lg bg-gray-100 text-gray-800 border border-gray-300 rounded-md animate-on-scroll">#{selectedIssue.current_rank}</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 animate-on-scroll">Requested Rank</label>
                  <span className="inline-block px-3 py-1 text-lg bg-gray-100 text-gray-800 border border-gray-300 rounded-md animate-on-scroll">#{selectedIssue.requested_rank}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 animate-on-scroll">Reason for Change</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg animate-on-scroll">{selectedIssue.reason}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 animate-on-scroll">Status</label>
                <span className={`inline-block mt-1 px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedIssue.status)} animate-on-scroll`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(selectedIssue.status)}
                    <span className="capitalize animate-on-scroll">{selectedIssue.status}</span>
                  </div>
                </span>
              </div>
            </div>
            
            {selectedIssue.status === 'pending' && (
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button 
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                  onClick={() => dispatch(clearSelectedIssue())}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-white text-red-600 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                  onClick={() => handleRankingAction(selectedIssue.id, 'reject')}
                >
                  <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reject Request
                </button>
                <button
                  onClick={() => handleRankingAction(selectedIssue.id, 'approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                >
                  <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approve Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Rankings; 