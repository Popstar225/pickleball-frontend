import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Building2, Trophy, ShieldCheck, UserPlus, DollarSign,
  Loader2, type LucideIcon, TrendingUp, AlertTriangle, Clock,
  ArrowRight, CheckCircle2, Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  DashboardStatsResponse, AdminUsersResponse,
  PendingActionsResponse, User, PendingAction,
} from "@/types/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardStats {
  total_users: number; 
  total_clubs: number; 
  total_tournaments: number;
  total_revenue: number; 
  active_memberships: number;
  new_users_this_month: number; 
  upcoming_tournaments: number; 
  pending_payments: number;
  pending_verifications?: number;
  verified_users?: number;
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Initials({ name }: { name: string }) {
  const letters = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[10px] font-black text-[#ace600] shrink-0 select-none">
      {letters || '?'}
    </div>
  );
}

function SectionHeading({ icon: Icon, label, iconColor, iconBg }: {
  icon: LucideIcon; label: string; iconColor: string; iconBg: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.05]">
      <div className={cn('w-6 h-6 rounded-lg border flex items-center justify-center shrink-0', iconBg)}>
        <Icon className={cn('w-3 h-3', iconColor)} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/25">{label}</p>
    </div>
  );
}

// ─── Translation maps ──────────────────────────────────────────────────────────
const ACTION_TYPE_ES: Record<string, string> = {
  'Club Approval':        'Aprobación de Clubes',
  'User Verification':    'Verificación de Usuarios',
  'Payment Disputes':     'Disputas de Pago',
  'Announcements':        'Anuncios',
};

const ACTION_DESC_ES: Record<string, string> = {
  'Clubs awaiting approval':        'Clubes esperando aprobación',
  'Users need verification':        'Usuarios necesitan verificación',
  'Payment issues to resolve':      'Problemas de pago por resolver',
  'Pending announcements to send':  'Anuncios pendientes de enviar',
};

const PRIORITY_ES: Record<string, string> = {
  'High':   'Alto',
  'Medium': 'Medio',
  'Low':    'Bajo',
};

