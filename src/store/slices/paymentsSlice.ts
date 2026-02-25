import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Payment, PaymentsQueryParams, CreatePaymentRequest, ProcessPaymentRequest } from '../../types/api';
import { api } from '../../lib/api';

interface PaymentsState {
  payments: Payment[];
  currentPayment: Payment | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

const initialState: PaymentsState = {
  payments: [],
  currentPayment: null,
  loading: false,
  error: null,
  pagination: null,
};

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (params: PaymentsQueryParams) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return await api.get(`/payments?${queryString}`);
  }
);

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData: CreatePaymentRequest) => {
    return await api.post('/payments', paymentData);
  }
);

export const processPayment = createAsyncThunk(
  'payments/processPayment',
  async ({ paymentId, processData }: { paymentId: string; processData: ProcessPaymentRequest }) => {
    return await api.put(`/payments/${paymentId}/process`, processData);
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPayment: (state, action) => {
      state.currentPayment = action.payload;
    },
    clearPayments: (state) => {
      state.payments = [];
      state.pagination = null;
    },
    addPayment: (state, action) => {
      state.payments.unshift(action.payload);
    },
    updatePayment: (state, action) => {
      const index = state.payments.findIndex(payment => payment.id === action.payload.id);
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
      if (state.currentPayment && state.currentPayment.id === action.payload.id) {
        state.currentPayment = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.payments = payload?.data || [];
        state.pagination = payload?.pagination || null;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payments';
      })
      // Create Payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload) {
          state.payments.unshift(payload);
          state.currentPayment = payload;
        }
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create payment';
      })
      // Process Payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload) {
          state.currentPayment = payload;
          // Update payment in payments array if exists
          const index = state.payments.findIndex(payment => payment.id === payload.id);
          if (index !== -1) {
            state.payments[index] = payload;
          }
        }
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to process payment';
      });
  },
});

export const { clearError, setCurrentPayment, clearPayments, addPayment, updatePayment } = paymentsSlice.actions;
export default paymentsSlice.reducer; 