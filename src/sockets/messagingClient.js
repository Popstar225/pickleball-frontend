/**
 * Direct Messaging Real-Time Client
 *
 * Client-side WebSocket implementation for real-time direct messaging,
 * including message delivery, read receipts, typing indicators, and online status.
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import io from 'socket.io-client';

// Initialize socket connection to messaging namespace
const socket = io('http://localhost:5000/messaging', {
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
  console.log('Connected to messaging service');
});

socket.on('connect_error', (error) => {
  console.error('Messaging connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from messaging service');
});

// ============================================================================
// RECEIVING REAL-TIME UPDATES - MESSAGES
// ============================================================================

/**
 * Receive new message
 * Received when: Another user sends you a message
 */
socket.on('message:new', (data) => {
  const {
    message_id,
    sender_id,
    sender_name,
    sender_photo_url,
    recipient_id,
    content,
    subject,
    sent_at,
    status,
  } = data;

  console.log(`New message from ${sender_name}: ${subject}`);

  // Add to messages UI
  addMessageToUI({
    message_id,
    sender_id,
    sender_name,
    sender_photo_url,
    content,
    subject,
    sent_at,
    is_read: false,
    is_from_me: false,
  });

  // Show notification
  showNotification(`New message from ${sender_name}`);

  // Auto-emit delivery confirmation
  socket.emit('message:delivered', {
    message_id,
  });
});

/**
 * Receive confirmation message was sent
 * Received when: Your sent message is confirmed by server
 */
socket.on('message:new:confirmed', (data) => {
  const { message_id, recipient_id, sent_at } = data;

  console.log(`Message ${message_id} sent successfully`);

  // Update UI - mark message as sent
  updateMessageStatus(message_id, 'sent', sent_at);
});

/**
 * Receive message delivered notification
 * Received when: Message was delivered to recipient
 */
socket.on('message:delivered', (data) => {
  const { message_id, delivered_at } = data;

  console.log(`Message ${message_id} delivered at ${delivered_at}`);

  // Update UI - mark message as delivered
  updateMessageStatus(message_id, 'delivered', delivered_at);
});

/**
 * Receive message read notification
 * Received when: Recipient reads your message
 */
socket.on('message:read', (data) => {
  const { message_id, read_at } = data;

  console.log(`Message ${message_id} read at ${read_at}`);

  // Update UI - mark message as read with timestamp
  updateMessageStatus(message_id, 'read', read_at);
  showNotification('Message read');
});

/**
 * Receive confirmation message was read
 * Received when: Your read confirmation is confirmed by server
 */
socket.on('message:read:confirmed', (data) => {
  const { message_id, read_at } = data;

  console.log(`Read receipt confirmed for ${message_id}`);
});

/**
 * Receive typing indicator
 * Received when: Someone is typing a message to you
 */
socket.on('message:typing', (data) => {
  const { user_id, user_name, is_typing, timestamp } = data;

  if (is_typing) {
    console.log(`${user_name} is typing...`);
    showTypingIndicator(user_id, user_name);
  } else {
    console.log(`${user_name} stopped typing`);
    hideTypingIndicator(user_id);
  }
});

// ============================================================================
// RECEIVING REAL-TIME UPDATES - COACH MESSAGING
// ============================================================================

/**
 * Receive coach broadcast message
 * Received when: Coach sends message to group of players
 */
socket.on('coach:message:broadcast', (data) => {
  const { broadcast_id, coach_id, coach_name, coach_photo_url, content, subject, sent_at, type } =
    data;

  console.log(`Received message from coach ${coach_name}: ${subject}`);

  // Add to messages UI
  addCoachMessageToUI({
    broadcast_id,
    coach_id,
    coach_name,
    coach_photo_url,
    content,
    subject,
    sent_at,
    is_read: false,
  });

  // Show notification
  showNotification(`Message from coach ${coach_name}`);

  // Auto-emit delivery confirmation
  socket.emit('coach:message:delivered', {
    broadcast_id,
  });
});

