/**
 * Coach Team Registration Page
 *
 * Allows coaches to:
 * - Browse available tournaments open for registration
 * - View tournament details and events
 * - Register players/teams for specific events
 * - View their existing registrations
 *
 * Backend endpoints:
 *   GET  /coach/tournaments/available
 *   GET  /coach/tournaments/:tournamentId/details
 *   POST /coach/teams/register
 *   GET  /coach/teams/my-registrations
 */

import { useEffect, useState } from 'react';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  ClipboardList,
  Search,
  Tag,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TournamentEvent {
  id: string;
  skill_block: string;
  gender: string;
  modality: string;
  fee: number;
  slots_available: number;
  format: string;
  max_players?: number;
}

interface AvailableTournament {
  id: string;
  name: string;
  type: 'local' | 'state' | 'national';
  location: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  events: TournamentEvent[];
}

interface TournamentDetails extends AvailableTournament {
  description?: string;
  venue?: string;
  organizer?: string;
  requirements?: string[];
}

interface MyRegistration {
  registration_id: string;
  tournament_id: string;
  tournamentName: string;
  eventName: string;
  players: { id: string; name: string }[];
  status: string;
  payment_status: string;
  group?: { id: string; number: number };
  position?: number;
  qualified?: boolean;
}

interface PlayerOption {
  id: string;
  full_name: string;
  skill_level?: string;
  gender?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function typeColor(type: string) {
  if (type === 'national') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  if (type === 'state') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  return 'bg-white/5 text-white/50 border-white/10';
}

function typeLabel(type: string) {
  if (type === 'national') return 'Nacional';
  if (type === 'state') return 'Estatal';
  return 'Local';
}

function statusColor(status: string) {
  if (status === 'confirmed' || status === 'active') return 'text-[#ace600]';
  if (status === 'pending_payment') return 'text-yellow-400';
  if (status === 'rejected' || status === 'cancelled') return 'text-red-400';
  return 'text-white/50';
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    confirmed: 'Confirmado',
    active: 'Activo',
    pending_payment: 'Pago pendiente',
    pending: 'Pendiente',
    rejected: 'Rechazado',
    cancelled: 'Cancelado',
  };
  return map[status] || status;
}

