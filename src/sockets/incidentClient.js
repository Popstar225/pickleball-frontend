/**
 * Court Incident Real-Time Alerts Client
 *
 * Client-side WebSocket implementation for real-time incident reporting and status tracking.
 * Immediately notifies admins and venue owners of severe incidents.
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import io from 'socket.io-client';

// Initialize socket connection to incidents namespace
const socket = io('http://localhost:5000/incidents', {
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
  console.log('Connected to incident alert service');
});

socket.on('connect_error', (error) => {
  console.error('Incident connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from incident alert service');
});

// ============================================================================
// RECEIVING REAL-TIME UPDATES - INCIDENTS
// ============================================================================

/**
 * Receive new incident report notification
 * Received by: Admins, venue owners, and incident reporters
 */
socket.on('incident:reported', (data) => {
  const {
    incident_id,
    court_id,
    court_name,
    incident_type,
    severity,
    description,
    reported_by_id,
    reporter_name,
    reporter_photo_url,
    reporter_email,
    reporter_phone,
    location_details,
    witnesses,
    photos_urls,
    reported_at,
    status,
  } = data;

  console.log(`INCIDENT ALERT: ${severity.toUpperCase()} - ${incident_type}`);

  // Show critical incident alert
  if (['high', 'critical'].includes(severity)) {
    showCriticalAlert({
      title: `CRITICAL: ${incident_type.replace(/_/g, ' ').toUpperCase()}`,
      court: court_name,
      description,
      severity,
      reporter: reporter_name,
      reported_at,
    });
  }

  // Add to incident list
  addIncidentToList({
    id: incident_id,
    court_id,
    court_name,
    incident_type,
    severity,
    description,
    reporter_name,
    reporter_photo_url,
    reporter_email,
    reporter_phone,
    location_details,
    witnesses,
    photos_urls,
    reported_at,
    status,
  });

  // Update dashboard counters
  updateIncidentMetrics(incident_type, severity);

  // Send browser notification if permitted
  sendBrowserNotification(incident_type, description, severity);
});

/**
 * Receive incident status update notification
 * Received when: Incident status changes (in-progress, resolved, etc.)
 */
socket.on('incident:status:updated', (data) => {
  const {
    incident_id,
    court_id,
    previous_status,
    new_status,
    updated_by_id,
    updater_name,
    updater_role,
    resolution_notes,
    action_taken,
    updated_at,
  } = data;

  console.log(`Incident ${incident_id} status: ${previous_status} → ${new_status}`);

  // Update incident in list
  updateIncidentStatus(incident_id, {
    previous_status,
    new_status,
    updated_by: updater_name,
    updated_by_role: updater_role,
    resolution_notes,
    action_taken,
    updated_at,
  });

  // Show status notification
  const statusMessages = {
    'in-progress': `Incident is being addressed by ${updater_name}`,
    resolved: `Incident has been resolved by ${updater_name}`,
    escalated: `Incident escalated for further action`,
  };

  if (statusMessages[new_status]) {
    showStatusNotification(incident_id, statusMessages[new_status]);
  }
});

/**
 * Receive confirmation that incident was reported
 */
socket.on('incident:confirmed', (data) => {
  const { status, message, timestamp } = data;

  console.log('Incident report confirmed');
  showNotification(message, 'success');
});

/**
 * Receive error events
 */
socket.on('error', (data) => {
  const { code, message, details } = data;

  console.error(`Incident error [${code}]: ${message}`, details);
  showError(message);
});

// ============================================================================
// EMIT FUNCTIONS - ROOM MANAGEMENT
// ============================================================================

/**
 * Join admin incidents room
 */
export function joinAdminIncidentRoom() {
  if (!socket.connected) {
    showError('Not connected to incident service');
    return;
  }

  socket.emit('admin:join-incidents', {});
}

/**
 * Join venue incidents room
 */
export function joinVenueIncidentRoom(venueId) {
  if (!socket.connected) {
    showError('Not connected to incident service');
    return;
  }

  socket.emit('venue:join-incidents', {
    venue_id: venueId,
  });
}

/**
 * Join personal incident reporter room
 */
export function joinReporterRoom(reporterId) {
  if (!socket.connected) {
    showError('Not connected to incident service');
    return;
  }

  socket.emit('reporter:join-incidents', {
    reporter_id: reporterId,
  });
}

// ============================================================================
// EMIT FUNCTIONS - BROADCAST EVENTS (FROM API)
// ============================================================================

/**
 * Broadcast incident reported event
 * Called by API after creating incident
 */
export function broadcastIncidentReport(data) {
  if (!socket.connected) {
    console.warn('Not connected to broadcast');
    return;
  }

  socket.emit('incident:reported', data);
}

/**
 * Broadcast incident status update event
 * Called by API after updating incident status
 */
export function broadcastIncidentStatusUpdate(data) {
  if (!socket.connected) {
    console.warn('Not connected to broadcast');
    return;
  }

  socket.emit('incident:status:updated', data);
}

// ============================================================================
// WINDOW FUNCTIONS - USER-FACING
// ============================================================================

/**
 * Watch admin incidents (window function)
 */
window.watchAdminIncidents = function () {
  if (!socket.connected) {
    showError('Not connected to incident service');
    return;
  }

  socket.emit('admin:join-incidents', {});
};

/**
 * Watch venue incidents (window function)
 */
window.watchVenueIncidents = function (venueId) {
  if (!socket.connected) {
    showError('Not connected to incident service');
    return;
  }

  socket.emit('venue:join-incidents', {
    venue_id: venueId,
  });
};

