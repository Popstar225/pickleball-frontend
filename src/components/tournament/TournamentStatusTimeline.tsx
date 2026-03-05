/**
 * Tournament Status Timeline Component
 * Displays tournament progress through all 7 stages with visual indicators
 * and real-time progress tracking
 */

import React, { useMemo } from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
export type StageKey =
  | 'planning'
  | 'groups'
  | 'standings'
  | 'matches'
  | 'qualifiers'
  | 'bracket'
  | 'completed';

export type StageStatus = 'completed' | 'in-progress' | 'pending';

export interface Stage {
  key: StageKey;
  label: string;
  description: string;
  completed: boolean;
  isActive: boolean;
  progress?: {
    current: number;
    total: number;
    percent: number;
    label: string;
  };
}

export interface TournamentStatusTimelineProps {
  stages: Stage[];
  currentStage: StageKey;
  horizontalLayout?: boolean;
  showProgressLabels?: boolean;
  onStageClick?: (stage: StageKey) => void;
  className?: string;
}

// ─── Helper: Get stage index ────────────────────────────────────────────────────
function getStageIndex(stages: Stage[], key: StageKey): number {
  return stages.findIndex((s) => s.key === key);
}

// ─── Stage Icon Indicator ──────────────────────────────────────────────────────
function StageIndicator({
  stage,
  index,
  isFirst,
  showConnectorAfter,
}: {
  stage: Stage;
  index: number;
  isFirst: boolean;
  showConnectorAfter: boolean;
}) {
  const status: StageStatus = stage.completed
    ? 'completed'
    : stage.isActive
      ? 'in-progress'
      : 'pending';

  return (
    <div className="flex flex-col items-center flex-1">
      {/* Main indicator dot */}
      <div
        className={cn(
          'relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition-all',
          status === 'completed'
            ? 'bg-[#ace600] text-black shadow-lg shadow-[#ace600]/20'
            : status === 'in-progress'
              ? 'bg-[#ace600]/15 border-2 border-[#ace600] text-[#ace600] shadow-lg shadow-[#ace600]/10'
              : 'bg-white/[0.04] border border-white/[0.08] text-white/20',
        )}
      >
        {status === 'completed' ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : status === 'in-progress' ? (
          <span className="relative">
            <span className="absolute inset-0 rounded-full bg-[#ace600] animate-pulse opacity-30" />
            <span className="relative text-[10px] font-black">{index + 1}</span>
          </span>
        ) : (
          <span className="text-[10px] font-black">{index + 1}</span>
        )}
      </div>

      {/* Connector line to next stage */}
      {showConnectorAfter && (
        <div
          className={cn(
            'w-0.5 h-6 my-1 transition-all',
            stage.completed ? 'bg-[#ace600]/40' : 'bg-white/[0.06]',
          )}
        />
      )}

      {/* Stage label */}
      <div className="text-center mt-2 min-w-[80px]">
        <p
          className={cn(
            'text-[10px] font-bold leading-tight',
            status === 'completed'
              ? 'text-white/40'
              : status === 'in-progress'
                ? 'text-[#ace600]'
                : 'text-white/15',
          )}
        >
          {stage.label}
        </p>
        <p
          className={cn(
            'text-[9px] mt-0.5 leading-tight',
            status === 'in-progress' ? 'text-white/30' : 'text-white/15',
          )}
        >
          {stage.description}
        </p>
      </div>

      {/* Progress indicator for active stage */}
      {status === 'in-progress' && stage.progress && (
        <div className="mt-2 w-full px-1">
          <div className="bg-white/[0.08] rounded-full h-1.5 overflow-hidden border border-[#ace600]/20">
            <div
              className="h-full bg-[#ace600] transition-all duration-500"
              style={{ width: `${Math.min(stage.progress.percent, 100)}%` }}
            />
          </div>
          <p className="text-[9px] text-white/30 mt-1 text-center">{stage.progress.label}</p>
        </div>
      )}
    </div>
  );
}

