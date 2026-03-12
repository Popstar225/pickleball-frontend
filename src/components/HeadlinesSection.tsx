import { Play, Award, TrendingUp, Star, Medal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { playerShowcases } from '@/data/mockData';
import Carousel from 'react-multi-carousel';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import 'react-multi-carousel/lib/styles.css';
import './styles/HeadlinesSection.css';

const HeadlinesSection = () => {
  const cardTitles = ['Talento', 'El futuro', 'Prodigio', 'jugadora'];

  const navigate = useNavigate();

  const handleHeadlineClick = (slug: string) => {
    if (!slug) return;
    navigate(`/players/showcase/${slug}`);
  };

  const getTruncatedTitle = (title: string, maxLength: number = 12) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim();
  };

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1024 },
      items: 4,
      slidesToSlide: 4,
    },
    desktop: {
      breakpoint: { max: 1024, min: 600 },
      items: 3,
      slidesToSlide: 3,
    },
    tablet: {
      breakpoint: { max: 600, min: 480 },
      items: 2,
      slidesToSlide: 2,
    },
    mobile: {
      breakpoint: { max: 480, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  return (
    <section className="py-6 sm:py-8 md:py-10 lg:py-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 sm:w-48 md:w-72 lg:w-96 h-32 sm:h-48 md:h-72 lg:h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 sm:w-48 md:w-72 lg:w-96 h-32 sm:h-48 md:h-72 lg:h-96 bg-lime-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(124, 252, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 252, 0, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <div className="inline-block mb-2 sm:mb-3 md:mb-4">
            <span className="text-primary text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider bg-primary/10 px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2 rounded-full border border-primary/20">
              Jugadores Destacados
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-5 lg:mb-6 px-2">
            Talentos mexicanos
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed px-4 sm:px-2 md:px-0">
            Los mejores momentos y jugadas más destacadas del mundo del pickleball
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="px-0 lg:px-8 xl:px-12">
            <Carousel
              responsive={responsive}
              infinite={true}
              autoPlay={false}
              showDots={false}
              arrows={true}
              swipeable={true}
              draggable={true}
              containerClass="carousel-container"
              itemClass="px-1 sm:px-2 md:px-3"
            >
              {playerShowcases.map((item, index) => {
                const IconComponent = item.icon;
                const title = cardTitles[index];
                const isLongTitle = title.length > 12;

                return (
                  <div key={item.id} className="outline-none focus:outline-none w-full">
                    <div className="px-1 sm:px-2 md:px-3">
                      <div
                        className="group relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl transition-all duration-700"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => handleHeadlineClick(item.slug)}
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

                        <div className="relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden aspect-[2/3] cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                          <div className="absolute inset-0 overflow-hidden">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-110"
                            />
                          </div>

                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                          </div>

                          {/* Ribbon Badge */}
                          <div
                            className={`absolute top-0 right-0 overflow-hidden ${isLongTitle ? 'w-36 sm:w-40 md:w-48 h-36 sm:h-40 md:h-48' : 'w-32 sm:w-36 md:w-40 h-32 sm:h-36 md:h-40'} z-20 pointer-events-none`}
                          >
                            <div
                              className={`absolute ${isLongTitle ? 'top-8 sm:top-9 md:top-10 -right-14 sm:-right-15 md:-right-16' : 'top-6 sm:top-7 md:top-8 -right-10 sm:-right-11 md:-right-12'} bg-gradient-to-r from-primary/85 to-lime-500/85 backdrop-blur-md text-white font-black ${isLongTitle ? 'text-[8px] sm:text-[9px] md:text-[10px] py-1.5 sm:py-2 px-16 sm:px-18 md:px-20' : 'text-[9px] sm:text-[10px] md:text-xs py-1.5 sm:py-2 md:py-2.5 px-12 sm:px-14 md:px-16'} transform rotate-45 shadow-2xl border-y border-white/30 group-hover:from-primary/95 group-hover:to-lime-500/95 transition-all duration-500 uppercase tracking-wider leading-tight`}
                            >
                              <span className="block whitespace-nowrap">
                                {getTruncatedTitle(title, isLongTitle ? 18 : 12)}
                              </span>
                            </div>
                          </div>

                          {/* Top Badge */}
                          <div className="absolute top-1.5 sm:top-2 md:top-3 lg:top-4 left-1.5 sm:left-2 md:left-3 lg:left-4 z-10">
                            <Badge
                              variant="secondary"
                              className="bg-slate-800/80 backdrop-blur-sm text-primary text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold border border-primary/30 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 group-hover:bg-primary group-hover:text-slate-900 transition-all duration-500 shadow-lg"
                            >
                              {item.label}
                            </Badge>
                          </div>

                          <div className="relative flex flex-col h-full p-2 sm:p-3 md:p-4 lg:p-6">
                            <div className="flex-1" />

                            {/* Medal Badges - Fixed for 320px */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 lg:p-5 z-20">
                              <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3">
                                {/* Gold Badge */}
                                <div className="group/badge relative flex-shrink-0 min-w-fit">
                                  <div className="absolute -inset-0.5 sm:-inset-1 bg-amber-400 rounded-md sm:rounded-lg blur opacity-60 group-hover/badge:opacity-100 transition-opacity duration-300" />
                                  <div className="relative bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-900 font-bold px-1 sm:px-1.5 md:px-2 lg:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-md sm:rounded-lg shadow-xl flex items-center gap-0.5 sm:gap-1 md:gap-1.5 transform group-hover/badge:scale-110 transition-transform duration-300 whitespace-nowrap">
                                    <Award className="w-2.5 sm:w-3 md:w-3.5 h-2.5 sm:h-3 md:h-3.5" />
                                    <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs">
                                      {item.stats?.gold || 0}
                                    </span>
                                  </div>
                                </div>

                                {/* Silver Badge */}
                                <div className="group/badge relative flex-shrink-0 min-w-fit">
                                  <div className="absolute -inset-0.5 sm:-inset-1 bg-slate-400 rounded-md sm:rounded-lg blur opacity-60 group-hover/badge:opacity-100 transition-opacity duration-300" />
                                  <div className="relative bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 font-bold px-1 sm:px-1.5 md:px-2 lg:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-md sm:rounded-lg shadow-xl flex items-center gap-0.5 sm:gap-1 md:gap-1.5 transform group-hover/badge:scale-110 transition-transform duration-300 whitespace-nowrap">
                                    <Medal className="w-2.5 sm:w-3 md:w-3.5 h-2.5 sm:h-3 md:h-3.5" />
                                    <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs">
                                      {item.stats?.silver || 0}
                                    </span>
                                  </div>
                                </div>

                                {/* Bronze Badge */}
                                <div className="group/badge relative flex-shrink-0 min-w-fit">
                                  <div className="absolute -inset-0.5 sm:-inset-1 bg-amber-700 rounded-md sm:rounded-lg blur opacity-60 group-hover/badge:opacity-100 transition-opacity duration-300" />
                                  <div className="relative bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold px-1 sm:px-1.5 md:px-2 lg:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-md sm:rounded-lg shadow-xl flex items-center gap-0.5 sm:gap-1 md:gap-1.5 transform group-hover/badge:scale-110 transition-transform duration-300 whitespace-nowrap">
                                    <Star className="w-2.5 sm:w-3 md:w-3.5 h-2.5 sm:h-3 md:h-3.5" />
                                    <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs">
                                      {item.stats?.bronze || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-28 md:h-32 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                          </div>

                          <div className="absolute top-0 right-0 w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          <div className="absolute bottom-0 left-0 w-20 sm:w-22 md:w-24 h-20 sm:h-22 md:h-24 bg-gradient-to-tr from-lime-500/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeadlinesSection;
