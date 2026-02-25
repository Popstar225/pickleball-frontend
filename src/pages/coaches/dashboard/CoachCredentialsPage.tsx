import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchMyCoachCredential, createCoachCredential } from '@/store/slices/coachDashboardSlice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  QrCode,
  Shield,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Trophy,
  Star,
  Calendar,
  User,
  Zap,
  RefreshCcw,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import Federation from '@/assets/images/international-federation.png';
import MXFlag from '@/assets/images/flag/MX.png';
import FederationLogo from '@/assets/images/Logos/Logo pickleball compressed.png';
import IpfLogo from '@/assets/images/Logos/IPF.png';
import conadeLogo from '@/assets/images/Logos/conade-logo.png';

import { getFullImageUrl } from '@/common/tools';

/* ─── Keyframe-only styles (cannot be done in Tailwind) ─────── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  @keyframes blobDrift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(28px,20px) scale(1.06); }
  }
  @keyframes cardIn {
    from { opacity:0; transform: translateY(36px) rotateX(8deg); }
    to   { opacity:1; transform: translateY(0) rotateX(0); }
  }
  @keyframes shimmerSweep {
    0%   { background-position: 160% 160%; }
    100% { background-position: -60% -60%; }
  }
  @keyframes barFlow {
    0%   { background-position: 0% 0%; }
    100% { background-position: 300% 0%; }
  }
  @keyframes statusPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.6; transform:scale(0.75); }
  }
  @keyframes ntprGrow { to { transform: scaleX(1); } }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* Font assignments */
  .font-bebas  { font-family: 'Bebas Neue', sans-serif; }
  .font-outfit { font-family: 'Outfit', sans-serif; }
  .font-jetbrains { font-family: 'JetBrains Mono', monospace; }

  /* Complex animated gradients */
  .card-topbar {
    height: 5px;
    background: linear-gradient(90deg, #00b248, #00e676, #69f0ae, #00e676, #00b248);
    background-size: 300% 100%;
    animation: barFlow 3.5s linear infinite;
  }
  .card-bottombar {
    height: 4px;
    background: linear-gradient(90deg, #00b248, #69f0ae, #00b248);
    background-size: 300%;
    animation: barFlow 3.5s linear infinite;
  }
  .holo-shimmer {
    position: absolute; inset: 0; z-index: 20; pointer-events: none; border-radius: 22px;
    background: linear-gradient(
      115deg, transparent 22%,
      rgba(0,255,140,0.04) 36%, rgba(100,255,190,0.09) 50%,
      rgba(0,255,140,0.04) 64%, transparent 78%
    );
    background-size: 260% 260%;
    animation: shimmerSweep 5s linear infinite;
  }
  .holo-card {
    animation: cardIn 0.9s cubic-bezier(0.16,1,0.3,1) both;
    transform-style: preserve-3d;
  }
  .holo-card:hover {
    box-shadow:
      0 0 0 1px rgba(0,230,118,0.22),
      0 36px 90px rgba(0,0,0,0.85),
      0 0 90px rgba(0,230,118,0.12);
  }
  .status-dot { animation: statusPulse 2s ease infinite; }

  /* Bars */
  .ntpr-bar {
    transform-origin: left; transform: scaleX(0);
    animation: ntprGrow 1.3s cubic-bezier(0.16,1,0.3,1) 0.4s both;
  }
  .vig-bar {
    transform-origin: left; transform: scaleX(0);
    animation: ntprGrow 1.3s cubic-bezier(0.16,1,0.3,1) 0.5s both;
  }

  /* Panel stagger */
  .panel-d1 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.08s both; }
  .panel-d2 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.16s both; }
  .panel-d3 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.24s both; }
  .panel-d4 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.32s both; }

  /* Blobs */
  .blob-1 { animation: blobDrift 14s ease-in-out infinite alternate; }
  .blob-2 { animation: blobDrift 18s ease-in-out infinite alternate-reverse; }

  /* Diagonal hatching on fed header */
  .fed-header-hatch::before {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(
      -45deg, transparent, transparent 8px,
      rgba(0,0,0,0.05) 8px, rgba(0,0,0,0.05) 9px
    );
  }

  /* Renewing spin */
  .spin { animation: spin 1s linear infinite; }
