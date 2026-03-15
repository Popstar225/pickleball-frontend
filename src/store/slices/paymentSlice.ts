/**
 * Redux Payment Slice
 * 
 * Manages global payment state
 * Stores payment history, statistics, and current payment status
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import PaymentService from '@/services/paymentService';
import type { Payment, PaymentStats, ProfileStats } from '@/services/paymentService';

interface PaymentSliceState {
  // Current payment state
  currentPayment: Payment | null;
  paymentHistory: Payment[];
  
  // Statistics
  stats: PaymentStats | null;
  profileStats: ProfileStats | null;
  
  // Loading states
  loading: boolean;
  historyLoading: boolean;
  statsLoading: boolean;
  profileStatsLoading: boolean;
  
  // Pagination
  page: number;
  pageSize: number;
  totalCount: number;
  
  // Filters
  filters: {
    status?: string;
    paymentType?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  };
  
  // Errors
  error: string | null;
  historyError: string | null;
  statsError: string | null;
}

const initialState: PaymentSliceState = {
  currentPayment: null,
  paymentHistory: [],
  stats: null,
  profileStats: null,
  loading: false,
  historyLoading: false,
  statsLoading: false,
  profileStatsLoading: false,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  filters: {},
  error: null,
  historyError: null,
  statsError: null,
};

// Async Thunks
export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchHistory',
  async ({
    userId,
    page = 1,
    pageSize = 10,
    filters = {},
  }: {
    userId: string;
    page?: number;
    pageSize?: number;
    filters?: Record<string, string>;
  }) => {
    const response = await PaymentService.getUserPaymentHistory(userId);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch payment history');
    }
    return { data: response.data as Payment[], page, pageSize };
  }
);

export const fetchPaymentStats = createAsyncThunk(
  'payment/fetchStats',
  async () => {
    const response = await PaymentService.getPaymentStats();
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch payment stats');
    }
    return response.data;
  }
);

export const fetchProfileStatistics = createAsyncThunk(
  'payment/fetchProfileStats',
  async () => {
    const response = await PaymentService.getProfileStatistics();
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch profile statistics');
    }
    return response.data;
  }
);

export const getPaymentById = createAsyncThunk(
  'payment/getById',
  async (paymentId: string) => {
    const response = await PaymentService.getPaymentById(paymentId);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch payment');
    }
    return response.data;
  }
);

export const refundPayment = createAsyncThunk(
  'payment/refund',
  async ({
    paymentId,
    reason,
    amount,
  }: {
    paymentId: string;
    reason?: string;
    amount?: number;
  }) => {
    const response = await PaymentService.refundPayment(
      paymentId,
      { refund_amount: amount, refund_reason: reason }
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to refund payment');
    }
    return response.data.payment;
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    // Synchronous actions
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
      state.error = null;
    },
    clearPaymentHistory: (state) => {
      state.paymentHistory = [];
      state.historyError = null;
    },
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.page = action.payload.page;
      state.pageSize = action.payload.pageSize;
    },
    setFilters: (
      state,
      action: PayloadAction<{
        status?: string;
        paymentType?: string;
        startDate?: string;
        endDate?: string;
        userId?: string;
      }>
    ) => {
      state.filters = action.payload;
      state.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {};
      state.page = 1;
    },
    clearError: (state) => {
      state.error = null;
      state.historyError = null;
      state.statsError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Payment History
    builder
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.paymentHistory = action.payload.data;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.totalCount = action.payload.data.length;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.error.message || 'Failed to fetch payment history';
      });

    // Fetch Payment Stats
    builder
      .addCase(fetchPaymentStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.stats;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.error.message || 'Failed to fetch payment stats';
      });

    // Fetch Profile Statistics
    builder
      .addCase(fetchProfileStatistics.pending, (state) => {
        state.profileStatsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchProfileStatistics.fulfilled, (state, action) => {
        state.profileStatsLoading = false;
        state.profileStats = action.payload.stats;
      })
      .addCase(fetchProfileStatistics.rejected, (state, action) => {
        state.profileStatsLoading = false;
        state.statsError = action.error.message || 'Failed to fetch profile statistics';
      });

    // Get Payment By ID
    builder
      .addCase(getPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload.payment;
      })
      .addCase(getPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payment';
      });

    // Refund Payment
    builder
      .addCase(refundPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        // Update in history if it exists
        const index = state.paymentHistory.findIndex(
          (p) => p.id === action.payload?.id
        );
        if (index !== -1 && action.payload) {
          state.paymentHistory[index] = action.payload;
        }
      })
      .addCase(refundPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to refund payment';
      });
  },
});

export const {
  clearCurrentPayment,
  clearPaymentHistory,
  setPagination,
  setFilters,
  clearFilters,
  clearError,
} = paymentSlice.actions;

// Selectors
export const selectCurrentPayment = (state: { payment: PaymentSliceState }) =>
  state.payment.currentPayment;
export const selectPaymentHistory = (state: { payment: PaymentSliceState }) =>
  state.payment.paymentHistory;
export const selectPaymentStats = (state: { payment: PaymentSliceState }) =>
  state.payment.stats;
export const selectProfileStats = (state: { payment: PaymentSliceState }) =>
  state.payment.profileStats;
export const selectPaymentLoading = (state: { payment: PaymentSliceState }) =>
  state.payment.loading;
export const selectHistoryLoading = (state: { payment: PaymentSliceState }) =>
  state.payment.historyLoading;
export const selectStatsLoading = (state: { payment: PaymentSliceState }) =>
  state.payment.statsLoading;
export const selectPaymentError = (state: { payment: PaymentSliceState }) =>
  state.payment.error;
export const selectHistoryError = (state: { payment: PaymentSliceState }) =>
  state.payment.historyError;
export const selectPagination = (state: { payment: PaymentSliceState }) => ({
  page: state.payment.page,
  pageSize: state.payment.pageSize,
  totalCount: state.payment.totalCount,
});
export const selectFilters = (state: { payment: PaymentSliceState }) =>
  state.payment.filters;

export default paymentSlice.reducer;
