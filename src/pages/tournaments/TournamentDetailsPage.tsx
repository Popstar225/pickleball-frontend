import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Users,
  Trophy,
  Calendar,
  DollarSign,
  ArrowLeft,
  Loader2,
  ChevronRight,
  Check,
  X,
  Zap,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TournamentEvent {
  id: string;
  event_name: string;
  modality: 'Singles' | 'Doubles' | 'Mixed';
  skill_block: string;
  registration_status: string;
  entry_fee: number;
  max_participants: number;
  minimum_participants: number;
  current_participants: number;
  description?: string;
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  tournament_level: string;
  events: TournamentEvent[];
  image_url?: string;
  registrations_open: boolean;
}

interface Props {
  tournamentId: string;
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────
function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#ace600]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-white/75 truncate">{value}</p>
      </div>
    </div>
  );
}

function CapacityBar({ current, max }: { current: number; max: number }) {
  const pct = max ? Math.min(Math.round((current / max) * 100), 100) : 0;
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-[#ace600]';
  return (
    <div>
      <div className="flex justify-between mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/25">
        <span>Capacidad</span>
        <span className="font-mono normal-case">
          {current}/{max} · {pct}%
        </span>
      </div>
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const modalityColor: Record<string, string> = {
  Singles: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Doubles: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Mixed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const TournamentDetailsPage: React.FC<Props> = ({ tournamentId }) => {
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TournamentEvent | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get<ApiResponse<Tournament>>(`/tournaments/${tournamentId}`);
        let data = res.data as any;
        // Handle nested response structure
        if (data?.data && !Array.isArray(data.data)) {
          data = data.data;
        }
        setTournament(data || null);
        if (data?.events?.length) setSelected(data.events[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [tournamentId]);

  const handleRegister = () => {
    // if (!tournament?.registrations_open) return;
    navigate(`/tournaments/${tournament.id}/register`);
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-7 h-7 text-[#ace600] animate-spin" />
          <p className="text-xs text-white/25">Cargando torneo…</p>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#080c10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <Trophy className="w-7 h-7 text-white/10" />
          </div>
          <p className="text-sm text-white/30">Torneo no encontrado</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tournaments')}
            className="h-8 rounded-xl border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-white/40 hover:text-white text-xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Volver
          </Button>
        </div>
      </div>
    );
  }

  const registrationsOpen = tournament.registrations_open;
  const selectedOpen = selected?.registration_status === 'open';
  const spacesLeft = selected
    ? (selected.max_participants ?? 0) - (selected.current_participants ?? 0)
    : 0;

  console.log(';;;;;;;;;;;;;;;;;;;;;;;', selectedOpen, selected?.registration_status);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080c10]">
      {/* ── Sticky nav ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#080c10]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/federation/tournaments')}
            className="flex items-center gap-2 text-white/40 hover:text-white text-xs font-semibold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Volver a Torneos
          </button>
          {selectedOpen ? (
            <Badge
              variant="outline"
              className="gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Inscripciones Abiertas
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-500/10 border-red-500/20 text-red-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              Inscripciones Cerradas
            </Badge>
          )}
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      {tournament.image_url && (
        <div className="relative h-56 sm:h-72 overflow-hidden">
          <img
            src={tournament.image_url}
            alt={tournament.name}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080c10]/60 to-[#080c10]" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {/* ── Title block ─────────────────────────────────────────────────────── */}
        <div className={cn('py-8', tournament.image_url ? '-mt-16 relative z-10' : '')}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                  {tournament.name}
                </h1>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600] shrink-0"
                >
                  {tournament.tournament_level}
                </Badge>
              </div>
              {tournament.description && (
                <p className="text-sm text-white/35 leading-relaxed max-w-2xl">
                  {tournament.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Meta chips ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <MetaChip icon={MapPin} label="Ubicación" value={tournament.location} />
          <MetaChip
            icon={Calendar}
            label="Inicio"
            value={new Date(tournament.start_date).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          />
          <MetaChip
            icon={Calendar}
            label="Fin"
            value={new Date(tournament.end_date).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          />
          <MetaChip
            icon={Trophy}
            label="Eventos"
            value={`${tournament.events?.length ?? 0} categorías`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Events list ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-4">
              Categorías del Torneo
            </p>

            {(tournament.events?.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white/10" />
                </div>
                <p className="text-sm text-white/25">No hay eventos disponibles</p>
              </div>
            ) : (
              (tournament.events ?? []).map((ev) => {
                const isSelected = selected?.id === ev.id;
                const isOpen = ev.registration_status === 'open';
                const evPct = ev.max_participants
                  ? Math.round((ev.current_participants / ev.max_participants) * 100)
                  : 0;

                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelected(ev)}
                    className={cn(
                      'w-full text-left p-4 rounded-2xl border transition-all duration-150 group',
                      isSelected
                        ? 'bg-[#ace600]/[0.06] border-[#ace600]/30'
                        : 'bg-[#0d1117] border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.02]',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span
                          className={cn(
                            'text-xs font-bold transition-colors leading-snug',
                            isSelected ? 'text-white' : 'text-white/65 group-hover:text-white/85',
                          )}
                        >
                          {ev.event_name}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0',
                            modalityColor[ev.modality] ??
                              'bg-white/[0.05] text-white/35 border-white/[0.08]',
                          )}
                        >
                          {ev.modality}
                        </Badge>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 gap-1',
                          isOpen
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20',
                        )}
                      >
                        {isOpen ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                        {isOpen ? 'Abierto' : 'Cerrado'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                      {[
                        { icon: Trophy, val: ev.skill_block ?? '—' },
                        {
                          icon: Users,
                          val: `${ev.current_participants ?? 0}/${ev.max_participants ?? 0} jugadores`,
                        },
                        { icon: DollarSign, val: `$${ev.entry_fee ?? 0} MXN` },
                      ].map(({ icon: Icon, val }, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-white/30">
                          <Icon className="w-3 h-3 shrink-0 text-white/20" />
                          {val}
                        </div>
                      ))}
                    </div>

                    {/* Inline mini capacity bar */}
                    <div className="h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          evPct >= 90
                            ? 'bg-red-500'
                            : evPct >= 70
                              ? 'bg-amber-500'
                              : isSelected
                                ? 'bg-[#ace600]'
                                : 'bg-white/20',
                        )}
                        style={{ width: `${evPct}%` }}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* ── Selected event panel ─────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-4">
              Detalle del Evento
            </p>

            {selected ? (
              <div className="bg-[#0d1117] border border-white/[0.08] rounded-2xl overflow-hidden sticky top-20">
                {/* Panel header */}
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {selected.event_name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0',
                        modalityColor[selected.modality] ??
                          'bg-white/[0.05] text-white/35 border-white/[0.08]',
                      )}
                    >
                      {selected.modality}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-white/25 font-mono">{selected.skill_block}</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-px bg-white/[0.05]">
                  {[
                    {
                      label: 'Inscripción',
                      value: `$${selected.entry_fee ?? 0}`,
                      sub: 'MXN',
                      big: true,
                    },
                    {
                      label: 'Lugares libres',
                      value: spacesLeft,
                      sub: `de ${selected.max_participants ?? 0}`,
                      big: true,
                    },
                    {
                      label: 'Mínimo',
                      value: selected.minimum_participants ?? 0,
                      sub: 'jugadores',
                      big: false,
                    },
                    {
                      label: 'Inscritos',
                      value: selected.current_participants ?? 0,
                      sub: 'actuales',
                      big: false,
                    },
                  ].map(({ label, value, sub, big }) => (
                    <div key={label} className="bg-[#0d1117] px-4 py-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1">
                        {label}
                      </p>
                      <p
                        className={cn(
                          'font-bold text-white leading-none',
                          big ? 'text-2xl' : 'text-lg',
                        )}
                      >
                        {value}
                      </p>
                      <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Capacity */}
                <div className="px-5 py-4 border-t border-white/[0.05]">
                  <CapacityBar
                    current={selected.current_participants}
                    max={selected.max_participants}
                  />
                </div>

                {/* Description */}
                {selected.description && (
                  <div className="px-5 pb-4 border-t border-white/[0.05] pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                      Descripción
                    </p>
                    <p className="text-xs text-white/40 leading-relaxed">{selected.description}</p>
                  </div>
                )}

                {/* CTA */}
                <div className="px-5 pb-5 pt-1">
                  {!registrationsOpen ? (
                    <div className="flex items-center gap-2.5 p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-3">
                      <Lock className="w-4 h-4 text-white/25 shrink-0" />
                      <p className="text-xs text-white/30">
                        Las inscripciones están cerradas para este torneo.
                      </p>
                    </div>
                  ) : !selectedOpen ? (
                    <div className="flex items-center gap-2.5 p-3.5 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <p className="text-xs text-amber-400/80">Esta categoría está cerrada.</p>
                    </div>
                  ) : null}

                  <Button
                    onClick={handleRegister}
                    disabled={!selectedOpen}
                    className={cn(
                      'w-full h-11 rounded-xl text-sm font-bold transition-all gap-2',
                      selectedOpen
                        ? 'bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_16px_rgba(172,230,0,0.2)]'
                        : 'bg-white/[0.04] border border-white/[0.07] text-white/20 cursor-not-allowed',
                    )}
                  >
                    {!registrationsOpen ? (
                      <>
                        <Lock className="w-4 h-4" /> Inscripciones Cerradas
                      </>
                    ) : !selectedOpen ? (
                      <>
                        <X className="w-4 h-4" /> Categoría Cerrada
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" /> Inscribirme a este Evento
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl flex flex-col items-center justify-center py-14 gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white/10" />
                </div>
                <p className="text-xs text-white/25">Selecciona una categoría</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailsPage;