`;

/* ─── Holographic Card ──────────────────────────────────────── */
function HoloCard({ credential }: { credential: any }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = ((e.clientX - r.left) / r.width - 0.5) * 14;
      const dy = ((e.clientY - r.top) / r.height - 0.5) * -9;
      el.style.transform = `rotateY(${dx}deg) rotateX(${dy}deg)`;
    };
    const onLeave = () => {
      el.style.transform = 'rotateY(0) rotateX(0)';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const isActive = credential.affiliation_status === 'active';
  const statusColor = isActive ? '#00e676' : '#f44336';
  const statusBg = isActive
    ? 'linear-gradient(90deg,#1a5c2a,#236b33,#1a5c2a)'
    : 'linear-gradient(90deg,#5c1a1a,#6b2323,#5c1a1a)';
  const statusText = isActive ? 'CERTIFICADO ACTIVO' : 'INACTIVO';

  return (
    <div
      ref={ref}
      className="holo-card relative w-full max-w-[340px] rounded-[22px] overflow-hidden cursor-default transition-[transform,box-shadow] duration-200"
      style={{
        background: 'linear-gradient(160deg, #071a0e 0%, #0c2417 55%, #071308 100%)',
        border: '1px solid rgba(0,230,118,0.2)',
        boxShadow:
          '0 0 0 1px rgba(0,230,118,0.04), 0 28px 70px rgba(0,0,0,0.75), 0 0 70px rgba(0,230,118,0.07)',
      }}
    >
      <div className="holo-shimmer" />
      <div className="card-topbar" />

      {/* 1. Federation header */}
      <div
        className="fed-header-hatch relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a5c2a 0%, #236b33 45%, #1a5c2a 100%)' }}
      >
        <div className="relative z-10 flex flex-col items-center gap-1.5 px-4 pt-3.5 pb-2.5">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-11 h-11 rounded-full bg-black/25 border border-white/30 flex items-center justify-center text-[22px] shadow-md">
              🏆
            </div>
            <div
              className="font-bebas text-base text-center text-white leading-[1.1]"
              style={{ letterSpacing: '3px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
            >
              LICENCIA DE
              <br />
              ENTRENADOR
              <br />
              CERTIFICADO
            </div>
            <div className="w-11 h-11 rounded-full bg-black/25 border border-white/30 flex items-center justify-center text-[22px] shadow-md">
              🏆
            </div>
          </div>
          <div
            className="font-bebas text-[#1a5c2a] bg-white text-[13px] px-5 py-1 rounded-sm shadow-md"
            style={{ letterSpacing: '5px' }}
          >
            CIUDAD DE MÉXICO
          </div>
        </div>
      </div>

      {/* 2. Photo zone */}
      <div className="relative h-[210px] overflow-hidden">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.45) saturate(0.8)' }}
          src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&q=70"
          alt=""
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #0d3020 0%, #041008 100%)' }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,230,118,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.04) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        {/* Role label */}
        <div
          className="font-outfit absolute top-3 left-0 right-0 text-center text-[9px] font-bold text-white/70 uppercase"
          style={{ letterSpacing: '5px', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
        >
          ENTRENADOR REGISTRADO
        </div>
        {/* Photo ring */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] rounded-xl overflow-hidden flex items-center justify-center text-[48px]"
          style={{
            border: '2.5px solid rgba(255,255,255,0.85)',
            background: '#1a3a22',
            boxShadow: '0 4px 24px rgba(0,0,0,0.6), 0 0 0 5px rgba(255,255,255,0.07)',
          }}
        >
          {credential?.user?.profile_photo ? (
            <img
              src={getFullImageUrl(credential.user.profile_photo)}
              alt="coach"
              className="w-full h-full object-cover"
            />
          ) : (
            '👨‍🏫'
          )}
        </div>
        {/* Name overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 text-center pb-2.5 pt-8 px-3.5"
          style={{
            background:
              'linear-gradient(0deg, rgba(6,30,14,0.96) 0%, rgba(6,30,14,0.7) 60%, transparent 100%)',
          }}
        >
          <div
            className="font-bebas text-base text-white"
            style={{ letterSpacing: '2px', textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
          >
            {credential.coach_name}
          </div>
        </div>
      </div>

      {/* 3. Status band */}
      <div
        className="font-bebas flex items-center justify-center gap-2 px-3 py-[7px] text-base text-white"
        style={{ background: statusBg, letterSpacing: '6px' }}
      >
        <span
          className="status-dot w-[7px] h-[7px] rounded-full"
          style={{ background: statusColor }}
        />
        {statusText}
      </div>

      {/* 4. Credential ID */}
      <div
        className="font-jetbrains text-center py-[7px] px-3.5 text-[rgba(200,230,210,0.8)] text-[14px]"
        style={{
          background: '#0d1f13',
          letterSpacing: '4px',
          borderTop: '1px solid rgba(0,230,118,0.08)',
          borderBottom: '1px solid rgba(0,230,118,0.08)',
        }}
      >
        {credential.credential_number || credential.id}
      </div>

      {/* 5. Logos row */}
      <div
        className="flex items-center justify-around px-5 py-3"
        style={{
          background: 'rgba(255,255,255,0.97)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <img src={IpfLogo} alt="IPF" className="w-[50px] h-[50px] object-contain" />
        <img src={FederationLogo || Federation} alt="Federation" className="w-20 h-[50px]" />
        <img src={conadeLogo} alt="CONADE" className="w-[50px] h-[50px] object-contain" />
      </div>

      {/* 6. State band */}
      <div
        className="font-bebas text-center py-2 px-3.5 text-base text-white"
        style={{
          background: 'linear-gradient(90deg, #1a5c2a, #236b33, #1a5c2a)',
          letterSpacing: '6px',
        }}
      >
        {credential.state_affiliation || 'N/A'}
      </div>

      {/* 7. QR section */}
      <div className="bg-white flex flex-col items-center gap-3 px-5 pt-4 pb-3">
        <div className="flex flex-col items-center gap-2">
          <div className="p-2 bg-white border-2 border-[#e0e0e0] rounded-lg shadow-md">
            {credential.qr_code_url ? (
              <img
                src={getFullImageUrl(credential.qr_code_url)}
                alt="QR Code"
                className="block w-[250px] h-[250px]"
              />
            ) : (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${credential.verification_code}&margin=4&color=000000&bgcolor=ffffff`}
                alt="QR Code"
                className="block w-[250px] h-[250px]"
              />
            )}
          </div>
        </div>
      </div>

      {/* 8. NRTP band */}
      <div
        className="font-bebas text-center py-2.5 px-3.5 text-[18px] text-white"
        style={{
          background: 'linear-gradient(90deg,#1b5e20,#2e7d32,#1b5e20)',
          letterSpacing: '5px',
        }}
      >
        NRTP: {credential.nrtp_level || 'Level 3'}
      </div>

      {/* 9. Flag footer */}
      <div
        className="bg-white flex items-center justify-center gap-2 px-3.5 py-2.5"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <img src={MXFlag} alt="México" style={{ height: 32, width: 'auto' }} />
      </div>

      <div className="card-bottombar" />
    </div>
  );
}

