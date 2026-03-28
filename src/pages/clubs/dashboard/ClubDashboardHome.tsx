import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Trophy,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  MessageSquare,
  UserPlus,
  Loader2,
  ArrowRight,
  TrendingUp,
  X,
  Bell,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import {
  fetchClubProfile,
  fetchClubMembers,
  fetchClubEvents,
  fetchClubStatistics,
} from '@/store/slices/clubDashboardSlice';

// ─── Status badge atoms ───────────────────────────────────────────────────────
function MemberBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const active = status === 'active';
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
        active
          ? 'bg-emerald-500/10 text-emerald-400 border-eerald-500/20'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      }`}
    >
      {active ? t('club_dashboard.home.status_active') : t('club_dashboard.home.status_pending')}
    </span>
  );
}

function EventBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const registered = status === 'registered';
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
        registered
          ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
          : 'bg-white/[0.06] text-white/40 border-white/[0.08]'
      }`}
    >
      {registered ? t('club_dashboard.home.status_registered') : t('club_dashboard.home.status_preparing')}
    </span>
  );
}

// ─── Welcome notification ─────────────────────────────────────────────────────
const DISMISSED_KEY = 'fedmex_welcome_dismissed';

function WelcomeNotification() {
  const [dismissed, setDismissed] = useState(() => !!sessionStorage.getItem(DISMISSED_KEY));

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="relative flex gap-4 rounded-2xl border border-[#ace600]/25 bg-[#ace600]/[0.05] px-5 py-4 pr-10">
      {/* icon */}
      <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-xl border border-[#ace600]/20 bg-[#ace600]/10 flex items-center justify-center">
        <Bell className="w-4 h-4 text-[#ace600]" />
      </div>

      {/* content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white mb-1.5">
          ¡Bienvenido a la FEDMEX Pickleball!
        </p>
        <p className="text-[13px] text-white/55 leading-relaxed">
          Antes de empezar, es necesario que rellenes algunos campos básicos de
          información de tu club. Por favor, ve al menú y dale clic en{' '}
          <span className="text-white/80 font-semibold">"Mi cuenta"</span>, ahí
          rellena los campos de{' '}
          <span className="text-white/80">identidad</span>,{' '}
          <span className="text-white/80">contacto</span> y{' '}
          <span className="text-white/80">ubicación</span>. Luego dale en guardar.
        </p>
        <Link
          to="/clubs/dashboard/account"
          className="inline-flex items-center gap-1.5 mt-3 h-8 px-4 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold transition-all"
        >
          Ir a Mi cuenta <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* dismiss */}
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClubDashboardHome() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, stats: clubStats, members, events, membersLoading, eventsLoading, profileLoading } = useSelector(
    (state: RootState) => state.clubDashboard,
  );

  useEffect(() => {
    dispatch(fetchClubProfile());
    dispatch(fetchClubStatistics());
    dispatch(fetchClubMembers({ limit: 5 }));
    dispatch(fetchClubEvents());
  }, [dispatch]);

  // Show welcome notification only when the fetch is done and no club exists yet
  const showWelcome = !profileLoading && !profile;

  const stats = [
    {
      label: t('club_dashboard.home.stat_total_members'),
      value: clubStats?.totalMembers ?? profile?.memberCount ?? 0,
      sub: t('club_dashboard.home.stat_active_members_sub', { n: clubStats?.activeMembers ?? 0 }),
      icon: Users,
      color: 'text-sky-400',
      accent: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      label: t('club_dashboard.home.stat_tournaments'),
      value: profile?.totalTournaments ?? 0,
      sub: t('club_dashboard.home.stat_upcoming_sub', { n: clubStats?.upcomingTournaments ?? 0 }),
      icon: Trophy,
      color: 'text-[#ace600]',
      accent: 'bg-[#ace600]/10 border-[#ace600]/20',
    },
    {
      label: t('club_dashboard.home.stat_revenue'),
      value: `$${(clubStats?.monthlyRevenue ?? 0).toLocaleString()}`,
      sub: t('club_dashboard.home.stat_revenue_sub'),
      icon: DollarSign,
      color: 'text-emerald-400',
      accent: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: t('club_dashboard.home.stat_courts'),
      value: clubStats?.totalCourts ?? 0,
      sub: t('club_dashboard.home.stat_courts_sub'),
      icon: AlertCircle,
      color: 'text-amber-400',
      accent: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  const quickActions = [
    { to: '/clubs/dashboard/members', icon: Users, label: t('club_dashboard.home.action_manage_members') },
    { to: '/clubs/dashboard/tournaments', icon: Trophy, label: t('club_dashboard.home.action_create_tournament') },
    { to: '/clubs/dashboard/messages', icon: MessageSquare, label: t('club_dashboard.home.action_view_messages') },
    { to: '/clubs/dashboard/payments', icon: DollarSign, label: t('club_dashboard.home.action_view_payments') },
  ];

  return (
    <div className="space-y-6 p-1">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('club_dashboard.home.title')}</h1>
          <p className="text-sm text-white/35 mt-0.5">{t('club_dashboard.home.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/clubs/dashboard/members"
            className="flex items-center gap-2 h-9 px-4 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-semibold transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {t('club_dashboard.home.add_member')}
          </Link>
          <Link
            to="/clubs/dashboard/tournaments"
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold transition-all shadow-[0_0_16px_rgba(172,230,0,0.18)] hover:shadow-[0_0_24px_rgba(172,230,0,0.3)]"
          >
            <Trophy className="w-3.5 h-3.5" />
            {t('club_dashboard.home.create_tournament')}
          </Link>
        </div>
      </div>

      {/* ── Welcome notification ────────────────────────────────────────────── */}
      {showWelcome && <WelcomeNotification />}

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, sub, icon: Icon, color, accent }) => (
          <div key={label} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                {label}
              </p>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${accent}`}
              >
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold leading-none ${color}`}>{value}</p>
            <p className="text-[11px] text-white/25 mt-1.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Recent members + Upcoming events ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Members */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/25" />
              <span className="text-sm font-semibold text-white/60">{t('club_dashboard.home.recent_members')}</span>
            </div>
            <Link
              to="/clubs/dashboard/members"
              className="flex items-center gap-1 text-[11px] text-white/30 hover:text-[#ace600] transition-colors font-semibold"
            >
              {t('club_dashboard.home.view_all')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {membersLoading && !members?.length ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-[#ace600] animate-spin" />
              </div>
            ) : members && members.length > 0 ? (
              members.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-xs font-bold text-white/40 flex-shrink-0">
                      {(member.firstName?.[0] ?? '?').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white/75 truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-[11px] text-white/25">
                        {member.joinDate
                          ? new Date(member.joinDate).toLocaleDateString('en-US')
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <MemberBadge status={member.membershipStatus} />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-6 h-6 text-white/15 mb-2" />
                <p className="text-xs text-white/25">Sin miembros registrados</p>
              </div>
            )}
          </div>
        </div>

        {/* Events */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-white/25" />
              <span className="text-sm font-semibold text-white/60">Próximos Torneos</span>
            </div>
            <Link
              to="/clubs/dashboard/tournaments"
              className="flex items-center gap-1 text-[11px] text-white/30 hover:text-[#ace600] transition-colors font-semibold"
            >
              Gestionar <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {eventsLoading && !events?.length ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-[#ace600] animate-spin" />
              </div>
            ) : events && events.length > 0 ? (
              events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#ace600]/[0.07] border border-[#ace600]/15 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-3.5 h-3.5 text-[#ace600]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white/75 truncate">{event.title}</p>
                      <p className="text-[11px] text-white/25">
                        {event.date ? new Date(event.date).toLocaleDateString('en-US') : '—'}
                        {event.type ? ` · ${event.type}` : ''}
                      </p>
                    </div>
                  </div>
                  <EventBadge status={event.status} />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="w-6 h-6 text-white/15 mb-2" />
                <p className="text-xs text-white/25">Sin eventos próximos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-3.5 h-3.5 text-white/25" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
            Acciones Rápidas
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col items-center gap-2.5 py-5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all text-center"
            >
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] group-hover:border-[#ace600]/25 group-hover:bg-[#ace600]/[0.07] flex items-center justify-center transition-all">
                <Icon className="w-4 h-4 text-white/35 group-hover:text-[#ace600] transition-colors" />
              </div>
              <span className="text-xs font-semibold text-white/40 group-hover:text-white/70 transition-colors leading-tight px-2">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
