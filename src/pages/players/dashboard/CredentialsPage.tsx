import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchMyDigitalCredential } from '@/store/slices/digitalCredentialsSlice';
import { fetchPlayerProfile } from '@/store/slices/playerDashboardSlice';
import { DigitalCredentialPaymentModal } from '@/components/payment/DigitalCredentialPaymentModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Download, QrCode, Shield, TrendingUp, CreditCard, CheckCircle2,
  Trophy, Star, Calendar, User, Zap, RefreshCcw, Sparkles, AlertCircle, Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFullImageUrl } from '@/common/tools';

import MXFlag from '@/assets/images/flag/MX.png';
import FederationLogo from '@/assets/images/Logos/Logo pickleball compressed.png';
import IpfLogo from '@/assets/images/Logos/IPF.png';
import conadeLogo from '@/assets/images/Logos/conade-logo.png';
import EagleImg from '@/assets/images/toppng.png';

/* ─── helpers ───────────────────────────────────────────────── */
function getExpiryDate(credential: any): Date {
  if (credential.expiry_date) return new Date(credential.expiry_date);
  const d = new Date(credential.issued_date || credential.created_at);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

/* ─── HoloCard ──────────────────────────────────────────────── */
function HoloCard({ credential, playerPhotoUrl }: { credential: any; playerPhotoUrl?: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = ((e.clientX - r.left) / r.width - 0.5) * 14;
      const dy = ((e.clientY - r.top) / r.height - 0.5) * -9;
      el.style.transform = `perspective(800px) rotateY(${dx}deg) rotateX(${dy}deg)`;
    };
    const onLeave = () => {
      el.style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const isActive = credential.affiliation_status === 'active';

  return (
    <div
      ref={ref}
      className={cn(
        'relative w-full rounded-[20px] overflow-hidden cursor-default',
        'bg-[#0A0D1A]',
        'border border-[#C8FF00]/[0.14]',
        'shadow-[0_0_0_1px_rgba(200,255,0,0.03),0_24px_60px_rgba(0,0,0,0.7),0_0_60px_rgba(200,255,0,0.05)]',
        'hover:shadow-[0_0_0_1px_rgba(200,255,0,0.2),0_32px_80px_rgba(0,0,0,0.8),0_0_80px_rgba(200,255,0,0.1)]',
        'transition-shadow duration-200',
      )}
    >
      {/* Shimmer */}
      <div className="absolute inset-0 z-20 pointer-events-none rounded-[20px] bg-gradient-to-br from-transparent via-[#C8FF64]/[0.05] to-transparent" />

      {/* Top bar */}
      <div className="h-1 bg-gradient-to-r from-[#7CAF00] via-[#C8FF00] to-[#7CAF00]" />

      {/* Federation header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0D1F08] via-[#152B0B] to-[#0D1F08]">
        <div className="absolute inset-0 [background-image:repeating-linear-gradient(-45deg,transparent,transparent_8px,rgba(200,255,0,0.02)_8px,rgba(200,255,0,0.02)_9px)]" />
        <div className="relative z-10 flex flex-col items-center gap-1.5 px-4 py-3.5">
          <div className="flex items-center gap-3 w-full justify-center">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-[#C8FF00]/50 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_8px_rgba(200,255,0,0.3)]">
              <img src={EagleImg} alt="Escudo" className="w-10 h-10 object-contain" />
            </div>
            <div className="text-center font-sans font-extrabold text-[14px] tracking-[2px] text-white leading-snug">
              FEDMEX PICKLEBALL
            </div>
            <div className="w-12 h-12 rounded-full bg-white border-2 border-[#C8FF00]/50 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_8px_rgba(200,255,0,0.3)]">
              <img src={EagleImg} alt="Escudo" className="w-10 h-10 object-contain" />
            </div>
          </div>
          <div className="bg-[#C8FF00] text-black font-sans font-extrabold text-[11px] tracking-[5px] px-5 py-1 rounded-sm">
            {credential.state_affiliation?.toUpperCase() || 'N/A'}
          </div>
        </div>
      </div>

      {/* Photo zone */}
      <div className="relative h-[220px] overflow-hidden bg-gradient-to-b from-[#0A1A06] to-[#050D03]">
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(200,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,255,0,0.03)_1px,transparent_1px)] [background-size:24px_24px]" />
        <p className="absolute top-2.5 inset-x-0 text-center font-sans text-[9px] font-bold tracking-[5px] text-white/50 uppercase">
          JUGADOR OFICIAL
        </p>
        <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-[54%] w-24 h-24 rounded-[10px] border-2 border-white/80 bg-[#12152A] overflow-hidden flex items-center justify-center text-4xl shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.05)]">
          {(credential?.user?.profile_photo || playerPhotoUrl)
            ? <img src={getFullImageUrl(credential?.user?.profile_photo || playerPhotoUrl)} alt="player" className="w-full h-full object-cover" />
            : '👤'}
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[rgba(5,9,3,0.97)] via-[rgba(5,9,3,0.7)] to-transparent pb-2 pt-8 px-3 text-center">
          <p className="font-sans font-extrabold text-[17px] tracking-[1.5px] text-white leading-tight">
            {credential.player_name}
          </p>
          {credential?.user?.date_of_birth && (
            <p className="font-sans text-[12px] text-[#C8FF00]/80 tracking-[1px] mt-0.5">
              {new Date(credential.user.date_of_birth).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {/* Status band */}
      <div className={cn(
        'flex items-center justify-center gap-2 py-1.5',
        isActive
          ? 'bg-gradient-to-r from-[#0D1F08] via-[#1E3C0E] to-[#0D1F08]'
          : 'bg-gradient-to-r from-[#1F0808] via-[#3C0E0E] to-[#1F0808]',
      )}>
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          isActive ? 'bg-[#C8FF00] shadow-[0_0_6px_#C8FF00]' : 'bg-[#ff6b6b] shadow-[0_0_6px_#ff6b6b]',
        )} />
        <span className={cn(
          'font-sans font-extrabold text-[13px] tracking-[5px]',
          isActive ? 'text-[#C8FF00]' : 'text-[#ff6b6b]',
        )}>
          {isActive ? 'ACTIVO' : 'INACTIVO'}
        </span>
      </div>

      {/* ID */}
      <div className="bg-[#080D18] py-1.5 text-center font-['JetBrains_Mono',monospace] text-[13px] tracking-[3px] text-[rgba(200,240,200,0.7)] border-y border-[#C8FF00]/[0.06]">
        {credential.credential_number || credential.id}
      </div>

      {/* Logos */}
      <div className="bg-[#F2F2F2] flex items-center justify-around px-5 py-2.5 border-y border-black/[0.07]">
        <img src={IpfLogo} alt="IPF" className="w-[46px] h-[46px] object-contain" />
        <img src={FederationLogo} alt="Federation" className="w-[72px] h-[44px] object-contain" />
        <img src={conadeLogo} alt="CONADE" className="w-[46px] h-[46px] object-contain" />
      </div>

      {/* QR */}
      <div className="bg-white flex items-center justify-center py-4 px-5">
        <div className="p-2 bg-white border-2 border-[#E0E0E0] rounded-md shadow-md">
          {credential.qr_code_url ? (
            <img src={getFullImageUrl(credential.qr_code_url)} alt="QR" className="w-[200px] h-[200px] block" />
          ) : (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/credentials/verify/${credential.verification_code}`)}&margin=4`}
              alt="QR"
              className="w-[200px] h-[200px] block"
            />
          )}
        </div>
      </div>

      {/* NTPR */}
      <div className="py-2 text-center font-sans font-extrabold text-[18px] tracking-[5px] text-white bg-gradient-to-r from-[#152B0B] via-[#1F3E10] to-[#152B0B]">
        NTPR: {credential.nrtp_level || '3.5'}
      </div>

      {/* Flag */}
      <div className="bg-white flex items-center justify-center py-2 border-t border-black/[0.06]">
        <img src={MXFlag} alt="México" className="h-8 w-auto" />
      </div>

      {/* Bottom bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#7CAF00] via-[#C8FF00] to-[#7CAF00]" />
    </div>
  );
}

/* ─── Panel card ─────────────────────────────────────────────── */
function Panel({
  icon: Icon,
  title,
  action,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('bg-white/[0.025] border border-[#C8FF00]/[0.1] rounded-2xl overflow-hidden', className)}>
      <CardHeader className="px-5 py-3.5 border-b border-[#C8FF00]/[0.07] flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-[8px] bg-[#C8FF00]/[0.08] border border-[#C8FF00]/[0.15] flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-[#C8FF00]" />
          </div>
          <span className="font-sans text-[11px] font-bold tracking-[1.5px] uppercase text-white/95">
            {title}
          </span>
        </div>
        {action}
      </CardHeader>
      <CardContent className="px-5 py-3.5">{children}</CardContent>
    </Card>
  );
}

/* ─── InfoRow ────────────────────────────────────────────────── */
function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-none text-[13px]">
      <span className="text-white/65">{label}</span>
      <span className={cn(
        'font-medium text-white/85',
        mono && 'font-["JetBrains_Mono",monospace] text-[11px] text-[#C8FF00]',
      )}>
        {value}
      </span>
    </div>
  );
}

/* ─── BenefitRow ─────────────────────────────────────────────── */
function BenefitRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 border-b border-white/[0.04] last:border-none text-[12px] text-white/85">
      <div className="w-6 h-6 rounded-md bg-[#C8FF00]/[0.08] border border-[#C8FF00]/[0.15] flex items-center justify-center flex-shrink-0">
        <Icon className="w-3 h-3 text-[#C8FF00]" />
      </div>
      {text}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function PlayerCredentialsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { myCredential, loading, error } = useSelector(
    (state: RootState) => state.digitalCredentials,
  );
  const playerProfile = useSelector((state: RootState) => state.playerDashboard.profile);
  const [isRenewing, setIsRenewing] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    planType: 'basic' | 'membership' | 'premium';
    planName: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchMyDigitalCredential());
    dispatch(fetchPlayerProfile());
  }, [dispatch]);

  const paymentPlans = [
    {
      id: 'basic',
      name: 'Plan Básico',
      price: 25,
      duration: '1 Mes',
      popular: false,
      features: ['Credencial Digital', 'Verificación de QR', 'Estadísticas Básicas'],
    },
    {
      id: 'membership',
      name: 'Membresía Anual',
      price: 250,
      duration: '1 Año',
      popular: true,
      features: [
        'Credencial Digital + Renovación',
        'Participación en Torneos',
        'Acceso a Rankings',
        'Descuentos en clubes',
        'Soporte Prioritario',
      ],
    },
    {
      id: 'premium',
      name: 'Premium Plus',
      price: 500,
      duration: '1 Año',
      popular: false,
      features: [
        'Todo lo incluido en Membresía',
        'Estadísticas Avanzadas',
        'Eventos Exclusivos',
        'Consultoría de Entrenamiento',
      ],
    },
  ];

  const benefits: [LucideIcon, string][] = [
    [Trophy,     'Participación en torneos oficiales'],
    [TrendingUp, 'Acceso a rankings nacionales'],
    [CreditCard, 'Descuentos en afiliación a clubes'],
    [Shield,     'Certificación digital verificable'],
    [Star,       'Acceso a eventos exclusivos'],
    [Zap,        'Soporte prioritario 24/7'],
  ];

  const handleCreateCredential = (planId: string) => {
    const plan = paymentPlans.find(p => p.id === planId);
    if (!plan) return;
    setPaymentModal({
      open: true,
      planType: planId as 'basic' | 'membership' | 'premium',
      planName: plan.name,
      amount: plan.price,
    });
  };

  const handlePaymentSuccess = () => {
    setPaymentModal(null);
    dispatch(fetchMyDigitalCredential());
  };

  const handleRenew = () => {
    setIsRenewing(true);
    setTimeout(() => { setIsRenewing(false); }, 2000);
  };

  const paymentHistory = [{
    id: 'PAY-001',
    date: new Date(myCredential?.issued_date || '2024-01-15').toISOString(),
    amount: 250,
    method: 'Stripe',
    description: 'Membresía Anual',
  }];

  const ntprPct = myCredential
    ? (parseFloat(myCredential.nrtp_level || '3.5') / 8) * 100
    : 0;

  /* Loading */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-[#C8FF00] animate-spin" />
          <span className="text-white/60 text-sm font-['DM_Sans',sans-serif]">Cargando credencial…</span>
        </div>
      </div>
    );
  }

  /* ── HAS CREDENTIAL ─────────────────────────────────────────── */
  if (myCredential) {
    return (
      <div className="min-h-screen bg-[#06080E] text-[#F0F0FF] font-['DM_Sans',sans-serif] relative overflow-hidden">
        {/* Ambient */}
        <div className="fixed pointer-events-none rounded-full -top-1/4 -left-1/4 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(200,255,0,0.04)_0%,transparent_65%)]" />
        <div className="fixed pointer-events-none rounded-full -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(100,180,0,0.03)_0%,transparent_65%)]" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-8 pb-16">

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#C8FF00]/[0.07] border border-[#C8FF00]/[0.15] rounded-full px-3 py-1 mb-2.5 font-sans text-[10px] font-bold tracking-[2px] text-[#C8FF00] uppercase">
                <Sparkles className="w-2.5 h-2.5" /> Afiliación Verificada
              </div>
              <h1 className="font-sans font-extrabold leading-none tracking-tight text-[clamp(28px,4vw,44px)]">
                CREDENCIAL <span className="text-[#C8FF00]">DIGITAL</span>
              </h1>
              <p className="text-[#8CAF00] text-[11px] tracking-[2.5px] uppercase font-bold mt-2">
                FEDMEX Pickleball
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => alert('Descargando...')}
                className="bg-transparent border-[#C8FF00]/[0.22] text-white/95 hover:text-white hover:bg-[#C8FF00]/[0.07] hover:border-[#C8FF00]/40 rounded-xl gap-2 text-[13px]"
              >
                <Download className="w-3.5 h-3.5" /> Descargar
              </Button>
              <Button
                onClick={() => alert('QR Verificado ✓')}
                className="bg-[#C8FF00] text-black font-sans font-extrabold rounded-xl gap-2 text-[13px] hover:bg-[#d6ff26] shadow-[0_4px_20px_rgba(200,255,0,0.25)]"
              >
                <QrCode className="w-3.5 h-3.5" /> Verificar QR
              </Button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-7 items-start">

            {/* Left */}
            <div className="flex flex-col gap-4">
              <HoloCard credential={myCredential} playerPhotoUrl={getFullImageUrl(playerProfile?.profilePhoto)} />

              {(() => {
                const start = new Date(myCredential?.issued_date || myCredential?.created_at);
                const end = getExpiryDate(myCredential);
                const now = new Date();
                const total = end.getTime() - start.getTime();
                const elapsed = Math.min(Math.max(now.getTime() - start.getTime(), 0), total);
                const pct = total > 0 ? Math.round((elapsed / total) * 100) : 0;
                const fmt = (d: Date) => d.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
                return (
                  <Panel icon={Calendar} title="Vigencia de Membresía">
                    <div className="flex justify-between text-[12px] text-white/65 mb-2">
                      <span>
                        Emitida:{' '}
                        <span className="text-white/88">{start.toLocaleDateString('es-MX')}</span>
                      </span>
                      <span>
                        Expira:{' '}
                        <span className="text-white/88">{end.toLocaleDateString('es-MX')}</span>
                      </span>
                    </div>
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#7CAF00] to-[#C8FF00]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#C8FF00]/40 mt-1.5">
                      <span>{fmt(start)}</span>
                      <span className="text-[#C8FF00]">{pct}% transcurrido</span>
                      <span>{fmt(end)}</span>
                    </div>
                  </Panel>
                );
              })()}
            </div>

            {/* Right */}
            <div className="flex flex-col gap-4">

              {/* NTPR */}
              <Panel icon={TrendingUp} title="Nivel NTPR">
                <div className="flex items-end gap-5 mb-4">
                  <span className="font-sans font-extrabold text-[64px] leading-none tracking-tight text-[#C8FF00] drop-shadow-[0_0_30px_rgba(200,255,0,0.35)]">
                    {myCredential?.nrtp_level || '3.5'}
                  </span>
                  <div className="pb-2 flex flex-col gap-2">
                    <span className="text-[11px] text-[#C8FF00]/50 tracking-[2px] uppercase">de 8.0 máximo</span>
                    <Badge className="bg-[#C8FF00]/[0.1] border border-[#C8FF00]/[0.22] text-[#C8FF00] text-[11px] font-bold font-sans w-fit">
                      NTPR {myCredential?.nrtp_level || '3.5'}
                    </Badge>
                  </div>
                </div>
                <div className="h-[5px] bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7CAF00] via-[#C8FF00] to-[#E8FF80]"
                    style={{ width: `${ntprPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-[#C8FF00]/30 tracking-[1px] mt-1.5">
                  {['1.0', '2.5', '4.0', '5.5', '7.0', '8.0'].map(v => <span key={v}>{v}</span>)}
                </div>
                <Separator className="bg-[#C8FF00]/[0.08] my-3" />
                <InfoRow label="Club" value={myCredential?.club_name || 'Independiente'} />
                <InfoRow label="Estado" value={myCredential?.state_affiliation || 'N/A'} />
                <InfoRow
                  label="Afiliación"
                  value={
                    <span className={cn(
                      'capitalize font-semibold',
                      myCredential?.affiliation_status === 'active'
                        ? 'text-[#C8FF00]'
                        : 'text-[#ff6b6b]',
                    )}>
                      {myCredential?.affiliation_status}
                    </span>
                  }
                />
              </Panel>

              {/* 2-col */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Panel icon={User} title="Datos del Jugador">
                  <InfoRow label="Número" value={myCredential?.credential_number} mono />
                  <InfoRow label="Código" value={myCredential?.verification_code} mono />
                  {(myCredential as any)?.user?.date_of_birth && (
                    <InfoRow
                      label="Fecha de Nacimiento"
                      value={new Date((myCredential as any).user.date_of_birth).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                    />
                  )}
                  <InfoRow
                    label="Estado"
                    value={
                      <span className={cn(
                        'flex items-center gap-1.5 font-semibold text-[13px]',
                        myCredential?.affiliation_status === 'active'
                          ? 'text-[#C8FF00]'
                          : 'text-[#ff6b6b]',
                      )}>
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full inline-block',
                          myCredential?.affiliation_status === 'active'
                            ? 'bg-[#C8FF00] shadow-[0_0_6px_#C8FF00]'
                            : 'bg-[#ff6b6b] shadow-[0_0_6px_#ff6b6b]',
                        )} />
                        {myCredential?.affiliation_status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Emitida"
                    value={myCredential?.issued_date
                      ? new Date(myCredential.issued_date).toLocaleDateString('es-MX')
                      : 'Sin datos'}
                  />
                  <InfoRow
                    label="Expira"
                    value={getExpiryDate(myCredential).toLocaleDateString('es-MX')}
                  />
                </Panel>

                <Panel icon={CheckCircle2} title="Beneficios">
                  {benefits.map(([Icon, text], i) => (
                    <BenefitRow key={i} icon={Icon} text={text} />
                  ))}
                </Panel>
              </div>

              {/* Payment history */}
              <Panel
                icon={CreditCard}
                title="Historial de Pagos"
                action={
                  <Button
                    onClick={handleRenew}
                    disabled={isRenewing}
                    size="sm"
                    className={cn(
                      'rounded-[9px] text-[12px] font-extrabold font-sans gap-1.5 h-8 px-3.5',
                      isRenewing
                        ? 'bg-[#C8FF00]/[0.1] text-[#C8FF00] border border-[#C8FF00]/[0.25] shadow-none hover:bg-[#C8FF00]/[0.1]'
                        : 'bg-[#C8FF00] text-black shadow-[0_3px_14px_rgba(200,255,0,0.28)] hover:bg-[#d6ff26]',
                    )}
                  >
                    <RefreshCcw className={cn('w-3 h-3', isRenewing && 'animate-spin')} />
                    {isRenewing ? 'Procesando...' : 'Renovar $500 MXN'}
                  </Button>
                }
              >
                {paymentHistory.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-none">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[10px] bg-[#C8FF00]/[0.07] border border-[#C8FF00]/[0.12] flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-[17px] h-[17px] text-[#C8FF00]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-white/85">{p.description}</p>
                        <p className="text-[11px] text-white/60 mt-0.5">
                          {new Date(p.date).toLocaleDateString('es-MX')} · {p.method} · {p.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-sans font-extrabold text-[20px] leading-none text-[#C8FF00]">
                        ${p.amount}{' '}
                        <span className="text-[13px] font-normal text-white/60">MXN</span>
                      </p>
                      <Badge className="mt-1 bg-[#C8FF00]/[0.08] border border-[#C8FF00]/[0.18] text-[#C8FF00] text-[8px] font-bold tracking-[1.5px] uppercase font-sans">
                        Completado
                      </Badge>
                    </div>
                  </div>
                ))}
              </Panel>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── NO CREDENTIAL ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#06080E] text-[#F0F0FF] font-['DM_Sans',sans-serif] relative overflow-hidden">
      <div className="fixed pointer-events-none rounded-full -top-1/4 -left-1/4 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(200,255,0,0.04)_0%,transparent_65%)]" />
      <div className="fixed pointer-events-none rounded-full -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(100,180,0,0.03)_0%,transparent_65%)]" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-8 pb-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-[#ff6b6b]/[0.07] border border-[#ff6b6b]/[0.2] rounded-full px-3 py-1 mb-3 font-sans text-[10px] font-bold tracking-[2px] text-[#ff6b6b] uppercase">
            <AlertCircle className="w-2.5 h-2.5" /> Sin Credencial Activa
          </div>
          <h1 className="font-sans font-extrabold leading-none tracking-tight text-[clamp(28px,4vw,44px)]">
            CREAR CREDENCIAL <span className="text-[#C8FF00]">DIGITAL</span>
          </h1>
          <p className="text-[#8CAF00] text-[11px] tracking-[2.5px] uppercase font-bold mt-3">
            Elige un plan y obtén tu credencial oficial
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[#ff6b6b]/[0.1] border border-[#ff6b6b]/[0.3] rounded-xl px-4 py-3.5 mb-8 text-[#ff6b6b] text-[14px]">
            {error}
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {paymentPlans.map(plan => (
            <Card
              key={plan.id}
              className={cn(
                'relative overflow-hidden rounded-2xl',
                plan.popular
                  ? 'bg-[#C8FF00]/[0.06] border-2 border-[#C8FF00]/[0.35]'
                  : 'bg-white/[0.02] border border-[#C8FF00]/[0.1]',
              )}
            >
              {plan.popular && (
                <div className="absolute top-3 right-[-38px] bg-[#C8FF00] text-black px-12 py-1 rotate-45 font-sans text-[9px] font-extrabold tracking-[1px]">
                  POPULAR
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="font-sans font-extrabold text-[17px] text-white mb-1.5">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="font-sans font-extrabold text-[38px] leading-none text-[#C8FF00] tracking-tight">
                    ${plan.price}
                  </span>
                  <span className="text-[12px] text-white/65">MXN</span>
                </div>
                <p className="text-[12px] text-white/65 mb-4">/ {plan.duration}</p>

                <Separator className="bg-[#C8FF00]/[0.08] mb-4" />

                <ul className="flex flex-col gap-2.5 mb-6">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-[12px] text-white/85">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C8FF00] flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCreateCredential(plan.id)}
                  className={cn(
                    'w-full rounded-xl font-extrabold font-sans text-[13px]',
                    plan.popular
                      ? 'bg-[#C8FF00] text-black hover:bg-[#d6ff26] shadow-[0_4px_18px_rgba(200,255,0,0.28)]'
                      : 'bg-[#C8FF00]/[0.08] text-[#C8FF00] border border-[#C8FF00]/[0.2] hover:bg-[#C8FF00]/[0.15]',
                  )}
                >
                  Seleccionar Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <Panel icon={Sparkles} title="¿Qué incluye tu credencial?">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            {benefits.map(([Icon, text], i) => (
              <BenefitRow key={i} icon={Icon} text={text} />
            ))}
          </div>
        </Panel>
      </div>

      {paymentModal && (
        <DigitalCredentialPaymentModal
          isOpen={paymentModal.open}
          onClose={() => setPaymentModal(null)}
          planType={paymentModal.planType}
          planName={paymentModal.planName}
          amount={paymentModal.amount}
          userType="player"
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}