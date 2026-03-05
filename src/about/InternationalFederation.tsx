import Header from '@/components/Header';
import Footer from '@/components/Footer';
import unifiedPickleballLogo from '@/assets/images/international-federation.png';
import { Globe, CheckCircle, TrendingUp, Users, Sparkles, ArrowRight } from 'lucide-react';

const InternationalFederation = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 
          pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24 overflow-hidden"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute top-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 
              bg-primary/10 rounded-full blur-xl sm:blur-2xl md:blur-3xl animate-pulse"
            />
            <div
              className="absolute bottom-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 
              bg-lime-500/10 rounded-full blur-xl sm:blur-2xl md:blur-3xl animate-pulse delay-1000"
            />
            <div
              className="absolute inset-0 opacity-[0.02] sm:opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(124, 252, 0, 0.1) 1px, transparent 1px), 
                linear-gradient(90deg, rgba(124, 252, 0, 0.1) 1px, transparent 1px)`,
                backgroundSize: 'clamp(20px, 4vw, 50px) clamp(20px, 4vw, 50px)',
              }}
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-6 sm:space-y-8">
                {/* Badge */}
                <div className="inline-block animate-fade-in">
                  <span
                    className="inline-flex items-center gap-2 text-primary text-xs sm:text-sm font-bold 
                    tracking-wider uppercase bg-primary/10 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 
                    rounded-full border border-primary/20 backdrop-blur-sm"
                  >
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Afiliación Global</span>
                  </span>
                </div>

                {/* Title */}
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
                    <span
                      className="block bg-gradient-to-r from-white via-white to-slate-300 
                      bg-clip-text text-transparent leading-tight"
                    >
                      ¿Qué es la Federación Internacional de Pickleball?
                    </span>
                  </h1>
                </div>

                {/* Description */}
                <div
                  className="space-y-4 sm:space-y-6 text-white/80 text-sm sm:text-base md:text-lg 
                  leading-relaxed"
                >
                  <p
                    className="relative pl-4 sm:pl-5 md:pl-6 border-l-2 sm:border-l-3 md:border-l-4 
                    border-primary/50"
                  >
                    La Federación Internacional de Pickleball (IPF) es el organismo rector
                    internacional responsable de promover, desarrollar y regular el pickleball en
                    todo el mundo. Su misión es impulsar el crecimiento organizado del deporte,
                    establecer estándares internacionales y fomentar la colaboración entre
                    federaciones nacionales de diferentes países.
                  </p>
                  <p
                    className="relative pl-4 sm:pl-5 md:pl-6 border-l-2 sm:border-l-3 md:border-l-4 
                    border-lime-500/50"
                  >
                    Recientemente, la IPF se fusionó con la Federación Mundial de Pickleball (WPF),
                    dando lugar a una nueva etapa para el pickleball global bajo una estructura
                    unificada conocida como{' '}
                    <strong className="text-primary font-semibold">Unified Pickleball</strong>. Esta
                    unión fortalece el gobierno del deporte, consolida reglas y criterios comunes, y
                    permite una mejor organización de competiciones, programas de desarrollo y
                    representación internacional.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 pt-4 sm:pt-6 md:pt-8">
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
                      150+
                    </div>
                    <div className="text-xs sm:text-sm text-white/60">Países</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
                      500K+
                    </div>
                    <div className="text-xs sm:text-sm text-white/60">Miembros</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
                      1000+
                    </div>
                    <div className="text-xs sm:text-sm text-white/60">Eventos</div>
                  </div>
                </div>
              </div>

              {/* Right Logo */}
              <div className="relative flex items-center justify-center py-8 sm:py-10 md:py-12 lg:py-16">
                <div className="relative group w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto">
                  {/* Background Layers */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-primary/20 to-lime-500/20 
                    rounded-2xl sm:rounded-3xl transform translate-x-2 translate-y-2 
                    sm:translate-x-3 sm:translate-y-3 md:translate-x-4 md:translate-y-4 
                    group-hover:translate-x-3 group-hover:translate-y-3 
                    sm:group-hover:translate-x-4 sm:group-hover:translate-y-4 
                    md:group-hover:translate-x-6 md:group-hover:translate-y-6 
                    transition-transform duration-500"
                  />

                  <div
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 to-lime-500/10 
                    rounded-2xl sm:rounded-3xl transform translate-x-1 translate-y-1 
                    sm:translate-x-2 sm:translate-y-2 
                    group-hover:translate-x-2 group-hover:translate-y-2 
                    sm:group-hover:translate-x-3 sm:group-hover:translate-y-3 
                    transition-transform duration-500"
                  />

                  {/* Main Logo Card */}
                  <div
                    className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 
                    shadow-xl sm:shadow-2xl overflow-hidden border border-primary/10 
                    group-hover:border-primary/30 transition-all duration-500"
                  >
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] sm:opacity-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-lime-500 animate-gradient" />
                    </div>
                    <div
                      className="absolute inset-0 opacity-[0.02] sm:opacity-5"
                      style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                        backgroundSize: 'clamp(16px, 3vw, 32px) clamp(16px, 3vw, 32px)',
                      }}
                    />

                    {/* Logo */}
                    <div className="relative">
                      <img
                        src={unifiedPickleballLogo}
                        alt="Unified Pickleball - International Federation"
                        className="w-full h-auto object-contain relative z-10 drop-shadow-lg"
                        loading="lazy"
                      />
                    </div>

                    {/* Decorative Lines */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1 sm:gap-2">
                      <div className="w-8 h-0.5 sm:w-10 sm:h-1 md:w-12 bg-gradient-to-r from-primary to-transparent rounded-full" />
                      <div className="w-6 h-0.5 sm:w-8 sm:h-1 bg-gradient-to-r from-primary to-transparent rounded-full" />
                      <div className="w-4 h-0.5 sm:w-6 sm:h-1 bg-gradient-to-r from-primary to-transparent rounded-full" />
                    </div>

                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 flex flex-col gap-1 sm:gap-2">
                      <div className="w-4 h-0.5 sm:w-6 sm:h-1 bg-gradient-to-l from-lime-500 to-transparent rounded-full" />
                      <div className="w-6 h-0.5 sm:w-8 sm:h-1 bg-gradient-to-l from-lime-500 to-transparent rounded-full" />
                      <div className="w-8 h-0.5 sm:w-10 sm:h-1 md:w-12 bg-gradient-to-l from-lime-500 to-transparent rounded-full" />
                    </div>
                  </div>

                  {/* Floating Dots */}
                  <div className="absolute -top-2 right-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-float" />
                  <div className="absolute top-1/3 -right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-lime-500 rounded-full animate-float-delayed" />
                  <div className="absolute -bottom-1 left-1/3 w-3 h-3 sm:w-4 sm:h-4 bg-primary/50 rounded-full animate-float-slow" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </section>

        {/* Affiliation Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute top-1/3 left-1/3 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 
              bg-primary/5 rounded-full blur-xl sm:blur-2xl md:blur-3xl"
            />
            <div
              className="absolute bottom-1/3 right-1/3 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 
              bg-lime-500/5 rounded-full blur-xl sm:blur-2xl md:blur-3xl"
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-2xl sm:max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
              <div className="inline-block mb-3 sm:mb-4">
                <span
                  className="text-primary text-xs sm:text-sm font-bold uppercase tracking-wider 
                  bg-primary/10 px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 
                  rounded-full border border-primary/20"
                >
                  Nuestra Conexión
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold 
                bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3 sm:mb-4"
              >
                Nuestra Afiliación
              </h2>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <div
                  className="w-8 h-0.5 sm:w-10 sm:h-0.5 md:w-12 md:h-1 
                  bg-gradient-to-r from-transparent to-primary rounded-full"
                />
                <div
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 
                  bg-primary rounded-full animate-pulse"
                />
                <div
                  className="w-8 h-0.5 sm:w-10 sm:h-0.5 md:w-12 md:h-1 
                  bg-gradient-to-l from-transparent to-primary rounded-full"
                />
              </div>
            </div>

            {/* Main Content Card */}
            <div className="max-w-4xl lg:max-w-5xl mx-auto">
              <div className="group relative">
                <div
                  className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-primary to-lime-500 
                  rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-20 
                  blur-lg sm:blur-xl transition-opacity duration-700"
                />

                <div
                  className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                  rounded-2xl sm:rounded-3xl border border-slate-700/50 
                  group-hover:border-primary/50 transition-all duration-700 
                  overflow-hidden p-6 sm:p-8 md:p-10 lg:p-12"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />

                  <div
                    className="absolute top-0 left-0 w-1 sm:w-2 h-full 
                    bg-gradient-to-b from-primary via-lime-500 to-primary"
                  />

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                      -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
                    />
                  </div>

                  <div className="relative z-10 space-y-6 sm:space-y-8">
                    {/* Description */}
                    <div className="space-y-4">
                      <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">
                        Nuestra Federación está afiliada con{' '}
                        <strong className="text-primary font-semibold">Unified Pickleball</strong>,
                        conectándonos oficialmente con la comunidad internacional de pickleball.
                        Esta afiliación garantiza que nuestras actividades, regulaciones y
                        competiciones se alineen con estándares internacionales y abre la puerta a
                        mayores oportunidades de crecimiento, intercambio deportivo y participación
                        en eventos globales.
                      </p>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6">
                      {[
                        {
                          icon: CheckCircle,
                          title: 'Estándares Internacionales',
                          desc: 'Reglas y regulaciones alineadas con prácticas globales',
                        },
                        {
                          icon: Globe,
                          title: 'Eventos Globales',
                          desc: 'Participación en competiciones internacionales',
                        },
                        {
                          icon: Users,
                          title: 'Intercambio Deportivo',
                          desc: 'Colaboración con federaciones en todo el mundo',
                        },
                        {
                          icon: TrendingUp,
                          title: 'Oportunidades de Crecimiento',
                          desc: 'Acceso a programas de desarrollo y recursos',
                        },
                      ].map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 sm:gap-4 group/item p-3 sm:p-4 
                          rounded-xl hover:bg-slate-800/30 transition-all duration-500"
                        >
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl 
                            bg-primary/20 backdrop-blur-sm border border-primary/30 
                            flex items-center justify-center text-primary flex-shrink-0 
                            group-hover/item:scale-110 group-hover/item:bg-primary 
                            group-hover/item:text-slate-900 transition-all duration-500 
                            shadow-lg shadow-primary/0 group-hover/item:shadow-primary/50"
                          >
                            <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className="font-bold text-white mb-1 text-sm sm:text-base 
                              group-hover/item:text-primary transition-colors duration-500 
                              line-clamp-1"
                            >
                              {benefit.title}
                            </h4>
                            <p
                              className="text-xs sm:text-sm text-slate-400 leading-relaxed 
                              group-hover/item:text-slate-300 transition-colors duration-500 
                              line-clamp-2"
                            >
                              {benefit.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Corner Gradients */}
                  <div
                    className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 
                    bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />
                  <div
                    className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 
                    bg-gradient-to-tr from-lime-500/10 to-transparent rounded-tr-full 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section
          className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden 
          bg-gradient-to-b from-slate-900 to-slate-950"
        >
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-2xl sm:max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
              <div className="inline-block mb-3 sm:mb-4">
                <span
                  className="text-primary text-xs sm:text-sm font-bold uppercase tracking-wider 
                  bg-primary/10 px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 
                  rounded-full border border-primary/20"
                >
                  Impacto Global
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold 
                bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3 sm:mb-4"
              >
                Por Qué Importa
              </h2>
            </div>

            {/* Cards Grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 
              max-w-5xl lg:max-w-6xl mx-auto"
            >
              {[
                {
                  icon: Sparkles,
                  title: 'Estándares Unificados',
                  desc: 'Reglas y regulaciones consistentes en todas las naciones miembros, asegurando juego justo y estándares de competencia profesional.',
                  color: 'primary',
                },
                {
                  icon: Globe,
                  title: 'Red Global',
                  desc: 'Acceso a una red internacional de federaciones, entrenadores y jugadores fomentando colaboración e intercambio de conocimientos.',
                  color: 'lime-500',
                },
                {
                  icon: TrendingUp,
                  title: 'Desarrollo de Élite',
                  desc: 'Programas de entrenamiento avanzado y recursos diseñados para elevar a los atletas a niveles competitivos de clase mundial.',
                  color: 'primary',
                },
              ].map((item, index) => (
                <div key={index} className="group relative h-full">
                  <div
                    className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-primary to-lime-500 
                    rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-20 
                    blur-lg sm:blur-xl transition-opacity duration-700"
                  />

                  <div
                    className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                    rounded-2xl sm:rounded-3xl border border-slate-700/50 
                    group-hover:border-primary/50 transition-all duration-700 
                    overflow-hidden p-5 sm:p-6 md:p-7 lg:p-8 h-full"
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    />

                    <div className="relative z-10 h-full flex flex-col">
                      {/* Icon */}
                      <div className="mb-4 sm:mb-5 md:mb-6">
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                          rounded-xl sm:rounded-2xl 
                          ${item.color === 'primary' ? 'bg-primary/20 text-primary' : 'bg-lime-500/20 text-lime-500'} 
                          backdrop-blur-sm border ${item.color === 'primary' ? 'border-primary/30' : 'border-lime-500/30'} 
                          flex items-center justify-center 
                          group-hover:scale-110 group-hover:rotate-3 
                          ${item.color === 'primary' ? 'group-hover:bg-primary' : 'group-hover:bg-lime-500'} 
                          group-hover:text-slate-900 transition-all duration-500 
                          shadow-lg ${item.color === 'primary' ? 'shadow-primary/0' : 'shadow-lime-500/0'} 
                          ${item.color === 'primary' ? 'group-hover:shadow-primary/50' : 'group-hover:shadow-lime-500/50'}`}
                        >
                          <item.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 
                        group-hover:text-primary transition-colors duration-500 
                        line-clamp-2"
                      >
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p
                        className="text-slate-400 leading-relaxed text-sm sm:text-base 
                        group-hover:text-slate-300 transition-colors duration-500 
                        flex-1 line-clamp-4"
                      >
                        {item.desc}
                      </p>

                      {/* Divider */}
                      <div
                        className={`mt-4 sm:mt-5 md:mt-6 w-12 h-0.5 sm:w-16 sm:h-1 
                        ${
                          item.color === 'primary'
                            ? 'bg-gradient-to-r from-primary to-transparent'
                            : 'bg-gradient-to-r from-lime-500 to-transparent'
                        } 
                        rounded-full group-hover:w-16 sm:group-hover:w-20 
                        transition-all duration-500`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="relative max-w-3xl lg:max-w-4xl mx-auto">
              <div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 via-lime-500/20 to-primary/20 
                rounded-2xl sm:rounded-3xl blur-lg sm:blur-xl md:blur-2xl lg:blur-3xl opacity-20 sm:opacity-30"
              />

              <div
                className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                rounded-2xl sm:rounded-3xl border border-slate-700/50 overflow-hidden 
                p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 text-center"
              >
                {/* Pattern */}
                <div
                  className="absolute inset-0 opacity-[0.02] sm:opacity-5"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(124, 252, 0, 0.3) 1px, transparent 0)`,
                    backgroundSize: 'clamp(16px, 3vw, 32px) clamp(16px, 3vw, 32px)',
                  }}
                />

                <div className="relative z-10">
                  {/* Title */}
                  <h3
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold 
                    bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3 sm:mb-4"
                  >
                    Únete al Movimiento Global
                  </h3>

                  {/* Description */}
                  <p
                    className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 
                    max-w-2xl mx-auto px-2"
                  >
                    Sé parte de la conexión de México con la comunidad mundial de Pickleball
                  </p>

                  {/* Button */}
                  <a
                    href="/register"
                    className="group inline-flex items-center gap-2 sm:gap-3 
                      bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold 
                      text-sm sm:text-base px-6 sm:px-8 md:px-10 lg:px-12 
                      py-3 sm:py-4 md:py-5 lg:py-6 
                      rounded-xl sm:rounded-2xl hover:shadow-xl md:hover:shadow-2xl 
                      hover:shadow-primary/50 transition-all duration-500 overflow-hidden relative"
                  >
                    <span className="relative z-10 whitespace-nowrap">
                      Aprende más sobre la Afiliación
                    </span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-500" />
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                      -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
                    />
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

export default InternationalFederation;
