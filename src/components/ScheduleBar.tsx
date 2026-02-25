import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { tournamentResults, countryFlags } from '@/data/mockData';

const ScheduleBar = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-secondary border-border w-full overflow-hidden">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center gap-1 sm:gap-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 transition-all"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          <div
            ref={scrollRef}
            className="flex items-center gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto scrollbar-hide flex-1 min-w-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {tournamentResults.map((tournament) => (
              <div
                key={tournament.id}
                className="flex-shrink-0 bg-gradient-to-br from-secondary-foreground/8 via-secondary-foreground/4 to-secondary-foreground/2 hover:from-primary/15 hover:via-primary/8 hover:to-primary/3 border border-secondary-foreground/15 hover:border-primary/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md w-[160px] xs:w-[180px] sm:w-[200px] md:w-[220px]"
              >
                <div className="flex items-center justify-between mb-1 sm:mb-1.5 gap-1">
                  <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
                    <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary flex-shrink-0" />
                    <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-bold text-secondary-foreground truncate">
                      {tournament.name}
                    </span>
                  </div>
                  <span className="text-[7px] xs:text-[8px] px-1 py-0.5 rounded-full bg-gradient-to-r from-primary/30 to-primary/10 text-primary font-bold whitespace-nowrap flex-shrink-0">
                    {tournament.status === 'terminada' ? 'FINAL' : 'VIVA'}
                  </span>
                </div>

                <div className="text-[7px] xs:text-[8px] sm:text-[9px] text-secondary-foreground/60 mb-1 sm:mb-1.5 truncate">
                  {tournament.location} • {tournament.date}
                </div>

                <div className="flex flex-col gap-0.5 sm:gap-1">
                  {tournament.top3.map((winner) => (
                    <div
                      key={winner.place}
                      className="flex items-center gap-1 sm:gap-1.5 px-0.5 sm:px-1 py-0.5 rounded hover:bg-secondary-foreground/10 transition-colors min-w-0"
                    >
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white flex-shrink-0 ${
                          winner.place === 1
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                            : winner.place === 2
                              ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                              : 'bg-gradient-to-br from-orange-400 to-orange-600'
                        }`}
                      >
                        {winner.place}
                      </div>

                      <img
                        src={countryFlags[winner.countryCode]}
                        alt={winner.countryCode}
                        className="w-2.5 h-1.5 sm:w-3 sm:h-2 object-cover rounded-sm border border-secondary-foreground/20 flex-shrink-0"
                      />

                      <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-medium text-secondary-foreground truncate min-w-0">
                        {winner.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 transition-all"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ScheduleBar;
