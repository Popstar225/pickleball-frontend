/**
 * WaitlistInfoPanel.tsx
 *
 * Displays waiting list position and status for a registered event
 * Shows estimated wait time and spot availability
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Clock, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import PlayerRegistrationService, { WaitlistPosition } from '@/services/playerRegistrationService';
import { cn } from '@/lib/utils';

interface WaitlistInfoPanelProps {
  tournamentId: string;
  eventId: string;
  userId: string;
  onSpotOpened?: () => void;
}

export function WaitlistInfoPanel({
  tournamentId,
  eventId,
  userId,
  onSpotOpened,
}: WaitlistInfoPanelProps) {
  const [position, setPosition] = useState<WaitlistPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchWaitlistPosition();

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchWaitlistPosition();
    }, 30000);

    setPollInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tournamentId, eventId, userId]);

  const fetchWaitlistPosition = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await PlayerRegistrationService.getWaitlistPosition(
        tournamentId,
        eventId,
        userId,
      );

      // Check if spot opened
      if (position && result.position < position.position) {
        toast.success('¡Un lugar se ha abierto! Has avanzado en la lista de espera.');
        onSpotOpened?.();
      }

      setPosition(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener posición';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-4 h-4 animate-spin text-[#ace600] mr-2" />
        <span className="text-sm text-white/60">Cargando información de lista de espera...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <p className="text-xs text-red-400/90">{error}</p>
      </div>
    );
  }

  if (!position) {
    return null;
  }

  const percentage = Math.round(
    (position.position / (position.position + position.spots_available)) * 100,
  );

  return (
    <div className="space-y-4 p-4 rounded-lg bg-amber-500/[0.06] border border-amber-500/20">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-amber-400" />
        <p className="text-sm font-semibold text-amber-400">Estás en la Lista de Espera</p>
      </div>

      {/* Position Info */}
      <div className="grid grid-cols-3 gap-3">
        {/* Current Position */}
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
            Tu Posición
          </p>
          <p className="text-2xl font-bold text-amber-400">#{position.position}</p>
        </div>

        {/* Total Waitlist */}
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
            Total en Espera
          </p>
          <p className="text-2xl font-bold text-white/70">{position.total_waitlist}</p>
        </div>

        {/* Spots Available */}
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
            Lugares Libres
          </p>
          <p className="text-2xl font-bold text-emerald-400">{position.spots_available}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-white/50">Probabilidad de obtener un lugar</span>
          <span className="text-white/70 font-semibold">{percentage}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Estimated Time */}
      {position.estimated_time && (
        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <p className="text-xs font-semibold text-white/60 mb-1">Tiempo Estimado</p>
          <p className="text-sm text-white/80">{position.estimated_time}</p>
        </div>
      )}

      {/* Help Text */}
      <div className="p-2.5 rounded-lg bg-white/[0.02] space-y-1">
        <p className="text-xs text-white/60">
          💡{' '}
          {position.spots_available > 0
            ? `Hay ${position.spots_available} lugar${position.spots_available > 1 ? 'es' : ''} disponible${position.spots_available > 1 ? 's' : ''} en este momento.`
            : 'ningún lugar disponible en este momento. Espera a que someone se retire.'}{' '}
          Te notificaremos cuando haya un lugar disponible.
        </p>
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchWaitlistPosition}
        disabled={loading}
        className="w-full py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
      >
        {loading ? 'Actualizando...' : 'Actualizar Información'}
      </button>
    </div>
  );
}

export default WaitlistInfoPanel;
