import { Link } from 'react-router-dom';
import {
  Calendar,
  ArrowRight,
  Trophy,
  Award,
  Medal,
  Star,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
  Menu,
  X,
  Filter,
} from 'lucide-react';
import { playerShowcases } from '@/data/mockData';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const Showcase = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5 overflow-x-hidden">
      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 py-16 sm:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-60 h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-72 h-72 sm:w-84 sm:h-84 lg:w-96 lg:h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
              <div className="order-2 lg:order-1 space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="inline-block animate-fade-in">
                  <span className="inline-flex items-center gap-2 text-primary text-xs sm:text-sm font-bold tracking-widest uppercase bg-primary/10 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full border border-primary/20 backdrop-blur-sm">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Jugadores Destacados</span>
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  Campeones
                  <span className="block text-primary mt-1 sm:mt-2">Nacionales</span>
                </h1>

                <p className="text-white/80 text-base sm:text-lg lg:text-xl max-w-xl leading-relaxed">
                  Conoce las historias inspiradoras de los mejores jugadores de pickleball en
                  México. Campeones que elevan el nivel del deporte nacional.
                </p>

                <div className="flex flex-wrap gap-4 sm:gap-6 pt-4">
                  {[
                    { value: playerShowcases.length, label: 'Campeones' },
                    { value: '50+', label: 'Medallas' },
                    { value: '15+', label: 'Torneos' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</div>
                      <div className="text-xs sm:text-sm text-white/60 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 sm:gap-4 pt-4">
                  <a
                    href="#showcase"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-lime-dark hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/25 text-sm sm:text-base"
                  >
                    Ver Campeones
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                  <a
                    href="/rankings"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-white/90 hover:text-slate-900 transition-all duration-300 border border-white/20 text-sm sm:text-base"
                  >
                    Ver Rankings
                  </a>
                </div>
              </div>

              <div className="order-1 lg:order-2 relative">
                <div className="relative group">
                  <div className="absolute -inset-2 sm:-inset-3 lg:-inset-4 bg-gradient-to-r from-primary to-lime-500 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                    <div className="p-8 sm:p-12 lg:p-16 flex flex-col items-center justify-center gap-4 sm:gap-6">
                      <div className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-2xl sm:rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Trophy className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-primary" />
                      </div>
                      <p className="text-slate-400 text-center font-semibold text-base sm:text-lg">
                        Jugadores Elite
                      </p>
                      <p className="text-slate-600 text-xs sm:text-sm text-center max-w-xs leading-relaxed">
                        Historias de los mejores competidores del pickleball mexicano
                      </p>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-primary text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 lg:py-4 rounded-xl sm:rounded-2xl shadow-xl">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      {playerShowcases.length}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90">Perfiles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="showcase"
          className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 bg-lime-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(124,252,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,252,0,0.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
                <div className="inline-block mb-4">
                  <span className="text-primary text-xs sm:text-sm font-bold uppercase tracking-wider bg-primary/10 px-4 sm:px-5 lg:px-6 py-1.5 sm:py-2 rounded-full border border-primary/20">
                    Hall of Fame
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6">
                  Nuestros Campeones
                </h2>
                <p className="text-slate-400 text-base sm:text-lg lg:text-xl leading-relaxed px-4">
                  Historias de excelencia, dedicación y pasión por el pickleball
                </p>
                <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
                  <div className="w-8 sm:w-12 h-1 bg-gradient-to-r from-transparent to-primary rounded-full" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse" />
                  <div className="w-8 sm:w-12 h-1 bg-gradient-to-l from-transparent to-primary rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:gap-12">
                {playerShowcases.map((player, index) => (
                  <Link
                    key={player.id}
                    to={`/players/showcase/${player.slug}`}
                    className="block group"
                  >
                    <div className="relative">
                      <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-25 blur-xl sm:blur-2xl transition-opacity duration-700" />

                      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden lg:h-[500px]">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        </div>

                        <div
                          className={`flex flex-col lg:flex-row ${
                            index % 2 === 0 ? '' : 'lg:flex-row-reverse'
                          } h-full`}
                        >
                          <div className="w-full lg:w-2/5 relative overflow-hidden flex-shrink-0">
                            <div className="relative w-full h-64 sm:h-80 lg:h-full overflow-hidden bg-slate-900">
                              <img
                                src={player.featuredImage}
                                alt={player.playerName}
                                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                              />

                              <div
                                className={`absolute inset-0 ${
                                  index % 2 === 0
                                    ? 'bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent'
                                    : 'bg-gradient-to-l from-slate-900 via-slate-900/60 to-transparent'
                                }`}
                              />

                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent lg:bg-none" />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                              <div className="flex items-center justify-start gap-2 sm:gap-3 flex-wrap">
                                <div className="group/badge relative flex-shrink-0">
                                  <div className="absolute -inset-0.5 sm:-inset-1 bg-amber-400 rounded-lg sm:rounded-xl blur opacity-60 group-hover/badge:opacity-100 transition-opacity duration-300" />
                                  <div className="relative bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-900 font-bold px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-xl flex items-center gap-1 sm:gap-2 transform group-hover/badge:scale-110 transition-transform duration-300 whitespace-nowrap text-xs sm:text-sm">
                                    <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>{player.stats.gold} Oro</span>
                                  </div>
                                </div>

                                <div className="group/badge relative flex-shrink-0">
                                  <div className="absolute -inset-0.5 sm:-inset-1 bg-slate-400 rounded-lg sm:rounded-xl blur opacity-60 group-hover/badge:opacity-100 transition-opacity duration-300" />
                                  <div className="relative bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 font-bold px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-xl flex items-center gap-1 sm:gap-2 transform group-hover/badge:scale-110 transition-transform duration-300 whitespace-nowrap text-xs sm:text-sm">
                                    <Medal className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>{player.stats.silver} Plata</span>
                                  </div>
                                </div>

                                <div className="group/badge relative flex-shrink-0">
                                  <div className="absolute -inset-0.5 sm:-inset-1 bg-amber-700 rounded-lg sm:rounded-xl blur opacity-60 group-hover/badge:opacity-100 transition-opacity duration-300" />
                                  <div className="relative bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-xl flex items-center gap-1 sm:gap-2 transform group-hover/badge:scale-110 transition-transform duration-300 whitespace-nowrap text-xs sm:text-sm">
                                    <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>{player.stats.bronze} Bronce</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          </div>

                          <div className="w-full lg:w-3/5 p-4 sm:p-6 lg:p-8 xl:p-12 flex flex-col justify-center flex-1">
                            <div
                              className="absolute inset-0 opacity-5"
                              style={{
                                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124,252,0,0.3) 1px, transparent 0)`,
                                backgroundSize: '24px 24px',
                              }}
                            />

                            <div className="relative z-10 space-y-4 sm:space-y-6 h-full min-h-0 flex flex-col justify-center">
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
                                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                </div>
                                <span className="font-medium">
                                  {formatDate(player.publishedAt)}
                                </span>
                              </div>

                              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white group-hover:text-primary transition-colors duration-500 leading-tight line-clamp-1">
                                {player.title}
                              </h2>

                              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-primary/20 border border-primary/30 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl backdrop-blur-sm group-hover:bg-primary/30 transition-colors duration-300 min-w-0">
                                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                  <span className="text-sm sm:text-base font-bold text-white truncate">
                                    {player.playerName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/60 border border-slate-700/50 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl backdrop-blur-sm group-hover:border-primary/50 transition-colors duration-300 min-w-0">
                                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                  <span className="text-xs sm:text-sm font-bold text-primary truncate">
                                    NRTP {player.stats.duprRating}+
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-400/20 border border-amber-400/30 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl backdrop-blur-sm min-w-0">
                                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                                  <span className="text-xs sm:text-sm font-bold text-amber-400 truncate">
                                    {player.stats.gold + player.stats.silver + player.stats.bronze}{' '}
                                    Medallas
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-primary via-lime-400 to-transparent group-hover:w-20 sm:group-hover:w-32 transition-all duration-500 rounded-full" />
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                              </div>

                              <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed line-clamp-2 overflow-hidden whitespace-normal">
                                {player.excerpt}
                              </p>

                              <div className="pt-2">
                                <div className="inline-flex items-center gap-2 sm:gap-3 text-primary font-bold text-base sm:text-lg group-hover:gap-3 sm:group-hover:gap-5 transition-all duration-300">
                                  <span className="group-hover:text-lime-400 transition-colors duration-300">
                                    Leer Historia Completa
                                  </span>
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:text-slate-900 transition-colors duration-300" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-lime-500/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-16 lg:mt-24 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-lime-500/20 to-primary/20 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl opacity-30" />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-700/50 overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124,252,0,0.3) 1px, transparent 0)`,
                      backgroundSize: '24px 24px',
                    }}
                  />

                  <div className="relative z-10 p-6 sm:p-8 lg:p-12 xl:p-16 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-primary/20 border border-primary/30 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 group hover:scale-110 transition-transform duration-500">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary animate-pulse" />
                    </div>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-3 sm:mb-4">
                      Más Campeones Próximamente
                    </h3>

                    <p className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
                      Estamos trabajando en perfiles adicionales de jugadores destacados. ¡Mantente
                      atento para conocer más campeones que están haciendo historia en el pickleball
                      mexicano!
                    </p>

                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <div
                        className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 lg:mt-24 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-lime-500/20 to-primary/20 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl opacity-30" />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl border border-slate-700/50 overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-primary/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-lime-500/10 rounded-full blur-3xl" />
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124,252,0,0.3) 1px, transparent 0)`,
                      backgroundSize: '24px 24px',
                    }}
                  />

                  <div className="relative z-10 p-6 sm:p-8 lg:p-12 xl:p-16 text-center">
                    <div className="inline-block mb-4 sm:mb-6">
                      <span className="text-primary text-xs font-bold uppercase tracking-widest bg-primary/10 px-4 sm:px-5 lg:px-6 py-1.5 sm:py-2 rounded-full border border-primary/30">
                        Únete a la Elite
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-4 sm:mb-6">
                      ¿Listo para competir?
                    </h3>

                    <p className="text-slate-400 text-base sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-10 max-w-2xl mx-auto px-4">
                      Descubre torneos, mejora tu ranking y únete a la comunidad de jugadores de
                      pickleball más grande de México.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center">
                      <a
                        href="/tournaments"
                        className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 rounded-lg sm:rounded-xl lg:rounded-2xl hover:shadow-xl hover:shadow-primary/50 transition-all duration-500 overflow-hidden text-sm sm:text-base"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        <span className="relative z-10">Ver Torneos</span>
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                      </a>

                      <a
                        href="/rankings"
                        className="group inline-flex items-center justify-center gap-2 sm:gap-3 bg-slate-800/50 backdrop-blur-sm text-white font-bold px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6 rounded-lg sm:rounded-xl lg:rounded-2xl border-2 border-slate-700 hover:border-primary hover:bg-slate-800 transition-all duration-500 text-sm sm:text-base"
                      >
                        <span>Ver Rankings</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-500" />
                      </a>
                    </div>

                    <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 lg:gap-8 text-slate-500 text-xs sm:text-sm flex-wrap">
                      {['Torneos Oficiales', 'Rankings DUPR', 'Comunidad Nacional'].map(
                        (label, i) => (
                          <div key={label} className="flex items-center gap-1.5 sm:gap-2">
                            <div
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse"
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
    </div>
  );
};

export default Showcase;
