import React from 'react';

interface MicrositeConfig {
  clubName: string;
  description: string;
  logo: string;
  bannerImage: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    website: string;
  };
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  features: {
    courts: number;
    training: boolean;
    tournaments: boolean;
    equipment: boolean;
    proShop: boolean;
  };
}

interface MicrositeProps {
  micrositeConfig: MicrositeConfig | null;
}

const Microsite: React.FC<MicrositeProps> = ({ micrositeConfig }) => {
  // Provide default values if micrositeConfig is null
  const config = micrositeConfig || {
    clubName: '',
    description: '',
    logo: '',
    bannerImage: '',
    contactInfo: {
      phone: '',
      email: '',
      address: '',
      website: ''
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    features: {
      courts: 0,
      training: false,
      tournaments: false,
      equipment: false,
      proShop: false
    }
  };

  const handleTournamentAction = (id: number, action: string) => {
    console.log(`${action} tournament ${id}`);
    // In real app, this would perform the action
  };

  return (
    <div className="animate-on-scroll bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="animate-on-scroll text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
          </svg>
          <span>Club Microsite Configuration</span>
        </h2>
      </div>
      <div className="px-6 py-4">
        {!micrositeConfig ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading microsite configuration...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="animate-on-scroll text-lg font-medium">Configure Your Club's Public Microsite</h3>
              <button 
                className="animate-on-scroll inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => handleTournamentAction(0, 'preview')}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Site
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="animate-on-scroll font-medium text-gray-900">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="clubName" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                    <input
                      id="clubName"
                      type="text"
                      value={config.clubName}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      id="description"
                      type="text"
                      value={config.description}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      id="website"
                      type="text"
                      value={config.contactInfo.website}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="animate-on-scroll font-medium text-gray-900">Contact Information</h4>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="phone" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      id="phone"
                      type="text"
                      value={config.contactInfo.phone}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={config.contactInfo.email}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="animate-on-scroll block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      id="address"
                      type="text"
                      value={config.contactInfo.address}
                      className="animate-on-scroll block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-4">
              <h4 className="animate-on-scroll font-medium text-gray-900">Media & Branding</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="animate-on-scroll block text-sm font-medium text-gray-700">Club Logo</label>
                  <div className="animate-on-scroll border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <svg className="h-8 w-8 mx-auto text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="animate-on-scroll text-sm text-gray-300">Upload your club logo</p>
                    <button className="animate-on-scroll inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-2">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Upload Logo
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="animate-on-scroll block text-sm font-medium text-gray-700">Banner Image</label>
                  <div className="animate-on-scroll border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <svg className="h-8 w-8 mx-auto text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="animate-on-scroll text-sm text-gray-300">Upload banner image</p>
                    <button className="animate-on-scroll inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-2">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Upload Banner
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features & Services */}
            <div className="space-y-4">
              <h4 className="animate-on-scroll font-medium text-gray-900">Features & Services</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="courts" checked={config.features.courts > 0} className="animate-on-scroll h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="courts" className="animate-on-scroll text-sm font-medium text-gray-700">Courts ({config.features.courts})</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="training" checked={config.features.training} className="animate-on-scroll h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="training" className="animate-on-scroll text-sm font-medium text-gray-700">Training Programs</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="tournaments" checked={config.features.tournaments} className="animate-on-scroll h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="tournaments" className="animate-on-scroll text-sm font-medium text-gray-700">Tournaments</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="equipment" checked={config.features.equipment} className="animate-on-scroll h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="equipment" className="animate-on-scroll text-sm font-medium text-gray-700">Equipment Rental</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button className="animate-on-scroll inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Cancel
              </button>
              <button className="animate-on-scroll inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Microsite; 