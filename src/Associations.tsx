import { MapPin, ExternalLink, Building2, Sparkles, Search, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { stateAssociations } from '@/data/mockData';

const Associations = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssociations = stateAssociations.filter(
    (association) =>
      association.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      association.state.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeAssociations = stateAssociations.filter((a) => a.hasProfile).length;
  const totalStates = 32;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(124, 252, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 252, 0, 0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              <div className="inline-block animate-fade-in">
                <span className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-widest uppercase bg-primary/10 px-6 py-3 rounded-full border border-primary/20 backdrop-blur-sm">
                  <Building2 className="w-4 h-4" />
                  <span>Red Nacional</span>
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
                  <span className="block bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                    Asociaciones Estatales
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                  Red de asociaciones afiliadas a la Federación Mexicana de Pickleball en todo el
                  país
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-1 bg-gradient-to-r from-transparent to-primary rounded-full" />
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <div className="w-12 h-1 bg-gradient-to-l from-transparent to-primary rounded-full" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 pt-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {totalStates}
                  </div>
                  <div className="text-sm text-white/60">Estados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {activeAssociations}
                  </div>
                  <div className="text-sm text-white/60">Activas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-white/60">Cobertura</div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </section>

        {/* Search and Filter Section */}
        <section className="py-12 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-lime-500 rounded-2xl opacity-20 blur-xl" />
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar por estado o nombre de asociación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
                      <span>{filteredAssociations.length}</span>
                      <span>resultados</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Associations Grid with Images */}
        <section className="py-12 pb-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Grid Layout - 3 columns for better image display */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssociations.map((association, index) => (
                  <div key={association.state} className="group relative">
                    <div
                      className={`absolute -inset-0.5 bg-gradient-to-r ${
                        association.hasProfile
                          ? 'from-primary to-lime-500 opacity-0 group-hover:opacity-40'
                          : 'from-slate-600 to-slate-700 opacity-10'
                      } rounded-2xl blur transition-opacity duration-500`}
                    />

                    <div
                      className={`relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border ${
                        association.hasProfile
                          ? 'border-slate-700/50 group-hover:border-primary/50'
                          : 'border-slate-700/30'
                      } transition-all duration-500 overflow-hidden h-full flex flex-col`}
                    >
                      {/* Image Container */}
                      <div className="relative h-48 overflow-hidden bg-slate-800/50">
                        {association.hasProfile && association.image ? (
                          <>
                            <img
                              src={association.image}
                              alt={`${association.name} - ${association.state}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-60" />

                            {/* Active Badge on Image */}
                            <div className="absolute top-3 right-3">
                              <div className="flex items-center gap-2 bg-primary/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full border border-primary">
                                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-pulse" />
                                <span>Activa</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Placeholder for states without images */}
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                              <Building2 className="w-20 h-20 text-slate-700" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-60" />

                            {/* Coming Soon Badge */}
                            <div className="absolute top-3 right-3">
                              <div className="flex items-center gap-2 bg-slate-700/90 backdrop-blur-sm text-slate-400 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-600">
                                <span>Próximamente</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3
                            className={`font-bold text-xl mb-3 ${
                              association.hasProfile
                                ? 'text-white group-hover:text-primary'
                                : 'text-slate-400'
                            } transition-colors duration-500 line-clamp-2`}
                          >
                            {association.name}
                          </h3>

                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="truncate">{association.state}</span>
                          </div>
                        </div>

                        {/* Action */}
                        {association.hasProfile && association.href ? (
                          <Link
                            to={association.href}
                            className="group/link relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-semibold px-5 py-3 rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 overflow-hidden text-sm w-full"
                          >
                            <span className="relative z-10">Ver Micrositio</span>
                            <ExternalLink className="w-4 h-4 relative z-10 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover/link:translate-x-[200%] transition-transform duration-1000" />
                          </Link>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-2 text-sm text-slate-600 italic bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-700/30 w-full">
                            <span>Micrositio en desarrollo</span>
                          </div>
                        )}

                        {/* Hover Glow Effect */}
                        {association.hasProfile && (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredAssociations.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-slate-400">Intenta con otro término de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-lime-500/20 to-primary/20 rounded-3xl blur-3xl opacity-30" />

              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden p-12 md:p-16 text-center">
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124, 252, 0, 0.3) 1px, transparent 0)`,
                    backgroundSize: '32px 32px',
                  }}
                />

                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center text-primary mx-auto">
                    <Users className="w-8 h-8" />
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    ¿Tu Estado No Aparece?
                  </h3>
                  <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Contáctanos para más información sobre cómo afiliarte a la Federación Mexicana
                    de Pickleball
                  </p>
                  <Link
                    to="/contact"
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-10 py-5 rounded-2xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 overflow-hidden relative"
                  >
                    <span className="relative z-10">Contáctanos</span>
                    <svg
                      className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Associations;