/**
 * Receive confirmation coach message was broadcast
 * Received when: Your coach message broadcast is confirmed by server
 */
socket.on('coach:message:broadcast:confirmed', (data) => {
  const { broadcast_id, player_count, sent_at } = data;

  console.log(`Coach message ${broadcast_id} sent to ${player_count} players`);
  showNotification(`Message sent to ${player_count} players`);

  // Update UI - mark broadcast as confirmed
  updateBroadcastStatus(broadcast_id, 'confirmed', sent_at);
});

/**
 * Receive message delivery confirmation from player
 * Received when: Player confirms receipt of coach message
 */
socket.on('coach:message:delivered', (data) => {
  const { broadcast_id, player_id, delivered_at } = data;

  console.log(`Broadcast ${broadcast_id} delivered to player ${player_id}`);

  // Update UI - increment delivery count
  updateBroadcastDeliveryCount(broadcast_id, player_id, delivered_at);
});

// ============================================================================
// RECEIVING REAL-TIME UPDATES - USER STATUS
// ============================================================================

/**
 * Receive user online notification
 * Received when: User comes online
 */
socket.on('user:online', (data) => {
  const { user_id, timestamp } = data;

  console.log(`User ${user_id} is now online`);

  // Update UI - show user as online
  updateUserOnlineStatus(user_id, true);
});

/**
 * Receive user offline notification
 * Received when: User goes offline
 */
socket.on('user:offline', (data) => {
  const { user_id, last_seen } = data;

  console.log(`User ${user_id} went offline at ${last_seen}`);

  // Update UI - show user as offline
  updateUserOnlineStatus(user_id, false, last_seen);
});

/**
 * Receive user status response
 * Received when: You request a user's online status
 */
socket.on('user:status', (data) => {
  const { user_id, is_online, last_seen, is_typing } = data;

  console.log(`User ${user_id} status: online=${is_online}`);

  // Update UI with user status
  updateUserStatusUI(user_id, {
    is_online,
    last_seen,
    is_typing,
  });
});

/**
 * Receive error events
 */
socket.on('error', (data) => {
  const { code, message, details } = data;

  console.error(`Messaging error [${code}]: ${message}`, details);
  showError(message);
});

// ============================================================================
// EMIT FUNCTIONS - MESSAGES
// ============================================================================

/**
 * Send new message via WebSocket
 */
export function sendMessage(recipientId, content, subject = '') {
  if (!socket.connected) {
    showError('Not connected to messaging service');
    return;
  }

  socket.emit('message:new', {
    recipient_id: recipientId,
    content,
    subject: subject || undefined,
  });
}

/**
 * Mark message as delivered
 */
export function markMessageDelivered(messageId) {
  if (!socket.connected) {
    console.warn('Not connected to messaging service');
    return;
  }

  socket.emit('message:delivered', {
    message_id: messageId,
  });
}

/**
 * Mark message as read
 */
export function markMessageAsRead(messageId) {
  if (!socket.connected) {
    console.warn('Not connected to messaging service');
    return;
  }

  socket.emit('message:read', {
    message_id: messageId,
  });
}

/**
 * Send typing indicator
 */
export function sendTypingIndicator(recipientId, isTyping = true) {
  if (!socket.connected) {
    return;
  }

  socket.emit('message:typing', {
    recipient_id: recipientId,
    is_typing: isTyping,
  });
}

/**
 * Request user's online status
 */
export function requestUserStatus(userId) {
  if (!socket.connected) {
    console.warn('Not connected to messaging service');
    return;
  }

  socket.emit('user:status:request', {
    user_id: userId,
  });
}

/**
 * Broadcast message to players as coach
 */
export function broadcastCoachMessage(playerIds, content, subject = 'Message from your Coach') {
  if (!socket.connected) {
    showError('Not connected to messaging service');
    return;
  }

  socket.emit('coach:message:broadcast', {
    player_ids: playerIds,
    content,
    subject,
  });
}

/**
 * Confirm coach message delivery as player
 */
