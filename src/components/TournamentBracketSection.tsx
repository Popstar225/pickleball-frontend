import {
  SingleEliminationBracket,
  SVGViewer,
  createTheme,
} from '@g-loot/react-tournament-brackets';
import { singleEliminationMatches, getTournamentStats } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  ChevronRight,
  Maximize,
  Minimize,
  Download,
  RefreshCw,
  Zap,
  Calendar,
  MapPin,
  Award,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import './styles/TournamentBracketSection.css';

// Custom hook to get window size
const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return [size.width, size.height];
};

// Premium dark theme with golden accents
const BracketTheme = createTheme({
  textColor: {
    main: '#e2e8f0',
    highlighted: '#ffffff',
    dark: '#94a3b8',
  },
  matchBackground: {
    wonColor: '#1e293b',
    lostColor: '#0f172a',
  },
  score: {
    background: {
      wonColor: '#ace600',
      lostColor: '#475569',
    },
    text: {
      highlightedWonColor: '#0f172a',
      highlightedLostColor: '#ffffff',
    },
  },
  border: {
    color: '#334155',
    highlightedColor: '#ace600',
  },
  roundHeader: {
    backgroundColor: '#1e293b',
    fontColor: '#ace600',
  },
  connectorColor: '#334155',
  connectorColorHighlight: '#ace600',
  svgBackground: '#020617',
});

