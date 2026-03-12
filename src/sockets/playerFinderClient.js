/**
 * Player Finder Real-Time Availability Client
 *
 * Client-side WebSocket implementation for real-time player availability,
 * location updates, and live player discovery.
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import io from 'socket.io-client';

// Initialize socket connection to player finder namespace
const socket = io('http://localhost:5000/player-finder', {
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
  console.log('Connected to player finder availability service');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from player finder');
});

// ============================================================================
// RECEIVING REAL-TIME UPDATES - MATCH REQUESTS
// ============================================================================

/**
 * Receive incoming match request
 * Received when: Another player sends you a match request
 */
socket.on('match:request:sent', (data) => {
  const {
    request_id,
    sender_id,
    sender_name,
    sender_photo_url,
    sender_skill_level,
    match_type,
    message,
    sent_at,
  } = data;

  console.log(`Match request from ${sender_name} (${sender_skill_level})`);

  // Add to incoming requests UI
  addIncomingMatchRequest({
    request_id,
    sender_id,
    sender_name,
    sender_photo_url,
    sender_skill_level,
    match_type,
    message,
    sent_at,
  });
});

/**
 * Receive match request accepted
 * Received when: Player accepts your match request
 */
socket.on('match:request:accepted', (data) => {
  const { request_id, recipient_id, recipient_name, recipient_photo_url, accepted_at } = data;

  console.log(`Match request accepted by ${recipient_name}`);
  showNotification(`${recipient_name} accepted your match request!`);

  // Update UI - remove pending request and add to matched
  updateRequestStatus(request_id, 'accepted');
  addMatchedPlayer({
    player_id: recipient_id,
    player_name: recipient_name,
    photo_url: recipient_photo_url,
    matched_at: accepted_at,
  });
});

/**
 * Receive match request rejected
 * Received when: Player rejects your match request
 */
socket.on('match:request:rejected', (data) => {
  const { request_id, recipient_id, reason, rejected_at } = data;

  console.log(`Match request rejected with reason: ${reason}`);
  showNotification('Match request was declined');

  // Update UI - remove pending request
  updateRequestStatus(request_id, 'rejected');
});

/**
 * Receive request expired notification
 * Received when: Match request expires after 5 minutes
 */
socket.on('match:request:expired', (data) => {
  const { request_id, sender_name, expired_at } = data;

  console.log(`Match request from ${sender_name} has expired`);

  // Update UI - remove expired request
  updateRequestStatus(request_id, 'expired');
});

/**
 * Confirmation that your match request was sent
 * Received when: Your sent request is confirmed by server
 */
socket.on('match:request:confirmed', (data) => {
  const { request_id, recipient_id, sent_at } = data;

  console.log(`Match request sent successfully to player ${recipient_id}`);
  showNotification('Match request sent!');

  // Add to pending requests UI
  addPendingMatchRequest({
    request_id,
    recipient_id,
    sent_at,
  });
});

/**
 * Confirmation that you accepted match request
 * Received when: Your acceptance is confirmed by server
 */
socket.on('match:request:accepted:confirmed', (data) => {
  const { request_id, sender_id, accepted_at } = data;

  console.log(`You accepted match request from player ${sender_id}`);
  showNotification('Match request accepted!');
});

/**
 * Confirmation that you rejected match request
 * Received when: Your rejection is confirmed by server
 */
socket.on('match:request:rejected:confirmed', (data) => {
  const { request_id, rejected_at } = data;

  console.log('Match request rejected');
});

// ============================================================================
// RECEIVING REAL-TIME UPDATES - PLAYER AVAILABILITY
// ============================================================================

/**
 * Receive confirmation that player is marked available
 * Received when: Player successfully marks themselves available
 */
socket.on('player:available:confirmed', (data) => {
  const { player_id, latitude, longitude, availability_radius, nearby_players, timestamp } = data;

  console.log(`You are now available! ${nearby_players} players nearby.`);

  // Update UI to show available status
  updateAvailabilityStatus('available');
  updateNearbyPlayerCount(nearby_players);
  showNotification(
    `Available to play! ${nearby_players} players nearby within ${availability_radius}km`,
  );
});

/**
 * Another player came online and is available
 * Received when: A nearby player marks themselves as available
 */
socket.on('player:available', (data) => {
  const {
    player_id,
    player_name,
    latitude,
    longitude,
    skill_level,
    match_type,
    distance_km,
    photo_url,
    available_since,
  } = data;

  console.log(`${player_name} is now available ${distance_km}km away`);

  // Add to available players list
  addAvailablePlayer({
    id: player_id,
    name: player_name,
    distance: distance_km,
    skillLevel: skill_level,
    matchType: match_type,
    photoUrl: photo_url,
    availableSince: available_since,
  });

  // Show notification
  showNotification(`${player_name} is now available ${distance_km}km away!`);
});

/**
 * Player went offline or marked unavailable
 * Received when: A player disconnects or marks themselves unavailable
 */
