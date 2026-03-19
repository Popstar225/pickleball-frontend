import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getFullImageUrl } from '@/common/tools';
import { Mexico } from '@/constants/constants';

import MXFlag from '@/assets/images/flag/MX.png';
import FederationLogo from '@/assets/images/Logos/Logo pickleball compressed.png';
import IpfLogo from '@/assets/images/Logos/IPF.png';
import conadeLogo from '@/assets/images/Logos/conade-logo.png';
import EagleImg from '@/assets/images/toppng.png';

function getStateName(raw: string | null | undefined): string {
  if (!raw) return 'N/A';
  const upper = raw.trim().toUpperCase();
  const match = Mexico.find(s => s.code.toUpperCase() === upper || s.state.toUpperCase() === upper);
  return match ? match.state.toUpperCase() : raw.toUpperCase();
}

interface Props {
  credential: any;
  photoUrl?: string | null;
}

export function CredentialHoloCard({ credential, photoUrl }: Props) {
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
  const isCoach = !!credential.coach_name;
  const displayName = credential.player_name || credential.coach_name || '—';
  const roleLabel = isCoach ? 'ENTRENADOR' : 'JUGADOR';
  const photo = credential?.user?.profile_photo || photoUrl;
  const ntprLabel = isCoach ? 'NRTP' : 'NTPR';
console.log('xxxxxxxx', credential)
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
      <div
        className="relative overflow-hidden bg-[#006847]"
        style={{
          minHeight: 90,
          backgroundImage: `url(${EagleImg})`,
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-center px-5 py-4 gap-1">
          <div className="font-sans font-extrabold text-white text-center leading-[1.25] tracking-[1px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
            <div className="text-[16px]">FEDERACIÓN</div>
            <div className="text-[16px]">MEXICANA DE</div>
            <div className="text-[16px]">PICKLEBALL</div>
          </div>
        </div>
      </div>

      {/* State name */}
      <div className="font-sans font-extrabold text-center text-[12px] text-black tracking-[1.5px] bg-white uppercase py-1">
        {getStateName(credential.state_affiliation)}
      </div>

      {/* Photo zone */}
      <div className="relative h-[300px] overflow-hidden bg-gradient-to-b from-[#0A1A06] to-[#050D03]">
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(200,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,255,0,0.03)_1px,transparent_1px)] [background-size:24px_24px]" />
        <p className="absolute top-3 inset-x-0 text-center font-sans text-[12px] font-bold tracking-[1.5px] text-white uppercase">
          {roleLabel}
        </p>
        <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-[12px] border-2 border-white/80 bg-[#12152A] overflow-hidden flex items-center justify-center text-5xl shadow-[0_6px_32px_rgba(0,0,0,0.7),0_0_0_5px_rgba(255,255,255,0.06)]">
          {photo
            ? <img src={getFullImageUrl(photo)} alt={displayName} className="w-full h-full object-cover" />
            : (isCoach ? '👨‍🏫' : '👤')}
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[rgba(5,9,3,0.97)] via-[rgba(5,9,3,0.7)] to-transparent pb-3 pt-10 px-3 text-center">
          <p className="font-sans font-extrabold text-[18px] tracking-[1.5px] text-white leading-tight">
            {displayName}
          </p>
          {credential?.user?.date_of_birth && (
            <p className="font-sans text-[12px] text-[#C8FF00]/80 tracking-[1px] mt-1">
              {new Date(credential.user.date_of_birth).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
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
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${import.meta.env.VITE_BASIC_URI || window.location.origin}/verify-credential/${credential.verification_code}`)}&margin=4`}
              alt="QR"
              className="w-[200px] h-[200px] block"
            />
          )}
        </div>
      </div>

      {/* NTPR / NRTP */}
      <div className="py-2 text-center font-sans font-extrabold text-[18px] tracking-[5px] text-white bg-gradient-to-r from-[#152B0B] via-[#1F3E10] to-[#152B0B]">
        {ntprLabel}: {credential.nrtp_level || (isCoach ? 'Level 3' : '3.5')}
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
