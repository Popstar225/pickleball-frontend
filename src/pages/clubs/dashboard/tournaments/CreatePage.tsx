/**
 * Club Tournament Creation Page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ClubTournamentCreationForm from '@/components/tournaments/ClubTournamentCreationForm';

export const ClubTournamentCreationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (tournament: any) => {
    navigate(`/clubs/dashboard/tournaments/${tournament.id}`, {
      state: { message: 'Torneo creado y enviado a validación estatal.' },
    });
  };

  const handleCancel = () => {
    navigate('/clubs/dashboard/tournaments');
  };

  return (
    <div className="min-h-screen bg-[#080c10] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back link */}
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white/65 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Volver a torneos
        </button>

        {/* Form */}
        <ClubTournamentCreationForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default ClubTournamentCreationPage;