socket.on('player:unavailable', (data) => {
  const { player_id, reason, timestamp } = data;

  console.log(`Player ${player_id} is no longer available`);

  // Remove from available players list
  removeAvailablePlayer(player_id);
});

/**
 * Player location has been updated
 * Received when: An available player updates their location
 */
socket.on('player:location:update', (data) => {
  const { player_id, latitude, longitude, distance_km, accuracy_m, timestamp } = data;

  console.log(`${player_id} moved to ${distance_km}km away`);

  // Update player position on map
  updatePlayerLocation(player_id, {
    latitude,
    longitude,
    distance: distance_km,
    accuracy: accuracy_m,
  });
});

/**
 * Confirmation that location update was processed
 * Received when: Your location update is confirmed
 */
socket.on('player:location:update:confirmed', (data) => {
  const { player_id, latitude, longitude, distance_moved_km, nearby_players_updated, timestamp } =
    data;

  console.log(`Location updated. ${nearby_players_updated} players notified of your movement.`);
});

/**
 * List of nearby available players
 * Received when: Requesting nearby players
 */
socket.on('player:nearby:list', (data) => {
  const { player_id, search_location, search_radius_km, nearby_players, timestamp } = data;

  console.log(`Found ${nearby_players.length} players within ${search_radius_km}km`);

  // Display nearby players
  displayNearbyPlayers(nearby_players);
});

/**
 * Error event
 * Received when: An error occurs
 */
socket.on('error', (error) => {
  const { code, message, details } = error;

  console.error(`${code}: ${message}`, details);
  showError(`Error: ${message}`);
});

// ============================================================================
// SENDING AVAILABILITY UPDATES
// ============================================================================

/**
 * Mark yourself as available to play now
 * @param {Object} data - Location and availability data
 */
export function markAsAvailable(data) {
  const { latitude, longitude, skillLevel, matchType, availabilityRadius } = data;

  socket.emit('player:available', {
    latitude,
    longitude,
    skill_level: skillLevel,
    match_type: matchType || 'all',
    availability_radius: availabilityRadius || 50,
  });
}

/**
 * Mark yourself as no longer available
 */
export function markAsUnavailable() {
  socket.emit('player:unavailable', {});
}

/**
 * Update your location while available
 * @param {Object} coordinates - New latitude and longitude
 * @param {number} accuracy - Location accuracy in meters (optional)
 */
export function updateLocation(coordinates, accuracy = null) {
  const { latitude, longitude } = coordinates;

  socket.emit('player:location:update', {
    latitude,
    longitude,
    accuracy,
  });
}

/**
 * Request list of nearby available players
 * @param {Object} coordinates - Search center location
 * @param {number} radius - Search radius in km
 */
export function requestNearbyPlayers(coordinates, radius = 50) {
  const { latitude, longitude } = coordinates;

  socket.emit('player:nearby:request', {
    latitude,
    longitude,
    radius,
  });
}

// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================

/**
 * Update availability status display
 */
function updateAvailabilityStatus(status) {
  const statusEl = document.getElementById('availability-status');
  if (statusEl) {
    statusEl.textContent = status === 'available' ? '🟢 Available' : '⚫ Unavailable';
    statusEl.className = `status-${status}`;
  }
}

/**
 * Update nearby player count
 */
function updateNearbyPlayerCount(count) {
  const countEl = document.getElementById('nearby-player-count');
  if (countEl) {
    countEl.textContent = `${count} player${count !== 1 ? 's' : ''} nearby`;
  }
}

/**
 * Add player to available players list
 */
function addAvailablePlayer(player) {
  const listEl = document.getElementById('available-players-list');
  if (!listEl) return;

  const playerEl = document.createElement('div');
  playerEl.id = `player-${player.id}`;
  playerEl.className = 'available-player-card';

  playerEl.innerHTML = `
    <div class="player-info">
      <img src="${player.photoUrl || '/default-avatar.png'}" alt="${player.name}" class="player-photo">
      <div class="player-details">
        <h4>${player.name}</h4>
        <p class="distance">📍 ${player.distance.toFixed(2)} km away</p>
        <p class="skill-level">🎯 ${player.skillLevel}</p>
        <p class="match-type">${player.matchType}</p>
      </div>
    </div>
    <button onclick="contactPlayer('${player.id}')" class="contact-btn">Let's Play!</button>
  `;

  listEl.appendChild(playerEl);
}

/**
 * Remove player from available players list
 */
function removeAvailablePlayer(playerId) {
  const playerEl = document.getElementById(`player-${playerId}`);
  if (playerEl) {
    playerEl.remove();
  }
}

/**
 * Update player location on map
 */
function updatePlayerLocation(playerId, location) {
  const playerEl = document.getElementById(`player-${playerId}`);
  if (playerEl) {
    const distanceEl = playerEl.querySelector('.distance');
    if (distanceEl) {
      distanceEl.textContent = `📍 ${location.distance.toFixed(2)} km away`;
    }
  }
}

/**
 * Display nearby players
 */