export function confirmCoachMessageDelivery(broadcastId) {
  if (!socket.connected) {
    console.warn('Not connected to messaging service');
    return;
  }

  socket.emit('coach:message:delivered', {
    broadcast_id: broadcastId,
  });
}

// ============================================================================
// WINDOW FUNCTIONS - USER-FACING
// ============================================================================

/**
 * Send direct message (window function)
 */
window.sendDirectMessage = function (recipientId, content, subject = '') {
  if (!socket.connected) {
    showError('Not connected to messaging service');
    return;
  }

  socket.emit('message:new', {
    recipient_id: recipientId,
    content,
    subject: subject || undefined,
  });
};

/**
 * Mark message as read (window function)
 */
window.markRead = function (messageId) {
  if (!socket.connected) {
    showError('Not connected to messaging service');
    return;
  }

  socket.emit('message:read', {
    message_id: messageId,
  });
};

/**
 * Check if user is online (window function)
 */
window.checkUserStatus = function (userId) {
  if (!socket.connected) {
    showError('Not connected to messaging service');
    return;
  }

  socket.emit('user:status:request', {
    user_id: userId,
  });
};

/**
 * Start typing indicator (window function)
 */
window.startTyping = function (recipientId) {
  if (!socket.connected) {
    return;
  }

  socket.emit('message:typing', {
    recipient_id: recipientId,
    is_typing: true,
  });
};

/**
 * Stop typing indicator (window function)
 */
window.stopTyping = function (recipientId) {
  if (!socket.connected) {
    return;
  }

  socket.emit('message:typing', {
    recipient_id: recipientId,
    is_typing: false,
  });
};

/**
 * Broadcast message as coach (window function)
 */
window.broadcastToPlayers = function (playerIds, content, subject = 'Message from your Coach') {
  if (!socket.connected) {
    showError('Not connected to messaging service');
    return;
  }

  if (!Array.isArray(playerIds) || playerIds.length === 0) {
    showError('Must select at least one player');
    return;
  }

  socket.emit('coach:message:broadcast', {
    player_ids: playerIds,
    content,
    subject,
  });
};

/**
 * Confirm coach message received (window function)
 */
window.confirmCoachMessage = function (broadcastId) {
  if (!socket.connected) {
    return;
  }

  socket.emit('coach:message:delivered', {
    broadcast_id: broadcastId,
  });
};

// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================

/**
 * Add message to UI conversation view
 */
function addMessageToUI(message) {
  const conversationContainer = document.getElementById('message-thread');
  if (!conversationContainer) return;

  const messageElement = document.createElement('div');
  messageElement.className = `message-item ${message.is_from_me ? 'sent' : 'received'}`;
  messageElement.id = `message-${message.message_id}`;
  messageElement.innerHTML = `
    <div class="message-content">
      ${!message.is_from_me ? `<img src="${message.sender_photo_url || '/default-avatar.png'}" class="sender-avatar" />` : ''}
      <div class="message-text">
        <p>${escapeHtml(message.content)}</p>
        <small class="message-time">${new Date(message.sent_at).toLocaleTimeString()}</small>
      </div>
    </div>
  `;

  conversationContainer.appendChild(messageElement);
  conversationContainer.scrollTop = conversationContainer.scrollHeight;
}

/**
 * Update message delivery status
 */
function updateMessageStatus(messageId, status, timestamp) {
  const messageElement = document.getElementById(`message-${messageId}`);
  if (!messageElement) return;

  const statusIndicator = messageElement.querySelector('.message-status');
  if (statusIndicator) {
    statusIndicator.className = `message-status status-${status}`;
    statusIndicator.title = `${status} at ${new Date(timestamp).toLocaleTimeString()}`;
  }
}

/**
 * Show typing indicator
 */
