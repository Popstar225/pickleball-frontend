/**
 * Score Correction Approval Page
 *
 * Allows tournament organizers (club/state/federation) to:
 * - View pending score correction requests
 * - See original vs proposed scores
 * - Approve or reject with notes
 *
 * Backend endpoints used:
 *   GET  /matches/tournaments/:tournamentId/corrections/pending
 *   POST /matches/tournaments/:tournamentId/corrections/:correctionId/approve
 *   POST /matches/tournaments/:tournamentId/corrections/:correctionId/reject
 */

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SetScore {
  set: number;
  player1: number;
  player2: number;
}

interface CorrectionRequest {
  id: string;
  match_id: string;
  requested_by: string;
  requester_name?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  original_scores: SetScore[];
  proposed_scores: SetScore[];
  match: {
    id: string;
    player1: { id: string; full_name: string };
    player2: { id: string; full_name: string };
    scheduled_time: string;
    winner_id?: string;
  };
}

interface Props {
  tournamentId: string;
}

function ScoreDisplay({ sets, label, highlight }: { sets: SetScore[]; label: string; highlight: boolean }) {
  return (
    <div className={cn('rounded-lg border px-3 py-2 flex-1', highlight ? 'border-[#ace600]/30 bg-[#ace600]/5' : 'border-white/[0.06] bg-white/[0.02]')}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">{label}</p>
      <div className="flex gap-1.5 flex-wrap">
        {sets.map((s) => (
          <span key={s.set} className={cn('text-sm font-black px-2 py-0.5 rounded', highlight ? 'text-[#ace600]' : 'text-white/70')}>
            {s.player1}–{s.player2}
          </span>
        ))}
        {sets.length === 0 && <span className="text-white/20 text-xs">Sin datos</span>}
      </div>
    </div>
  );
}

function CorrectionCard({
  correction,
  onApprove,
  onReject,
}: {
  correction: CorrectionRequest;
  onApprove: (id: string, notes: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [mode, setMode] = useState<'approve' | 'reject' | null>(null);

  const isPending = correction.status === 'pending';
  const dt = new Date(correction.created_at);

  return (
    <div className={cn('bg-[#0d1117] border rounded-xl overflow-hidden', isPending ? 'border-yellow-500/30' : 'border-white/[0.06]')}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-white/[0.02]"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border',
              correction.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
              correction.status === 'approved' ? 'bg-[#ace600]/10 text-[#ace600] border-[#ace600]/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            )}>
              {correction.status === 'pending' ? 'Pendiente' : correction.status === 'approved' ? 'Aprobado' : 'Rechazado'}
            </span>
            <p className="text-white font-bold text-sm">
              {correction.match.player1?.full_name} vs {correction.match.player2?.full_name}
            </p>
          </div>
          <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
            <User className="w-3 h-3" />
            Solicitado por: {correction.requester_name || correction.requested_by}
            <span className="mx-1">·</span>
            <Clock className="w-3 h-3" />
            {dt.toLocaleDateString('es-MX')} {dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="shrink-0 mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-white/[0.06] px-4 py-4 space-y-4">
          {/* Reason */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Razón de la solicitud</p>
            <p className="text-white/80 text-sm bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">{correction.reason}</p>
          </div>

          {/* Score comparison */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Comparación de marcadores</p>
            <div className="flex gap-3">
              <ScoreDisplay sets={correction.original_scores || []} label="Marcador original" highlight={false} />
              <ScoreDisplay sets={correction.proposed_scores || []} label="Marcador propuesto" highlight={true} />
            </div>
          </div>

          {/* Action buttons — only for pending */}
          {isPending && (
            <div className="space-y-3">
              {mode === null && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('approve')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ace600]/10 border border-[#ace600]/30 rounded-lg text-[#ace600] font-bold text-sm hover:bg-[#ace600]/20 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprobar corrección
                  </button>
                  <button
                    onClick={() => setMode('reject')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              )}

              {mode === 'approve' && (
                <div className="space-y-2">
                  <textarea
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                    placeholder="Notas de aprobación (opcional)..."
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm focus:border-[#ace600] focus:outline-none resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove(correction.id, approveNotes)}
                      className="flex-1 py-2.5 bg-[#ace600] text-black font-bold rounded-lg text-sm hover:bg-[#b8f000] transition-colors"
                    >
                      Confirmar aprobación
                    </button>
                    <button onClick={() => setMode(null)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm hover:bg-white/10 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {mode === 'reject' && (
                <div className="space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Motivo del rechazo..."
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onReject(correction.id, rejectReason)}
                      className="flex-1 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 font-bold rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                    >
                      Confirmar rechazo
                    </button>
                    <button onClick={() => setMode(null)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm hover:bg-white/10 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ScoreCorrectionApprovalPage({ tournamentId }: Props) {
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending');

  const loadCorrections = async () => {
    try {
      setLoading(true);
      const data = await api.get<any>(`/matches/tournaments/${tournamentId}/corrections/pending`);
      if (data.success) {
        setCorrections(data.corrections || data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar correcciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) loadCorrections();
  }, [tournamentId]);

  const handleApprove = async (correctionId: string, notes: string) => {
    try {
      await api.post(`/matches/tournaments/${tournamentId}/corrections/${correctionId}/approve`, {
        approvalNotes: notes,
      });
      setSuccessMsg('Corrección aprobada. El marcador ha sido actualizado.');
      await loadCorrections();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar');
    }
  };

  const handleReject = async (correctionId: string, reason: string) => {
    try {
      await api.post(`/matches/tournaments/${tournamentId}/corrections/${correctionId}/reject`, {
        rejectionReason: reason,
      });
      setSuccessMsg('Corrección rechazada.');
      await loadCorrections();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar');
    }
  };

  const pending = corrections.filter((c) => c.status === 'pending');
  const resolved = corrections.filter((c) => c.status !== 'pending');
  const displayed = filterStatus === 'pending' ? pending : corrections;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Correcciones de Marcador</h2>
          <p className="text-white/50 text-sm mt-1">
            {pending.length} solicitud(es) pendiente(s) · {resolved.length} resuelta(s)
          </p>
        </div>
        <div className="flex gap-2">
          {(['pending', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors',
                filterStatus === f
                  ? 'bg-[#ace600]/10 border-[#ace600]/30 text-[#ace600]'
                  : 'bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80',
              )}
            >
              {f === 'pending' ? `Pendientes (${pending.length})` : `Todas (${corrections.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {successMsg && (
        <div className="bg-[#ace600]/10 border border-[#ace600]/30 rounded-xl px-4 py-3 flex items-center gap-2 text-[#ace600] text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400">✕</button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 text-[#ace600] animate-spin" />
        </div>
      ) : displayed.length > 0 ? (
        <div className="space-y-3">
          {displayed.map((c) => (
            <CorrectionCard key={c.id} correction={c} onApprove={handleApprove} onReject={handleReject} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-[#ace600]/30" />
          <p className="text-white/40 font-medium">No hay correcciones {filterStatus === 'pending' ? 'pendientes' : ''}</p>
        </div>
      )}
    </div>
  );
}
