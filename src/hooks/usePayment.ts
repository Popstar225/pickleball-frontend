/**
 * usePayment Hook
 * 
 * Custom hook for managing payment operations and state
 * Orchestrates the full payment lifecycle
 */

import { useState, useCallback } from 'react';
import PaymentService from '@/services/paymentService';
import type {
  PaymentIntentRequest,
  ConfirmPaymentRequest,
  Payment,
} from '@/services/paymentService';

export interface PaymentState {
  paymentId: string | null;
  clientSecret: string | null;
  amount: number | null;
  currency: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  isProcessing: boolean;
}

interface UsePaymentReturn extends PaymentState {
  createPaymentIntent: (
    request: Omit<PaymentIntentRequest, 'currency'> & { currency?: string }
  ) => Promise<{ paymentId: string; clientSecret: string }>;
  confirmPayment: (
    paymentId: string,
    request: ConfirmPaymentRequest
  ) => Promise<Payment>;
  refundPayment: (paymentId: string) => Promise<Payment>;
  resetPayment: () => void;
  fetchPaymentHistory: (userId: string) => Promise<Payment[]>;
  fetchPaymentStats: () => Promise<any>;
}

const initialState: PaymentState = {
  paymentId: null,
  clientSecret: null,
  amount: null,
  currency: 'usd',
  status: 'idle',
  error: null,
  isProcessing: false,
};

export const usePayment = (): UsePaymentReturn => {
  const [state, setState] = useState<PaymentState>(initialState);

  const createPaymentIntent = useCallback(
    async (
      request: Omit<PaymentIntentRequest, 'currency'> & { currency?: string }
    ) => {
      setState((prev) => ({ ...prev, status: 'loading', isProcessing: true }));

      try {
        const response = await PaymentService.createPaymentIntent({
          ...request,
          currency: request.currency || 'usd',
        });

        if (!response.success || !response.data) {
          throw new Error('Failed to create payment intent');
        }

        const { payment_id, client_secret, amount, currency } = response.data;

        setState((prev) => ({
          ...prev,
          paymentId: payment_id,
          clientSecret: client_secret,
          amount,
          currency,
          status: 'idle',
          isProcessing: false,
          error: null,
        }));

        return { paymentId: payment_id, clientSecret: client_secret };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Payment intent creation failed';
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: errorMessage,
          isProcessing: false,
        }));
        throw error;
      }
    },
    []
  );

  const confirmPayment = useCallback(
    async (paymentId: string, request: ConfirmPaymentRequest) => {
      setState((prev) => ({ ...prev, status: 'loading', isProcessing: true }));

      try {
        const response = await PaymentService.confirmPayment(
          paymentId,
          request
        );

        if (!response.success || !response.data) {
          throw new Error('Failed to confirm payment');
        }

        setState((prev) => ({
          ...prev,
          status: 'success',
          error: null,
          isProcessing: false,
        }));

        return response.data.payment;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Payment confirmation failed';
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: errorMessage,
          isProcessing: false,
        }));
        throw error;
      }
    },
    []
  );

  const refundPayment = useCallback(
    async (paymentId: string, reason?: string, amount?: number) => {
      setState((prev) => ({ ...prev, isProcessing: true }));

      try {
        const response = await PaymentService.refundPayment(
          paymentId,
          { refund_amount: amount, refund_reason: reason }
        );

        if (!response.success || !response.data) {
          throw new Error('Failed to refund payment');
        }

        return response.data.payment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Refund failed';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isProcessing: false,
      }));
      throw error;
    }
  }, []);

  const resetPayment = useCallback(() => {
    setState(initialState);
  }, []);

  const fetchPaymentHistory = useCallback(async (userId: string) => {
    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      const response = await PaymentService.getUserPaymentHistory(userId);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch payment history');
      }

      setState((prev) => ({ ...prev, isProcessing: false, error: null }));
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment history';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isProcessing: false,
      }));
      throw error;
    }
  }, []);

  const fetchPaymentStats = useCallback(async () => {
    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      const response = await PaymentService.getPaymentStats();

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch payment stats');
      }

      setState((prev) => ({ ...prev, isProcessing: false, error: null }));
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment stats';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isProcessing: false,
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    createPaymentIntent,
    confirmPayment,
    refundPayment,
    resetPayment,
    fetchPaymentHistory,
    fetchPaymentStats,
  };
};

export default usePayment;
