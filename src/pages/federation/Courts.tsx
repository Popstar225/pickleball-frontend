import { useState } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  Building2,
  Dumbbell,
  Filter,
  ExternalLink,
  ChevronRight,
  X,
  Star,
  Navigation,
  Wifi,
  Coffee,
  Zap,
  Shield,
  Award,
} from 'lucide-react';

import { courts } from '@/data/mockData';

// ─── Type color tokens (matching cert styles from Referees) ───
const TYPE_STYLES = {
  Indoor: {
    bg: 'bg-primary/20',
    border: 'border-primary/30',
    text: 'text-primary',
    dotBg: 'bg-primary',
    glow: 'shadow-primary/50',
    gradFrom: 'from-primary',
    gradTo: 'to-lime-500',
  },
  Outdoor: {
    bg: 'bg-amber-400/20',
    border: 'border-amber-400/30',
    text: 'text-amber-400',
    dotBg: 'bg-amber-400',
    glow: 'shadow-amber-400/50',
    gradFrom: 'from-amber-400',
    gradTo: 'to-orange-500',
  },
};

const getTypeStyle = (type: string) =>
  TYPE_STYLES[type as keyof typeof TYPE_STYLES] || TYPE_STYLES.Indoor;

// ─── Reusable detail row ───
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
    <span className="flex-1">{children}</span>
  </div>
);

