import {
  Calendar,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useMemo } from 'react';
import { upcomingEvents, schedulerEvents } from '@/data/mockData';

interface DayInfo {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
}

interface SchedulerEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  type: string;
  location: string;
  attendees: number;
  prize?: string | null;
  color: string;
  isAllDay?: boolean;
}

const EventsSection = () => {
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'list'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 1, 6));
  const [selectedEventType, setSelectedEventType] = useState<string>('all');

  const upcomingEventsList = upcomingEvents.slice(0, 3);
  const featuredEvent = upcomingEvents.find((e) => e.featured);
  const regularEvents = upcomingEvents.filter((e) => !e.featured);

  // Filter events based on selected type
  const filteredEvents = useMemo(() => {
    if (selectedEventType === 'all') return schedulerEvents as SchedulerEvent[];
    return (schedulerEvents as SchedulerEvent[]).filter(
      (event) => event.type === selectedEventType,
    );
  }, [selectedEventType]);

  // Get calendar data for current month
  const getCalendarDays = (): DayInfo[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days: DayInfo[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): SchedulerEvent[] => {
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Get week days for week view
  const getWeekDays = (): Date[] => {
    const days: Date[] = [];
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }

    return days;
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Navigation handlers
  const handlePrevious = (): void => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (currentView === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = (): void => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = (): void => {
    setCurrentDate(new Date(2026, 1, 6));
  };

  const handleRegisterEvent = (eventId: number): void => {
    console.log(`Register clicked for event ${eventId}`);
  };

  const handleViewAllEvents = (): void => {
    console.log('View All Events clicked');
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatWeekRange = (startDate: Date): string => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'Puede',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    return `${months[startDate.getMonth()]} ${startDate.getDate()} - ${months[endDate.getMonth()]} ${endDate.getDate()}, ${endDate.getFullYear()}`;
  };

  const renderMonthView = (): JSX.Element => {
    const days = getCalendarDays();

    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm h-full flex flex-col">
        <div className="grid grid-cols-7 bg-muted/50 flex-shrink-0">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
            <div
              key={i}
              className="px-2 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide border-r border-border last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1 overflow-y-auto overflow-x-auto">
          {days.map((dayInfo, index) => {
            const dayEvents = getEventsForDate(dayInfo.date);
            const isTodayDate = isToday(dayInfo.date);
            const isLastColumn = index % 7 === 6;
            const isLastRow = index >= days.length - 7;

            return (
              <div
                key={index}
                className={`min-h-[120px] min-w-0 bg-card p-2 border-r border-b border-border ${
                  isLastColumn ? 'border-r-0' : ''
                } ${isLastRow ? 'border-b-0' : ''} ${!dayInfo.isCurrentMonth ? 'bg-muted/20 opacity-50' : ''} hover:bg-muted/10 transition-colors`}
              >
                <div
                  className={`text-sm font-medium mb-2 w-7 h-7 flex items-center justify-center rounded-full ${
                    isTodayDate ? 'bg-primary text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {dayInfo.day}
                </div>

                <div className="space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <TooltipProvider key={idx}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                            style={{
                              backgroundColor: event.color + '20',
                              borderLeft: `3px solid ${event.color}`,
                              color: event.color,
                            }}
                          >
                            <div className="flex items-center gap-1 min-w-0">
                              {event.type === 'Tournament' && (
                                <Trophy className="w-3 h-3 flex-shrink-0" />
                              )}
                              {event.type === 'Training' && (
                                <Zap className="w-3 h-3 flex-shrink-0" />
                              )}
                              {event.type === 'Qualifier' && (
                                <Award className="w-3 h-3 flex-shrink-0" />
                              )}
                              <span className="font-medium truncate min-w-0">{event.title}</span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="text-sm font-semibold mb-1">{event.title}</div>
                          {event.description && <div className="text-xs">{event.description}</div>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-2 font-medium">
                      +{dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = (): JSX.Element => {
    const weekDays = getWeekDays();
    const hours = Array.from({ length: 14 }, (_, i) => i + 8);

    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm h-full flex flex-col">
        <div className="overflow-y-auto overflow-x-auto flex-1">
          <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] min-w-max h-full">
            <div className="bg-muted/50 p-3 px-4 border-r border-b border-border sticky top-0 z-10"></div>
            {weekDays.map((date, i) => {
              const isTodayDate = isToday(date);
              return (
                <div
                  key={`header-${i}`}
                  className={`bg-muted/50 p-3 text-center border-r border-b border-border last:border-r-0 min-w-0 sticky top-0 z-10 ${isTodayDate ? 'bg-primary/10' : ''}`}
                >
                  <div className="text-xs text-muted-foreground uppercase tracking-wide truncate">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div
                    className={`text-lg font-semibold mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                      isTodayDate ? 'bg-primary text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}

            <div className="contents">
              {hours.map((hour) => (
                <div key={`hour-${hour}`} className="contents">
                  <div className="bg-muted/30 px-3 py-3 text-xs text-muted-foreground text-right border-r border-b border-border font-medium">
                    {hour}:00
                  </div>
                  {weekDays.map((date, dayIdx) => {
                    const dayEvents = getEventsForDate(date).filter((event) => {
                      const eventHour = new Date(event.start).getHours();
                      return eventHour === hour;
                    });

                    return (
                      <div
                        key={`${hour}-${dayIdx}`}
                        className={`bg-card p-1 min-h-[60px] min-w-0 relative border-r border-b border-border ${dayIdx === 6 ? 'border-r-0' : ''} hover:bg-muted/10 transition-colors overflow-hidden`}
                      >
                        {dayEvents.map((event, idx) => (
                          <TooltipProvider key={idx}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="text-xs px-2 py-1 rounded mb-1 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                                  style={{
                                    backgroundColor: event.color,
                                    color: 'white',
                                  }}
                                >
                                  <div className="font-semibold truncate">{event.title}</div>
                                  <div className="text-[10px] opacity-90 truncate">
                                    {event.location}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="text-sm font-semibold mb-1">{event.title}</div>
                                {event.description && (
                                  <div className="text-xs">{event.description}</div>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = (): JSX.Element => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 8);
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm h-full flex flex-col">
        <div className="bg-muted/50 p-4 border-b border-border flex-shrink-0">
          <div className="text-center">
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
            <div className="text-3xl font-bold text-foreground mt-1">{currentDate.getDate()}</div>
            <div className="text-sm text-muted-foreground">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter((event) => {
              const eventHour = new Date(event.start).getHours();
              return eventHour === hour;
            });

            return (
              <div key={hour} className="flex border-b border-border last:border-b-0">
                <div className="w-20 bg-muted/30 px-3 py-4 text-xs text-muted-foreground text-right border-r border-border flex-shrink-0 font-medium">
                  {hour}:00
                </div>
                <div className="flex-1 p-3 min-h-[80px] hover:bg-muted/10 transition-colors">
                  {hourEvents.map((event, idx) => (
                    <TooltipProvider key={idx}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="rounded-lg p-4 mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                            style={{
                              backgroundColor: event.color + '20',
                              borderLeft: `4px solid ${event.color}`,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: event.color }}
                              >
                                {event.type === 'Tournament' && (
                                  <Trophy className="w-5 h-5 text-white" />
                                )}
                                {event.type === 'Training' && (
                                  <Zap className="w-5 h-5 text-white" />
                                )}
                                {event.type === 'Qualifier' && (
                                  <Award className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground mb-1">
                                  {event.title}
                                </h4>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(event.start).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}{' '}
                                    -{' '}
                                    {new Date(event.end).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {event.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {event.attendees} registrados
                                  </span>
                                </div>
                                {event.prize && (
                                  <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 text-xs mt-2">
                                    {event.prize}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                size="sm"
                                style={{ backgroundColor: event.color, color: 'white' }}
                              >
                                Registrarse
                              </Button>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="text-sm font-semibold mb-1">{event.title}</div>
                          {event.description && <div className="text-xs">{event.description}</div>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {hourEvents.length === 0 && (
                    <div className="text-sm text-muted-foreground italic">
                      Sin eventos programados
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = (): JSX.Element => {
    const sortedEvents = [...filteredEvents].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm h-full flex flex-col">
        <div className="divide-y divide-border overflow-y-auto flex-1">
          {sortedEvents.map((event) => (
            <div key={event.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: event.color + '20' }}
                >
                  <div className="text-xs font-semibold" style={{ color: event.color }}>
                    {new Date(event.start)
                      .toLocaleDateString('en-US', { month: 'short' })
                      .toUpperCase()}
                  </div>
                  <div className="text-2xl font-bold" style={{ color: event.color }}>
                    {new Date(event.start).getDate()}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      style={{ borderColor: event.color, color: event.color }}
                    >
                      {event.type}
                    </Badge>
                    {event.prize && (
                      <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                        {event.prize}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg text-foreground mb-2">{event.title}</h3>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {new Date(event.start).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {event.attendees} registrados
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                  )}
                </div>

                <Button
                  size="sm"
                  style={{ backgroundColor: event.color, color: 'white' }}
                  className="flex-shrink-0"
                >
                  Registrarse
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
                PRÓXIMAMENTE
              </Badge>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl text-foreground mb-2 sm:mb-3">
              PRÓXIMOS EVENTOS
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              No te pierdas la acción: inscríbete en los próximos torneos y eventos.
            </p>
            <Button variant="outline" className="hidden md:flex gap-2 group mt-4">
              <Calendar className="w-4 h-4" />
              Ver calendario completo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {featuredEvent && (
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer">
                <img
                  src={featuredEvent.image}
                  alt={featuredEvent.title}
                  className="w-full h-80 sm:h-56 md:h-80 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent" />

                <div className="absolute inset-0 px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 lg:py-10 flex flex-col justify-end">
                  <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3 md:mb-4">
                      <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1">
                        <Trophy className="w-3 h-3 mr-1" />
                        EVENTO DESTACADO
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-white/30 text-white text-xs sm:text-sm"
                      >
                        {featuredEvent.type}
                      </Badge>
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
                      {featuredEvent.title}
                    </h3>

                    <div className="flex flex-col gap-2 sm:gap-3 text-white/80 mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{featuredEvent.date}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{featuredEvent.location}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{featuredEvent.attendees} registrados</span>
                      </span>
                    </div>

                    {featuredEvent.prize && (
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                        <div className="bg-yellow/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 md:px-4 py-1 sm:py-2 border border-yellow/30">
                          <span className="text-yellow text-xs sm:text-sm md:text-base font-bold">
                            Premio: {featuredEvent.prize}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                      <Button className="bg-primary text-primary-foreground hover:bg-lime-dark text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3">
                        Regístrate ahora
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white bg-white/10 hover:text-white hover:bg-white/20 text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3"
                      >
                        Mas información
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 sm:gap-8 auto-rows-max lg:auto-rows-max">
            <div className="lg:col-span-3">
              <div className="flex flex-col h-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-9 h-9 sm:w-10 sm:h-10"
                      onClick={handlePrevious}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="min-w-[160px] sm:min-w-[200px] text-center shrink-0">
                      <h3 className="font-semibold text-sm sm:text-base md:text-lg text-foreground">
                        {currentView === 'month' && formatDate(currentDate)}
                        {currentView === 'week' && formatWeekRange(getWeekDays()[0])}
                        {currentView === 'day' &&
                          currentDate.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        {currentView === 'list' && 'Todos los Eventos'}
                      </h3>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-9 h-9 sm:w-10 sm:h-10"
                      onClick={handleNext}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToday}
                      className="text-xs sm:text-sm"
                    >
                      Hoy
                    </Button>
                  </div>

                  <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
                    <Button
                      variant={currentView === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentView('month')}
                      className="text-xs sm:text-sm shrink-0"
                    >
                      Mes
                    </Button>
                    <Button
                      variant={currentView === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentView('week')}
                      className="text-xs sm:text-sm shrink-0"
                    >
                      Semana
                    </Button>
                    <Button
                      variant={currentView === 'day' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentView('day')}
                      className="text-xs sm:text-sm shrink-0"
                    >
                      Día
                    </Button>
                    <Button
                      variant={currentView === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentView('list')}
                      className="text-xs sm:text-sm shrink-0"
                    >
                      Lista
                    </Button>
                  </div>
                </div>

                <div className="flex-1 min-h-[300px] sm:min-h-[500px] md:min-h-[600px] max-h-[800px] overflow-hidden">
                  {currentView === 'month' && renderMonthView()}
                  {currentView === 'week' && renderWeekView()}
                  {currentView === 'day' && renderDayView()}
                  {currentView === 'list' && renderListView()}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col max-h-[500px] sm:max-h-[600px] md:max-h-[700px] lg:max-h-[820px]">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 lg:mb-7">
                Próximos eventos
              </h3>
              <div className="space-y-3 sm:space-y-4 overflow-y-auto flex-1 pr-2">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all cursor-pointer group shadow-sm hover:shadow-lg"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-40 h-60 sm:h-60 lg:h-70 overflow-hidden shrink-0">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                            <Badge
                              variant="outline"
                              className="text-[10px] sm:text-xs border-primary/50 text-primary"
                            >
                              {event.type}
                            </Badge>
                            {event.prize && (
                              <Badge className="bg-yellow/10 text-yellow border-yellow/30 text-[10px] sm:text-xs">
                                {event.prize}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg md:text-xl text-foreground group-hover:text-primary transition-colors mb-2 sm:mb-3">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                              {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                              {event.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                              {event.attendees} registrada
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Inscripciones abiertas
                          </span>
                          <Button
                            size="sm"
                            className="bg-primary text-white hover:bg-lime-dark text-xs sm:text-sm"
                          >
                            Registro
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full py-4 sm:py-5 md:py-6 text-xs sm:text-sm md:text-base group"
                >
                  Ver todos los eventos
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
};

export default EventsSection;
