import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Conversation {
  partner_id: string;
  partner_name: string;
  partner_type: string;
  partner_photo: string | null;
  last_message: string;
  last_message_at: string;
  last_message_is_mine: boolean;
  unread_count: number;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  subject?: string;
  message_type: string;
  status: 'sent' | 'delivered' | 'read';
  is_read: boolean;
  created_at: string;
  metadata?: {
    attachment?: {
      url: string;
      name: string;
      type: string;
      size: number;
    };
  } | null;
  sender?: {
    id: string;
    full_name: string;
    username: string;
    user_type: string;
    profile_photo: string | null;
  };
}

export interface OnlineStatus {
  is_online: boolean;
  last_seen: string | null;
}

export interface Announcement {
  id: string;
  sender_id: string | null;
  sender_name: string;
  subject: string;
  content: string;
  message_type: string;
  category: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    username: string;
    user_type: string;
    profile_photo: string | null;
  };
}

interface MessagesState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messagesByPartner: Record<string, ChatMessage[]>;
  onlineUsers: Record<string, OnlineStatus>;
  typingUsers: Record<string, boolean>;
  unreadTotal: number;
  conversationsLoading: boolean;
  threadLoading: boolean;
  sending: boolean;
  error: string | null;
  announcements: Announcement[];
  announcementsUnread: number;
  announcementsLoading: boolean;
  selectedAnnouncementId: string | null;
}

const initialState: MessagesState = {
  conversations: [],
  activeConversationId: null,
  messagesByPartner: {},
  onlineUsers: {},
  typingUsers: {},
  unreadTotal: 0,
  conversationsLoading: false,
  threadLoading: false,
  sending: false,
  error: null,
  announcements: [],
  announcementsUnread: 0,
  announcementsLoading: false,
  selectedAnnouncementId: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async () => {
    const res = await api.get<any>('/messages/conversations');
    return res;
  },
);

export const fetchThread = createAsyncThunk(
  'messages/fetchThread',
  async (partnerId: string) => {
    const res = await api.get<any>(`/messages/thread/${partnerId}?limit=100`);
    return { partnerId, data: res };
  },
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (payload: { recipient_id: string; content: string; subject?: string }) => {
    const res = await api.post<any>('/messages', payload);
    return res;
  },
);

export const findUserByEmail = createAsyncThunk(
  'messages/findUserByEmail',
  async (email: string) => {
    const res = await api.get<any>(`/messages/user-by-email?email=${encodeURIComponent(email)}`);
    return res;
  },
);

export const markThreadAsRead = createAsyncThunk(
  'messages/markThreadAsRead',
  async (partnerId: string) => {
    await api.put('/messages/read-all', {});
    return partnerId;
  },
);

export const fetchAnnouncements = createAsyncThunk(
  'messages/fetchAnnouncements',
  async () => {
    const res = await api.get<any>('/messages/announcements?limit=50');
    return res;
  },
);

