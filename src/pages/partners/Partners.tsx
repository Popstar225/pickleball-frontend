import { useState } from 'react';
import {
  Search,
  ExternalLink,
  Star,
  Award,
  Building2,
  Handshake,
  Trophy,
  Zap,
  Shield,
  ChevronRight,
  X,
  MapPin,
  Globe,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';

import Logo from '../../assets/images/Logos/Logo pickleball compressed.png';

const partners = [
  {
    id: 1,
    name: 'Pickleball Santa Fe',
    category: 'Club',
    level: 'Oro',
    logo: Logo,
    description:
      'Comunidad activa comprometida con el desarrollo del pickleball en la Ciudad de México',
    location: 'Ciudad de México',
    website: 'https://pickleballsantafe.com',
    email: 'info@pickleballsantafe.com',
    phone: '+52 55 1234 5678',
    featured: true,
    stats: {
      miembros: '500+',
      canchas: 8,
      eventos: '20+',
    },
  },
  {
    id: 2,
    name: 'Electric Pickle',
    category: 'Internacional',
    level: 'Platino',
    logo: Logo,
    description:
      'Uno de los espacios de pickleball más innovadores y reconocidos en los Estados Unidos',
    location: 'Estados Unidos',
    website: 'https://electricpickle.com',
    email: 'contact@electricpickle.com',
    phone: '+1 555 123 4567',
    featured: true,
    stats: {
      miembros: '1000+',
      canchas: 12,
      eventos: '50+',
    },
  },
  {
    id: 3,
    name: 'Paddle Pro Shop',
    category: 'Venta al por menor',
    level: 'Oro',
    logo: Logo,
    description: 'Tienda líder en equipamiento de pickleball que atiende al mercado mexicano',
    location: 'Monterrey, NL',
    website: 'https://paddleproshop.com',
    email: 'sales@paddleproshop.com',
    phone: '+52 81 1234 5678',
    featured: false,
    stats: {
      productos: '300+',
      ubicaciones: 3,
      marcas: '15+',
    },
  },
  {
    id: 4,
    name: 'Court Builders MX',
    category: 'Construcción',
    level: 'Plata',
    logo: Logo,
    description:
      'Especialistas en la construcción y mantenimiento profesional de canchas de pickleball',
    location: 'Guadalajara, JAL',
    website: 'https://courtbuilders.mx',
    email: 'info@courtbuilders.mx',
    phone: '+52 33 1234 5678',
    featured: false,
    stats: {
      canchas: '50+',
      proyectos: '30+',
      experiencia: '5 años',
    },
  },
  {
    id: 5,
    name: 'Pickleball Coaching Academy',
    category: 'Entrenamiento',
    level: 'Oro',
    logo: Logo,
    description: 'Entrenamiento profesional y programas de formación para todos los niveles',
    location: 'Querétaro, QRO',
    website: 'https://pickleballcoaching.mx',
    email: 'academy@pickleballcoaching.mx',
    phone: '+52 442 123 4567',
    featured: false,
    stats: {
      entrenadores: '15+',
      estudiantes: '200+',
      programas: '10+',
    },
  },
  {
    id: 6,
    name: 'Tournament Management Pro',
    category: 'Servicios',
    level: 'Plata',
    logo: Logo,
    description: 'Servicios profesionales de organización y gestión de torneos',
    location: 'Cancún, QROO',
    website: 'https://tournamentpro.mx',
    email: 'events@tournamentpro.mx',
    phone: '+52 998 123 4567',
    featured: false,
    stats: {
      torneos: '40+',
      participantes: '2000+',
      ubicaciones: '10+',
    },
  },
];

const categories = [
  'Todos',
  'Club',
  'Internacional',
  'Venta al por menor',
  'Construcción',
  'Entrenamiento',
  'Servicios',
];

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Platino':
      return {
        bg: 'bg-slate-300/20',
        border: 'border-slate-300/30',
        text: 'text-slate-300',
        glow: 'from-slate-300 to-slate-400',
      };
    case 'Oro':
      return {
        bg: 'bg-amber-400/20',
        border: 'border-amber-400/30',
        text: 'text-amber-400',
        glow: 'from-amber-400 to-yellow-500',
      };
    case 'Plata':
      return {
        bg: 'bg-slate-400/20',
        border: 'border-slate-400/30',
        text: 'text-slate-400',
        glow: 'from-slate-400 to-slate-500',
      };
    default:
      return {
        bg: 'bg-primary/20',
        border: 'border-primary/30',
        text: 'text-primary',
        glow: 'from-primary to-lime-500',
      };
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Club':
      return Building2;
    case 'International':
      return Globe;
    case 'Retail':
      return Zap;
    case 'Construction':
      return Award;
    case 'Training':
      return Trophy;
    case 'Services':
      return Handshake;
    default:
      return Star;
  }
};