const Courts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<(typeof courts)[0] | null>(null);

  const states = [...new Set(courts.map((c) => c.state))];

  const filtered = courts.filter((court) => {
    const q = searchTerm.toLowerCase();
    return (
      (court.name.toLowerCase().includes(q) ||
        court.address.toLowerCase().includes(q) ||
        court.state.toLowerCase().includes(q)) &&
      (stateFilter === 'all' || court.state === stateFilter) &&
      (typeFilter === 'all' || court.type === typeFilter)
    );
  });

  const hasActiveFilter = stateFilter !== 'all' || typeFilter !== 'all' || searchTerm;
  const clearFilters = () => {
    setSearchTerm('');
    setStateFilter('all');
    setTypeFilter('all');
  };

  // ── count helpers for hero stats ──
  const indoorCount = courts.filter((c) => c.type === 'Indoor').length;
  const verifiedCount = courts.filter((c) => c.verified).length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5">
      <main className="flex-1">
        {/* ═══════════════════════════════════════════
            HERO SECTION — Two-column layout
        ═══════════════════════════════════════════ */}
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
          {/* ambient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
              {/* ── Left: copy ── */}
              <div className="order-2 lg:order-1 space-y-6">
                <div className="inline-block animate-fade-in">
                  <span className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-widest uppercase bg-primary/10 px-6 py-3 rounded-full border border-primary/20 backdrop-blur-sm">
                    <MapPin className="w-4 h-4" />
                    Instalaciones Certificadas
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  Canchas de
                  <span className="block text-primary mt-2">Pickleball</span>
                </h1>

                <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed">
                  Descubre las mejores instalaciones de pickleball en todo México. Canchas
                  verificadas con información completa de contacto y servicios.
                </p>

                {/* quick stats row */}
                <div className="flex flex-wrap gap-4 sm:gap-6 pt-4">
                  {[
                    { value: courts.length, label: 'Instalaciones' },
                    { value: verifiedCount, label: 'Verificadas' },
                    { value: states.length, label: 'Estados' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-3xl font-bold text-primary">{s.value}</div>
                      <div className="text-sm text-white/60 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <a
                    href="#courts"
                    className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-lime-dark hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/25"
                  >
                    Ver Canchas
                    <ChevronRight className="w-5 h-5" />
                  </a>
                  <a
                    href="/register-court"
                    className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-white/10 backdrop-blur text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-white/90 hover:text-slate-900 transition-all duration-300 border border-white/20"
                  >
                    Registrar Instalación
                  </a>
                </div>
              </div>

              {/* ── Right: icon card ── */}
              <div className="order-1 lg:order-2 relative">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary to-lime-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                    <div className="p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center gap-6">
                      {/* big building icon */}
                      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Building2 className="w-20 h-20 sm:w-24 sm:h-24 text-primary" />
                      </div>
                      <p className="text-slate-400 text-center font-semibold text-lg">
                        Red Nacional de Canchas
                      </p>
                      <p className="text-slate-600 text-sm text-center max-w-xs leading-relaxed">
                        Instalaciones certificadas en todo el país para entrenar y competir
                      </p>
                    </div>
                  </div>

                  {/* floating badge */}
                  <div className="hidden sm:flex absolute -bottom-6 -right-6 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-xl">
                    <div className="text-3xl font-bold">{courts.length}+</div>
                    <div className="text-sm opacity-90">Canchas</div>
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
          id="courts"
          className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden"
        >
          {/* BG atmosphere */}
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
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-block mb-4">
                  <span className="text-primary text-sm font-bold uppercase tracking-wider bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                    Buscar Canchas
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent mb-6">
                  Todas las Instalaciones
                </h2>
                <p className="text-slate-400 text-base sm:text-lg md:text-xl leading-relaxed">
                  Encuentra la cancha perfecta cerca de ti con todas las amenidades que necesitas
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
                        placeholder="Buscar por nombre, ubicación o estado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    {/* state */}
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="w-full md:w-40 bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="all">Todos los Estados</option>
                        {states.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* type */}
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full md:w-40 bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="all">Todos los Tipos</option>
                        <option value="Indoor">Indoor</option>
                        <option value="Outdoor">Outdoor</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* result count + clear */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <p className="text-slate-500 text-sm">
                  Mostrando <span className="text-white font-bold">{filtered.length}</span>{' '}
                  instalaciones
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

              {/* ═══ COURT CARDS ═══ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filtered.map((court, index) => {
                  const typeStyle = getTypeStyle(court.type);
                  return (
                    <div
                      key={court.id}
                      className="group relative overflow-hidden rounded-3xl transition-all duration-700 hover:-translate-y-3 cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setSelected(court)}
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

                        <div className="relative flex flex-col h-full">
                          {/* ── Image header ── */}
                          <div className="relative h-44 sm:h-56 overflow-hidden">
                            <img
                              src={court.image}
                              alt={court.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                            {/* verified badge */}
                            {court.verified && (
                              <div className="absolute top-4 left-4">
                                <div className="flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg border border-primary/30">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Verificado
                                </div>
                              </div>
                            )}

                            {/* type badge */}
                            <div className="absolute top-4 right-4">
                              <div
                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text} backdrop-blur-sm`}
                              >
                                <Building2 className="w-3.5 h-3.5" />
                                {court.type}
                              </div>
                            </div>

                            {/* courts count badge */}
                            <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-lg border border-slate-700/50">
                              {court.numberOfCourts} Canchas
                            </div>
                          </div>

                          {/* ── Content ── */}
                          <div className="relative p-4 sm:p-6 flex-1 flex flex-col">
                            {/* name */}
                            <h3 className="font-bold text-lg sm:text-xl text-white group-hover:text-primary transition-colors duration-500 mb-4">
                              {court.name}
                            </h3>

                            {/* detail rows */}
                            <div className="flex-1 space-y-3 mb-4">
                              <DetailRow icon={MapPin}>{court.address}</DetailRow>
                              <DetailRow icon={Clock}>{court.hours}</DetailRow>
                              <DetailRow icon={Dumbbell}>{court.surface}</DetailRow>
                            </div>

                            {/* amenities */}
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {court.amenities.slice(0, 3).map((amenity, i) => (
                                  <div
                                    key={i}
                                    className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs px-3 py-1 rounded-lg"
                                  >
                                    {amenity}
                                  </div>
                                ))}
                                {court.amenities.length > 3 && (
                                  <div className="bg-primary/10 border border-primary/20 text-primary text-xs px-3 py-1 rounded-lg font-semibold">
                                    +{court.amenities.length - 3} más
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ── hover CTA ── */}
                            <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 font-semibold text-sm">
                              <span>Ver detalles completos</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" />
                            </div>

                            {/* bottom accent line */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          </div>

                          {/* corner decorations */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-lime-500/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>
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
                  <h3 className="text-2xl font-bold text-white mb-3">No se encontraron canchas</h3>
                  <p className="text-slate-400 mb-6">Intenta ajustar tus filtros de búsqueda</p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-500"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}

              {/* ═══ CTA BANNER ═══ */}
              <div className="mt-24 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-lime-500/20 to-primary/20 rounded-3xl blur-3xl opacity-30" />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden">
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
                    <div className="inline-block mb-6">
                      <span className="text-primary text-xs font-bold uppercase tracking-widest bg-primary/10 px-6 py-2 rounded-full border border-primary/30">
                        Registra Tu Instalación
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-6">
                      ¿Tienes una cancha de pickleball?
                    </h3>

                    <p className="text-slate-400 text-base sm:text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
                      Únete a nuestra red nacional de instalaciones certificadas. Registra tu cancha
                      para aparecer en nuestro directorio y atraer más jugadores.
                    </p>

                    <div className="flex flex-wrap gap-6 justify-center">
                      <a
                        href="/register-court"
                        className="group relative inline-flex items-center gap-3 justify-center w-full sm:w-auto bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-2xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        <span className="relative z-10">Registrar Instalación</span>
                        <Building2 className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                      </a>

                      <a
                        href="/contact"
                        className="group inline-flex items-center gap-3 justify-center w-full sm:w-auto bg-slate-800/50 backdrop-blur-sm text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-2xl border-2 border-slate-700 hover:border-primary hover:bg-slate-800 transition-all duration-500"
                      >
                        <span>Contactar</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" />
                      </a>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 text-sm flex-wrap">
                      {['Verificación Oficial', 'Mayor Visibilidad', 'Comunidad Nacional'].map(
                        (label, i) => (
                          <div key={label} className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-pulse"
                              style={{ animationDelay: `${i * 100}ms` }}
                            />
                            <span>{label}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════
          COURT DETAILS MODAL
      ═══════════════════════════════════════════ */}
      {selected &&
        (() => {
          const typeStyle = getTypeStyle(selected.type);
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelected(null)}
            >
              {/* backdrop */}
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

              {/* panel */}
              <div
                className="relative w-full max-w-lg sm:max-w-2xl rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* glow behind */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-lime-500/20 to-primary/30 rounded-3xl blur-xl" />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl overflow-hidden">
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

                  <div className="relative z-10">
                    {/* Image header */}
                    <div className="relative h-40 sm:h-56 md:h-64 overflow-hidden">
                      <img
                        src={selected.image}
                        alt={selected.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                      {/* badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {selected.verified && (
                          <div className="flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg border border-primary/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verificado
                          </div>
                        )}
                        <div
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text} backdrop-blur-sm`}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          {selected.type}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 md:p-8">
                      {/* name + courts count */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-white break-words">
                          {selected.name}
                        </h2>
                        <div className="bg-primary/10 border border-primary/20 text-primary text-sm font-bold px-3 py-1.5 rounded-lg whitespace-nowrap mt-3 sm:mt-0">
                          {selected.numberOfCourts} Canchas
                        </div>
                      </div>

                      {/* detail rows */}
                      <div className="space-y-3 mb-8">
                        {[
                          { Icon: MapPin, label: selected.address },
                          { Icon: Clock, label: selected.hours },
                          { Icon: Dumbbell, label: selected.surface },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2"
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                              <item.Icon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm text-slate-300 break-words">{item.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* amenities */}
                      <div className="mb-8">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-primary" />
                          Amenidades
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selected.amenities.map((amenity, i) => (
                            <div
                              key={i}
                              className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm px-3 py-1.5 rounded-lg"
                            >
                              {amenity}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* contact */}
                      <div className="pt-6 border-t border-slate-700/50">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Phone className="w-5 h-5 text-primary" />
                          Contacto
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <a
                            href={`mailto:${selected.contactEmail}`}
                            className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2 hover:border-primary/50 transition-colors group min-w-0"
                          >
                            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center px-1">
                              <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Email</div>
                              <div className="text-sm text-primary truncate max-w-[14rem]">
                                {selected.contactEmail}
                              </div>
                            </div>
                          </a>
                          <a
                            href={`tel:${selected.contactPhone}`}
                            className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2 hover:border-primary/50 transition-colors group min-w-0"
                          >
                            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center px-1">
                              <Phone className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Teléfono</div>
                              <div className="text-sm text-primary truncate max-w-[10rem]">
                                {selected.contactPhone}
                              </div>
                            </div>
                          </a>
                        </div>
                      </div>

                      {/* CTA button */}
                      <div className="mt-6">
                        <a
                          href="#"
                          className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-4 py-3 sm:px-6 sm:py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-500"
                        >
                          <span>Visitar Sitio Web</span>
                          <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
                        </a>
                      </div>
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

export default Courts;
