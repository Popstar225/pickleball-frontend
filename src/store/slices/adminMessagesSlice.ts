import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

interface AdminMessage {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  message_type: 'announcement' | 'notification' | 'alert' | 'reminder' | 'newsletter';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  sender_id: string;
  sender_name: string;
  target_audience: string;
  target_filters?: any;
  scheduled_send_at?: string;
  sent_at?: string;
  total_recipients: number;
  sent_count: number;
  read_count: number;
  click_count: number;
  action_button_text?: string;
  action_button_url?: string;
  expires_at?: string;
  is_pinned: boolean;
  send_via_email: boolean;
  send_via_notification: boolean;
  attachments?: string[];
  metadata?: any;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface AdminMessageRecipient {
  id: string;
  admin_message_id: string;
  recipient_id: string;
  recipient_email: string;
  recipient_name: string;
  recipient_type: string;
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  clicked_at?: string;
  error_message?: string;
  is_dismissed: boolean;
  dismissed_at?: string;
}

interface ComposeMessageData {
  title: string;
  content: string;
  excerpt?: string;
  message_type: 'announcement' | 'notification' | 'alert' | 'reminder' | 'newsletter';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_audience: string;
  target_filters?: any;
  scheduled_send_at?: string;
  expires_at?: string;
  is_pinned: boolean;
  send_via_email: boolean;
  send_via_notification: boolean;
  action_button_text?: string;
  action_button_url?: string;
  attachments?: string[];
  tags?: string[];
}

interface AdminMessagesState {
  messages: AdminMessage[];
  selectedMessage: AdminMessage | null;
  composeData: ComposeMessageData;
  showCompose: boolean;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  stats: {
    total: number;
    draft: number;
    scheduled: number;
    sent: number;
    cancelled: number;
  } | null;
}

const initialComposeData: ComposeMessageData = {
  title: '',
  content: '',
  message_type: 'announcement',
  priority: 'medium',
  target_audience: 'all_users',
  is_pinned: false,
  send_via_email: false,
  send_via_notification: true,
  attachments: [],
  tags: []
};

const initialState: AdminMessagesState = {
  messages: [],
  selectedMessage: null,
  composeData: initialComposeData,
  showCompose: false,
  loading: false,
  error: null,
  pagination: null,
  stats: null,
};

// Async thunks
export const fetchAdminMessages = createAsyncThunk(
  'adminMessages/fetchMessages',
  async (params?: {
    status?: string;
    target_audience?: string;
    priority?: string;
    message_type?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/admin/messages${queryString ? `?${queryString}` : ''}`);
    return response;
  }
);

export const fetchAdminMessageById = createAsyncThunk(
  'adminMessages/fetchMessageById',
  async (id: string) => {
    const response = await api.get(`/admin/messages/${id}`);
    return response;
  }
);

export const createAdminMessage = createAsyncThunk(
  'adminMessages/createMessage',
  async (messageData: ComposeMessageData) => {
    const response = await api.post('/admin/messages', messageData);
    return response;
  }
);

export const updateAdminMessage = createAsyncThunk(
  'adminMessages/updateMessage',
  async ({ id, messageData }: { id: string; messageData: Partial<ComposeMessageData> }) => {
    const response = await api.put(`/admin/messages/${id}`, messageData);
    return response;
  }
);

export const deleteAdminMessage = createAsyncThunk(
  'adminMessages/deleteMessage',
  async (id: string) => {
    await api.delete(`/admin/messages/${id}`);
    return id;
  }
);

export const sendAdminMessage = createAsyncThunk(
  'adminMessages/sendMessage',
  async ({ id, send_immediately = true }: { id: string; send_immediately?: boolean }) => {
    const response = await api.post(`/admin/messages/${id}/send`, { send_immediately });
    return response;
  }
);

export const fetchMessageAnalytics = createAsyncThunk(
  'adminMessages/fetchAnalytics',
  async (id: string) => {
    const response = await api.get(`/admin/messages/${id}/analytics`);
    return response;
  }
);

export const previewRecipients = createAsyncThunk(
  'adminMessages/previewRecipients',
  async ({ target_audience, target_filters }: { target_audience: string; target_filters?: any }) => {
    const response = await api.post('/admin/messages/preview-recipients', {
      target_audience,
      target_filters
    });
    return response;
  }
);

export const fetchMessageStats = createAsyncThunk(
  'adminMessages/fetchStats',
  async () => {
    const response = await api.get('/admin/messages/stats/overview');
    return response;
  }
);

const adminMessagesSlice = createSlice({
  name: 'adminMessages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedMessage: (state, action) => {
      state.selectedMessage = action.payload;
    },
    clearSelectedMessage: (state) => {
      state.selectedMessage = null;
    },
    setShowCompose: (state, action) => {
      state.showCompose = action.payload;
    },
    setComposeData: (state, action) => {
      state.composeData = { ...state.composeData, ...action.payload };
    },
    resetComposeData: (state) => {
      state.composeData = initialComposeData;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.pagination = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Messages
      .addCase(fetchAdminMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminMessages.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data) {
          state.messages = payload.data.messages || [];
          state.pagination = payload.data.pagination || null;
        }
      })
      .addCase(fetchAdminMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      // Fetch Message by ID
      .addCase(fetchAdminMessageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminMessageById.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data) {
          state.selectedMessage = payload.data.message;
        }
      })
      .addCase(fetchAdminMessageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch message';
      })
      // Create Message
      .addCase(createAdminMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminMessage.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data?.message) {
          state.messages.unshift(payload.data.message);
          state.showCompose = false;
          state.composeData = initialComposeData;
        }
      })
      .addCase(createAdminMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create message';
      })
      // Update Message
      .addCase(updateAdminMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminMessage.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data?.message) {
          const index = state.messages.findIndex(msg => msg.id === payload.data.message.id);
          if (index !== -1) {
            state.messages[index] = payload.data.message;
          }
          if (state.selectedMessage?.id === payload.data.message.id) {
            state.selectedMessage = payload.data.message;
          }
        }
      })
      .addCase(updateAdminMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update message';
      })
      // Delete Message
      .addCase(deleteAdminMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminMessage.fulfilled, (state, action) => {
        state.loading = false;
        const messageId = action.payload as string;
        state.messages = state.messages.filter(msg => msg.id !== messageId);
        if (state.selectedMessage?.id === messageId) {
          state.selectedMessage = null;
        }
      })
      .addCase(deleteAdminMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete message';
      })
      // Send Message
      .addCase(sendAdminMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendAdminMessage.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data?.message) {
          const index = state.messages.findIndex(msg => msg.id === payload.data.message.id);
          if (index !== -1) {
            state.messages[index] = payload.data.message;
          }
          if (state.selectedMessage?.id === payload.data.message.id) {
            state.selectedMessage = payload.data.message;
          }
        }
      })
      .addCase(sendAdminMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      })
      // Fetch Analytics
      .addCase(fetchMessageAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessageAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        // Analytics data can be stored in selectedMessage or separate analytics state
      })
      .addCase(fetchMessageAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch analytics';
      })
      // Preview Recipients
      .addCase(previewRecipients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(previewRecipients.fulfilled, (state, action) => {
        state.loading = false;
        // Recipients preview data can be stored in composeData or separate state
      })
      .addCase(previewRecipients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to preview recipients';
      })
      // Fetch Stats
      .addCase(fetchMessageStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessageStats.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data?.data) {
          state.stats = payload.data.data;
        }
      })
      .addCase(fetchMessageStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stats';
      });
  },
});

export const {
  clearError,
  setSelectedMessage,
  clearSelectedMessage,
  setShowCompose,
  setComposeData,
  resetComposeData,
  clearMessages,
  clearStats,
} = adminMessagesSlice.actions;

export default adminMessagesSlice.reducer; 