export const markAnnouncementRead = createAsyncThunk(
  'messages/markAnnouncementRead',
  async (id: string) => {
    await api.put(`/messages/${id}/read`, {});
    return id;
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
      // Clear typing when switching
      if (action.payload && state.typingUsers[action.payload]) {
        state.typingUsers[action.payload] = false;
      }
    },

    setSelectedAnnouncement(state, action: PayloadAction<string | null>) {
      state.selectedAnnouncementId = action.payload;
    },

    // Real-time: incoming message from socket
    receiveMessage(state, action: PayloadAction<ChatMessage>) {
      const msg = action.payload;
      const partnerId = msg.sender_id;

      if (!state.messagesByPartner[partnerId]) {
        state.messagesByPartner[partnerId] = [];
      }
      // Avoid duplicates
      if (!state.messagesByPartner[partnerId].find((m) => m.id === msg.id)) {
        state.messagesByPartner[partnerId].push(msg);
      }

      // Update or create conversation entry
      const conv = state.conversations.find((c) => c.partner_id === partnerId);
      if (conv) {
        conv.last_message = msg.content;
        conv.last_message_at = msg.created_at;
        conv.last_message_is_mine = false;
        if (state.activeConversationId !== partnerId) {
          conv.unread_count += 1;
          state.unreadTotal += 1;
        }
      } else {
        // New sender — create conversation entry from available message data
        const newConv = {
          partner_id: partnerId,
          partner_name: msg.sender?.full_name || msg.sender?.username || 'Unknown',
          partner_type: msg.sender?.user_type || 'player',
          partner_photo: msg.sender?.profile_photo ?? null,
          last_message: msg.content,
          last_message_at: msg.created_at,
          last_message_is_mine: false,
          unread_count: state.activeConversationId !== partnerId ? 1 : 0,
        };
        state.conversations.unshift(newConv);
        if (state.activeConversationId !== partnerId) {
          state.unreadTotal += 1;
        }
      }
    },

    // Real-time: confirm our sent message was stored
    confirmSentMessage(
      state,
      action: PayloadAction<{ message_id: string; recipient_id: string; sent_at: string; content: string }>,
    ) {
      const { recipient_id, content, sent_at } = action.payload;
      const conv = state.conversations.find((c) => c.partner_id === recipient_id);
      if (conv) {
        // Only overwrite last_message if content is provided (avoid blanking the optimistic preview)
        if (content) conv.last_message = content;
        conv.last_message_at = sent_at;
        conv.last_message_is_mine = true;
      }
    },

    updateMessageStatus(
      state,
      action: PayloadAction<{ message_id: string; status: 'delivered' | 'read'; partnerId: string }>,
    ) {
      const { message_id, status, partnerId } = action.payload;
      const thread = state.messagesByPartner[partnerId];
      if (thread) {
        const msg = thread.find((m) => m.id === message_id);
        if (msg) msg.status = status;
      }
    },

    setTyping(state, action: PayloadAction<{ userId: string; isTyping: boolean }>) {
      state.typingUsers[action.payload.userId] = action.payload.isTyping;
    },

    setOnlineStatus(state, action: PayloadAction<{ userId: string; isOnline: boolean; lastSeen?: string }>) {
      state.onlineUsers[action.payload.userId] = {
        is_online: action.payload.isOnline,
        last_seen: action.payload.lastSeen ?? state.onlineUsers[action.payload.userId]?.last_seen ?? null,
      };
    },

    clearUnreadForPartner(state, action: PayloadAction<string>) {
      const conv = state.conversations.find((c) => c.partner_id === action.payload);
      if (conv) {
        state.unreadTotal = Math.max(0, state.unreadTotal - conv.unread_count);
        conv.unread_count = 0;
      }
    },

    addOptimisticMessage(state, action: PayloadAction<ChatMessage>) {
      const msg = action.payload;
      const partnerId = msg.recipient_id;
      if (!state.messagesByPartner[partnerId]) {
        state.messagesByPartner[partnerId] = [];
      }
      state.messagesByPartner[partnerId].push(msg);

      // Update conversation preview immediately so sidebar reflects the sent message
      const conv = state.conversations.find((c) => c.partner_id === partnerId);
      if (conv) {
        conv.last_message = msg.content;
        conv.last_message_at = msg.created_at;
        conv.last_message_is_mine = true;
      }
    },

    upsertConversation(state, action: PayloadAction<Conversation>) {
      const idx = state.conversations.findIndex((c) => c.partner_id === action.payload.partner_id);
      if (idx >= 0) {
        state.conversations[idx] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
    },

    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        const payload = action.payload as any;
        state.conversations = payload?.data ?? [];
        state.unreadTotal = (payload?.data ?? []).reduce(
          (sum: number, c: Conversation) => sum + (c.unread_count || 0),
          0,
        );
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.error = action.error.message ?? 'Failed to load conversations';
      })

      // fetchThread
      .addCase(fetchThread.pending, (state) => {
        state.threadLoading = true;
      })
      .addCase(fetchThread.fulfilled, (state, action) => {
        state.threadLoading = false;
        const { partnerId, data } = action.payload as any;
        state.messagesByPartner[partnerId] = data?.data?.messages ?? [];
      })
      .addCase(fetchThread.rejected, (state) => {
        state.threadLoading = false;
      })

      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        const payload = action.payload as any;
        const msg: ChatMessage = payload?.data;
        if (msg) {
          const partnerId = msg.recipient_id;
          if (!state.messagesByPartner[partnerId]) state.messagesByPartner[partnerId] = [];
          // Replace optimistic or add
          const exists = state.messagesByPartner[partnerId].findIndex((m) => m.id === msg.id);
          if (exists < 0) state.messagesByPartner[partnerId].push(msg);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.error.message ?? 'Failed to send message';
      })

      // fetchAnnouncements
      .addCase(fetchAnnouncements.pending, (state) => {
        state.announcementsLoading = true;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.announcementsLoading = false;
        const payload = action.payload as any;
        state.announcements = payload?.data?.announcements ?? [];
        state.announcementsUnread = payload?.data?.unread_count ?? 0;
      })
      .addCase(fetchAnnouncements.rejected, (state) => {
        state.announcementsLoading = false;
      })

      // markAnnouncementRead
      .addCase(markAnnouncementRead.fulfilled, (state, action) => {
        const id = action.payload;
        const ann = state.announcements.find((a) => a.id === id);
        if (ann && !ann.is_read) {
          ann.is_read = true;
          state.announcementsUnread = Math.max(0, state.announcementsUnread - 1);
        }
      })

      // markThreadAsRead
      .addCase(markThreadAsRead.fulfilled, (state, action) => {
        const partnerId = action.payload;
        const thread = state.messagesByPartner[partnerId];
        if (thread) {
          thread.forEach((m) => {
            if (m.sender_id === partnerId) m.is_read = true;
          });
        }
        const conv = state.conversations.find((c) => c.partner_id === partnerId);
        if (conv) {
          state.unreadTotal = Math.max(0, state.unreadTotal - conv.unread_count);
          conv.unread_count = 0;
        }
      });
  },
});

export const {
  setActiveConversation,
  setSelectedAnnouncement,
  receiveMessage,
  confirmSentMessage,
  updateMessageStatus,
  setTyping,
  setOnlineStatus,
  clearUnreadForPartner,
  addOptimisticMessage,
  upsertConversation,
  clearError,
} = messagesSlice.actions;

export default messagesSlice.reducer;
