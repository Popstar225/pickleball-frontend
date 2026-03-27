/**
 * Admin Payments Page
 *
 * Lets the admin configure their Stripe Connect payout account and
 * review the payment routing rules for the platform.
 */

import { Banknote, ArrowRight, Users, Building2, Trophy, MapPin, Star } from 'lucide-react';
import { ConnectAccountSetup } from '@/components/payment/ConnectAccountSetup';

const A = '#ace600';

const RouteRow = ({
  icon: Icon,
  label,
  destination,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  destination: string;
  accent?: boolean;
}) => (
  <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
    <div
      className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
      style={{
        background: accent ? 'rgba(172,230,0,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${accent ? 'rgba(172,230,0,0.15)' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: accent ? A : 'rgba(255,255,255,0.3)' }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] text-white/70 font-medium truncate">{label}</p>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <ArrowRight className="w-3 h-3 text-white/20" />
      <span
        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
        style={{
          background: accent ? 'rgba(172,230,0,0.08)' : 'rgba(255,255,255,0.04)',
          color: accent ? A : 'rgba(255,255,255,0.35)',
          border: `1px solid ${accent ? 'rgba(172,230,0,0.15)' : 'rgba(255,255,255,0.07)'}`,
        }}
      >
        {destination}
      </span>
    </div>
  </div>
);

export default function PaymentsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center"
            style={{ background: 'rgba(172,230,0,0.08)', border: '1px solid rgba(172,230,0,0.15)' }}
          >
            <Banknote className="w-4 h-4" style={{ color: A }} />
          </div>
          <h1 className="text-[18px] font-extrabold text-white tracking-tight">Gestión de Pagos</h1>
        </div>
        <p className="text-[13px] text-white/35 ml-[42px]">
          Configura tu cuenta de cobros y revisa el enrutamiento de pagos de la plataforma
        </p>
      </div>

      {/* ── Connect account setup ──────────────────────────────────────────── */}
      <div className="p-5 bg-[#06080E] border border-white/[0.08] rounded-2xl">
        <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-4">
          Tu cuenta de cobros
        </p>
        <ConnectAccountSetup userType="admin" />
      </div>

      {/* ── Payment routing map ───────────────────────────────────────────── */}
      <div className="p-5 bg-[#06080E] border border-white/[0.08] rounded-2xl">
        <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1">
          Enrutamiento de pagos
        </p>
        <p className="text-[11px] text-white/30 mb-4">
          A dónde se transfiere cada tipo de pago cuando el destinatario tiene cuenta activa
        </p>

        <RouteRow icon={Users}     label="Cuota anual de afiliación (jugador, coach, club, estado)" destination="Admin" accent />
        <RouteRow icon={Star}      label="Plan Premium (club, socio)" destination="Admin" accent />
        <RouteRow icon={MapPin}    label="Búsqueda de jugadores en mapa" destination="Admin" accent />
        <RouteRow icon={Users}     label="Licencias de entrenador" destination="Admin" accent />
        <RouteRow icon={Users}     label="Credenciales digitales" destination="Admin" accent />
        <RouteRow icon={Trophy}    label="Inscripción a torneo (anfitrión: admin o estado)" destination="Admin" accent />
        <RouteRow icon={Trophy}    label="Inscripción a torneo (anfitrión: club)" destination="Club anfitrión" />
        <RouteRow icon={Building2} label="Renta de cancha" destination="Club dueño" />
      </div>

      {/* ── Info note ────────────────────────────────────────────────────────── */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
        <p className="text-[11px] text-white/35 leading-relaxed">
          <span className="text-white/55 font-semibold">Nota: </span>
          Si el destinatario no tiene una cuenta de cobros activa en Stripe, el pago se retiene
          en la cuenta de la plataforma hasta que completen la configuración. Los clubs que
          organizan torneos o rentan canchas deben configurar su propia cuenta de cobros en la
          sección <span className="text-white/55 font-semibold">Pagos</span> de su perfil.
        </p>
      </div>
    </div>
  );
}
