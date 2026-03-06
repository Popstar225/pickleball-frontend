import { Trophy, IdCard, MapPin, Calendar, Flag, GraduationCap, Gift } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { affiliationBenefits } from '@/data/mockData';
import benefitsImage from '@/assets/logo-fedmex.png';

import benefit1 from '@/assets/images/_DSC7870.png';
import benefit2 from '@/assets/images/_DSC8411.png';
import benefit3 from '@/assets/images/_DSC8354.png';
import benefit4 from '@/assets/images/_DSC8137.png';
import benefit5 from '@/assets/images/blogs/Image9-1.png';
import benefit6 from '@/assets/images/blogs/Image7-1.png';
import benefit7 from '@/assets/images/blogs/image7.png';

const iconMap: Record<string, React.ReactNode> = {
  trophy: <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />,
  'id-card': <IdCard className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />,
  'map-pin': <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />,
  calendar: <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />,
  flag: <Flag className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />,
  'graduation-cap': <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />,
  gift: <Gift className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />,
};

// Background images for each benefit card
const benefitImages: Record<string, string> = {
  trophy: benefit1,
  'id-card': benefit2,
  'map-pin': benefit3,
  calendar: benefit4,
  flag: benefit5,
  'graduation-cap': benefit6,
  gift: benefit7,
};

const Benefits = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5">
      <main className="flex-1">
        {/* Hero Section - Perfectly proportioned */}
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 pt-12 pb-12 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24 xl:pt-28 xl:pb-28">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 sm:gap-10 md:gap-12 lg:gap-16">
              {/* Text Content - Takes 60% on desktop */}
              <div className="lg:w-3/5 space-y-4 sm:space-y-5 md:space-y-6">
                <div className="animate-fade-in">
                  <span className="inline-flex items-center text-primary text-sm sm:text-base font-semibold uppercase bg-primary/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-primary/20">
                    Membresía Oficial
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                    Beneficios de
                    <span className="block text-primary mt-1 sm:mt-2">afiliarse</span>
                  </h1>
                  <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
                    Únete a la Federación Mexicana de Pickleball y accede a beneficios exclusivos
                    para tu carrera deportiva.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                  <a
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-6 py-3 sm:px-7 sm:py-3.5 md:px-8 md:py-4 rounded-lg hover:bg-lime-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-primary/25 text-sm sm:text-base"
                  >
                    Únete ahora
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                  <a
                    href="#benefits"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white font-semibold px-6 py-3 sm:px-7 sm:py-3.5 md:px-8 md:py-4 rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 text-sm sm:text-base"
                  >
                    Ver beneficios
                  </a>
                </div>
              </div>

              {/* Image Content - Takes 40% on desktop */}
              <div className="lg:w-2/5">
                <div className="relative group">
                  <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-primary to-lime-500 rounded-2xl sm:rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />

                  <div className="relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 sm:p-8 md:p-10">
                      <img
                        src={benefitsImage}
                        alt="FEDMEX Pickleball"
                        className="w-full h-auto object-contain max-w-[280px] sm:max-w-[320px] md:max-w-[360px] mx-auto"
                      />
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 bg-primary text-white px-4 py-2 sm:px-5 sm:py-3 rounded-xl shadow-xl">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold">7+</div>
                    <div className="text-xs sm:text-sm opacity-90">Beneficios</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid Section */}
        <section
          id="benefits"
          className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
        >
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20">
              <div className="mb-4 sm:mb-5">
                <span className="inline-flex items-center text-primary text-sm sm:text-base font-semibold uppercase bg-primary/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-primary/20">
                  Beneficios Exclusivos
                </span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white">
                  Todo lo que obtienes
                </h2>
                <p className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-4">
                  Accede a una amplia gama de beneficios diseñados para impulsar tu desarrollo en el
                  pickleball
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
                <div className="w-8 h-1 bg-gradient-to-r from-transparent to-primary rounded-full" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="w-8 h-1 bg-gradient-to-l from-transparent to-primary rounded-full" />
              </div>
            </div>

            {/* Benefits Grid - Perfectly responsive cards */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
              style={{ gridAutoRows: '1fr' }}
            >
              {affiliationBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 h-full"
                >
                  {/* Card Background */}
                  <div className="absolute inset-0">
                    <img
                      src={benefitImages[benefit.icon]}
                      alt={benefit.title}
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80" />
                  </div>

                  {/* Card Content */}
                  <div className="relative p-5 sm:p-6 md:p-8 h-full flex flex-col">
                    {/* Icon */}
                    <div className="mb-4 sm:mb-6 relative">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-slate-800/80 backdrop-blur border border-slate-700/50 text-primary group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-lime-500 group-hover:text-white transition-all duration-500">
                        {iconMap[benefit.icon]}
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 space-y-3 sm:space-y-4">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-primary transition-colors duration-500">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>

                    {/* Hover Indicator */}
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700/50 group-hover:border-primary/50 transition-colors duration-500">
                      <div className="flex items-center gap-2 text-primary text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span>Descubrir más</span>
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform duration-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Hover Effects */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-xl sm:rounded-2xl transition-all duration-500 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  {/* Shine Effect on Hover */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl border border-slate-700/50 overflow-hidden relative">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 bg-lime-500/10 rounded-full blur-3xl" />

                <div className="relative p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 text-center">
                  {/* Header */}
                  <div className="mb-4 sm:mb-6">
                    <span className="inline-flex items-center text-primary text-sm sm:text-base font-semibold uppercase bg-primary/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-primary/30">
                      Únete Hoy
                    </span>
                  </div>

                  {/* Main Text */}
                  <div className="mb-6 sm:mb-8 md:mb-10 space-y-3 sm:space-y-4">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white">
                      ¿Listo para comenzar?
                    </h3>
                    <p className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto">
                      Afíliate hoy y comienza a disfrutar de todos estos beneficios exclusivos
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-10">
                    <a
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-6 py-3 sm:px-7 sm:py-3.5 md:px-8 md:py-4 lg:px-10 lg:py-5 rounded-lg hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 text-sm sm:text-base"
                    >
                      <span>Afiliarme ahora</span>
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>

                    <a
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 bg-slate-800/50 backdrop-blur text-white font-bold px-6 py-3 sm:px-7 sm:py-3.5 md:px-8 md:py-4 lg:px-10 lg:py-5 rounded-lg border border-slate-700 hover:border-primary hover:bg-slate-800 transition-all duration-300 text-sm sm:text-base"
                    >
                      <span>Contactar</span>
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  </div>

                  {/* Features */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-slate-500 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span>Membresía Oficial</span>
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-slate-700" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                      <span>Beneficios Instantáneos</span>
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-slate-700" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                      <span>Soporte 24/7</span>
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

export default Benefits;
