import { Button } from '@/components/ui/button';
import { Users, Search, MapPin } from 'lucide-react';
import findPlayersImage from '@/assets/images/find-players.jpg';

const FindPlayersSection = () => {
  const handleFindPlayers = () => {
    console.log('Find players clicked - open search tool or navigate to find players page');
    // Navigate to find players tool or open modal
  };

  const handleViewMap = () => {
    console.log('View Map clicked - navigate to map view of players');
    // Navigate to map view or open map modal
  };
  return (
    <section className="relative py-12 sm:py-32 md:py-48 lg:py-48 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={findPlayersImage}
          alt="Players enjoying pickleball"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-cta/50 via-green-cta/50 to-green-cta/50" />
      </div>

      <div className="relative container mx-auto px-3 sm:px-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <span className="text-white/80 font-medium text-xs sm:text-base">COMUNIDAD</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-3 sm:mb-4">
            ¿ESTÁS BUSCANDO A ALGUIEN CON QUIEN JUGAR?
          </h2>

          <p className="text-white/90 text-sm sm:text-lg mb-6 sm:mb-8 max-w-lg leading-relaxed">
            Descubre nuestra herramienta para encontrar jugadores cerca de ti. Conéctate con la
            comunidad de pickleball y ¡no vuelvas a jugar solo nunca más!
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <Button
              size="lg"
              className="bg-white text-green-cta hover:bg-white/90 font-semibold text-xs sm:text-base px-6 sm:px-8 w-full sm:w-auto"
              onClick={handleFindPlayers}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Encontrar!
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/5 bg-white/10 font-semibold text-xs sm:text-base w-full sm:w-auto"
              onClick={handleViewMap}
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Ver mapa
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FindPlayersSection;