function displayNearbyPlayers(players) {
  const listEl = document.getElementById('nearby-players-search');
  if (!listEl) return;

  listEl.innerHTML = '';

  if (players.length === 0) {
    listEl.innerHTML = '<p class="no-players">No players found nearby</p>';
    return;
  }

  players.forEach((player) => {
    const playerEl = document.createElement('div');
    playerEl.className = 'nearby-player-item';

    playerEl.innerHTML = `
      <div class="player-header">
        <img src="${player.photo_url || '/default-avatar.png'}" alt="${player.player_name}">
        <div>
          <h5>${player.player_name}</h5>
          <span class="distance">${player.distance_km.toFixed(2)} km</span>
        </div>
      </div>
      <div class="player-info">
        <span class="skill">${player.skill_level}</span>
        <span class="match-type">${player.match_type}</span>
      </div>
      <button onclick="sendMatchRequest('${player.player_id}')" class="match-btn">Match</button>
    `;

    listEl.appendChild(playerEl);
  });
}

/**
 * Show notification to user
 */
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification notification-info';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 4000);
}

/**
 * Show error message
 */
function showError(message) {
  const error = document.createElement('div');
  error.className = 'notification notification-error';
  error.textContent = message;
  document.body.appendChild(error);

  setTimeout(() => error.remove(), 5000);
}

/**
 * Send match request to player
 */
window.sendMatchRequest = function (playerId, matchType = 'singles', message = '') {
  if (!socket.connected) {
    showError('Not connected to match service');
    return;
  }

  socket.emit('match:request:sent', {
    recipient_id: parseInt(playerId),
    match_type: matchType,
    message: message,
  });
};

/**
 * Accept incoming match request
 */
window.acceptMatchRequest = function (requestId) {
  if (!socket.connected) {
    showError('Not connected to match service');
    return;
  }

  socket.emit('match:request:accepted', {
    request_id: requestId,
  });
};

/**
 * Reject incoming match request
 */
window.rejectMatchRequest = function (requestId, reason = '') {
  if (!socket.connected) {
    showError('Not connected to match service');
    return;
  }

  socket.emit('match:request:rejected', {
    request_id: requestId,
    reason: reason,
  });
};

// ============================================================================
// UI HELPER FUNCTIONS FOR MATCH REQUESTS
// ============================================================================

/**
 * Add incoming match request to UI
 */
function addIncomingMatchRequest(request) {
  const listContainer = document.getElementById('incoming-match-requests');
  if (!listContainer) return;

  const requestCard = document.createElement('div');
  requestCard.className = 'match-request-card incoming';
  requestCard.id = `request-${request.request_id}`;
  requestCard.innerHTML = `
    <div class="match-request-header">
      <img src="${request.sender_photo_url || '/default-avatar.png'}" alt="${request.sender_name}" class="player-photo" />
      <div class="player-info">
        <h4>${request.sender_name}</h4>
        <p>Skill: ${request.sender_skill_level} • Match: ${request.match_type}</p>
      </div>
    </div>
    ${request.message ? `<p class="request-message">${request.message}</p>` : ''}
    <div class="request-actions">
      <button onclick="acceptMatchRequest('${request.request_id}')" class="btn-accept">Accept</button>
      <button onclick="rejectMatchRequest('${request.request_id}', 'Not interested')" class="btn-reject">Decline</button>
    </div>
  `;
  listContainer.appendChild(requestCard);
}

/**
 * Add pending match request to UI
 */
function addPendingMatchRequest(request) {
  const listContainer = document.getElementById('pending-match-requests');
  if (!listContainer) return;

  const requestCard = document.createElement('div');
  requestCard.className = 'match-request-card pending';
  requestCard.id = `pending-${request.request_id}`;
  requestCard.innerHTML = `
    <p>Waiting for response...</p>
  `;
  listContainer.appendChild(requestCard);
}

/**
 * Update request status in UI
 */
function updateRequestStatus(requestId, status) {
  const element = document.getElementById(`request-${requestId}`);
  if (element) {
    element.classList.add(`status-${status}`);
    if (status !== 'accepted') {
      element.remove();
    }
  }

  const pendingElement = document.getElementById(`pending-${requestId}`);
  if (pendingElement) {
    pendingElement.remove();
  }
}

/**
 * Add matched player to UI
 */
function addMatchedPlayer(player) {
  const listContainer = document.getElementById('matched-players');
  if (!listContainer) return;

  const playerCard = document.createElement('div');
  playerCard.className = 'matched-player-card';
  playerCard.id = `matched-${player.player_id}`;
  playerCard.innerHTML = `
    <img src="${player.photo_url || '/default-avatar.png'}" alt="${player.player_name}" />
    <h4>${player.player_name}</h4>
    <p>Matched!</p>
  `;
  listContainer.appendChild(playerCard);
}

// ============================================================================
// EXPORT
// ============================================================================

export { socket, markAsAvailable, markAsUnavailable, updateLocation, requestNearbyPlayers };
