/**
 * Tiebreaker Explanation Tooltip Component
 * Shows detailed explanation of why a player is ranked at their current position
 */

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TiebreakerExplanationProps {
  playerName: string;
  position: number;
  totalPlayers: number;
  standingsData?: {
    matchesWon: number;
    matchesLost: number;
    setsWon: number;
    setsLost: number;
    pointsFor: number;
    pointsAgainst: number;
    rankingPoints: number;
  };
  appliedTiebreakers?: Array<{
    name: string;
    icon: string;
    explanation: string;
    thisPlayerValue: string | number;
    compareToValue?: string | number;
    resolved: boolean;
  }>;
  children: React.ReactNode;
}

const DEFAULT_TIEBREAKER_CHAIN = [
  { order: 1, name: 'Matches Won', icon: '🏆' },
  { order: 2, name: 'Head-to-Head', icon: '🤝' },
  { order: 3, name: 'Set Difference', icon: '📊' },
  { order: 4, name: 'Ranking Points', icon: '⭐' },
  { order: 5, name: 'Point Difference', icon: '📈' },
  { order: 6, name: 'Points For', icon: '🎯' },
  { order: 7, name: 'Draw', icon: '🔄' },
];

export const TiebreakerExplanation: React.FC<TiebreakerExplanationProps> = ({
  playerName,
  position,
  totalPlayers,
  standingsData,
  appliedTiebreakers,
  children,
}) => {
  const setsWonDiff = standingsData ? standingsData.setsWon - standingsData.setsLost : 0;
  const pointsDiff = standingsData ? standingsData.pointsFor - standingsData.pointsAgainst : 0;

  const getAdvancmentStatus = (pos: number) => {
    const topAdvancing = Math.ceil(totalPlayers / 2); // Top half advances
    return pos <= topAdvancing ? 'Avanza' : 'Eliminado';
  };

  const content = (
    <div className="space-y-3 w-80">
      {/* Header */}
      <div className="flex items-start gap-2 pb-2 border-b border-white/10">
        <Info className="w-4 h-4 text-[#ace600] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white">
            ¿Por qué {playerName} está en posición #{position}?
          </p>
          <p className="text-xs text-white/50 mt-1">
            Se aplicó la cadena de desempate para resolver este ranking
          </p>
        </div>
      </div>

      {/* Direct Stats (only if standingsData provided) */}
      {standingsData && (
        <div className="p-3 bg-[#ace600]/[0.08] rounded-lg border border-[#ace600]/20 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#ace600]">
            Estadísticas Directas
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/60">Partidos Ganados:</span>
              <span className="font-bold text-white">{standingsData.matchesWon}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Partidos Perdidos:</span>
              <span className="font-bold text-white">{standingsData.matchesLost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Diferencia de Sets:</span>
              <span
                className={cn(
                  'font-bold',
                  setsWonDiff > 0
                    ? 'text-[#ace600]'
                    : setsWonDiff < 0
                      ? 'text-red-400'
                      : 'text-white/40',
                )}
              >
                {setsWonDiff > 0 ? '+' : ''}
                {setsWonDiff}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Diferencia de Puntos:</span>
              <span
                className={cn(
                  'font-bold',
                  pointsDiff > 0
                    ? 'text-[#ace600]'
                    : pointsDiff < 0
                      ? 'text-red-400'
                      : 'text-white/40',
                )}
              >
                {pointsDiff > 0 ? '+' : ''}
                {pointsDiff}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tiebreaker Chain If Provided */}
      {appliedTiebreakers && appliedTiebreakers.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
            Cadena de Desempate Aplicada
          </p>
          <div className="space-y-1.5">
            {appliedTiebreakers.map((tb, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-start gap-2 p-2 rounded-lg text-xs',
                  tb.resolved
                    ? 'bg-[#ace600]/[0.08] border border-[#ace600]/20'
                    : 'bg-white/[0.03] border border-white/[0.06]',
                )}
              >
                <span className="text-base">({idx + 1})</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <span>{tb.icon}</span>
                    {tb.name}
                  </p>
                  <p className="text-white/60 mt-1 leading-relaxed">{tb.explanation}</p>
                  {tb.thisPlayerValue !== undefined && (
                    <p className="text-white/40 mt-1.5 text-[10px]">
                      {playerName}:{' '}
                      <span className="text-white/70 font-mono">{tb.thisPlayerValue}</span>
                      {tb.compareToValue !== undefined && (
                        <>
                          {' '}
                          vs Contrincante:{' '}
                          <span className="text-white/70 font-mono">{tb.compareToValue}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
                {tb.resolved && <CheckCircle2 className="w-4 h-4 text-[#ace600] shrink-0 mt-1" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generic Tiebreaker Info if no specific data */}
      {(!appliedTiebreakers || appliedTiebreakers.length === 0) && (
        <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06] space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
            Cadena de Desempate Estándar
          </p>
          <div className="space-y-1 text-[10px]">
            {DEFAULT_TIEBREAKER_CHAIN.map((tb) => (
              <div key={tb.order} className="flex items-center gap-2 text-white/60">
                <span>{tb.order}.</span>
                <span>{tb.icon}</span>
                <span>{tb.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advancement Status */}
      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Estado de Clasificación:</span>
          <span
            className={cn(
              'text-xs font-bold px-2 py-1 rounded',
              position <= Math.ceil(totalPlayers / 2)
                ? 'bg-[#ace600]/20 text-[#ace600]'
                : 'bg-red-500/20 text-red-400',
            )}
          >
            {getAdvancmentStatus(position)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild className="cursor-help">
          {children}
        </TooltipTrigger>
        <TooltipContent side="right" align="start" className="p-0 bg-[#0d1117] border-white/[0.08]">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TiebreakerExplanation;
