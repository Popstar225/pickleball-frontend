import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users,
  Award,
  Calendar,
  DollarSign,
  Shield,
  MessageSquare,
  ChevronRight,
  Loader2,
  TrendingUp,
  ArrowUpRight,
  GraduationCap,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import {
  fetchCoachProfile,
  fetchCoachStudents,
  fetchCoachMessages,
} from '@/store/slices/coachDashboardSlice';
import { cn } from '@/lib/utils';

// ─── Atoms ────────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1 truncate">
          {label}
        </p>
        <p className={cn('text-[22px] font-bold leading-none', color)}>{value}</p>
        <p className="text-[10px] text-white/20 mt-1.5">{sub}</p>
      </div>
      <div
        className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0', bg)}
      >
        <Icon className={cn('w-4 h-4', color)} />
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  sub,
  to,
  linkLabel = 'Ver todo',
  children,
  loading,
}: {
  title: string;
  icon: React.ElementType;
  sub: string;
  to: string;
  linkLabel?: string;
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
            <Icon className="w-3.5 h-3.5 text-[#ace600]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white/80">{title}</p>
            <p className="text-[10px] text-white/25">{sub}</p>
          </div>
        </div>
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ace600]/60 hover:text-[#ace600] transition-colors"
        >
          {linkLabel} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex-1 px-5 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-28">
            <Loader2 className="w-5 h-5 text-[#ace600] animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function StudentInitials({ name }: { name: string }) {
  const letters = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[11px] font-black text-[#ace600] shrink-0 select-none">
      {letters}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CoachDashboardHome() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, students, messages, studentsLoading, messagesLoading } = useSelector(
    (s: RootState) => s.coachDashboard,
  );

  useEffect(() => {
    dispatch(fetchCoachProfile());
    dispatch(fetchCoachStudents({}));
    dispatch(fetchCoachMessages({ limit: 10 }));
  }, [dispatch]);

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Coach';
  const certLevel = profile?.certifications ?? 'Nivel 1';
  const joinDate = profile?.joinedDate
    ? new Date(profile.joinedDate).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  const QUICK_ACTIONS = [
    {
      to: '/coaches/dashboard/account',
      icon: Users,
      label: 'Gestionar Estudiantes',
      color: 'text-[#ace600]',
      bg: 'bg-[#ace600]/10 border-[#ace600]/20',
    },
    {
      to: '/coaches/dashboard/credentials',
      icon: Shield,
      label: 'Renovar NRTP',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      to: '/coaches/dashboard/messages',
      icon: MessageSquare,
      label: 'Contactar Federación',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      to: '/coaches/dashboard/payments',
      icon: DollarSign,
      label: 'Ver Ingresos',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[22px] font-bold text-white tracking-tight">
              ¡Bienvenido, {firstName}!
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
              Coach
            </span>
          </div>
          <p className="text-xs text-white/25">
            Gestiona tus estudiantes, sesiones y certificaciones
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/coaches/dashboard/messages"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold border border-white/[0.09] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Mensajes{' '}
            {(messages?.length ?? 0) > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center">
                {messages?.length}
              </span>
            )}
          </Link>
          <Link
            to="/coaches/dashboard/credentials"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_14px_rgba(172,230,0,0.18)] transition-all"
          >
            <Shield className="w-3.5 h-3.5" /> Ver Credenciales
          </Link>
        </div>
      </div>

      {/* ── NRTP certification banner ────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-sky-500/20 rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-sky-500/60 via-sky-400 to-sky-500/60" />
        <div className="flex items-center justify-between gap-4 p-5 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-bold text-white/80">Certificación NRTP</p>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Activa
                </span>
              </div>
              <p className="text-xs text-white/30">Miembro desde {joinDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-0.5">
                Nivel
              </p>
              <p className="text-lg font-black text-sky-400">{certLevel}</p>
            </div>
            <div className="w-px h-10 bg-white/[0.06] hidden sm:block" />
            <Link
              to="/coaches/dashboard/credentials"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-bold border border-sky-500/20 bg-sky-500/[0.07] text-sky-400 hover:bg-sky-500/[0.14] transition-all"
            >
              Gestionar <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard
          icon={Users}
          label="Estudiantes Activos"
          value={students?.length ?? 0}
          sub="Total"
          color="text-[#ace600]"
          bg="bg-[#ace600]/10 border-[#ace600]/20"
        />
        <StatCard
          icon={Award}
          label="Certificaciones"
          value={1}
          sub="Activas"
          color="text-sky-400"
          bg="bg-sky-500/10 border-sky-500/20"
        />
        <StatCard
          icon={Calendar}
          label="Sesiones Próximas"
          value={0}
          sub="Esta semana"
          color="text-violet-400"
          bg="bg-violet-500/10 border-violet-500/20"
        />
        <StatCard
          icon={DollarSign}
          label="Ingresos Mensuales"
          value="$0"
          sub="MXN este mes"
          color="text-emerald-400"
          bg="bg-emerald-500/10 border-emerald-500/20"
        />
      </div>

      {/* ── Students + Sessions ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Students */}
        <SectionCard
          title="Estudiantes Recientes"
          icon={Users}
          sub="Actividad reciente de tus estudiantes"
          to="/coaches/dashboard/account"
          linkLabel="Gestionar"
          loading={studentsLoading && !students?.length}
        >
          {students && students.length > 0 ? (
            <div className="space-y-1.5">
              {students.slice(0, 3).map((s: any) => {
                const fullName = `${s.firstName} ${s.lastName}`;
                const progress = 50; // placeholder
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.09] transition-all"
                  >
                    <StudentInitials name={fullName} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <p className="text-xs font-bold text-white/70 truncate">{fullName}</p>
                        <span className="text-[10px] text-white/25 shrink-0">
                          {new Date(s.joinDate).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#ace600] rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-white/25 shrink-0">
                          {progress}%
                        </span>
                      </div>
                      <p className="text-[10px] text-white/25 mt-0.5">
                        {s.level ?? 'Principiante'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-28 gap-2">
              <GraduationCap className="w-6 h-6 text-white/8" />
              <p className="text-xs text-white/20">Sin estudiantes registrados</p>
            </div>
          )}
        </SectionCard>

        {/* Upcoming Sessions */}
        <SectionCard
          title="Sesiones Próximas"
          icon={Calendar}
          sub="Tus próximas clases y entrenamientos"
          to="/coaches/dashboard/account"
          linkLabel="Ver sesiones"
        >
          <div className="flex flex-col items-center justify-center h-28 gap-2">
            <Calendar className="w-6 h-6 text-white/8" />
            <p className="text-xs text-white/20">No hay sesiones próximas programadas</p>
          </div>
        </SectionCard>
      </div>

      {/* ── Certifications ───────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
              <Award className="w-3.5 h-3.5 text-[#ace600]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white/80">Certificaciones Activas</p>
              <p className="text-[10px] text-white/25">Tus credenciales profesionales</p>
            </div>
          </div>
          <Link
            to="/coaches/dashboard/credentials"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ace600]/60 hover:text-[#ace600] transition-colors"
          >
            Gestionar <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5">
          {/* NRTP cert card */}
          <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white/75">Certificación NRTP</p>
                <p className="text-xs text-white/30">{certLevel} · USA Pickleball</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-white/20">Desde</p>
                <p className="text-xs font-semibold text-white/45">{joinDate}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Activa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick actions ────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4">
          Acciones Rápidas
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, color, bg }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col items-center justify-center gap-2.5 py-5 rounded-xl border bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.05] transition-all"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl border flex items-center justify-center transition-all group-hover:scale-105',
                  bg,
                )}
              >
                <Icon className={cn('w-4 h-4', color)} />
              </div>
              <p className="text-xs font-bold text-white/50 group-hover:text-white transition-colors text-center leading-tight px-2">
                {label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
