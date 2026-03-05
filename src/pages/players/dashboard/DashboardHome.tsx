import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Building2,
  CreditCard,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import {
  fetchPlayerProfile,
  fetchPlayerTournaments,
  fetchPlayerMessages,
} from '@/store/slices/playerDashboardSlice';
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
  children,
  loading,
}: {
  title: string;
  icon: React.ElementType;
  sub: string;
  to: string;
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
          Ver todo <ChevronRight className="w-3.5 h-3.5" />
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

const tournamentStatus: Record<string, { label: string; cls: string; dot: string }> = {
  completed: {
    label: 'Completado',
    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  registered: {
    label: 'Próximo',
    cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    dot: 'bg-sky-400 animate-pulse',
  },
  pending: {
    label: 'Pendiente',
    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PlayerDashboardHome() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, tournaments, messages, profileLoading, tournamentsLoading, messagesLoading } =
    useSelector((s: RootState) => s.playerDashboard);

  useEffect(() => {
    dispatch(fetchPlayerProfile());
    dispatch(fetchPlayerTournaments());
    dispatch(fetchPlayerMessages({ limit: 10 }));
  }, [dispatch]);

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Jugador';

  const QUICK_ACTIONS = [
    {
      to: '/players/dashboard/tournaments',
      icon: Trophy,
      label: 'Buscar Torneos',
      color: 'text-[#ace600]',
      bg: 'bg-[#ace600]/10 border-[#ace600]/20',
    },
    {
      to: '/players/dashboard/clubs',
      icon: Building2,
      label: 'Mis Clubes',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      to: '/players/dashboard/credentials',
      icon: CreditCard,
      label: 'Credencial',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      to: '/players/dashboard/account',
      icon: Users,
      label: 'Mi Cuenta',
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
              Activo
            </span>
          </div>
          <p className="text-xs text-white/25">
            Gestiona tu cuenta, credenciales y participa en torneos
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/players/dashboard/credentials"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold border border-white/[0.09] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" /> Ver Credencial
          </Link>
          <Link
            to="/players/dashboard/tournaments"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_14px_rgba(172,230,0,0.18)] transition-all"
          >
            <Trophy className="w-3.5 h-3.5" /> Buscar Torneos
          </Link>
        </div>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard
          icon={Trophy}
          label="Torneos Jugados"
          value={tournaments?.length ?? 0}
          sub="+2 este mes"
          color="text-[#ace600]"
          bg="bg-[#ace600]/10 border-[#ace600]/20"
        />
        <StatCard
          icon={Building2}
          label="Clubes Afiliado"
          value={profile?.club_id ? 1 : 0}
          sub="Clubes activos"
          color="text-sky-400"
          bg="bg-sky-500/10 border-sky-500/20"
        />
        <StatCard
          icon={MessageSquare}
          label="Mensajes"
          value={messages?.length ?? 0}
          sub="Sin leer"
          color="text-amber-400"
          bg="bg-amber-500/10 border-amber-500/20"
        />
        <StatCard
          icon={CreditCard}
          label="Credencial"
          value={
            <span className="text-emerald-400 text-[15px] font-black tracking-wide">ACTIVA</span>
          }
          sub="Credencial federated"
          color="text-emerald-400"
          bg="bg-emerald-500/10 border-emerald-500/20"
        />
      </div>

      {/* ── Tournaments + Messages ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tournaments */}
        <SectionCard
          title="Torneos Recientes"
          icon={Trophy}
          sub="Tu historial de torneos"
          to="/players/dashboard/tournaments"
          loading={tournamentsLoading && !tournaments?.length}
        >
          {tournaments && tournaments.length > 0 ? (
            <div className="space-y-1.5">
              {tournaments.slice(0, 4).map((t: any) => {
                const s = tournamentStatus[t.status] ?? tournamentStatus.pending;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.09] transition-all"
                  >
                    <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/70 truncate">
                        {t.tournamentName}
                      </p>
                      <p className="text-[10px] text-white/25 truncate">{t.category}</p>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider shrink-0',
                        s.cls,
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-28 gap-2">
              <Trophy className="w-6 h-6 text-white/8" />
              <p className="text-xs text-white/20">Sin torneos registrados</p>
            </div>
          )}
        </SectionCard>

        {/* Messages */}
        <SectionCard
          title="Mensajes Recientes"
          icon={MessageSquare}
          sub="Clubes y federación"
          to="/players/dashboard/messages"
          loading={messagesLoading && !messages?.length}
        >
          {messages && messages.length > 0 ? (
            <div className="space-y-1.5">
              {messages.slice(0, 4).map((m: any) => (
                <div
                  key={m.id}
                  className="flex gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.09] transition-all"
                >
                  <div className="w-1.5 shrink-0 flex items-start pt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ace600]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-xs font-bold text-white/70 truncate">{m.senderName}</p>
                      <span className="text-[9px] text-white/20 shrink-0">
                        {new Date(m.date).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/30 line-clamp-1 leading-relaxed">
                      {m.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-28 gap-2">
              <MessageSquare className="w-6 h-6 text-white/8" />
              <p className="text-xs text-white/20">Sin mensajes</p>
            </div>
          )}
        </SectionCard>
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
              className={cn(
                'group flex flex-col items-center justify-center gap-2.5 py-5 rounded-xl border transition-all',
                'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.05]',
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl border flex items-center justify-center transition-all group-hover:scale-105',
                  bg,
                )}
              >
                <Icon className={cn('w-4.5 h-4.5', color)} />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-white/55 group-hover:text-white transition-colors">
                  {label}
                </p>
              </div>
              <ArrowUpRight className="w-3 h-3 text-white/10 group-hover:text-white/30 transition-colors absolute top-3 right-3 hidden group-hover:block" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
