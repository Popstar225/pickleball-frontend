import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  ChevronLeft,
  Share2,
  Heart,
} from 'lucide-react';
import Footer from '@/components/Footer';
import { playerShowcases } from '@/data/mockData';
import { useState, useEffect, useRef } from 'react';
import '../styles/players/showcaseDetail.css';

/* ─────────────────────────────────────────────
   Content renderer
───────────────────────────────────────────── */
const renderContent = (content: string) => {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (!listItems.length) return;
    elements.push(
      <ul key={`ul-${listKey++}`}>
        {listItems.map((item, i) => (
          <li
            key={i}
            dangerouslySetInnerHTML={{
              __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
          />
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, idx) => {
    const t = line.trim();
    if (!t) {
      flushList();
      return;
    }

    if (t.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={idx}>{t.slice(3)}</h2>);
    } else if (t.startsWith('- ')) {
      listItems.push(t.slice(2));
    } else if (t.startsWith('*') && t.endsWith('*') && !t.startsWith('**')) {
      flushList();
      elements.push(<em key={idx}>{t.slice(1, -1)}</em>);
    } else {
      flushList();
      elements.push(
        <p
          key={idx}
          dangerouslySetInnerHTML={{
            __html: t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
          }}
        />,
      );
    }
  });
  flushList();
  return elements;
};

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const ShowcaseDetail = () => {
  const { slug } = useParams();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Ensure we start at the top when opening this page or when the slug changes
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0 });
    } catch (e) {
      // fallback for environments where window may not be available
      if (typeof document !== 'undefined') {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    }
  }, [slug]);

  const isScrolled = scrollY > 80;
  const player = playerShowcases.find((p) => p.slug === slug);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  /* ── Not found ── */
  if (!player) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md w-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#a3ff47]/20 via-lime-500/10 to-[#a3ff47]/20 rounded-3xl blur-3xl opacity-40" />
            <div className="relative bg-slate-900 rounded-3xl border border-slate-800 p-8 sm:p-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#a3ff47]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-[#a3ff47]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                Jugador no encontrado
              </h1>
              <Link to="/players/showcase">
                <button className="inline-flex items-center gap-2 sm:gap-3 bg-[#a3ff47] text-slate-950 font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:shadow-2xl hover:shadow-[#a3ff47]/40 transition-all duration-500 text-sm sm:text-base">
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  Volver a Jugadores
                </button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 overflow-x-hidden">
      {/* Mobile sticky header */}
      <div
        className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-slate-950/95 backdrop-blur-2xl border-b border-[#a3ff47]/10 shadow-xl shadow-black/60'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <Link to="/players/showcase" className="flex items-center gap-1.5 sm:gap-2 group">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#a3ff47]/10 border border-[#a3ff47]/20 flex items-center justify-center group-hover:bg-[#a3ff47]/20 transition-colors duration-300">
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a3ff47]" />
            </span>
            <span className="text-white/70 text-xs sm:text-sm font-medium">Volver</span>
          </Link>
          <div className="flex gap-1.5 sm:gap-2">
            <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            </button>
            <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative min-h-[55vh] sm:min-h-[60vh] lg:min-h-[65vh] flex flex-col overflow-hidden"
        >
          {/* Background layers */}
          <div className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute inset-0 bg-slate-950" />

            <div className="absolute inset-0 sd-fade-in" style={{ transform: 'translateY(0)' }}>
              <img
                src={player.featuredImage}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: 'center 22%',
                  filter: 'grayscale(20%) brightness(0.75) contrast(1.25)',
                }}
              />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_90%_at_50%_40%,transparent_20%,rgba(2,6,23,0.85)_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-slate-950/70 to-transparent" />

            {/* Animated glow orbs */}
            <div
              className="sd-glow-orb absolute -top-32 -left-32 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-[#a3ff47]/20"
              style={{ animationDelay: '0s' }}
            />
            <div
              className="sd-glow-orb absolute top-1/3 right-0 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-lime-400/10"
              style={{ animationDelay: '1.8s' }}
            />
            <div
              className="sd-glow-orb absolute bottom-1/4 left-1/3 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] rounded-full bg-[#a3ff47]/8"
              style={{ animationDelay: '3.5s' }}
            />

            {/* Grid patterns */}
            <div
              className="absolute inset-0 opacity-[0.055]"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(163,255,71,0.8) 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  -52deg,
                  transparent,
                  transparent 36px,
                  rgba(163,255,71,0.9) 36px,
                  rgba(163,255,71,0.9) 37px
                )`,
              }}
            />
            <div className="sd-scanline" />
          </div>

          {/* Desktop back button */}
          <div className="hidden lg:block absolute top-6 xl:top-10 left-6 xl:left-10 z-30">
            <Link
              to="/players/showcase"
              className="group flex items-center gap-2.5 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#a3ff47]/50 hover:bg-[#a3ff47]/8 text-white/70 hover:text-white px-5 py-2.5 rounded-xl transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4 text-[#a3ff47] group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-semibold">Volver</span>
            </Link>
          </div>

          {/* Hero content */}
          <div className="relative z-10 flex-1 flex items-end">
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 pb-8 sm:pb-10 lg:pb-14 pt-20 sm:pt-24 lg:pt-16">
              <div className="grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_420px] gap-8 lg:gap-20 items-end">
                {/* Left column - Player info */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Badge */}
                  <div className="sd-badge-pop inline-flex">
                    <span className="inline-flex items-center gap-2 sm:gap-2.5 bg-[#a3ff47]/10 border border-[#a3ff47]/25 backdrop-blur-sm text-[#a3ff47] text-[10px] sm:text-[11px] font-black tracking-[0.18em] sm:tracking-[0.22em] uppercase px-4 sm:px-5 py-2 sm:py-2.5 rounded-full">
                      <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a3ff47] opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#a3ff47]" />
                      </span>
                      Jugador Destacado · FEDMEX
                    </span>
                  </div>

                  {/* Name */}
                  <div className="sd-rise-1">
                    <p className="text-[#a3ff47]/50 text-[10px] sm:text-xs font-bold tracking-[0.25em] sm:tracking-[0.35em] uppercase mb-1.5 sm:mb-2">
                      Perfil Oficial
                    </p>
                    <h1 className="sd-name-shimmer text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                      {player.playerName}
                    </h1>
                  </div>

                  {/* Divider */}
                  <div className="sd-rise-2 h-[2px] max-w-lg bg-white/5 rounded-full overflow-hidden">
                    <div className="sd-bar-grow h-full bg-gradient-to-r from-[#a3ff47] via-lime-300 to-transparent origin-left" />
                  </div>

                  {/* Title */}
                  <p className="sd-rise-3 text-white/55 text-sm sm:text-base lg:text-lg leading-relaxed font-light max-w-xl">
                    {player.title}
                  </p>

                  {/* Stats badges */}
                  <div className="sd-rise-4 flex flex-wrap gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-2.5 bg-white/5 hover:bg-[#a3ff47]/8 border border-white/8 hover:border-[#a3ff47]/30 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 cursor-default group">
                      <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a3ff47]" />
                      <span className="text-white/45 text-[10px] sm:text-xs font-semibold tracking-widest uppercase">
                        DUPR
                      </span>
                      <span className="text-[#a3ff47] font-black text-xs sm:text-sm">
                        {player.stats.duprRating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5 bg-amber-400/5 hover:bg-amber-400/10 border border-amber-400/12 hover:border-amber-400/35 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 cursor-default">
                      <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                      <span className="text-white/45 text-[10px] sm:text-xs font-semibold tracking-widest uppercase">
                        Oro
                      </span>
                      <span className="text-amber-300 font-black text-xs sm:text-sm">
                        {player.stats.gold}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-400/5 hover:bg-slate-400/10 border border-slate-400/12 hover:border-slate-400/35 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 cursor-default">
                      <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
                      <span className="text-white/45 text-[10px] sm:text-xs font-semibold tracking-widest uppercase">
                        Plata
                      </span>
                      <span className="text-slate-200 font-black text-xs sm:text-sm">
                        {player.stats.silver}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5 bg-amber-700/5 hover:bg-amber-700/10 border border-amber-700/12 hover:border-amber-700/35 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 cursor-default">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                      <span className="text-white/45 text-[10px] sm:text-xs font-semibold tracking-widest uppercase">
                        Bronce
                      </span>
                      <span className="text-amber-500 font-black text-xs sm:text-sm">
                        {player.stats.bronze}
                      </span>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="sd-rise-5 flex flex-wrap gap-2 sm:gap-3 pt-1">
                    <a
                      href="#article"
                      className="group relative inline-flex items-center gap-2 sm:gap-3 bg-[#a3ff47] text-slate-950 font-black text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-4 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-[#a3ff47]/40 transition-all duration-500"
                    >
                      <span className="relative z-10">Leer Historia Completa</span>
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 group-hover:translate-y-0.5 transition-transform duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-lime-300 to-[#a3ff47] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    </a>
                    <button className="inline-flex items-center gap-2 sm:gap-2.5 bg-white/5 border border-white/10 hover:border-[#a3ff47]/25 hover:bg-white/8 text-white/60 hover:text-white font-semibold text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-300 backdrop-blur-sm">
                      <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Compartir
                    </button>
                  </div>
                </div>

                {/* Right column - Player card (desktop only) */}
                <div className="hidden lg:flex justify-start items-end pb-2">
                  <div className="sd-float-card relative">
                    <div className="absolute -inset-6 bg-[#a3ff47]/15 rounded-3xl blur-3xl pointer-events-none" />

                    <div className="relative w-80 xl:w-96 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-slate-800/80 to-slate-900/90 backdrop-blur-md shadow-2xl shadow-black/60 sd-card-in">
                      <div className="relative h-64 xl:h-80 overflow-hidden">
                        <img
                          src={player.thumbnail}
                          alt={player.playerName}
                          className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700"
                          style={{ objectPosition: 'center 22%' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                        <div className="absolute top-4 right-4 bg-[#a3ff47] text-slate-950 text-[10px] font-black tracking-[0.18em] uppercase px-3 py-1.5 rounded-full shadow-lg">
                          Elite
                        </div>

                        <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-sm border border-[#a3ff47]/20 px-3 py-1.5 rounded-xl">
                          <p className="text-[#a3ff47] font-black text-lg leading-none">
                            {player.stats.duprRating}
                          </p>
                          <p className="text-white/30 text-[9px] uppercase tracking-widest">
                            DUPR Rating
                          </p>
                        </div>
                      </div>

                      <div className="p-5">
                        <p className="text-white font-bold text-xl leading-tight mb-0.5">
                          {player.playerName}
                        </p>
                        <p className="text-[#a3ff47]/60 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                          Jugador Destacado · FEDMEX
                        </p>

                        <div className="grid grid-cols-3 gap-2 border-t border-white/6 pt-4">
                          {[
                            {
                              Icon: Award,
                              count: player.stats.gold,
                              label: 'Oro',
                              bg: 'bg-amber-400/8',
                              border: 'border-amber-400/15',
                              text: 'text-amber-300',
                            },
                            {
                              Icon: Medal,
                              count: player.stats.silver,
                              label: 'Plata',
                              bg: 'bg-slate-400/8',
                              border: 'border-slate-400/15',
                              text: 'text-slate-200',
                            },
                            {
                              Icon: Star,
                              count: player.stats.bronze,
                              label: 'Bronce',
                              bg: 'bg-amber-700/8',
                              border: 'border-amber-700/15',
                              text: 'text-amber-500',
                            },
                          ].map(({ Icon, count, label, bg, border, text }) => (
                            <div
                              key={label}
                              className={`${bg} ${border} border rounded-xl p-2.5 text-center hover:scale-105 transition-transform duration-300`}
                            >
                              <Icon className={`w-4 h-4 ${text} mx-auto mb-1.5`} />
                              <p className={`font-black text-xl leading-none ${text}`}>{count}</p>
                              <p className="text-white/25 text-[9px] uppercase tracking-widest mt-1">
                                {label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="absolute -top-3 -right-3 w-16 h-16 border-t-2 border-r-2 border-[#a3ff47]/30 rounded-tr-3xl pointer-events-none" />
                    <div className="absolute -bottom-3 -left-3 w-16 h-16 border-b-2 border-l-2 border-lime-500/20 rounded-bl-3xl pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a3ff47]/30 to-transparent" />
        </section>

        {/* Stats summary section */}
        <section className="relative z-90 mt-3 sm:mt-5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-r from-[#a3ff47] via-lime-300 to-[#a3ff47] rounded-2xl sm:rounded-3xl opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-700" />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 rounded-2xl sm:rounded-3xl border border-white/6 overflow-hidden p-4 sm:p-6 lg:p-10">
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: `radial-gradient(circle, rgba(163,255,71,0.9) 1px, transparent 1px)`,
                      backgroundSize: '22px 22px',
                    }}
                  />
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#a3ff47]/50 to-transparent" />

                  <div className="relative z-10 flex flex-col gap-6 sm:gap-8">
                    {/* Top section - info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 mb-3 sm:mb-4">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a3ff47]" />
                        <span className="text-xs sm:text-sm font-medium">
                          {formatDate(player.publishedAt)}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-tight mb-4 sm:mb-5">
                        {player.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="inline-flex items-center gap-2 sm:gap-2.5 bg-[#a3ff47]/10 border border-[#a3ff47]/25 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl">
                          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a3ff47]" />
                          <span className="text-white font-bold text-xs sm:text-sm">
                            {player.playerName}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-2 sm:gap-2.5 bg-white/5 border border-white/8 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl">
                          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a3ff47]" />
                          <span className="text-[#a3ff47] font-black text-xs sm:text-sm">
                            DUPR {player.stats.duprRating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom section - medals */}
                    <div className="flex gap-3 sm:gap-4 lg:gap-5 justify-center lg:justify-center flex-shrink-0 border-t border-white/5 pt-6 sm:pt-8 lg:pt-0 lg:border-t-0">
                      {[
                        {
                          Icon: Award,
                          count: player.stats.gold,
                          label: 'Oro',
                          glow: 'shadow-amber-400/60',
                          bg: 'bg-amber-400',
                          iconColor: 'text-slate-900',
                        },
                        {
                          Icon: Medal,
                          count: player.stats.silver,
                          label: 'Plata',
                          glow: 'shadow-slate-400/40',
                          bg: 'bg-gradient-to-br from-slate-400 to-slate-500',
                          iconColor: 'text-white',
                        },
                        {
                          Icon: Star,
                          count: player.stats.bronze,
                          label: 'Bronce',
                          glow: 'shadow-amber-700/50',
                          bg: 'bg-gradient-to-br from-amber-600 to-amber-800',
                          iconColor: 'text-white',
                        },
                      ].map(({ Icon, count, label, glow, bg, iconColor }) => (
                        <div key={label} className="text-center group/medal">
                          <div
                            className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 ${bg} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl ${glow} mb-2 sm:mb-3 group-hover/medal:scale-110 group-hover/medal:-translate-y-1 transition-all duration-300`}
                          >
                            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${iconColor}`} />
                          </div>
                          <p className="text-white font-black text-xl sm:text-2xl lg:text-4xl leading-none mb-0.5 sm:mb-1">
                            {count}
                          </p>
                          <p className="text-white/35 text-[10px] sm:text-xs uppercase tracking-widest font-semibold">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article content section */}
        <section id="article" className="relative py-6 sm:py-8 lg:py-8">
          <div className="absolute pointer-events-none inset-0 overflow-hidden">
            <div className="absolute top-1/3 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-[#a3ff47]/4 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-lime-500/3 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-2xl sm:rounded-3xl border border-white/5 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a3ff47]/20 to-transparent" />

                <div
                  className="absolute inset-0 opacity-[0.025]"
                  style={{
                    backgroundImage: `linear-gradient(rgba(163,255,71,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(163,255,71,0.5) 1px, transparent 1px)`,
                    backgroundSize: '44px 44px',
                  }}
                />

                <div className="sd-prose relative z-10 p-5 sm:p-6 lg:p-10 xl:p-14">
                  {renderContent(player.content)}
                </div>
              </div>

              {/* Footer actions */}
              <div className="mt-6 sm:mt-8 lg:mt-10 pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Link to="/players/showcase">
                  <button className="group inline-flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/8 hover:border-[#a3ff47]/30 hover:bg-white/8 text-white/60 hover:text-white font-bold text-xs sm:text-sm px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all duration-300">
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a3ff47] group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden sm:inline">Ver más jugadores destacados</span>
                    <span className="sm:hidden">Más jugadores</span>
                  </button>
                </Link>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white/25 text-xs">Compartir:</span>
                  <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 hover:border-[#a3ff47]/25 transition-colors">
                    <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                  </button>
                  <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 hover:border-[#a3ff47]/25 transition-colors">
                    <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                  </button>
                  <span className="text-white/20 text-xs ml-2 hidden sm:inline">
                    {formatDate(player.publishedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-12 sm:py-16 lg:py-20 xl:py-28 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[#a3ff47]/15 via-lime-400/10 to-[#a3ff47]/15 rounded-2xl sm:rounded-3xl blur-3xl" />

              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 rounded-2xl sm:rounded-3xl border border-white/6 overflow-hidden p-6 sm:p-8 lg:p-12 xl:p-14 text-center">
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: `radial-gradient(circle, rgba(163,255,71,0.9) 1px, transparent 1px)`,
                    backgroundSize: '22px 22px',
                  }}
                />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a3ff47]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a3ff47]/20 to-transparent" />

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#a3ff47]/10 border border-[#a3ff47]/20 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-[#a3ff47] animate-pulse" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                    Únete a la Élite del Pickleball
                  </h3>
                  <p className="text-white/40 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 lg:mb-10 max-w-xl mx-auto leading-relaxed px-4">
                    Conviértete en parte de la comunidad de jugadores más competitiva de México
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <a
                      href="/register"
                      className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 bg-[#a3ff47] text-slate-950 font-black px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-[#a3ff47]/40 transition-all duration-500 text-sm sm:text-base"
                    >
                      <span className="relative z-10">Comenzar Ahora</span>
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </a>
                    <a
                      href="/players/showcase"
                      className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-white/5 border border-white/10 hover:border-[#a3ff47]/25 hover:bg-white/8 text-white/60 hover:text-white font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 text-sm sm:text-base"
                    >
                      Ver más historias
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile spacing */}
      <div className="lg:hidden h-12 sm:h-16" />

      <Footer />
    </div>
  );
};

export default ShowcaseDetail;
