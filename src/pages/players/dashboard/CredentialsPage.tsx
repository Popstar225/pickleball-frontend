import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchMyDigitalCredential,
  createDigitalCredential,
} from '@/store/slices/digitalCredentialsSlice';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  Loader,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import Federation from '@/assets/images/international-federation.png';
import MXFlag from '@/assets/images/flag/MX.png';

// Logo
import FederationLogo from '@/assets/images/Logos/Logo pickleball compressed.png';
import IpfLogo from '@/assets/images/Logos/IPF.png';
import conadeLogo from '@/assets/images/Logos/conade-logo.png';

import { getFullImageUrl } from '@/common/tools';

/* ─── Global Styles ─────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  .cp * { box-sizing: border-box; margin: 0; padding: 0; }
  .cp { font-family: 'Outfit', sans-serif; }

  /* ── Ambient blobs ── */
  .cp-blob {
    position: fixed; pointer-events: none; border-radius: 50%; z-index: 0;
  }
  .cp-blob-1 {
    top: -15%; left: -10%; width: 650px; height: 650px;
    background: radial-gradient(circle, rgba(0,230,118,0.07) 0%, transparent 65%);
    animation: blobDrift 14s ease-in-out infinite alternate;
  }
  .cp-blob-2 {
    bottom: -15%; right: -8%; width: 550px; height: 550px;
    background: radial-gradient(circle, rgba(0,180,83,0.05) 0%, transparent 65%);
    animation: blobDrift 18s ease-in-out infinite alternate-reverse;
  }
  @keyframes blobDrift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(28px,20px) scale(1.06); }
  }

  /* ── Page header ── */
  .cp-page-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(38px, 5.5vw, 60px);
    letter-spacing: 3px; line-height: 1; color: #fff;
  }
  .cp-page-title span { color: #00e676; }
  .cp-subtitle {
    font-size: 11px; font-weight: 600; letter-spacing: 3px;
    color: rgba(0,230,118,0.6); text-transform: uppercase; margin-top: 7px;
  }
  .cp-tag {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(0,230,118,0.08); border: 1px solid rgba(0,230,118,0.18);
    border-radius: 99px; padding: 4px 12px; margin-bottom: 10px;
    font-size: 9px; font-weight: 700; letter-spacing: 2.5px;
    color: #00e676; text-transform: uppercase;
  }

  /* ── Holographic credential card ── */
  .holo-card {
    width: 100%; max-width: 340px;
    border-radius: 22px; overflow: hidden;
    background: linear-gradient(160deg, #071a0e 0%, #0c2417 55%, #071308 100%);
    border: 1px solid rgba(0,230,118,0.2);
    box-shadow:
      0 0 0 1px rgba(0,230,118,0.04),
      0 28px 70px rgba(0,0,0,0.75),
      0 0 70px rgba(0,230,118,0.07);
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: default;
    animation: cardIn 0.9s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes cardIn {
    from { opacity:0; transform: translateY(36px) rotateX(8deg); }
    to   { opacity:1; transform: translateY(0) rotateX(0); }
  }
  .holo-card:hover {
    box-shadow:
      0 0 0 1px rgba(0,230,118,0.22),
      0 36px 90px rgba(0,0,0,0.85),
      0 0 90px rgba(0,230,118,0.12);
  }

  /* Shimmer sweep */
  .holo-shimmer {
    position: absolute; inset: 0; z-index: 20; pointer-events: none;
    border-radius: 22px;
    background: linear-gradient(
      115deg,
      transparent 22%,
      rgba(0,255,140,0.04) 36%,
      rgba(100,255,190,0.09) 50%,
      rgba(0,255,140,0.04) 64%,
      transparent 78%
    );
    background-size: 260% 260%;
    animation: shimmerSweep 5s linear infinite;
  }
  @keyframes shimmerSweep {
    0%   { background-position: 160% 160%; }
    100% { background-position: -60% -60%; }
  }

  /* ── Top stripe ── */
  .card-topbar {
    height: 5px;
    background: linear-gradient(90deg, #00b248, #00e676, #69f0ae, #00e676, #00b248);
    background-size: 300% 100%;
    animation: barFlow 3.5s linear infinite;
  }
  @keyframes barFlow {
    0%   { background-position: 0% 0%; }
    100% { background-position: 300% 0%; }
  }

  /* ── Federation header ── */
  .card-fed-header {
    padding: 0;
    background: linear-gradient(135deg, #1a5c2a 0%, #236b33 45%, #1a5c2a 100%);
    position: relative; overflow: hidden;
  }
  .card-fed-header::before {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(
      -45deg,
      transparent, transparent 8px,
      rgba(0,0,0,0.05) 8px, rgba(0,0,0,0.05) 9px
    );
  }
  .card-fed-inner {
    position: relative; z-index: 1;
    padding: 14px 16px 10px;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .card-fed-emblems {
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .card-fed-emblem {
    width: 44px; height: 44px; border-radius: 50%;
    background: rgba(0,0,0,0.25);
    border: 1.5px solid rgba(255,255,255,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .card-fed-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px; letter-spacing: 3px;
    color: #fff; text-align: center; line-height: 1.1;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }
  .card-fed-city {
    background: #fff;
    color: #1a5c2a;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px; letter-spacing: 5px;
    padding: 4px 20px; border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  /* ── Photo zone ── */
  .card-photo-zone {
    position: relative; height: 210px; overflow: hidden;
  }
  .card-photo-bg-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
    filter: brightness(0.45) saturate(0.8);
  }
  .card-photo-bg-fallback {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, #0d3020 0%, #041008 100%);
  }
  .card-grid-overlay {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,230,118,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,230,118,0.04) 1px, transparent 1px);
    background-size: 26px 26px;
  }
  .card-jugador-label {
    position: absolute; top: 12px; left: 0; right: 0;
    text-align: center;
    font-family: 'Outfit', sans-serif;
    font-size: 9px; font-weight: 700; letter-spacing: 5px;
    color: rgba(255,255,255,0.7); text-transform: uppercase;
    text-shadow: 0 1px 4px rgba(0,0,0,0.8);
  }
  .card-player-photo-ring {
    position: absolute; left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    width: 110px; height: 110px; border-radius: 12px;
    border: 2.5px solid rgba(255,255,255,0.85);
    overflow: hidden; background: #1a3a22;
    box-shadow: 0 4px 24px rgba(0,0,0,0.6), 0 0 0 5px rgba(255,255,255,0.07);
    display: flex; align-items: center; justify-content: center;
    font-size: 48px;
  }
  .card-player-photo-ring img { width:100%; height:100%; object-fit:cover; }
  .card-name-overlay {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(0deg, rgba(6,30,14,0.96) 0%, rgba(6,30,14,0.7) 60%, transparent 100%);
    padding: 32px 14px 10px;
    text-align: center;
  }
  .card-player-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px; letter-spacing: 2px; color: #fff;
    text-shadow: 0 1px 6px rgba(0,0,0,0.8);
  }

  /* ── Status band ── */
  .card-status-band {
    padding: 7px 12px;
    text-align: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px; letter-spacing: 6px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .card-status-dot {
    width: 7px; height: 7px; border-radius: 50%;
    animation: statusPulse 2s ease infinite;
  }
  @keyframes statusPulse {
    0%,100% { opacity:1; transform:scale(1); box-shadow:0 0 0 0 currentColor; }
    50%      { opacity:0.6; transform:scale(0.75); }
  }

  /* ── ID band ── */
  .card-id-band {
    background: #0d1f13;
    padding: 7px 14px;
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px; letter-spacing: 4px;
    color: rgba(200,230,210,0.8);
    border-top: 1px solid rgba(0,230,118,0.08);
    border-bottom: 1px solid rgba(0,230,118,0.08);
  }

  /* ── Logos row ── */
  .card-logos-row {
    background: rgba(255,255,255,0.97);
    display: flex; align-items: center; justify-content: space-around;
    padding: 12px 20px;
    border-top: 1px solid rgba(0,0,0,0.06);
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .logo-ipf {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
  }
  .logo-ipf-ring {
    width: 46px; height: 46px; border-radius: 50%;
    background: linear-gradient(135deg, #1a3a6e, #2d5a9e);
    border: 2px solid #1a3a6e;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 9px; font-weight: 900; letter-spacing: 0.5px;
    text-align: center; line-height: 1.1;
  }
  .logo-feomex {
    display: flex; flex-direction: column; align-items: center; gap: 1px;
  }
  .logo-feomex-icon { font-size: 28px; }
  .logo-feomex-text { font-size: 9px; font-weight: 900; color: #1a5c2a; letter-spacing: 0.5px; }
  .logo-conade {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
  }
  .logo-conade-icon { font-size: 28px; }
  .logo-conade-text { font-size: 9px; font-weight: 900; color: #c62828; letter-spacing: 1px; }

  /* ── Age band ── */
  .card-age-band {
    background: linear-gradient(90deg, #1a5c2a, #236b33, #1a5c2a);
    padding: 8px 14px;
    text-align: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px; letter-spacing: 6px; color: #fff;
  }

  /* ── QR section ── */
  .card-qr-section {
    background: #fff;
    display: flex; flex-direction: column; align-items: center;
    padding: 16px 20px 12px; gap: 12px;
  }
  .card-qr-wrapper {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .card-qr-frame {
    padding: 8px; background: #fff;
    border: 2px solid #e0e0e0; border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  }
  .card-qr-frame img { display: block; width: 250px; height: 250px; }

  /* ── NTPR band ── */
  .card-ntpr-band {
    padding: 9px 14px;
    text-align: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px; letter-spacing: 5px; color: #fff;
  }

  /* ── Flag footer ── */
  .card-flag-footer {
    background: #fff;
    display: flex; align-items: center; justify-content: center;
    padding: 10px 14px;
    gap: 8px;
    border-top: 1px solid rgba(0,0,0,0.06);
  }

  /* ── Bottom bar ── */
  .card-bottombar {
    height: 4px;
    background: linear-gradient(90deg, #00b248, #69f0ae, #00b248);
    background-size: 300%; animation: barFlow 3.5s linear infinite;
  }

  /* ── Info panels ── */
  .cp-panel {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(0,230,118,0.12);
    border-radius: 16px; overflow: hidden;
    animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) both;
  }
  .cp-panel-d1 { animation-delay: 0.08s; }
  .cp-panel-d2 { animation-delay: 0.16s; }
  .cp-panel-d3 { animation-delay: 0.24s; }
  .cp-panel-d4 { animation-delay: 0.32s; }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .cp-panel-header {
    padding: 16px 20px 12px;
    border-bottom: 1px solid rgba(0,230,118,0.08);
    display: flex; align-items: center; gap: 10px;
  }
  .cp-panel-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(0,230,118,0.1); border: 1px solid rgba(0,230,118,0.18);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .cp-panel-title {
    font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: rgba(255,255,255,0.8);
  }
  .cp-panel-body { padding: 14px 20px; }

  /* Info rows */
  .i-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 13px;
  }
  .i-row:last-child { border-bottom: none; }
  .i-key { color: rgba(255,255,255,0.4); }
  .i-val { color: rgba(255,255,255,0.85); font-weight: 500; }
  .i-mono { font-family:'JetBrains Mono',monospace; font-size:11px; color:#00e676; }

  /* Benefit rows */
  .b-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 13px; color: rgba(255,255,255,0.78);
  }
  .b-item:last-child { border-bottom: none; }
  .b-icon {
    width: 26px; height: 26px; border-radius: 7px;
    background: rgba(0,230,118,0.1); border: 1px solid rgba(0,230,118,0.18);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* Payment rows */
  .p-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .p-row:last-child { border-bottom: none; }
  .p-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: rgba(0,230,118,0.07); border: 1px solid rgba(0,230,118,0.14);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .p-desc { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); }
  .p-meta { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; }
  .p-amount { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:1px; color:#00e676; }
  .p-badge {
    display: inline-block; font-size: 8px; font-weight: 700; letter-spacing: 1.5px;
    color: #00e676; background: rgba(0,230,118,0.1);
    border: 1px solid rgba(0,230,118,0.2);
    border-radius: 4px; padding: 2px 7px; text-transform: uppercase; margin-top: 3px;
  }

  /* NTPR bar */
  .ntpr-bar-wrap { height:5px; border-radius:3px; background:rgba(255,255,255,0.06); overflow:hidden; margin-top:6px; }
  .ntpr-bar {
    height:100%; border-radius:3px;
    background: linear-gradient(90deg, #00b248, #00e676, #69f0ae);
    animation: ntprGrow 1.3s cubic-bezier(0.16,1,0.3,1) both;
    animation-delay: 0.4s;
    transform-origin: left; transform: scaleX(0);
  }
  @keyframes ntprGrow { to { transform: scaleX(1); } }

  /* Vigencia bar */
  .vig-bar-wrap { height: 4px; border-radius: 2px; background: rgba(255,255,255,0.06); overflow: hidden; }
  .vig-bar {
    height:100%; width: 95%; border-radius:2px;
    background: linear-gradient(90deg, #00b248, #00e676);
    animation: ntprGrow 1.3s cubic-bezier(0.16,1,0.3,1) both;
    animation-delay: 0.5s;
    transform-origin: left; transform: scaleX(0);
  }

  /* Responsive */
  @media (max-width: 860px) {
    .cp-main-grid { grid-template-columns: 1fr !important; }
    .cp-two-col   { grid-template-columns: 1fr !important; }
    .holo-card    { max-width: 100%; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

/* ─── Holographic Card ──────────────────────────────────────── */
function HoloCard({ credential }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
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
  const statusText = isActive ? 'ACTIVO' : 'INACTIVO';

  return (
    <div className="holo-card" ref={ref}>
      <div className="holo-shimmer" />
      <div className="card-topbar" />

      {/* 1. Federation header — green banner with eagles + title */}
      <div className="card-fed-header">
        <div className="card-fed-inner">
          <div className="card-fed-emblems">
            <div className="card-fed-emblem">🦅</div>
            <div className="card-fed-title">
              FEDERACIÓN
              <br />
              MEXICANA DE
              <br />
              PICKLEBALL
            </div>
            <div className="card-fed-emblem">🦅</div>
          </div>
          <div className="card-fed-city">CIUDAD DE MÉXICO</div>
        </div>
      </div>

      {/* 2. Photo zone — court background + player portrait + name */}
      <div className="card-photo-zone">
        <img
          className="card-photo-bg-img"
          src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&q=70"
          alt=""
          onError={(e) => {
            // e.target.style.display = 'none';
          }}
        />
        <div className="card-photo-bg-fallback" />
        <div className="card-grid-overlay" />
        <div className="card-jugador-label">JUGADOR</div>
        <div className="card-player-photo-ring">
          {credential?.user?.profile_photo ? (
            <img src={getFullImageUrl(credential?.user?.profile_photo)} alt="player" />
          ) : (
            '👤'
          )}
        </div>
        <div className="card-name-overlay">
          <div className="card-player-name">{credential.player_name}</div>
        </div>
      </div>

      {/* 3. Status band */}
      <div className="card-status-band" style={{ background: statusBg, color: '#fff' }}>
        <div className="card-status-dot" style={{ background: statusColor, color: statusColor }} />
        {statusText}
      </div>

      {/* 4. Player ID */}
      <div className="card-id-band">{credential.credential_number || credential.id}</div>

      {/* 5. Logos row — IPF · Federation image · CONADE */}
      <div className="card-logos-row">
        <div className="logo-ipf">
          <img src={IpfLogo} alt="IPF" style={{ width: 50, height: 50, objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <img
            src={FederationLogo || Federation}
            alt="Federation"
            style={{
              width: 80,
              height: 50,
            }}
          />
        </div>
        <div className="logo-conade">
          <img
            src={conadeLogo}
            alt="CONADE"
            style={{ width: 50, height: 50, objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* 6. Age band */}
      <div className="card-age-band">{credential.state_affiliation || 'N/A'}</div>

      {/* 7. QR section */}
      <div className="card-qr-section">
        <div className="card-qr-wrapper">
          <div className="card-qr-frame">
            {credential.qr_code_url ? (
              <img src={getFullImageUrl(credential.qr_code_url)} alt="QR Code" />
            ) : (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${credential.verification_code}&margin=4&color=000000&bgcolor=ffffff`}
                alt="QR Code"
              />
            )}
          </div>
        </div>
      </div>

      {/* 8. NTPR band */}
      <div
        className="card-ntpr-band"
        style={{ background: 'linear-gradient(90deg,#1b5e20,#2e7d32,#1b5e20)' }}
      >
        NTPR: {credential.nrtp_level || '3.5'}
      </div>

      {/* 9. Flag footer */}
      <div className="card-flag-footer">
        <img src={MXFlag} alt="México" style={{ height: 32, width: 'auto' }} />
      </div>

      <div className="card-bottombar" />
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function PlayerCredentialsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { myCredential, loading, error } = useSelector(
    (state: RootState) => state.digitalCredentials,
  );
  const [isRenewing, setIsRenewing] = useState(false);
  const [creationStep, setCreationStep] = useState<'select' | 'processing' | null>(null);

  // Fetch credential on mount
  useEffect(() => {
    if (document.getElementById('cp-styles')) return;
    const s = document.createElement('style');
    s.id = 'cp-styles';
    s.textContent = STYLES;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    dispatch(fetchMyDigitalCredential());
  }, [dispatch]);

  // Payment plan options
  const paymentPlans = [
    {
      id: 'basic',
      name: 'Plan Básico',
      price: 25,
      duration: '1 Mes',
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
      features: [
        'Todo lo incluido en Membresía',
        'Estadísticas Avanzadas',
        'Eventos Exclusivos',
        'Consultoría de Entrenamiento',
      ],
    },
  ];

  // Handle create credential
  const handleCreateCredential = async (planId: string) => {
    setCreationStep('processing');
    try {
      // In a real app, this would initiate payment
      // For now, we'll just create the credential
      await dispatch(createDigitalCredential()).unwrap();
      setCreationStep(null);
    } catch (err) {
      console.error('Failed to create credential:', err);
      setCreationStep(null);
    }
  };

  const handleRenew = () => {
    setIsRenewing(true);
    setTimeout(() => {
      setIsRenewing(false);
      alert('¡Credencial renovada exitosamente!');
    }, 2000);
  };

  // Mock payment history - in real app would come from API
  const paymentHistory = [
    {
      id: 'PAY-001',
      date: new Date(myCredential?.issued_date || '2024-01-15').toISOString(),
      amount: 250,
      method: 'Stripe',
      description: 'Membresía Anual',
    },
  ];

  const benefits: [LucideIcon, string][] = [
    [Trophy, 'Participación en torneos oficiales'],
    [TrendingUp, 'Acceso a rankings nacionales'],
    [CreditCard, 'Descuentos en afiliación a clubes'],
    [Shield, 'Certificación digital verificable'],
    [Star, 'Acceso a eventos exclusivos'],
    [Zap, 'Soporte prioritario'],
  ];

  const ntprPct = myCredential ? (parseFloat(myCredential.nrtp_level || '3.5') / 8) * 100 : 0;

  if (myCredential) {
    return (
      <div
        className="cp"
        style={{
          minHeight: '100vh',
          background: '#050f0a',
          padding: '32px 24px 64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="cp-blob cp-blob-1" />
        <div className="cp-blob cp-blob-2" />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
          {/* ── Page Header ─────────────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 48,
            }}
          >
            <div>
              <div className="cp-tag">
                <Sparkles size={10} /> Membresía Verificada
              </div>
              <h1 className="cp-page-title">
                CREDENCIAL <span>DIGITAL</span>
              </h1>
              <p className="cp-subtitle">Federación Mexicana de Pickleball · CDMX</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                variant="outline"
                onClick={() => alert('Descargando credencial...')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(0,230,118,0.22)',
                  color: '#e8f5e9',
                  fontFamily: "'Outfit',sans-serif",
                  borderRadius: 10,
                  padding: '8px 14px',
                  gap: 7,
                  fontSize: 13,
                }}
              >
                <Download size={14} /> Descargar
              </Button>
              <Button
                onClick={() => alert('QR Verificado ✓')}
                style={{
                  background: '#00e676',
                  color: '#000',
                  fontWeight: 700,
                  fontFamily: "'Outfit',sans-serif",
                  borderRadius: 10,
                  gap: 7,
                  fontSize: 13,
                  padding: '8px 14px',
                  boxShadow: '0 4px 18px rgba(0,230,118,0.3)',
                }}
              >
                <QrCode size={14} /> Verificar QR
              </Button>
            </div>
          </div>

          {/* ── Main Grid ───────────────────────── */}
          <div
            className="cp-main-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '340px 1fr',
              gap: 32,
              alignItems: 'start',
            }}
          >
            {/* LEFT: Credential card + vigencia */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <HoloCard credential={myCredential} />

              {/* Vigencia card */}
              <div className="cp-panel cp-panel-d1">
                <div className="cp-panel-header">
                  <div className="cp-panel-icon">
                    <Calendar size={14} color="#00e676" />
                  </div>
                  <span className="cp-panel-title">Vigencia de Membresía</span>
                </div>
                <div className="cp-panel-body">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.45)',
                      marginBottom: 8,
                    }}
                  >
                    <span>
                      Emitida:{' '}
                      <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {new Date(myCredential?.created_at)?.toLocaleDateString('es-MX')}
                      </span>
                    </span>
                    <span>
                      Expira:{' '}
                      <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {myCredential?.expiry_date
                          ? new Date(myCredential?.expiry_date)?.toLocaleDateString('es-MX')
                          : 'N/A'}
                      </span>
                    </span>
                  </div>
                  <div className="vig-bar-wrap">
                    <div className="vig-bar" />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 10,
                      color: 'rgba(76,175,120,0.45)',
                      marginTop: 5,
                    }}
                  >
                    <span>Ene 2024</span>
                    <span style={{ color: '#00e676' }}>95% transcurrido</span>
                    <span>Dic 2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Info panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* NTPR */}
              <div className="cp-panel cp-panel-d1">
                <div className="cp-panel-header">
                  <div className="cp-panel-icon">
                    <TrendingUp size={14} color="#00e676" />
                  </div>
                  <span className="cp-panel-title">Nivel NTPR</span>
                </div>
                <div className="cp-panel-body">
                  <div
                    style={{ display: 'flex', alignItems: 'flex-end', gap: 18, marginBottom: 16 }}
                  >
                    <div
                      style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 72,
                        lineHeight: 1,
                        color: '#00e676',
                        letterSpacing: 2,
                        textShadow: '0 0 30px rgba(0,230,118,0.35)',
                      }}
                    >
                      {myCredential?.nrtp_level || '3.5'}
                    </div>
                    <div style={{ paddingBottom: 8 }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'rgba(76,175,120,0.6)',
                          letterSpacing: 2,
                          textTransform: 'uppercase',
                          marginBottom: 6,
                        }}
                      >
                        de 8.0 máximo
                      </div>
                      <Badge
                        style={{
                          background: 'rgba(0,230,118,0.1)',
                          border: '1px solid rgba(0,230,118,0.22)',
                          color: '#00e676',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 1,
                          fontFamily: "'Outfit',sans-serif",
                        }}
                      >
                        NTPR {myCredential?.nrtp_level || '3.5'}
                      </Badge>
                    </div>
                  </div>
                  <div className="ntpr-bar-wrap">
                    <div className="ntpr-bar" style={{ width: `${ntprPct}%` }} />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 9,
                      color: 'rgba(76,175,120,0.4)',
                      marginTop: 5,
                      letterSpacing: 1,
                    }}
                  >
                    {['1.0', '2.5', '4.0', '5.5', '7.0', '8.0'].map((v) => (
                      <span key={v}>{v}</span>
                    ))}
                  </div>
                  <Separator style={{ background: 'rgba(0,230,118,0.08)', margin: '14px 0' }} />
                  <div className="i-row">
                    <span className="i-key">Club</span>
                    <span className="i-val">{myCredential?.club_name || 'Independiente'}</span>
                  </div>
                  <div className="i-row">
                    <span className="i-key">Estado</span>
                    <span className="i-val">{myCredential?.state_affiliation || 'N/A'}</span>
                  </div>
                  <div className="i-row">
                    <span className="i-key">Afiliación</span>
                    <span
                      className="i-val"
                      style={{
                        textTransform: 'capitalize',
                        color:
                          myCredential?.affiliation_status === 'active' ? '#00e676' : '#ff6b6b',
                      }}
                    >
                      {myCredential?.affiliation_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2-col: Player details + Benefits */}
              <div
                className="cp-two-col"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}
              >
                <div className="cp-panel cp-panel-d2">
                  <div className="cp-panel-header">
                    <div className="cp-panel-icon">
                      <User size={13} color="#00e676" />
                    </div>
                    <span className="cp-panel-title">Datos del Jugador</span>
                  </div>
                  <div className="cp-panel-body">
                    <div className="i-row">
                      <span className="i-key">Número</span>
                      <span className="i-mono">{myCredential?.credential_number}</span>
                    </div>
                    <div className="i-row">
                      <span className="i-key">Código</span>
                      <span className="i-mono">{myCredential?.verification_code}</span>
                    </div>
                    <div className="i-row">
                      <span className="i-key">Estado</span>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 13,
                          color:
                            myCredential?.affiliation_status === 'active' ? '#00e676' : '#ff6b6b',
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background:
                              myCredential?.affiliation_status === 'active' ? '#00e676' : '#ff6b6b',
                            boxShadow:
                              myCredential?.affiliation_status === 'active'
                                ? '0 0 6px #00e676'
                                : '0 0 6px #ff6b6b',
                            display: 'inline-block',
                            animation: 'statusPulse 2s ease infinite',
                          }}
                        />
                        {myCredential?.affiliation_status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="i-row">
                      <span className="i-key">Emitida</span>
                      <span className="i-val">
                        {myCredential?.issued_date
                          ? new Date(myCredential?.issued_date).toLocaleDateString('es-MX')
                          : 'Sin datos'}
                      </span>
                    </div>
                    <div className="i-row">
                      <span className="i-key">Expira</span>
                      <span className="i-val">
                        {myCredential?.expiry_date
                          ? new Date(myCredential?.expiry_date).toLocaleDateString('es-MX')
                          : 'Sin expiración'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="cp-panel cp-panel-d3">
                  <div className="cp-panel-header">
                    <div className="cp-panel-icon">
                      <CheckCircle2 size={13} color="#00e676" />
                    </div>
                    <span className="cp-panel-title">Beneficios</span>
                  </div>
                  <div className="cp-panel-body">
                    {benefits.map(([Icon, text], i) => (
                      <div className="b-item" key={i}>
                        <div className="b-icon">
                          <Icon size={12} color="#00e676" />
                        </div>
                        <span style={{ fontSize: 12, lineHeight: 1.35 }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="cp-panel cp-panel-d4">
                <div className="cp-panel-header" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="cp-panel-icon">
                      <CreditCard size={14} color="#00e676" />
                    </div>
                    <span className="cp-panel-title">Historial de Pagos</span>
                  </div>
                  <Button
                    onClick={handleRenew}
                    disabled={isRenewing}
                    style={{
                      background: isRenewing ? 'rgba(0,230,118,0.12)' : '#00e676',
                      color: isRenewing ? '#00e676' : '#000',
                      fontWeight: 700,
                      fontFamily: "'Outfit',sans-serif",
                      borderRadius: 9,
                      fontSize: 12,
                      gap: 6,
                      height: 34,
                      padding: '0 14px',
                      border: isRenewing ? '1px solid rgba(0,230,118,0.3)' : 'none',
                      boxShadow: isRenewing ? 'none' : '0 3px 14px rgba(0,230,118,0.28)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <RefreshCcw
                      size={13}
                      style={{ animation: isRenewing ? 'spin 1s linear infinite' : 'none' }}
                    />
                    {isRenewing ? 'Procesando...' : 'Renovar $500 MXN'}
                  </Button>
                </div>
                <div className="cp-panel-body">
                  {paymentHistory.map((p) => (
                    <div className="p-row" key={p.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="p-icon">
                          <CheckCircle2 size={17} color="#00e676" />
                        </div>
                        <div>
                          <div className="p-desc">{p.description}</div>
                          <div className="p-meta">
                            {new Date(p.date).toLocaleDateString('es-MX')} · {p.method} · {p.id}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="p-amount">
                          ${p.amount} <span style={{ fontSize: 13, letterSpacing: 0 }}>MXN</span>
                        </div>
                        <div className="p-badge">Completado</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No credential exists - show payment plans to create one
  return (
    <div
      className="cp"
      style={{
        minHeight: '100vh',
        background: '#050f0a',
        padding: '32px 24px 64px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="cp-blob cp-blob-1" />
      <div className="cp-blob cp-blob-2" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div className="cp-tag" style={{ justifyContent: 'center', marginBottom: 16 }}>
            <AlertCircle size={12} /> Sin Credencial Activa
          </div>
          <h1 className="cp-page-title">
            CREAR CREDENCIAL <span>DIGITAL</span>
          </h1>
          <p className="cp-subtitle">Elige un plan y obtén tu credencial de jugador oficial</p>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: 12,
              padding: '16px',
              marginBottom: 32,
              color: '#ff6b6b',
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Payment Plans */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            marginBottom: 48,
          }}
        >
          {paymentPlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: plan.popular
                  ? 'linear-gradient(135deg, rgba(0,230,118,0.15) 0%, rgba(0,180,83,0.08) 100%)'
                  : 'rgba(255,255,255,0.02)',
                border: plan.popular
                  ? '2px solid rgba(0,230,118,0.4)'
                  : '1px solid rgba(0,230,118,0.12)',
                borderRadius: 16,
                padding: '28px 24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: -40,
                    background: '#00e676',
                    color: '#000',
                    padding: '4px 48px',
                    transform: 'rotate(45deg)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  POPULAR
                </div>
              )}

              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 8,
                }}
              >
                {plan.name}
              </h3>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: '#00e676',
                    fontFamily: "'Bebas Neue', sans-serif",
                  }}
                >
                  ${plan.price}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                  MXN / {plan.duration}
                </span>
              </div>

              <Separator style={{ background: 'rgba(0,230,118,0.08)', margin: '16px 0' }} />

              <ul style={{ marginBottom: 24 }}>
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.7)',
                      marginBottom: 10,
                    }}
                  >
                    <CheckCircle2 size={14} color="#00e676" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCreateCredential(plan.id)}
                disabled={creationStep === 'processing'}
                style={{
                  width: '100%',
                  background: plan.popular ? '#00e676' : 'rgba(0,230,118,0.1)',
                  color: plan.popular ? '#000' : '#00e676',
                  fontWeight: 700,
                  borderRadius: 10,
                  padding: '12px 16px',
                  fontSize: 13,
                  border: plan.popular ? 'none' : '1px solid rgba(0,230,118,0.2)',
                  boxShadow: plan.popular ? '0 4px 16px rgba(0,230,118,0.3)' : 'none',
                }}
              >
                {creationStep === 'processing' ? 'Procesando...' : 'Seleccionar Plan'}
              </Button>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="cp-panel" style={{ marginTop: 32 }}>
          <div className="cp-panel-header">
            <div className="cp-panel-icon">
              <Sparkles size={14} color="#00e676" />
            </div>
            <span className="cp-panel-title">¿Qué incluye tu credencial?</span>
          </div>
          <div className="cp-panel-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 16,
              }}
            >
              {benefits.map(([Icon, text], i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(0,230,118,0.1)',
                      border: '1px solid rgba(0,230,118,0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} color="#00e676" />
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