/**
 * Watch my incident reports (window function)
 */
window.watchMyIncidents = function (reporterId) {
  if (!socket.connected) {
    showError('Not connected to incident service');
    return;
  }

  socket.emit('reporter:join-incidents', {
    reporter_id: reporterId,
  });
};

// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================

/**
 * Show critical incident alert
 */
function showCriticalAlert(incident) {
  const alertContainer = document.getElementById('incident-alerts');
  if (!alertContainer) return;

  const alert = document.createElement('div');
  alert.className = `critical-alert severity-${incident.severity}`;
  alert.innerHTML = `
    <div class="alert-header">
      <h2>${escapeHtml(incident.title)}</h2>
      <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <div class="alert-content">
      <p><strong>Court:</strong> ${escapeHtml(incident.court)}</p>
      <p><strong>Reporter:</strong> ${escapeHtml(incident.reporter)}</p>
      <p><strong>Description:</strong> ${escapeHtml(incident.description)}</p>
      <p class="timestamp">${new Date(incident.reported_at).toLocaleString()}</p>
    </div>
    <div class="alert-actions">
      <button class="btn-primary">Acknowledge</button>
      <button class="btn-secondary">View Details</button>
    </div>
  `;

  alertContainer.insertBefore(alert, alertContainer.firstChild);

  // Auto-dismiss after 10 seconds for non-critical
  if (incident.severity !== 'critical') {
    setTimeout(() => alert.remove(), 10000);
  }
}

/**
 * Add incident to list/table
 */
function addIncidentToList(incident) {
  const incidentList = document.getElementById('incident-list');
  if (!incidentList) return;

  const row = document.createElement('div');
  row.className = `incident-row severity-${incident.severity}`;
  row.id = `incident-${incident.id}`;
  row.innerHTML = `
    <div class="incident-type">${escapeHtml(incident.incident_type.replace(/_/g, ' '))}</div>
    <div class="incident-court">${escapeHtml(incident.court_name)}</div>
    <div class="incident-description">${escapeHtml(incident.description.substring(0, 100))}...</div>
    <div class="incident-reporter">
      ${incident.reporter_photo_url ? `<img src="${incident.reporter_photo_url}" class="avatar" alt="${incident.reporter_name}" />` : ''}
      <span>${escapeHtml(incident.reporter_name)}</span>
    </div>
    <div class="incident-severity severity-${incident.severity}">
      ${incident.severity.toUpperCase()}
    </div>
    <div class="incident-time">${new Date(incident.reported_at).toLocaleTimeString()}</div>
    <div class="incident-actions">
      <button onclick="window.viewIncidentDetails('${incident.id}')" class="btn-small">View</button>
      <button onclick="window.updateIncidentStatus('${incident.id}')" class="btn-small">Update</button>
    </div>
  `;

  incidentList.insertBefore(row, incidentList.firstChild);
}

/**
 * Update incident status in list
 */
function updateIncidentStatus(incidentId, update) {
  const incidentRow = document.getElementById(`incident-${incidentId}`);
  if (!incidentRow) return;

  // Update status badge
  const statusBadge = incidentRow.querySelector('.incident-status');
  if (statusBadge) {
    statusBadge.textContent = update.new_status.toUpperCase();
    statusBadge.className = `incident-status status-${update.new_status}`;
  }

  // Add update timestamp
  const timeEl = incidentRow.querySelector('.incident-time');
  if (timeEl) {
    timeEl.innerHTML += `<small>Updated: ${new Date(update.updated_at).toLocaleTimeString()}</small>`;
  }

  // Highlight row to show update
  incidentRow.classList.add('updated');
  setTimeout(() => incidentRow.classList.remove('updated'), 2000);
}

/**
 * Update incident metrics/counters
 */
function updateIncidentMetrics(incidentType, severity) {
  const metrics = {
    total: document.getElementById('incident-count-total'),
    critical: document.getElementById('incident-count-critical'),
    high: document.getElementById('incident-count-high'),
  };

  if (metrics.total) {
    metrics.total.textContent = parseInt(metrics.total.textContent || 0) + 1;
  }

  if (severity === 'critical' && metrics.critical) {
    metrics.critical.textContent = parseInt(metrics.critical.textContent || 0) + 1;
  } else if (severity === 'high' && metrics.high) {
    metrics.high.textContent = parseInt(metrics.high.textContent || 0) + 1;
  }
}

/**
 * Show status notification
 */
function showStatusNotification(incidentId, message) {
  const notification = document.createElement('div');
  notification.className = 'notification info';
  notification.innerHTML = `
    <strong>Incident ${incidentId.substring(0, 8)}...</strong><br>
    ${escapeHtml(message)}
  `;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 5000);
}

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
 * Send browser notification
 */
function sendBrowserNotification(incidentType, description, severity) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const title = `INCIDENT: ${incidentType.replace(/_/g, ' ').toUpperCase()}`;
    const options = {
      body: description.substring(0, 100),
      icon: '/assets/incident-icon.png',
      tag: `incident-${Date.now()}`,
      requireInteraction: ['high', 'critical'].includes(severity),
    };

    new Notification(title, options);
  }
}

/**
 * Request browser notification permission
 */
window.enableIncidentNotifications = function () {
  if (!('Notification' in window)) {
    showError('Browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    showNotification('Notifications already enabled', 'success');
    return;
  }

  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showNotification('Incident notifications enabled', 'success');
      }
    });
  }
};

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
  joinAdminIncidentRoom,
  joinVenueIncidentRoom,
  joinReporterRoom,
  broadcastIncidentReport,
  broadcastIncidentStatusUpdate,
};
