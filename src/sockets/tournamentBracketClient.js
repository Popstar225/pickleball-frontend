/**
 * Live Tournament Bracket Socket Implementation
 *
 * Client-side example implementation for real-time tournament bracket updates
 * using Socket.IO WebSocket connections.
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

// ============================================================================
// CONNECTION SETUP
// ============================================================================

import io from 'socket.io-client';

// Initialize socket connection to tournament bracket namespace
const socket = io('http://localhost:5000/tournament-bracket', {
  auth: {
    token: localStorage.getItem('authToken'), // JWT token from authentication
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

/**
 * Handle successful connection
 */
socket.on('connect', () => {
  console.log('Connected to live tournament bracket');
  // Subscribe to a tournament
  const tournamentId = 123; // From URL params
  socket.emit('join-tournament', tournamentId);
});

/**
 * Handle connection error
 */
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Show error message to user
});

/**
 * Handle disconnection
 */
socket.on('disconnect', () => {
  console.log('Disconnected from live tournament bracket');
  // Update UI to show disconnected state
});

// ============================================================================
// RECEIVING REAL-TIME UPDATES
// ============================================================================

/**
 * Bracket loaded - Initial bracket data when joining tournament
 * Received when: User joins a tournament bracket room
 */
socket.on('bracket-loaded', (data) => {
  const {
    tournament_id,
    bracket: { tournament_name, status, format, rounds, total_rounds },
    timestamp,
  } = data;

  console.log(`Bracket loaded for ${tournament_name}`);

  // Render bracket with rounds
  renderBracket(rounds);

  // Update tournament status display
  updateTournamentStatus(status);
});

/**
 * Bracket updated - Current bracket state on demand
 * Received when: Client requests manual refresh
 */
socket.on('bracket-updated', (data) => {
  const { tournament_id, bracket } = data;
  renderBracket(bracket.rounds);
});

/**
 * Match score updated - New match result
 * Received when: Match scores are submitted
 */
socket.on('match-score-updated', (data) => {
  const { match_id, player1_score, player2_score, winner_id, status, updated_at, updated_by } =
    data;

  console.log(`Match ${match_id}: ${player1_score}-${player2_score}, Winner: ${winner_id}`);

  // Update specific match in bracket UI
  updateMatchScore(match_id, player1_score, player2_score, winner_id);

  // Show notification
  showNotification(`Match result updated: ${player1_score}-${player2_score}`);
});

/**
 * Round advanced - Matches progressed to next round
 * Received when: All matches in current round completed
 */
socket.on('round-advanced', (data) => {
  const { tournament_id, new_round, matches_advanced, matches_created, timestamp } = data;

  console.log(`Round ${new_round} started with ${matches_created} new matches`);

  // Refresh entire bracket
  socket.emit('request-bracket-update', tournament_id);

  // Show notification
  showNotification(`Round ${new_round} has begun!`);
});

/**
 * Tournament status changed
 * Received when: Tournament status is updated (scheduled → in_progress → completed)
 */
socket.on('tournament-status-changed', (data) => {
  const { tournament_id, new_status, updated_at, updated_by } = data;

  console.log(`Tournament status: ${new_status}`);

  // Update tournament status display
  updateTournamentStatus(new_status);

  // Show notification
  showNotification(`Tournament is now ${new_status}`);

  // Update UI based on status
  if (new_status === 'completed') {
    disableBracketEditing();
    showFinalResults();
  }
});

/**
 * Bye assigned to match
 * Received when: Player receives bye (advances automatically)
 */
socket.on('bye-assigned', (data) => {
  const { match_id, winner_id, assigned_at, assigned_by } = data;

  console.log(`Bye assigned to match ${match_id}`);

  // Update match to show bye
  updateMatchBye(match_id, winner_id);

  // Show notification
  showNotification('Bye assigned to match');
});

/**
 * User joined tournament viewing
 * Received when: Another user joins the same tournament
 */
socket.on('user-joined', (data) => {
  const { user_id, active_users, timestamp } = data;

  console.log(`Active viewers: ${active_users}`);

  // Update active user count
  updateActiveUserCount(active_users);
});

/**
 * User left tournament viewing
 * Received when: A user disconnects from the tournament
 */
socket.on('user-left', (data) => {
  const { user_id, active_users, timestamp } = data;

  // Update active user count
  updateActiveUserCount(active_users);
});

/**
 * Error occurred
 * Received when: Any error happens on the server
 */
socket.on('error', (error) => {
  const { code, message, details } = error;

  console.error(`${code}: ${message}`, details);

  // Show error message to user
  showError(`Error: ${message}`);
});

// ============================================================================
// SENDING UPDATES (OPERATOR/REFEREE ACTIONS)
// ============================================================================

/**
 * Update match score
 * Called by: Match referee/operator
 * Required permissions: Tournament organizer or admin
 */
function submitMatchScore(tournamentId, matchId, player1Score, player2Score, winnerId) {
  socket.emit('update-match-score', {
    tournament_id: tournamentId,
    match_id: matchId,
    player1_score: player1Score,
    player2_score: player2Score,
    winner_id: winnerId,
  });
}

/**
 * Advance matches to next round
 * Called by: Tournament operator
 * Required permissions: Tournament organizer or admin
 */
