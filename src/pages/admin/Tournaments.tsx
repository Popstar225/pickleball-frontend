import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  format, isBefore, isAfter, isSameDay,
  addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  MapPin, Phone, Mail, Globe, Calendar, Users, Trophy,
  Dumbbell, ImageIcon, AlertCircle, ArrowLeft,
  ChevronUp, ArrowRight, FileText, CheckCircle2, XCircle, Clock,
  LayoutGrid, Bell, Menu, X, ChevronLeft, ChevronRight, Sparkles,
  Tag, Filter,
} from 'lucide-react';

const IMG_BASE = 'http://localhost:5000';

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

export default function PublicMicrositePage() {
  const { type, username } = useParams<{ type: string; username: string }>();
  const [data, setData] = useState<MicrositeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Calendar state
  const [calView, setCalView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [calDate, setCalDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');

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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#ace600] flex items-center justify-center animate-pulse">
          <Sparkles className="w-6 h-6 text-black" />
        </div>
        <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase">Cargando…</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-xl font-bold text-slate-900">{error || 'Micrositio no encontrado'}</p>
      <Link to="/"
        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-black text-white text-sm font-bold hover:bg-slate-800 transition-all">
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>
    </div>
  );

  const { owner, microsite, tournaments, courts, announcements, coaches, blogPosts } = data;
  const tc = microsite.theme_color || '#ace600';
  const typeLabel = { club: 'Club', state: 'Asociación Estatal', partner: 'Socio' }[owner.type] || '';
  const isLime = tc === '#ace600';

  const navItems = [
    ...(announcements.length > 0  ? [{ id: 'announcements', label: 'Anuncios' }]  : []),
    ...(microsite.gallery.length > 0 ? [{ id: 'gallery',       label: 'Galería' }]  : []),
    ...(coaches.length > 0         ? [{ id: 'coaches',        label: 'Entrenadores' }] : []),
    ...(tournaments.length > 0     ? [{ id: 'tournaments',    label: 'Torneos' }]   : []),
    ...(type === 'club' && courts.length > 0 ? [{ id: 'courts', label: 'Canchas' }] : []),
    ...(blogPosts.length > 0       ? [{ id: 'blog',           label: 'Blog' }]      : []),
    { id: 'contact', label: 'Contacto' },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <Header />

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative w-full">
        {/* Banner */}
        <div className="relative h-[360px] md:h-[440px] overflow-hidden">
          {microsite.banner_url ? (
            <img src={microsite.banner_url} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full overflow-hidden" style={{ background: '#f0f7d4' }}>
              {/* Graphic pattern */}
              <div className="absolute inset-0 opacity-30"
                style={{ backgroundImage: `repeating-linear-gradient(45deg, ${tc}22 0px, ${tc}22 1px, transparent 1px, transparent 50%)`, backgroundSize: '32px 32px' }} />
              <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-40" style={{ background: tc }} />
              <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full blur-3xl opacity-25" style={{ background: tc }} />
              {/* Big initials watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="opacity-[0.07] font-black select-none"
                  style={{ fontSize: 'clamp(120px, 25vw, 280px)', fontFamily: "'Barlow Condensed', sans-serif", color: '#000', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {getInitials(owner.name)}
                </span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white" />
        </div>

        {/* Profile card */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-slate-100"
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Logo */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 md:w-[100px] md:h-[100px] rounded-2xl flex items-center justify-center overflow-hidden border-4 border-white shadow-xl"
                  style={{ background: `${tc}18` }}>
                  {owner.logo
                    ? <img src={`${IMG_BASE}${owner.logo}`} alt={owner.name} className="w-full h-full object-contain p-2" />
                    : <span className="font-black text-3xl" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: tc }}>{getInitials(owner.name)}</span>
                  }
                </div>
                {/* Online dot */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '-0.02em', lineHeight: 1 }}
                    className="text-4xl md:text-5xl font-black uppercase text-slate-900 leading-none">
                    {owner.name}
                  </h1>
                  {typeLabel && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border"
                      style={{ background: `${tc}15`, color: tc, borderColor: `${tc}35` }}>
                      {typeLabel}
                    </span>
                  )}
                </div>

                {(owner.contact.city || owner.contact.state) && (
                  <p className="font-bold text-sm flex items-center gap-1.5 mb-3" style={{ color: tc }}>
                    <MapPin className="w-3.5 h-3.5" />
                    {[owner.contact.city, owner.contact.state].filter(Boolean).join(', ')}
                  </p>
                )}

                {owner.bio && <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{owner.bio}</p>}

                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm">
                  {owner.contact.phone && (
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Phone className="w-3.5 h-3.5" style={{ color: tc }} />{owner.contact.phone}
                    </span>
                  )}
                  {owner.contact.email && (
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Mail className="w-3.5 h-3.5" style={{ color: tc }} />{owner.contact.email}
                    </span>
                  )}
                  {owner.website && (
                    <a href={owner.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-slate-500 font-medium hover:text-slate-900 transition-colors">
                      <Globe className="w-3.5 h-3.5" style={{ color: tc }} />{owner.website}
                    </a>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 md:grid-cols-1 gap-2 shrink-0">
                {[
                  { label: 'Torneos',       value: tournaments.length,       icon: Trophy },
                  { label: 'Entrenadores',  value: coaches.length,           icon: Dumbbell },
                  { label: 'Fotos',         value: microsite.gallery.length, icon: ImageIcon },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 min-w-[100px]">
                    <Icon className="w-4 h-4 shrink-0" style={{ color: tc }} />
                    <span className="font-black text-slate-900 tabular-nums" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.3rem' }}>{value}</span>
                    <span className="text-xs text-slate-400 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── STICKY NAV ────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 mt-6 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13">
            <div className="hidden md:flex items-center">
              {navItems.map(item => (
                <a key={item.id} href={`#${item.id}`}
                  className="relative px-4 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors group">
                  {item.label}
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                    style={{ background: tc }} />
                </a>
              ))}
            </div>
            <button className="md:hidden p-3 text-slate-600 hover:text-slate-900 transition-colors"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileNavOpen && (
            <div className="md:hidden pb-3 border-t border-slate-100">
              {navItems.map(item => (
                <a key={item.id} href={`#${item.id}`} onClick={() => setMobileNavOpen(false)}
                  className="block px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ─── SPONSORS BAR ──────────────────────────────────────────────────── */}
      {microsite.sponsors.length > 0 && (
        <section className="py-12 border-b border-slate-100" style={{ background: `${tc}08` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-8">
              Patrocinadores & Socios
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              {microsite.sponsors.map((sp, i) => (
                <motion.a key={sp.id} href={sp.website || '#'} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="group flex items-center gap-3 px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300">
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

      {/* ─── ANNOUNCEMENTS ─────────────────────────────────────────────────── */}
      {announcements.length > 0 && (
        <section id="announcements" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead icon={Bell} title="Anuncios" subtitle="Mantente al día con las últimas noticias" tc={tc} />
            <div className="space-y-3">
              {announcements.map((ann, i) => (
                <motion.article key={ann.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group relative bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                  style={ann.is_pinned ? { borderColor: `${tc}40`, background: `${tc}05` } : {}}>
                  {/* Accent left bar */}
                  {ann.is_pinned && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: tc }} />}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {ann.category && (
                          <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-widest"
                            style={{ background: `${tc}15`, color: tc }}>
                            {ann.category}
                          </span>
                        )}
                        {ann.is_pinned && (
                          <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-widest bg-slate-100 text-slate-500">
                            Fijado
                          </span>
                        )}
                        {ann.priority === 'high' && (
                          <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-widest bg-red-50 text-red-500">
                            Alta prioridad
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-300 font-medium">
                          <Calendar className="w-3 h-3" />{formatDate(ann.created_at)}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-slate-700 transition-colors leading-tight"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{ann.title}</h3>
                      <p className="text-slate-500 mt-1.5 text-sm leading-relaxed line-clamp-2">{ann.content}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-slate-500 transition-all group-hover:translate-x-1 shrink-0 mt-1" />
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── GALLERY ───────────────────────────────────────────────────────── */}
      {microsite.gallery.length > 0 && (
        <section id="gallery" className="py-20" style={{ background: `${tc}06` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead icon={ImageIcon} title="Galería" subtitle="Momentos capturados de nuestros eventos" tc={tc} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {microsite.gallery.map((img, i) => (
                <motion.div key={img.id}
                  initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-[4/3] border border-white/60 hover:shadow-xl transition-all duration-300"
                  onClick={() => setLightboxIndex(i)}>
                  <img src={img.url} alt={img.caption || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/55 transition-all duration-300 flex items-end">
                    {img.caption && (
                      <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white font-bold text-sm drop-shadow">{img.caption}</p>
                      </div>
                    )}
                  </div>
                  {/* Corner icon */}
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: tc }}>
                    <ImageIcon className="w-3 h-3 text-black" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Lightbox */}
          <AnimatePresence>
            {lightboxIndex !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/92 backdrop-blur-md"
                onClick={() => setLightboxIndex(null)}>
                <button onClick={() => setLightboxIndex(null)}
                  className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
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
                <motion.div key={lightboxIndex}
                  initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                  <img src={microsite.gallery[lightboxIndex].url} alt="" className="w-full rounded-2xl shadow-2xl" />
                  {microsite.gallery[lightboxIndex].caption && (
                    <p className="text-center text-white/70 font-semibold text-sm mt-4">
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

      {/* ─── COACHES ───────────────────────────────────────────────────────── */}
      {coaches.length > 0 && (
        <section id="coaches" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead icon={Dumbbell} title="Entrenadores" subtitle="Profesionales certificados dedicados a tu desarrollo" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {coaches.map((c, i) => (
                <motion.div key={c.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all overflow-hidden relative">
                  {/* Subtle color patch */}
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-x-4 -translate-y-10 opacity-[0.08]"
                    style={{ background: tc }} />
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 overflow-hidden"
                      style={{ background: `${tc}15`, color: tc }}>
                      {c.profile_photo
                        ? <img src={`${IMG_BASE}${c.profile_photo}`} alt={c.full_name} className="w-full h-full object-cover" />
                        : <span style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{getInitials(c.full_name)}</span>
                      }
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 leading-tight"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{c.full_name}</h3>
                      {c.skill_level && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mt-1"
                          style={{ background: `${tc}15`, color: tc }}>
                          Nivel {c.skill_level}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {(c.city || c.state) && (
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: tc }} />
                        {[c.city, c.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {c.bio && <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{c.bio}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TOURNAMENTS CALENDAR ──────────────────────────────────────────── */}
      {tournaments.length > 0 && (
        <TournamentsCalendar
          tournaments={tournaments}
          tc={tc}
          calView={calView} setCalView={setCalView}
          calDate={calDate} setCalDate={setCalDate}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        />
      )}

      {/* ─── COURTS ────────────────────────────────────────────────────────── */}
      {type === 'club' && courts.length > 0 && (
        <section id="courts" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead icon={LayoutGrid} title="Canchas" subtitle="Reserva una cancha para práctica o eventos" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courts.map((court, i) => (
                <motion.div key={court.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className={cn('bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:border-slate-200 transition-all', !court.is_available && 'opacity-60')}>
                  {/* Accent top */}
                  <div className="h-1.5 rounded-t-2xl" style={{ background: court.is_available ? tc : '#e2e8f0' }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-black text-lg text-slate-900" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{court.name}</h3>
                      {court.is_available
                        ? <span className="flex items-center gap-1 text-xs font-black text-emerald-500 uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disponible
                          </span>
                        : <span className="flex items-center gap-1 text-xs font-black text-slate-400 uppercase tracking-wider">
                            <XCircle className="w-3.5 h-3.5" /> No disponible
                          </span>
                      }
                    </div>
                    <p className="text-sm text-slate-400 font-medium capitalize mb-2">{court.court_type} · {court.surface}</p>
                    {court.capacity && (
                      <p className="text-sm text-slate-700 flex items-center gap-1.5 font-semibold">
                        <Users className="w-4 h-4" style={{ color: tc }} /> {court.capacity} jugadores
                      </p>
                    )}
                    {court.operating_hours && (
                      <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1.5 font-medium">
                        <Clock className="w-4 h-4" />
                        {typeof court.operating_hours === 'string' ? court.operating_hours : JSON.stringify(court.operating_hours)}
                      </p>
                    )}
                    {court.description && <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">{court.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── BLOG ──────────────────────────────────────────────────────────── */}
      {blogPosts.length > 0 && (
        <section id="blog" className="py-20" style={{ background: `${tc}06` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead icon={FileText} title="Blog & Contenido" subtitle="Artículos, consejos e ideas de nuestro equipo" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {blogPosts.map((post, i) => (
                <motion.article key={post.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 hover:border-slate-200 transition-all cursor-pointer">
                  {post.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img src={post.cover_image} alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5">
                    {post.tags?.[0] && (
                      <span className="inline-flex px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-widest"
                        style={{ background: `${tc}15`, color: tc }}>
                        {post.tags[0]}
                      </span>
                    )}
                    <h3 className="font-black text-xl mt-3 text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2 leading-tight"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {post.title}
                    </h3>
                    {post.excerpt && <p className="text-slate-400 text-sm mt-1.5 line-clamp-2 leading-relaxed">{post.excerpt}</p>}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-xs text-slate-300 font-medium">
                        <Calendar className="w-3 h-3" />{formatDate(post.published_at)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-200 group-hover:translate-x-1 group-hover:text-slate-500 transition-all" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CONTACT ───────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead icon={Mail} title="Contacto" subtitle="Ponte en contacto con nuestro equipo" tc={tc} />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Info panel */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="lg:col-span-2">
              <div className="rounded-2xl p-6 h-full border border-slate-100" style={{ background: `${tc}08` }}>
                <h3 className="font-black text-2xl mb-6 text-slate-900" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Información de Contacto</h3>
                <div className="space-y-4">
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
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tc}20` }}>
                        <item.icon className="w-4 h-4" style={{ color: tc }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                        {item.href
                          ? <a href={item.href} target="_blank" rel="noopener noreferrer"
                               className="text-slate-700 text-sm font-semibold hover:text-slate-900 transition-colors">{item.value}</a>
                          : <p className="text-slate-700 text-sm font-semibold">{item.value}</p>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Stats panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="lg:col-span-3">
              <div className="rounded-2xl p-6 h-full border border-slate-100 bg-white">
                <h3 className="font-black text-2xl text-slate-900 mb-6" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Resumen</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Torneos',          value: tournaments.length,            icon: Trophy },
                    { label: 'Entrenadores',      value: coaches.length,               icon: Dumbbell },
                    { label: 'Fotos en Galería',  value: microsite.gallery.length,     icon: ImageIcon },
                    { label: 'Publicaciones',     value: blogPosts.length,             icon: FileText },
                    { label: 'Torneos Próximos',  value: tournaments.filter(t => new Date(t.start_date) >= new Date()).length, icon: Calendar },
                    { label: 'Anuncios',          value: announcements.length,         icon: Bell },
                  ].map(({ label, value, icon: Icon }, i) => (
                    <motion.div key={label}
                      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="group flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tc}12` }}>
                        <Icon className="w-4 h-4" style={{ color: tc }} />
                      </div>
                      <div>
                        <p className="font-black text-2xl text-slate-900 leading-none tabular-nums"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{value}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />

      {/* ─── Scroll to top ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all"
            style={{ background: tc, boxShadow: `0 6px 20px ${tc}60` }}>
            <ChevronUp className="w-5 h-5 text-black" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, title, subtitle, tc }: {
  icon: React.ElementType; title: string; subtitle: string; tc?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.5 }} className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: `${tc}18` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: tc }} />
        </div>
        <h2 className="font-black uppercase text-slate-900 tracking-tight leading-none"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
          {title}
        </h2>
      </div>
      <p className="text-slate-400 text-sm font-medium ml-12">{subtitle}</p>
    </motion.div>
  );
}

// ─── Tournaments Calendar ─────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  published:          { bg: 'bg-[#ace600]/15', border: 'border-[#ace600]/30', text: 'text-[#ace600]',    label: 'Abierto' },
  validated:          { bg: 'bg-blue-400/15',  border: 'border-blue-400/30',  text: 'text-blue-400',     label: 'Validado' },
  completed:          { bg: 'bg-slate-400/15', border: 'border-slate-400/30', text: 'text-slate-400',    label: 'Completado' },
  pending_validation: { bg: 'bg-amber-400/15', border: 'border-amber-400/30', text: 'text-amber-400',   label: 'Pendiente' },
};
const getS = (status: string) => STATUS_STYLES[status] ?? STATUS_STYLES.published;

function TournamentsCalendar({ tournaments, tc, calView, setCalView, calDate, setCalDate, statusFilter, setStatusFilter }: {
  tournaments: any[]; tc: string;
  calView: 'month' | 'week' | 'day' | 'list'; setCalView: (v: any) => void;
  calDate: Date; setCalDate: (d: Date) => void;
  statusFilter: string; setStatusFilter: (s: string) => void;
}) {
  const filtered = useMemo(() =>
    statusFilter === 'all' ? tournaments : tournaments.filter(t => t.status === statusFilter),
    [tournaments, statusFilter],
  );

  // ── Helpers ──
  const getTsForDay = (date: Date) => filtered.filter(t => {
    const start = new Date(t.start_date);
    const end   = new Date(t.end_date || t.start_date);
    return isSameDay(date, start) || isSameDay(date, end) ||
      (isAfter(date, start) && isBefore(date, end));
  });

  const isToday = (d: Date) => {
    const n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  };

  const getCalDays = () => {
    const year = calDate.getFullYear(), month = calDate.getMonth();
    const first = new Date(year, month, 1);
    const startDow = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevLast = new Date(year, month, 0).getDate();
    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];
    for (let i = startDow - 1; i >= 0; i--)
      days.push({ day: prevLast - i, isCurrentMonth: false, date: new Date(year, month - 1, prevLast - i) });
    for (let i = 1; i <= daysInMonth; i++)
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    const rem = 42 - days.length;
    for (let i = 1; i <= rem; i++)
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    return days;
  };

  const getWeekDays = () => {
    const start = startOfWeek(calDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const nav = (dir: 1 | -1) => {
    if (calView === 'month') setCalDate(dir === 1 ? addMonths(calDate, 1) : subMonths(calDate, 1));
    else if (calView === 'week') setCalDate(dir === 1 ? addWeeks(calDate, 1) : subWeeks(calDate, 1));
    else setCalDate(dir === 1 ? addDays(calDate, 1) : subDays(calDate, 1));
  };

  const titleText = () => {
    if (calView === 'month') return format(calDate, 'MMMM yyyy', { locale: es }).toUpperCase();
    if (calView === 'week') {
      const s = startOfWeek(calDate, { weekStartsOn: 1 });
      const e = addDays(s, 6);
      return `${format(s, 'MMM d', { locale: es })} – ${format(e, 'MMM d, yyyy', { locale: es })}`;
    }
    if (calView === 'day') return format(calDate, 'EEEE d MMMM yyyy', { locale: es }).toUpperCase();
    return 'TODOS LOS TORNEOS';
  };

  // ── View renderers ──
  const MonthView = () => {
    const days = getCalDays();
    return (
      <div className="bg-[#0d1117] rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col h-full">
        <div className="grid grid-cols-7 bg-white/[0.02]">
          {['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black text-white/25 tracking-widest border-r border-white/[0.05] last:border-r-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1">
          {days.map((di, idx) => {
            const evts = getTsForDay(di.date);
            const tod = isToday(di.date);
            return (
              <div key={idx}
                className={cn('min-h-[100px] p-2 border-r border-b border-white/[0.05]',
                  idx % 7 === 6 && 'border-r-0', idx >= days.length - 7 && 'border-b-0',
                  !di.isCurrentMonth && 'opacity-25',
                  'hover:bg-white/[0.02] transition-colors')}>
                <div className={cn('w-7 h-7 flex items-center justify-center rounded-full text-xs font-black mb-1',
                  tod ? 'text-black' : 'text-white/50')}
                  style={tod ? { background: tc } : {}}>
                  {di.day}
                </div>
                <div className="space-y-0.5">
                  {evts.slice(0, 2).map((t, i) => {
                    const s = getS(t.status);
                    return (
                      <div key={i} className={cn('text-[10px] px-1.5 py-0.5 rounded border-l-2 truncate font-bold', s.bg, s.border, s.text)}>
                        <Users className="inline w-2.5 h-2.5 mr-0.5" />{t.name}
                      </div>
                    );
                  })}
                  {evts.length > 2 && <div className="text-[10px] text-white/20 px-1 font-semibold">+{evts.length - 2} más</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const WeekView = () => {
    const wDays = getWeekDays();
    return (
      <div className="bg-[#0d1117] rounded-2xl border border-white/[0.07] overflow-hidden h-full">
        <div className="overflow-y-auto h-full">
          <div className="grid grid-cols-8 min-w-[600px]">
            <div className="bg-white/[0.02] p-3 border-r border-b border-white/[0.05]" />
            {wDays.map((d, i) => (
              <div key={i} className={cn('bg-white/[0.02] p-3 text-center border-r border-b border-white/[0.05] last:border-r-0', isToday(d) && 'bg-[#ace600]/[0.04]')}>
                <div className="text-[10px] text-white/30 uppercase font-black tracking-widest">{format(d, 'EEE', { locale: es })}</div>
                <div className={cn('text-xl font-black mt-1 w-9 h-9 mx-auto flex items-center justify-center rounded-xl',
                  isToday(d) ? 'text-black' : 'text-white/60')}
                  style={isToday(d) ? { background: tc } : {}}>
                  {d.getDate()}
                </div>
              </div>
            ))}
            <div className="bg-white/[0.015] px-3 py-2 text-[10px] text-white/20 text-right border-r border-b border-white/[0.05] font-bold">Todo el día</div>
            {wDays.map((d, i) => {
              const evts = getTsForDay(d);
              return (
                <div key={i} className="bg-[#0d1117] p-1.5 min-h-[80px] border-r border-b border-white/[0.05] last:border-r-0">
                  {evts.map((t, j) => {
                    const s = getS(t.status);
                    return (
                      <div key={j} className={cn('text-[10px] px-2 py-1.5 rounded mb-1 border-l-2 cursor-pointer hover:opacity-75 transition-opacity', s.bg, s.border)}>
                        <div className={cn('font-black truncate', s.text)}>{t.name}</div>
                        <div className="text-white/30 text-[9px] truncate">{t.location}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const DayView = () => {
    const evts = getTsForDay(calDate);
    return (
      <div className="bg-[#0d1117] rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col h-full">
        <div className="bg-white/[0.02] p-5 border-b border-white/[0.05] text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-1">{format(calDate, 'EEEE', { locale: es })}</div>
          <div className="text-4xl font-black text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{calDate.getDate()}</div>
          <div className="text-xs text-white/30 mt-1">{format(calDate, 'MMMM yyyy', { locale: es })}</div>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          {evts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white/10" />
              </div>
              <p className="text-xs text-white/20">No hay torneos este día</p>
            </div>
          ) : evts.map(t => {
            const s = getS(t.status);
            return (
              <div key={t.id} className={cn('rounded-xl p-4 border-l-4 cursor-pointer hover:opacity-90 transition-opacity', s.bg, s.border)}>
                <div className="flex items-start gap-4">
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border', s.bg, s.border)}>
                    <Trophy className={cn('w-5 h-5', s.text)} />
                  </div>
                  <div className="flex-1">
                    <span className={cn('text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest', s.bg, s.text)}>{s.label}</span>
                    <h4 className={cn('font-black text-base mt-1 leading-tight', s.text)}>{t.name}</h4>
                    <div className="flex flex-wrap gap-3 text-xs text-white/30 mt-2">
                      {t.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.location}</span>}
                      {(t.current_participants != null && t.max_participants) &&
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.current_participants}/{t.max_participants}</span>}
                    </div>
                  </div>
                  <button className="text-[11px] font-black px-3 py-1.5 rounded-xl shrink-0 text-black hover:opacity-85 transition-opacity"
                    style={{ background: tc }}>
                    Ver
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ListView = () => {
    const sorted = [...filtered].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    return (
      <div className="bg-[#0d1117] rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col h-full">
        <div className="divide-y divide-white/[0.05] overflow-y-auto flex-1">
          {sorted.map(t => {
            const s = getS(t.status);
            return (
              <div key={t.id} className="flex items-start gap-4 p-4 hover:bg-white/[0.02] cursor-pointer transition-colors">
                <div className={cn('w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0', s.bg)}>
                  <div className={cn('text-[10px] font-black uppercase', s.text)}>{format(new Date(t.start_date), 'MMM', { locale: es })}</div>
                  <div className={cn('text-2xl font-black leading-none', s.text)} style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{new Date(t.start_date).getDate()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={cn('text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest', s.bg, s.border, s.text)}>{s.label}</span>
                    {t.prize_pool && <span className="text-[10px] font-black px-2 py-0.5 rounded border bg-amber-400/10 border-amber-400/25 text-amber-400">{t.prize_pool}</span>}
                  </div>
                  <h3 className="font-black text-white text-sm leading-tight mb-1">{t.name}</h3>
                  <div className="flex flex-wrap gap-3 text-[11px] text-white/30">
                    {t.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#ace600]/50" />{t.location}</span>}
                    {t.max_participants && <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#ace600]/50" />{t.max_participants}</span>}
                  </div>
                </div>
                <button className="text-[11px] font-black px-3.5 py-2 rounded-xl shrink-0 text-black hover:opacity-85 transition-opacity"
                  style={{ background: tc }}>
                  Registrar
                </button>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Filter className="w-8 h-8 text-white/10" />
              <p className="text-xs text-white/20">No se encontraron torneos</p>
              <button onClick={() => setStatusFilter('all')} className="text-xs text-[#ace600] hover:underline">Limpiar filtros</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="tournaments" className="py-20 bg-[#080c10]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-[#ace600]/10 border border-[#ace600]/20">
              <Trophy className="w-4 h-4 text-[#ace600]" />
            </div>
            <h2 className="font-black uppercase text-white tracking-tight leading-none"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
              Torneos
            </h2>
          </div>
          <p className="text-white/25 text-sm font-medium ml-12">Competencias y eventos próximos</p>
        </motion.div>

        {/* Calendar + sidebar grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Calendar ── */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => nav(-1)}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#ace600]/30 text-white/50 hover:text-white flex items-center justify-center transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="min-w-[160px] text-center">
                  <span className="text-sm font-black text-white tracking-wider" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {titleText()}
                  </span>
                </div>
                <button onClick={() => nav(1)}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#ace600]/30 text-white/50 hover:text-white flex items-center justify-center transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => setCalDate(new Date())}
                  className="h-9 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#ace600]/30 text-white/40 hover:text-white text-xs font-black uppercase tracking-widest transition-all">
                  Hoy
                </button>
              </div>
              <div className="flex gap-1 bg-[#0d1117] border border-white/[0.07] rounded-xl p-1">
                {(['month','week','day','list'] as const).map(v => (
                  <button key={v} onClick={() => setCalView(v)}
                    className={cn('px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all',
                      calView === v ? 'text-black shadow-[0_0_8px_rgba(172,230,0,0.2)]' : 'text-white/30 hover:text-white/60')}
                    style={calView === v ? { background: tc } : {}}>
                    {{ month: 'Mes', week: 'Semana', day: 'Día', list: 'Lista' }[v]}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar panel */}
            <div className="flex-1 min-h-[480px] max-h-[640px] overflow-hidden">
              {calView === 'month' && <MonthView />}
              {calView === 'week' && <WeekView />}
              {calView === 'day' && <DayView />}
              {calView === 'list' && <ListView />}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#ace600]" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Próximos Torneos</h3>
              </div>
              {/* Filter */}
              <div className="relative mb-4">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="w-full bg-[#0d1117] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-white/50 text-xs font-bold focus:outline-none focus:border-[#ace600]/30 appearance-none cursor-pointer transition-all">
                  <option value="all">Todos los estados</option>
                  <option value="published">Abierto</option>
                  <option value="validated">Validado</option>
                  <option value="completed">Completado</option>
                </select>
              </div>
              {/* Cards */}
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {filtered.slice(0, 8).map(t => {
                  const s = getS(t.status);
                  return (
                    <div key={t.id}
                      className="group bg-[#0d1117] border border-white/[0.07] rounded-2xl p-3.5 cursor-pointer hover:border-[#ace600]/30 transition-all">
                      <div className="flex items-start gap-3">
                        {/* Date badge */}
                        <div className={cn('w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0', s.bg)}>
                          <div className={cn('text-[9px] font-black uppercase', s.text)}>{format(new Date(t.start_date), 'MMM', { locale: es })}</div>
                          <div className={cn('text-xl font-black leading-none', s.text)} style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{new Date(t.start_date).getDate()}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest', s.bg, s.text)}>{s.label}</span>
                          <h4 className="font-black text-white/80 text-xs mt-1 leading-tight group-hover:text-white transition-colors line-clamp-2">
                            {t.name}
                          </h4>
                          <div className="flex flex-col gap-0.5 mt-1.5">
                            {t.location && <span className="text-[10px] text-white/25 flex items-center gap-1"><MapPin className="w-2.5 h-2.5 text-[#ace600]/40" />{t.location}</span>}
                            {t.max_participants && <span className="text-[10px] text-white/25 flex items-center gap-1"><Users className="w-2.5 h-2.5 text-[#ace600]/40" />{t.current_participants ?? '—'}/{t.max_participants}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Filter className="w-7 h-7 text-white/10" />
                    <p className="text-[11px] text-white/20">Sin torneos</p>
                    <button onClick={() => setStatusFilter('all')} className="text-[11px] text-[#ace600] hover:underline">Limpiar</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}