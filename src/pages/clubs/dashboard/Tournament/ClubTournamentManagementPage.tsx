import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganizerTournamentDashboard } from '@/components/organizer/OrganizerTournamentDashboard';

export default function ClubTournamentManagementPage() {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate('/clubs/dashboard/tournaments/create');
  };

  return (
    <div className="space-y-6">
      <OrganizerTournamentDashboard
        organizerType="club"
        showCreateButton={true}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
}