/* ─── Shared panel wrapper ──────────────────────────────────── */
function Panel({
  delay = 'd1',
  children,
  className = '',
}: {
  delay?: 'd1' | 'd2' | 'd3' | 'd4';
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`panel-${delay} rounded-2xl overflow-hidden ${className}`}
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(0,230,118,0.12)' }}
    >
      {children}
    </div>
  );
}

/* ─── Panel header ──────────────────────────────────────────── */
function PanelHeader({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-5 pt-4 pb-3"
      style={{
        borderBottom: '1px solid rgba(0,230,118,0.08)',
        justifyContent: right ? 'space-between' : undefined,
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.18)' }}
        >
          {icon}
        </div>
        <span
          className="font-outfit text-xs font-bold uppercase text-white/80"
          style={{ letterSpacing: '1.5px' }}
        >
          {title}
        </span>
      </div>
      {right}
    </div>
  );
}

/* ─── Info row ──────────────────────────────────────────────── */
function IRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex justify-between items-center py-[9px] text-[13px]"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <span className="text-white/40">{label}</span>
      {children}
    </div>
  );
}

/* ─── Benefit row ───────────────────────────────────────────── */
function BItem({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div
      className="flex items-center gap-2.5 py-2 text-[13px] text-white/[0.78]"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div
        className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.18)' }}
      >
        <Icon size={12} color="#00e676" />
      </div>
      <span className="text-xs leading-[1.35]">{text}</span>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function CoachCredentialsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { myCredential, myCredentialLoading, myCredentialError } = useSelector(
    (state: RootState) => state.coachDashboard,
  );
  const [isRenewing, setIsRenewing] = useState(false);
  const [creationStep, setCreationStep] = useState<'select' | 'processing' | null>(null);

  useEffect(() => {
    if (document.getElementById('cp-keyframes')) return;
    const s = document.createElement('style');
    s.id = 'cp-keyframes';
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    dispatch(fetchMyCoachCredential());
  }, [dispatch]);

  const paymentPlans = [
    {
      id: 'basic',
      name: 'Certificación Básica',
      price: 150,
      duration: '1 Año',
      features: ['Credencial Digital NRTP', 'Verificación por QR', 'Acceso a torneos locales'],
    },
    {
      id: 'professional',
      name: 'Licencia Profesional',
      price: 350,
      duration: '1 Año',
      popular: true,
      features: [
        'Credencial Digital + Renovación',
        'Entrenamiento en torneos oficiales',
        'Acceso a rankings de entrenadores',
        'Descuentos en afiliación a clubes',
        'Soporte Prioritario 24/7',
      ],
    },
    {
      id: 'elite',
      name: 'Licencia Elite',
      price: 600,
      duration: '1 Año',
      features: [
        'Todo lo incluido en Profesional',
        'Seminarios exclusivos FMXPKL',
        'Consultoría de alto rendimiento',
        'Certificación internacional IPF',
      ],
    },
  ];

  const handleCreateCredential = async (planId: string) => {
    setCreationStep('processing');
    try {
      await dispatch(createCoachCredential()).unwrap();
      setCreationStep(null);
    } catch (err) {
      console.error('Failed to create credential:', err);
      setCreationStep(null);
    }
  };

  const handleRenew = () => {
    setIsRenewing(true);
    setTimeout(() => setIsRenewing(false), 2000);
  };

  const paymentHistory = [
    {
      id: 'PAY-301',
      date: new Date(myCredential?.issued_date || '2024-01-15').toISOString(),
      amount: 350,
      method: 'Stripe',
      description: 'Licencia Profesional de Entrenador',
    },
  ];

  const benefits: [LucideIcon, string][] = [
    [Trophy, 'Entrenamiento en torneos oficiales'],
    [TrendingUp, 'Acceso a rankings de entrenadores'],
    [CreditCard, 'Descuentos en afiliación a clubes'],
    [Shield, 'Licencia digital verificable por QR'],
    [Star, 'Acceso a seminarios exclusivos'],
    [Zap, 'Soporte prioritario 24/7'],
  ];

  const nrtpLevelMap: Record<string, number> = {
    'Level 1': 1,
    'Level 2': 2,
    'Level 3': 3,
    'Level 4': 4,
    Pro: 5,
  };
  const nrtpPct = myCredential ? ((nrtpLevelMap[myCredential.nrtp_level] || 3) / 5) * 100 : 0;

  /* ── Shared page shell ── */
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div
      className="font-outfit relative min-h-screen overflow-hidden px-6 pt-8 pb-16"
      style={{ background: '#050f0a' }}
    >
      {/* Blobs */}
      <div
        className="blob-1 fixed pointer-events-none rounded-full"
        style={{
          top: '-15%',
          left: '-10%',
          width: 650,
          height: 650,
          zIndex: 0,
          background: 'radial-gradient(circle, rgba(0,230,118,0.07) 0%, transparent 65%)',
        }}
      />
      <div
        className="blob-2 fixed pointer-events-none rounded-full"
        style={{
          bottom: '-15%',
          right: '-8%',
          width: 550,
          height: 550,
          zIndex: 0,
          background: 'radial-gradient(circle, rgba(0,180,83,0.05) 0%, transparent 65%)',
        }}
      />
      <div className="relative z-10 max-w-[1200px] mx-auto">{children}</div>
    </div>
  );

  /* ══ CREDENTIAL EXISTS ══════════════════════════════════════ */
  if (myCredential) {
    return (
      <Shell>
        {/* ── Page Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-12">
          <div>
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-2.5 text-[9px] font-bold uppercase text-[#00e676]"
              style={{
                background: 'rgba(0,230,118,0.08)',
                border: '1px solid rgba(0,230,118,0.18)',
                letterSpacing: '2.5px',
              }}
            >
              <Sparkles size={10} /> Licencia Verificada
            </div>
            <h1
              className="font-bebas text-white leading-none"
              style={{ fontSize: 'clamp(38px,5.5vw,60px)', letterSpacing: '3px' }}
            >
              CREDENCIAL <span className="text-[#00e676]">ENTRENADOR</span>
            </h1>
            <p
              className="text-[11px] font-semibold uppercase mt-1.5"
              style={{ color: 'rgba(0,230,118,0.6)', letterSpacing: '3px' }}
            >
              Federación Mexicana de Pickleball · CDMX
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 items-center">
            <Button
              variant="outline"
              onClick={() => alert('Descargando credencial...')}
              className="font-outfit rounded-[10px] text-[13px] gap-1.5 px-3.5 py-2 h-auto"
              style={{
                background: 'transparent',
                border: '1px solid rgba(0,230,118,0.22)',
                color: '#e8f5e9',
              }}
            >
              <Download size={14} /> Descargar
            </Button>
            <Button
              onClick={() => alert('QR Verificado ✓')}
              className="font-outfit font-bold rounded-[10px] text-[13px] gap-1.5 px-3.5 py-2 h-auto text-black"
              style={{
                background: '#00e676',
                boxShadow: '0 4px 18px rgba(0,230,118,0.3)',
              }}
            >
              <QrCode size={14} /> Verificar QR
            </Button>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid gap-8 items-start" style={{ gridTemplateColumns: '340px 1fr' }}>
          {/* LEFT */}
          <div className="flex flex-col gap-4">
            <HoloCard credential={myCredential} />

            {/* Vigencia */}
            <Panel delay="d1">
              <PanelHeader
                icon={<Calendar size={14} color="#00e676" />}
                title="Vigencia de Licencia"
              />
              <div className="px-5 py-3.5">
                <div className="flex justify-between text-[12px] text-white/45 mb-2">
                  <span>
                    Emitida:{' '}
                    <span className="text-white/75">
                      {new Date(myCredential?.created_at)?.toLocaleDateString('es-MX')}
                    </span>
                  </span>
                  <span>
                    Expira:{' '}
                    <span className="text-white/75">
                      {myCredential?.expiry_date
                        ? new Date(myCredential.expiry_date).toLocaleDateString('es-MX')
                        : 'N/A'}
                    </span>
                  </span>
                </div>
                {/* Vig bar */}
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="vig-bar h-full rounded-full w-[95%]"
                    style={{ background: 'linear-gradient(90deg, #00b248, #00e676)' }}
                  />
                </div>
                <div
                  className="flex justify-between text-[10px] mt-1.5"
                  style={{ color: 'rgba(76,175,120,0.45)' }}
                >
                  <span>Ene 2024</span>
                  <span className="text-[#00e676]">95% transcurrido</span>
                  <span>Dic 2024</span>
                </div>
              </div>
            </Panel>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-5">
            {/* Certification Level */}
            <Panel delay="d1">
              <PanelHeader
                icon={<TrendingUp size={14} color="#00e676" />}
                title="Nivel de Certificación"
              />
              <div className="px-5 py-3.5">
                <div className="flex items-end gap-4 mb-4">
                  <div
                    className="font-bebas leading-none text-[#00e676]"
                    style={{
                      fontSize: 72,
                      letterSpacing: 2,
                      textShadow: '0 0 30px rgba(0,230,118,0.35)',
                    }}
                  >
                    {myCredential?.nrtp_level || 'Level 3'}
                  </div>
                  <div className="pb-2">
                    <div
                      className="text-[11px] uppercase mb-1.5"
                      style={{ color: 'rgba(76,175,120,0.6)', letterSpacing: 2 }}
                    >
                      de Level 5 (Pro)
                    </div>
                    <Badge
                      className="font-outfit text-[11px] font-bold"
                      style={{
                        background: 'rgba(0,230,118,0.1)',
                        border: '1px solid rgba(0,230,118,0.22)',
                        color: '#00e676',
                        letterSpacing: 1,
                      }}
                    >
                      NRTP {myCredential?.nrtp_level || 'Level 3'}
                    </Badge>
                  </div>
                </div>
                {/* NRTP bar */}
                <div
                  className="h-[5px] rounded-full overflow-hidden mt-1.5"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="ntpr-bar h-full rounded-full"
                    style={{
                      width: `${nrtpPct}%`,
                      background: 'linear-gradient(90deg, #00b248, #00e676, #69f0ae)',
                    }}
                  />
                </div>
                <div
                  className="flex justify-between text-[9px] mt-1.5"
                  style={{ color: 'rgba(76,175,120,0.4)', letterSpacing: 1 }}
                >
                  {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Pro'].map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </div>

                <Separator className="my-3.5" style={{ background: 'rgba(0,230,118,0.08)' }} />

                <div className="last:border-none">
                  <IRow label="Club">
                    <span className="text-white/85 font-medium text-[13px]">
                      {myCredential?.club_name || 'Independiente'}
                    </span>
                  </IRow>
                  <IRow label="Estado">
                    <span className="text-white/85 font-medium text-[13px]">
                      {myCredential?.state_affiliation || 'N/A'}
                    </span>
                  </IRow>
                  <IRow label="Afiliación">
                    <span
                      className="font-medium text-[13px] capitalize"
                      style={{
                        color:
                          myCredential?.affiliation_status === 'active' ? '#00e676' : '#ff6b6b',
                      }}
                    >
                      {myCredential?.affiliation_status}
                    </span>
                  </IRow>
                </div>
              </div>
            </Panel>

            {/* 2-col: Coach details + Benefits */}
            <div className="grid grid-cols-2 gap-5">
              <Panel delay="d2">
                <PanelHeader
                  icon={<User size={13} color="#00e676" />}
                  title="Datos del Entrenador"
                />
                <div className="px-5 py-3.5 [&>*:last-child]:border-b-0">
                  <IRow label="Número">
                    <span
                      className="font-jetbrains text-[11px] text-[#00e676]"
                      style={{ letterSpacing: 1 }}
                    >
                      {myCredential?.credential_number}
                    </span>
                  </IRow>
                  <IRow label="Código">
                    <span
                      className="font-jetbrains text-[11px] text-[#00e676]"
                      style={{ letterSpacing: 1 }}
                    >
                      {myCredential?.verification_code}
                    </span>
                  </IRow>
                  <IRow label="Estado">
                    <span
                      className="flex items-center gap-1.5 text-[13px] font-semibold"
                      style={{
                        color:
                          myCredential?.affiliation_status === 'active' ? '#00e676' : '#ff6b6b',
                      }}
                    >
                      <span
                        className="status-dot inline-block w-1.5 h-1.5 rounded-full"
                        style={{
                          background:
                            myCredential?.affiliation_status === 'active' ? '#00e676' : '#ff6b6b',
                          boxShadow:
                            myCredential?.affiliation_status === 'active'
                              ? '0 0 6px #00e676'
                              : '0 0 6px #ff6b6b',
                        }}
                      />
                      {myCredential?.affiliation_status === 'active' ? 'Certificado' : 'Inactivo'}
                    </span>
                  </IRow>
                  <IRow label="Emitida">
                    <span className="text-white/85 font-medium text-[13px]">
                      {myCredential?.issued_date
                        ? new Date(myCredential.issued_date).toLocaleDateString('es-MX')
                        : 'Sin datos'}
                    </span>
                  </IRow>
                  <IRow label="Expira">
                    <span className="text-white/85 font-medium text-[13px]">
                      {myCredential?.expiry_date
                        ? new Date(myCredential.expiry_date).toLocaleDateString('es-MX')
                        : 'Sin expiración'}
                    </span>
                  </IRow>
                </div>
              </Panel>

              <Panel delay="d3">
                <PanelHeader icon={<CheckCircle2 size={13} color="#00e676" />} title="Beneficios" />
                <div className="px-5 py-3.5 [&>*:last-child]:border-b-0">
                  {benefits.map(([Icon, text], i) => (
                    <BItem key={i} icon={Icon} text={text} />
                  ))}
                </div>
              </Panel>
            </div>

            {/* Payment History */}
            <Panel delay="d4">
              <PanelHeader
                icon={<CreditCard size={14} color="#00e676" />}
                title="Historial de Pagos"
                right={
                  <Button
                    onClick={handleRenew}
                    disabled={isRenewing}
                    className="font-outfit font-bold rounded-[9px] text-[12px] gap-1.5 h-[34px] px-3.5"
                    style={{
                      background: isRenewing ? 'rgba(0,230,118,0.12)' : '#00e676',
                      color: isRenewing ? '#00e676' : '#000',
                      border: isRenewing ? '1px solid rgba(0,230,118,0.3)' : 'none',
                      boxShadow: isRenewing ? 'none' : '0 3px 14px rgba(0,230,118,0.28)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <RefreshCcw size={13} className={isRenewing ? 'spin' : ''} />
                    {isRenewing ? 'Procesando...' : 'Renovar $350 USD'}
                  </Button>
                }
              />
              <div className="px-5 py-3.5">
                {paymentHistory.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'rgba(0,230,118,0.07)',
                          border: '1px solid rgba(0,230,118,0.14)',
                        }}
                      >
                        <CheckCircle2 size={17} color="#00e676" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-white/85">
                          {p.description}
                        </div>
                        <div className="text-[11px] text-white/35 mt-0.5">
                          {new Date(p.date).toLocaleDateString('es-MX')} · {p.method} · {p.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="font-bebas text-[22px] text-[#00e676]"
                        style={{ letterSpacing: 1 }}
                      >
                        ${p.amount}{' '}
                        <span className="text-[13px]" style={{ letterSpacing: 0 }}>
                          USD
                        </span>
                      </div>
                      <div
                        className="inline-block text-[8px] font-bold uppercase text-[#00e676] rounded px-1.5 py-0.5 mt-0.5"
                        style={{
                          background: 'rgba(0,230,118,0.1)',
                          border: '1px solid rgba(0,230,118,0.2)',
                          letterSpacing: '1.5px',
                        }}
                      >
                        Completado
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </Shell>
    );
  }

  /* ══ NO CREDENTIAL — show plans ════════════════════════════ */
  return (
    <Shell>
      {/* Page Header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 mb-4 text-[9px] font-bold uppercase text-[#00e676]"
          style={{
            background: 'rgba(0,230,118,0.08)',
            border: '1px solid rgba(0,230,118,0.18)',
            letterSpacing: '2.5px',
          }}
        >
          <AlertCircle size={12} /> Sin Licencia Activa
        </div>
        <h1
          className="font-bebas text-white leading-none"
          style={{ fontSize: 'clamp(38px,5.5vw,60px)', letterSpacing: '3px' }}
        >
          OBTENER LICENCIA <span className="text-[#00e676]">DE ENTRENADOR</span>
        </h1>
        <p
          className="text-[11px] font-semibold uppercase mt-1.5"
          style={{ color: 'rgba(0,230,118,0.6)', letterSpacing: '3px' }}
        >
          Elige un plan y obtén tu licencia oficial de entrenador
        </p>
      </div>

      {/* Error */}
      {myCredentialError && (
        <div
          className="rounded-xl p-4 mb-8 text-[#ff6b6b] text-[14px]"
          style={{
            background: 'rgba(244,67,54,0.1)',
            border: '1px solid rgba(244,67,54,0.3)',
          }}
        >
          {myCredentialError}
        </div>
      )}

      {/* Payment Plans */}
      <div
        className="grid gap-6 mb-12"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))' }}
      >
        {paymentPlans.map((plan) => (
          <div
            key={plan.id}
            className="relative rounded-2xl px-6 py-7 overflow-hidden"
            style={{
              background: plan.popular
                ? 'linear-gradient(135deg, rgba(0,230,118,0.15) 0%, rgba(0,180,83,0.08) 100%)'
                : 'rgba(255,255,255,0.02)',
              border: plan.popular
                ? '2px solid rgba(0,230,118,0.4)'
                : '1px solid rgba(0,230,118,0.12)',
            }}
          >
            {plan.popular && (
              <div
                className="absolute top-3 -right-10 text-black text-[11px] font-bold px-12 py-1 rotate-45"
                style={{ background: '#00e676', letterSpacing: 1 }}
              >
                POPULAR
              </div>
            )}
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-bebas text-[40px] text-[#00e676]" style={{ letterSpacing: 1 }}>
                ${plan.price}
              </span>
              <span className="text-[13px] text-white/45">USD / {plan.duration}</span>
            </div>
            <Separator className="my-4" style={{ background: 'rgba(0,230,118,0.08)' }} />
            <ul className="mb-6 space-y-2.5">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[13px] text-white/70">
                  <CheckCircle2 size={14} color="#00e676" className="flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleCreateCredential(plan.id)}
              disabled={creationStep === 'processing'}
              className="w-full font-bold rounded-[10px] text-[13px] py-3 h-auto"
              style={{
                background: plan.popular ? '#00e676' : 'rgba(0,230,118,0.1)',
                color: plan.popular ? '#000' : '#00e676',
                border: plan.popular ? 'none' : '1px solid rgba(0,230,118,0.2)',
                boxShadow: plan.popular ? '0 4px 16px rgba(0,230,118,0.3)' : 'none',
              }}
            >
              {creationStep === 'processing' ? 'Procesando...' : 'Seleccionar Plan'}
            </Button>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <Panel>
        <PanelHeader
          icon={<Sparkles size={14} color="#00e676" />}
          title="¿Qué incluye tu licencia de entrenador?"
        />
        <div className="px-5 py-3.5">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))' }}
          >
            {benefits.map(([Icon, text], i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(0,230,118,0.1)',
                    border: '1px solid rgba(0,230,118,0.18)',
                  }}
                >
                  <Icon size={14} color="#00e676" />
                </div>
                <span className="text-[13px] text-white/70">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </Shell>
  );
}
