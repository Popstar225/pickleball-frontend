/**
 * Federation Tournament Creation Page
 *
 * Page for federation admins to create and manage national tournaments.
 * National tournaments are automatically published upon creation.
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, Zap } from 'lucide-react';
import FederationTournamentCreationForm from '@/components/tournaments/FederationTournamentCreationForm';

export const FederationTournamentCreationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (tournament: any) => {
    navigate(`/admin/dashboard/tournaments/${tournament.id}`, {
      state: {
        message:
          'National tournament created and published successfully. Registration is now open.',
      },
    });
  };

  const handleCancel = () => {
    navigate('/admin/dashboard/tournaments');
  };

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────*/}
      <div>
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/25 hover:text-white/60 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a torneos
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-[#ace600]" />
          <h1 className="text-[22px] font-bold text-white tracking-tight">Crear Torneo Nacional</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
            <Zap className="w-2.5 h-2.5" />
            Publicación automática
          </span>
        </div>
        <p className="text-xs text-white/25">
          Configura un nuevo torneo nacional de federación. El torneo será publicado automáticamente
          y disponible para registro.
        </p>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────────*/}
      <FederationTournamentCreationForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};

export default FederationTournamentCreationPage;
