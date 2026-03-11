import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { imageBaseURL } from '@/lib/const';
import MicrositeSchedule from './MicrositeSchedule';
import {
  MapPin, Phone, Mail, Globe, Calendar, Users, Trophy,
  Dumbbell, ImageIcon, AlertCircle, ArrowLeft, ChevronUp, ChevronDown,
  ArrowRight, FileText, CheckCircle2, XCircle, Clock,
  LayoutGrid, Bell, Menu, X, ChevronLeft, ChevronRight, Sparkles,
  ExternalLink, Zap,
} from 'lucide-react';

const IMG_BASE = imageBaseURL;

interface MicrositeData {
  owner: {
    id: string; username: string; name: string; type: string; bio: string;
    logo: string | null; website: string | null;
    contact: { email: string; phone: string; whatsapp: string; address: string | null; state: string; city: string; };
    member_since: string;
  };
  microsite: {
    banner_url: string | null;
    gallery: { id: string; url: string; caption: string; order: number }[];
    sponsors: { id: string; name: string; logo_url: string | null; website: string }[];
    theme_color: string;
  };
  tournaments: any[];
  courts: any[];
  announcements: any[];
  coaches: any[];
  blogPosts: any[];
}

function getInitials(name: string) {
  return (name || 'M').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function formatDate(d: string) {
  try { return format(new Date(d), 'dd MMM yyyy', { locale: es }); } catch { return d; }
}

// Inject Google Fonts
if (typeof document !== 'undefined' && !document.getElementById('ms-fonts')) {
  const link = document.createElement('link');
  link.id = 'ms-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,800&family=DM+Sans:wght@400;500;600&display=swap';
  document.head.appendChild(link);
}

// Pickleball court SVG lines — decorative background for sections without images
function CourtLines({ color = '#ace600' }: { color?: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="80" y="50" width="640" height="400" fill="none" stroke={color} strokeWidth="2.5" opacity="0.22" />
      <line x1="400" y1="50" x2="400" y2="450" stroke={color} strokeWidth="2.5" opacity="0.22" />
      <line x1="80" y1="183" x2="400" y2="183" stroke={color} strokeWidth="2" opacity="0.15" />
      <line x1="400" y1="183" x2="720" y2="183" stroke={color} strokeWidth="2" opacity="0.15" />
      <line x1="80" y1="317" x2="400" y2="317" stroke={color} strokeWidth="2" opacity="0.15" />
      <line x1="400" y1="317" x2="720" y2="317" stroke={color} strokeWidth="2" opacity="0.15" />
      <line x1="240" y1="183" x2="240" y2="317" stroke={color} strokeWidth="1.5" opacity="0.10" />
      <line x1="560" y1="183" x2="560" y2="317" stroke={color} strokeWidth="1.5" opacity="0.10" />
      <circle cx="680" cy="80" r="44" fill="none" stroke={color} strokeWidth="2" opacity="0.10" />
      <circle cx="680" cy="80" r="22" fill="none" stroke={color} strokeWidth="1.5" opacity="0.08" />
      <circle cx="118" cy="420" r="32" fill="none" stroke={color} strokeWidth="2" opacity="0.08" />
    </svg>
  );
}

export default function PublicMicrositePage() {
  const { type, username } = useParams<{ type: string; username: string }>();
  const [data, setData] = useState<MicrositeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const bannerY = useTransform(scrollY, [0, 700], [0, 130]);

  useEffect(() => {
    if (!type || !username) return;
    setLoading(true);
    api.get<{ success: boolean; data: MicrositeData }>(`/microsites/${type}/${username}`)
      .then(res => { if (res?.success) setData(res.data); else setError('Micrositio no encontrado'); })
      .catch(() => setError('Micrositio no disponible'))
      .finally(() => setLoading(false));
  }, [type, username]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigateLightbox = (dir: number) => {
    if (lightboxIndex === null || !data) return;
    setLightboxIndex((lightboxIndex + dir + data.microsite.gallery.length) % data.microsite.gallery.length);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-[#ace600] flex items-center justify-center shadow-[0_0_40px_#ace60060]"
        >
          <Sparkles className="w-8 h-8 text-black" />
        </motion.div>
        <p className="text-xs font-bold text-slate-500 tracking-[0.25em] uppercase">Cargando micrositio…</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-xl font-bold text-white text-center">{error || 'Micrositio no encontrado'}</p>
      <Link to="/"
        className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#ace600] text-black text-sm font-black hover:bg-[#c6f000] transition-all">
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>
    </div>
  );

  const { owner, microsite, tournaments, courts, announcements, coaches, blogPosts } = data;
  const tc = microsite.theme_color || '#ace600';
  const typeLabel = { club: 'Club', state: 'Asociación Estatal', partner: 'Socio' }[owner.type] || '';
  const nextTournament = tournaments.find(t => new Date(t.start_date) >= new Date());
  const upcomingCount = tournaments.filter(t => new Date(t.start_date) >= new Date()).length;

  const navItems = [
    ...(announcements.length > 0   ? [{ id: 'announcements', label: 'Anuncios' }]    : []),
    ...(microsite.gallery.length > 0 ? [{ id: 'gallery',       label: 'Galería' }]    : []),
    ...(coaches.length > 0          ? [{ id: 'coaches',        label: 'Entrenadores' }] : []),
    ...(tournaments.length > 0      ? [{ id: 'tournaments',    label: 'Torneos' }]    : []),
    ...(type === 'club' && courts.length > 0 ? [{ id: 'courts', label: 'Canchas' }]  : []),
    { id: 'schedule', label: 'Calendario' },
    ...(blogPosts.length > 0        ? [{ id: 'blog',           label: 'Blog' }]       : []),
    { id: 'contact', label: 'Contacto' },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-white text-slate-900 overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative w-full min-h-[100dvh] flex flex-col overflow-hidden">

        {/* Background layer */}
        {microsite.banner_url ? (
          <motion.div className="absolute inset-0" style={{ y: bannerY }}>
            <img
              src={microsite.banner_url} alt=""
              className="w-full h-full object-cover scale-110 select-none pointer-events-none"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-slate-950">
            <CourtLines color={tc} />
            {/* Ambient glow blobs */}
            <div className="absolute top-0 right-0 w-[55vw] h-[55vh] rounded-full blur-[130px] opacity-20 pointer-events-none"
              style={{ background: tc }} />
            <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] rounded-full blur-[100px] opacity-10 pointer-events-none"
              style={{ background: tc }} />
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/88" />

        {/* ── Hero content ── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center pt-20 pb-6">

          {/* Logo ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7"
          >
            <div className="relative inline-block">
              <div
                className="w-28 h-28 md:w-32 md:h-32 rounded-3xl flex items-center justify-center overflow-hidden border border-white/15 shadow-2xl"
                style={{ background: `${tc}22`, backdropFilter: 'blur(12px)' }}
              >
                {owner.logo
                  ? <img src={`${IMG_BASE}${owner.logo}`} alt={owner.name} className="w-full h-full object-contain p-3" />
                  : <span className="font-black text-5xl text-white select-none"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{getInitials(owner.name)}</span>
                }
              </div>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ boxShadow: `0 0 50px ${tc}55` }} />
              {/* Status dot */}
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-[3px] border-slate-950 flex items-center justify-center"
                style={{ background: tc }}>
                <div className="w-2 h-2 rounded-full bg-black/50" />
              </div>
            </div>
          </motion.div>

          {/* Type badge */}
          {typeLabel && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 border"
                style={{ background: `${tc}20`, color: tc, borderColor: `${tc}40` }}>
                <Zap className="w-2.5 h-2.5" /> {typeLabel}
              </span>
            </motion.div>
          )}

          {/* Club name */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-white font-black uppercase leading-none tracking-tight mb-4 px-2"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(2.6rem, 9vw, 6rem)',
              letterSpacing: '-0.025em',
              textShadow: '0 4px 30px rgba(0,0,0,0.5)',
            }}
          >
            {owner.name}
          </motion.h1>

          {/* Location */}
          {(owner.contact.city || owner.contact.state) && (
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-white/55 font-semibold text-sm mb-4"
            >
              <MapPin className="w-4 h-4 shrink-0" style={{ color: tc }} />
              {[owner.contact.city, owner.contact.state].filter(Boolean).join(', ')}
            </motion.p>
          )}

          {/* Bio */}
          {owner.bio && (
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="text-white/45 text-sm max-w-lg leading-relaxed mb-8 px-2"
            >
              {owner.bio}
            </motion.p>
          )}

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <a href="#contact"
              className="inline-flex items-center gap-2 h-11 px-7 rounded-xl font-black text-sm text-black uppercase tracking-wide transition-opacity hover:opacity-90 shadow-lg"
              style={{ background: tc, boxShadow: `0 6px 28px ${tc}70` }}>
              <Mail className="w-4 h-4" /> Contactar
            </a>
            {owner.website && (
              <a href={owner.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-7 rounded-xl font-black text-sm text-white uppercase tracking-wide bg-white/10 hover:bg-white/18 border border-white/20 transition-all backdrop-blur-sm">
                <ExternalLink className="w-4 h-4" /> Sitio Web
              </a>
            )}
          </motion.div>
        </div>

        {/* ── Stats bar at bottom ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="relative z-10 border-t border-white/10 bg-black/35 backdrop-blur-lg"
        >
          <div className="max-w-3xl mx-auto px-4 py-5">
            <div className="grid grid-cols-3 divide-x divide-white/10">
              {[
                { label: 'Torneos',      value: tournaments.length,       icon: Trophy },
                { label: 'Entrenadores', value: coaches.length,           icon: Dumbbell },
                { label: 'Fotos',        value: microsite.gallery.length, icon: ImageIcon },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center px-4 py-1">
                  <Icon className="w-4 h-4 mx-auto mb-1.5 opacity-40" style={{ color: tc }} />
                  <div
                    className="font-black text-white tabular-nums leading-none"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2rem' }}
                  >{value}</div>
                  <div className="text-[10px] text-white/35 uppercase tracking-[0.18em] font-bold mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        >
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}>
            <ChevronDown className="w-6 h-6 text-white/25" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STICKY NAV ───────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/96 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Mini logo + name */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100"
                style={{ background: `${tc}18` }}>
                {owner.logo
                  ? <img src={`${IMG_BASE}${owner.logo}`} alt="" className="w-full h-full object-contain" />
                  : <span className="text-[10px] font-black" style={{ color: tc }}>{getInitials(owner.name)}</span>
                }
              </div>
              <span className="hidden sm:block text-sm font-black text-slate-800 uppercase tracking-tight"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {owner.name}
              </span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center">
              {navItems.map(item => (
                <a key={item.id} href={`#${item.id}`}
                  className="relative px-3 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors group">
                  {item.label}
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                    style={{ background: tc }} />
                </a>
              ))}
            </div>

            {/* CTA + mobile button */}
            <div className="flex items-center gap-2">
              <a href="#contact"
                className="hidden sm:inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest text-black hover:opacity-85 transition-opacity"
                style={{ background: tc }}>
                <Mail className="w-3 h-3" /> Contacto
              </a>
              <button
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileNavOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="md:hidden overflow-hidden border-t border-slate-100"
              >
                <div className="py-2 grid grid-cols-2 gap-1">
                  {navItems.map(item => (
                    <a key={item.id} href={`#${item.id}`} onClick={() => setMobileNavOpen(false)}
                      className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                      {item.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ── SPONSORS ─────────────────────────────────────────────────────────── */}
      {microsite.sponsors.length > 0 && (
        <section className="py-10 border-b border-slate-100 overflow-hidden" style={{ background: `${tc}06` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-7">
              Patrocinadores &amp; Socios
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
              {microsite.sponsors.map((sp, i) => (
                <motion.a
                  key={sp.id}
                  href={sp.website || '#'} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300"
                >
                  {sp.logo_url
                    ? <img src={sp.logo_url} alt={sp.name} className="h-7 object-contain grayscale group-hover:grayscale-0 transition-all" />
                    : <span className="font-black text-sm text-slate-400 group-hover:text-slate-700 transition-colors tracking-wide"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{sp.name}</span>
                  }
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ANNOUNCEMENTS ────────────────────────────────────────────────────── */}
      {announcements.length > 0 && (
        <section id="announcements" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead icon={Bell} title="Anuncios" subtitle="Mantente al día con las últimas noticias" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map((ann, i) => (
                <motion.article key={ann.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="group relative bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                  style={ann.is_pinned ? { borderColor: `${tc}35` } : {}}
                >
                  {/* Priority top bar */}
                  <div className="h-1 rounded-t-2xl" style={{
                    background: ann.priority === 'high' ? '#ef4444' : ann.is_pinned ? tc : '#e2e8f0'
                  }} />
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Number badge */}
                      <div
                        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-base"
                        style={{ background: `${tc}12`, color: tc, fontFamily: "'Barlow Condensed', sans-serif" }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          {ann.category && (
                            <span className="px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest"
                              style={{ background: `${tc}15`, color: tc }}>{ann.category}</span>
                          )}
                          {ann.is_pinned && (
                            <span className="px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest bg-slate-100 text-slate-500">
                              Fijado
                            </span>
                          )}
                          {ann.priority === 'high' && (
                            <span className="px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest bg-red-50 text-red-500">
                              Urgente
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-black text-slate-900 leading-tight mb-1.5"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{ann.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{ann.content}</p>
                        <span className="inline-flex items-center gap-1 mt-2.5 text-[11px] text-slate-300 font-medium">
                          <Calendar className="w-3 h-3" />{formatDate(ann.created_at)}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GALLERY ──────────────────────────────────────────────────────────── */}
      {microsite.gallery.length > 0 && (
        <section id="gallery" className="py-20" style={{ background: `${tc}06` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead
              icon={ImageIcon}
              title="Galería"
              subtitle={`${microsite.gallery.length} foto${microsite.gallery.length !== 1 ? 's' : ''} de nuestros eventos`}
              tc={tc}
            />

            {/* Masonry grid — first image featured (2×2) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ gridAutoRows: '200px' }}>
              {microsite.gallery.map((img, i) => {
                const isFeatured = i === 0 && microsite.gallery.length > 2;
                return (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.35) }}
                    className={cn(
                      'group cursor-pointer relative rounded-2xl overflow-hidden border-2 border-white hover:shadow-2xl transition-all duration-300',
                      isFeatured && 'col-span-2 row-span-2',
                    )}
                    onClick={() => setLightboxIndex(i)}
                  >
                    <img
                      src={img.url} alt={img.caption || ''}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Caption */}
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white font-bold text-sm drop-shadow-lg line-clamp-1">{img.caption}</p>
                      </div>
                    )}
                    {/* Index badge */}
                    <div
                      className="absolute top-2.5 left-2.5 w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black text-black opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: tc }}
                    >
                      {i + 1}
                    </div>
                    {isFeatured && (
                      <div
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-black"
                        style={{ background: tc }}
                      >
                        Destacada
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Lightbox ── */}
          <AnimatePresence>
            {lightboxIndex !== null && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                onClick={() => setLightboxIndex(null)}
              >
                <button onClick={() => setLightboxIndex(null)}
                  className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10">
                  <X className="w-5 h-5" />
                </button>
                <button onClick={e => { e.stopPropagation(); navigateLightbox(-1); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={e => { e.stopPropagation(); navigateLightbox(1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <motion.div
                  key={lightboxIndex}
                  initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-4xl w-full"
                  onClick={e => e.stopPropagation()}
                >
                  <img
                    src={microsite.gallery[lightboxIndex].url} alt=""
                    className="w-full rounded-2xl shadow-2xl max-h-[75vh] object-contain"
                  />
                  {microsite.gallery[lightboxIndex].caption && (
                    <p className="text-center text-white/65 font-semibold text-sm mt-4">
                      {microsite.gallery[lightboxIndex].caption}
                    </p>
                  )}
                  <p className="text-center text-white/25 text-xs mt-2 font-medium tracking-widest">
                    {lightboxIndex + 1} / {microsite.gallery.length}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* ── COACHES ──────────────────────────────────────────────────────────── */}
      {coaches.length > 0 && (
        <section id="coaches" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead icon={Dumbbell} title="Entrenadores" subtitle="Profesionales certificados dedicados a tu desarrollo" tc={tc} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {coaches.map((c, i) => (
                <motion.div key={c.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Photo header */}
                  <div className="relative h-40 overflow-hidden" style={{ background: `${tc}0c` }}>
                    <CourtLines color={tc} />
                    {c.profile_photo ? (
                      <img
                        src={`${IMG_BASE}${c.profile_photo}`} alt={c.full_name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="font-black select-none opacity-[0.18]"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '5rem', color: tc }}
                        >
                          {getInitials(c.full_name)}
                        </span>
                      </div>
                    )}
                    {/* Bottom fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    {/* Skill level */}
                    {c.skill_level && (
                      <div className="absolute top-3 right-3">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg text-black"
                          style={{ background: tc }}
                        >
                          Nivel {c.skill_level}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="px-5 pb-5 -mt-1">
                    <h3
                      className="font-black text-xl text-slate-900 leading-tight"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >{c.full_name}</h3>
                    {(c.city || c.state) && (
                      <p className="text-sm text-slate-400 flex items-center gap-1.5 font-medium mt-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: tc }} />
                        {[c.city, c.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {c.bio && <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mt-2">{c.bio}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TOURNAMENTS ──────────────────────────────────────────────────────── */}
      {tournaments.length > 0 && (
        <section id="tournaments" className="py-20" style={{ background: `${tc}06` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead icon={Trophy} title="Torneos" subtitle="Competencias y eventos próximos" tc={tc} />

            {/* Featured next tournament */}
            {nextTournament && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative rounded-3xl overflow-hidden mb-5 border border-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${tc}14 0%, ${tc}06 100%)` }}
              >
                {/* Decorative trophy watermark */}
                <div className="absolute right-6 top-0 bottom-0 flex items-center pointer-events-none select-none">
                  <Trophy className="w-48 h-48 opacity-[0.05]" style={{ color: tc }} />
                </div>
                <div className="relative p-7 md:p-9">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-black shadow-sm"
                      style={{ background: tc }}
                    >
                      <Zap className="w-2.5 h-2.5" /> Próximo Torneo
                    </span>
                    {nextTournament.tournament_type && (
                      <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/70 text-slate-500">
                        {nextTournament.tournament_type}
                      </span>
                    )}
                  </div>
                  <h3
                    className="font-black text-slate-900 leading-none mb-4"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
                  >
                    {nextTournament.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium mb-6">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 shrink-0" style={{ color: tc }} />
                      {formatDate(nextTournament.start_date)}
                      {nextTournament.end_date && <> – {formatDate(nextTournament.end_date)}</>}
                    </span>
                    {(nextTournament.city || nextTournament.state) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 shrink-0" style={{ color: tc }} />
                        {[nextTournament.city, nextTournament.state].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {nextTournament.max_participants && (
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 shrink-0" style={{ color: tc }} />
                        Hasta {nextTournament.max_participants} participantes
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => window.location.href = `/tournaments/${nextTournament.id}`}
                    className="inline-flex items-center gap-2 h-11 px-6 rounded-xl font-black text-sm text-black uppercase tracking-wide hover:opacity-90 transition-opacity"
                    style={{ background: tc, boxShadow: `0 4px 18px ${tc}55` }}
                  >
                    Inscribirse <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Remaining tournaments */}
            <div className="space-y-3">
              {tournaments.filter(t => t.id !== nextTournament?.id).map((t, i) => {
                const isPast = new Date(t.end_date || t.start_date) < new Date();
                const isUpcoming = new Date(t.start_date) > new Date();
                return (
                  <motion.div key={t.id}
                    initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className={cn(
                      'bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:border-slate-200 transition-all',
                      isPast && 'opacity-50'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Date block */}
                      <div
                        className="p-4 sm:w-44 shrink-0 flex flex-row sm:flex-col items-center sm:justify-center gap-3 sm:gap-1 text-center border-b sm:border-b-0 sm:border-r border-slate-100"
                        style={{ background: `${tc}07` }}
                      >
                        <Calendar className="w-4 h-4 shrink-0" style={{ color: tc }} />
                        <span className="font-black text-sm text-slate-700"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                          {formatDate(t.start_date)}
                        </span>
                        {t.end_date && <span className="text-[10px] text-slate-400 sm:mt-0.5">– {formatDate(t.end_date)}</span>}
                      </div>
                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-black text-lg text-slate-900 leading-tight"
                              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{t.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {(t.city || t.state) && (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />{[t.city, t.state].filter(Boolean).join(', ')}
                                </span>
                              )}
                              {t.max_participants && (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Users className="w-3 h-3" />Hasta {t.max_participants}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isPast ? (
                              <span className="px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-widest bg-slate-100 text-slate-400">
                                Finalizado
                              </span>
                            ) : isUpcoming ? (
                              <span className="px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-widest"
                                style={{ background: `${tc}20`, color: tc }}>
                                Próximo
                              </span>
                            ) : null}
                            {!isPast && (
                              <button
                                onClick={() => window.location.href = `/tournaments/${t.id}`}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-black hover:opacity-85 transition-opacity"
                                style={{ background: tc }}
                              >
                                Ver
                              </button>
                            )}
                          </div>
                        </div>
                        {t.tournament_type && (
                          <span className="inline-flex mt-2 px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest bg-slate-100 text-slate-500">
                            {t.tournament_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── COURTS ───────────────────────────────────────────────────────────── */}
      {type === 'club' && courts.length > 0 && (
        <section id="courts" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead icon={LayoutGrid} title="Canchas" subtitle="Reserva una cancha para práctica o eventos" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courts.map((court, i) => (
                <motion.div key={court.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className={cn(
                    'bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300',
                    !court.is_available && 'opacity-55'
                  )}
                >
                  {/* Court visual header */}
                  <div className="relative h-32 overflow-hidden"
                    style={{ background: court.is_available ? `${tc}0e` : '#f1f5f9' }}>
                    <CourtLines color={court.is_available ? tc : '#94a3b8'} />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-black text-lg text-slate-900 leading-tight"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{court.name}</h3>
                      {court.is_available
                        ? <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-wider shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disponible
                          </span>
                        : <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">
                            <XCircle className="w-3.5 h-3.5" /> No disponible
                          </span>
                      }
                    </div>
                    <p className="text-sm text-slate-400 font-medium capitalize mb-3">{court.court_type} · {court.surface}</p>
                    <div className="space-y-2">
                      {court.capacity && (
                        <p className="text-sm text-slate-600 flex items-center gap-2 font-semibold">
                          <Users className="w-4 h-4 shrink-0" style={{ color: tc }} /> {court.capacity} jugadores
                        </p>
                      )}
                      {court.operating_hours && (
                        <p className="text-sm text-slate-400 flex items-center gap-2">
                          <Clock className="w-4 h-4 shrink-0" style={{ color: tc }} />
                          {typeof court.operating_hours === 'string' ? court.operating_hours : JSON.stringify(court.operating_hours)}
                        </p>
                      )}
                    </div>
                    {court.description && <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">{court.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BLOG ─────────────────────────────────────────────────────────────── */}
      {blogPosts.length > 0 && (
        <section id="blog" className="py-20" style={{ background: `${tc}06` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead icon={FileText} title="Blog &amp; Contenido" subtitle="Artículos, consejos e ideas de nuestro equipo" tc={tc} />

            {/* Featured first post */}
            <motion.article
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer mb-5"
            >
              <div className="flex flex-col md:flex-row">
                {blogPosts[0].cover_image ? (
                  <div className="md:w-2/5 aspect-video md:aspect-auto overflow-hidden md:min-h-[240px]">
                    <img
                      src={blogPosts[0].cover_image} alt={blogPosts[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="md:w-2/5 aspect-video md:aspect-auto relative overflow-hidden md:min-h-[240px]"
                    style={{ background: `${tc}0c` }}>
                    <CourtLines color={tc} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-16 h-16 opacity-[0.07]" style={{ color: tc }} />
                    </div>
                  </div>
                )}
                <div className="flex-1 p-7 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    {blogPosts[0].tags?.[0] && (
                      <span className="px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest"
                        style={{ background: `${tc}15`, color: tc }}>
                        {blogPosts[0].tags[0]}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest bg-slate-100 text-slate-500">
                      Destacado
                    </span>
                  </div>
                  <h3
                    className="font-black text-slate-900 leading-tight mb-3 group-hover:text-slate-700 transition-colors"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}
                  >
                    {blogPosts[0].title}
                  </h3>
                  {blogPosts[0].excerpt && (
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-5">{blogPosts[0].excerpt}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="flex items-center gap-1 text-xs text-slate-300 font-medium">
                      <Calendar className="w-3 h-3" />{formatDate(blogPosts[0].published_at)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors" style={{ color: tc }}>
                      Leer más <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Rest of posts */}
            {blogPosts.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blogPosts.slice(1).map((post, i) => (
                  <motion.article key={post.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    {post.cover_image ? (
                      <div className="aspect-video overflow-hidden">
                        <img src={post.cover_image} alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                    ) : (
                      <div className="aspect-video relative overflow-hidden" style={{ background: `${tc}09` }}>
                        <CourtLines color={tc} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileText className="w-10 h-10 opacity-[0.07]" style={{ color: tc }} />
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      {post.tags?.[0] && (
                        <span className="inline-flex px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest"
                          style={{ background: `${tc}15`, color: tc }}>
                          {post.tags[0]}
                        </span>
                      )}
                      <h3 className="font-black text-lg mt-2 text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2 leading-tight"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1 text-xs text-slate-300 font-medium">
                          <Calendar className="w-3 h-3" />{formatDate(post.published_at)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-200 group-hover:translate-x-0.5 group-hover:text-slate-500 transition-all" />
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SCHEDULE ─────────────────────────────────────────────────────────── */}
      <MicrositeSchedule tournaments={tournaments} tc={tc} />

      {/* ── CONTACT ──────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead icon={Mail} title="Contacto" subtitle="Ponte en contacto con nuestro equipo" tc={tc} />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Contact info card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="relative rounded-2xl p-6 h-full overflow-hidden border border-slate-100"
                style={{ background: `linear-gradient(145deg, ${tc}0e 0%, ${tc}04 100%)` }}>
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06]">
                  <CourtLines color={tc} />
                </div>
                <h3
                  className="font-black text-xl mb-6 text-slate-900 relative"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  Información de Contacto
                </h3>
                <div className="space-y-4 relative">
                  {[
                    owner.contact.address && { icon: MapPin, label: 'Dirección', value: owner.contact.address },
                    owner.contact.phone && { icon: Phone, label: 'Teléfono', value: owner.contact.phone },
                    owner.contact.email && { icon: Mail, label: 'Email', value: owner.contact.email },
                    owner.contact.whatsapp && owner.contact.whatsapp !== owner.contact.phone && {
                      icon: Phone, label: 'WhatsApp', value: owner.contact.whatsapp,
                      href: `https://wa.me/${owner.contact.whatsapp.replace(/\D/g, '')}`,
                    },
                    owner.website && { icon: Globe, label: 'Sitio web', value: owner.website, href: owner.website },
                    { icon: Calendar, label: 'Miembro desde', value: formatDate(owner.member_since) },
                  ].filter(Boolean).map((item: any) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${tc}22` }}>
                        <item.icon className="w-4 h-4" style={{ color: tc }} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                        {item.href
                          ? <a href={item.href} target="_blank" rel="noopener noreferrer"
                               className="text-slate-700 text-sm font-semibold hover:text-slate-900 transition-colors break-all">
                              {item.value}
                            </a>
                          : <p className="text-slate-700 text-sm font-semibold">{item.value}</p>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Summary stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <div className="rounded-2xl p-6 h-full border border-slate-100 bg-white">
                <h3 className="font-black text-xl text-slate-900 mb-6"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Resumen del Micrositio
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Torneos',         value: tournaments.length,            icon: Trophy },
                    { label: 'Entrenadores',     value: coaches.length,               icon: Dumbbell },
                    { label: 'Fotos',            value: microsite.gallery.length,     icon: ImageIcon },
                    { label: 'Publicaciones',    value: blogPosts.length,             icon: FileText },
                    { label: 'Próximos',         value: upcomingCount,                icon: Calendar },
                    { label: 'Anuncios',         value: announcements.length,         icon: Bell },
                  ].map(({ label, value, icon: Icon }, i) => (
                    <motion.div key={label}
                      initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex flex-col items-center text-center p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
                      style={{ background: `${tc}05` }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                        style={{ background: `${tc}18` }}>
                        <Icon className="w-4 h-4" style={{ color: tc }} />
                      </div>
                      <p className="font-black text-2xl text-slate-900 leading-none tabular-nums"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{value}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-900/80 py-10 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden border border-white/10"
                style={{ background: `${tc}20` }}>
                {owner.logo
                  ? <img src={`${IMG_BASE}${owner.logo}`} alt="" className="w-full h-full object-contain" />
                  : <span className="font-black text-sm" style={{ color: tc }}>{getInitials(owner.name)}</span>
                }
              </div>
              <div>
                <p className="font-black text-white text-sm uppercase tracking-tight"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{owner.name}</p>
                {typeLabel && <p className="text-xs text-slate-500 font-medium">{typeLabel}</p>}
              </div>
            </div>

            {/* Footer nav */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {navItems.slice(0, 5).map(item => (
                <a key={item.id} href={`#${item.id}`}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-black uppercase tracking-widest transition-colors">
                  {item.label}
                </a>
              ))}
            </div>

            <p className="text-xs text-slate-600 font-medium">
              © {new Date().getFullYear()} {owner.name}
            </p>
          </div>
        </div>
      </footer>

      {/* ── SCROLL TO TOP ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-all"
            style={{ background: tc, boxShadow: `0 6px 26px ${tc}65` }}
          >
            <ChevronUp className="w-5 h-5 text-black" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, title, subtitle, tc }: {
  icon: React.ElementType; title: string; subtitle: string; tc?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tc}18` }}>
          <Icon className="w-[18px] h-[18px]" style={{ color: tc }} />
        </div>
        <h2
          className="font-black uppercase text-slate-900 tracking-tight leading-none"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
        >
          {title}
        </h2>
      </div>
      <p className="text-slate-400 text-sm font-medium ml-12">{subtitle}</p>
    </motion.div>
  );
}
