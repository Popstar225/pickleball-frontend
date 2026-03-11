import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  Award, 
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Target,
  Download,
  ExternalLink
} from 'lucide-react';

const Certifications = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isAddingCertification, setIsAddingCertification] = useState(false);
  const [editingCertification, setEditingCertification] = useState<number | null>(null);

  // Mock certifications data
  const [certifications, setCertifications] = useState([
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
      hoursCompleted: 40,
      continuingEducationRequired: 20,
      continuingEducationCompleted: 15,
      certificateFile: 'usapa-level2-cert.pdf',
      requirements: [
        'Complete 40 hours of training',
        'Pass written examination',
        'Complete practical assessment',
        'Maintain continuing education hours'
      ]
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
      hoursCompleted: 30,
      continuingEducationRequired: 15,
      continuingEducationCompleted: 12,
      certificateFile: 'sports-psychology-cert.pdf',
      requirements: [
        'Complete 30 hours of coursework',
        'Pass final examination',
        'Submit case study',
        'Maintain annual continuing education'
      ]
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
      hoursCompleted: 8,
      continuingEducationRequired: 0,
      continuingEducationCompleted: 0,
      certificateFile: 'first-aid-cpr-cert.pdf',
      requirements: [
        'Complete 8 hours of training',
        'Demonstrate practical skills',
        'Pass written examination'
      ]
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
      hoursCompleted: 25,
      continuingEducationRequired: 10,
      continuingEducationCompleted: 8,
      certificateFile: 'advanced-techniques-cert.pdf',
      requirements: [
        'Complete 25 hours of advanced training',
        'Pass practical skills assessment',
        'Submit video analysis',
        'Complete continuing education requirements'
      ]
    }
  ]);

  const [newCertification, setNewCertification] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialNumber: '',
    category: 'Coaching',
    description: '',
    verificationUrl: '',
    hoursRequired: 0,
    hoursCompleted: 0,
    continuingEducationRequired: 0,
    certificateFile: '',
    requirements: ['']
  });

  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuingOrganization) {
      const certification = {
        id: certifications.length + 1,
        ...newCertification,
        status: 'Active',
        isVerified: false,
        continuingEducationCompleted: 0,
        requirements: newCertification.requirements.filter(req => req.trim() !== '')
      };
      setCertifications([...certifications, certification]);
      setNewCertification({
        name: '',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: '',
        credentialNumber: '',
        category: 'Coaching',
        description: '',
        verificationUrl: '',
        hoursRequired: 0,
        hoursCompleted: 0,
        continuingEducationRequired: 0,
        certificateFile: '',
        requirements: ['']
      });
      setIsAddingCertification(false);
    }
  };

  const handleUpdateCertification = (id: number, field: string, value: any) => {
    setCertifications(certifications.map(certification => 
      certification.id === id ? { ...certification, [field]: value } : certification
    ));
  };

  const handleDeleteCertification = (id: number) => {
    setCertifications(certifications.filter(certification => certification.id !== id));
  };

  const addRequirement = () => {
    setNewCertification(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    setNewCertification(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setNewCertification(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Expiring Soon': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Coaching': return 'bg-blue-100 text-blue-800';
      case 'Psychology': return 'bg-purple-100 text-purple-800';
      case 'Safety': return 'bg-red-100 text-red-800';
      case 'Skills': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationColor = (isVerified: boolean) => {
    return isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const certificationStats = {
    total: certifications.length,
    active: certifications.filter(c => c.status === 'Active').length,
    verified: certifications.filter(c => c.isVerified).length,
    expiringSoon: certifications.filter(c => c.status === 'Expiring Soon').length
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry < now;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center animate-on-scroll">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certifications</h1>
            <p className="text-gray-600">Manage your professional certifications and continuing education</p>
          </div>
          <button 
            onClick={() => setIsAddingCertification(true)} 
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Add Certification</span>
          </button>
        </div>

        {/* Certification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Certifications</h3>
              <Award className="h-4 w-4 text-blue-500" />
            </div>
            <div className="pt-2">
              <div className="text-2xl font-bold text-blue-600">{certificationStats.total}</div>
              <p className="text-xs text-gray-600">certifications</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Active</h3>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="pt-2">
              <div className="text-2xl font-bold text-green-600">{certificationStats.active}</div>
              <p className="text-xs text-gray-600">currently valid</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Verified</h3>
              <Star className="h-4 w-4 text-purple-500" />
            </div>
            <div className="pt-2">
              <div className="text-2xl font-bold text-purple-600">{certificationStats.verified}</div>
              <p className="text-xs text-gray-600">officially verified</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Expiring Soon</h3>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <div className="pt-2">
              <div className="text-2xl font-bold text-orange-600">{certificationStats.expiringSoon}</div>
              <p className="text-xs text-gray-600">within 30 days</p>
            </div>
          </div>
        </div>

        {/* Add New Certification Form */}
        {isAddingCertification && (
          <div className="bg-white rounded-lg shadow-md mb-8 animate-on-scroll">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Add New Certification</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="certName" className="block text-sm font-medium text-gray-700 mb-2">Certification Name</label>
                  <input
                    id="certName"
                    type="text"
                    value={newCertification.name}
                    onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                    placeholder="e.g., USAPA Level 2 Coach"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="issuingOrg" className="block text-sm font-medium text-gray-700 mb-2">Issuing Organization</label>
                  <input
                    id="issuingOrg"
                    type="text"
                    value={newCertification.issuingOrganization}
                    onChange={(e) => setNewCertification({...newCertification, issuingOrganization: e.target.value})}
                    placeholder="e.g., USA Pickleball Association"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                  <input
                    id="issueDate"
                    type="date"
                    value={newCertification.issueDate}
                    onChange={(e) => setNewCertification({...newCertification, issueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    id="expiryDate"
                    type="date"
                    value={newCertification.expiryDate}
                    onChange={(e) => setNewCertification({...newCertification, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="credentialNumber" className="block text-sm font-medium text-gray-700 mb-2">Credential Number</label>
                  <input
                    id="credentialNumber"
                    type="text"
                    value={newCertification.credentialNumber}
                    onChange={(e) => setNewCertification({...newCertification, credentialNumber: e.target.value})}
                    placeholder="e.g., USAPA-L2-2022-001234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select 
                    value={newCertification.category} 
                    onChange={(e) => setNewCertification({...newCertification, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Coaching">Coaching</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Safety">Safety</option>
                    <option value="Skills">Skills</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="hoursRequired" className="block text-sm font-medium text-gray-700 mb-2">Hours Required</label>
                  <input
                    id="hoursRequired"
                    type="number"
                    value={newCertification.hoursRequired}
                    onChange={(e) => setNewCertification({...newCertification, hoursRequired: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="hoursCompleted" className="block text-sm font-medium text-gray-700 mb-2">Hours Completed</label>
                  <input
                    id="hoursCompleted"
                    type="number"
                    value={newCertification.hoursCompleted}
                    onChange={(e) => setNewCertification({...newCertification, hoursCompleted: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="continuingEducation" className="block text-sm font-medium text-gray-700 mb-2">Continuing Education Required</label>
                  <input
                    id="continuingEducation"
                    type="number"
                    value={newCertification.continuingEducationRequired}
                    onChange={(e) => setNewCertification({...newCertification, continuingEducationRequired: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="verificationUrl" className="block text-sm font-medium text-gray-700 mb-2">Verification URL</label>
                  <input
                    id="verificationUrl"
                    type="url"
                    value={newCertification.verificationUrl}
                    onChange={(e) => setNewCertification({...newCertification, verificationUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    id="description"
                    value={newCertification.description}
                    onChange={(e) => setNewCertification({...newCertification, description: e.target.value})}
                    placeholder="Describe what this certification covers..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                  <div className="space-y-2">
                    {newCertification.requirements.map((req, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => updateRequirement(index, e.target.value)}
                          placeholder="e.g., Complete training hours, Pass examination"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {newCertification.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors duration-200"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors duration-200"
                    >
                      Add Requirement
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button 
                  onClick={handleAddCertification}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 hover:shadow-lg"
                >
                  Add Certification
                </button>
                <button 
                  onClick={() => setIsAddingCertification(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Certifications List */}
        <div className="space-y-6">
          {certifications.map((certification) => (
            <div key={certification.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Award className="h-5 w-5 text-blue-500" />
                      <span>{certification.name}</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {certification.issuingOrganization} • {certification.credentialNumber}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingCertification(editingCertification === certification.id ? null : certification.id)}
                      className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCertification(certification.id)}
                      className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(certification.status)}`}>
                      {certification.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(certification.category)}`}>
                      {certification.category}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Verification</label>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getVerificationColor(certification.isVerified)}`}>
                      {certification.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hours</label>
                    <p className="text-lg font-semibold text-blue-600">
                      {certification.hoursCompleted}/{certification.hoursRequired}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {certification.description && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-700 mt-1">{certification.description}</p>
                  </div>
                )}

                {/* Requirements */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-500">Requirements</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                    {certification.requirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dates and Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Issue Date</label>
                    <p className="font-medium">{certification.issueDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium ${isExpired(certification.expiryDate) ? 'text-red-600' : isExpiringSoon(certification.expiryDate) ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {certification.expiryDate}
                      </p>
                      {isExpired(certification.expiryDate) && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {isExpiringSoon(certification.expiryDate) && <Clock className="h-4 w-4 text-yellow-500" />}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Continuing Education</label>
                    <p className="font-medium">
                      {certification.continuingEducationCompleted}/{certification.continuingEducationRequired} hours
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  {certification.certificateFile && (
                    <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                      <Download className="h-4 w-4" />
                      <span>Download Certificate</span>
                    </button>
                  )}
                  {certification.verificationUrl && (
                    <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                      <ExternalLink className="h-4 w-4" />
                      <span>Verify Online</span>
                    </button>
                  )}
                </div>

                {/* Edit Mode */}
                {editingCertification === certification.id && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Edit Certification</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select 
                          value={certification.status} 
                          onChange={(e) => handleUpdateCertification(certification.id, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Active">Active</option>
                          <option value="Expired">Expired</option>
                          <option value="Expiring Soon">Expiring Soon</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hours Completed</label>
                        <input
                          type="number"
                          value={certification.hoursCompleted}
                          onChange={(e) => handleUpdateCertification(certification.id, 'hoursCompleted', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Continuing Education Completed</label>
                        <input
                          type="number"
                          value={certification.continuingEducationCompleted}
                          onChange={(e) => handleUpdateCertification(certification.id, 'continuingEducationCompleted', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

export default Certifications; 