const Partners = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedPartner, setSelectedPartner] = useState<(typeof partners)[0] | null>(null);

  const filtered = partners.filter((partner) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      partner.name.toLowerCase().includes(q) ||
      partner.description.toLowerCase().includes(q) ||
      partner.location.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'All' || partner.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const hasActiveFilter = categoryFilter !== 'All' || searchTerm;
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
  };

  const featuredPartners = filtered.filter((p) => p.featured);
  const regularPartners = filtered.filter((p) => !p.featured);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5">
      <main className="flex-1">
        {/* ═══════════════════════════════════════════
            HERO SECTION — Two-column layout
        ═══════════════════════════════════════════ */}
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 py-24 lg:py-32 overflow-hidden">
          {/* ambient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* ── Left: copy ── */}
              <div className="order-2 lg:order-1 space-y-6">
                <div className="inline-block animate-fade-in">
                  <span className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-widest uppercase bg-primary/10 px-6 py-3 rounded-full border border-primary/20 backdrop-blur-sm">
                    <Handshake className="w-4 h-4" />
                    Alianzas Estratégicas
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                  Nuestros
                  <span className="block text-primary mt-2">Socios</span>
                </h1>

                <p className="text-white/80 text-xl max-w-xl leading-relaxed">
                  Conoce a las organizaciones y empresas que colaboran con la Federación para
                  impulsar el crecimiento del pickleball en México.
                </p>

                {/* quick stats row */}
                <div className="flex flex-wrap gap-6 pt-4">
                  {[
                    { value: partners.length, label: 'Socios' },
                    { value: categories.length - 1, label: 'Categorías' },
                    { value: '12', label: 'Estados' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-3xl font-bold text-primary">{s.value}</div>
                      <div className="text-sm text-white/60 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <a
                    href="#partners"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl hover:bg-lime-dark hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/25"
                  >
                    Ver Socios
                    <ChevronRight className="w-5 h-5" />
                  </a>
                  <a
                    href="/become-partner"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/90 hover:text-slate-900 transition-all duration-300 border border-white/20"
                  >
                    Ser Socio
                  </a>
                </div>
              </div>

              {/* ── Right: icon card ── */}
              <div className="order-1 lg:order-2 relative">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary to-lime-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                    <div className="p-16 flex flex-col items-center justify-center gap-6">
                      {/* big handshake icon */}
                      <div className="w-40 h-40 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Handshake className="w-24 h-24 text-primary" />
                      </div>
                      <p className="text-slate-400 text-center font-semibold text-lg">
                        Red de Aliados
                      </p>
                      <p className="text-slate-600 text-sm text-center max-w-xs leading-relaxed">
                        Colaboraciones estratégicas para el desarrollo del pickleball mexicano
                      </p>
                    </div>
                  </div>

                  {/* floating badge */}
                  <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-xl">
                    <div className="text-3xl font-bold">{partners.length}+</div>
                    <div className="text-sm opacity-90">Socios</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            MAIN SECTION
        ═══════════════════════════════════════════ */}
        <section
          id="partners"
          className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden"
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
            <div className="max-w-7xl mx-auto space-y-12">
              {/* ── Section header ── */}
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-block mb-4">
                  <span className="text-primary text-sm font-bold uppercase tracking-wider bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                    Directorio de Socios
                  </span>
                </div>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent mb-6">
                  Todos Nuestros Socios
                </h2>
                <p className="text-slate-400 text-xl leading-relaxed">
                  Explora nuestra red de aliados comprometidos con el crecimiento del deporte
                </p>
                <div className="flex items-center justify-center gap-3 mt-8">
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent to-primary rounded-full" />
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <div className="w-12 h-1 bg-gradient-to-l from-transparent to-primary rounded-full" />
                </div>
              </div>

              {/* ── Search + Category Filters ── */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-lime-500 rounded-2xl opacity-20 blur-xl" />
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-5">
                  <div className="flex flex-col gap-4">
                    {/* search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Buscar socios por nombre, descripción o ubicación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    {/* category pills */}
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
                        const Icon = category === 'All' ? Star : getCategoryIcon(category);
                        const isActive = categoryFilter === category;
                        return (
                          <button
                            key={category}
                            onClick={() => setCategoryFilter(category)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white hover:border-primary/50'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* result count + clear */}
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm">
                  Mostrando <span className="text-white font-bold">{filtered.length}</span> socios
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

              {/* ═══ FEATURED PARTNERS ═══ */}
              {featuredPartners.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Socios Destacados
                  </h3>

                  <div className="grid md:grid-cols-2 gap-8">
                    {featuredPartners.map((partner, index) => {
                      const levelColor = getLevelColor(partner.level);
                      const CategoryIcon = getCategoryIcon(partner.category);

                      return (
                        <div
                          key={partner.id}
                          className="group relative overflow-hidden rounded-3xl transition-all duration-700 hover:-translate-y-3 cursor-pointer"
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() => setSelectedPartner(partner)}
                        >
                          {/* outer glow */}
                          <div
                            className={`absolute -inset-1 bg-gradient-to-r ${levelColor.glow} rounded-3xl opacity-30 blur-xl`}
                          />

                          <div className="relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden flex flex-col">
                            {/* shimmer */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                            </div>

                            {/* Logo section */}
                            <div className="relative h-48 bg-slate-800/50 flex items-center justify-center p-8 border-b border-slate-700/50">
                              <img
                                src={partner.logo}
                                alt={partner.name}
                                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700"
                              />
                              {/* Level badge */}
                              <div className="absolute top-4 right-4">
                                <div
                                  className={`flex items-center gap-1.5 backdrop-blur-sm font-bold px-3 py-1.5 rounded-lg border text-xs ${levelColor.bg} ${levelColor.border} ${levelColor.text}`}
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                  {partner.level}
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="relative p-6 flex-1 flex flex-col">
                              {/* Category badge */}
                              <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg">
                                  <CategoryIcon className="w-3.5 h-3.5" />
                                  {partner.category}
                                </div>
                              </div>

                              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                                {partner.name}
                              </h3>

                              <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">
                                {partner.description}
                              </p>

                              {/* Location */}
                              <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                                <MapPin className="w-4 h-4 text-primary" />
                                {partner.location}
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-3 gap-3 mb-4">
                                {Object.entries(partner.stats).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-3 text-center"
                                  >
                                    <div className="text-primary font-bold text-lg">{value}</div>
                                    <div className="text-slate-500 text-xs capitalize">{key}</div>
                                  </div>
                                ))}
                              </div>

                              {/* CTA */}
                              <div className="flex items-center gap-2 text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <span>Ver detalles</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" />
                              </div>
                            </div>

                            {/* bottom accent */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ═══ REGULAR PARTNERS GRID ═══ */}
              {regularPartners.length > 0 && (
                <div className="space-y-6">
                  {featuredPartners.length > 0 && (
                    <h3 className="text-2xl font-bold text-white">Todos los Socios</h3>
                  )}

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularPartners.map((partner, index) => {
                      const levelColor = getLevelColor(partner.level);
                      const CategoryIcon = getCategoryIcon(partner.category);

                      return (
                        <div
                          key={partner.id}
                          className="group relative overflow-hidden rounded-3xl transition-all duration-700 hover:-translate-y-2 cursor-pointer"
                          style={{ animationDelay: `${index * 50}ms` }}
                          onClick={() => setSelectedPartner(partner)}
                        >
                          {/* outer glow */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

                          <div className="relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden flex flex-col">
                            {/* Logo section */}
                            <div className="relative h-32 bg-slate-800/50 flex items-center justify-center p-6 border-b border-slate-700/50">
                              <img
                                src={partner.logo}
                                alt={partner.name}
                                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700"
                              />
                              {/* Level badge */}
                              <div className="absolute top-3 right-3">
                                <div
                                  className={`flex items-center gap-1 backdrop-blur-sm font-bold px-2 py-1 rounded-lg border text-xs ${levelColor.bg} ${levelColor.border} ${levelColor.text}`}
                                >
                                  <Shield className="w-3 h-3" />
                                  {partner.level}
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="relative p-5 flex-1 flex flex-col">
                              {/* Category */}
                              <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg mb-3 w-fit">
                                <CategoryIcon className="w-3 h-3" />
                                {partner.category}
                              </div>

                              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                {partner.name}
                              </h3>

                              <p className="text-slate-400 text-xs leading-relaxed mb-3 flex-1 line-clamp-2">
                                {partner.description}
                              </p>

                              {/* Location */}
                              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
                                <MapPin className="w-3 h-3 text-primary" />
                                {partner.location}
                              </div>

                              {/* CTA */}
                              <div className="flex items-center gap-1.5 text-primary font-semibold text-xs opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <span>Ver más</span>
                                <ExternalLink className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── empty state ── */}
              {filtered.length === 0 && (
                <div className="text-center py-24">
                  <div className="w-24 h-24 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No se encontraron socios</h3>
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
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />
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
                        Únete a Nosotros
                      </span>
                    </div>

                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-6">
                      ¿Quieres ser nuestro socio?
                    </h3>

                    <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
                      Únete a nuestra red de aliados y contribuye al desarrollo del pickleball en
                      México. Juntos podemos hacer crecer este increíble deporte.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                      <a
                        href="/become-partner"
                        className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        <span className="relative z-10">Ser Socio</span>
                        <Handshake className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                      </a>

                      <a
                        href="/contact"
                        className="group inline-flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm text-white font-bold px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-2xl border-2 border-slate-700 hover:border-primary hover:bg-slate-800 transition-all duration-500"
                      >
                        <span>Contactar</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" />
                      </a>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 text-sm flex-wrap">
                      {['Múltiples Categorías', 'Beneficios Exclusivos', 'Red Nacional'].map(
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
          PARTNER DETAIL MODAL
      ═══════════════════════════════════════════ */}
      {selectedPartner &&
        (() => {
          const levelColor = getLevelColor(selectedPartner.level);
          const CategoryIcon = getCategoryIcon(selectedPartner.category);

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPartner(null)}
            >
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

              <div
                className="relative w-full max-w-lg sm:max-w-2xl lg:max-w-3xl rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto mx-4 sm:mx-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={`absolute -inset-2 bg-gradient-to-r ${levelColor.glow} rounded-3xl blur-xl opacity-30`}
                />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124,252,0,0.3) 1px, transparent 0)`,
                      backgroundSize: '32px 32px',
                    }}
                  />

                  <button
                    onClick={() => setSelectedPartner(null)}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="relative z-10">
                    {/* Logo header */}
                    <div className="relative h-40 sm:h-52 md:h-64 lg:h-72 bg-slate-800/50 flex items-center justify-center p-6 sm:p-8 md:p-12 border-b border-slate-700/50">
                      <img
                        src={selectedPartner.logo}
                        alt={selectedPartner.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div
                          className={`flex items-center gap-2 backdrop-blur-sm font-bold px-3 py-1.5 text-xs sm:text-sm rounded-lg border ${levelColor.bg} ${levelColor.border} ${levelColor.text}`}
                        >
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                          {selectedPartner.level}
                        </div>
                        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 text-slate-300 font-bold px-3 py-1.5 text-xs sm:text-sm rounded-lg">
                          <CategoryIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          {selectedPartner.category}
                        </div>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                        {selectedPartner.name}
                      </h2>
                      <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-4">
                        {selectedPartner.description}
                      </p>

                      {/* Stats grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {Object.entries(selectedPartner.stats).map(([key, value]) => (
                          <div
                            key={key}
                            className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 sm:p-5 text-center"
                          >
                            <div className="text-primary font-bold text-xl sm:text-2xl mb-1">
                              {value}
                            </div>
                            <div className="text-slate-500 text-xs sm:text-sm capitalize">
                              {key}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Contact info */}
                      <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-4 bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">Ubicación</div>
                            <div className="text-sm text-white font-medium">
                              {selectedPartner.location}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">Email</div>
                            <a
                              href={`mailto:${selectedPartner.email}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {selectedPartner.email}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">Teléfono</div>
                            <a
                              href={`tel:${selectedPartner.phone}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {selectedPartner.phone}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      <a
                        href={selectedPartner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
                      >
                        <span>Visitar Sitio Web</span>
                        <ExternalLink className="w-5 h-5" />
                      </a>
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

export default Partners;
