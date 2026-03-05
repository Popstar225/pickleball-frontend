import Header from '@/components/Header';
import Footer from '@/components/Footer';
import coachImage from '@/assets/images/Image 1.jpg';
import {
  Target,
  Eye,
  Sparkles,
  Award,
  Users,
  TrendingUp,
  Globe,
  Shield,
  ArrowRight,
} from 'lucide-react';

const WhoWeAre = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 
          pt-16 sm:pt-20 md:pt-24 lg:pt-28 xl:pt-32 
          pb-12 sm:pb-16 md:pb-20 lg:pb-24 xl:pb-28 overflow-hidden"
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
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Acerca de Nosotros</span>
                  </span>
                </div>

                {/* Titles */}
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
                    <span
                      className="block bg-gradient-to-r from-white via-white to-slate-300 
                      bg-clip-text text-transparent leading-tight"
                    >
                      ¿Quiénes Somos?
                    </span>
                  </h1>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary font-semibold">
                    Federación Mexicana de Pickleball
                  </h2>
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
                    Somos una institución que busca promover el desarrollo del pickleball en México,
                    generando sinergia con todas las instituciones en nuestro país responsables de
                    promover el deporte, la excelencia y un estilo de vida saludable.
                  </p>
                  <p
                    className="relative pl-4 sm:pl-5 md:pl-6 border-l-2 sm:border-l-3 md:border-l-4 
                    border-lime-500/50"
                  >
                    Nos esforzamos por proporcionar a los atletas mexicanos las herramientas
                    necesarias para alcanzar su máximo potencial, permitiéndoles competir a nivel
                    nacional e internacional.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 pt-4 sm:pt-6 md:pt-8">
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
                      5K+
                    </div>
                    <div className="text-xs sm:text-sm text-white/60">Miembros</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
                      32
                    </div>
                    <div className="text-xs sm:text-sm text-white/60">Estados</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
                      100+
                    </div>
                    <div className="text-xs sm:text-sm text-white/60">Canchas</div>
                  </div>
                </div>
              </div>

              {/* Right Image Card */}
              <div className="relative group flex items-center justify-center mt-8 sm:mt-10 lg:mt-0">
                <div
                  className="w-full max-w-sm sm:max-w-md md:max-w-lg relative 
                  bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                  rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 
                  shadow-xl sm:shadow-2xl transform group-hover:scale-[1.02] 
                  group-hover:-translate-y-1 transition-all duration-700 overflow-hidden 
                  border border-primary/20 group-hover:border-primary/40"
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-lime-500/30" />
                  </div>

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent 
                      -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
                    />
                  </div>

                  {/* Image Container */}
                  <div className="relative z-10 rounded-xl sm:rounded-2xl overflow-hidden">
                    <img
                      src={coachImage}
                      alt="Entrenador de Pickleball FEDMEX"
                      className="w-full h-auto aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4] object-cover"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

                    {/* Text Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white z-20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          Liderazgo Profesional
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
                        Coaching de Elite
                      </h3>
                      <p className="text-xs sm:text-sm text-white/80">
                        Formando campeones mexicanos
                      </p>
                    </div>
                  </div>

                  {/* Corner Borders */}
                  <div
                    className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
                    border-t-2 border-r-2 sm:border-t-3 sm:border-r-3 md:border-t-4 md:border-r-4 
                    border-primary/30 rounded-tr-xl sm:rounded-tr-2xl md:rounded-tr-3xl"
                  />
                  <div
                    className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
                    border-b-2 border-l-2 sm:border-b-3 sm:border-l-3 md:border-b-4 md:border-l-4 
                    border-lime-500/30 rounded-bl-xl sm:rounded-bl-2xl md:rounded-bl-3xl"
                  />
                </div>

                {/* Background Glows */}
                <div
                  className="absolute -right-4 sm:-right-8 top-0 w-full max-w-sm sm:max-w-md md:max-w-lg 
                  bg-gradient-to-r from-primary via-lime-400 to-primary rounded-full blur-xl sm:blur-2xl md:blur-3xl 
                  opacity-20 group-hover:opacity-30 transition-opacity duration-700"
                />

                <div
                  className="absolute -right-2 sm:-right-4 top-4 w-full max-w-sm sm:max-w-md md:max-w-lg 
                  bg-gradient-to-r from-primary via-lime-400 to-primary rounded-2xl sm:rounded-3xl 
                  opacity-0 group-hover:opacity-30 transition-opacity duration-700 animate-spin-slow blur-lg"
                />

                <div
                  className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 
                  bg-primary/30 rounded-full blur-lg sm:blur-xl animate-pulse"
                />
                <div
                  className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 w-14 h-14 sm:w-18 sm:h-18 md:w-24 md:h-24 
                  bg-lime-500/20 rounded-full blur-lg sm:blur-xl md:blur-2xl animate-pulse delay-1000"
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </section>

        {/* Mission & Vision Section */}
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
                  Nuestros Cimientos
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold 
                bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3 sm:mb-4"
              >
                Misión y Visión
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

            {/* Mission & Vision Cards */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl lg:max-w-6xl mx-auto">
              {/* Mission Card */}
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
                  overflow-hidden p-6 sm:p-8 md:p-10 h-full"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                      -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
                    />
                  </div>

                  <div className="relative z-10 h-full flex flex-col">
                    {/* Icon */}
                    <div className="mb-4 sm:mb-5 md:mb-6">
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                        rounded-xl sm:rounded-2xl bg-primary/20 backdrop-blur-sm 
                        border border-primary/30 flex items-center justify-center text-primary 
                        group-hover:scale-110 group-hover:rotate-3 group-hover:bg-primary 
                        group-hover:text-slate-900 transition-all duration-500 
                        shadow-lg shadow-primary/0 group-hover:shadow-primary/50"
                      >
                        <Target className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 
                      group-hover:text-primary transition-colors duration-500"
                    >
                      Nuestra Misión
                    </h3>

                    {/* Description */}
                    <p
                      className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed 
                      group-hover:text-slate-300 transition-colors duration-500 flex-1"
                    >
                      Promover, desarrollar y regular el pickleball en todo México, creando
                      oportunidades para atletas de todos los niveles para crecer y destacar en este
                      deporte dinámico.
                    </p>

                    {/* Divider */}
                    <div
                      className="mt-4 sm:mt-5 md:mt-6 w-12 h-0.5 sm:w-16 sm:h-1 
                      bg-gradient-to-r from-primary to-transparent rounded-full 
                      group-hover:w-16 sm:group-hover:w-20 md:group-hover:w-32 
                      transition-all duration-500"
                    />
                  </div>

                  {/* Corner Gradient */}
                  <div
                    className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 
                    bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />
                </div>
              </div>

              {/* Vision Card */}
              <div className="group relative">
                <div
                  className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-lime-500 to-primary 
                  rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-20 
                  blur-lg sm:blur-xl transition-opacity duration-700"
                />

                <div
                  className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                  rounded-2xl sm:rounded-3xl border border-slate-700/50 
                  group-hover:border-lime-500/50 transition-all duration-700 
                  overflow-hidden p-6 sm:p-8 md:p-10 h-full"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-lime-500/5 via-transparent to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                      -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
                    />
                  </div>

                  <div className="relative z-10 h-full flex flex-col">
                    {/* Icon */}
                    <div className="mb-4 sm:mb-5 md:mb-6">
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                        rounded-xl sm:rounded-2xl bg-lime-500/20 backdrop-blur-sm 
                        border border-lime-500/30 flex items-center justify-center text-lime-500 
                        group-hover:scale-110 group-hover:rotate-3 group-hover:bg-lime-500 
                        group-hover:text-slate-900 transition-all duration-500 
                        shadow-lg shadow-lime-500/0 group-hover:shadow-lime-500/50"
                      >
                        <Eye className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 
                      group-hover:text-lime-400 transition-colors duration-500"
                    >
                      Nuestra Visión
                    </h3>

                    {/* Description */}
                    <p
                      className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed 
                      group-hover:text-slate-300 transition-colors duration-500 flex-1"
                    >
                      Establecer a México como una nación líder en pickleball, con atletas de clase
                      mundial, instalaciones y una comunidad próspera de jugadores en todos los
                      estados.
                    </p>

                    {/* Divider */}
                    <div
                      className="mt-4 sm:mt-5 md:mt-6 w-12 h-0.5 sm:w-16 sm:h-1 
                      bg-gradient-to-r from-lime-500 to-transparent rounded-full 
                      group-hover:w-16 sm:group-hover:w-20 md:group-hover:w-32 
                      transition-all duration-500"
                    />
                  </div>

                  {/* Corner Gradient */}
                  <div
                    className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 
                    bg-gradient-to-br from-lime-500/10 to-transparent rounded-bl-full 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-2xl sm:max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
              <div className="inline-block mb-3 sm:mb-4">
                <span
                  className="text-primary text-xs sm:text-sm font-bold uppercase tracking-wider 
                  bg-primary/10 px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 
                  rounded-full border border-primary/20"
                >
                  Qué nos Impulsa
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold 
                bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3 sm:mb-4"
              >
                Nuestros Valores Centrales
              </h2>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl lg:max-w-7xl mx-auto">
              {[
                {
                  icon: Award,
                  title: 'Excelencia',
                  desc: 'Buscamos los más altos estándares en todo lo que hacemos',
                },
                {
                  icon: Users,
                  title: 'Comunidad',
                  desc: 'Construyendo fuertes conexiones en todo México',
                },
                {
                  icon: TrendingUp,
                  title: 'Crecimiento',
                  desc: 'Desarrollo continuo y mejora',
                },
                {
                  icon: Shield,
                  title: 'Integridad',
                  desc: 'Transparencia y conducta ética siempre',
                },
              ].map((value, index) => (
                <div key={index} className="group relative">
                  <div
                    className="relative bg-gradient-to-br from-slate-900 to-slate-800 
                    rounded-xl sm:rounded-2xl border border-slate-700/50 
                    group-hover:border-primary/50 transition-all duration-500 
                    p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col"
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl 
                      bg-primary/20 flex items-center justify-center text-primary 
                      group-hover:scale-110 group-hover:bg-primary 
                      group-hover:text-slate-900 transition-all duration-500 mb-3 sm:mb-4"
                    >
                      <value.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    {/* Title */}
                    <h4
                      className="text-lg sm:text-xl font-bold text-white mb-2 
                      group-hover:text-primary transition-colors duration-500 
                      line-clamp-1"
                    >
                      {value.title}
                    </h4>

                    {/* Description */}
                    <p
                      className="text-slate-400 text-xs sm:text-sm leading-relaxed 
                      flex-1 line-clamp-3"
                    >
                      {value.desc}
                    </p>
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
                    Únete al Movimiento
                  </h3>

                  {/* Description */}
                  <p
                    className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 
                    max-w-2xl mx-auto px-2"
                  >
                    Sé parte de la comunidad de Pickleball de más rápido crecimiento de México
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
                    <span className="relative z-10 whitespace-nowrap">Comienza Hoy</span>
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

export default WhoWeAre;
