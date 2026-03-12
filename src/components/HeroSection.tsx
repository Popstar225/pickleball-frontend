import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-player.jpg';
import { TrendingUp, Trophy, Volume2, VolumeX } from 'lucide-react';
import { playerRankings, countryFlags } from '@/data/mockData';
import { useState, useRef } from 'react';
import heroVideo from '@/assets/videos/Home.mp4';
const HeroSection = () => {
  const [selectedRankingCategory, setSelectedRankingCategory] = useState('Doubles');
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleJoin = () => {
    console.log('Join clicked - open registration/join modal');
    // Navigate to registration or open modal
  };

  const handleLearnMore = () => {
    console.log('Learn More clicked - scroll or navigate to more info');
    // Scroll to next section or navigate
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };
  return (
    <section className="relative min-h-[40vh] sm:min-h-[55vh] md:min-h-[65vh] lg:min-h-[75vh] overflow-hidden">
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover max-h-full"
        >
          <source src={heroVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-secondary/30" />

        {/* Sound Toggle Button */}
        <button
          onClick={handleToggleMute}
          className="absolute top-4 right-4 z-20 p-2 sm:p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-200 text-white border border-white/30 hover:border-white/50"
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar video'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>
      </div>

      <div className="relative container mx-auto px-3 sm:px-4 py-8 sm:py-12 lg:py-20">
        <div className="grid lg:grid-cols-10 gap-4 sm:gap-6 lg:gap-8 items-end">
          <div className="lg:col-span-7 animate-fade-in">
            <p className="text-primary font-bold text-xs sm:text-xs tracking-wider mb-1 sm:mb-1.5 uppercase">
              FORMA PARTE DE LA
            </p>
            <h1 className="font-display text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold text-lime-dark leading-tight mb-2 sm:mb-0">
              FEDERACIÓN NACIONAL
            </h1>
            <h2 className="font-display text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold text-lime-dark leading-tight mb-3 sm:mb-3">
              DE PICKLEBALL EN MEXICO
            </h2>
            <p className="w-full text-white/80 text-xs sm:text-xs md:text-sm mb-3 sm:mb-4 leading-snug">
              Federación oficial avalada por la Comisión Nacional del Deporte (CONADE) Y la{' '}
              <br className="hidden sm:block" />
              Federación internacional de Pickleball "<b>Unified World Pickleball Federation</b>"
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
              <Button
                className="bg-white text-white bg-lime-dark hover:bg-lime-dark text-xs px-5 sm:px-6 py-2 animate-pulse-glow w-full sm:w-auto"
                onClick={handleJoin}
              >
                Únete!
              </Button>
              <Button
                variant="outline"
                className="btn-outline-light text-white bg-white/10 hover:bg-white/10 font-semibold text-xs px-5 sm:px-6 py-2 w-full sm:w-auto"
                onClick={handleLearnMore}
              >
                Más información
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3 animate-slide-in-right mt-6 sm:mt-8 lg:mt-0 w-full max-w-sm">
            <div className="bg-white/5 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl overflow-hidden">
              <div className="flex flex-col gap-2 sm:gap-3 px-3 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 bg-secondary/20 border-b border-white/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary shrink-0" />
                  <h3 className="font-display text-[11px] sm:text-xs md:text-sm text-white font-semibold truncate">
                    Ranking Nacional
                  </h3>
                </div>
                <div className="flex gap-0.5 bg-white/10 rounded-lg p-0.5 w-full overflow-x-auto">
                  {['Dobles', 'Individuales', 'Mixtos'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedRankingCategory(category)}
                      className={`flex-1 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold transition-all duration-300 relative whitespace-nowrap shrink-0 ${
                        selectedRankingCategory === category
                          ? 'text-primary bg-white/20 rounded-md'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      {category}
                      {selectedRankingCategory === category && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary to-transparent rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-1.5 sm:p-2 md:p-3 max-h-[420px] sm:max-h-[520px] overflow-y-auto">
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-white mb-1.5 sm:mb-2 px-1.5">
                  <span>Rango/Jugador</span>
                  <span>Puntos</span>
                </div>

                <div className="space-y-1 sm:space-y-1">
                  {playerRankings.map((player) => (
                    <div
                      key={player.rank}
                      className={`flex items-center justify-between p-1 sm:p-1.5 rounded-lg transition-colors hover:bg-white/10 ${
                        player.rank <= 3 ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            player.rank === 1
                              ? 'bg-yellow text-yellow-foreground'
                              : player.rank === 2
                                ? 'bg-gray-300 text-gray-700'
                                : player.rank === 3
                                  ? 'bg-orange-400 text-white'
                                  : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {player.rank}
                        </span>
                        <div className="relative shrink-0">
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-border"
                          />
                          <img
                            src={countryFlags[player.countryCode]}
                            alt={player.countryCode}
                            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-1.5 sm:w-3 sm:h-2 rounded-sm object-cover border border-white shadow-sm"
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-white truncate">
                          {player.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
                        <span className="text-[10px] sm:text-xs font-semibold text-white">
                          {player.points}
                        </span>
                        <span
                          className={`text-[9px] sm:text-[10px] flex items-center gap-0.5 ${
                            player.change.startsWith('+')
                              ? 'text-green-500'
                              : player.change.startsWith('-')
                                ? 'text-red-500'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {player.change !== '0' && (
                            <TrendingUp
                              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${
                                player.change.startsWith('-') ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                          {player.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-white font-medium hover:underline">
                  Ver todas las clasificaciones →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
