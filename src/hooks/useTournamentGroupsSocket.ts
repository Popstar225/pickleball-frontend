import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { AppDispatch } from '../store';
import { addNotification } from '../store/slices/notificationsSlice';
import { useToast } from './use-toast';

const SOCKET_URL = import.meta.env.VITE_API_URI?.replace('/api/v1', '') ?? 'http://localhost:5000';

export interface GroupsGeneratedPayload {
  tournament_id: string;
  event_id: string;
  event_name: string;
  group_count: number;
  generated_at: string;
}

interface UseTournamentGroupsSocketOptions {
  tournamentId: string;
  eventId: string;
  /** Displayed in toasts/notifications when no server payload available */
  eventName?: string;
  /** Called when a groups-generated event is received (player/coach side) */
  onGroupsGenerated?: (data: GroupsGeneratedPayload) => void;
}

/**
 * Manages the /tournament-bracket socket connection for group generation announcements.
 *
 * Usage — organizer (GroupManagement):
 *   const { emitGroupsGenerated } = useTournamentGroupsSocket({ tournamentId, eventId });
 *   // call emitGroupsGenerated(...) after dispatch(generateGroups) succeeds
 *
 * Usage — player / coach tournament view:
 *   useTournamentGroupsSocket({ tournamentId, eventId, eventName });
 *   // shows a toast + Redux notification automatically on groups-generated event
 */
export function useTournamentGroupsSocket({
  tournamentId,
  eventId,
  eventName,
  onGroupsGenerated,
}: UseTournamentGroupsSocketOptions) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!tournamentId || !eventId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(`${SOCKET_URL}/tournament-bracket`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[GroupsSocket] Connected — joining event ${eventId}`);
      socket.emit('join-tournament-event', { tournament_id: tournamentId, event_id: eventId });
    });

    socket.on('groups-generated', (data: GroupsGeneratedPayload) => {
      const name = data.event_name || eventName || 'evento';

      toast({
        title: '¡Grupos generados!',
        description: `Los grupos de "${name}" ya están listos. Consulta tu grupo ahora.`,
      });

      dispatch(
        addNotification({
          id: `groups-${data.event_id}-${Date.now()}`,
          type: 'tournament_groups_generated',
          title: '¡Grupos generados!',
          message: `Los grupos de "${name}" han sido generados (${data.group_count} grupos).`,
          is_read: false,
          created_at: data.generated_at || new Date().toISOString(),
          data: { tournament_id: data.tournament_id, event_id: data.event_id },
        } as any),
      );

      onGroupsGenerated?.(data);
    });

    socket.on('connect_error', (err) => {
      console.warn('[GroupsSocket] Connection error:', err.message);
    });

    return () => {
      socket.emit('leave-tournament-event', { tournament_id: tournamentId, event_id: eventId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tournamentId, eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Called by the organizer after groups are generated to broadcast to all participants. */
  const emitGroupsGenerated = useCallback(
    (payload: Omit<GroupsGeneratedPayload, 'generated_at'>) => {
      if (!socketRef.current?.connected) {
        console.warn('[GroupsSocket] Cannot emit — socket not connected');
        return;
      }
      socketRef.current.emit('announce-groups-generated', {
        ...payload,
        generated_at: new Date().toISOString(),
      });
    },
    [],
  );

  return { emitGroupsGenerated };
}