// ─── Vertical Layout (mobile/responsive) ──────────────────────────────────────
function VerticalTimeline({ stages, currentStage }: TournamentStatusTimelineProps) {
  const currentIndex = getStageIndex(stages, currentStage);

  return (
    <div className="space-y-0">
      {stages.map((stage, index) => (
        <div key={stage.key} className="flex gap-4">
          {/* Vertical connector */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all',
                stage.completed
                  ? 'bg-[#ace600] text-black'
                  : stage.isActive
                    ? 'bg-[#ace600]/15 border-2 border-[#ace600] text-[#ace600]'
                    : 'bg-white/[0.04] border border-white/[0.08] text-white/20',
              )}
            >
              {stage.completed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
            </div>
            {index < stages.length - 1 && (
              <div
                className={cn(
                  'w-0.5 h-16 my-1',
                  stage.completed ? 'bg-[#ace600]/40' : 'bg-white/[0.06]',
                )}
              />
            )}
          </div>

          {/* Content */}
          <div className="pb-4 flex-1 pt-1">
            <div>
              <p
                className={cn(
                  'text-sm font-bold',
                  stage.completed
                    ? 'text-white/40'
                    : stage.isActive
                      ? 'text-[#ace600]'
                      : 'text-white/30',
                )}
              >
                {stage.label}
              </p>
              <p className="text-xs text-white/25 mt-0.5">{stage.description}</p>
            </div>

            {/* Progress for active stage */}
            {stage.isActive && stage.progress && (
              <div className="mt-3 space-y-1.5">
                <div className="bg-white/[0.08] rounded-full h-1.5 overflow-hidden border border-[#ace600]/20">
                  <div
                    className="h-full bg-[#ace600] transition-all duration-500"
                    style={{ width: `${Math.min(stage.progress.percent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-white/30">{stage.progress.label}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Horizontal Layout (desktop) ───────────────────────────────────────────────
function HorizontalTimeline({ stages, currentStage }: TournamentStatusTimelineProps) {
  const currentIndex = getStageIndex(stages, currentStage);

  return (
    <div className="flex items-start gap-1">
      {stages.map((stage, index) => (
        <div key={stage.key} className="flex-1">
          <StageIndicator
            stage={stage}
            index={index}
            isFirst={index === 0}
            showConnectorAfter={index < stages.length - 1}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const TournamentStatusTimeline: React.FC<TournamentStatusTimelineProps> = ({
  stages,
  currentStage,
  horizontalLayout = true,
  showProgressLabels = true,
  onStageClick,
  className,
}) => {
  const currentIndex = getStageIndex(stages, currentStage);
  const currentStageData = stages[currentIndex];

  return (
    <div className={cn('w-full', className)}>
      {/* Header with current stage info */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
              Progreso del Torneo
            </p>
            <p className="text-xs text-white/40 mt-1">
              Fase actual:{' '}
              <span className="text-[#ace600] font-semibold">{currentStageData?.label}</span>
            </p>
          </div>

          {/* Overall progress indicator */}
          <div className="text-right">
            <p className="text-xl font-bold text-[#ace600]">
              {currentIndex + 1}/{stages.length}
            </p>
            <p className="text-[9px] text-white/30 mt-0.5">
              {Math.round(((currentIndex + 1) / stages.length) * 100)}% completado
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className={cn('bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4')}>
        {horizontalLayout ? (
          <HorizontalTimeline
            stages={stages}
            currentStage={currentStage}
            onStageClick={onStageClick}
          />
        ) : (
          <VerticalTimeline
            stages={stages}
            currentStage={currentStage}
            onStageClick={onStageClick}
          />
        )}
      </div>

      {/* Next action hint (desktop only) */}
      {currentStageData && horizontalLayout && (
        <div className="mt-4 p-3 bg-[#ace600]/[0.06] border border-[#ace600]/20 rounded-xl hidden sm:block">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-[#ace600] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#ace600] mb-0.5">Acción Siguiente</p>
              <p className="text-xs text-white/50">
                {currentIndex === 0 && 'Configura el evento y espera registros de jugadores'}
                {currentIndex === 1 &&
                  'Haz clic en "Generar Grupos" una vez que tengas los inscritos'}
                {currentIndex === 2 && 'Revisa la tabla de posiciones del grupo'}
                {currentIndex === 3 && 'Registra los resultados de los partidos'}
                {currentIndex === 4 && 'Selecciona a los jugadores clasificados para el bracket'}
                {currentIndex === 5 && 'Continúa registrando resultados del bracket'}
                {currentIndex === 6 && 'Torneo completado, puedes ver los resultados finales'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentStatusTimeline;
