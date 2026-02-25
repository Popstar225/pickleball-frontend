import { useState } from 'react';
import {
  Search,
  MapPin,
  Award,
  Calendar,
  Mail,
  Phone,
  Users,
  Filter,
  ChevronRight,
  Shield,
  Star,
  X,
  Sparkles,
} from 'lucide-react';

import { referees, coaches } from '@/data/mockData';

// ─── Certification colour tokens ───────────────────────────
const CERT_STYLES = {
  3: {
    bg: 'bg-primary/20',
    border: 'border-primary/30',
    text: 'text-primary',
    dotBg: 'bg-primary',
    glow: 'shadow-primary/50',
    gradFrom: 'from-primary',
    gradTo: 'to-lime-500',
  },
  2: {
    bg: 'bg-amber-400/20',
    border: 'border-amber-400/30',
    text: 'text-amber-400',
    dotBg: 'bg-amber-400',
    glow: 'shadow-amber-400/50',
    gradFrom: 'from-amber-400',
    gradTo: 'to-orange-500',
  },
  1: {
    bg: 'bg-slate-400/20',
    border: 'border-slate-400/30',
    text: 'text-slate-400',
    dotBg: 'bg-slate-400',
    glow: 'shadow-slate-400/50',
    gradFrom: 'from-slate-400',
    gradTo: 'to-slate-500',
  },
};

const getCert = (cert: string) => {
  if (cert.includes('Level 3')) return CERT_STYLES[3];
  if (cert.includes('Level 2')) return CERT_STYLES[2];
  return CERT_STYLES[1];
};

// ─── Small reusable icon-row used inside cards & modal ─────
const DetailRow = ({
  icon: Icon,
  children,
  className = '',
}: {
  icon: React.FC<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`flex items-center gap-3 text-sm text-slate-400 group-hover:text-slate-300 transition-colors ${className}`}
  >
    <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <span>{children}</span>
  </div>
);

