import { useState, useMemo } from 'react';
import {
  format,
  parseISO,
  isBefore,
  isAfter,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Trophy,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Tag,
  Building2,
  CheckCircle2,
  ExternalLink,
  X,
  Award,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';

import { tournaments, type Tournament, type TournamentStatus } from '@/data/mockData';

// ─── Types ───
interface DayInfo {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
}

type CalendarView = 'month' | 'week' | 'day' | 'list';

// ─── Status color tokens ───
const STATUS_STYLES = {
  published: {
    bg: 'bg-primary/20',
    border: 'border-primary/30',
    text: 'text-primary',
    dotBg: 'bg-primary',
    label: 'Abierto',
  },
  validated: {
    bg: 'bg-blue-400/20',
    border: 'border-blue-400/30',
    text: 'text-blue-400',
    dotBg: 'bg-blue-400',
    label: 'Validado',
  },
  completed: {
    bg: 'bg-slate-400/20',
    border: 'border-slate-400/30',
    text: 'text-slate-400',
    dotBg: 'bg-slate-400',
    label: 'Completado',
  },
  pending_validation: {
    bg: 'bg-amber-400/20',
    border: 'border-amber-400/30',
    text: 'text-amber-400',
    dotBg: 'bg-amber-400',
    label: 'Pendiente',
  },
};

const getStatusStyle = (status: TournamentStatus) =>
  STATUS_STYLES[status as keyof typeof STATUS_STYLES] || STATUS_STYLES.published;

// ─── Creator badges ───
const CREATOR_STYLES = {
  federation: { label: 'Federación', icon: Shield },
  state_committee: { label: 'Comité Estatal', icon: Award },
  club: { label: 'Club', icon: Building2 },
  partner: { label: 'Socio', icon: Sparkles },
};

const getCreatorInfo = (creator: string) =>
  CREATOR_STYLES[creator as keyof typeof CREATOR_STYLES] || CREATOR_STYLES.club;

const Tournaments = () => {
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // February 2026
  const [statusFilter, setStatusFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const states = useMemo(() => [...new Set(tournaments.map((t) => t.state))], []);

  // Filter only published/validated tournaments for public calendar
  const publicTournaments = useMemo(
    () =>
      tournaments.filter(
        (t) => t.status === 'published' || t.status === 'validated' || t.status === 'completed',
      ),
    [],
  );

  const filtered = useMemo(() => {
    return publicTournaments.filter((tournament) => {
      const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
      const matchesState = stateFilter === 'all' || tournament.state === stateFilter;
      return matchesStatus && matchesState;
    });
  }, [publicTournaments, statusFilter, stateFilter]);

  const hasActiveFilter = statusFilter !== 'all' || stateFilter !== 'all';
  const clearFilters = () => {
    setStatusFilter('all');
    setStateFilter('all');
  };

  // ── Calendar helpers ──
  const getCalendarDays = (): DayInfo[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days: DayInfo[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const getWeekDays = (): Date[] => {
    const days: Date[] = [];
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }

    return days;
  };

  const getTournamentsForDay = (date: Date) => {
    return filtered.filter((t) => {
      const start = parseISO(t.startDate);
      const end = parseISO(t.endDate);
      return (
        isSameDay(date, start) ||
        isSameDay(date, end) ||
        (isAfter(date, start) && isBefore(date, end))
      );
    });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // ── Navigation handlers ──
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      setCurrentDate(subMonths(newDate, 1));
    } else if (currentView === 'week') {
      setCurrentDate(subWeeks(newDate, 1));
    } else if (currentView === 'day') {
      setCurrentDate(subDays(newDate, 1));
    }
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      setCurrentDate(addMonths(newDate, 1));
    } else if (currentView === 'week') {
      setCurrentDate(addWeeks(newDate, 1));
    } else if (currentView === 'day') {
      setCurrentDate(addDays(newDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 1, 1));
  };

  // ── Format helpers ──
  const formatDate = (date: Date): string => {
    return format(date, 'MMMM yyyy', { locale: es });
  };

  const formatWeekRange = (startDate: Date): string => {
    const endDate = addDays(startDate, 6);
    return `${format(startDate, 'MMM d', { locale: es })} - ${format(endDate, 'MMM d, yyyy', { locale: es })}`;
  };

  // ── Count helpers for hero stats ──
  const openCount = publicTournaments.filter((t) => t.status === 'published').length;
  const featuredTournament = filtered.find((t) => t.featured);

  // ── Render Calendar Views ──
  const renderMonthView = () => {
    const days = getCalendarDays();

    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm h-full flex flex-col">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-slate-800/50 flex-shrink-0">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
            <div
              key={i}
              className="px-2 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide border-r border-slate-700/50 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 overflow-y-auto">
          {days.map((dayInfo, index) => {
            const dayTournaments = getTournamentsForDay(dayInfo.date);
            const isTodayDate = isToday(dayInfo.date);
            const isLastColumn = index % 7 === 6;
            const isLastRow = index >= days.length - 7;

            return (
              <div
                key={index}
                className={`min-h-[120px] bg-slate-900 p-2 border-r border-b border-slate-700/50 ${
                  isLastColumn ? 'border-r-0' : ''
                } ${isLastRow ? 'border-b-0' : ''} ${!dayInfo.isCurrentMonth ? 'bg-slate-800/20 opacity-50' : ''} hover:bg-slate-800/50 transition-colors cursor-pointer`}
              >
                <div
                  className={`text-sm font-medium mb-2 w-7 h-7 flex items-center justify-center rounded-full ${
                    isTodayDate ? 'bg-primary text-primary-foreground' : 'text-white'
                  }`}
                >
                  {dayInfo.day}
                </div>

                <div className="space-y-1 overflow-hidden">
                  {dayTournaments.slice(0, 2).map((tournament, idx) => {
                    const statusStyle = getStatusStyle(tournament.status);
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedTournament(tournament)}
                        className={`text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${statusStyle.bg} border-l-2 ${statusStyle.border}`}
                      >
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 flex-shrink-0 text-primary" />
                          <span className={`font-medium truncate ${statusStyle.text}`}>
                            {tournament.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {dayTournaments.length > 2 && (
                    <div className="text-xs text-slate-400 px-2 font-medium">
                      +{dayTournaments.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();

    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm h-full">
        <div className="overflow-y-auto">
          <div className="grid grid-cols-8 min-w-max">
            {/* Header */}
            <div className="bg-slate-800/50 p-3 border-r border-b border-slate-700/50 sticky top-0 z-10"></div>
            {weekDays.map((date, i) => {
              const isTodayDate = isToday(date);
              return (
                <div
                  key={i}
                  className={`bg-slate-800/50 p-3 text-center border-r border-b border-slate-700/50 last:border-r-0 sticky top-0 z-10 ${isTodayDate ? 'bg-primary/10' : ''}`}
                >
                  <div className="text-xs text-slate-400 uppercase">
                    {format(date, 'EEE', { locale: es })}
                  </div>
                  <div
                    className={`text-lg font-semibold mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                      isTodayDate ? 'bg-primary text-primary-foreground' : 'text-white'
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}

            {/* All day events row */}
            <div className="bg-slate-800/30 px-3 py-3 text-xs text-slate-400 text-right border-r border-b border-slate-700/50 font-medium">
              Todo el día
            </div>
            {weekDays.map((date, i) => {
              const dayTournaments = getTournamentsForDay(date);
              return (
                <div
                  key={i}
                  className="bg-slate-900 p-2 min-h-[80px] border-r border-b border-slate-700/50 last:border-r-0"
                >
                  {dayTournaments.map((tournament, idx) => {
                    const statusStyle = getStatusStyle(tournament.status);
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedTournament(tournament)}
                        className={`text-xs px-2 py-2 rounded mb-1 cursor-pointer hover:opacity-80 transition-opacity ${statusStyle.bg} border-l-2 ${statusStyle.border}`}
                      >
                        <div className={`font-semibold truncate ${statusStyle.text}`}>
                          {tournament.name}
                        </div>
                        <div className="text-slate-400 text-[10px] truncate">
                          {tournament.location}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayTournaments = getTournamentsForDay(currentDate);

    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm h-full flex flex-col">
        {/* Day Header */}
        <div className="bg-slate-800/50 p-6 border-b border-slate-700/50 flex-shrink-0">
          <div className="text-center">
            <div className="text-sm text-slate-400 uppercase tracking-wide">
              {format(currentDate, 'EEEE', { locale: es })}
            </div>
            <div className="text-4xl font-bold text-white mt-1">{currentDate.getDate()}</div>
            <div className="text-sm text-slate-400 mt-1">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </div>
          </div>
        </div>

        {/* Day Events */}
        <div className="overflow-y-auto flex-1 p-6">
          {dayTournaments.length > 0 ? (
            <div className="space-y-4">
              {dayTournaments.map((tournament) => {
                const statusStyle = getStatusStyle(tournament.status);
                const creatorInfo = getCreatorInfo(tournament.createdBy);

                return (
                  <div
                    key={tournament.id}
                    onClick={() => setSelectedTournament(tournament)}
                    className={`rounded-xl p-5 cursor-pointer hover:opacity-90 transition-opacity ${statusStyle.bg} border-l-4 ${statusStyle.border}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusStyle.bg} border ${statusStyle.border}`}
                      >
                        <Trophy className={`w-6 h-6 ${statusStyle.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${statusStyle.bg} ${statusStyle.text}`}
                          >
                            {statusStyle.label}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <creatorInfo.icon className="w-3 h-3" />
                            {creatorInfo.label}
                          </span>
                        </div>
                        <h4 className={`font-semibold text-lg mb-2 ${statusStyle.text}`}>
                          {tournament.name}
                        </h4>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(parseISO(tournament.startDate), 'MMM d')} -{' '}
                            {format(parseISO(tournament.endDate), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {tournament.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {tournament.currentParticipants}/{tournament.maxParticipants}
                          </span>
                        </div>
                        {tournament.prizePool && (
                          <div className="inline-flex items-center gap-1 bg-amber-400/20 border border-amber-400/30 text-amber-400 text-xs px-3 py-1 rounded">
                            <Trophy className="w-3 h-3" />
                            {tournament.prizePool}
                          </div>
                        )}
                      </div>
                      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-lime-dark transition-colors">
                        Registrar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400">No hay torneos programados para este día</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const sortedTournaments = [...filtered].sort(
      (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime(),
    );

    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm h-full flex flex-col">
        <div className="divide-y divide-slate-700/50 overflow-y-auto flex-1">
          {sortedTournaments.map((tournament) => {
            const statusStyle = getStatusStyle(tournament.status);
            const creatorInfo = getCreatorInfo(tournament.createdBy);

            return (
              <div
                key={tournament.id}
                onClick={() => setSelectedTournament(tournament)}
                className="p-5 hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Date Badge */}
                  <div
                    className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center ${statusStyle.bg}`}
                  >
                    <div className={`text-xs font-semibold ${statusStyle.text}`}>
                      {format(parseISO(tournament.startDate), 'MMM', { locale: es }).toUpperCase()}
                    </div>
                    <div className={`text-2xl font-bold ${statusStyle.text}`}>
                      {format(parseISO(tournament.startDate), 'd')}
                    </div>
                  </div>

                  {/* Tournament Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <creatorInfo.icon className="w-3 h-3" />
                        {creatorInfo.label}
                      </span>
                      {tournament.prizePool && (
                        <span className="text-xs bg-amber-400/20 border border-amber-400/30 text-amber-400 px-2 py-1 rounded">
                          {tournament.prizePool}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg text-white mb-2 hover:text-primary transition-colors">
                      {tournament.name}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" />
                        {format(parseISO(tournament.startDate), 'MMM d')} -{' '}
                        {format(parseISO(tournament.endDate), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary" />
                        {tournament.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-primary" />
                        {tournament.currentParticipants}/{tournament.maxParticipants}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                      {tournament.description}
                    </p>
                  </div>

                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-semibold hover:bg-lime-dark transition-colors flex-shrink-0">
                    Registrar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5">
      <main className="flex-1">
        {/* ═══════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════ */}
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
          {/* ambient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
              {/* Left: copy */}
              <div className="order-2 lg:order-1 space-y-6">
                <div className="inline-block">
                  <span className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-widest uppercase bg-primary/10 px-6 py-3 rounded-full border border-primary/20 backdrop-blur-sm">
                    <Trophy className="w-4 h-4" />
                    Eventos Oficiales
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  Calendario de
                  <span className="block text-primary mt-2">Torneos</span>
                </h1>

                <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed">
                  Descubre y regístrate en torneos de pickleball en todo México. Competencias
                  validadas y eventos certificados por la federación.
                </p>

                {/* quick stats row */}
                <div className="flex flex-wrap gap-4 sm:gap-6 pt-4">
                  {[
                    { value: publicTournaments.length, label: 'Torneos' },
                    { value: openCount, label: 'Abiertos' },
                    { value: states.length, label: 'Estados' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-3xl font-bold text-primary">{s.value}</div>
                      <div className="text-sm text-white/60 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <a
                    href="#schedule"
                    className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-lime-dark hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/25"
                  >
                    Ver Calendario
                    <ChevronRight className="w-5 h-5" />
                  </a>
                  <a
                    href="/create-tournament"
                    className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-white/10 backdrop-blur text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-white/90 hover:text-slate-900 transition-all duration-300 border border-white/20"
                  >
                    Crear Torneo
                  </a>
                </div>
              </div>

              {/* Right: icon card */}
              <div className="order-1 lg:order-2 relative">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary to-lime-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                    <div className="p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center gap-6">
                      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Trophy className="w-20 h-20 sm:w-24 sm:h-24 text-primary" />
                      </div>
                      <p className="text-slate-400 text-center font-semibold text-lg">
                        Competencias Oficiales
                      </p>
                      <p className="text-slate-600 text-sm text-center max-w-xs leading-relaxed">
                        Eventos validados y certificados por la Federación Mexicana
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex absolute -bottom-6 -right-6 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-xl">
                    <div className="text-3xl font-bold">{publicTournaments.length}+</div>
                    <div className="text-sm opacity-90">Torneos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="schedule"
          className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden"
        >
          {/* BG atmosphere */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-7xl mx-auto">
              {/* Section header */}
              <div className="text-center max-w-3xl mx-auto mb-8">
                <div className="inline-block mb-4">
                  <span className="text-primary text-sm font-bold uppercase tracking-wider bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                    Calendario Completo
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent mb-6">
                  Próximos Torneos
                </h2>
                <p className="text-slate-400 text-base sm:text-lg">
                  Explora todos los torneos programados y encuentra tu próxima competencia
                </p>
              </div>

              {/* Filters bar */}
              <div className="relative group mb-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-lime-500 rounded-2xl opacity-20 blur-xl" />
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                    {/* State filter */}
                    <div className="relative flex-1">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="w-full md:w-48 bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="all">Todos los Estados</option>
                        {states.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status filter */}
                    <div className="relative flex-1">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-48 bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="all">Todos los Estados</option>
                        <option value="published">Abierto</option>
                        <option value="validated">Validado</option>
                        <option value="completed">Completado</option>
                      </select>
                    </div>

                    {hasActiveFilter && (
                      <button
                        onClick={clearFilters}
                        className="px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-slate-400 hover:text-primary hover:border-primary/50 transition-colors flex items-center gap-2 w-full md:w-auto"
                      >
                        <X className="w-4 h-4" />
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule Calendar Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Calendar View Section */}
                <div className="lg:col-span-2">
                  <div className="flex flex-col h-full">
                    {/* Calendar Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePrevious}
                          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:border-primary/50 transition-colors flex items-center justify-center"
                        >
                          <ChevronLeft className="w-5 h-5 text-slate-400" />
                        </button>
                        <div className="min-w-[160px] sm:min-w-[220px] text-center">
                          <h3 className="font-semibold text-lg text-white">
                            {currentView === 'month' && formatDate(currentDate)}
                            {currentView === 'week' && formatWeekRange(getWeekDays()[0])}
                            {currentView === 'day' &&
                              format(currentDate, 'MMMM d, yyyy', { locale: es })}
                            {currentView === 'list' && 'Todos los Torneos'}
                          </h3>
                        </div>
                        <button
                          onClick={handleNext}
                          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:border-primary/50 transition-colors flex items-center justify-center"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </button>
                        <button
                          onClick={handleToday}
                          className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-primary/50 transition-colors text-slate-400 hover:text-white text-sm font-medium"
                        >
                          Hoy
                        </button>
                      </div>

                      {/* View Switcher */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentView('month')}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            currentView === 'month'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-primary/50'
                          }`}
                        >
                          Mes
                        </button>
                        <button
                          onClick={() => setCurrentView('week')}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            currentView === 'week'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-primary/50'
                          }`}
                        >
                          Semana
                        </button>
                        <button
                          onClick={() => setCurrentView('day')}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            currentView === 'day'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-primary/50'
                          }`}
                        >
                          Día
                        </button>
                        <button
                          onClick={() => setCurrentView('list')}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            currentView === 'list'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-primary/50'
                          }`}
                        >
                          Lista
                        </button>
                      </div>
                    </div>

                    {/* Render appropriate view */}
                    <div className="flex-1 min-h-[400px] sm:min-h-[600px] max-h-[800px]">
                      {currentView === 'month' && renderMonthView()}
                      {currentView === 'week' && renderWeekView()}
                      {currentView === 'day' && renderDayView()}
                      {currentView === 'list' && renderListView()}
                    </div>
                  </div>
                </div>

                {/* Upcoming Tournaments Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6 lg:top-24">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Próximos Torneos
                    </h3>
                    <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2">
                      {filtered.slice(0, 8).map((tournament) => {
                        const statusStyle = getStatusStyle(tournament.status);
                        return (
                          <div
                            key={tournament.id}
                            onClick={() => setSelectedTournament(tournament)}
                            className="group relative overflow-hidden rounded-xl cursor-pointer transition-all hover:-translate-y-1"
                          >
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-lime-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity" />
                            <div className="relative bg-slate-900 border border-slate-700/50 group-hover:border-primary/50 rounded-xl p-4 transition-all">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${statusStyle.bg} flex-shrink-0`}
                                >
                                  <div className={`text-xs font-semibold ${statusStyle.text}`}>
                                    {format(parseISO(tournament.startDate), 'MMM', {
                                      locale: es,
                                    }).toUpperCase()}
                                  </div>
                                  <div className={`text-lg font-bold ${statusStyle.text}`}>
                                    {format(parseISO(tournament.startDate), 'd')}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div
                                    className={`text-xs font-bold px-2 py-1 rounded inline-block mb-2 ${statusStyle.bg} ${statusStyle.text}`}
                                  >
                                    {statusStyle.label}
                                  </div>
                                  <h4 className="font-semibold text-white text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                    {tournament.name}
                                  </h4>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                      <MapPin className="w-3 h-3 text-primary" />
                                      <span className="truncate">{tournament.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                      <Users className="w-3 h-3 text-primary" />
                                      {tournament.currentParticipants}/{tournament.maxParticipants}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {filtered.length === 0 && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
                            <Filter className="w-8 h-8 text-slate-600" />
                          </div>
                          <p className="text-slate-400 text-sm">No se encontraron torneos</p>
                          <button
                            onClick={clearFilters}
                            className="mt-4 text-sm text-primary hover:underline"
                          >
                            Limpiar filtros
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════
          TOURNAMENT DETAIL MODAL
      ═══════════════════════════════════════════ */}
      {selectedTournament &&
        (() => {
          const statusStyle = getStatusStyle(selectedTournament.status);
          const creatorInfo = getCreatorInfo(selectedTournament.createdBy);

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedTournament(null)}
            >
              {/* backdrop */}
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

              {/* panel */}
              <div
                className="relative w-full max-w-lg sm:max-w-3xl rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-lime-500/20 to-primary/30 rounded-3xl blur-xl" />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl overflow-hidden">
                  {/* close */}
                  <button
                    onClick={() => setSelectedTournament(null)}
                    className="absolute top-4 right-4 z-[9999] w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="relative z-10">
                    {/* Image header */}
                    <div className="relative h-40 sm:h-56 md:h-64 overflow-hidden">
                      <img
                        src={selectedTournament.image}
                        alt={selectedTournament.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                      {/* badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {selectedTournament.featured && (
                          <div className="flex items-center gap-1.5 bg-amber-400/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg">
                            <Trophy className="w-3.5 h-3.5" />
                            Destacado
                          </div>
                        )}
                        <div
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border backdrop-blur-sm ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}
                        >
                          <Target className="w-3.5 h-3.5" />
                          {statusStyle.label}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 md:p-8">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg">
                            <creatorInfo.icon className="w-3.5 h-3.5" />
                            {creatorInfo.label}
                          </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">
                          {selectedTournament.name}
                        </h2>
                        <p className="text-slate-400 leading-relaxed">
                          {selectedTournament.description}
                        </p>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {[
                          {
                            Icon: CalendarIcon,
                            label: 'Fechas',
                            value: `${format(parseISO(selectedTournament.startDate), 'MMM d')} - ${format(parseISO(selectedTournament.endDate), 'MMM d, yyyy')}`,
                          },
                          {
                            Icon: MapPin,
                            label: 'Ubicación',
                            value: `${selectedTournament.venue}, ${selectedTournament.location}`,
                          },
                          {
                            Icon: Users,
                            label: 'Participantes',
                            value: `${selectedTournament.currentParticipants} / ${selectedTournament.maxParticipants}`,
                          },
                          {
                            Icon: Clock,
                            label: 'Fecha límite',
                            value: format(
                              parseISO(selectedTournament.registrationDeadline),
                              'MMM d, yyyy',
                            ),
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl p-3"
                          >
                            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                              <item.Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                              <div className="text-sm text-white font-medium break-words">
                                {item.value}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Prize pool */}
                      {selectedTournament.prizePool && (
                        <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-5 flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Bolsa de Premios</div>
                            <div className="text-2xl font-bold text-amber-400">
                              {selectedTournament.prizePool}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Categories */}
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                          <Tag className="w-4 h-4 text-primary" />
                          Categorías
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTournament.categories.map((cat, i) => (
                            <div
                              key={i}
                              className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm px-4 py-2 rounded-lg"
                            >
                              {cat}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Format & Fee */}
                      <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-slate-700/50">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Formato</div>
                          <div className="text-sm text-white font-medium">
                            {selectedTournament.format}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Cuota de Inscripción</div>
                          <div className="text-sm text-white font-medium">
                            {selectedTournament.entryFee}
                          </div>
                        </div>
                      </div>

                      {/* Validation */}
                      {selectedTournament.validatedBy && (
                        <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm text-slate-300">
                            Validado por {selectedTournament.validatedBy}
                          </span>
                        </div>
                      )}

                      {/* CTAs */}
                      <div className="flex gap-3">
                        <button className="flex-1 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all">
                          Registrarse Ahora
                        </button>
                        <button className="bg-slate-800/60 border border-slate-700/50 text-white font-semibold px-6 py-4 rounded-xl hover:border-primary/50 transition-all flex items-center gap-2">
                          Compartir
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default Tournaments;
