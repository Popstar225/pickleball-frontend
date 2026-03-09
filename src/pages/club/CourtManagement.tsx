import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const CourtManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isAddingCourt, setIsAddingCourt] = useState(false);
  const [editingCourt, setEditingCourt] = useState<number | null>(null);

  // Mock court data
  const [courts, setCourts] = useState([
    {
      id: 1,
      name: 'Court 1',
      type: 'Indoor',
      surface: 'Professional',
      lighting: 'LED',
      status: 'Available',
      maintenance: 'None',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15',
      hourlyRate: 25,
      maxCapacity: 4
    },
    {
      id: 2,
      name: 'Court 2',
      type: 'Indoor',
      surface: 'Professional',
      lighting: 'LED',
      status: 'Occupied',
      maintenance: 'None',
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-04-20',
      hourlyRate: 25,
      maxCapacity: 4
    },
    {
      id: 3,
      name: 'Court 3',
      type: 'Outdoor',
      surface: 'Concrete',
      lighting: 'Natural',
      status: 'Maintenance',
      maintenance: 'Surface Repair',
      lastMaintenance: '2024-03-01',
      nextMaintenance: '2024-03-25',
      hourlyRate: 20,
      maxCapacity: 4
    },
    {
      id: 4,
      name: 'Court 4',
      type: 'Outdoor',
      surface: 'Concrete',
      lighting: 'Natural',
      status: 'Available',
      maintenance: 'None',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
      hourlyRate: 20,
      maxCapacity: 4
    }
  ]);

  const [newCourt, setNewCourt] = useState({
    name: '',
    type: 'Indoor',
    surface: 'Professional',
    lighting: 'LED',
    hourlyRate: 25,
    maxCapacity: 4
  });

  const handleAddCourt = () => {
    if (newCourt.name) {
      const court = {
        id: courts.length + 1,
        ...newCourt,
        status: 'Available',
        maintenance: 'None',
        lastMaintenance: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      setCourts([...courts, court]);
      setNewCourt({
        name: '',
        type: 'Indoor',
        surface: 'Professional',
        lighting: 'LED',
        hourlyRate: 25,
        maxCapacity: 4
      });
      setIsAddingCourt(false);
    }
  };

  const handleUpdateCourt = (id: number, field: string, value: string | number) => {
    setCourts(courts.map(court => 
      court.id === id ? { ...court, [field]: value } : court
    ));
  };

  const handleDeleteCourt = (id: number) => {
    setCourts(courts.filter(court => court.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Occupied': return 'bg-yellow-100 text-yellow-800';
      case 'Maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceColor = (maintenance: string) => {
    switch (maintenance) {
      case 'None': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Surface Repair': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="animate-on-scroll text-3xl font-bold text-gray-900 mb-2">Court Management</h1>
            <p className="animate-on-scroll text-gray-600">Manage your club's courts, schedules, and maintenance</p>
          </div>
          <button 
            onClick={() => setIsAddingCourt(true)} 
            className="animate-on-scroll flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Court</span>
          </button>
        </div>

        {/* Court Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="animate-on-scroll text-sm font-medium text-gray-900">Total Courts</h3>
              <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="px-6 pb-4">
              <div className="animate-on-scroll text-2xl font-bold text-blue-600">{courts.length}</div>
              <p className="animate-on-scroll text-xs text-gray-600">courts available</p>
            </div>
          </div>

          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="animate-on-scroll text-sm font-medium text-gray-900">Available</h3>
              <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="px-6 pb-4">
              <div className="animate-on-scroll text-2xl font-bold text-green-600">
                {courts.filter(c => c.status === 'Available').length}
              </div>
              <p className="animate-on-scroll text-xs text-gray-600">ready for use</p>
            </div>
          </div>

          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="animate-on-scroll text-sm font-medium text-gray-900">Under Maintenance</h3>
              <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="px-6 pb-4">
              <div className="animate-on-scroll text-2xl font-bold text-red-600">
                {courts.filter(c => c.status === 'Maintenance').length}
              </div>
              <p className="animate-on-scroll text-xs text-gray-600">currently unavailable</p>
            </div>
          </div>

          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="animate-on-scroll text-sm font-medium text-gray-900">Monthly Revenue</h3>
              <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="px-6 pb-4">
              <div className="animate-on-scroll text-2xl font-bold text-purple-600">
                ${courts.reduce((sum, court) => sum + (court.hourlyRate * 8 * 30), 0).toLocaleString()}
              </div>
              <p className="animate-on-scroll text-xs text-gray-600">estimated monthly</p>
            </div>
          </div>
        </div>

        {/* Add New Court Form */}
        {isAddingCourt && (
          <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="animate-on-scroll text-lg font-semibold text-gray-900">Add New Court</h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="courtName" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Court Name</label>
                  <input
                    id="courtName"
                    type="text"
                    value={newCourt.name}
                    onChange={(e) => setNewCourt({...newCourt, name: e.target.value})}
                    placeholder="e.g., Court 5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="courtType" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select 
                    value={newCourt.type} 
                    onChange={(e) => setNewCourt({...newCourt, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="courtSurface" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Surface</label>
                  <select 
                    value={newCourt.surface} 
                    onChange={(e) => setNewCourt({...newCourt, surface: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Concrete">Concrete</option>
                    <option value="Asphalt">Asphalt</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="courtLighting" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Lighting</label>
                  <select 
                    value={newCourt.lighting} 
                    onChange={(e) => setNewCourt({...newCourt, lighting: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="LED">LED</option>
                    <option value="Natural">Natural</option>
                    <option value="Fluorescent">Fluorescent</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="hourlyRate" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
                  <input
                    id="hourlyRate"
                    type="number"
                    value={newCourt.hourlyRate}
                    onChange={(e) => setNewCourt({...newCourt, hourlyRate: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="maxCapacity" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Max Capacity</label>
                  <input
                    id="maxCapacity"
                    type="number"
                    value={newCourt.maxCapacity}
                    onChange={(e) => setNewCourt({...newCourt, maxCapacity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button 
                  onClick={handleAddCourt}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Court
                </button>
                <button 
                  onClick={() => setIsAddingCourt(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Courts List */}
        <div className="space-y-6">
          {courts.map((court) => (
            <div key={court.id} className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{court.name}</span>
                    </h3>
                    <p className="animate-on-scroll text-sm text-gray-600 mt-1">
                      {court.type} • {court.surface} • {court.lighting}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="animate-on-scroll px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                      onClick={() => setEditingCourt(editingCourt === court.id ? null : court.id)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      className="animate-on-scroll px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                      onClick={() => handleDeleteCourt(court.id)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="animate-on-scroll block text-sm font-medium text-gray-500 mb-1">Status</label>
                    <span className={`animate-on-scroll inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(court.status)}`}>
                      {court.status}
                    </span>
                  </div>
                  <div>
                    <label className="animate-on-scroll block text-sm font-medium text-gray-500 mb-1">Maintenance</label>
                    <span className={`animate-on-scroll inline-block px-2 py-1 rounded-full text-xs font-medium ${getMaintenanceColor(court.maintenance)}`}>
                      {court.maintenance}
                    </span>
                  </div>
                  <div>
                    <label className="animate-on-scroll block text-sm font-medium text-gray-500 mb-1">Hourly Rate</label>
                    <p className="animate-on-scroll text-lg font-semibold text-green-600">${court.hourlyRate}</p>
                  </div>
                  <div>
                    <label className="animate-on-scroll block text-sm font-medium text-gray-500 mb-1">Max Capacity</label>
                    <p className="animate-on-scroll text-lg font-semibold text-blue-600">{court.maxCapacity}</p>
                  </div>
                </div>

                {/* Maintenance Schedule */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="animate-on-scroll font-medium text-gray-900 mb-2">Maintenance Schedule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="animate-on-scroll text-gray-500">Last Maintenance:</span>
                      <p className="animate-on-scroll font-medium">{court.lastMaintenance}</p>
                    </div>
                    <div>
                      <span className="animate-on-scroll text-gray-500">Next Maintenance:</span>
                      <p className="animate-on-scroll font-medium">{court.nextMaintenance}</p>
                    </div>
                  </div>
                </div>

                {/* Edit Mode */}
                {editingCourt === court.id && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="animate-on-scroll font-medium text-gray-900 mb-3">Edit Court</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select 
                          value={court.status} 
                          onChange={(e) => handleUpdateCourt(court.id, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                      <div>
                        <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Maintenance</label>
                        <select 
                          value={court.maintenance} 
                          onChange={(e) => handleUpdateCourt(court.id, 'maintenance', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="None">None</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Surface Repair">Surface Repair</option>
                        </select>
                      </div>
                      <div>
                        <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
                        <input
                          type="number"
                          value={court.hourlyRate}
                          onChange={(e) => handleUpdateCourt(court.id, 'hourlyRate', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourtManagement; 