const Referees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [certFilter, setCertFilter] = useState('all');
  const [selected, setSelected] = useState<(typeof referees)[0] | null>(null);

  const states = [...new Set(referees.map((r) => r.state))];
  const certs = [...new Set(referees.map((r) => r.certification))];

  const filtered = referees.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      (r.name.toLowerCase().includes(q) || r.state.toLowerCase().includes(q)) &&
      (stateFilter === 'all' || r.state === stateFilter) &&
      (certFilter === 'all' || r.certification === certFilter)
    );
  });

  const hasActiveFilter = stateFilter !== 'all' || certFilter !== 'all' || searchTerm;
  const clearFilters = () => {
    setSearchTerm('');
    setStateFilter('all');
    setCertFilter('all');
  };

  // ── count helpers for hero stats ──
  const lvl3Count = referees.filter((r) => r.certification.includes('Level 3')).length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5">
      <main className="flex-1">
        {/* ═══════════════════════════════════════════
            HERO  — two-column layout matching Benefits
        ═══════════════════════════════════════════ */}
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
          {/* ambient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
              {/* ── Left: copy ── */}
              <div className="order-2 lg:order-1 space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="inline-block animate-fade-in">
                  <span className="inline-flex items-center gap-2 text-primary text-xs sm:text-sm font-bold tracking-widest uppercase bg-primary/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-primary/20 backdrop-blur-sm">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    Oficiales Certificados
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  Árbitros Y Entrenadores
                  <span className="block text-primary mt-1 sm:mt-2">Oficiales</span>
                </h1>

                <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed">
                  Conoce a los árbitros y entrenadores certificados que garantizan el juego justo y
                  la deportividad en todos los eventos de la Federación Mexicana de Pickleball.
                </p>

                {/* quick stats row */}
                <div className="flex flex-wrap gap-4 sm:gap-6 pt-2 sm:pt-4">
                  {[
                    { value: coaches.length, label: 'Entrenadores' },
                    { value: referees.length, label: 'Árbitros' },
                    { value: lvl3Count, label: 'Level 3' },
                    { value: states.length, label: 'Estados' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</div>
                      <div className="text-xs sm:text-sm text-white/60 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 pt-2 sm:pt-4">
                  <a
                    href="#referees"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-lime-dark hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/25 text-sm sm:text-base w-full sm:w-auto"
                  >
                    Ver Árbitros
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                  <a
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-white/90 hover:text-slate-900 transition-all duration-300 border border-white/20 text-sm sm:text-base w-full sm:w-auto"
                  >
                    Convertirme en Á rbitro o E ntrenador
                  </a>
                </div>
              </div>

              {/* ── Right: icon card (mirrors Benefits logo card) ── */}
              <div className="order-1 lg:order-2 relative">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary to-lime-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                    <div className="p-8 sm:p-12 flex flex-col items-center justify-center gap-6">
                      {/* big shield icon */}
                      <div className="w-40 h-40 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Shield className="w-24 h-24 text-primary" />
                      </div>
                      <p className="text-slate-400 text-center font-semibold text-lg">
                        Equipo Oficial de Árbitros
                      </p>
                      <p className="text-slate-600 text-sm text-center max-w-xs leading-relaxed">
                        Profesionales certificados que garantizan la integridad de cada partido
                      </p>
                    </div>
                  </div>

                  {/* floating badge */}
                  <div className="hidden lg:flex absolute -bottom-6 -right-6 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-xl space-y-3">
                    <div>
                      <div className="text-3xl font-bold">{referees.length}+</div>
                      <div className="text-sm opacity-90">Árbitros</div>
                    </div>
                    <div className="border-t border-primary-foreground/20 pt-3">
                      <div className="text-3xl font-bold">{coaches.length}+</div>
                      <div className="text-sm opacity-90">Entrenadores</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            MAIN GRID SECTION
        ═══════════════════════════════════════════ */}
        <section
          id="referees"
          className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden"
        >
          {/* BG atmosphere — identical to Benefits */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(124,252,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,252,0,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto space-y-12">
              {/* ── Section header ── */}
              <div className="text-center max-w-3xl mx-auto px-4">
                <div className="inline-block mb-3 sm:mb-4">
                  <span className="text-primary text-xs sm:text-sm font-bold uppercase tracking-wider bg-primary/10 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border border-primary/20">
                    Buscar Árbitros
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6 leading-tight">
                  Todo el equipo
                </h2>
                <p className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed px-2">
                  Busca y conoce a los árbitros y entrenadores certificados disponibles en todo
                  México
                </p>
                <div className="flex items-center justify-center gap-3 mt-8">
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent to-primary rounded-full" />
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <div className="w-12 h-1 bg-gradient-to-l from-transparent to-primary rounded-full" />
                </div>
              </div>

              {/* ── Search + Filters bar ── */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-lime-500 rounded-2xl opacity-20 blur-xl" />
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                    {/* search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o estado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    {/* state */}
                    <div className="relative flex-1 md:flex-auto">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="w-full md:w-40 bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 sm:py-4 text-xs sm:text-sm text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="all">Todos los Estados</option>
                        {states.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* certification */}
                    <div className="relative flex-1 md:flex-auto">
                      <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <select
                        value={certFilter}
                        onChange={(e) => setCertFilter(e.target.value)}
                        className="w-full md:w-40 bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 sm:py-4 text-xs sm:text-sm text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="all">Todos los Niveles</option>
                        {certs.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* result count + clear */}
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm">
                  Mostrando <span className="text-white font-bold">{filtered.length}</span> árbitros
                </p>
                {hasActiveFilter && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Limpiar filtros
                  </button>
                )}
              </div>

              {/* ═══ REFEREE CARDS ═══ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filtered.map((referee, index) => {
                  const c = getCert(referee.certification);
                  return (
                    <div
                      key={referee.id}
                      className="group relative overflow-hidden rounded-3xl transition-all duration-700 hover:-translate-y-3 cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setSelected(referee)}
                    >
                      {/* outer glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

                      <div className="relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden">
                        {/* hover fill */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* shimmer sweep */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        </div>

                        <div className="relative p-5 sm:p-6 md:p-7 flex flex-col h-full min-h-[260px] md:min-h-[340px]">
                          {/* ── avatar + name row ── */}
                          <div className="flex items-start gap-4 mb-6">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              <img
                                src={referee.avatar}
                                alt={referee.name}
                                className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-700 group-hover:border-primary/50 transition-colors duration-500"
                              />
                              {/* cert indicator dot */}
                              <div
                                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 ${c.bg}`}
                              >
                                <Star className={`w-2.5 h-2.5 ${c.text}`} />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors duration-500 truncate">
                                {referee.name}
                              </h3>
                              <div
                                className={`inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${c.bg} ${c.border} ${c.text}`}
                              >
                                <Award className="w-3.5 h-3.5" />
                                {referee.certification}
                              </div>
                            </div>
                          </div>

                          {/* ── detail rows ── */}
                          <div className="flex-1 space-y-3">
                            <DetailRow icon={MapPin}>{referee.state}</DetailRow>
                            <DetailRow icon={Shield}>{referee.specialization}</DetailRow>
                            <DetailRow icon={Calendar}>
                              {referee.yearsExperience} años de experiencia
                            </DetailRow>
                            <DetailRow icon={Users}>
                              {referee.eventsOfficiated} eventos oficialados
                            </DetailRow>
                          </div>

                          {/* ── bio snippet ── */}
                          <p className="text-slate-500 text-sm leading-relaxed mt-5 line-clamp-2 group-hover:text-slate-400 transition-colors">
                            {referee.bio}
                          </p>

                          {/* ── hover CTA ── */}
                          <div className="mt-6 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 font-semibold text-sm">
                            <span>Ver perfil completo</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" />
                          </div>

                          {/* bottom accent line */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>

                        {/* corner decorations */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-lime-500/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── empty state ── */}
              {filtered.length === 0 && (
                <div className="text-center py-24">
                  <div className="w-24 h-24 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-6">
                    <Filter className="w-12 h-12 text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No se encontraron árbitros</h3>
                  <p className="text-slate-400 mb-6">Intenta ajustar tus filtros de búsqueda</p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-500"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}

              {/* ═══ CTA BANNER — identical structure to Benefits ═══ */}
              <div className="mt-24 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-lime-500/20 to-primary/20 rounded-3xl blur-3xl opacity-30" />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden">
                  {/* animated gradient overlay */}
                  <div className="absolute inset-0 opacity-5">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-primary via-lime-400 to-primary"
                      style={{ backgroundSize: '200% 200%' }}
                    />
                  </div>
                  {/* corner glows */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />
                  {/* dot pattern */}
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124,252,0,0.3) 1px, transparent 0)`,
                      backgroundSize: '32px 32px',
                    }}
                  />

                  <div className="relative z-10 p-8 sm:p-12 md:p-16 text-center">
                    <div className="inline-block mb-6 max-w-full">
                      <span className="text-primary text-xs font-bold uppercase tracking-widest bg-primary/10 px-3 sm:px-6 py-1 sm:py-2 rounded-full border border-primary/30 inline-flex items-center justify-center max-w-full overflow-hidden truncate whitespace-nowrap">
                        Únete al Equipo
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
                      ¿Quieres ser árbitro o entrenador oficial?
                    </h3>
                    <p className="text-slate-400 text-base sm:text-lg md:text-xl leading-relaxed mb-6 md:mb-10 max-w-lg md:max-w-2xl mx-auto whitespace-normal">
                      Únete a nuestro equipo de árbitros y entrenadores oficiales. Completa el
                      programa de certificación y ayuda a mantener la integridad de las
                      competiciones de pickleball en México.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
                      <a
                        href="/register"
                        className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 overflow-hidden w-full sm:w-auto text-sm sm:text-base whitespace-nowrap text-center"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        <span className="relative z-10">Aplicar a Certificación</span>
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                      </a>

                      <a
                        href="/contact"
                        className="group inline-flex items-center justify-center gap-3 bg-slate-800/50 backdrop-blur-sm text-white font-bold px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl border-2 border-slate-700 hover:border-primary hover:bg-slate-800 transition-all duration-500 w-full sm:w-auto text-sm sm:text-base whitespace-nowrap text-center"
                      >
                        <span>Contactar</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-500" />
                      </a>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 text-sm flex-wrap">
                      {[
                        'Certificación Oficial',
                        'Entrenamiento Profesional',
                        'Eventos Nacionales',
                      ].map((label, i) => (
                        <div key={label} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 100}ms` }}
                          />
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════
          PROFILE MODAL
      ═══════════════════════════════════════════ */}
      {selected &&
        (() => {
          const c = getCert(selected.certification);
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelected(null)}
            >
              {/* backdrop */}
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

              {/* panel */}
              <div
                className="relative w-full max-w-lg rounded-3xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* glow behind */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-lime-500/20 to-primary/30 rounded-3xl blur-xl" />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* dot pattern */}
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124,252,0,0.3) 1px, transparent 0)`,
                      backgroundSize: '32px 32px',
                    }}
                  />

                  {/* close */}
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute top-4 right-4 z-[9999] w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="relative z-10 p-8 overflow-y-auto">
                    {/* avatar + name */}
                    <div className="flex items-center gap-5 mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/30 blur-lg" />
                        <img
                          src={selected.avatar}
                          alt={selected.name}
                          className="relative w-20 h-20 rounded-full object-cover border-2 border-primary/50"
                        />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selected.name}</h2>
                        <div
                          className={`inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${c.bg} ${c.border} ${c.text}`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          {selected.certification}
                        </div>
                      </div>
                    </div>

                    {/* bio */}
                    <p className="text-slate-400 leading-relaxed mb-6">{selected.bio}</p>

                    {/* stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        { value: selected.eventsOfficiated, label: 'Eventos' },
                        { value: selected.yearsExperience, label: 'Años' },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 text-center"
                        >
                          <p className="text-3xl font-bold text-primary">{s.value}</p>
                          <p className="text-sm text-slate-500 mt-1">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* detail rows */}
                    <div className="space-y-3">
                      {[
                        { Icon: MapPin, label: selected.state },
                        { Icon: Shield, label: selected.specialization },
                        { Icon: Mail, label: selected.email, href: `mailto:${selected.email}` },
                        { Icon: Phone, label: selected.phone, href: `tel:${selected.phone}` },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3"
                        >
                          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                            <item.Icon className="w-4 h-4 text-primary" />
                          </div>
                          {item.href ? (
                            <a href={item.href} className="text-sm text-primary hover:underline">
                              {item.label}
                            </a>
                          ) : (
                            <span className="text-sm text-slate-300">{item.label}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default Referees;
