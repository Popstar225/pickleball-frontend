/**
 * Payment Status Real-Time Updates Client
 *
 * Client-side WebSocket implementation for real-time payment status notifications.
 * Provides instant confirmation or failure feedback for membership, tournament, and reservation payments.
 * Integrates with Stripe webhooks for seamless payment lifecycle updates.
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import io from 'socket.io-client';

// Initialize socket connection to payments namespace
const socket = io('http://localhost:5000/payments', {
  auth: {
    token: localStorage.getItem('authToken'),
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'],
});

// ============================================================================
// CONNECTION EVENTS
// ============================================================================

socket.on('connect', () => {
  console.log('Connected to payment status service');
  // Auto-subscribe to personal payment updates on connect
  subscribeToPaymentUpdates();
});

socket.on('connect_error', (error) => {
  console.error('Payment connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from payment status service');
});

// ============================================================================
// RECEIVING REAL-TIME UPDATES - PAYMENT STATUS
// ============================================================================

/**
 * Receive payment pending notification
 * Received when: Payment processing initiated at Stripe
 */
socket.on('payment:pending', (data) => {
  const { payment_id, transaction_type, amount, currency, reference_id, message, pending_at } =
    data;

  console.log(`Payment ${payment_id} is pending`);

  // Show loading indicator
  showPaymentPending({
    payment_id,
    transaction_type,
    amount,
    currency,
    message,
  });

  // Update UI state
  updatePaymentUI(payment_id, 'pending', {
    loading: true,
    message: 'Processing your payment...',
  });

  // Store pending payment in local storage for recovery
  storePendingPayment(payment_id, data);
});

/**
 * Receive payment confirmed notification
 * Received when: Stripe webhook confirms successful payment
 */
socket.on('payment:confirmed', (data) => {
  const {
    payment_id,
    transaction_type,
    amount,
    currency,
    message,
    confirmed_at,
    receipt_url,
    membership_type,
    membership_name,
  } = data;

  console.log(`Payment ${payment_id} confirmed!`);

  // Remove from pending
  removePendingPayment(payment_id);

  // Show success notification
  showPaymentSuccess({
    payment_id,
    transaction_type,
    amount,
    currency,
    message,
    receipt_url,
    membership_name,
  });

  // Update UI
  updatePaymentUI(payment_id, 'confirmed', {
    loading: false,
    success: true,
    icon: '✓',
    message: message || 'Payment confirmed successfully!',
  });

  // Update dashboard if applicable
  updateDashboardAfterPayment(transaction_type, 'confirmed');

  // Redirect after success (configurable per transaction type)
  scheduleSuccessRedirect(transaction_type, reference_id);
});

/**
 * Receive payment failed notification
 * Received when: Stripe webhook indicates payment declined/failed
 */
socket.on('payment:failed', (data) => {
  const {
    payment_id,
    transaction_type,
    amount,
    currency,
    failure_reason,
    failure_code,
    stripe_error_message,
    message,
    failed_at,
    retry_enabled,
    user_email,
  } = data;

  console.log(`Payment ${payment_id} failed:`, failure_reason);

  // Remove from pending
  removePendingPayment(payment_id);

  // Show error notification
  showPaymentError({
    payment_id,
    transaction_type,
    amount,
    currency,
    message,
    failure_reason,
    stripe_error_message,
    retry_enabled,
    user_email,
  });

  // Update UI
  updatePaymentUI(payment_id, 'failed', {
    loading: false,
    error: true,
    icon: '✕',
    message: stripe_error_message || message || 'Payment failed. Please try again.',
    retry_enabled,
  });

  // Update dashboard
  updateDashboardAfterPayment(transaction_type, 'failed');
});

/**
 * Receive subscription confirmation
 */
socket.on('payment:subscribed', (data) => {
  const { status, message, timestamp } = data;

  console.log('Subscribed to payment updates');
  // Optional: log subscription
});

/**
 * Receive error events
 */
socket.on('error', (data) => {
  const { code, message, details } = data;

  console.error(`Payment error [${code}]: ${message}`, details);
  showError(message);
});

// ============================================================================
// EMIT FUNCTIONS - SUBSCRIPTION
// ============================================================================

/**
 * Subscribe to personal payment updates
 */
export function subscribeToPaymentUpdates() {
  if (!socket.connected) {
    console.warn('Not connected to payment service');
    return;
  }

  socket.emit('payment:subscribe', {});
}

/**
 * Unsubscribe from payment updates
 */
export function unsubscribeFromPaymentUpdates() {
  if (!socket.connected) {
    return;
  }

  socket.emit('payment:unsubscribe', {});
}

