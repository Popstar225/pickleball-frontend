import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { RootState, AppDispatch } from '../store';
import {
  receiveMessage,
  confirmSentMessage,
  updateMessageStatus,
  setTyping,
  setOnlineStatus,
  upsertConversation,
  fetchConversations,
  fetchAnnouncements,
  ChatMessage,
} from '../store/slices/messagesSlice';

const SOCKET_URL = import.meta.env.SERVER_BASE_URL || 'http://localhost:5000';

interface SendMessagePayload {
  recipient_id: string;
  content: string;
  subject?: string;
  metadata?: { attachment?: { url: string; name: string; type: string; size: number } } | null;
}

interface UseMessagingSocketReturn {
  isConnected: boolean;
  sendSocketMessage: (payload: SendMessagePayload) => void;
  sendTyping: (recipientId: string, isTyping: boolean) => void;
  checkUserStatus: (userId: string) => void;
  markRead: (messageId: string) => void;
  broadcastToGroup: (recipientIds: string[], content: string, subject?: string) => void;
}

export function useMessagingSocket(): UseMessagingSocketReturn {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user?.id) return;

    // Create socket connection to /messaging namespace
    const socket = io(`${SOCKET_URL}/messaging`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      isConnectedRef.current = true;
      console.log('[Socket] Connected to /messaging');
      // Re-fetch conversations on reconnect to get latest state
      dispatch(fetchConversations());
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    socket.on('disconnect', () => {
      isConnectedRef.current = false;
      console.log('[Socket] Disconnected');
    });

    // ─── Incoming direct message ───────────────────────────────────────────────
    socket.on('message:new', (data: any) => {
      const msg: ChatMessage = {
        id: data.message_id,
        sender_id: data.sender_id,
        recipient_id: data.recipient_id,
        content: data.content,
        subject: data.subject,
        message_type: 'direct_message',
        status: 'sent',
        is_read: false,
        created_at: data.sent_at,
        metadata: data.metadata ?? null,
        sender: {
          id: data.sender_id,
          full_name: data.sender_name,
          username: data.sender_name,
          user_type: data.sender_user_type ?? 'player',
          profile_photo: data.sender_photo_url ?? null,
        },
      };
      dispatch(receiveMessage(msg));
      // Auto-mark delivered
      socket.emit('message:delivered', { message_id: data.message_id });
    });

    // ─── Our sent message confirmed by server ─────────────────────────────────
    socket.on('message:new:confirmed', (data: any) => {
      // Conversation preview was already updated optimistically via addOptimisticMessage,
      // so we only update the timestamp here without overwriting last_message with empty string.
      dispatch(
        confirmSentMessage({
          message_id: data.message_id,
          recipient_id: data.recipient_id,
          sent_at: data.sent_at,
          content: '', // slice ignores empty-string updates to last_message
        }),
      );
    });

    // ─── Message delivered ────────────────────────────────────────────────────
    socket.on('message:delivered', (data: any) => {
      // We need to know which partner this belongs to - best effort with activeConversationId
      // The slice will handle it if partnerId is provided
    });

    // ─── Message read ─────────────────────────────────────────────────────────
    socket.on('message:read', (data: any) => {
      // Update status for all threads (we don't know which partner without more info)
      dispatch(fetchConversations());
    });

    // ─── Typing indicator ─────────────────────────────────────────────────────
    socket.on('message:typing', (data: any) => {
      dispatch(setTyping({ userId: data.user_id, isTyping: data.is_typing }));

      // Auto-clear typing after 3s if no follow-up
      if (data.is_typing) {
        setTimeout(() => {
          dispatch(setTyping({ userId: data.user_id, isTyping: false }));
        }, 3000);
      }
    });

    // ─── User online/offline ──────────────────────────────────────────────────
    socket.on('user:online', (data: any) => {
      dispatch(setOnlineStatus({ userId: data.user_id, isOnline: true }));
    });

    socket.on('user:offline', (data: any) => {
      dispatch(
        setOnlineStatus({ userId: data.user_id, isOnline: false, lastSeen: data.last_seen }),
      );
    });

    socket.on('user:status', (data: any) => {
      dispatch(
        setOnlineStatus({
          userId: data.user_id,
          isOnline: data.is_online,
          lastSeen: data.last_seen ?? undefined,
        }),
      );
    });

    // ─── Admin/coach broadcast received ──────────────────────────────────────
    socket.on('announcement:new', () => {
      dispatch(fetchAnnouncements());
    });

    // ─── Coach broadcast received (legacy) ───────────────────────────────────
    socket.on('coach:message:broadcast', (data: any) => {
      // Refresh announcements inbox so table updates in real-time
      dispatch(fetchAnnouncements());
      socket.emit('coach:message:delivered', { broadcast_id: data.broadcast_id });
    });

    // ─── Error ────────────────────────────────────────────────────────────────
    socket.on('error', (data: any) => {
      console.error('[Socket] Error:', data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    };
  }, [user?.id, dispatch]);

  // ─── Emit helpers ─────────────────────────────────────────────────────────

  const sendSocketMessage = useCallback(
    ({ recipient_id, content, subject, metadata }: SendMessagePayload) => {
      const socket = socketRef.current;
      if (!socket?.connected) return;
      socket.emit('message:new', { recipient_id, content, subject: subject ?? '', metadata: metadata ?? null });
    },
    [],
  );

  const sendTyping = useCallback((recipientId: string, isTyping: boolean) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit('message:typing', { recipient_id: recipientId, is_typing: isTyping });
  }, []);

  const checkUserStatus = useCallback((userId: string) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit('user:status:request', { user_id: userId });
  }, []);

  const markRead = useCallback((messageId: string) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit('message:read', { message_id: messageId });
  }, []);

  const broadcastToGroup = useCallback(
    (recipientIds: string[], content: string, subject = 'Anuncio') => {
      const socket = socketRef.current;
      if (!socket?.connected) return;
      // Send individual messages to each recipient via socket
      recipientIds.forEach((rid) => {
        socket.emit('message:new', { recipient_id: rid, content, subject });
      });
    },
    [],
  );

  return {
    isConnected: isConnectedRef.current,
    sendSocketMessage,
    sendTyping,
    checkUserStatus,
    markRead,
    broadcastToGroup,
  };
}
