import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Download,
  Share2,
  ArrowRight,
  ArrowLeft,
  Trophy,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  ShieldCheck,
  ClipboardList,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RegistrationData {
  id: string;
  event: {
    id: string;
    name: string;
    skill_block: string;
    gender: string;
    modality: string;
    entry_fee: number;
  };
  player: { id: string; full_name: string; skill_level: string; email: string };
  partner: { id: string; full_name: string; skill_level: string; email: string } | null;
  entryFee: number;
  paymentStatus: string;
  status: string;
  groupId: string | null;
  registeredAt: string;
}
interface TournamentData {
  id: string;
  name: string;
  start_date: string;
  location: string;
  city: string;
  state: string;
}
interface Props {
  tournamentId: string;
  registrationId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const cn = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ');

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
      <span className="text-[11px] text-white/30">{label}</span>
      <span
        className={cn(
          'text-xs font-semibold text-right max-w-[220px] truncate',
          accent ? 'text-[#ace600]' : 'text-white/70',
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
        <Icon className="w-3.5 h-3.5 text-[#ace600]" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{title}</p>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const RegistrationConfirmationPage: React.FC<Props> = ({ tournamentId, registrationId }) => {
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const regResponse = await api.get<ApiResponse<any>>(
          `/tournaments/${tournamentId}/registrations/${registrationId}`,
        );
        const registration = (regResponse as any)?.registration;
        if (!registration?.id) {
          setError('Registration not found');
          setLoading(false);
          return;
        }
        setRegistrationData(registration);
        const tournRes = await api.get<ApiResponse<any>>(`/tournaments/${tournamentId}`);
        setTournamentData((tournRes as any)?.tournament || (tournRes as any)?.data);
      } catch (err) {
        setError('Failed to load confirmation details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tournamentId, registrationId]);

  const handleDownloadConfirmation = () => {
    if (!registrationData || !tournamentData) return;
    const content = `TOURNAMENT REGISTRATION CONFIRMATION\n\nRegistration ID: ${registrationData.id}\nTournament: ${tournamentData.name}\nPlayer: ${registrationData.player.full_name}\nEvent: ${registrationData.event.name}\nEntry Fee: $${registrationData.entryFee.toFixed(2)}\nPayment Status: ${registrationData.paymentStatus.toUpperCase()}`;
    const el = document.createElement('a');
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    el.setAttribute('download', `registration-${registrationId}.txt`);
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  const handleShare = () => {
    if (!registrationData || !tournamentData) return;
    const shareText = `I've registered for ${tournamentData.name}! Event: ${registrationData.event.name}. Registration ID: ${registrationData.id}`;
    if (navigator.share) {
      navigator.share({ title: 'Tournament Registration', text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#080c10]">
        <div className="w-5 h-5 rounded-full border-2 border-[#ace600]/30 border-t-[#ace600] animate-spin" />
      </div>
    );
  }

  // ── Error ──
  if (error || !registrationData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#080c10] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white/10" />
        </div>
        <p className="text-sm text-white/30">{error || 'Confirmation not found'}</p>
        <button
          onClick={() => navigate('/tournaments')}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#ace600]/60 hover:text-[#ace600] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a torneos
        </button>
      </div>
    );
  }

  const tournamentDate = tournamentData
    ? new Date(tournamentData.start_date).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'TBD';
  const tournamentLocation = tournamentData
    ? `${tournamentData.location}, ${tournamentData.city}`
    : 'TBD';

  return (
    <div className="min-h-screen bg-[#080c10] py-10 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        {/* ── Back ────────────────────────────────────────────────────────*/}
        <button
          onClick={() => navigate('/tournaments')}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/25 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a torneos
        </button>

        {/* ── Success hero ────────────────────────────────────────────────*/}
        <div className="bg-[#0d1117] border border-emerald-500/20 rounded-2xl px-6 py-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-[22px] font-bold text-white tracking-tight mb-1">
            ¡Registro confirmado!
          </h1>
          <p className="text-xs text-white/30 leading-relaxed">
            Todo listo para el torneo. Revisa tu correo para los detalles de confirmación.
          </p>
        </div>

        {/* ── Registration ID ─────────────────────────────────────────────*/}
        <div className="bg-[#0d1117] border border-[#ace600]/20 rounded-2xl px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1.5">
            ID de registro
          </p>
          <p className="font-mono text-lg font-bold text-[#ace600] truncate">
            {registrationData.id}
          </p>
          <p className="text-[10px] text-white/20 mt-1">Guarda este ID para tus registros</p>
        </div>

        {/* ── Tournament details ──────────────────────────────────────────*/}
        <Section title="Detalles del torneo" icon={Trophy}>
          <Row label="Torneo" value={tournamentData?.name || 'TBD'} />
          <Row label="Evento" value={registrationData.event.name} />
          <Row label="Modalidad" value={registrationData.event.modality} />
          <Row label="Nivel" value={registrationData.event.skill_block} />
          <Row label="Jugador" value={registrationData.player.full_name} />
          {registrationData.partner && (
            <Row label="Pareja" value={registrationData.partner.full_name} />
          )}
        </Section>

        {/* ── Schedule & payment ──────────────────────────────────────────*/}
        <Section title="Fecha y pago" icon={Calendar}>
          <Row label="Fecha" value={tournamentDate} />
          <Row label="Ubicación" value={tournamentLocation} />
          <Row label="Cuota" value={`$${registrationData.entryFee.toFixed(2)}`} accent />
          <Row
            label="Pago"
            value={
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {registrationData.paymentStatus.charAt(0).toUpperCase() +
                  registrationData.paymentStatus.slice(1)}
              </span>
            }
          />
        </Section>

        {/* ── Reminders ───────────────────────────────────────────────────*/}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Información importante
            </p>
          </div>
          <ul className="px-5 py-4 space-y-2.5">
            {[
              'Llega al menos 15 minutos antes de tu horario',
              'Trae una identificación oficial con foto',
              'Usa calzado deportivo adecuado para cancha',
              'Trae tus propias paletas si el torneo lo requiere',
              'Revisa la asignación de grupos 24 horas antes',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                </span>
                <span className="text-[11px] text-white/35 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Actions ─────────────────────────────────────────────────────*/}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownloadConfirmation}
            className="inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-[11px] font-bold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Descargar
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-[11px] font-bold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white transition-all"
          >
            <Share2 className="w-3.5 h-3.5" /> Compartir
          </button>
        </div>

        <button
          onClick={() => navigate('/players/dashboard/registrations')}
          className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold bg-[#ace600] hover:bg-[#bdf200] text-black transition-all shadow-[0_0_16px_rgba(172,230,0,0.2)]"
        >
          Ver mis registros <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RegistrationConfirmationPage;