/**
 * Join admin payment monitoring room
 */
export function joinAdminPaymentRoom() {
  if (!socket.connected) {
    console.warn('Not connected to payment service');
    return;
  }

  socket.emit('admin:join-payments', {});
}

// ============================================================================
// EMIT FUNCTIONS - BROADCAST EVENTS (FROM API/WEBHOOKS)
// ============================================================================

/**
 * Broadcast payment pending event
 * Called by API when payment processing starts
 */
export function broadcastPaymentPending(data) {
  if (!socket.connected) {
    console.warn('Not connected to broadcast');
    return;
  }

  socket.emit('payment:pending', data);
}

/**
 * Broadcast payment confirmed event
 * Called by Stripe webhook handler when payment succeeds
 */
export function broadcastPaymentConfirmed(data) {
  if (!socket.connected) {
    console.warn('Not connected to broadcast');
    return;
  }

  socket.emit('payment:confirmed', data);
}

/**
 * Broadcast payment failed event
 * Called by Stripe webhook handler when payment fails
 */
export function broadcastPaymentFailed(data) {
  if (!socket.connected) {
    console.warn('Not connected to broadcast');
    return;
  }

  socket.emit('payment:failed', data);
}

// ============================================================================
// WINDOW FUNCTIONS - USER-FACING
// ============================================================================

/**
 * Watch payment updates (window function)
 */
window.watchPayments = function () {
  if (!socket.connected) {
    showError('Not connected to payment service');
    return;
  }

  socket.emit('payment:subscribe', {});
};

/**
 * Stop watching payments (window function)
 */
window.stopWatchingPayments = function () {
  if (!socket.connected) {
    return;
  }

  socket.emit('payment:unsubscribe', {});
};

/**
 * Watch payment as admin (window function)
 */
window.watchAdminPayments = function () {
  if (!socket.connected) {
    showError('Not connected to payment service');
    return;
  }

  socket.emit('admin:join-payments', {});
};

// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================

/**
 * Show payment pending state
 */
function showPaymentPending(payment) {
  const { payment_id, transaction_type, amount, currency, message } = payment;

  const pendingNotif = document.createElement('div');
  pendingNotif.className = 'payment-notification pending';
  pendingNotif.id = `payment-${payment_id}`;
  pendingNotif.innerHTML = `
    <div class="payment-status">
      <div class="spinner"></div>
      <div class="payment-info">
        <h3>Payment Processing</h3>
        <p>${escapeHtml(message)}</p>
        <p class="amount">${currency} ${(amount / 100).toFixed(2)}</p>
        <p class="type">${transaction_type.toUpperCase()}</p>
      </div>
    </div>
  `;

  document.body.appendChild(pendingNotif);
}

/**
 * Show payment success notification
 */
function showPaymentSuccess(payment) {
  const { payment_id, transaction_type, amount, currency, message, receipt_url, membership_name } =
    payment;

  const successNotif = document.createElement('div');
  successNotif.className = 'payment-notification success';
  successNotif.id = `payment-${payment_id}`;
  successNotif.innerHTML = `
    <div class="payment-status">
      <div class="success-icon">✓</div>
      <div class="payment-info">
        <h3>Payment Successful!</h3>
        <p>${escapeHtml(message)}</p>
        ${membership_name ? `<p class="membership">${escapeHtml(membership_name)}</p>` : ''}
        <p class="amount">${currency} ${(amount / 100).toFixed(2)}</p>
        ${receipt_url ? `<a href="${receipt_url}" target="_blank" class="btn-receipt">View Receipt</a>` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(successNotif);

  // Auto-dismiss after 8 seconds
  setTimeout(() => successNotif.remove(), 8000);
}

/**
 * Show payment error notification
 */
function showPaymentError(payment) {
  const {
    payment_id,
    transaction_type,
    amount,
    currency,
    message,
    failure_reason,
    stripe_error_message,
    retry_enabled,
    user_email,
  } = payment;

  const errorNotif = document.createElement('div');
  errorNotif.className = 'payment-notification error';
  errorNotif.id = `payment-${payment_id}`;
  errorNotif.innerHTML = `
    <div class="payment-status">
      <div class="error-icon">✕</div>
      <div class="payment-info">
        <h3>Payment Failed</h3>
        <p>${escapeHtml(message)}</p>
        <p class="error-reason">${escapeHtml(stripe_error_message || failure_reason)}</p>
        <p class="amount">${currency} ${(amount / 100).toFixed(2)}</p>
        <div class="payment-actions">
          ${
            retry_enabled
              ? `<button onclick="window.retryPayment('${payment_id}')" class="btn-retry">Try Again</button>`
              : ''
          }
          <button onclick="window.contactSupport('${user_email}')" class="btn-support">Contact Support</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(errorNotif);

  // Auto-dismiss after 10 seconds
  setTimeout(() => errorNotif.remove(), 10000);
}

