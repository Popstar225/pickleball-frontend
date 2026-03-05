import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { boardOfDirectors } from '@/data/mockData';
import {
  Mail,
  Linkedin,
  Award,
  Users,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const BoardOfDirectors = () => {
  const [screenWidth, setScreenWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => setScreenWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const presidentRow = boardOfDirectors.filter((m) => m.row === 1);
  const vicePresidentsRow = boardOfDirectors.filter((m) => m.row === 2);
  const directorsRow = boardOfDirectors.filter((m) => m.row === 3);

  const socialIcons = [
    { Icon: Mail, color: 'primary', title: 'Email' },
    { Icon: Linkedin, color: '#0A66C2', title: 'LinkedIn' },
    { Icon: Twitter, color: '#1DA1F2', title: 'Twitter/X' },
    { Icon: Facebook, color: '#1877F2', title: 'Facebook' },
    { Icon: Instagram, color: '#E4405F', title: 'Instagram' },
    { Icon: Youtube, color: '#FF0000', title: 'YouTube' },
    { Icon: Globe, color: 'primary', title: 'Website' },
    { Icon: Phone, color: 'primary', title: 'Phone' },
  ];

  const MemberCard = ({
    member,
    featured = false,
  }: {
    member: (typeof boardOfDirectors)[0];
    featured?: boolean;
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    return (
      <div
        ref={cardRef}
        className={`group relative ${featured && screenWidth >= 1024 ? 'scale-[1.02]' : ''} w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto h-full`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`absolute -inset-1 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-2xl opacity-0 ${isHovered ? 'opacity-20' : ''} blur-sm transition-opacity duration-500`}
        />

        <div
          className={`relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 ${isHovered ? 'border-primary/50' : ''} transition-all duration-500 ease-out overflow-hidden w-full h-full flex flex-col p-4 sm:p-6 md:p-8`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lime-500/5 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}
          />

          <div className="relative text-center flex-1 flex flex-col items-center justify-between">
            {featured && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-primary to-lime-500 text-slate-900 px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-lg shadow-primary/50 flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm">
                  <Award className="w-3 h-3" />
                  <span>Presidente</span>
                </div>
              </div>
            )}

            <div className="relative flex-shrink-0 mb-3 sm:mb-4">
              <div
                className={`absolute inset-0 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-full ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700 animate-spin-slow blur-sm`}
              />

              <div
                className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-2 border-slate-700 ${isHovered ? 'border-primary' : ''} transition-all duration-700`}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className={`w-full h-full object-cover ${isHovered ? 'scale-110' : 'scale-100'} transition-transform duration-700`}
                  loading="lazy"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center w-full mb-2">
              <h3
                className={`font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent ${isHovered ? 'from-primary to-lime-400' : ''} transition-all duration-500 mb-1 line-clamp-2 break-words text-base sm:text-lg md:text-xl lg:text-2xl`}
              >
                {member.name}
              </h3>
              <p
                className={`text-primary font-semibold ${isHovered ? 'text-lime-400' : ''} transition-colors duration-500 line-clamp-2 break-words text-sm sm:text-base md:text-lg`}
              >
                {member.position}
              </p>
            </div>

            <div
              className={`w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto my-2 ${isHovered ? 'w-16 sm:w-20' : ''} transition-all duration-500`}
            />

            <div
              className={`flex flex-wrap justify-center gap-1 sm:gap-2 mt-2 ${isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-20'} transition-all duration-500`}
            >
              {socialIcons.slice(0, screenWidth < 640 ? 4 : 8).map(({ Icon, color, title }) => (
                <button
                  key={title}
                  className={`rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${isHovered ? 'border-primary/50 scale-105' : ''} flex items-center justify-center text-slate-400 transition-all duration-300 hover:scale-110 active:scale-95 w-8 h-8 sm:w-9 sm:h-9`}
                  title={title}
                  aria-label={title}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
              {screenWidth < 640 && isHovered && (
                <button className="rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-400 transition-all duration-300 w-8 h-8">
                  <span className="text-xs">+4</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 
          py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 
              bg-primary/10 rounded-full blur-xl sm:blur-2xl md:blur-3xl animate-pulse"
            />
            <div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 
              bg-lime-500/10 rounded-full blur-xl sm:blur-2xl md:blur-3xl animate-pulse delay-1000"
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-block mb-4 sm:mb-6">
                <span
                  className="text-primary text-xs sm:text-sm font-bold uppercase tracking-wider 
                  bg-primary/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-primary/20 
                  backdrop-blur-sm flex items-center gap-2"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Consejo Directivo</span>
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl 
                font-bold mb-4 sm:mb-6"
              >
                <span className="block bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                  Junta Directiva
                </span>
                <span
                  className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl 
                  text-primary mt-2 sm:mt-4"
                >
                  2026–2030
                </span>
              </h1>

              {/* Description */}
              <p
                className="text-white/70 text-base sm:text-lg md:text-xl lg:text-2xl 
                leading-relaxed mb-6 sm:mb-8 px-4"
              >
                Conoce al equipo de liderazgo que guía el futuro del Pickleball en México
              </p>
            </div>
          </div>
        </section>

        {/* Members Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28" ref={containerRef}>
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            {/* President */}
            <div className="mb-12 sm:mb-16 md:mb-20 lg:mb-24">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 
                  font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3"
                >
                  Presidente
                </h2>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
                  {presidentRow.map((member) => (
                    <div key={member.name} className="h-72 sm:h-72 md:h-80 lg:h-96">
                      <MemberCard member={member} featured={true} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vice Presidents */}
            <div className="mb-12 sm:mb-16 md:mb-20 lg:mb-24">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 
                  font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3"
                >
                  Vicepresidentes
                </h2>
              </div>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mx-auto w-full items-stretch justify-items-center"
                style={{ gridAutoRows: '1fr' }}
              >
                {vicePresidentsRow.map((member) => (
                  <div key={member.name} className="h-full">
                    <MemberCard member={member} />
                  </div>
                ))}
              </div>
            </div>

            {/* Directors */}
            <div>
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 
                  font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3"
                >
                  Directores
                </h2>
              </div>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mx-auto w-full items-stretch justify-items-center"
                style={{ gridAutoRows: '1fr' }}
              >
                {directorsRow.map((member) => (
                  <div key={member.name} className="h-full">
                    <MemberCard member={member} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="relative max-w-4xl mx-auto">
              <div
                className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                rounded-2xl md:rounded-3xl border border-slate-700/50 overflow-hidden p-6 sm:p-8 md:p-10 lg:p-12 text-center"
              >
                <div className="relative z-10">
                  <h3
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl 
                    font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3 sm:mb-4"
                  >
                    Únete a Nuestra Comunidad
                  </h3>
                  <p
                    className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl 
                    mb-6 sm:mb-8"
                  >
                    Conviértete en parte de la comunidad de Pickleball de más rápido crecimiento en
                    México
                  </p>
                  <a
                    href="/register"
                    className="group inline-flex items-center gap-2 sm:gap-3 
                      bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold 
                      text-sm sm:text-base px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 
                      rounded-xl sm:rounded-2xl hover:shadow-xl md:hover:shadow-2xl hover:shadow-primary/50 
                      transition-all duration-500 ease-out overflow-hidden"
                  >
                    <span className="relative z-10">Comenzar Ahora</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-500" />
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

export default BoardOfDirectors;
