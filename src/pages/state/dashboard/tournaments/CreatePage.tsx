/**
 * State Tournament Creation Page
 *
 * Page for state admins to create and manage state-level tournaments.
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft } from 'lucide-react';
import StateTournamentCreationForm from '@/components/tournaments/StateTournamentCreationForm';

export const StateTournamentCreationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (tournament: any) => {
    navigate(`/state/dashboard/tournaments/${tournament.id}`, {
      state: {
        message: 'State tournament created successfully and is pending federation validation.',
      },
    });
  };

  const handleCancel = () => {
    navigate('/state/dashboard/tournaments');
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
          <h1 className="text-[22px] font-bold text-white tracking-tight">Crear Torneo Estatal</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border-amber-500/20 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pendiente validación
          </span>
        </div>
        <p className="text-xs text-white/25">
          Configura un nuevo torneo estatal. Una vez creado, será enviado a la federación para su
          validación.
        </p>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────────*/}
      <StateTournamentCreationForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};

export default StateTournamentCreationPage;
