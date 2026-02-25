import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Notification, NotificationsQueryParams } from '../../types/api';
import { api } from '../../lib/api';

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  unreadCount: number;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
  pagination: null,
  unreadCount: 0,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: NotificationsQueryParams) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return await api.get(`/notifications?${queryString}`);
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (notificationId: string) => {
    return await api.put(`/notifications/${notificationId}/read`, {});
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async () => {
    return await api.put('/notifications/read-all', {});
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.pagination = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        if (!state.notifications[index].is_read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.notifications = payload?.data || [];
        state.pagination = payload?.pagination || null;
        state.unreadCount = payload?.unread_count || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      // Mark Notification as Read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload) {
          const notification = state.notifications.find(n => n.id === payload.id);
          if (notification) {
            notification.is_read = true;
          }
          if (state.unreadCount > 0) {
            state.unreadCount--;
          }
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to mark notification as read';
      })
      // Mark All Notifications as Read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications.forEach(notification => {
          notification.is_read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to mark all notifications as read';
      });
  },
});

export const { clearError, clearNotifications, addNotification, removeNotification, updateUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer; 