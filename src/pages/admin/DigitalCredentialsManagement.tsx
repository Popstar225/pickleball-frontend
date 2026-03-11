/**
 * Digital Credentials Management - Admin Component
 * 
 * This component provides comprehensive management of digital credentials
 * including viewing, filtering, updating, and deleting credentials.
 * 
 * @author Pickleball Federation Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchAllDigitalCredentials,
  fetchCredentialStats,
  deleteDigitalCredential,
  clearAllCredentials,
  clearStats,
  setSelectedCredential
} from '../../store/slices/digitalCredentialsSlice';
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Edit, 
  Download, 
  BarChart3,
  RefreshCw,
  Plus,
  Users,
  Shield,
  Calendar,
  MapPin,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import { getImageUrl } from '../../lib/utils';
import { 
  formatDate, 
  DATE_FORMAT_CONSTANTS,
  AFFILIATION_STATUSES,
  AFFILIATION_STATUS_LABELS,
  VERIFICATION_STATUSES,
  VERIFICATION_STATUS_LABELS,
  USER_TYPE_LABELS,
  PAGINATION,
  debounce,
  generateId
} from '../../lib';
import LoadingSpinner from '../../components/LoadingSpinner';

const DigitalCredentialsManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    affiliation_status: '',
    state_affiliation: '',
    is_verified: ''
  });
  const [currentPage, setCurrentPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState<number>(PAGINATION.DEFAULT_LIMIT);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Redux state
  const {
    allCredentials,
    pagination,
    stats,
    loading,
    deleting,
    fetchingStats,
    error
  } = useSelector((state: RootState) => state.digitalCredentials);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAllDigitalCredentials({ 
      page: PAGINATION.DEFAULT_PAGE, 
      limit: pageSize 
    }));
    dispatch(fetchCredentialStats());
    
    return () => {
      dispatch(clearAllCredentials());
      dispatch(clearStats());
    };
  }, [dispatch, pageSize]);

  // Debounced search handler
  const debouncedSearch = debounce(() => {
    setCurrentPage(PAGINATION.DEFAULT_PAGE);
    const apiFilters = {
      page: PAGINATION.DEFAULT_PAGE,
      limit: pageSize,
      search: searchTerm,
      affiliation_status: filters.affiliation_status || undefined,
      state_affiliation: filters.state_affiliation || undefined,
      is_verified: filters.is_verified ? filters.is_verified === 'true' : undefined,
      sort_field: sortField,
      sort_direction: sortDirection
    };
    dispatch(fetchAllDigitalCredentials(apiFilters));
  }, 500);

  // Handle search and filters
  const handleSearch = () => {
    debouncedSearch();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(PAGINATION.DEFAULT_PAGE);
    const apiFilters = {
      page: PAGINATION.DEFAULT_PAGE,
      limit: pageSize,
      search: searchTerm,
      affiliation_status: filters.affiliation_status || undefined,
      state_affiliation: filters.state_affiliation || undefined,
      is_verified: filters.is_verified ? filters.is_verified === 'true' : undefined,
      sort_field: sortField,
      sort_direction: sortDirection
    };
    dispatch(fetchAllDigitalCredentials(apiFilters));
  };

  // Handle sorting
  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    const apiFilters = {
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      affiliation_status: filters.affiliation_status || undefined,
      state_affiliation: filters.state_affiliation || undefined,
      is_verified: filters.is_verified ? filters.is_verified === 'true' : undefined,
      sort_field: field,
      sort_direction: newDirection
    };
    dispatch(fetchAllDigitalCredentials(apiFilters));
  };

  const clearFilters = () => {
    setFilters({
      affiliation_status: '',
      state_affiliation: '',
      is_verified: ''
    });
    setSearchTerm('');
    setCurrentPage(PAGINATION.DEFAULT_PAGE);
    setSortField('created_at');
    setSortDirection('desc');
    dispatch(fetchAllDigitalCredentials({ 
      page: PAGINATION.DEFAULT_PAGE, 
      limit: pageSize 
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const apiFilters = {
      page,
      limit: pageSize,
      search: searchTerm,
      affiliation_status: filters.affiliation_status || undefined,
      state_affiliation: filters.state_affiliation || undefined,
      is_verified: filters.is_verified ? filters.is_verified === 'true' : undefined,
      sort_field: sortField,
      sort_direction: sortDirection
    };
    dispatch(fetchAllDigitalCredentials(apiFilters));
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(PAGINATION.DEFAULT_PAGE);
    const apiFilters = {
      page: PAGINATION.DEFAULT_PAGE,
      limit: newPageSize,
      search: searchTerm,
      affiliation_status: filters.affiliation_status || undefined,
      state_affiliation: filters.state_affiliation || undefined,
      is_verified: filters.is_verified ? filters.is_verified === 'true' : undefined,
      sort_field: sortField,
      sort_direction: sortDirection
    };
    dispatch(fetchAllDigitalCredentials(apiFilters));
  };

  // Handle credential selection
  const handleCredentialSelect = (credentialId: string) => {
    setSelectedCredentialId(credentialId);
    const credential = allCredentials.find(c => c.id === credentialId);
    if (credential) {
      dispatch(setSelectedCredential(credential));
    }
  };

  // Handle credential deletion
  const handleDeleteCredential = (credentialId: string) => {
    setCredentialToDelete(credentialId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!credentialToDelete) return;
    
    try {
      await dispatch(deleteDigitalCredential(credentialToDelete)).unwrap();
      toast.success('Credential deleted successfully');
      setShowDeleteModal(false);
      setCredentialToDelete(null);
      
      // Refresh the list
      const apiFilters = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        affiliation_status: filters.affiliation_status || undefined,
        state_affiliation: filters.state_affiliation || undefined,
        is_verified: filters.is_verified ? filters.is_verified === 'true' : undefined,
        sort_field: sortField,
        sort_direction: sortDirection
      };
      dispatch(fetchAllDigitalCredentials(apiFilters));
    } catch (error: any) {
      toast.error(error || 'Failed to delete credential');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    const apiFilters = {
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      affiliation_status: filters.affiliation_status || undefined,
      state_affiliation: filters.state_affiliation || undefined,
      is_verified: filters.is_verified ? filters.is_verified === 'true' : undefined,
      sort_field: sortField,
      sort_direction: sortDirection
    };
    dispatch(fetchAllDigitalCredentials(apiFilters));
    dispatch(fetchCredentialStats());
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case AFFILIATION_STATUSES.ACTIVE: return 'bg-green-100 text-green-800 border-green-200';
      case AFFILIATION_STATUSES.INACTIVE: return 'bg-gray-100 text-gray-800 border-gray-200';
      case AFFILIATION_STATUSES.SUSPENDED: return 'bg-red-100 text-red-800 border-red-200';
      case AFFILIATION_STATUSES.EXPIRED: return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get club status color
  const getClubStatusColor = (status: string) => {
    switch (status) {
      case 'club_member': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'independent': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && !allCredentials.length) {
    return (
      <LoadingSpinner 
        text="Loading credentials..." 
        size="xl"
        fullScreen={false}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Digital Credentials Management</h1>
            <p className="text-gray-600">Manage and monitor all digital credentials in the system</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading || fetchingStats}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading || fetchingStats ? 'animate-spin' : ''}`} />
              {loading || fetchingStats ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Credentials</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Credentials</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.breakdown?.find(b => b.is_verified)?.count || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.breakdown?.find(b => b.affiliation_status === 'active')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search credentials..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Trigger debounced search on input change
                  if (e.target.value.length >= 3 || e.target.value.length === 0) {
                    debouncedSearch();
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation Status</label>
              <select
                value={filters.affiliation_status}
                onChange={(e) => handleFilterChange('affiliation_status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.entries(AFFILIATION_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={filters.state_affiliation}
                onChange={(e) => handleFilterChange('state_affiliation', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All States</option>
                <option value="Jalisco">Jalisco</option>
                <option value="Nuevo Leon">Nuevo Leon</option>
                <option value="CDMX">CDMX</option>
                <option value="Baja California">Baja California</option>
              </select>
            </div>
            
                          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
                <select
                  value={filters.is_verified}
                  onChange={(e) => handleFilterChange('is_verified', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">{VERIFICATION_STATUS_LABELS[VERIFICATION_STATUSES.VERIFIED]}</option>
                  <option value="false">{VERIFICATION_STATUS_LABELS[VERIFICATION_STATUSES.UNVERIFIED]}</option>
                </select>
              </div>
          </div>
        )}
      </div>

      {/* Credentials Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Digital Credentials</h3>
        </div>
        
        <div className="overflow-x-auto relative">
          {loading && allCredentials.length > 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <LoadingSpinner text="Refreshing..." size="md" />
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('credential_number')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Credential</span>
                    {sortField === 'credential_number' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('player_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Player</span>
                    {sortField === 'player_name' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('affiliation_status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {sortField === 'affiliation_status' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('state_affiliation')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Location</span>
                    {sortField === 'state_affiliation' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('issued_date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Issued</span>
                    {sortField === 'issued_date' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allCredentials.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Users className="h-12 w-12 text-gray-400" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">No credentials found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                allCredentials.map((credential) => (
                <tr 
                  key={credential.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedCredentialId === credential.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleCredentialSelect(credential.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {credential.credential_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {credential.verification_code}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {credential.player_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {credential.nrtp_level || 'Not Rated'}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(credential.affiliation_status)}`}>
                        {AFFILIATION_STATUS_LABELS[credential.affiliation_status] || credential.affiliation_status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getClubStatusColor(credential.club_status)}`}>
                        {credential.club_status === 'club_member' ? 'Club Member' : 'Independent'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {credential.state_affiliation || 'Not Specified'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(credential.issued_date, DATE_FORMAT_CONSTANTS.SHORT)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // View credential details
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit credential
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCredential(credential.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Show:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {PAGINATION.PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
              </div>
              
              {pagination.pages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Credential</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this digital credential? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalCredentialsManagement; 