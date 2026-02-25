import {
  Info,
  Users,
  Trophy,
  Target,
  GraduationCap,
  Sparkles,
  Award,
  Zap,
  TrendingUp,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { nrtpCategories } from '@/data/mockData';

const Categories = () => {
  const groupedCategories = nrtpCategories.reduce(
    (acc, cat) => {
      if (!acc[cat.groupName]) {
        acc[cat.groupName] = [];
      }
      acc[cat.groupName].push(cat);
      return acc;
    },
    {} as Record<string, typeof nrtpCategories>,
  );

  const groupColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    Principiantes: {
      bg: 'from-green-500 to-emerald-600',
      text: 'text-green-500',
      border: 'border-green-500/30',
      glow: 'shadow-green-500/50',
    },
    Intermedio: {
      bg: 'from-blue-500 to-cyan-600',
      text: 'text-blue-500',
      border: 'border-blue-500/30',
      glow: 'shadow-blue-500/50',
    },
    Avanzado: {
      bg: 'from-purple-500 to-pink-600',
      text: 'text-purple-500',
      border: 'border-purple-500/30',
      glow: 'shadow-purple-500/50',
    },
    'Open / Elite': {
      bg: 'from-primary to-lime-500',
      text: 'text-primary',
      border: 'border-primary/30',
      glow: 'shadow-primary/50',
    },
  };

  const groupIcons: Record<string, React.ReactNode> = {
    Principiantes: <GraduationCap className="w-6 h-6" />,
    Intermedio: <Target className="w-6 h-6" />,
    Avanzado: <Trophy className="w-6 h-6" />,
    'Open / Elite': <Award className="w-6 h-6" />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <main className="flex-1">
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
                  <Sparkles className="w-4 h-4" />
                  <span>Sistema de Clasificación</span>
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
                  <span className="block bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                    Categorías NRTP
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                  Sistema de clasificación de jugadores por nivel de habilidad
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-1 bg-gradient-to-r from-transparent to-primary rounded-full" />
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <div className="w-12 h-1 bg-gradient-to-l from-transparent to-primary rounded-full" />
              </div>

              <div className="grid grid-cols-4 gap-6 pt-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2">2.5-3.5</div>
                  <div className="text-xs text-white/60">Principiantes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">4.0-4.5</div>
                  <div className="text-xs text-white/60">Intermedio</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-purple-500 mb-2">5.0</div>
                  <div className="text-xs text-white/60">Avanzado</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">5.5+</div>
                  <div className="text-xs text-white/60">Elite</div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </section>

        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-lime-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden p-10 md:p-12">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center text-primary">
                        <Info className="w-8 h-8" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">
                        ¿Qué es el sistema NRTP?
                      </h2>
                    </div>

                    <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
                      <p>
                        El{' '}
                        <strong className="text-primary">
                          NRTP (National Rating Tournament Program)
                        </strong>{' '}
                        es un sistema de clasificación de jugadores originalmente adoptado del tenis
                        y adaptado para pickleball con el fin de organizar a los jugadores por nivel
                        de habilidad. Este sistema permite un juego más justo, equilibrado y
                        competitivo al emparejar jugadores con habilidades similares.
                      </p>
                      <p>
                        En pickleball, el NRTP evalúa aspectos como control de pelota, consistencia,
                        estrategia, movilidad y experiencia de juego, asignando a cada jugador una
                        categoría numérica que representa su nivel.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-10">
                      {[
                        {
                          icon: Users,
                          title: 'Clasificar jugadores',
                          desc: 'Por nivel de habilidad',
                        },
                        {
                          icon: Trophy,
                          title: 'Facilitar torneos',
                          desc: 'Organización más eficiente',
                        },
                        {
                          icon: Target,
                          title: 'Competencia justa',
                          desc: 'Partidos equilibrados y seguros',
                        },
                        {
                          icon: GraduationCap,
                          title: 'Desarrollo progresivo',
                          desc: 'Crecimiento estructurado del jugador',
                        },
                      ].map((benefit, idx) => (
                        <div
                          key={idx}
                          className="group/item flex items-start gap-4 p-5 bg-slate-950/30 rounded-2xl border border-slate-700/30 hover:border-primary/30 transition-all duration-500"
                        >
                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 group-hover/item:scale-110 group-hover/item:bg-primary group-hover/item:text-slate-900 transition-all duration-500">
                            <benefit.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white mb-1">{benefit.title}</h4>
                            <p className="text-sm text-slate-400">{benefit.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-block mb-4">
                <span className="text-primary text-sm font-bold uppercase tracking-wider bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                  Grupos de Torneos
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
                Categorías Principales
              </h2>
              <p className="text-slate-400 text-lg">
                Para torneos, los niveles NRTP se agrupan en cuatro categorías principales
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {Object.entries(groupedCategories).map(([groupName, categories]) => (
                <div key={groupName} className="group relative">
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${groupColors[groupName].bg} rounded-3xl opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-700`}
                  />

                  <div className="relative bg-slate-900/40 backdrop-blur-sm rounded-3xl border border-slate-800/50 group-hover:border-slate-700/50 transition-all duration-700 p-8 h-full text-center">
                    <div className="relative z-10">
                      <div className="relative w-40 h-40 mx-auto mb-8">
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${groupColors[groupName].bg} rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-all duration-700 scale-110`}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-2 bg-black/20 blur-xl rounded-full scale-75 group-hover:scale-90 opacity-40 group-hover:opacity-60 transition-all duration-500" />
                        <div
                          className={`absolute inset-8 rounded-full bg-gradient-to-br ${groupColors[groupName].bg} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:-translate-y-6 transition-all duration-500 transform-gpu`}
                          style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
                        >
                          <div
                            className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-full"
                            style={{ clipPath: 'ellipse(60% 40% at 50% 20%)' }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-full" />
                          <div className="absolute top-6 left-6 w-6 h-6 bg-white/40 rounded-full blur-md" />
                          <div className="relative z-10 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                            {(() => {
                              const Icon =
                                groupName === 'Principiantes'
                                  ? GraduationCap
                                  : groupName === 'Intermedio'
                                    ? Target
                                    : groupName === 'Avanzado'
                                      ? Trophy
                                      : Award;
                              return <Icon className="w-14 h-14" strokeWidth={2.5} />;
                            })()}
                          </div>
                        </div>

                        <div
                          className={`absolute top-8 right-4 w-3 h-3 rounded-full bg-gradient-to-br ${groupColors[groupName].bg} opacity-70 animate-pulse blur-[2px]`}
                          style={{ animation: 'pulse 2s ease-in-out infinite' }}
                        />
                        <div
                          className={`absolute bottom-12 left-6 w-2 h-2 rounded-full bg-gradient-to-br ${groupColors[groupName].bg} opacity-50 animate-pulse blur-[2px]`}
                          style={{ animation: 'pulse 2.5s ease-in-out infinite' }}
                        />
                        <div
                          className={`absolute top-1/2 right-2 w-2 h-2 rounded-full bg-gradient-to-br ${groupColors[groupName].bg} opacity-60 animate-pulse blur-[2px]`}
                          style={{ animation: 'pulse 3s ease-in-out infinite' }}
                        />
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-500">
                        {groupName}
                      </h3>

                      <div
                        className={`text-sm font-medium ${groupColors[groupName].text} mb-6 opacity-70`}
                      >
                        {categories.length} {categories.length === 1 ? 'Nivel' : 'Niveles'}
                      </div>

                      <div className="flex flex-wrap justify-center gap-2">
                        {categories.map((cat) => (
                          <div key={cat.level} className="group/badge relative">
                            <div
                              className={`absolute inset-0 bg-gradient-to-r ${groupColors[groupName].bg} rounded-lg opacity-0 group-hover/badge:opacity-20 blur transition-opacity duration-300`}
                            />
                            <div className="relative px-3 py-1.5 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-all duration-300">
                              {cat.level}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-block mb-4">
                  <span className="text-primary text-sm font-bold uppercase tracking-wider bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                    Niveles Detallados
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
                  Descripción de Cada Nivel
                </h2>
              </div>

              <div className="space-y-6">
                {nrtpCategories.map((category, index) => (
                  <div key={category.level} className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-lime-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

                    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      <div className="relative z-10 flex flex-col md:flex-row">
                        <div
                          className={`bg-gradient-to-br ${groupColors[category.groupName].bg} p-8 md:w-64 flex flex-col justify-center items-center text-white relative overflow-hidden`}
                        >
                          <div className="absolute inset-0 opacity-10">
                            <div
                              className={`absolute inset-0 bg-gradient-to-br from-white to-transparent`}
                            />
                          </div>

                          <div className="relative z-10 text-center">
                            <div className="text-6xl font-bold mb-2">{category.level}</div>
                            <div className="text-lg font-semibold opacity-90">{category.name}</div>
                            <div className="mt-4 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                              {category.groupName}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 p-8">
                          <p className="text-slate-300 text-lg leading-relaxed mb-6">
                            {category.description}
                          </p>

                          <div className="space-y-4">
                            <h4 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Características Principales
                            </h4>
                            <div className="grid md:grid-cols-2 gap-3">
                              {category.characteristics.map((char, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-3 p-3 bg-slate-950/30 rounded-xl border border-slate-700/30 hover:border-primary/30 transition-colors duration-300"
                                >
                                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  <span className="text-sm text-slate-400">{char}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-lime-500 rounded-2xl opacity-20 blur-xl" />

                <div className="relative bg-gradient-to-br from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-8 text-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-lime-500/5 rounded-2xl opacity-50" />

                  <div className="relative z-10 flex items-center justify-center gap-4 flex-wrap">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <p className="text-slate-300 text-lg max-w-3xl">
                      Esta agrupación permite que cada jugador compita en un ambiente adecuado a su
                      nivel, fomentando una mejor experiencia deportiva y un crecimiento más
                      estructurado en pickleball.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                    <Trophy className="w-8 h-8" />
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    ¿Listo para Competir?
                  </h3>
                  <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Descubre tu nivel NRTP y únete a torneos oficiales en toda México
                  </p>
                  <a
                    href="/tournaments"
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-10 py-5 rounded-2xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 overflow-hidden relative"
                  >
                    <span className="relative z-10">Ver Torneos</span>
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
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Categories;
