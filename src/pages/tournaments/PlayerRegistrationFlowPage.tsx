import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PlayerSinglesRegistration from '@/components/tournament/PlayerSinglesRegistration';
import type { RootState } from '@/store';

interface Props {
  tournamentId: string;
}

const PlayerRegistrationFlowPage: React.FC<Props> = ({ tournamentId }) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleRegistrationComplete = (registrationId: string, paymentRequired: boolean) => {
    if (paymentRequired) {
      navigate(`/tournaments/${tournamentId}/register/${registrationId}/payment`);
    } else {
      navigate(`/tournaments/${tournamentId}/register/${registrationId}/confirmation`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <PlayerSinglesRegistration
          tournamentId={tournamentId}
          userId={user.id}
          userName={user.full_name || user.username || ''}
          skillLevel={user.skill_level || '2.5'}
          userEmail={user.email}
          onRegistrationComplete={handleRegistrationComplete}
        />
      </div>
    </div>
  );
};

export default PlayerRegistrationFlowPage;
