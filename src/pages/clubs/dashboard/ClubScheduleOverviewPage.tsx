/**
 * Club Schedule Overview Page
 * Route: /clubs/dashboard/schedule
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '@/lib/api';
import type { RootState } from '@/store';
import {
  CalendarDays, ChevronRight, Loader2, AlertCircle,
  Clock, Trophy, Users, Layers, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function eventLabel(ev: any): string {
  return `${ev.skill_block} · ${ev.gender} · ${ev.modality}`;
}

const STATUS_CFG: Record<string, { label: string; textCls: string; bgCls: string; borderCls: string; dot: string }> = {
  in_progress: { label: 'En curso',   textCls: 'text-[#ace600]',   bgCls: 'bg-[#ace600]/10',   borderCls: 'border-[#ace600]/25',   dot: 'bg-[#ace600] animate-pulse' },
  completed:   { label: 'Finalizado', textCls: 'text-emerald-400', bgCls: 'bg-emerald-500/10', borderCls: 'border-emerald-500/25', dot: 'bg-emerald-400' },
  open:        { label: 'Abierto',    textCls: 'text-sky-400',     bgCls: 'bg-sky-500/10',     borderCls: 'border-sky-500/25',     dot: 'bg-sky-400' },
  closed:      { label: 'Cerrado',    textCls: 'text-amber-400',   bgCls: 'bg-amber-500/10',   borderCls: 'border-amber-500/25',   dot: 'bg-amber-400' },
  cancelled:   { label: 'Cancelado',  textCls: 'text-red-400',     bgCls: 'bg-red-500/10',     borderCls: 'border-red-500/25',     dot: 'bg-red-400' },
  full:        { label: 'Lleno',      textCls: 'text-violet-400',  bgCls: 'bg-violet-500/10',  borderCls: 'border-violet-500/25',  dot: 'bg-violet-400' },
};
const DEFAULT_STATUS = { label: '—', textCls: 'text-white/30', bgCls: 'bg-white/[0.04]', borderCls: 'border-white/[0.08]', dot: 'bg-white/20' };

function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? DEFAULT_STATUS;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest whitespace-nowrap',
      c.textCls, c.bgCls, c.borderCls,
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface Tournament { id: string; name: string; status: string; start_date: string; events?: any[] }

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClubScheduleOverviewPage() {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const organizerId = user?.id || user?.club_id;
        const url = organizerId
          ? `/tournaments?organizer_id=${organizerId}&limit=50`
          : '/tournaments?limit=50';

        const data = await api.get<any>(url);
        const list: Tournament[] = Array.isArray(data?.data?.data)
          ? data.data.data
          : Array.isArray(data?.data)        ? data.data
          : Array.isArray(data?.tournaments) ? data.tournaments : [];

        const withEvents = await Promise.all(
          list.map(async t => {
            try {
              const evData = await api.get<any>(`/tournaments/${t.id}/events`);
              const evList = Array.isArray(evData?.events) ? evData.events
                           : Array.isArray(evData?.data)   ? evData.data : [];
              return { ...t, events: evList };
            } catch { return { ...t, events: [] }; }
          }),
        );

        setTournaments(withEvents.filter(t => (t.events?.length ?? 0) > 0));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar torneos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Loader2 className="w-5 h-5 text-[#ace600] animate-spin" />
      <p className="text-xs text-white/20">Cargando torneos…</p>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-2xl">
      <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
        <AlertCircle className="w-4 h-4 text-red-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-red-400 mb-0.5">Error al cargar</p>
        <p className="text-xs text-red-400/60">{error}</p>
      </div>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
          <CalendarDays className="w-4.5 h-4.5 text-[#ace600]" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-[22px] font-black text-white tracking-tight">Horarios de Partidos</h1>
            {tournaments.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
                {tournaments.length} torneos
              </span>
            )}
          </div>
          <p className="text-xs text-white/25">
            Selecciona un evento para programar o editar los horarios
          </p>
        </div>
      </div>

      {/* Empty state */}
      {tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-white/10" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white/30 mb-1">Sin torneos con eventos activos</p>
            <p className="text-xs text-white/20 mb-4">Crea un torneo, activa eventos y genera grupos primero</p>
            <button
              onClick={() => navigate('/clubs/dashboard/tournaments')}
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-xl text-[11px] font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_10px_rgba(172,230,0,0.15)] transition-all">
              Ir a Torneos <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.map(tournament => (
            <div key={tournament.id}
              className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all">

              {/* Accent bar */}
              <div className="h-0.5 bg-gradient-to-r from-[#ace600]/40 via-[#ace600]/20 to-transparent" />

              {/* Tournament header */}
              <div className="px-5 py-4 border-b border-white/[0.05] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{tournament.name}</p>
                  <p className="text-[11px] text-white/30 mt-0.5 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3 shrink-0" />
                    {fmtDate(tournament.start_date)}
                    <span className="text-white/15 mx-1">·</span>
                    <span className="text-white/25">
                      {tournament.events?.length ?? 0} evento{tournament.events?.length !== 1 ? 's' : ''}
                    </span>
                  </p>
                </div>
                <StatusPill status={tournament.status} />
              </div>

              {/* Events list */}
              <div className="divide-y divide-white/[0.04]">
                {(tournament.events ?? []).map((ev, idx) => (
                  <div key={ev.id}
                    className="group px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">

                    {/* Index badge */}
                    <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[10px] font-black text-white/20 shrink-0">
                      {idx + 1}
                    </div>

                    {/* Event info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white/75 group-hover:text-white transition-colors truncate">
                        {eventLabel(ev)}
                      </p>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1 text-[11px] text-white/30">
                          <Users className="w-3 h-3" />
                          {ev.current_participants ?? 0} jugadores
                        </span>
                        {ev.number_of_groups != null && (
                          <span className="flex items-center gap-1 text-[11px] text-white/30">
                            <Layers className="w-3 h-3" />
                            {ev.number_of_groups} grupos
                          </span>
                        )}
                        <StatusPill status={ev.registration_status} />
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() =>
                        navigate(`/clubs/dashboard/tournaments/${tournament.id}/events/${ev.id}/schedule`)
                      }
                      className="flex items-center gap-1.5 shrink-0 h-8 px-3.5 rounded-xl text-[11px] font-bold border border-[#ace600]/20 bg-[#ace600]/[0.07] hover:bg-[#ace600]/[0.15] text-[#ace600] transition-all group-hover:border-[#ace600]/35 group-hover:shadow-[0_0_8px_rgba(172,230,0,0.1)]">
                      <Clock className="w-3 h-3" />
                      Programar
                      <ChevronRight className="w-3 h-3 opacity-50" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}