const USER_TYPE_ES: Record<string, string> = {
  'admin':       'Administrador',
  'player':      'Jugador',
  'club':        'Club',
  'coach':       'Entrenador',
  'state':       'Estado',
  'organizer':   'Organizador',
  'partner':     'Socio',
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const navigate = useNavigate();
  const [stats,          setStats]          = useState<DashboardStats | null>(null);
  const [recentUsers,    setRecentUsers]    = useState<User[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const statsRes = await api.get<DashboardStatsResponse>("/admin/dashboard");
        if (statsRes?.success && statsRes?.data) setStats(statsRes.data);

        const usersRes = await api.get<AdminUsersResponse>(`/admin/users?limit=5&page=1&is_verified=false`);
        if (usersRes?.success && Array.isArray(usersRes.data)) setRecentUsers(usersRes.data);

        const pendingRes = await api.get<PendingActionsResponse>("/admin/pending-actions");
        if (pendingRes?.success && Array.isArray(pendingRes.data?.actions))
          setPendingActions(pendingRes.data.actions);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || "Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
      <p className="text-xs text-white/20">Cargando panel…</p>
    </div>
  );

  const pendingVerifications = pendingActions.find(a => a.type === "User Verification");

  const statCards = [
    {
      label: "Jugadores",
      value: stats?.total_users || 0,
      icon: Users,
      color: 'text-[#ace600]',
      iconBg: 'bg-[#ace600]/10 border-[#ace600]/20',
      glow: 'shadow-[0_0_14px_rgba(172,230,0,0.10)]',
      accent: 'from-[#ace600]/30 via-[#ace600]/15 to-transparent',
    },
    {
      label: "Clubes",
      value: stats?.total_clubs || 0,
      icon: Building2,
      color: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      glow: '',
      accent: 'from-sky-400/25 via-sky-400/12 to-transparent',
    },
    {
      label: "Torneos Activos",
      value: stats?.upcoming_tournaments || 0,
      icon: Trophy,
      color: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      glow: '',
      accent: 'from-amber-400/25 via-amber-400/12 to-transparent',
    },
    {
      label: "Verificaciones Pendientes",
      value: pendingVerifications?.count || 0,
      icon: ShieldCheck,
      color: 'text-red-400',
      iconBg: 'bg-red-500/10 border-red-500/20',
      glow: '',
      accent: 'from-red-400/25 via-red-400/12 to-transparent',
    },
    {
      label: "Nuevos este Mes",
      value: stats?.new_users_this_month || 0,
      icon: UserPlus,
      color: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      glow: '',
      accent: 'from-emerald-400/25 via-emerald-400/12 to-transparent',
    },
    {
      label: "Ingresos Totales",
      value: `$${(stats?.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-violet-400',
      iconBg: 'bg-violet-500/10 border-violet-500/20',
      glow: '',
      accent: 'from-violet-400/25 via-violet-400/12 to-transparent',
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <h1 className="text-[22px] font-black text-white tracking-tight">Bienvenido</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
            <Zap className="w-2.5 h-2.5" /> Administración
          </span>
        </div>
        <p className="text-xs text-white/25">
          Resumen general de FedMex Pickleball
        </p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map(({ label, value, icon: Icon, color, iconBg, glow, accent }) => (
          <div key={label}
            className={cn(
              'relative bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all',
              glow,
            )}>
            {/* Accent bar */}
            <div className={cn('h-0.5 bg-gradient-to-r', accent)} />
            <div className="px-4 py-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 leading-tight">
                  {label}
                </p>
                <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center shrink-0', iconBg)}>
                  <Icon className={cn('w-3.5 h-3.5', color)} />
                </div>
              </div>
              <p className={cn('text-2xl font-black leading-none', color)}>
                {typeof value === 'string' ? value : value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Lower panels ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Recent registrations */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <SectionHeading icon={UserPlus} label="Registros Recientes" iconColor="text-emerald-400" iconBg="bg-emerald-500/10 border-emerald-500/20" />

          <div className="divide-y divide-white/[0.04]">
            {recentUsers.length > 0 ? (
              recentUsers.map((user, i) => (
                <div key={i} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <Initials name={user.full_name || user.username || '?'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white/70 group-hover:text-white transition-colors truncate">
                      {user.full_name || user.username}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 capitalize mt-0.5">
                      {USER_TYPE_ES[user.user_type] ?? user.user_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] text-white/20">
                      <Clock className="w-2.5 h-2.5" />
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                        : '—'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider bg-amber-500/10 border-amber-500/20 text-amber-400">
                      <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                      Pendiente
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <CheckCircle2 className="w-8 h-8 text-white/8" />
                <p className="text-xs text-white/20">No hay registros recientes</p>
              </div>
            )}
          </div>

          {recentUsers.length > 0 && (
            <div className="px-5 py-3 border-t border-white/[0.05]">
              <button onClick={() => navigate('/admin/dashboard/players')} className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-white/25 hover:text-[#ace600] transition-colors">
                Ver todos los usuarios <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Pending actions */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <SectionHeading icon={ShieldCheck} label="Acciones Pendientes" iconColor="text-red-400" iconBg="bg-red-500/10 border-red-500/20" />

          <div className="divide-y divide-white/[0.04]">
            {pendingActions.length > 0 ? (
              pendingActions.map(action => {
                const isHigh = action.priority === 'High';
                return (
                  <div key={action.id} className="group flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    {/* Priority indicator */}
                    <div className={cn(
                      'w-8 h-8 rounded-xl border flex items-center justify-center shrink-0',
                      isHigh ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20',
                    )}>
                      <AlertTriangle className={cn('w-3.5 h-3.5', isHigh ? 'text-red-400' : 'text-amber-400')} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white/70 group-hover:text-white transition-colors truncate">
                        {ACTION_TYPE_ES[action.type] ?? action.type}
                      </p>
                      <p className="text-[10px] text-white/25 truncate mt-0.5">{ACTION_DESC_ES[action.description] ?? action.description}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className={cn(
                        'text-xs font-black',
                        isHigh ? 'text-red-400' : 'text-amber-400',
                      )}>
                        {action.count} pendiente{action.count !== 1 ? 's' : ''}
                      </p>
                      <span className={cn(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider mt-0.5',
                        isHigh
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                      )}>
                        <span className={cn('w-1 h-1 rounded-full', isHigh ? 'bg-red-400' : 'bg-amber-400 animate-pulse')} />
                        {PRIORITY_ES[action.priority] ?? action.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/20" />
                <p className="text-xs text-white/20">Sin acciones pendientes</p>
                <p className="text-[10px] text-white/12">Todo al día ✓</p>
              </div>
            )}
          </div>

          {pendingActions.length > 0 && (
            <div className="px-5 py-3 border-t border-white/[0.05]">
              <button className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-white/25 hover:text-[#ace600] transition-colors">
                Gestionar verificaciones <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}