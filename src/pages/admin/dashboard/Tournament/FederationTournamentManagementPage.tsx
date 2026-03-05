import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganizerTournamentDashboard } from '@/components/organizer/OrganizerTournamentDashboard';

export default function FederationTournamentManagementPage() {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate('/admin/dashboard/tournaments/create');
  };

  return (
    <div className="space-y-6">
      <OrganizerTournamentDashboard
        organizerType="admin"
        showCreateButton={true}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
}
