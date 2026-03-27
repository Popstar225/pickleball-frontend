import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchMyCoachCredential, fetchCoachProfile, createCoachCredential, setMyCredential } from '@/store/slices/coachDashboardSlice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Download, QrCode, Shield, TrendingUp, CreditCard, CheckCircle2,
  Trophy, Star, Calendar, User, Zap, Sparkles, AlertCircle, Loader2, RefreshCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CredentialHoloCard } from '@/components/credentials/CredentialHoloCard';

function getExpiryDate(credential: any): Date {
  if (credential.expiry_date) return new Date(credential.expiry_date);
  const d = new Date(credential.issued_date || credential.created_at);
  d.setFullYear(d.getFullYear() + 1);
  return d;
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
export default function CoachCredentialsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { myCredential, myCredentialLoading, myCredentialError, profile } = useSelector(
    (state: RootState) => state.coachDashboard,
  );
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMyCoachCredential());
    dispatch(fetchCoachProfile());
  }, [dispatch]);

  // Auto-create credential if none exists after loading completes
  useEffect(() => {
    if (!myCredentialLoading && !myCredential && !creating && !createError) {
      handleAutoCreate();
    }
  }, [myCredentialLoading, myCredential]);

  const handleAutoCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const result = await dispatch(createCoachCredential()).unwrap();
      if (result) {
        dispatch(setMyCredential(result));
        dispatch(fetchMyCoachCredential());
      }
    } catch (err: any) {
      setCreateError(err?.message || 'Error al crear la credencial. Intenta de nuevo.');
    } finally {
      setCreating(false);
    }
  };

  const nrtpLevelMap: Record<string, number> = {
    '2.5': 2.5, '3.0': 3.0, '3.5': 3.5, '4.0': 4.0, '4.5': 4.5, '5+': 5, '5.0': 5,
    'Level 1': 1, 'Level 2': 2, 'Level 3': 3, 'Level 4': 4, Pro: 5,
  };
  const rawNrtp = myCredential?.nrtp_level;
  const nrtpNumeric = rawNrtp ? (nrtpLevelMap[rawNrtp] ?? parseFloat(rawNrtp) ?? 3) : 3;
  const nrtpPct = myCredential ? (Math.min(nrtpNumeric, 5) / 5) * 100 : 0;
  const isExpired = myCredential ? getExpiryDate(myCredential) < new Date() : false;

  const benefits: [LucideIcon, string][] = [
    [Trophy,     'Entrenamiento en torneos oficiales'],
    [TrendingUp, 'Acceso a rankings de entrenadores'],
    [CreditCard, 'Descuentos en afiliación a clubes'],
    [Shield,     'Licencia digital verificable por QR'],
    [Star,       'Acceso a seminarios exclusivos'],
    [Zap,        'Soporte prioritario 24/7'],
  ];

  /* Loading */
  if (myCredentialLoading || creating) {
    return (
      <div className="min-h-screen bg-[#06080E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-[#C8FF00] animate-spin" />
          <span className="text-white/60 text-sm font-['DM_Sans',sans-serif]">
            {creating ? 'Generando tu credencial…' : 'Cargando credencial…'}
          </span>
        </div>
      </div>
    );
  }

  /* Error creating */
  if (createError && !myCredential) {
    return (
      <div className="min-h-screen bg-[#06080E] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#ff6b6b]/[0.1] border border-[#ff6b6b]/[0.25] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-[#ff6b6b]" />
          </div>
          <div>
            <p className="text-white font-bold text-base mb-1">Error al generar credencial</p>
            <p className="text-white/45 text-sm">{createError}</p>
          </div>
          <Button
            onClick={handleAutoCreate}
            className="bg-[#C8FF00] text-black font-extrabold rounded-xl gap-2 hover:bg-[#d6ff26]"
          >
            <RefreshCcw className="w-4 h-4" /> Reintentar
          </Button>
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
                <Sparkles className="w-2.5 h-2.5" /> Licencia Verificada
              </div>
              <h1 className="font-sans font-extrabold leading-none tracking-tight text-[clamp(28px,4vw,44px)]">
                CREDENCIAL <span className="text-[#C8FF00]">ENTRENADOR</span>
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

          {/* Expired banner */}
          {isExpired && (
            <div className="flex items-center gap-4 bg-[#ff6b6b]/[0.07] border border-[#ff6b6b]/[0.25] rounded-2xl px-5 py-4 mb-8 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-[#ff6b6b]/[0.12] border border-[#ff6b6b]/[0.25] flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-[#ff6b6b]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#ff6b6b]">Tu licencia ha expirado</p>
                <p className="text-[11px] text-white/40 mt-0.5">Contacta a la administración para renovar tu licencia de entrenador</p>
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-7 items-start">

            {/* Left */}
            <div className="flex flex-col gap-4">
              <CredentialHoloCard credential={myCredential} photoUrl={profile?.profilePhoto} />

              {(() => {
                const start = new Date(myCredential?.issued_date || myCredential?.created_at);
                const end = getExpiryDate(myCredential);
                const now = new Date();
                const total = end.getTime() - start.getTime();
                const elapsed = Math.min(Math.max(now.getTime() - start.getTime(), 0), total);
                const pct = total > 0 ? Math.round((elapsed / total) * 100) : 0;
                const fmt = (d: Date) => d.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
                return (
                  <Panel icon={Calendar} title="Vigencia de Licencia">
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

              {/* NRTP */}
              <Panel icon={TrendingUp} title="Nivel de Certificación">
                <div className="flex items-end gap-5 mb-4">
                  <span className="font-sans font-extrabold text-[64px] leading-none tracking-tight text-[#C8FF00] drop-shadow-[0_0_30px_rgba(200,255,0,0.35)]">
                    {myCredential?.nrtp_level || 'Level 3'}
                  </span>
                  <div className="pb-2 flex flex-col gap-2">
                    <span className="text-[11px] text-[#C8FF00]/50 tracking-[2px] uppercase">de Level 5 (Pro)</span>
                    <Badge className="bg-[#C8FF00]/[0.1] border border-[#C8FF00]/[0.22] text-[#C8FF00] text-[11px] font-bold font-sans w-fit">
                      NRTP {myCredential?.nrtp_level || 'Level 3'}
                    </Badge>
                  </div>
                </div>
                <div className="h-[5px] bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7CAF00] via-[#C8FF00] to-[#E8FF80]"
                    style={{ width: `${nrtpPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-[#C8FF00]/30 tracking-[1px] mt-1.5">
                  {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Pro'].map(v => <span key={v}>{v}</span>)}
                </div>
                <Separator className="bg-[#C8FF00]/[0.08] my-3" />
                <InfoRow label="Club" value={myCredential?.club_name || 'Independiente'} />
                <InfoRow label="Estado" value={myCredential?.state_affiliation || 'N/A'} />
                <InfoRow
                  label="Afiliación"
                  value={
                    <span className={cn(
                      'capitalize font-semibold',
                      myCredential?.affiliation_status === 'active' ? 'text-[#C8FF00]' : 'text-[#ff6b6b]',
                    )}>
                      {myCredential?.affiliation_status}
                    </span>
                  }
                />
              </Panel>

              {/* 2-col */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Panel icon={User} title="Datos del Entrenador">
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
                        myCredential?.affiliation_status === 'active' ? 'text-[#C8FF00]' : 'text-[#ff6b6b]',
                      )}>
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full inline-block',
                          myCredential?.affiliation_status === 'active'
                            ? 'bg-[#C8FF00] shadow-[0_0_6px_#C8FF00]'
                            : 'bg-[#ff6b6b] shadow-[0_0_6px_#ff6b6b]',
                        )} />
                        {myCredential?.affiliation_status === 'active' ? 'Certificado' : 'Inactivo'}
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── FALLBACK (should not reach here after auto-create) ─────── */
  return (
    <div className="min-h-screen bg-[#06080E] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-5">
        <Loader2 className="w-7 h-7 text-[#C8FF00] animate-spin mx-auto" />
        <p className="text-white/60 text-sm">Preparando tu credencial…</p>
      </div>
    </div>
  );
}
