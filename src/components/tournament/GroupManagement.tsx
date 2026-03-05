/**
 * Group Management Component
 *
 * Displays and manages tournament groups for tournament organizers.
 *
 * @author Tournament System
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { generateGroups, fetchEventGroups } from '@/store/slices/tournamentsSlice';
import GroupProgressSummary from '@/components/tournament/GroupProgressSummary';
import {
  Trophy, Users, BarChart3, RefreshCw, Check, Clock, AlertCircle,
} from 'lucide-react';

interface GroupManagementProps {
  tournamentId: string;
  eventId: string;
  eventName: string;
  eventStatus?: string;
}

const cn = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ');

const GroupManagement: React.FC<GroupManagementProps> = ({
  tournamentId, eventId, eventName, eventStatus,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { eventGroups, eventMatches, loading } = useSelector(
    (state: RootState) => state.tournaments,
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateGroups = async () => {
    setIsGenerating(true);
    try {
      await dispatch(generateGroups({ tournamentId, eventId })).unwrap();
      await dispatch(fetchEventGroups({ tournamentId, eventId })).unwrap();
    } catch (error) {
      console.error('Error generating groups:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateGroups = async () => {
    setIsGenerating(true);
    try {
      await dispatch(generateGroups({ tournamentId, eventId, params: { force: true } })).unwrap();
      await dispatch(fetchEventGroups({ tournamentId, eventId })).unwrap();
    } catch (error) {
      console.error('Error regenerating groups:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (eventGroups.length === 0 && eventId) {
      dispatch(fetchEventGroups({ tournamentId, eventId }));
    }
  }, [eventId, dispatch, tournamentId, eventGroups.length]);

  const STATUS_CFG: Record<string, { cls: string; dot: string; label: string }> = {
    completed:   { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400',            label: 'Completado'  },
    in_progress: { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       dot: 'bg-amber-400 animate-pulse', label: 'En progreso' },
    pending:     { cls: 'bg-white/[0.05] text-white/30 border-white/[0.08]',        dot: 'bg-white/20',               label: 'Pendiente'   },
  };

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────*/}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-[#ace600]" />
          <h2 className="text-[22px] font-bold text-white tracking-tight">Gestión de Grupos</h2>
          {eventGroups.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
              {eventGroups.length} grupos
            </span>
          )}
        </div>
        <p className="text-xs text-white/25">
          {eventName} · <span className="text-white/40">{eventStatus || 'Activo'}</span>
        </p>
      </div>

      {/* ── Group Progress Summary ───────────────────────────────────────────*/}
      {eventGroups.length > 0 && (
        <GroupProgressSummary groups={eventGroups} matches={eventMatches || []} isCompact={false} />
      )}

      {/* ── Action panel ────────────────────────────────────────────────────*/}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-0.5">
            {eventGroups.length > 0 ? 'Regenerar grupos' : 'Generar grupos'}
          </p>
          <p className="text-xs text-white/25">
            {eventGroups.length > 0
              ? `${eventGroups.length} grupos generados actualmente`
              : 'Aún no se han generado grupos'}
          </p>
        </div>

        {eventGroups.length === 0 ? (
          <button
            onClick={handleGenerateGroups}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-[11px] font-bold bg-[#ace600] hover:bg-[#bdf200] text-black transition-all shadow-[0_0_12px_rgba(172,230,0,0.2)] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isGenerating
              ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generando…</>
              : <><Trophy className="w-3.5 h-3.5" /> Generar grupos</>}
          </button>
        ) : (
          <button
            onClick={handleRegenerateGroups}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-[11px] font-bold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isGenerating && 'animate-spin')} />
            {isGenerating ? 'Regenerando…' : 'Regenerar (forzar)'}
          </button>
        )}
      </div>

      {/* ── Groups grid ─────────────────────────────────────────────────────*/}
      {eventGroups.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#ace600]" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
              {eventGroups.length} Grupos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {eventGroups.map((group: any, idx: number) => {
              const statusKey = group.status || 'pending';
              const s = STATUS_CFG[statusKey] ?? STATUS_CFG.pending;
              const pct = group.completionPercent || 0;

              return (
                <div key={group.id} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[10px] font-black text-[#ace600] select-none">
                        {group.groupNumber ?? idx + 1}
                      </div>
                      <p className="text-xs font-bold text-white/70">
                        Grupo {group.groupNumber ?? idx + 1}
                      </p>
                    </div>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider',
                      s.cls,
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
                      {s.label}
                    </span>
                  </div>

                  {/* Stats strip */}
                  <div className="grid grid-cols-3 divide-x divide-white/[0.05] border-b border-white/[0.06]">
                    {[
                      { label: 'Jugadores', value: group.playerCount ?? '—' },
                      { label: 'Partidos',  value: `${group.matchesCompleted ?? 0}/${group.totalMatches ?? 0}` },
                      { label: 'Progreso',  value: `${pct}%` },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-0.5">{label}</p>
                        <p className="text-lg font-bold text-white leading-none">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar + status */}
                  <div className="px-5 py-3.5 space-y-2.5">
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ace600] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-white/25">
                      {pct === 100 ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Todos los partidos completados</span>
                        </>
                      ) : (group.totalMatches ?? 0) > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{(group.totalMatches ?? 0) - (group.matchesCompleted ?? 0)} partidos restantes</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-white/15" />
                          <span>Sin partidos</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Processing overlay ──────────────────────────────────────────────*/}
      {isGenerating && loading && (
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl flex items-center justify-center gap-3 py-10">
          <div className="w-5 h-5 rounded-full border-2 border-[#ace600]/30 border-t-[#ace600] animate-spin" />
          <p className="text-xs text-white/30">Procesando grupos…</p>
        </div>
      )}

    </div>
  );
};

export default GroupManagement;