function showTypingIndicator(userId, userName) {
  const typingContainer = document.getElementById('typing-indicators');
  if (!typingContainer) return;

  let typingElement = document.getElementById(`typing-${userId}`);
  if (!typingElement) {
    typingElement = document.createElement('div');
    typingElement.className = 'typing-indicator';
    typingElement.id = `typing-${userId}`;
    typingElement.innerHTML = `<p>${userName} is typing...</p><div class="typing-dots"><span></span><span></span><span></span></div>`;
    typingContainer.appendChild(typingElement);
  }
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator(userId) {
  const typingElement = document.getElementById(`typing-${userId}`);
  if (typingElement) {
    typingElement.remove();
  }
}

/**
 * Update user online status in UI
 */
function updateUserOnlineStatus(userId, isOnline, lastSeen = null) {
  const userElement = document.querySelector(`[data-user-id="${userId}"]`);
  if (!userElement) return;

  const statusIndicator = userElement.querySelector('.online-status');
  if (statusIndicator) {
    statusIndicator.classList.toggle('online', isOnline);
    statusIndicator.classList.toggle('offline', !isOnline);
    statusIndicator.title = isOnline ? 'Online' : `Last seen: ${lastSeen}`;
  }
}

/**
 * Update user status in conversation header
 */
function updateUserStatusUI(userId, status) {
  const statusElement = document.getElementById(`user-status-${userId}`);
  if (!statusElement) return;

  if (status.is_online) {
    statusElement.textContent = 'Online';
    statusElement.className = 'online';
  } else {
    statusElement.textContent = `Last seen ${formatTime(status.last_seen)}`;
    statusElement.className = 'offline';
  }
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
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Format time for display
 */
function formatTime(timestamp) {
  if (!timestamp) return 'unknown';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// UI HELPER FUNCTIONS - COACH MESSAGING
// ============================================================================

/**
 * Add coach message to UI
 */
function addCoachMessageToUI(message) {
  const conversationContainer = document.getElementById('coach-messages');
  if (!conversationContainer) return;

  const messageElement = document.createElement('div');
  messageElement.className = 'coach-message-item received';
  messageElement.id = `coach-message-${message.broadcast_id}`;
  messageElement.innerHTML = `
    <div class="coach-message-content">
      <img src="${message.coach_photo_url || '/default-avatar.png'}" class="coach-avatar" />
      <div class="message-text">
        <h5>${escapeHtml(message.coach_name)}</h5>
        <p class="message-subject">${escapeHtml(message.subject)}</p>
        <p>${escapeHtml(message.content)}</p>
        <small class="message-time">${new Date(message.sent_at).toLocaleTimeString()}</small>
      </div>
    </div>
  `;

  conversationContainer.appendChild(messageElement);
  conversationContainer.scrollTop = conversationContainer.scrollHeight;
}

/**
 * Update coach broadcast status
 */
function updateBroadcastStatus(broadcastId, status, timestamp) {
  const broadcastElement = document.getElementById(`broadcast-${broadcastId}`);
  if (!broadcastElement) return;

  const statusIndicator = broadcastElement.querySelector('.broadcast-status');
  if (statusIndicator) {
    statusIndicator.className = `broadcast-status status-${status}`;
    statusIndicator.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Update delivery count for broadcast
 */
function updateBroadcastDeliveryCount(broadcastId, playerId, deliveredAt) {
  const broadcastElement = document.getElementById(`broadcast-${broadcastId}`);
  if (!broadcastElement) return;

  const deliveryCounter = broadcastElement.querySelector('.delivery-count');
  if (deliveryCounter) {
    const currentCount = parseInt(deliveryCounter.textContent) || 0;
    deliveryCounter.textContent = currentCount + 1;
  }

  // Mark individual player as delivered
  const playerElement = broadcastElement.querySelector(`[data-player-id="${playerId}"]`);
  if (playerElement) {
    playerElement.classList.add('delivered');
  }
}

/**
 * Export
 */
export {
  socket,
  sendMessage,
  markMessageDelivered,
  markMessageAsRead,
  sendTypingIndicator,
  requestUserStatus,
  broadcastCoachMessage,
  confirmCoachMessageDelivery,
};
