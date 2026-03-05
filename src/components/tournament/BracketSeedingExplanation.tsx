/**
 * Bracket Seeding Explanation Component
 * Explains bracket seeding, byes, and positioning to users
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, HelpCircle, Medal, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SeededPlayer {
  id: string;
  name: string;
  seed: number;
  source: string; // "1st place of Group A", "Best 2nd place", etc.
  stats?: {
    groupMatchesWon?: number;
    groupSetsWon?: number;
    groupPointsFor?: number;
  };
  hasBye?: boolean;
  byeReason?: string;
}

export interface BracketSeedingExplanationProps {
  players: SeededPlayer[];
  bracketSize: number;
  onPlayerClick?: (player: SeededPlayer) => void;
}

export const BracketSeedingExplanation: React.FC<BracketSeedingExplanationProps> = ({
  players,
  bracketSize,
  onPlayerClick,
}) => {
  const [selectedSeed, setSelectedSeed] = useState<SeededPlayer | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleSelectSeed = (player: SeededPlayer) => {
    setSelectedSeed(player);
    setShowDialog(true);
    onPlayerClick?.(player);
  };

  const getSeedColor = (seed: number) => {
    const ratio = seed / bracketSize;
    if (ratio <= 0.25) return 'bg-[#ace600]/20 border-[#ace600]/40 text-[#ace600]';
    if (ratio <= 0.5) return 'bg-sky-500/20 border-sky-500/40 text-sky-400';
    if (ratio <= 0.75) return 'bg-orange-500/20 border-orange-500/40 text-orange-400';
    return 'bg-white/10 border-white/20 text-white/60';
  };

  const getByeExplanation = (seed: number) => {
    const startingPlayers = Math.pow(2, Math.ceil(Math.log2(Math.ceil(bracketSize / 2))));
    const firstRoundMatches = bracketSize / 2;
    const byeCount = startingPlayers / 2 - firstRoundMatches;

    if (byeCount <= 0) return null;

    if (seed <= byeCount) {
      return `Seed #${seed} obtiene bye en primera ronda (los ${Math.round(byeCount)} mejores seeds saltan la R1)`;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-[#ace600]" />
          <h3 className="text-sm font-bold text-white">Explicación de la Germinación</h3>
        </div>
        <p className="text-xs text-white/50">
          Haz clic en cualquier seed para ver detalles sobre por qué está en esa posición
        </p>
      </div>

      {/* Seeds Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {players.map((player) => (
          <div key={player.id}>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleSelectSeed(player)}
                    className={cn(
                      'w-full aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all hover:scale-105 cursor-help',
                      getSeedColor(player.seed),
                      'hover:border-current',
                    )}
                  >
                    <span className="text-xl font-black">{player.seed}</span>
                    <span className="text-[9px] font-bold text-center leading-tight mt-1 line-clamp-2">
                      {player.name.split(' ')[0]}
                    </span>
                    {player.hasBye && <Zap className="w-3 h-3 mt-1" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-white">{player.name}</p>
                    <p className="text-xs text-white/70">{player.source}</p>
                    {player.hasBye && (
                      <p className="text-xs text-[#ace600] flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Obtiene bye en R1
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>

      {/* Information Cards */}
      <div className="space-y-3 p-4 bg-[#0d1117] rounded-lg border border-white/[0.06]">
        {/* Seeding Explanation */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
            Cómo se determina la germinación
          </p>
          <p className="text-xs text-white/50 leading-relaxed">
            Los seeds se asignan por rendimiento en rondas de grupo: ganador del grupo (mejores
            seeds), seguido por ganadores del segundo lugar ordenados por puntos de ranking y
            diferencia de sets.
          </p>
        </div>

        {/* Bye Explanation */}
        {players.some((p) => p.hasBye) && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> ¿Qué es un Bye?
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              Un bye es un pase automático a la siguiente ronda sin jugar. Se otorga a los seeds
              superiores en brackets que no son potencias perfectas de 2.
            </p>
          </div>
        )}

        {/* Bracket Size Info */}
        <div className="pt-2 border-t border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
            Estructura del Bracket
          </p>
          <p className="text-xs text-white/50">
            <span className="font-semibold text-white">{bracketSize}</span> jugadores totales en
            bracket de
            <span className="font-semibold text-white  ml-1">
              {Math.pow(2, Math.ceil(Math.log2(bracketSize)))}
            </span>{' '}
            slots
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSeed && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-[#0d1117] border-white/[0.08] max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#ace600]">
                Seed #{selectedSeed.seed} - {selectedSeed.name}
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Detalles de la asignación de semillas
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Source */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Origen
                </p>
                <p className="text-sm text-white">{selectedSeed.source}</p>
              </div>

              {/* Stats from Group Play */}
              {selectedSeed.stats && (
                <div className="space-y-1.5 p-3 bg-white/[0.06] rounded-lg border border-white/[0.08]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                    Estadísticas de Rondas de Grupo
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {selectedSeed.stats.groupMatchesWon !== undefined && (
                      <div>
                        <p className="text-white/40 text-[10px]">Partidos</p>
                        <p className="text-white font-bold">{selectedSeed.stats.groupMatchesWon}</p>
                      </div>
                    )}
                    {selectedSeed.stats.groupSetsWon !== undefined && (
                      <div>
                        <p className="text-white/40 text-[10px]">Sets</p>
                        <p className="text-white font-bold">{selectedSeed.stats.groupSetsWon}</p>
                      </div>
                    )}
                    {selectedSeed.stats.groupPointsFor !== undefined && (
                      <div>
                        <p className="text-white/40 text-[10px]">Puntos</p>
                        <p className="text-white font-bold">{selectedSeed.stats.groupPointsFor}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bye Status */}
              {selectedSeed.hasBye && (
                <div className="space-y-1.5 p-3 bg-[#ace600]/[0.08] rounded-lg border border-[#ace600]/20">
                  <p className="text-xs text-[#ace600] font-semibold flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Obtiene Bye en Primera Ronda
                  </p>
                  <p className="text-xs text-white/60">
                    {selectedSeed.byeReason ||
                      'Este seed avanza automáticamente a la siguiente ronda sin jugar.'}
                  </p>
                </div>
              )}

              {/* Seeding Formula */}
              <div className="space-y-1.5 p-3 bg-sky-500/[0.08] rounded-lg border border-sky-500/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-2">
                  Fórmula de Germinación
                </p>
                <ol className="space-y-1 text-xs text-white/60 list-decimal list-inside">
                  <li>Ganadores del grupo (mejores seeds)</li>
                  <li>Ganadores del segundo lugar (ordenados por puntos de ranking)</li>
                  <li>Terceros lugares (si aplica)</li>
                  <li>Otros clasificadores</li>
                </ol>
              </div>

              {/* Bracket Position */}
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-white/40">
                  <span className="text-[#ace600] font-semibold">Seed #{selectedSeed.seed}</span>{' '}
                  {selectedSeed.hasBye ? 'obtiene bye y ' : ''}
                  comenzará en su posición en el bracket
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BracketSeedingExplanation;
