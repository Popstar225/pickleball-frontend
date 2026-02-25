/**
 * Court Reservation Live Updates Client
 *
 * Client-side WebSocket implementation for real-time court reservation updates,
 * preventing double bookings and keeping all users in sync.
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import io from 'socket.io-client';

// Initialize socket connection to reservations namespace
const socket = io('http://localhost:5000/reservations', {
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
  console.log('Connected to reservation service');
});

socket.on('connect_error', (error) => {
  console.error('Reservation connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from reservation service');
});

// ============================================================================
// COURT SUBSCRIPTION EVENTS
// ============================================================================

/**
 * Receive confirmation of court subscription
 */
socket.on('court:subscribed', (data) => {
  const { court_id, timestamp } = data;
  console.log(`Subscribed to court ${court_id} updates`);
});

// ============================================================================
// RECEIVING REAL-TIME UPDATES - RESERVATIONS
// ============================================================================

/**
 * Receive new reservation notification
 * Received when: New reservation is created for a court you're viewing
 */
socket.on('reservation:created', (data) => {
  const {
    reservation_id,
    court_id,
    user_id,
    user_name,
    user_photo_url,
    start_time,
    end_time,
    match_type,
    status,
    created_at,
  } = data;

  console.log(`New reservation created by ${user_name}`);

  // Update calendar/availability view
  addReservationToCalendar({
    id: reservation_id,
    court_id,
    user_name,
    user_photo_url,
    start_time,
    end_time,
    match_type,
    status,
    created_at,
  });

  // Show notification
  showNotification(`${user_name} booked the court`);

  // Disable conflicting time slots
  updateCourtAvailability(court_id);
});

/**
 * Receive reservation update/reschedule notification
 * Received when: Reservation is rescheduled
 */
socket.on('reservation:updated', (data) => {
  const {
    reservation_id,
    court_id,
    previous_start_time,
    previous_end_time,
    new_start_time,
    new_end_time,
    match_type,
    status,
    updated_at,
  } = data;

  console.log(`Reservation ${reservation_id} rescheduled`);

  // Remove old time slot
  removeReservationFromCalendar(reservation_id);

  // Add updated time slot
  addReservationToCalendar({
    id: reservation_id,
    court_id,
    start_time: new_start_time,
    end_time: new_end_time,
    match_type,
    status,
  });

  // Show notification
  showNotification('Reservation rescheduled');

  // Update availability
  updateCourtAvailability(court_id);
});

/**
 * Receive reservation cancellation notification
 * Received when: Reservation is cancelled
 */
socket.on('reservation:cancelled', (data) => {
  const { reservation_id, court_id, user_name, start_time, end_time, reason, cancelled_at } = data;

  console.log(`Reservation ${reservation_id} cancelled by ${user_name}`);

  // Remove from calendar
  removeReservationFromCalendar(reservation_id);

  // Show notification
  showNotification(`${user_name}'s reservation cancelled`);

  // Update availability - time slot now available
  updateCourtAvailability(court_id);
});

/**
 * Receive court timeslot blocked notification
 * Received when: Court time is blocked (maintenance, etc.)
 */
socket.on('court:timeslot:blocked', (data) => {
  const { court_id, start_time, end_time, reason, blocked_by, blocked_at } = data;

  console.log(`Court ${court_id} blocked from ${start_time} to ${end_time}`);

  // Mark time slot as unavailable
  addBlockedTimeSlot({
    court_id,
    start_time,
    end_time,
    reason,
    blocked_by,
  });

  // Show notification
  showNotification(`Court blocked: ${reason}`);

  // Disable booking options for blocked time
  updateCourtAvailability(court_id);
});

/**
 * Receive court availability response
 */
socket.on('court:availability', (data) => {
  const { court_id, date, reservations, timestamp } = data;

  console.log(`Received availability for court ${court_id} on ${date}`);

  // Update UI with current reservations
  updateCalendarWithReservations(court_id, date, reservations);
});

/**
 * Receive error events
 */
socket.on('error', (data) => {
  const { code, message, details } = data;

  console.error(`Reservation error [${code}]: ${message}`, details);
  showError(message);
});

// ============================================================================
// EMIT FUNCTIONS - COURT SUBSCRIPTION
// ============================================================================

/**
 * Subscribe to court updates
 */
export function subscribeToCourtUpdates(courtId) {
  if (!socket.connected) {
    showError('Not connected to reservation service');
    return;
  }

  socket.emit('court:subscribe', {
    court_id: courtId,
  });
}

/**
 * Unsubscribe from court updates
 */
export function unsubscribeFromCourtUpdates(courtId) {
  if (!socket.connected) {
    console.warn('Not connected to reservation service');
    return;
  }

  socket.emit('court:unsubscribe', {
    court_id: courtId,
  });
}

/**
 * Request current court availability
 */
export function requestCourtAvailability(courtId, date) {
  if (!socket.connected) {
    showError('Not connected to reservation service');
    return;
  }

  socket.emit('court:availability:request', {
    court_id: courtId,
    date,
  });
}

// ============================================================================
// EMIT FUNCTIONS - BROADCAST EVENTS (FROM API)
// ============================================================================

/**
 * Broadcast reservation created event
 * Called by API after creating reservation
 */