const TournamentBracketSection = () => {
  const [width, height] = useWindowSize();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const tournamentStats = getTournamentStats();

  // Calculate final dimensions - make them larger for better visibility
  const finalWidth = isFullscreen ? Math.max(width - 100, 1200) : Math.max(width - 100, 800);
  const finalHeight = isFullscreen ? Math.max(height - 250, 800) : 800;

  const handleRefreshBracket = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
    console.log('Bracket refreshed');
  };

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
    console.log('Match clicked:', match);
  };

  const handlePartyClick = (party, partyIdx) => {
    console.log('Team clicked:', party);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Add keyboard shortcut for fullscreen
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Force re-render when fullscreen changes to update dimensions
  useEffect(() => {
    // Trigger window resize event to recalculate dimensions
    window.dispatchEvent(new Event('resize'));
  }, [isFullscreen]);

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95" />

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-48 sm:w-64 md:w-72 h-48 sm:h-64 md:h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-48 sm:w-64 md:w-72 h-48 sm:h-64 md:h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-20 w-48 sm:w-64 md:w-72 h-48 sm:h-64 md:h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 bg-slate-950 p-3 sm:p-4 md:p-6 flex flex-col'
            : 'container mx-auto px-3 sm:px-4 relative z-10'
        }
      >
        <div className="flex flex-col sm:flex-row items-start justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="relative shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow animate-pulse" />
                <div className="absolute inset-0 blur-md bg-yellow-400 opacity-50"></div>
              </div>
              <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 font-bold tracking-wide px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm shadow-lg shadow-yellow-500/20">
                EN VIVO
              </Badge>
              <Badge
                variant="outline"
                className="border-slate-700 text-slate-300 font-mono text-xs"
              >
                2026
              </Badge>
            </div>
            <h2
              className={`font-black bg-gradient-to-r from-white via-yellow-100 to-yellow-200 bg-clip-text text-transparent leading-tight tracking-tight ${
                isFullscreen
                  ? 'text-xl sm:text-2xl'
                  : 'text-2xl sm:text-4xl md:text-6xl lg:text-7xl'
              }`}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Cuadro del Torneo
            </h2>
            {!isFullscreen && (
              <p className="text-slate-200 mt-2 sm:mt-3 text-xs sm:text-sm md:text-base lg:text-lg font-light tracking-wide">
                Campeonato Nacional de Pickleball{' '}
                <span className="text-yellow-400 font-semibold">FEDMEX</span> 2026
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 sm:w-10 sm:h-10 border-slate-600 text-slate-100 hover:bg-slate-700 bg-slate-800 hover:border-yellow-400 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Salir (Ctrl/Cmd + F)' : 'Pantalla completa (Ctrl/Cmd + F)'}
            >
              {isFullscreen ? (
                <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-slate-600 text-slate-100 bg-slate-800 hover:bg-slate-700 hover:border-yellow-400 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 font-semibold text-xs sm:text-sm px-3 sm:px-4"
              onClick={handleRefreshBracket}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          </div>
        </div>

        <div
          className={`rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50 ${
            isFullscreen ? 'flex-1 flex flex-col' : ''
          }`}
          style={{
            boxShadow: '0 0 80px rgba(234, 179, 8, 0.1), inset 0 0 80px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="bg-slate-950/50 border-b border-slate-800/50 px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 backdrop-blur-sm overflow-x-auto">
            <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <span className="text-slate-200 font-medium">
                  {tournamentStats.totalTeams} Equipos
                </span>
              </div>
              <div className="hidden sm:block w-px h-3 sm:h-4 bg-slate-700"></div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <span className="text-slate-200 font-medium">
                  {tournamentStats.totalMatches} Partidos
                </span>
              </div>
              <div className="hidden sm:block w-px h-3 sm:h-4 bg-slate-700"></div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <span className="text-slate-200 font-medium">{tournamentStats.dates}</span>
              </div>
              <div className="hidden sm:block w-px h-3 sm:h-4 bg-slate-700"></div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <span className="text-slate-200 font-medium">{tournamentStats.prize}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto sm:ml-0">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] sm:text-xs text-slate-300 font-mono">EN VIVO</span>
            </div>
          </div>

          <div className={`w-full bg-slate-950/50 ${isFullscreen ? 'flex-1' : ''}`}>
            <SingleEliminationBracket
              matches={singleEliminationMatches}
              matchComponent={(props) => {
                const isSelected = selectedMatch?.id === props.match.id;
                return (
                  <div
                    onClick={() => {
                      props.onMatchClick?.(props.match);
                      handleMatchClick(props.match);
                    }}
                    onMouseEnter={props.onMouseEnter}
                    onMouseLeave={props.onMouseLeave}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      backgroundColor: isSelected ? '#1e293b' : '#0f172a',
                      border: isSelected ? '2px solid #ace600' : '1px solid #334155',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected
                        ? '0 0 30px rgba(172, 230, 0, 0.3), 0 4px 20px rgba(0, 0, 0, 0.5)'
                        : '0 2px 8px rgba(0, 0, 0, 0.3)',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    }}
                    className="hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/10 group"
                  >
                    <div
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        borderBottom: '1px solid #334155',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#64748b',
                          fontFamily: "'JetBrains Mono', monospace",
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {new Date(props.match.startTime).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      {props.match.state === 'SCORE_DONE' && (
                        <div
                          style={{
                            fontSize: '9px',
                            color: '#ace600',
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(234, 179, 8, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          FINALIZADO
                        </div>
                      )}
                      {props.match.state === 'SCHEDULED' && (
                        <div
                          style={{
                            fontSize: '9px',
                            color: '#3b82f6',
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          PRÓXIMO
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        padding: '10px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {props.match.participants && props.match.participants.length > 0 ? (
                        <>
                          {props.match.participants.map((participant, idx) => (
                            <div
                              key={participant.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                props.onPartyClick?.(participant, idx);
                                handlePartyClick(participant, idx);
                              }}
                              style={{
                                padding: '10px 12px',
                                backgroundColor: participant.isWinner
                                  ? 'rgba(234, 179, 8, 0.15)'
                                  : 'rgba(15, 23, 42, 0.5)',
                                border: participant.isWinner
                                  ? '2px solid #ace600'
                                  : '1px solid #334155',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '13px',
                                fontWeight: participant.isWinner ? '700' : '500',
                                color: participant.isWinner ? '#ffffff' : '#94a3b8',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                overflow: 'hidden',
                              }}
                              className="hover:brightness-125 hover:scale-[1.02]"
                            >
                              {participant.isWinner && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background:
                                      'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, transparent 50%)',
                                    pointerEvents: 'none',
                                  }}
                                ></div>
                              )}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  flex: 1,
                                  position: 'relative',
                                }}
                              >
                                {participant.isWinner && (
                                  <Trophy
                                    style={{
                                      width: '14px',
                                      height: '14px',
                                      color: '#ace600',
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                                <span
                                  style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontFamily: "'Inter', sans-serif",
                                    letterSpacing: '-0.01em',
                                  }}
                                >
                                  {participant.name}
                                </span>
                              </div>
                              {participant.resultText && (
                                <div
                                  style={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: participant.isWinner ? '#ace600' : '#64748b',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    padding: '2px 6px',
                                    backgroundColor: participant.isWinner
                                      ? 'rgba(172, 230, 0, 0.15)'
                                      : 'rgba(71, 85, 105, 0.15)',
                                    borderRadius: '4px',
                                    flexShrink: 0,
                                  }}
                                >
                                  {participant.resultText}
                                </div>
                              )}
                              {participant.status === 'PLAYED' && (
                                <div
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    marginLeft: '8px',
                                    color: participant.isWinner ? '#ace600' : '#475569',
                                    backgroundColor: participant.isWinner
                                      ? 'rgba(234, 179, 8, 0.2)'
                                      : 'rgba(71, 85, 105, 0.2)',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    letterSpacing: '0.5px',
                                    flexShrink: 0,
                                  }}
                                >
                                  {participant.isWinner ? 'W' : 'L'}
                                </div>
                              )}
                            </div>
                          ))}

                          {props.match.participants.length === 1 && (
                            <div
                              style={{
                                padding: '10px 12px',
                                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                                border: '1px dashed #334155',
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: '#475569',
                                textAlign: 'center',
                                fontStyle: 'italic',
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              Por Definir
                            </div>
                          )}
                        </>
                      ) : (
                        // No participants - show two TBD slots
                        <>
                          <div
                            style={{
                              padding: '10px 12px',
                              backgroundColor: 'rgba(15, 23, 42, 0.5)',
                              border: '1px dashed #334155',
                              borderRadius: '8px',
                              fontSize: '12px',
                              color: '#475569',
                              textAlign: 'center',
                              fontStyle: 'italic',
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            Por Definir
                          </div>
                          <div
                            style={{
                              padding: '10px 12px',
                              backgroundColor: 'rgba(15, 23, 42, 0.5)',
                              border: '1px dashed #334155',
                              borderRadius: '8px',
                              fontSize: '12px',
                              color: '#475569',
                              textAlign: 'center',
                              fontStyle: 'italic',
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            Por Definir
                          </div>
                        </>
                      )}
                    </div>

                    <div
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        borderTop: '1px solid #334155',
                        fontSize: '10px',
                        color: '#64748b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: "'Inter', sans-serif",
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {props.match.name}
                    </div>
                  </div>
                );
              }}
              theme={BracketTheme}
              options={{
                style: {
                  roundHeader: {
                    backgroundColor: BracketTheme.roundHeader.backgroundColor,
                    fontColor: BracketTheme.roundHeader.fontColor,
                  },
                  connectorColor: BracketTheme.connectorColor,
                  connectorColorHighlight: BracketTheme.connectorColorHighlight,
                },
              }}
              onMatchClick={handleMatchClick}
              onPartyClick={handlePartyClick}
              svgWrapper={({ children, ...props }) => (
                <SVGViewer
                  width={finalWidth}
                  height={finalHeight}
                  background="#020617"
                  SVGBackground="#020617"
                  {...props}
                >
                  {children}
                </SVGViewer>
              )}
            />
          </div>
        </div>

        {!isFullscreen && (
          <>
            <div className="champion-banner mt-8">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-yellow-400/10 to-yellow-400/5 animate-pulse"></div>
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>

              <div className="relative z-10">
                <div className="champion-banner__label">
                  <div className="champion-banner__divider"></div>
                  <div className="flex items-center gap-2">
                    <span className="champion-banner__title">🏆 Campeón</span>
                  </div>
                  <div className="champion-banner__divider champion-banner__divider--right"></div>
                </div>

                <div className="champion-banner__content">
                  <div className="champion-banner__trophy">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                    <div className="relative transform hover:scale-110 transition-transform duration-300">
                      <Trophy
                        className="w-24 h-24 drop-shadow-2xl"
                        style={{
                          stroke: 'url(#goldGradient)',
                          fill: 'url(#goldGradient)',
                          filter: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.6))',
                        }}
                      />
                      <svg width="0" height="0">
                        <defs>
                          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  <div className="champion-banner__center">
                    <div className="mb-4">
                      <div className="champion-banner__badge">
                        <span className="champion-banner__subtitle">
                          TORNEO NACIONAL FEDMEX 2026
                        </span>
                      </div>
                    </div>
                    <h3 className="champion-banner__name">{tournamentStats.champion}</h3>
                    <div className="space-y-3">
                      <p className="champion-banner__description">
                        Ha demostrado ser el mejor equipo en pickleball del país
                      </p>
                      <div className="champion-banner__stats">
                        <div className="champion-banner__stat">
                          <div className="champion-banner__stat-icon">🥇</div>
                          <div className="champion-banner__stat-value">Primer Lugar</div>
                        </div>
                        <div className="champion-banner__divider-line"></div>
                        <div className="champion-banner__stat">
                          <div className="text-white text-sm font-medium">Venció en la final a</div>
                          <div className="text-white font-bold text-lg">
                            {tournamentStats.runnerUp}
                          </div>
                        </div>
                        <div className="champion-banner__divider-line"></div>
                        <div className="champion-banner__stat">
                          <div className="champion-banner__stat-icon">{tournamentStats.prize}</div>
                          <div className="champion-banner__stat-value">Premio</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="champion-banner__trophy">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                    <div className="relative transform hover:scale-110 transition-transform duration-300">
                      <Trophy
                        className="w-24 h-24 drop-shadow-2xl"
                        style={{
                          stroke: 'url(#goldGradient)',
                          fill: 'url(#goldGradient)',
                          filter: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.6))',
                        }}
                      />
                      <svg width="0" height="0">
                        <defs>
                          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stats-card">
                    <div className="stats-card__value">{tournamentStats.totalTeams}</div>
                    <div className="stats-card__label">Equipos Participantes</div>
                  </div>
                  <div className="stats-card">
                    <div className="stats-card__value">{tournamentStats.totalMatches}</div>
                    <div className="stats-card__label">Partidos Jugados</div>
                  </div>
                  <div className="stats-card">
                    <div className="stats-card__value">100%</div>
                    <div className="stats-card__label">Tasa de Victoria</div>
                  </div>
                  <div className="stats-card">
                    <div className="stats-card__value">🔥</div>
                    <div className="stats-card__label">En Racha</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-600 font-bold shadow-xl shadow-yellow-500/20 transition-all duration-300 hover:scale-105 active:scale-95 px-8 py-6 text-base"
                onClick={() => console.log('View complete results')}
              >
                Ver Resultados Completos
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-black hover:bg-slate-800 hover:border-yellow-400 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 px-8 py-6 text-base gap-2 font-semibold"
                onClick={() => console.log('Download bracket PDF')}
              >
                <Download className="w-5 h-5" />
                Descargar PDF
              </Button>
            </div>
          </>
        )}
      </div>

      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </section>
  );
};

export default TournamentBracketSection;
