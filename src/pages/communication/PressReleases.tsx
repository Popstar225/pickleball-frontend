import { useState } from 'react';
import {
  ChevronRight,
  Calendar,
  Clock,
  Share2,
  FileText,
  Newspaper,
  ArrowLeft,
  X,
  Award,
  TrendingUp,
  Globe,
  Users,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

import Image5 from '../../assets/images/find-players.jpg';
import Image6 from '../../assets/images/courts.jpg';

const pressReleases = [
  {
    id: 1,
    title:
      'Pickleball Santa Fe: un triunfo para el deporte y el crecimiento de la participación femenina',
    subtitle: 'Comunidad reconocida por promover espacios y torneos inclusivos y competitivos',
    excerpt:
      'Pickleball Santa Fe organizó torneos destacados por la fuerte participación femenina, marcando un momento importante para el pickleball nacional y demostrando el crecimiento constante del nivel competitivo de las mujeres.',
    date: '2026-02-01',
    readTime: '4 min',
    category: 'Comunidad',
    image: Image5,
    featured: true,
    content: `Pickleball Santa Fe es una comunidad activa comprometida con el desarrollo del pickleball, reconocida por promover espacios de juego inclusivos, competitivos y bien organizados. A través de entrenamientos, eventos y torneos, se ha convertido en un referente para el crecimiento del deporte en la Ciudad de México.

En los últimos años, Pickleball Santa Fe ha organizado una serie de torneos destacados por la fuerte participación femenina, marcando un momento importante para el pickleball nacional. Más allá de los resultados en la cancha, estos eventos representan un triunfo para el deporte al demostrar claramente el crecimiento constante del nivel competitivo de las mujeres.

Las jugadoras han demostrado técnica, estrategia, intensidad y un gran compromiso competitivo, reflejando un trabajo de base fundamental: más mujeres entrenando, compitiendo y elevando el estándar del juego. Estos torneos no solo resaltan el talento femenino, sino que también inspiran a nuevas jugadoras a incorporarse al deporte con la confianza de que existen espacios competitivos reales.

Eventos como estos confirman que el pickleball en México avanza en la dirección correcta: mayor inclusión, más competencia y una comunidad más sólida. La participación femenina ya no es una excepción, sino un pilar fundamental para el crecimiento del deporte, y torneos como los organizados por Pickleball Santa Fe demuestran claramente ese progreso.

Desde la Federación, celebramos iniciativas que fortalecen el pickleball, promueven la equidad competitiva y consolidan un futuro prometedor para todos los jugadores.`,
  },
  {
    id: 2,
    title: 'Electric Pickle: una puerta internacional para el crecimiento del pickleball mexicano',
    subtitle:
      'Sede innovadora en Estados Unidos que se convierte en referencia para el desarrollo de jugadores mexicanos',
    excerpt:
      'Electric Pickle representa un camino natural hacia la proyección internacional, a medida que más jugadores mexicanos participan en entrenamientos y torneos de alto nivel, regresando con mayor experiencia y ritmo competitivo.',
    date: '2026-01-28',
    readTime: '5 min',
    category: 'Internacional',
    image: Image6,
    featured: false,
    content: `Electric Pickle es una de las sedes de pickleball más innovadoras y reconocidas en Estados Unidos. Concebido como un espacio de alto nivel, Electric Pickle combina competencia, comunidad y entretenimiento, convirtiéndose en un punto de referencia para jugadores que buscan entornos altamente competitivos y profesionales.

La existencia de espacios como Electric Pickle es especialmente relevante para el desarrollo del pickleball mexicano, ya que representa un camino natural hacia la proyección internacional. Cada vez más jugadores mexicanos viajan a Estados Unidos para participar en entrenamientos, torneos y dinámicas competitivas en lugares donde el nivel de juego es más alto y las exigencias son constantes.

Este intercambio tiene un impacto directo y positivo en México: los jugadores que compiten en entornos como Electric Pickle regresan con mayor experiencia, ritmo competitivo y comprensión del juego internacional, elevando el estándar nacional. El aprendizaje se refleja no solo en los resultados, sino también en la forma en que los jugadores entrenan, compiten y organizan eventos.

Además, la presencia de jugadores mexicanos en estos espacios posiciona a México en el mapa internacional del pickleball, fortalece las conexiones con la comunidad global y abre oportunidades para futuras colaboraciones, competencias binacionales y desarrollo de talento.

Desde la Federación, reconocemos el valor de lugares como Electric Pickle, ya que su existencia contribuye indirectamente al crecimiento del pickleball en México, aumenta la competitividad internacional y refuerza la idea de que el desarrollo del deporte no tiene fronteras, sino comunidades conectadas por una misma pasión.`,
  },
];

const PressReleases = () => {
  const [selectedArticle, setSelectedArticle] = useState<(typeof pressReleases)[0] | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Comunidad':
        return Users;
      case 'Internacional':
        return Globe;
      case 'Torneo':
        return Award;
      default:
        return Newspaper;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Comunidad':
        return {
          bg: 'bg-primary/20',
          border: 'border-primary/30',
          text: 'text-primary',
        };
      case 'Internacional':
        return {
          bg: 'bg-blue-400/20',
          border: 'border-blue-400/30',
          text: 'text-blue-400',
        };
      case 'Torneo':
        return {
          bg: 'bg-amber-400/20',
          border: 'border-amber-400/30',
          text: 'text-amber-400',
        };
      default:
        return {
          bg: 'bg-slate-400/20',
          border: 'border-slate-400/30',
          text: 'text-slate-400',
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5">
      <main className="flex-1">
        {/* ═══════════════════════════════════════════
            HERO SECTION
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
                    <Newspaper className="w-4 h-4" />
                    Comunicación Oficial
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  Sala de
                  <span className="block text-primary mt-2">Prensa</span>
                </h1>

                <p className="text-white/80 text-base sm:text-lg max-w-xl leading-relaxed">
                  Mantente informado con las últimas noticias, comunicados y acontecimientos del
                  mundo del pickleball en México.
                </p>

                {/* quick stats row */}
                <div className="flex flex-wrap gap-4 sm:gap-6 pt-4">
                  {[
                    { value: pressReleases.length, label: 'Comunicados' },
                    { value: '2', label: 'Este Mes' },
                    { value: '12', label: 'Este Año' },
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
                    href="#press-releases"
                    className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-lime-dark hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/25"
                  >
                    Ver Comunicados
                    <ChevronRight className="w-5 h-5" />
                  </a>
                  <a
                    href="/subscribe"
                    className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-white/10 backdrop-blur text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-white/90 hover:text-slate-900 transition-all duration-300 border border-white/20"
                  >
                    Suscribirse
                  </a>
                </div>
              </div>

              {/* ── Right: icon card ── */}
              <div className="order-1 lg:order-2 relative">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary to-lime-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                    <div className="p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center gap-6">
                      {/* big newspaper icon */}
                      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Newspaper className="w-20 h-20 sm:w-24 sm:h-24 text-primary" />
                      </div>
                      <p className="text-slate-400 text-center font-semibold text-lg">
                        Noticias Oficiales
                      </p>
                      <p className="text-slate-600 text-sm text-center max-w-xs leading-relaxed">
                        Comunicados y actualizaciones de la Federación Mexicana de Pickleball
                      </p>
                    </div>
                  </div>

                  {/* floating badge */}
                  <div className="hidden sm:flex absolute -bottom-6 -right-6 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-xl">
                    <div className="text-3xl font-bold">{pressReleases.length}</div>
                    <div className="text-sm opacity-90">Publicaciones</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PRESS RELEASES SECTION
        ═══════════════════════════════════════════ */}
        <section
          id="press-releases"
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
                    Últimas Noticias
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent mb-6">
                  Comunicados de Prensa
                </h2>
                <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                  Mantente al día con las últimas novedades y acontecimientos oficiales
                </p>
                <div className="flex items-center justify-center gap-3 mt-8">
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent to-primary rounded-full" />
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <div className="w-12 h-1 bg-gradient-to-l from-transparent to-primary rounded-full" />
                </div>
              </div>

              {/* ═══ FEATURED ARTICLE ═══ */}
              {pressReleases.find((pr) => pr.featured) &&
                (() => {
                  const featured = pressReleases.find((pr) => pr.featured)!;
                  const categoryColor = getCategoryColor(featured.category);
                  const CategoryIcon = getCategoryIcon(featured.category);

                  return (
                    <div
                      className="group relative overflow-hidden rounded-3xl transition-all duration-700 hover:-translate-y-3 cursor-pointer"
                      onClick={() => setSelectedArticle(featured)}
                    >
                      {/* outer glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-3xl opacity-30 blur-xl" />

                      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-primary/40 overflow-hidden">
                        {/* Featured ribbon */}
                        <div className="absolute top-6 -right-12 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold text-xs px-16 py-1.5 rotate-45 z-10 shadow-lg">
                          DESTACADO
                        </div>

                        <div className="relative grid grid-cols-1 lg:grid-cols-5">
                          {/* Image */}
                          <div className="lg:col-span-2 relative h-44 sm:h-56 lg:h-auto overflow-hidden">
                            <img
                              src={featured.image}
                              alt={featured.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                            {/* Category badge */}
                            <div className="absolute bottom-6 left-6">
                              <div
                                className={`flex items-center gap-2 backdrop-blur-sm font-bold px-4 py-2 rounded-xl border ${categoryColor.bg} ${categoryColor.border} ${categoryColor.text}`}
                              >
                                <CategoryIcon className="w-4 h-4" />
                                {featured.category}
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-4 mb-5 text-sm text-slate-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                {formatDate(featured.date)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                {featured.readTime} lectura
                              </div>
                            </div>

                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 group-hover:text-primary transition-colors leading-tight">
                              {featured.title}
                            </h2>

                            <p className="text-slate-400 text-base sm:text-lg mb-6 leading-relaxed">
                              {featured.excerpt}
                            </p>

                            {/* CTA */}
                            <div className="flex items-center gap-3 text-primary font-semibold">
                              <span>Leer comunicado completo</span>
                              <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* ═══ REGULAR ARTICLES GRID ═══ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {pressReleases
                  .filter((pr) => !pr.featured)
                  .map((article, index) => {
                    const categoryColor = getCategoryColor(article.category);
                    const CategoryIcon = getCategoryIcon(article.category);

                    return (
                      <div
                        key={article.id}
                        className="group relative overflow-hidden rounded-3xl transition-all duration-700 hover:-translate-y-3 cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => setSelectedArticle(article)}
                      >
                        {/* outer glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

                        <div className="relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden flex flex-col">
                          {/* hover fill */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                          {/* shimmer sweep */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                          </div>

                          {/* Image */}
                          <div className="relative h-40 sm:h-56 overflow-hidden">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                            {/* Category badge */}
                            <div className="absolute top-4 left-4">
                              <div
                                className={`flex items-center gap-2 backdrop-blur-sm font-bold px-3 py-1.5 rounded-lg border text-xs ${categoryColor.bg} ${categoryColor.border} ${categoryColor.text}`}
                              >
                                <CategoryIcon className="w-3.5 h-3.5" />
                                {article.category}
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="relative p-4 sm:p-6 flex-1 flex flex-col">
                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                {formatDate(article.date)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                {article.readTime}
                              </div>
                            </div>

                            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                              {article.title}
                            </h3>

                            <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                              {article.excerpt}
                            </p>

                            {/* CTA */}
                            <div className="flex items-center gap-2 text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-500">
                              <span>Leer más</span>
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
                    );
                  })}
              </div>

              {/* ═══ CTA BANNER ═══ */}
              <div className="mt-16 sm:mt-20 relative">
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
                        Mantente Informado
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-6">
                      Suscríbete a Nuestro Boletín
                    </h3>

                    <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
                      Recibe las últimas noticias, comunicados y actualizaciones directamente en tu
                      correo electrónico. Mantente al tanto de todo lo que sucede en el mundo del
                      pickleball mexicano.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto mb-8">
                      <input
                        type="email"
                        placeholder="Tu correo electrónico"
                        className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      <button className="group relative inline-flex items-center gap-3 justify-center w-full sm:w-auto bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-6 py-3 sm:px-6 sm:py-3 rounded-xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        <span className="relative z-10">Suscribirse</span>
                        <Sparkles className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-8 text-slate-500 text-sm flex-wrap">
                      {['Noticias Semanales', 'Comunicados Oficiales', 'Eventos Especiales'].map(
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
          FULL ARTICLE VIEW MODAL
      ═══════════════════════════════════════════ */}
      {selectedArticle &&
        (() => {
          const categoryColor = getCategoryColor(selectedArticle.category);
          const CategoryIcon = getCategoryIcon(selectedArticle.category);

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedArticle(null)}
            >
              {/* backdrop */}
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" />

              {/* panel */}
              <div
                className="relative w-full max-w-lg sm:max-w-4xl rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
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
                    onClick={() => setSelectedArticle(null)}
                    className="absolute top-4 right-4 z-[9999] w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="relative z-10">
                    {/* Hero Image */}
                    <div className="relative h-40 sm:h-64 lg:h-96 overflow-hidden">
                      <img
                        src={selectedArticle.image}
                        alt={selectedArticle.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                      {/* Category badge */}
                      <div className="absolute bottom-6 left-6">
                        <div
                          className={`flex items-center gap-2 backdrop-blur-sm font-bold px-5 py-2.5 rounded-xl border ${categoryColor.bg} ${categoryColor.border} ${categoryColor.text}`}
                        >
                          <CategoryIcon className="w-5 h-5" />
                          {selectedArticle.category}
                        </div>
                      </div>
                    </div>

                    {/* Article Content */}
                    <div className="p-4 sm:p-6 lg:p-12">
                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {formatDate(selectedArticle.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          {selectedArticle.readTime} lectura
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          Comunicado Oficial
                        </div>
                      </div>

                      {/* Title */}
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                        {selectedArticle.title}
                      </h1>

                      {/* Subtitle */}
                      {selectedArticle.subtitle && (
                        <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed font-medium">
                          {selectedArticle.subtitle}
                        </p>
                      )}

                      {/* Divider */}
                      <div className="flex items-center gap-4 mb-10">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-700 to-transparent" />
                      </div>

                      {/* Article body */}
                      <div className="prose prose-invert prose-lg max-w-none">
                        {selectedArticle.content.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="text-slate-300 leading-relaxed mb-6">
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {/* Share section */}
                      <div className="mt-12 pt-8 border-t border-slate-700/50">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                          <div className="text-slate-400 text-sm">
                            ¿Te gustó este comunicado? Compártelo con tu comunidad
                          </div>
                          <div className="flex gap-3">
                            <button className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:border-primary/50 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button className="flex items-center gap-2 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all">
                              <ExternalLink className="w-4 h-4" />
                              Compartir
                            </button>
                          </div>
                        </div>
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

export default PressReleases;
