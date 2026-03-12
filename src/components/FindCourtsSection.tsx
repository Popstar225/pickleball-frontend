import { Button } from '@/components/ui/button';
import { MapPin, Clock, Star } from 'lucide-react';
import courtsImage from '@/assets/images/courts.jpg';

const FindCourtsSection = () => {
  const handleBookCourt = () => {
    console.log('Book a court clicked - navigate to booking page or open booking modal');
    // Navigate to court booking or open booking modal
  };
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0">
        <img src={courtsImage} alt="Pickleball courts" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-secondary/95 via-secondary/70 to-transparent" />
      </div>

      <div className="relative container mx-auto px-3 sm:px-4">
        <div className="max-w-xl ml-auto text-right">
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-3 sm:mb-4">
            ¿DÓNDE JUGAR?
            <br />
            ENCUENTRA CANCHAS CERCA DE TI
          </h2>

          <p className="text-white/90 text-sm sm:text-lg mb-6 sm:mb-8 leading-relaxed">
            Reserva tu pista sin hacer cola. Reservas de pistas fáciles, rápidas y cómodas.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-end mb-6 sm:mb-8">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-lime-dark font-semibold text-xs sm:text-base px-6 sm:px-8 w-full sm:w-auto"
              onClick={handleBookCourt}
            >
              Reserva una cancha
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 justify-end text-sm sm:text-base">
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>500+ Ubicaciones</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Reserva Instantánea</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Mejor valorado</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FindCourtsSection;
