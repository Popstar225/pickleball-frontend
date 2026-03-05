import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, Check, X, Loader2, ChevronDown, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { RootState, AppDispatch } from '@/store';
import {
  fetchPendingTournaments,
  approveTournament,
  rejectTournament,
  type Tournament,
} from '@/store/slices/tournamentValidationSlice';

export default function FederationTournamentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    pendingTournaments: tournaments,
    loading,
    stats,
    error,
  } = useSelector((state: RootState) => state.tournamentValidation);

  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    dispatch(fetchPendingTournaments({ limit: 100, page: 1 }));
  }, [dispatch]);

  const handleApprove = async (tournament: Tournament) => {
    setIsApproving(true);
    try {
      await dispatch(
        approveTournament({
          tournamentId: tournament.id,
        }),
      ).unwrap();
    } catch (error) {
      console.error('Failed to approve tournament:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTournament || !rejectionReason.trim()) return;

    setIsRejecting(true);
    try {
      await dispatch(
        rejectTournament({
          tournamentId: selectedTournament.id,
          reason: rejectionReason,
        }),
      ).unwrap();
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedTournament(null);
    } catch (error) {
      console.error('Failed to reject tournament:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchPendingTournaments({ limit: 100, page: 1 })).unwrap();
    } catch (error) {
      console.error('Failed to refresh tournaments:', error);
    } finally {
      setRefreshing(false);
    }
  };

  console.log('------------------------', tournaments);
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-6 h-6 text-[#ace600] animate-spin mx-auto mb-2" />
          <p className="text-xs text-white/30">Cargando eventos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400">Error</p>
            <p className="text-xs text-red-400/80">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Validación de Torneos</h1>
          <p className="text-xs text-white/30">
            Aprueba o rechaza torneos pendientes de validación
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-9 px-3 rounded-xl border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-white/40 hover:text-white gap-1.5 transition-all"
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: BarChart3, color: 'text-white/60' },
          { label: 'Pendientes', value: stats.pending, icon: AlertCircle, color: 'text-amber-400' },
          { label: 'Aprobados', value: stats.approved, icon: Check, color: 'text-emerald-400' },
          { label: 'Rechazados', value: stats.rejected, icon: X, color: 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#0d1117] border border-white/[0.07] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                {label}
              </p>
              <Icon className={cn('w-3.5 h-3.5', color)} />
            </div>
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tournaments list */}
      {tournaments.length === 0 ? (
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-8 text-center">
          <Check className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white/40 mb-1">¡Todos los torneos aprobados!</p>
          <p className="text-xs text-white/20">No hay torneos pendientes de aprobación.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tournaments.map((tournament: Tournament) => (
            <div
              key={tournament.id}
              className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all"
            >
              <button
                onClick={() => setExpandedId(expandedId === tournament.id ? null : tournament.id)}
                className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-white/90 transition-colors">
                      {tournament.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 border-amber-500/20 text-amber-400"
                    >
                      Pending Validation
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-white/30">
                    <div>
                      <p className="font-bold text-white/40 mb-0.5">Organizador</p>
                      <p className="truncate">{tournament.organizer_name}</p>
                    </div>
                    <div>
                      <p className="font-bold text-white/40 mb-0.5">Estado</p>
                      <p className="truncate">{tournament.state}</p>
                    </div>
                    <div>
                      <p className="font-bold text-white/40 mb-0.5">Ciudad</p>
                      <p className="truncate">{tournament.city}</p>
                    </div>
                    <div>
                      <p className="font-bold text-white/40 mb-0.5">Tipo</p>
                      <p>{tournament.organizer_type}</p>
                    </div>
                  </div>
                </div>

                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-white/20 shrink-0 transition-transform',
                    expandedId === tournament.id && 'rotate-180',
                  )}
                />
              </button>

              {/* Expanded details */}
              {expandedId === tournament.id && (
                <div className="border-t border-white/[0.05] bg-white/[0.01] p-4 sm:p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                    {[
                      { label: 'Director', value: tournament.organizer_name },
                      { label: 'Venue', value: tournament.venue_name },
                      { label: 'Ciudad', value: tournament.city },
                      {
                        label: 'Creado',
                        value: tournament.created_at
                          ? new Date(tournament.created_at).toLocaleDateString('es-MX')
                          : 'N/A',
                      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">
                          {label}
                        </p>
                        <p className="text-xs font-semibold text-white/60">{value}</p>
                      </div>
                    ))}
                  </div>

                  {tournament.description && (
                    <div className="mb-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">
                        Descripción
                      </p>
                      <p className="text-xs text-white/60">{tournament.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(tournament)}
                      disabled={isApproving}
                      className="flex-1 h-9 rounded-xl text-xs font-bold gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                    >
                      {isApproving ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Aprobando…
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Aprobar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedTournament(tournament);
                        setRejectDialogOpen(true);
                      }}
                      variant="outline"
                      className="flex-1 h-9 rounded-xl text-xs font-bold gap-1.5 border-red-500/20 bg-red-500/[0.05] hover:bg-red-500/[0.1] text-red-400 hover:text-red-300 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-[#161c25] border border-white/[0.08] rounded-2xl sm:rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">Rechazar Torneo</DialogTitle>
            <DialogDescription className="text-white/40">
              {selectedTournament && <span>{selectedTournament.name}</span>}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-3 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400/80 leading-relaxed">
                Proporciona una razón clara para el rechazo. El estado podrá apelar o hacer cambios.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-2">
                Razón de Rechazo
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explica por qué rechazas este evento…"
                className="min-h-[120px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl text-xs focus-visible:ring-0 focus-visible:border-red-500/50 transition-all resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason('');
                setSelectedTournament(null);
              }}
              className="rounded-xl border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-white/40 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isRejecting}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold gap-1.5"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Rechazando…
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5" />
                  Rechazar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
