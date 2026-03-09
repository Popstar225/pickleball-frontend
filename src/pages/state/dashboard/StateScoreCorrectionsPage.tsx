import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2, AlertCircle, CheckSquare, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { RootState } from '@/store';
import ScoreCorrectionApprovalPage from '../../clubs/dashboard/Tournament/ScoreCorrectionApprovalPage';

interface Tournament {
  id: string;
  name: string;
  status: string;
}

export default function StateScoreCorrectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((s: RootState) => s.auth);

  const selectedId = searchParams.get('tournamentId') || '';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ tournament_type: 'state', limit: '50' });
        if (user?.state) params.set('state', user.state);
        const res = await api.get<any>(`/tournaments?${params.toString()}`);
        const list = res.data?.tournaments ?? res.data ?? res.tournaments ?? [];
        setTournaments(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar torneos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.state]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CheckSquare className="w-5 h-5 text-[#ace600]" />
          <h1 className="text-[22px] font-bold text-white tracking-tight">Correcciones de Marcador</h1>
        </div>
        <p className="text-xs text-white/25">Aprueba o rechaza solicitudes de corrección de marcador en torneos estatales</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-3.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl flex flex-col items-center justify-center py-16 gap-3">
          <CheckSquare className="w-10 h-10 text-white/10" />
          <p className="text-sm text-white/25">No hay torneos estatales con correcciones pendientes</p>
        </div>
      ) : (
        <>
          <div className="relative max-w-sm">
            <select
              value={selectedId}
              onChange={(e) => setSearchParams({ tournamentId: e.target.value })}
              className="w-full h-10 appearance-none bg-white/[0.04] border border-white/[0.09] rounded-xl pl-3 pr-8 text-sm text-white focus:border-[#ace600]/50 focus:outline-none transition-colors"
            >
              <option value="">Seleccionar torneo…</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>

          {selectedId ? (
            <ScoreCorrectionApprovalPage tournamentId={selectedId} />
          ) : (
            <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl flex flex-col items-center justify-center py-16 gap-3">
              <CheckSquare className="w-10 h-10 text-white/10" />
              <p className="text-sm text-white/25">Selecciona un torneo para ver las correcciones</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
