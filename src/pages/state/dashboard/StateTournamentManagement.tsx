import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganizerTournamentDashboard } from '@/components/organizer/OrganizerTournamentDashboard';

export default function StateTournamentManagementPage() {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate('/state/dashboard/tournaments/create');
  };

  return (
    <div className="space-y-6">
      <OrganizerTournamentDashboard
        organizerType="state"
        showCreateButton={true}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
}
