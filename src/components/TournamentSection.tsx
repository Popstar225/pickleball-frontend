import { Button } from '@/components/ui/button';
import {
  Trophy,
  Calendar,
  Users,
  FileText,
  ChevronRight,
  Building2,
  Briefcase,
  Map,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TournamentSection = () => {
  const handleJoinAsOrganizer = (type: string) => {
    console.log(`Join as ${type} clicked - open registration form or navigate`);
  };

  return (
    <section className="py-12 sm:py-16 bg-muted">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl text-foreground mb-3 sm:mb-4">
            Organiza
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
            ¿Interesado en organizar un torneo sancionado por FEDMEX? Únete a nuestra red de
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
          {[
            {
              icon: FileText,
              title: 'Registro',
              description: 'Proceso simple de registro en línea para organizadores',
            },
            {
              icon: Trophy,
              title: 'Sanción',
              description: 'Reconocimiento oficial de la federación y puntos de ranking',
            },
            {
              icon: Calendar,
              title: 'Programación',
              description: 'Fechas y formatos de torneo flexibles',
            },
            {
              icon: Users,
              title: 'Apoyo',
              description: 'Equipo dedicado para ayudarte en cada paso del camino',
            },
          ].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="bg-card rounded-xl p-5 sm:p-6 text-center card-hover border border-border"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="group w-full">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/50 transition-all duration-300 hover:shadow-lg hover:border-primary/30 h-full flex flex-col">
              <div className="flex justify-center mb-5">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
              </div>
              <Button
                size="lg"
                className="bg-primary text-secondary-foreground hover:bg-navy-light text-xs sm:text-base px-6 sm:px-8 w-full mb-5 font-semibold"
                onClick={() => handleJoinAsOrganizer('club')}
              >
                Únete como club
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-grow">
                Elige esta opción para registrar tu <b>club público</b> con jugadores que practican
                Pickleball regularmente. Con esta opción, podrás organizar torneos, publicar canchas
                en alquiler y recibir información importante sobre el pickleball federado, clave
                para el crecimiento de tu club.
              </p>
            </div>
          </div>

          <div className="group w-full">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/50 transition-all duration-300 hover:shadow-lg hover:border-secondary/30 h-full flex flex-col">
              <div className="flex justify-center mb-5">
                <div className="p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-colors duration-300">
                  <Briefcase className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <Button
                size="lg"
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary/10 text-xs sm:text-base px-6 sm:px-8 w-full mb-5 font-semibold"
                onClick={() => handleJoinAsOrganizer('partner')}
              >
                Únete como socio
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-grow">
                Elige esta opción para registrar un club{' '}
                <b>privado, resort, hotel, canchas, instalaciones o cualquier otra entidad</b>{' '}
                involucrada en la práctica del Pickleball. Con esta opción, puedes organizar torneos
                y publicar canchas para alquilar, además de recibir información importante sobre el
                pickleball federado que será clave para el crecimiento de tu club.
              </p>
            </div>
          </div>

          <div className="group w-full">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/50 transition-all duration-300 hover:shadow-lg hover:border-amber-500/30 h-full flex flex-col">
              <div className="flex justify-center mb-5">
                <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors duration-300">
                  <Map className="w-6 h-6 text-amber-500" />
                </div>
              </div>
              <Button
                size="lg"
                variant="outline"
                className="border-amber-500 text-amber-600 hover:bg-amber-500/10 text-xs sm:text-base px-6 sm:px-8 w-full mb-5 font-semibold"
                onClick={() => handleJoinAsOrganizer('state')}
              >
                Únete como estado
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-grow">
                Elige esta opción si deseas <b>dirigir el Pickleball en un estado</b>, coordinar
                torneos municipales, organizar torneos clasificatorios estatales, gestionar
                jugadores y gestionar todo lo relacionado con el Pickleball en tu estado. (Requiere
                requisitos previos y autorización).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TournamentSection;