function modalityPlayers(modality: string): number {
  if (modality?.toLowerCase().includes('dobles') || modality?.toLowerCase() === 'doubles') return 2;
  if (modality?.toLowerCase().includes('mixto') || modality?.toLowerCase() === 'mixed') return 2;
  return 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registration Modal
// ─────────────────────────────────────────────────────────────────────────────

function RegisterModal({
  tournament,
  event,
  onClose,
  onSuccess,
}: {
  tournament: AvailableTournament;
  event: TournamentEvent;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const playerCount = modalityPlayers(event.modality);
  const [playerSearch, setPlayerSearch] = useState('');
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerOption[]>([]);
  const [teamName, setTeamName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search players from the coach's roster / all players
  useEffect(() => {
    if (playerSearch.length < 2) { setPlayers([]); return; }
    const t = setTimeout(async () => {
      setLoadingPlayers(true);
      try {
        const data = await api.get<any>(`/users/search?q=${encodeURIComponent(playerSearch)}&type=player&limit=10`);
        setPlayers(data.users || data.data || []);
      } catch {
        setPlayers([]);
      } finally {
        setLoadingPlayers(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [playerSearch]);

  const togglePlayer = (p: PlayerOption) => {
    if (selectedPlayers.find((s) => s.id === p.id)) {
      setSelectedPlayers(selectedPlayers.filter((s) => s.id !== p.id));
    } else if (selectedPlayers.length < playerCount) {
      setSelectedPlayers([...selectedPlayers, p]);
    }
  };

  const handleSubmit = async () => {
    if (selectedPlayers.length !== playerCount) {
      setError(`Debes seleccionar exactamente ${playerCount} jugador(es) para este evento.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/coach/teams/register', {
        tournamentId: tournament.id,
        eventId: event.id,
        playerIds: selectedPlayers.map((p) => p.id),
        teamName: teamName || undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el equipo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-4 py-6">
      <div className="bg-[#0d1117] border border-white/[0.08] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
          <div>
            <p className="text-white font-bold text-sm">{tournament.name}</p>
            <p className="text-white/50 text-xs mt-0.5">
              {event.skill_block} · {event.gender === 'M' ? 'Varonil' : 'Femenil'} · {event.modality}
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Fee info */}
          <div className="bg-[#ace600]/5 border border-[#ace600]/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Costo de inscripción</p>
              <p className="text-[#ace600] font-black text-xl mt-0.5">${event.fee} MXN</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Lugares disponibles</p>
              <p className="text-white font-bold text-lg mt-0.5">{event.slots_available}</p>
            </div>
          </div>

          {/* Team name (doubles only) */}
          {playerCount > 1 && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                Nombre del equipo (opcional)
              </label>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Ej: Los Halcones..."
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm focus:border-[#ace600] focus:outline-none"
              />
            </div>
          )}

          {/* Player selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
              Seleccionar jugador{playerCount > 1 ? 'es' : ''}{' '}
              <span className="text-white/30">({selectedPlayers.length}/{playerCount})</span>
            </label>

            {/* Selected players */}
            {selectedPlayers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedPlayers.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ace600]/10 border border-[#ace600]/30 rounded-full text-[#ace600] text-xs font-bold"
                  >
                    {p.full_name}
                    <button onClick={() => togglePlayer(p)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search */}
            {selectedPlayers.length < playerCount && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  placeholder="Buscar jugador por nombre..."
                  className="w-full pl-9 pr-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm focus:border-[#ace600] focus:outline-none"
                />
              </div>
            )}

            {/* Results */}
            {loadingPlayers && (
              <div className="flex items-center gap-2 mt-2 text-white/40 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando...
              </div>
            )}
            {players.length > 0 && selectedPlayers.length < playerCount && (
              <div className="mt-2 bg-[#070b0f] border border-white/[0.06] rounded-xl overflow-hidden">
                {players.map((p) => {
                  const isSelected = selectedPlayers.some((s) => s.id === p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlayer(p)}
                      className={cn(
                        'w-full px-3 py-2.5 flex items-center justify-between text-left border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors',
                        isSelected && 'opacity-50 cursor-not-allowed',
                      )}
                      disabled={isSelected}
                    >
                      <div>
                        <p className="text-white text-sm font-medium">{p.full_name}</p>
                        {p.skill_level && (
                          <p className="text-white/40 text-[10px] mt-0.5">Nivel {p.skill_level}</p>
                        )}
                      </div>
                      {!isSelected && <Plus className="w-4 h-4 text-[#ace600]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedPlayers.length !== playerCount}
              className="flex-1 py-2.5 bg-[#ace600] text-black font-bold rounded-xl text-sm hover:bg-[#b8f000] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Registrar equipo
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tournament Card
// ─────────────────────────────────────────────────────────────────────────────

function TournamentCard({
  tournament,
  onRegister,
}: {
  tournament: AvailableTournament;
  onRegister: (t: AvailableTournament, e: TournamentEvent) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const startDt = new Date(tournament.start_date);
  const deadline = tournament.registration_deadline ? new Date(tournament.registration_deadline) : null;
  const daysLeft = deadline ? Math.ceil((deadline.getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl overflow-hidden hover:border-white/[0.14] transition-colors">
      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border', typeColor(tournament.type))}>
              {typeLabel(tournament.type)}
            </span>
            <p className="text-white font-bold text-sm">{tournament.name}</p>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-white/40 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {startDt.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {tournament.location}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {tournament.events.length} evento{tournament.events.length !== 1 ? 's' : ''}
            </span>
          </div>
          {daysLeft !== null && daysLeft >= 0 && (
            <p className={cn('text-[10px] font-bold mt-1.5', daysLeft <= 3 ? 'text-red-400' : 'text-yellow-400')}>
              {daysLeft === 0 ? 'Inscripción cierra hoy' : `${daysLeft} día${daysLeft !== 1 ? 's' : ''} para inscribirse`}
            </p>
          )}
        </div>
        <div className="shrink-0 mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>
      </div>

      {/* Events list */}
      {expanded && (
        <div className="border-t border-white/[0.05] px-4 py-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Eventos disponibles</p>
          {tournament.events.length === 0 && (
            <p className="text-white/30 text-xs">No hay eventos disponibles</p>
          )}
          {tournament.events.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-2.5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">
                  {ev.skill_block} · {ev.gender === 'M' ? 'Varonil' : 'Femenil'} · {ev.modality}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-white/40">
                  <span>${ev.fee} MXN</span>
                  <span>{ev.slots_available} lugar{ev.slots_available !== 1 ? 'es' : ''}</span>
                  {ev.format && <span>{ev.format}</span>}
                </div>
              </div>
              <button
                onClick={() => onRegister(tournament, ev)}
                disabled={ev.slots_available === 0}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#ace600]/10 border border-[#ace600]/30 rounded-lg text-[#ace600] text-xs font-bold hover:bg-[#ace600]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                {ev.slots_available === 0 ? 'Lleno' : 'Inscribir'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// My Registrations Tab
// ─────────────────────────────────────────────────────────────────────────────

function MyRegistrationsTab() {
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.get<any>('/coach/teams/my-registrations');
        setRegistrations(Array.isArray(data) ? data : data.data || data.registrations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar inscripciones');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-7 h-7 text-[#ace600] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2 text-red-400 text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error}
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-2">
        <ClipboardList className="w-10 h-10 text-white/20" />
        <p className="text-white/40 font-medium">No tienes inscripciones aún</p>
        <p className="text-white/25 text-sm">Inscribe un equipo desde la pestaña de torneos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {registrations.map((reg) => (
        <div key={reg.registration_id} className="bg-[#0d1117] border border-white/[0.07] rounded-xl px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">{reg.tournamentName}</p>
              <p className="text-white/50 text-xs mt-0.5">{reg.eventName}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {reg.players.map((p) => (
                  <span key={p.id} className="px-2 py-0.5 bg-white/5 rounded-full text-white/60 text-[10px] font-medium">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="shrink-0 text-right space-y-1">
              <p className={cn('text-xs font-bold', statusColor(reg.status))}>
                {statusLabel(reg.status)}
              </p>
              {reg.payment_status === 'pending' && (
                <p className="text-yellow-400/70 text-[10px]">Pago pendiente</p>
              )}
              {reg.group && (
                <p className="text-white/40 text-[10px]">Grupo {reg.group.number}</p>
              )}
              {reg.position && (
                <p className="text-[#ace600] text-[10px] font-bold">#{reg.position}</p>
              )}
              {reg.qualified === true && (
                <p className="text-[#ace600] text-[10px] font-bold">Clasificado</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CoachTeamRegistrationPage() {
  const [tab, setTab] = useState<'available' | 'my'>('available');
  const [tournaments, setTournaments] = useState<AvailableTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'local' | 'state' | 'national'>('all');
  const [search, setSearch] = useState('');

  // Registration modal state
  const [modalTournament, setModalTournament] = useState<AvailableTournament | null>(null);
  const [modalEvent, setModalEvent] = useState<TournamentEvent | null>(null);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<any>('/coach/tournaments/available');
      setTournaments(data.tournaments || data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar torneos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleRegister = (t: AvailableTournament, e: TournamentEvent) => {
    setModalTournament(t);
    setModalEvent(e);
  };

  const handleRegistrationSuccess = () => {
    setModalTournament(null);
    setModalEvent(null);
    setSuccessMsg('¡Equipo inscrito correctamente! Revisa tus inscripciones.');
    setTimeout(() => setSuccessMsg(null), 4000);
    setTab('my');
  };

  const displayed = tournaments
    .filter((t) => filterType === 'all' || t.type === filterType)
    .filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.location.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Inscripción de Equipos</h2>
        <p className="text-white/50 text-sm mt-1">Inscribe tus jugadores en torneos disponibles</p>
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

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
        {([
          { key: 'available', label: 'Torneos disponibles', icon: Trophy },
          { key: 'my', label: 'Mis inscripciones', icon: ClipboardList },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors',
              tab === key
                ? 'bg-[#ace600]/10 border border-[#ace600]/30 text-[#ace600]'
                : 'text-white/50 hover:text-white/80',
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Available tournaments tab */}
      {tab === 'available' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar torneo o ciudad..."
                className="w-full pl-9 pr-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm focus:border-[#ace600] focus:outline-none"
              />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'local', 'state', 'national'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                    filterType === f
                      ? 'bg-[#ace600]/10 border-[#ace600]/30 text-[#ace600]'
                      : 'bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80',
                  )}
                >
                  {f === 'all' ? 'Todos' : typeLabel(f)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 text-[#ace600] animate-spin" />
            </div>
          ) : displayed.length > 0 ? (
            <div className="space-y-3">
              {displayed.map((t) => (
                <TournamentCard key={t.id} tournament={t} onRegister={handleRegister} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-2">
              <Trophy className="w-10 h-10 text-white/20" />
              <p className="text-white/40 font-medium">No hay torneos disponibles</p>
              <p className="text-white/25 text-sm">
                {search || filterType !== 'all'
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Los torneos con inscripción abierta aparecerán aquí'}
              </p>
            </div>
          )}
        </>
      )}

      {/* My registrations tab */}
      {tab === 'my' && <MyRegistrationsTab />}

      {/* Registration modal */}
      {modalTournament && modalEvent && (
        <RegisterModal
          tournament={modalTournament}
          event={modalEvent}
          onClose={() => { setModalTournament(null); setModalEvent(null); }}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
}