export function broadcastReservationCreated(data) {
  if (!socket.connected) {
    console.warn('Not connected to broadcast');
    return;
  }

  socket.emit('reservation:created', data);
}

/**
 * Broadcast reservation updated event
 * Called by API after rescheduling reservation
 */
export function broadcastReservationUpdated(data) {
  if (!socket.connected) {
    console.warn('Not connected to broadcast');
    return;
  }

  socket.emit('reservation:updated', data);
}

/**
 * Broadcast reservation cancelled event
 * Called by API after cancelling reservation
 */
export function broadcastReservationCancelled(data) {
  if (!socket.connected) {
    console.warn('Not connected to broadcast');
    return;
  }

  socket.emit('reservation:cancelled', data);
}

/**
 * Broadcast court timeslot blocked event
 * Called by API after blocking court time
 */
export function broadcastCourtBlocked(data) {
  if (!socket.connected) {
    console.warn('Not connected to broadcast');
    return;
  }

  socket.emit('court:timeslot:blocked', data);
}

// ============================================================================
// WINDOW FUNCTIONS - USER-FACING
// ============================================================================

/**
 * Subscribe to court (window function)
 */
window.watchCourt = function (courtId) {
  if (!socket.connected) {
    showError('Not connected to reservation service');
    return;
  }

  socket.emit('court:subscribe', {
    court_id: courtId,
  });
};

/**
 * Unsubscribe from court (window function)
 */
window.stopWatchingCourt = function (courtId) {
  if (!socket.connected) {
    return;
  }

  socket.emit('court:unsubscribe', {
    court_id: courtId,
  });
};

/**
 * Get court availability (window function)
 */
window.checkCourtAvailability = function (courtId, date) {
  if (!socket.connected) {
    showError('Not connected to reservation service');
    return;
  }

  socket.emit('court:availability:request', {
    court_id: courtId,
    date,
  });
};

// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================

/**
 * Add reservation to calendar view
 */
function addReservationToCalendar(reservation) {
  const calendarContainer = document.getElementById(`court-calendar-${reservation.court_id}`);
  if (!calendarContainer) return;

  const timeSlot = document.createElement('div');
  timeSlot.className = `reservation ${reservation.status}`;
  timeSlot.id = `reservation-${reservation.id}`;
  timeSlot.innerHTML = `
    <div class="reservation-content">
      ${reservation.user_photo_url ? `<img src="${reservation.user_photo_url}" class="user-avatar" alt="${reservation.user_name}" />` : ''}
      <div class="reservation-info">
        <h4>${escapeHtml(reservation.user_name)}</h4>
        <p class="match-type">${reservation.match_type || 'Unknown'}</p>
        <p class="time-range">
          ${new Date(reservation.start_time).toLocaleTimeString()} - 
          ${new Date(reservation.end_time).toLocaleTimeString()}
        </p>
      </div>
    </div>
  `;

  calendarContainer.appendChild(timeSlot);
}

/**
 * Remove reservation from calendar
 */
function removeReservationFromCalendar(reservationId) {
  const element = document.getElementById(`reservation-${reservationId}`);
  if (element) {
    element.remove();
  }
}

/**
 * Add blocked time slot to calendar
 */
function addBlockedTimeSlot(block) {
  const calendarContainer = document.getElementById(`court-calendar-${block.court_id}`);
  if (!calendarContainer) return;

  const blockElement = document.createElement('div');
  blockElement.className = 'blocked-slot maintenance';
  blockElement.id = `blocked-${block.start_time}`;
  blockElement.innerHTML = `
    <div class="block-content">
      <h4>Blocked</h4>
      <p>${escapeHtml(block.reason)}</p>
      <small>By ${escapeHtml(block.blocked_by)}</small>
    </div>
  `;

  calendarContainer.appendChild(blockElement);
}

/**
 * Update court availability display
 */
function updateCourtAvailability(courtId) {
  const courtElement = document.getElementById(`court-${courtId}`);
  if (!courtElement) return;

  const availabilityIndicator = courtElement.querySelector('.availability-indicator');
  if (availabilityIndicator) {
    availabilityIndicator.classList.add('refreshing');
    setTimeout(() => availabilityIndicator.classList.remove('refreshing'), 500);
  }
}

/**
 * Update calendar with reservation list
 */
function updateCalendarWithReservations(courtId, date, reservations) {
  const calendarContainer = document.getElementById(`court-calendar-${courtId}`);
  if (!calendarContainer) return;

  // Clear existing reservations
  calendarContainer.querySelectorAll('.reservation').forEach((el) => el.remove());

  // Add all reservations
  reservations.forEach((res) => {
    addReservationToCalendar({
      id: res.reservation_id,
      court_id: courtId,
      start_time: res.start_time,
      end_time: res.end_time,
      match_type: res.match_type,
      status: res.status,
    });
  });
}

/**
 * Show notification toast
 */
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification success';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 5000);
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
  subscribeToCourtUpdates,
  unsubscribeFromCourtUpdates,
  requestCourtAvailability,
  broadcastReservationCreated,
  broadcastReservationUpdated,
  broadcastReservationCancelled,
  broadcastCourtBlocked,
};
