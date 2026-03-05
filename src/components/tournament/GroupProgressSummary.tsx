/**
 * Group Progress Summary Component
 * Shows overall progress of group play including:
 * - Total matches completed/pending
 * - Progress per group
 * - Estimated completion time
 */

import React, { useMemo } from 'react';
import { BarChart3, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupProgressSummaryProps {
  groups: any[];
  matches: any[];
  isCompact?: boolean;
}

export const GroupProgressSummary: React.FC<GroupProgressSummaryProps> = ({
  groups,
  matches,
  isCompact = false,
}) => {
  const progressData = useMemo(() => {
    const totalMatches = matches.length;
    const completedMatches = matches.filter((m: any) => m.status === 'completed').length;
    const completionPercent = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

    // Calculate per-group progress
    const groupProgress = groups.map((group: any) => {
      const groupMatches = matches.filter(
        (m: any) => m.group_id === group.id || m.match_type === `group_${group.id}`,
      );
      const groupCompleted = groupMatches.filter((m: any) => m.status === 'completed').length;
      const groupPercent =
        groupMatches.length > 0 ? (groupCompleted / groupMatches.length) * 100 : 0;

      return {
        id: group.id,
        number: group.group_number || group.id.slice(0, 4),
        completed: groupCompleted,
        total: groupMatches.length,
        percent: groupPercent,
        status:
          groupPercent === 100 ? 'complete' : groupCompleted > 0 ? 'in-progress' : 'not-started',
      };
    });

    return {
      totalMatches,
      completedMatches,
      completionPercent,
      groupProgress,
      estimatedHours: Math.ceil((totalMatches - completedMatches) * 0.5), // Assume 30 min per match
    };
  }, [groups, matches]);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress Card */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2">
              Progreso General de Grupos
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-[#ace600]">
                {progressData.completedMatches}/{progressData.totalMatches}
              </p>
              <p className="text-xs text-white/40">partidos completados</p>
            </div>
          </div>

          {/* Completion Percentage */}
          <div className="text-right">
            <p className="text-3xl font-black text-[#ace600]">
              {Math.round(progressData.completionPercent)}%
            </p>
            <p className="text-xs text-white/30 mt-1">completado</p>
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden border border-[#ace600]/20">
            <div
              className="h-full bg-[#ace600] transition-all duration-500"
              style={{ width: `${progressData.completionPercent}%` }}
            />
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-[#ace600]" />
              <span className="text-white/50">{progressData.completedMatches} completados</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="text-white/50">
                {progressData.totalMatches - progressData.completedMatches} pendientes
              </span>
            </div>
          </div>
        </div>

        {/* Time estimate (if matches remaining) */}
        {progressData.completedMatches < progressData.totalMatches && (
          <div className="mt-4 p-3 bg-sky-500/[0.08] border border-sky-500/20 rounded-lg flex items-start gap-2">
            <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sky-400">Estimación de tiempo</p>
              <p className="text-xs text-sky-300/70 mt-0.5">
                ~{progressData.estimatedHours} horas restantes (asumiendo 30 min/partido)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Per-Group Progress (Grid view if not compact) */}
      {!isCompact && progressData.groupProgress.length > 1 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
            Progreso por Grupo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {progressData.groupProgress.map((gp) => (
              <div
                key={gp.id}
                className={cn(
                  'p-3 rounded-lg border transition-all',
                  gp.status === 'complete'
                    ? 'bg-[#ace600]/[0.08] border-[#ace600]/30'
                    : gp.status === 'in-progress'
                      ? 'bg-sky-500/[0.08] border-sky-500/30'
                      : 'bg-white/[0.03] border-white/[0.06]',
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-white/70">Grupo {gp.number}</span>
                  <span
                    className={cn(
                      'text-xs font-bold',
                      gp.status === 'complete'
                        ? 'text-[#ace600]'
                        : gp.status === 'in-progress'
                          ? 'text-sky-400'
                          : 'text-white/30',
                    )}
                  >
                    {gp.completed}/{gp.total}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all',
                      gp.status === 'complete'
                        ? 'bg-[#ace600]'
                        : gp.status === 'in-progress'
                          ? 'bg-sky-400'
                          : 'bg-white/[0.08]',
                    )}
                    style={{ width: `${gp.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single Group Compact View (if only 1 group) */}
      {progressData.groupProgress.length === 1 && isCompact && (
        <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.06]">
          <p className="text-xs font-semibold text-white/50 mb-2">Grupo Único</p>
          <div className="flex items-center justifyall-between gap-2">
            <div className="flex-1">
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ace600]"
                  style={{ width: `${progressData.groupProgress[0].percent}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-bold text-white/40 whitespace-nowrap ml-2">
              {progressData.groupProgress[0].completed}/{progressData.groupProgress[0].total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupProgressSummary;