/**
 * Update payment UI element
 */
function updatePaymentUI(paymentId, status, options = {}) {
  const { loading, success, error, icon, message, retry_enabled } = options;

  // Update button state if exists
  const button = document.querySelector(`[data-payment-id="${paymentId}"]`);
  if (button) {
    button.disabled = loading;
    button.classList.remove('loading', 'success', 'error');
    if (loading) button.classList.add('loading');
    if (success) button.classList.add('success');
    if (error) button.classList.add('error');
  }

  // Update display message
  const messageEl = document.getElementById(`payment-message-${paymentId}`);
  if (messageEl && message) {
    messageEl.textContent = message;
    messageEl.className = `payment-message ${status}`;
  }

  // Show/hide retry button
  if (error && retry_enabled) {
    const retryBtn = document.getElementById(`retry-${paymentId}`);
    if (retryBtn) {
      retryBtn.style.display = 'block';
    }
  }
}

/**
 * Store pending payment for recovery if page closes
 */
function storePendingPayment(paymentId, data) {
  const pending = JSON.parse(sessionStorage.getItem('pendingPayments') || '{}');
  pending[paymentId] = {
    ...data,
    timestamp: Date.now(),
  };
  sessionStorage.setItem('pendingPayments', JSON.stringify(pending));
}

/**
 * Remove payment from pending storage
 */
function removePendingPayment(paymentId) {
  const pending = JSON.parse(sessionStorage.getItem('pendingPayments') || '{}');
  delete pending[paymentId];
  sessionStorage.setItem('pendingPayments', JSON.stringify(pending));
}

/**
 * Check for recovered pending payments on page load
 */
window.checkPendingPayments = function () {
  const pending = JSON.parse(sessionStorage.getItem('pendingPayments') || '{}');

  Object.entries(pending).forEach(([paymentId, data]) => {
    const ageMinutes = (Date.now() - data.timestamp) / 60000;

    if (ageMinutes < 30) {
      // Still waiting for confirmation
      showPaymentPending(data);
    } else {
      // Expired, remove
      delete pending[paymentId];
    }
  });

  sessionStorage.setItem('pendingPayments', JSON.stringify(pending));
};

/**
 * Update dashboard after payment
 */
function updateDashboardAfterPayment(transactionType, status) {
  if (status === 'confirmed') {
    if (transactionType === 'membership') {
      // Update membership status on dashboard
      const membershipCard = document.querySelector('.membership-card');
      if (membershipCard) {
        membershipCard.classList.add('active');
      }
    } else if (transactionType === 'tournament') {
      // Update tournament registration
      document.dispatchEvent(new CustomEvent('tournament:registered'));
    } else if (transactionType === 'reservation') {
      // Update court reservation
      document.dispatchEvent(new CustomEvent('reservation:confirmed'));
    }
  }
}

/**
 * Schedule redirect after success payment
 */
function scheduleSuccessRedirect(transactionType, referenceId) {
  const redirectMap = {
    membership: '/dashboard/membership',
    tournament: `/tournaments/${referenceId}/registration-complete`,
    reservation: '/dashboard/reservations',
  };

  const redirectUrl = redirectMap[transactionType];
  if (redirectUrl) {
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 3000);
  }
}

/**
 * Retry failed payment
 */
window.retryPayment = function (paymentId) {
  console.log(`Retrying payment: ${paymentId}`);
  // Dispatch event to trigger re-payment flow
  document.dispatchEvent(new CustomEvent('payment:retry', { detail: { paymentId } }));
};

/**
 * Contact support for payment issue
 */
window.contactSupport = function (userEmail) {
  window.location.href = `/support?email=${encodeURIComponent(userEmail)}&issue=payment`;
};

/**
 * Show regular notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 4000);
}

/**
 * Show error notification
 */
function showError(message) {
  const error = document.createElement('div');
  error.className = 'notification error';
  error.textContent = message;
  document.body.appendChild(error);

  setTimeout(() => error.remove(), 5000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ============================================================================
// EXPORT
// ============================================================================

export {
  socket,
  subscribeToPaymentUpdates,
  unsubscribeFromPaymentUpdates,
  joinAdminPaymentRoom,
  broadcastPaymentPending,
  broadcastPaymentConfirmed,
  broadcastPaymentFailed,
};
