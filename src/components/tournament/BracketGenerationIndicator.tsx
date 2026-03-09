/**
 * Bracket Generation Indicator Component
 *
 * Shows visual feedback during bracket auto-generation and qualifier advancement
 * Displays real-time status with animated loading indicator, qualifier count,
 * and bracket readiness status
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BracketGenerationIndicatorProps {
  isGenerating: boolean;
  bracketReady: boolean;
  qualifiersCount: number;
  bracketMatchesTotal: number;
  bracketMatchesCompleted: number;
  winner?: { name: string } | null;
  className?: string;
}

export const BracketGenerationIndicator: React.FC<BracketGenerationIndicatorProps> = ({
  isGenerating,
  bracketReady,
  qualifiersCount,
  bracketMatchesTotal,
  bracketMatchesCompleted,
  winner,
  className,
}) => {
  if (winner) {
    // Tournament completed
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border',
          'bg-[#ace600]/[0.08] border-[#ace600]/30',
          className,
        )}
      >
        <div className="flex-shrink-0">
          <Trophy className="w-5 h-5 text-[#ace600]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#ace600] truncate">¡Torneo Completado!</p>
          <p className="text-[11px] text-white/40 truncate">Campeón: {winner.name}</p>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    // Bracket is being generated
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border',
          'bg-amber-500/[0.08] border-amber-500/30 animate-pulse',
          className,
        )}
      >
        <div className="flex-shrink-0">
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-amber-400">Generando bracket...</p>
          <p className="text-[11px] text-white/40">Calculando clasificación automática</p>
        </div>
      </div>
    );
  }

  if (bracketReady) {
    const bracketProgress =
      bracketMatchesTotal > 0 ? (bracketMatchesCompleted / bracketMatchesTotal) * 100 : 0;

    if (bracketMatchesCompleted === bracketMatchesTotal && bracketMatchesTotal > 0) {
      // Bracket matches all done
      return (
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border',
            'bg-green-500/[0.08] border-green-500/30',
            className,
          )}
        >
          <div className="flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-green-400">Bracket Completado</p>
            <p className="text-[11px] text-white/40">
              {bracketMatchesCompleted}/{bracketMatchesTotal} partidos completados
            </p>
          </div>
        </div>
      );
    }

    // Bracket ready but matches in progress
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border',
          'bg-[#ace600]/[0.08] border-[#ace600]/30',
          className,
        )}
      >
        <div className="flex-shrink-0">
          <div className="w-5 h-5 rounded-full bg-[#ace600]/20 border border-[#ace600]/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#ace600]" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs font-semibold text-[#ace600] truncate">Bracket en Progreso</p>
            <span className="text-[10px] font-bold text-white/40 shrink-0">
              {Math.round(bracketProgress)}%
            </span>
          </div>
          <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ace600] transition-all duration-300"
              style={{ width: `${Math.min(bracketProgress, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            {bracketMatchesCompleted}/{bracketMatchesTotal} partidos del bracket
          </p>
        </div>
      </div>
    );
  }

  if (qualifiersCount > 0) {
    // Qualifiers determined but bracket not ready yet
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border',
          'bg-[#ace600]/[0.08] border-[#ace600]/30',
          className,
        )}
      >
        <div className="flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-[#ace600]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#ace600] truncate">Clasificados Definidos</p>
          <p className="text-[11px] text-white/40">{qualifiersCount} jugadores clasificados</p>
        </div>
      </div>
    );
  }

  // No progress yet
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border',
        'bg-white/[0.04] border-white/[0.08]',
        className,
      )}
    >
      <div className="flex-shrink-0">
        <AlertCircle className="w-5 h-5 text-white/20" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-white/30">Esperando Resultados</p>
        <p className="text-[11px] text-white/20">Completa todos los partidos para generar bracket</p>
      </div>
    </div>
  );
};

export default BracketGenerationIndicator;