function advanceMatches(tournamentId) {
  socket.emit('advance-matches', tournamentId);
}

/**
 * Update tournament status
 * Called by: Tournament organizer
 * Required permissions: Tournament organizer or admin
 * Valid statuses: 'scheduled', 'in_progress', 'completed', 'cancelled'
 */
function updateTournamentStatusSocket(tournamentId, newStatus) {
  socket.emit('update-tournament-status', {
    tournament_id: tournamentId,
    status: newStatus,
  });
}

/**
 * Assign bye to a player
 * Called by: Tournament operator
 * Required permissions: Tournament organizer or admin
 */
function assignBye(tournamentId, matchId, winnerId) {
  socket.emit('assign-bye', {
    tournament_id: tournamentId,
    match_id: matchId,
    winner_id: winnerId,
  });
}

/**
 * Request current bracket state
 * Called by: Client (for manual refresh)
 */
function refreshBracket(tournamentId) {
  socket.emit('request-bracket-update', tournamentId);
}

/**
 * Leave tournament
 * Called by: Client when navigating away
 */
function leaveTournament(tournamentId) {
  socket.emit('leave-tournament', tournamentId);
  socket.disconnect();
}

// ============================================================================
// UI HELPER FUNCTIONS (Example implementations)
// ============================================================================

/**
 * Render bracket with all rounds
 */
function renderBracket(rounds) {
  const bracketContainer = document.getElementById('tournament-bracket');
  bracketContainer.innerHTML = '';

  Object.keys(rounds)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((roundNum) => {
      const roundDiv = document.createElement('div');
      roundDiv.className = 'round';
      roundDiv.innerHTML = `<h3>Round ${roundNum}</h3>`;

      rounds[roundNum].forEach((match) => {
        const matchDiv = document.createElement('div');
        matchDiv.id = `match-${match.id}`;
        matchDiv.className = 'match';

        if (match.is_bye) {
          matchDiv.innerHTML = `
            <div class="bye-match">
              <span class="player-name">${match.player1?.full_name}</span>
              <span class="bye-badge">BYE</span>
            </div>
          `;
        } else if (match.status === 'completed') {
          matchDiv.innerHTML = `
            <div class="match-result">
              <span class="player ${match.winner_id === match.player1?.id ? 'winner' : ''}">
                ${match.player1?.full_name}: ${match.player1_score}
              </span>
              <span class="vs">vs</span>
              <span class="player ${match.winner_id === match.player2?.id ? 'winner' : ''}">
                ${match.player2?.full_name}: ${match.player2_score}
              </span>
            </div>
          `;
        } else {
          matchDiv.innerHTML = `
            <div class="match-scheduled">
              <span class="player">${match.player1?.full_name}</span>
              <span class="vs">vs</span>
              <span class="player">${match.player2?.full_name}</span>
              <button onclick="openScoreModal('${match.id}')">Enter Score</button>
            </div>
          `;
        }

        roundDiv.appendChild(matchDiv);
      });

      bracketContainer.appendChild(roundDiv);
    });
}

/**
 * Update specific match score in bracket
 */
function updateMatchScore(matchId, score1, score2, winnerId) {
  const matchDiv = document.getElementById(`match-${matchId}`);
  if (matchDiv) {
    // Refresh match display with new scores
    matchDiv.classList.add('updated');
    setTimeout(() => matchDiv.classList.remove('updated'), 1000);
  }
}

/**
 * Update match to show bye
 */
function updateMatchBye(matchId, winnerId) {
  const matchDiv = document.getElementById(`match-${matchId}`);
  if (matchDiv) {
    matchDiv.innerHTML = `<div class="bye-match"><span class="bye-badge">BYE</span></div>`;
  }
}

/**
 * Update tournament status display
 */
function updateTournamentStatus(status) {
  const statusDisplay = document.getElementById('tournament-status');
  if (statusDisplay) {
    statusDisplay.textContent = status.replace('_', ' ').toUpperCase();
    statusDisplay.className = `status-${status}`;
  }
}

/**
 * Update active user count
 */
function updateActiveUserCount(count) {
  const userCountDisplay = document.getElementById('active-users');
  if (userCountDisplay) {
    userCountDisplay.textContent = `${count} viewing`;
  }
}

/**
 * Show notification to user
 */
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

/**
 * Show error message
 */
function showError(message) {
  const error = document.createElement('div');
  error.className = 'error-message';
  error.textContent = message;
  document.body.appendChild(error);
  setTimeout(() => error.remove(), 5000);
}

/**
 * Disable bracket editing when tournament is completed
 */
function disableBracketEditing() {
  const buttons = document.querySelectorAll('button[onclick*="Score"]');
  buttons.forEach((btn) => {
    btn.disabled = true;
  });
}

/**
 * Show final results
 */
function showFinalResults() {
  // Display winner announcement, medals, etc.
  console.log('Tournament completed! Showing final results...');
}

/**
 * Open score entry modal
 */
function openScoreModal(matchId) {
  // Show modal for entering match scores
  console.log(`Opening score modal for match ${matchId}`);
}

// ============================================================================
// EXPORT FOR USE IN OTHER FILES
// ============================================================================

export {
  socket,
  submitMatchScore,
  advanceMatches,
  updateTournamentStatusSocket,
  assignBye,
  refreshBracket,
  leaveTournament,
};
