import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Credentials = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isAddingCredential, setIsAddingCredential] = useState(false);
  const [editingCredential, setEditingCredential] = useState<number | null>(null);

  // Mock credentials data
  const [credentials, setCredentials] = useState([
    {
      id: 1,
      name: 'USAPA Level 2 Coach Certification',
      issuingOrganization: 'USA Pickleball Association',
      issueDate: '2022-06-15',
      expiryDate: '2025-06-15',
      credentialNumber: 'USAPA-L2-2022-001234',
      status: 'Active',
      category: 'Coaching',
      description: 'Advanced coaching certification for tournament-level players',
      verificationUrl: 'https://usapa.org/verify/001234',
      isVerified: true,
      hoursRequired: 40,
      hoursCompleted: 40
    },
    {
      id: 2,
      name: 'Sports Psychology Certification',
      issuingOrganization: 'American Sports Psychology Institute',
      issueDate: '2021-09-20',
      expiryDate: '2024-09-20',
      credentialNumber: 'ASPI-SP-2021-567890',
      status: 'Active',
      category: 'Psychology',
      description: 'Specialized training in mental preparation and performance psychology',
      verificationUrl: 'https://aspi.org/verify/567890',
      isVerified: true,
      hoursRequired: 30,
      hoursCompleted: 30
    },
    {
      id: 3,
      name: 'First Aid & CPR Certification',
      issuingOrganization: 'American Red Cross',
      issueDate: '2023-03-10',
      expiryDate: '2025-03-10',
      credentialNumber: 'ARC-FA-2023-112233',
      status: 'Active',
      category: 'Safety',
      description: 'Emergency response and life-saving techniques certification',
      verificationUrl: 'https://redcross.org/verify/112233',
      isVerified: true,
      hoursRequired: 8,
      hoursCompleted: 8
    },
    {
      id: 4,
      name: 'Advanced Pickleball Techniques',
      issuingOrganization: 'Pickleball Pro Academy',
      issueDate: '2022-11-05',
      expiryDate: '2024-11-05',
      credentialNumber: 'PPA-APT-2022-445566',
      status: 'Expiring Soon',
      category: 'Skills',
      description: 'Advanced stroke mechanics and strategic play techniques',
      verificationUrl: 'https://ppa.org/verify/445566',
      isVerified: false,
      hoursRequired: 25,
      hoursCompleted: 25
    }
  ]);

  const [newCredential, setNewCredential] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialNumber: '',
    status: 'Active',
    category: 'Coaching',
    description: '',
    verificationUrl: '',
    isVerified: false,
    hoursRequired: 0,
    hoursCompleted: 0
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setNewCredential(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddCredential = () => {
    if (newCredential.name && newCredential.issuingOrganization) {
      const credential = {
        ...newCredential,
        id: Date.now(),
        isVerified: false
      };
      setCredentials(prev => [...prev, credential]);
      setNewCredential({
        name: '',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: '',
        credentialNumber: '',
        status: 'Active',
        category: 'Coaching',
        description: '',
        verificationUrl: '',
        isVerified: false,
        hoursRequired: 0,
        hoursCompleted: 0
      });
      setIsAddingCredential(false);
    }
  };

  const handleEditCredential = (id: number) => {
    const credential = credentials.find(c => c.id === id);
    if (credential) {
      setNewCredential(credential);
      setEditingCredential(id);
      setIsAddingCredential(true);
    }
  };

  const handleUpdateCredential = () => {
    if (editingCredential) {
      setCredentials(prev => prev.map(c => 
        c.id === editingCredential ? { ...newCredential, id: editingCredential } : c
      ));
      setEditingCredential(null);
      setIsAddingCredential(false);
      setNewCredential({
        name: '',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: '',
        credentialNumber: '',
        status: 'Active',
        category: 'Coaching',
        description: '',
        verificationUrl: '',
        isVerified: false,
        hoursRequired: 0,
        hoursCompleted: 0
      });
    }
  };

  const handleDeleteCredential = (id: number) => {
    setCredentials(prev => prev.filter(c => c.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expiring Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Coaching':
        return (
          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'Psychology':
        return (
          <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'Safety':
        return (
          <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'Skills':
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="animate-on-scroll text-3xl font-bold text-gray-900 mb-2">Credentials & Certifications</h1>
            <p className="animate-on-scroll text-gray-600">Manage your professional credentials and certifications</p>
          </div>
          <button
            onClick={() => setIsAddingCredential(true)}
            className="animate-on-scroll inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Credential
          </button>
        </div>

        {/* Add/Edit Credential Form */}
        {isAddingCredential && (
          <div className="animate-on-scroll mb-8 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="animate-on-scroll text-lg font-semibold text-gray-900">
                {editingCredential ? 'Edit Credential' : 'Add New Credential'}
              </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Credential Name</label>
                  <input
                    type="text"
                    value={newCredential.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., USAPA Level 2 Coach Certification"
                  />
                </div>
                <div>
                  <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                  <input
                    type="text"
                    value={newCredential.issuingOrganization}
                    onChange={(e) => handleInputChange('issuingOrganization', e.target.value)}
                    className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., USA Pickleball Association"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={newCredential.issueDate}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                    className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newCredential.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Credential Number</label>
                  <input
                    type="text"
                    value={newCredential.credentialNumber}
                    onChange={(e) => handleInputChange('credentialNumber', e.target.value)}
                    className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., USAPA-L2-2022-001234"
                  />
                </div>
                <div>
                  <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newCredential.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="Coaching">Coaching</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Safety">Safety</option>
                    <option value="Skills">Skills</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newCredential.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe the credential and its requirements..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Hours Required</label>
                  <input
                    type="number"
                    value={newCredential.hoursRequired}
                    onChange={(e) => handleInputChange('hoursRequired', parseInt(e.target.value))}
                    className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Hours Completed</label>
                  <input
                    type="number"
                    value={newCredential.hoursCompleted}
                    onChange={(e) => handleInputChange('hoursCompleted', parseInt(e.target.value))}
                    className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsAddingCredential(false);
                    setEditingCredential(null);
                    setNewCredential({
                      name: '',
                      issuingOrganization: '',
                      issueDate: '',
                      expiryDate: '',
                      credentialNumber: '',
                      status: 'Active',
                      category: 'Coaching',
                      description: '',
                      verificationUrl: '',
                      isVerified: false,
                      hoursRequired: 0,
                      hoursCompleted: 0
                    });
                  }}
                  className="animate-on-scroll inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={editingCredential ? handleUpdateCredential : handleAddCredential}
                  className="animate-on-scroll inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingCredential ? 'Update' : 'Add'} Credential
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credentials List */}
        <div className="space-y-6">
          {credentials.map((credential) => (
            <div key={credential.id} className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getCategoryIcon(credential.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="animate-on-scroll text-lg font-semibold text-gray-900 mb-1">{credential.name}</h3>
                      <p className="animate-on-scroll text-sm text-gray-600 mb-2">{credential.issuingOrganization}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="animate-on-scroll flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Issued: {credential.issueDate}
                        </span>
                        <span className="animate-on-scroll flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Expires: {credential.expiryDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`animate-on-scroll inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(credential.status)}`}>
                      {credential.status}
                    </span>
                    {credential.isVerified && (
                      <span className="animate-on-scroll inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="animate-on-scroll font-medium text-gray-900 mb-3">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="animate-on-scroll flex justify-between">
                        <span className="text-gray-500">Credential #:</span>
                        <span className="font-medium">{credential.credentialNumber}</span>
                      </div>
                      <div className="animate-on-scroll flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{credential.category}</span>
                      </div>
                      <div className="animate-on-scroll flex justify-between">
                        <span className="text-gray-500">Hours Required:</span>
                        <span className="font-medium">{credential.hoursRequired}</span>
                      </div>
                      <div className="animate-on-scroll flex justify-between">
                        <span className="text-gray-500">Hours Completed:</span>
                        <span className="font-medium">{credential.hoursCompleted}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="animate-on-scroll font-medium text-gray-900 mb-3">Description</h4>
                    <p className="animate-on-scroll text-sm text-gray-600 mb-3">{credential.description}</p>
                    {credential.verificationUrl && (
                      <a
                        href={credential.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="animate-on-scroll inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Verify Credential
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditCredential(credential.id)}
                    className="animate-on-scroll inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCredential(credential.id)}
                    className="animate-on-scroll inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Credentials; 