import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StateAutocomplete } from '@/components/ui/StateAutocomplete';
import { EventRegistrationModal } from '@/components/tournament/EventRegistrationModal';
import { WaitlistInfoPanel } from '@/components/tournament/WaitlistInfoPanel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  AlertTriangle,
  Clock,
  Loader2,
  Star,
  X,
  RefreshCw,
  SlidersHorizontal,
  Crown,
  Medal,
  ChevronRight,
  Search,
  Zap,
} from 'lucide-react';
import { Mexico } from '@/constants/constants';
import { api } from '@/lib/api';
import type { RootState } from '@/store';
import { cn } from '@/lib/utils';

// STATUS CONFIG
const statusCfg: Record<string, { label: string; cls: string; dot: string }> = {
  open: {
    label: 'Inscripciones Abiertas',
    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  full: { label: 'Lleno', cls: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-500' },
  closed: {
    label: 'Cerrado',
    cls: 'bg-white/[0.05] text-white/35 border-white/[0.08]',
    dot: 'bg-white/25',
  },
  registered: {
    label: 'Registrado',
    cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    dot: 'bg-sky-500 animate-pulse',
  },
  waitlist: {
    label: 'Lista de Espera',
    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'Completado',
    cls: 'bg-white/[0.04] text-white/30 border-white/[0.07]',
    dot: 'bg-white/20',
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusCfg[status] ?? {
    label: status,
    cls: 'bg-white/[0.05] text-white/35 border-white/[0.08]',
    dot: 'bg-white/25',
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0',
        cfg.cls,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </Badge>
  );
}

function Countdown({ date }: { date: string }) {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  if (days <= 0)
    return (
      <span className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
        Iniciado
      </span>
    );
  if (days === 1)
    return (
      <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
        Mañana
      </span>
    );
  if (days <= 7)
    return (
      <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-full px-2 py-0.5">
        En {days} días
      </span>
    );
  if (days <= 30)
    return (
      <span className="text-[11px] font-bold text-white/40 bg-white/[0.05] border border-white/[0.08] rounded-full px-2 py-0.5">
        En {Math.floor(days / 7)} sem.
      </span>
    );
  return (
    <span className="text-[11px] font-bold text-white/30 bg-white/[0.04] border border-white/[0.07] rounded-full px-2 py-0.5">
      En {Math.floor(days / 30)} meses
    </span>
  );
}

function MetaItem({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-white/35 min-w-0">
      <Icon className="w-3 h-3 shrink-0 text-white/20" />
      <span className="truncate">{children}</span>
    </div>
  );
}

function CapacityBar({ current, max }: { current: number; max: number }) {
  if (!max) return null;
  const pct = Math.min(Math.round((current / max) * 100), 100);
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
          Capacidad
        </span>
        <span className="text-[10px] font-mono text-white/30">
          {current}/{max} · {pct}%
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-[#ace600]',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
      <p className="text-xs text-white/25">Cargando torneos…</p>
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-400">Error al cargar torneos</p>
        <p className="text-xs text-red-400/60 mt-0.5">{msg}</p>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <Trophy className="w-7 h-7 text-white/10" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white/40 mb-1">{title}</p>
        <p className="text-xs text-white/20 max-w-[280px] leading-relaxed">{desc}</p>
      </div>
      {action}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge
      variant="outline"
      className="gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]"
    >
      {label}
      <button onClick={onRemove} className="hover:opacity-60 transition-opacity">
        <X className="w-3 h-3" />
      </button>
    </Badge>
  );
}

const selectCls = cn(
  'h-9 rounded-xl text-xs bg-white/[0.04] border-white/[0.08] text-white/60 focus:ring-0 focus:border-[#ace600]/50 data-[state=open]:border-[#ace600]/50 transition-all',
);

export default function PlayerTournamentsPage() {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);

  const [activeTab, setActiveTab] = useState('upcoming');
  const [allTournaments, setAllTournaments] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingReg, setLoadingReg] = useState<string | null>(null);
  const [loadingUnreg, setLoadingUnreg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'level' | 'participants'>('date');
  const [showFilters, setShowFilters] = useState(false);

  // Registration modal state
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventSelector, setShowEventSelector] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all published tournaments for players
        const res = await api.get<any>('/tournaments?status=published');
        let data = res.data as any;
        if (data?.data && Array.isArray(data.data)) data = data.data;
        const tours = Array.isArray(data) ? data : [];
        setAllTournaments(tours);
        setFiltered(tours);
        if (user?.id) {
          try {
            const rRes = await api.get<any>(`/players/${user.id}/registrations`);
            setMyRegistrations(Array.isArray(rRes?.registrations) ? rRes.registrations : []);
            console.log('Loaded tournaments:', rRes.registrations);
          } catch {
            setMyRegistrations([]);
          }
        }
      } catch {
        setError('Error al cargar torneos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    let f = [...allTournaments];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.venue_name?.toLowerCase().includes(q) ||
          t.city?.toLowerCase().includes(q),
      );
    }
    if (filterState) f = f.filter((t) => t.state === filterState);
    if (filterLevel !== 'all') f = f.filter((t) => t.tournament_level === filterLevel);
    f.sort((a, b) => {
      if (sortBy === 'date')
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      if (sortBy === 'level')
        return (a.tournament_level || '').localeCompare(b.tournament_level || '');
      return (b.current_events || 0) - (a.current_events || 0);
    });
    setFiltered(f);
  }, [search, filterState, filterLevel, sortBy, allTournaments]);

  const clearFilters = () => {
    setSearch('');
    setFilterState('');
    setFilterLevel('all');
    setSortBy('date');
  };
  const hasFilters = !!(search || filterState || filterLevel !== 'all');

  const handleRegister = (tournament: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedTournament(tournament);
    // Fetch events and show selector
    fetchTournamentEvents(tournament.id);
  };

  const fetchTournamentEvents = async (tournamentId: string) => {
    try {
      const response = await api.get<any>(`/tournaments/${tournamentId}/events`);
      const events = Array.isArray(response)
        ? response
        : Array.isArray((response as any).events)
          ? (response as any).events
          : [];
      console.log('---------------------------', (prev: any) => ({ ...prev, events }));
      // Store events and show selector for player to choose
      setSelectedTournament((prev: any) => ({ ...prev, events }));
      setShowEventSelector(true);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const handleEventSelected = (event: any) => {
    setSelectedEvent(event);
    setShowEventSelector(false);
    setRegistrationModalOpen(true);
  };

  const handleRegistrationSuccess = (registrationId: string, status: 'confirmed' | 'waitlist') => {
    // Refresh my registrations
    if (user?.id) {
      const load = async () => {
        try {
          const rRes = await api.get<any>(`/players/${user.id}/registrations`);
          setMyRegistrations(Array.isArray(rRes.data) ? rRes.data : []);
        } catch {
          setMyRegistrations([]);
        }
      };
      load();
    }

    // Show success message based on status
    if (status === 'confirmed') {
      navigate(`/tournaments/${selectedTournament.id}/register/${registrationId}/payment`, {
        state: { automated: true },
      });
    } else {
      setActiveTab('my-tournaments');
    }
  };

  const handleUnregister = async (regId: string) => {
    if (!user) return;
    setLoadingUnreg(regId);
    try {
      await api.delete(`/tournaments/registrations/${regId}`);
      const res = await api.get<any>(`/players/${user.id}/registrations`);
      setMyRegistrations(Array.isArray(res.data?.registrations) ? res.data.registrations : []);
    } catch {
      /* handle */
    } finally {
      setLoadingUnreg(null);
    }
  };

  const openCount = allTournaments.filter((t) => t.registrations_open).length;

  const triggerCls = cn(
    'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all',
    'data-[state=active]:bg-[#ace600] data-[state=active]:text-black data-[state=active]:shadow-[0_0_12px_rgba(172,230,0,0.18)]',
    'data-[state=inactive]:text-white/35 data-[state=inactive]:hover:text-white/60',
  );

  return (
    <div className="space-y-6 p-1">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Torneos</h1>
            <Badge
              variant="outline"
              className="gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse inline-block shrink-0" />
              Aprobados
            </Badge>
          </div>
          <p className="text-xs text-white/30">
            Torneos publicados y verificados por la federación
          </p>
        </div>
        <div className="flex items-center gap-5 sm:gap-6">
          {[
            { label: 'Disponibles', value: openCount, color: 'text-emerald-400' },
            { label: 'Inscritos', value: myRegistrations.length, color: 'text-[#ace600]' },
            { label: 'Total', value: allTournaments.length, color: 'text-white/40' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={cn('text-2xl font-bold leading-none mb-0.5', color)}>{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto p-1 gap-1 rounded-2xl bg-[#0d1117] border border-white/[0.07] w-full sm:w-auto inline-flex">
          <TabsTrigger value="upcoming" className={triggerCls}>
            <Trophy className="w-3.5 h-3.5" /> Próximos
            {filtered.length > 0 && (
              <span className="ml-0.5 text-[10px] px-1.5 py-px rounded-full bg-black/20">
                {filtered.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-tournaments" className={triggerCls}>
            <Star className="w-3.5 h-3.5" /> Mis Torneos
            {myRegistrations.length > 0 && (
              <span className="ml-0.5 text-[10px] px-1.5 py-px rounded-full bg-black/20">
                {myRegistrations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className={triggerCls}>
            <Clock className="w-3.5 h-3.5" /> Historial
          </TabsTrigger>
        </TabsList>

        {/* ━━━ UPCOMING ━━━ */}
        <TabsContent value="upcoming" className="mt-5 space-y-4 focus-visible:outline-none">
          {/* Filter panel */}
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, venue o ciudad…"
                className="pl-9 pr-9 h-10 rounded-xl text-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-[#ace600]/50 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters((v) => !v)}
                className={cn(
                  'h-9 px-3.5 rounded-xl text-xs font-semibold gap-1.5 transition-all',
                  showFilters
                    ? 'border-[#ace600]/40 bg-[#ace600]/10 text-[#ace600] hover:bg-[#ace600]/15'
                    : 'border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/[0.06]',
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filtros{' '}
                {showFilters && <X className="w-3 h-3" />}
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                  Ordenar
                </span>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className={cn(selectCls, 'w-[130px]')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl">
                    {[
                      ['date', 'Fecha'],
                      ['level', 'Nivel'],
                      ['participants', 'Participantes'],
                    ].map(([v, l]) => (
                      <SelectItem
                        key={v}
                        value={v}
                        className="text-white/70 focus:bg-white/[0.06] focus:text-white text-xs"
                      >
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/[0.05]">
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5 block">
                    Estado
                  </Label>
                  <StateAutocomplete
                    value={filterState}
                    onChange={setFilterState}
                    placeholder="Seleccionar estado..."
                    className="h-10 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5 block">
                    Nivel
                  </Label>
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className={cn(selectCls, 'w-full')}>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl">
                      {[
                        ['all', 'Todos'],
                        ['Beginner', 'Principiante'],
                        ['Intermediate', 'Intermedio'],
                        ['Advanced', 'Avanzado'],
                        ['Professional', 'Profesional'],
                      ].map(([v, l]) => (
                        <SelectItem
                          key={v}
                          value={v}
                          className="text-white/70 focus:bg-white/[0.06] focus:text-white text-xs"
                        >
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.04]">
              <span className="text-xs text-white/25">
                <span className="font-semibold text-white/50">{filtered.length}</span> torneos
                encontrados
              </span>
              {hasFilters && (
                <div className="flex flex-wrap items-center gap-1.5 ml-2">
                  {search && <FilterChip label={`"${search}"`} onRemove={() => setSearch('')} />}
                  {filterState && (
                    <FilterChip
                      label={Mexico.find((s) => s.code === filterState)?.state || filterState}
                      onRemove={() => setFilterState('')}
                    />
                  )}
                  {filterLevel !== 'all' && (
                    <FilterChip label={filterLevel} onRemove={() => setFilterLevel('all')} />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 px-2 text-[11px] text-white/25 hover:text-white/50 hover:bg-transparent gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Limpiar todo
                  </Button>
                </div>
              )}
            </div>
          </div>

          {loading && <Loading />}
          {error && !loading && <ErrorBanner msg={error} />}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState
              title={hasFilters ? 'Ningún torneo coincide' : 'No hay torneos publicados'}
              desc={
                hasFilters
                  ? 'Intenta ajustar los filtros para ver más opciones.'
                  : 'Los torneos necesitan ser aprobados y publicados antes de estar disponibles. Vuelve pronto.'
              }
              action={
                hasFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs text-[#ace600] hover:text-[#ace600] hover:bg-[#ace600]/10 gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" /> Limpiar filtros
                  </Button>
                ) : undefined
              }
            />
          )}

          {!loading &&
            filtered.map((t: any) => {
              const isOpen = !!t.registrations_open;
              console.log('Tournament', t, 'open:', isOpen, 'reg open:', t.registrations_open);
              return (
                <div
                  key={t.id}
                  className="group relative bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.13] transition-all duration-200"
                >
                  {isOpen && <div className="h-px w-full bg-[#ace600]" />}
                  <div className="p-5 sm:p-6">
                    <div className="flex gap-4">
                      <div className="shrink-0 pt-0.5">
                        <Avatar className="h-12 w-12 rounded-2xl border border-white/[0.08]">
                          <AvatarImage src={t.image_url} alt={t.name} className="object-cover" />
                          <AvatarFallback className="rounded-2xl bg-[#ace600]/[0.08] text-[#ace600] text-xs font-bold border-0">
                            {t.name
                              ?.split(' ')
                              .slice(0, 2)
                              .map((w: string) => w[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                            <h3 className="text-base font-bold text-white/80 group-hover:text-white transition-colors leading-snug">
                              {t.name}
                            </h3>
                            {t.is_endorsed && (
                              <Badge
                                variant="outline"
                                className="gap-1 text-[9px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shrink-0"
                              >
                                ✓ Verificado
                              </Badge>
                            )}
                            <StatusBadge status={isOpen ? 'open' : 'closed'} />
                            <Countdown date={t.start_date} />
                          </div>
                          <div className="hidden sm:flex gap-2 shrink-0">
                            <Button
                              onClick={() => {
                                setLoadingReg(t.id);
                                handleRegister(t);
                              }}
                              disabled={!isOpen || loadingReg === t.id}
                              size="sm"
                              className={cn(
                                'h-8 px-3.5 rounded-xl text-xs font-bold gap-1.5 transition-all',
                                isOpen && loadingReg !== t.id
                                  ? 'bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)]'
                                  : 'bg-white/[0.04] border border-white/[0.06] text-white/20 cursor-not-allowed hover:bg-white/[0.04]',
                              )}
                            >
                              {loadingReg === t.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Cargando…
                                </>
                              ) : isOpen ? (
                                <>
                                  Inscribirme <ChevronRight className="w-3 h-3" />
                                </>
                              ) : (
                                'Cerrado'
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/tournaments/${t.id}`)}
                              className="h-8 px-3.5 rounded-xl text-xs border-white/[0.08] bg-transparent hover:bg-white/[0.05] text-white/35 hover:text-white/70 transition-all gap-1.5"
                            >
                              Detalles <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {t.description && (
                          <p className="text-xs text-white/30 mb-3 line-clamp-2 leading-relaxed">
                            {t.description}
                          </p>
                        )}
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-1.5 mb-4">
                          <MetaItem icon={Calendar}>
                            {new Date(t.start_date).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            –{' '}
                            {new Date(t.end_date).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </MetaItem>
                          <MetaItem icon={MapPin}>
                            {t.location || t.venue_name || 'Por determinar'}
                          </MetaItem>
                          <MetaItem icon={Trophy}>{t.tournament_type || '—'}</MetaItem>
                          <MetaItem icon={Users}>{t.events?.length || 0} eventos</MetaItem>
                        </div>
                        {t.max_participants > 0 && (
                          <div className="mb-4">
                            <CapacityBar
                              current={t.current_participants || 0}
                              max={t.max_participants}
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex flex-wrap gap-1.5">
                            {t.age_restrictions && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/30">
                                Edad: {t.age_restrictions}
                              </span>
                            )}
                            {t.gender_restrictions && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/30">
                                {t.gender_restrictions}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1.5 sm:hidden">
                            <Button
                              onClick={() => {
                                setLoadingReg(t.id);
                                handleRegister(t);
                              }}
                              disabled={!isOpen || loadingReg === t.id}
                              size="sm"
                              className={cn(
                                'h-8 px-3 rounded-xl text-xs font-bold transition-all',
                                isOpen && loadingReg !== t.id
                                  ? 'bg-[#ace600] text-black'
                                  : 'bg-white/[0.04] text-white/20 border border-white/[0.06]',
                              )}
                            >
                              {loadingReg === t.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                </>
                              ) : isOpen ? (
                                'Inscribirse'
                              ) : (
                                'Cerrado'
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/tournaments/${t.id}`)}
                              className="h-8 px-3 rounded-xl text-xs border-white/[0.08] text-white/30 hover:text-white/60 transition-all"
                            >
                              Info
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </TabsContent>

        {/* ━━━ MY TOURNAMENTS ━━━ */}
        <TabsContent value="my-tournaments" className="mt-5 space-y-3 focus-visible:outline-none">
          {loading && <Loading />}
          {!loading && myRegistrations.length === 0 && (
            <EmptyState
              title="No tienes registros activos"
              desc="Aún no estás inscrito en ningún torneo. Explora los torneos disponibles."
              action={
                <Button
                  size="sm"
                  onClick={() => setActiveTab('upcoming')}
                  className="h-9 px-4 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold gap-1.5 shadow-[0_0_12px_rgba(172,230,0,0.15)]"
                >
                  <Trophy className="w-3.5 h-3.5" /> Explorar Torneos
                </Button>
              }
            />
          )}
          {myRegistrations.map((reg: any) => (
            <div
              key={reg.id}
              className="group flex items-center gap-4 p-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl hover:border-white/[0.12] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <p className="text-sm font-semibold text-white/75 truncate group-hover:text-white transition-colors">
                    {reg.event?.name}
                  </p>
                  <StatusBadge status={reg.status === 'confirmed' ? 'registered' : reg.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <MetaItem icon={Calendar}>
                    {new Date(reg.registeredAt || '').toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </MetaItem>
                  <MetaItem icon={Trophy}>{reg.event?.modality || 'Individual'}</MetaItem>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnregister(reg.id)}
                  disabled={loadingUnreg === reg.id}
                  className="h-8 px-3 rounded-xl text-xs border-red-500/20 bg-red-500/[0.05] hover:bg-red-500/[0.1] text-red-400 hover:text-red-300 gap-1.5 transition-all"
                >
                  {loadingUnreg === reg.id ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Cancelando…
                    </>
                  ) : (
                    'Cancelar'
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 rounded-xl text-xs border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-white/40 hover:text-white transition-all"
                >
                  Detalles
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ━━━ HISTORY ━━━ */}
        <TabsContent value="history" className="mt-5 focus-visible:outline-none">
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="h-px bg-white/[0.05]" />
            <div className="p-8 flex flex-col items-center text-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#ace600]/[0.07] border border-[#ace600]/15 flex items-center justify-center">
                <Clock className="w-7 h-7 text-[#ace600]/50" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white/60 mb-1">Historial de Torneos</h3>
                <p className="text-sm text-white/25 max-w-[340px] leading-relaxed">
                  Aquí aparecerán los torneos completados. Una vez que termines una competencia,
                  podrás ver tus resultados.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
                {[
                  {
                    icon: Crown,
                    label: 'Posiciones finales',
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/10 border-amber-500/15',
                  },
                  {
                    icon: Star,
                    label: 'Premios ganados',
                    color: 'text-[#ace600]',
                    bg: 'bg-[#ace600]/10 border-[#ace600]/15',
                  },
                  {
                    icon: Zap,
                    label: 'Estadísticas',
                    color: 'text-sky-400',
                    bg: 'bg-sky-500/10 border-sky-500/15',
                  },
                ].map(({ icon: Icon, label, color, bg }) => (
                  <div
                    key={label}
                    className={cn('flex items-center gap-2 p-3 rounded-xl border', bg)}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', color)} />
                    <span className="text-xs font-semibold text-white/40">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* EVENT SELECTOR MODAL */}
      {showEventSelector && selectedTournament && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 p-6 border-b border-white/[0.05] bg-[#0d1117]/95 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Selecciona un Evento</h2>
                  <p className="text-sm text-white/50 mt-1">{selectedTournament.name}</p>
                </div>
                <button
                  onClick={() => setShowEventSelector(false)}
                  className="text-white/40 hover:text-white/80 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {selectedTournament.events && selectedTournament.events.length > 0 ? (
                selectedTournament.events.map((event: any) => {
                  const isFull = event.current_participants >= event.max_participants;
                  const capacityPercent = Math.round(
                    (event.current_participants / event.max_participants) * 100,
                  );

                  return (
                    <button
                      key={event.id}
                      onClick={() => handleEventSelected(event)}
                      className={cn(
                        'w-full p-4 rounded-lg border transition-all text-left',
                        'hover:border-white/[0.12] bg-white/[0.02]',
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-white">
                            {event.skill_block} -{' '}
                            {event.gender === 'M'
                              ? 'Hombres'
                              : event.gender === 'F'
                                ? 'Mujeres'
                                : 'Mixto'}{' '}
                            -{' '}
                            {event.modality === 'Singles'
                              ? 'Individuales'
                              : event.modality === 'Doubles'
                                ? 'Dobles'
                                : 'Dobles Mixto'}
                          </p>
                          <p className="text-xs text-white/50 mt-1">
                            Cuota: ${event.entry_fee || 50}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            'shrink-0',
                            isFull
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                          )}
                        >
                          {isFull ? 'Lleno' : 'Abierto'}
                        </Badge>
                      </div>

                      {/* Capacity Bar */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-[10px] text-white/30">Capacidad</span>
                          <span className="text-[10px] text-white/50">
                            {event.current_participants}/{event.max_participants} ·{' '}
                            {capacityPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              capacityPercent >= 100
                                ? 'bg-red-500'
                                : capacityPercent >= 80
                                  ? 'bg-amber-500'
                                  : 'bg-[#ace600]',
                            )}
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-white/50">
                    No hay eventos disponibles para este torneo.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/[0.05]">
              <Button
                variant="outline"
                onClick={() => setShowEventSelector(false)}
                className="w-full border-white/[0.08] text-white/60 hover:text-white"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EVENT REGISTRATION MODAL */}
      <EventRegistrationModal
        open={registrationModalOpen}
        onOpenChange={setRegistrationModalOpen}
        event={selectedEvent}
        tournamentId={selectedTournament?.id || ''}
        onRegistrationSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}
