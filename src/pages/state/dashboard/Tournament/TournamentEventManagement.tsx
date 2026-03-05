import React from 'react';
import { useParams } from 'react-router-dom';
import AdminTournamentEventManagement from '../../../admin/dashboard/Tournament/TournamentEventManagement';

interface TournamentEventManagementProps {
  tournamentId: string;
}

const TournamentEventManagement: React.FC<TournamentEventManagementProps> = ({ tournamentId }) => {
  return <AdminTournamentEventManagement tournamentId={tournamentId} />;
};

export default TournamentEventManagement;
