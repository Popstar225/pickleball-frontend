import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const SystemManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  // Mock system configuration data
  const [systemConfig, setSystemConfig] = useState({
    general: {
      systemName: 'Pickleball Platform',
      version: '2.1.0',
      environment: 'production',
      maintenanceMode: false,
      debugMode: false,
      timezone: 'UTC',
      language: 'English'
    },
    database: {
      host: 'db.pickleball.com',
      port: 5432,
      name: 'pickleball_prod',
      maxConnections: 100,
      connectionTimeout: 30000,
      queryTimeout: 60000,
      backupEnabled: true,
      backupFrequency: 'daily',
      lastBackup: '2024-03-25 02:00 AM'
    },
    security: {
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireTwoFactor: false,
      sslEnabled: true,
      rateLimitEnabled: true,
      rateLimitRequests: 1000,
      rateLimitWindow: 3600
    },
    email: {
      smtpHost: 'smtp.pickleball.com',
      smtpPort: 587,
      smtpUser: 'noreply@pickleball.com',
      smtpPassword: '••••••••',
      encryption: 'TLS',
      maxRetries: 3,
      retryDelay: 5000
    },
    storage: {
      maxFileSize: 10485760,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      storageProvider: 'AWS S3',
      bucketName: 'pickleball-assets',
      cdnEnabled: true,
      cdnUrl: 'https://cdn.pickleball.com'
    }
  });

  const [editedConfig, setEditedConfig] = useState(systemConfig);

  // Mock system health data
  const systemHealth = {
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '120ms',
    cpuUsage: '45%',
    memoryUsage: '62%',
    diskUsage: '78%',
    networkLatency: '15ms',
    activeUsers: 1247,
    totalRequests: 45678
  };

  const handleSave = () => {
    setSystemConfig(editedConfig);
    setIsEditing(false);
    // In a real app, this would save to the backend
  };

  const handleCancel = () => {
    setEditedConfig(systemConfig);
    setIsEditing(false);
  };

  const handleReset = () => {
    setEditedConfig(systemConfig);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (usage: string) => {
    const percentage = parseInt(usage.replace('%', ''));
    if (percentage < 50) return 'bg-green-100 text-green-800';
    if (percentage < 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 animate-on-scroll">System Management</h1>
          <p className="text-gray-600 mb-6 animate-on-scroll">
            Monitor and configure system settings, performance, and health
          </p>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Settings
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors animate-on-scroll"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 animate-on-scroll">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 animate-on-scroll">Status</p>
                  <p className="text-2xl font-bold text-gray-900 animate-on-scroll">{systemHealth.status}</p>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(systemHealth.status)} animate-on-scroll`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 animate-on-scroll">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900 animate-on-scroll">{systemHealth.uptime}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100 text-blue-600 animate-on-scroll">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 animate-on-scroll">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900 animate-on-scroll">{systemHealth.responseTime}</p>
                </div>
                <div className="p-2 rounded-full bg-green-100 text-green-600 animate-on-scroll">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 animate-on-scroll">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 animate-on-scroll">{systemHealth.activeUsers}</p>
                </div>
                <div className="p-2 rounded-full bg-purple-100 text-purple-600 animate-on-scroll">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 animate-on-scroll">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 animate-on-scroll">CPU Usage</h3>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 animate-on-scroll">Current</span>
                  <span className={`font-medium ${getUsageColor(systemHealth.cpuUsage)} animate-on-scroll`}>
                    {systemHealth.cpuUsage}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 animate-on-scroll">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      parseInt(systemHealth.cpuUsage.replace('%', '')) < 50 ? 'bg-green-500' :
                      parseInt(systemHealth.cpuUsage.replace('%', '')) < 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: systemHealth.cpuUsage }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 animate-on-scroll">Memory Usage</h3>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 animate-on-scroll">Current</span>
                  <span className={`font-medium ${getUsageColor(systemHealth.memoryUsage)} animate-on-scroll`}>
                    {systemHealth.memoryUsage}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 animate-on-scroll">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      parseInt(systemHealth.memoryUsage.replace('%', '')) < 50 ? 'bg-green-500' :
                      parseInt(systemHealth.memoryUsage.replace('%', '')) < 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: systemHealth.memoryUsage }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-on-scroll">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 animate-on-scroll">Disk Usage</h3>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 animate-on-scroll">Current</span>
                  <span className={`font-medium ${getUsageColor(systemHealth.diskUsage)} animate-on-scroll`}>
                    {systemHealth.diskUsage}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 animate-on-scroll">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      parseInt(systemHealth.diskUsage.replace('%', '')) < 50 ? 'bg-green-500' :
                      parseInt(systemHealth.diskUsage.replace('%', '')) < 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: systemHealth.diskUsage }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Sections */}
        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 animate-on-scroll">General Settings</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    System Name
                  </label>
                  <input
                    type="text"
                    value={editedConfig.general.systemName}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      general: { ...prev.general, systemName: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    Version
                  </label>
                  <input
                    type="text"
                    value={editedConfig.general.version}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      general: { ...prev.general, version: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    Environment
                  </label>
                  <select
                    value={editedConfig.general.environment}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      general: { ...prev.general, environment: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    Timezone
                  </label>
                  <select
                    value={editedConfig.general.timezone}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      general: { ...prev.general, timezone: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-6 mt-6">
                <label className="flex items-center animate-on-scroll">
                  <input
                    type="checkbox"
                    checked={editedConfig.general.maintenanceMode}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      general: { ...prev.general, maintenanceMode: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 animate-on-scroll">Maintenance Mode</span>
                </label>
                <label className="flex items-center animate-on-scroll">
                  <input
                    type="checkbox"
                    checked={editedConfig.general.debugMode}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      general: { ...prev.general, debugMode: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 animate-on-scroll">Debug Mode</span>
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 animate-on-scroll">Security Settings</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    Session Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={editedConfig.security.sessionTimeout}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={editedConfig.security.maxLoginAttempts}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    Password Min Length
                  </label>
                  <input
                    type="number"
                    value={editedConfig.security.passwordMinLength}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    Rate Limit Requests
                  </label>
                  <input
                    type="number"
                    value={editedConfig.security.rateLimitRequests}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, rateLimitRequests: parseInt(e.target.value) }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 mt-6">
                <label className="flex items-center animate-on-scroll">
                  <input
                    type="checkbox"
                    checked={editedConfig.security.requireTwoFactor}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, requireTwoFactor: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 animate-on-scroll">Require Two-Factor</span>
                </label>
                <label className="flex items-center animate-on-scroll">
                  <input
                    type="checkbox"
                    checked={editedConfig.security.sslEnabled}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, sslEnabled: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 animate-on-scroll">SSL Enabled</span>
                </label>
                <label className="flex items-center animate-on-scroll">
                  <input
                    type="checkbox"
                    checked={editedConfig.security.rateLimitEnabled}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, rateLimitEnabled: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 animate-on-scroll">Rate Limiting</span>
                </label>
              </div>
            </div>
          </div>

          {/* Database Settings */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-on-scroll">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 animate-on-scroll">Database Settings</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    Host
                  </label>
                  <input
                    type="text"
                    value={editedConfig.database.host}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      database: { ...prev.database, host: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    Port
                  </label>
                  <input
                    type="number"
                    value={editedConfig.database.port}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      database: { ...prev.database, port: parseInt(e.target.value) }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    Database Name
                  </label>
                  <input
                    type="text"
                    value={editedConfig.database.name}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      database: { ...prev.database, name: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    Max Connections
                  </label>
                  <input
                    type="number"
                    value={editedConfig.database.maxConnections}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      database: { ...prev.database, maxConnections: parseInt(e.target.value) }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 mt-6">
                <label className="flex items-center animate-on-scroll">
                  <input
                    type="checkbox"
                    checked={editedConfig.database.backupEnabled}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      database: { ...prev.database, backupEnabled: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 animate-on-scroll">Backup Enabled</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 animate-on-scroll">
                    Backup Frequency
                  </label>
                  <select
                    value={editedConfig.database.backupFrequency}
                    onChange={(e) => setEditedConfig(prev => ({
                      ...prev,
                      database: { ...prev.database, backupFrequency: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 animate-on-scroll"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-md animate-on-scroll">
                <p className="text-sm text-gray-600 animate-on-scroll">
                  <span className="font-medium">Last Backup:</span> {editedConfig.database.lastBackup}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemManagement; 