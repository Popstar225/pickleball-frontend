import React from 'react';
import { 
  Award, 
  Plus, 
  QrCode 
} from 'lucide-react';

interface Credential {
  id: number;
  name: string;
  issuingOrg: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  verificationUrl: string;
}

interface CredentialsProps {
  credentials: Credential[];
}

const Credentials: React.FC<CredentialsProps> = ({ credentials }) => {
  const handleTrainingPlanAction = (planId: number, action: string) => {
    console.log(`${action} training plan ${planId}`);
    // In real app, this would perform the action
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 animate-on-scroll">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Award className="h-5 w-5 text-yellow-500" />
          <span>Credentials & Certifications</span>
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Manage Your Coaching Credentials</h3>
            <button 
              onClick={() => handleTrainingPlanAction(0, 'add-credential')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 hover:shadow-lg flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Credential
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {credentials.map((credential) => (
              <div key={credential.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 animate-on-scroll">
                <div className="p-4 border-b">
                  <h4 className="text-lg font-semibold">{credential.name}</h4>
                  <p className="text-sm text-gray-600">{credential.issuingOrg}</p>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Issued:</span>
                      <span className="font-medium">{credential.issueDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Expires:</span>
                      <span className="font-medium">{credential.expiryDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {credential.status}
                      </span>
                    </div>
                    <div className="pt-2">
                      <button
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                        onClick={() => window.open(credential.verificationUrl, '_blank')}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Verify Online
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credentials; 