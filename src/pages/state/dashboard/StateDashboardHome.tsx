import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import {
  Users, Building, Trophy, Calendar, TrendingUp,
  AlertCircle, MessageSquare, BarChart3, BookOpen,
  MapPin, Loader2, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import {
  fetchStateStatistics,
  fetchStateActivities,
  fetchUpcomingEvents,
} from '@/store/slices/stateDashboardSlice';
import { cn } from '@/lib/utils';

// ─── Config ───────────────────────────────────────────────────────────────────
const ACTIVITY_TYPE_CFG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  tournament: { icon: Trophy,   color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  club:       { icon: Building, color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20' },
  member:     { icon: Users,    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

const ACTIVITY_STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  completed: { label: 'Completado', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  pending:   { label: 'Pendiente',  cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       dot: 'bg-amber-400 animate-pulse' },
  active:    { label: 'Activo',     cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20',             dot: 'bg-sky-400' },
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-6 h-6 rounded-md bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3 text-[#ace600]" />
      </div>
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30">{children}</span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const c = ACTIVITY_STATUS_CFG[status] ?? ACTIVITY_STATUS_CFG.active;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0', c.cls)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  );
}

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="w-5 h-5 text-[#ace600] animate-spin" />
    </div>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <Card className="bg-[#0d1117] border-white/[0.07] rounded-2xl">
      <CardContent className="flex items-center justify-center py-12">
        <p className="text-xs text-white/20">{text}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StateDashboardHome() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    stats, activities, upcomingEvents,
    statsLoading, statsError, activitiesLoading, eventsLoading,
  } = useSelector((s: RootState) => s.stateDashboard);

  useEffect(() => {
    dispatch(fetchStateStatistics());
    dispatch(fetchStateActivities({ limit: 10, offset: 0 }));
    dispatch(fetchUpcomingEvents({ limit: 10 }));
  }, [dispatch]);

  const STATS = stats ? [
    { icon: Users,        label: 'Miembros Totales',  value: stats.totalMembers ?? 0,       sub: 'Miembros activos',        color: 'text-[#ace600]',    bg: 'bg-[#ace600]/10 border-[#ace600]/20' },
    { icon: Building,     label: 'Clubes Activos',    value: stats.activeClubs ?? 0,         sub: 'Clubes afiliados',        color: 'text-sky-400',      bg: 'bg-sky-500/10 border-sky-500/20' },
    { icon: Trophy,       label: 'Torneos este Año',  value: stats.tournamentsThisYear ?? 0, sub: 'Torneos realizados',      color: 'text-amber-400',    bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: Calendar,     label: 'Eventos Próximos',  value: stats.upcomingEvents ?? 0,      sub: 'Por venir',               color: 'text-violet-400',   bg: 'bg-violet-500/10 border-violet-500/20' },
    { icon: TrendingUp,   label: 'Crecimiento',       value: `${stats.membershipGrowth ?? 0}%`, sub: 'Crecimiento año actual',color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: MessageSquare,label: 'Mensajes',          value: stats.messagesUnread ?? 0,      sub: 'Sin leer',                color: 'text-rose-400',     bg: 'bg-rose-500/10 border-rose-500/20' },
  ] : [];

  const QUICK_ACTIONS = [
    { to: '/state/dashboard/statistics', icon: BarChart3,  label: 'Ver Estadísticas',   color: 'text-[#ace600]',    bg: 'bg-[#ace600]/10 border-[#ace600]/20' },
    { to: '/state/dashboard/members',    icon: Users,      label: 'Gestionar Miembros', color: 'text-sky-400',      bg: 'bg-sky-500/10 border-sky-500/20' },
    { to: '/state/dashboard/clubs',      icon: Building,   label: 'Gestionar Clubes',   color: 'text-violet-400',   bg: 'bg-violet-500/10 border-violet-500/20' },
    { to: '/state/dashboard/events',     icon: Calendar,   label: 'Crear Evento',        color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Panel de estatal</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
            Estatal
          </span>
        </div>
        <p className="text-xs text-white/25">
          Bienvenido al panel de administración de la federación estatal
        </p>
      </div>

      {/* ── Statistics ──────────────────────────────────────────────────────── */}
      <div>
        <SectionHeading icon={BarChart3}>Estadísticas Generales</SectionHeading>

        {statsLoading && !stats ? <LoadingBlock /> : statsError ? (
          <Card className="bg-red-500/[0.06] border-red-500/15 rounded-2xl">
            <CardContent className="flex items-start gap-3 pt-5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400 mb-0.5">Error al cargar estadísticas</p>
                <p className="text-xs text-red-400/60">{statsError}</p>
              </div>
            </CardContent>
          </Card>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {STATS.map(({ icon: Icon, label, value, sub, color, bg }) => (
              <Card key={label} className="bg-[#0d1117] border-white/[0.07] rounded-2xl">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1 truncate">{label}</p>
                    <p className={cn('text-[22px] font-bold leading-none', color)}>{value}</p>
                    <p className="text-[10px] text-white/20 mt-1.5 truncate">{sub}</p>
                  </div>
                  <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0', bg)}>
                    <Icon className={cn('w-4 h-4', color)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>

      {/* ── Recent Activities ────────────────────────────────────────────────── */}
      <div>
        <SectionHeading icon={BookOpen}>Actividades Recientes</SectionHeading>

        {activitiesLoading && !activities?.length ? <LoadingBlock /> :
         activities?.length > 0 ? (
          <div className="space-y-2">
            {activities.map((activity: any) => {
              const t = ACTIVITY_TYPE_CFG[activity.type] ?? ACTIVITY_TYPE_CFG.member;
              const Icon = t.icon;
              return (
                <Card key={activity.id}
                  className="bg-[#0d1117] border-white/[0.07] rounded-2xl hover:border-white/[0.12] transition-all">
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5', t.bg)}>
                      <Icon className={cn('w-4 h-4', t.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/75 truncate">{activity.title}</p>
                      <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{activity.description}</p>
                      <p className="text-[10px] text-white/20 mt-1.5">
                        {new Date(activity.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <StatusPill status={activity.status} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
         ) : <EmptyBlock text="No hay actividades recientes" />}
      </div>

      {/* ── Upcoming Events ─────────────────────────────────────────────────── */}
      <div>
        <SectionHeading icon={Calendar}>Próximos Eventos</SectionHeading>

        {eventsLoading && !upcomingEvents?.length ? <LoadingBlock /> :
         upcomingEvents?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingEvents.map((event: any) => (
              <Card key={event.id}
                className="bg-[#0d1117] border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all">
                {/* Accent bar */}
                <div className="h-0.5 bg-gradient-to-r from-[#ace600]/60 via-[#ace600]/30 to-transparent" />
                <CardHeader className="px-4 pt-4 pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white/80 truncate">{event.title}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 border-sky-500/20 text-sky-400 shrink-0">
                      {event.type}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pt-3 pb-4 space-y-2">
                  <div className="flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-2 text-[11px] text-white/30">
                      <Calendar className="w-3 h-3 text-white/20 shrink-0" />
                      {event.date ? new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                    </span>
                    <span className="inline-flex items-center gap-2 text-[11px] text-white/30">
                      <MapPin className="w-3 h-3 text-white/20 shrink-0" />
                      {event.location || '—'}
                    </span>
                    <span className="inline-flex items-center gap-2 text-[11px] text-white/30">
                      <Users className="w-3 h-3 text-white/20 shrink-0" />
                      {event.participants ?? 0} participantes esperados
                    </span>
                  </div>
                  <Link to={`/state/dashboard/events/${event.id}`}
                    className="flex items-center justify-center gap-1.5 w-full h-8 rounded-xl text-xs font-bold border border-white/[0.09] bg-white/[0.04] hover:bg-white/[0.08] text-white/45 hover:text-white transition-all mt-1">
                    Ver Detalles <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
         ) : <EmptyBlock text="No hay eventos próximos" />}
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <div>
        <SectionHeading icon={Trophy}>Acciones Rápidas</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, color, bg }) => (
            <Link key={to} to={to}>
              <Card className="bg-[#0d1117] border-white/[0.07] rounded-2xl hover:border-white/[0.14] hover:bg-white/[0.03] transition-all cursor-pointer group">
                <CardContent className="flex flex-col items-center justify-center gap-2.5 py-5 px-3">
                  <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center transition-all group-hover:scale-105', bg)}>
                    <Icon className={cn('w-4 h-4', color)} />
                  </div>
                  <p className="text-xs font-bold text-white/50 group-hover:text-white transition-colors text-center leading-tight">
                    {label}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}