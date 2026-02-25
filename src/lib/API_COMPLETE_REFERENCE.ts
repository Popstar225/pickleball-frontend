/**
 * COMPLETE API ENDPOINTS & PAYLOAD REFERENCE
 * All dashboard APIs with request payloads and response structures
 */

// ============================================================================
// API ENDPOINTS REFERENCE TABLE
// ============================================================================

export const apiEndpoints = {
  // STATE DASHBOARD
  state: {
    profile: {
      GET: '/api/state/profile',
      PUT: '/api/state/profile',
      DELETE: '/api/state/account',
    },
    statistics: {
      GET: '/api/state/statistics',
    },
    activities: {
      GET: '/api/state/activities?limit={limit}&offset={offset}',
    },
    events: {
      GET: '/api/state/events/upcoming?limit={limit}',
      POST: '/api/state/events',
      PUT: '/api/state/events/{eventId}',
      DELETE: '/api/state/events/{eventId}',
    },
    clubs: {
      GET: '/api/state/clubs?limit={limit}&offset={offset}',
    },
    members: {
      GET: '/api/state/members?limit={limit}&offset={offset}&status={status}',
    },
    messages: {
      GET: '/api/state/messages?limit={limit}&offset={offset}',
      POST: '/api/state/messages',
    },
  },

  // PLAYER DASHBOARD
  players: {
    profile: {
      GET: '/api/players/profile',
      PUT: '/api/players/profile',
      DELETE: '/api/players/account',
    },
    credentials: {
      GET: '/api/players/credentials',
      POST: '/api/players/credentials/renew',
    },
    clubs: {
      GET: '/api/players/clubs/search?q={query}&city={city}&limit={limit}&offset={offset}',
      POST: '/api/players/clubs/join',
      GET_MY: '/api/players/clubs/my-clubs',
    },
    tournaments: {
      GET: '/api/players/tournaments',
      POST: '/api/players/tournaments/register',
    },
    messages: {
      GET: '/api/players/messages?limit={limit}&offset={offset}',
      POST: '/api/players/messages',
    },
    payments: {
      GET: '/api/players/payments?limit={limit}&offset={offset}',
      GET_INVOICE: '/api/players/payments/{paymentId}/invoice',
    },
  },

  // CLUB DASHBOARD
  clubs: {
    profile: {
      GET: '/api/clubs/profile',
      PUT: '/api/clubs/profile',
      DELETE: '/api/clubs/account',
    },
    statistics: {
      GET: '/api/clubs/statistics',
    },
    members: {
      GET: '/api/clubs/members?limit={limit}&offset={offset}&status={status}',
      POST: '/api/clubs/members',
      PUT: '/api/clubs/members/{memberId}',
      DELETE: '/api/clubs/members/{memberId}',
      GET_DETAIL: '/api/clubs/members/{memberId}',
    },
    membership_fees: {
      GET: '/api/clubs/membership-fees?limit={limit}&offset={offset}',
      POST: '/api/clubs/membership-fees/send-reminder',
    },
    events: {
      GET: '/api/clubs/events',
      POST: '/api/clubs/events',
    },
    federation: {
      GET: '/api/clubs/federation-membership',
      POST: '/api/clubs/federation-membership/renew',
    },
    messages: {
      GET: '/api/clubs/messages?limit={limit}&offset={offset}',
    },
  },

  // PARTNER DASHBOARD
  partners: {
    profile: {
      GET: '/api/partners/profile',
      PUT: '/api/partners/profile',
      DELETE: '/api/partners/account',
    },
    sponsorships: {
      GET: '/api/partners/sponsorships',
    },
    messages: {
      GET: '/api/partners/messages?limit={limit}&offset={offset}',
      POST: '/api/partners/messages',
    },
    payments: {
      GET: '/api/partners/payments?limit={limit}&offset={offset}',
    },
  },

  // COACH DASHBOARD
  coaches: {
    profile: {
      GET: '/api/coaches/profile',
      PUT: '/api/coaches/profile',
      DELETE: '/api/coaches/account',
    },
    credentials: {
      GET: '/api/coaches/credentials',
      POST: '/api/coaches/credentials/renew',
    },
    students: {
      GET: '/api/coaches/students?limit={limit}&offset={offset}',
      POST: '/api/coaches/students/add',
      PUT: '/api/coaches/students/{studentId}',
    },
    sessions: {
      GET: '/api/coaches/sessions?limit={limit}&offset={offset}',
      POST: '/api/coaches/sessions/schedule',
    },
    messages: {
      GET: '/api/coaches/messages?limit={limit}&offset={offset}',
      POST: '/api/coaches/messages',
    },
    payments: {
      GET: '/api/coaches/payments?limit={limit}&offset={offset}',
    },
  },
};

// ============================================================================
// REQUEST PAYLOAD STRUCTURES
// ============================================================================

export const requestPayloads = {
  // STATE
  updateStateProfile: {
    description: 'Update state profile information',
    method: 'PUT',
    endpoint: '/api/state/profile',
    payload: {
      coordinatorName: 'string (optional)',
      email: 'string (optional)',
      phone: 'string (optional)',
      address: 'string (optional)',
      website: 'string (optional)',
      description: 'string (optional)',
    },
    example: {
      coordinatorName: 'María González Rodríguez',
      email: 'nuevo@estado.federacion.com',
      phone: '+52 55 9876 5432',
      description: 'Updated description',
    },
  },

  deleteStateAccount: {
    description: 'Delete state account (requires confirmation)',
    method: 'DELETE',
    endpoint: '/api/state/account',
    payload: {
      confirmationToken: 'string (required)',
    },
  },

  createStateEvent: {
    description: 'Create new state event',
    method: 'POST',
    endpoint: '/api/state/events',
    payload: {
      title: 'string (required)',
      date: 'ISO date string (required)',
      location: 'string (required)',
      participants: 'number (required)',
      type: 'enum: tournament | training | meeting | other (required)',
      description: 'string (optional)',
    },
    example: {
      title: 'Campeonato Estatal 2024',
      date: '2024-03-15',
      location: 'Centro Deportivo Principal',
      participants: 200,
      type: 'tournament',
      description: 'Annual state championship',
    },
  },

  // PLAYER
  updatePlayerProfile: {
    description: 'Update player profile',
    method: 'PUT',
    endpoint: '/api/players/profile',
    payload: {
      firstName: 'string (optional)',
      lastName: 'string (optional)',
      phone: 'string (optional)',
      level: 'enum: Beginner | Intermediate | Advanced | Professional (optional)',
      bio: 'string (optional)',
    },
  },

  renewPlayerCredential: {
    description: 'Renew digital credential with Stripe payment',
    method: 'POST',
    endpoint: '/api/players/credentials/renew',
    payload: {
      credentialId: 'string (required)',
      stripePaymentMethodId: 'string (required)',
    },
    example: {
      credentialId: 'cred_001',
      stripePaymentMethodId: 'pm_1234567890',
    },
  },

  searchClubs: {
    description: 'Search for clubs (sent as query params)',
    method: 'GET',
    endpoint: '/api/players/clubs/search',
    queryParams: {
      q: 'string (required) - search query',
      city: 'string (optional)',
      state: 'string (optional)',
      limit: 'number (default 10)',
      offset: 'number (default 0)',
    },
  },

  joinClub: {
    description: 'Request to join a club',
    method: 'POST',
    endpoint: '/api/players/clubs/join',
    payload: {
      clubId: 'string (required)',
      message: 'string (optional)',
    },
  },

  registerTournament: {
    description: 'Register for tournament with payment',
    method: 'POST',
    endpoint: '/api/players/tournaments/register',
    payload: {
      tournamentId: 'string (required)',
      category: 'string (required)',
      stripePaymentMethodId: 'string (required)',
    },
  },

  sendPlayerMessage: {
    description: 'Send message to federation/admin',
    method: 'POST',
    endpoint: '/api/players/messages',
    payload: {
      to: 'string (required) - federation_admin or specific ID',
      subject: 'string (required)',
      body: 'string (required)',
    },
  },

  // CLUB
  updateClubProfile: {
    description: 'Update club profile',
    method: 'PUT',
    endpoint: '/api/clubs/profile',
    payload: {
      name: 'string (optional)',
      coordinatorPhone: 'string (optional)',
      clubEmail: 'string (optional)',
      website: 'string (optional)',
      description: 'string (optional)',
    },
  },

  addClubMember: {
    description: 'Add member to club',
    method: 'POST',
    endpoint: '/api/clubs/members',
    payload: {
      playerId: 'string (required)',
      membershipFee: 'number (required)',
      notes: 'string (optional)',
    },
    example: {
      playerId: 'player_002',
      membershipFee: 5000,
      notes: 'Referred by Carlos',
    },
  },

  updateClubMember: {
    description: 'Update club member information',
    method: 'PUT',
    endpoint: '/api/clubs/members/{memberId}',
    payload: {
      membershipStatus: 'enum: active | inactive | pending | suspended (optional)',
      membershipFee: 'number (optional)',
      notes: 'string (optional)',
    },
  },

  sendMembershipReminder: {
    description: 'Send payment reminder to members',
    method: 'POST',
    endpoint: '/api/clubs/membership-fees/send-reminder',
    payload: {
      memberIds: 'string[] (required) - Array of member IDs',
      message: 'string (required)',
    },
  },

  renewFederationMembership: {
    description: 'Renew club federation membership',
    method: 'POST',
    endpoint: '/api/clubs/federation-membership/renew',
    payload: {
      stripePaymentMethodId: 'string (required)',
    },
  },

  // PARTNER
  updatePartnerProfile: {
    description: 'Update partner profile',
    method: 'PUT',
    endpoint: '/api/partners/profile',
    payload: {
      companyName: 'string (optional)',
      contactName: 'string (optional)',
      email: 'string (optional)',
      phone: 'string (optional)',
      website: 'string (optional)',
      sponsorshipLevel: 'enum: Gold | Platinum | Diamond (optional)',
      sponsorshipAmount: 'number (optional)',
    },
  },

  sendPartnerMessage: {
    description: 'Send message from partner',
    method: 'POST',
    endpoint: '/api/partners/messages',
    payload: {
      to: 'string (required)',
      subject: 'string (required)',
      body: 'string (required)',
    },
  },

  // COACH
  renewCoachCredential: {
    description: 'Renew NRTP coaching credential',
    method: 'POST',
    endpoint: '/api/coaches/credentials/renew',
    payload: {
      credentialId: 'string (required)',
      stripePaymentMethodId: 'string (required)',
    },
  },

  scheduleCoachingSession: {
    description: 'Schedule a coaching session',
    method: 'POST',
    endpoint: '/api/coaches/sessions/schedule',
    payload: {
      studentId: 'string (required)',
      date: 'ISO date string (required)',
      time: 'time string HH:mm (required)',
      duration: 'number in minutes (required)',
      notes: 'string (optional)',
    },
  },
};

// ============================================================================
// RESPONSE DATA STRUCTURES
// ============================================================================

export const responseStructures = {
  successResponse: {
    format: {
      success: 'boolean',
      data: 'T (generic type)',
      message: 'string (optional)',
      timestamp: 'ISO date string',
    },
    example: {
      success: true,
      data: { id: 'state_001', name: 'Estado de México' },
      timestamp: '2024-01-15T14:35:00Z',
    },
  },

  errorResponse: {
    format: {
      success: 'boolean (false)',
      error: 'string',
      message: 'string',
      timestamp: 'ISO date string',
    },
    example: {
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required',
      timestamp: '2024-01-15T14:35:00Z',
    },
  },

  paginatedResponse: {
    format: {
      success: 'boolean',
      data: {
        items: 'T[]',
        pagination: {
          limit: 'number',
          offset: 'number',
          total: 'number',
          pages: 'number',
        },
      },
      timestamp: 'ISO date string',
    },
  },

  paymentResponse: {
    format: {
      success: 'boolean',
      data: {
        paymentId: 'string',
        paymentStatus: 'enum: pending | processing | completed | failed',
        amount: 'number',
        currency: 'string',
        transactionId: 'string',
      },
    },
  },
};

// ============================================================================
// HTTP HEADERS REQUIRED
// ============================================================================

export const headers = {
  standard: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer {token}',
  },
  multipart: {
    Authorization: 'Bearer {token}',
    // Content-Type is set automatically by browser for multipart
  },
  fileDownload: {
    Authorization: 'Bearer {token}',
    // Accept: 'application/pdf' (optional)
  },
};

// ============================================================================
// HTTP STATUS CODES & ERROR HANDLING
// ============================================================================

export const statusCodes = {
  200: 'OK - Request successful',
  201: 'Created - Resource created successfully',
  204: 'No Content - Successful deletion',
  400: 'Bad Request - Invalid payload',
  401: 'Unauthorized - Token missing or invalid',
  403: 'Forbidden - Insufficient permissions',
  404: 'Not Found - Resource not found',
  409: 'Conflict - Resource already exists',
  422: 'Unprocessable Entity - Validation error',
  500: 'Internal Server Error - Server error',
  503: 'Service Unavailable - Server maintenance',
};

// ============================================================================
// EXAMPLE: COMPLETE API CALL FLOW
// ============================================================================

export const completeApiFlowExample = `
// 1. DISPATCH ACTION
const handleUpdateProfile = async (data: StateProfile) => {
  try {
    // 2. MAKE REQUEST
    const result = await dispatch(
      updateStateProfile(data)
    ).unwrap();
    
    // 3. HANDLE SUCCESS (HTTP 200)
    console.log('Updated successfully:', result);
    // Response format:
    // {
    //   success: true,
    //   data: { id, stateName, email, ...updated fields },
    //   timestamp: "2024-01-15T14:35:00Z"
    // }
    
    toast({
      title: 'Success',
      description: 'Profile updated successfully',
    });
    
  } catch (error: any) {
    // 4. HANDLE ERROR
    const errorMessage = error?.message || 'Failed to update';
    console.error('Error:', error);
    
    // Error response format:
    // {
    //   success: false,
    //   error: 'VALIDATION_ERROR',
    //   message: 'Email already exists',
    //   timestamp: '2024-01-15T14:35:00Z'
    // }
    
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
  }
};

// 5. REDUX STATE UPDATE
// State before: { profile: null, updating: false, error: null }
// Action: updateStateProfile.pending
// State during: { profile: null, updating: true, error: null }
// Action: updateStateProfile.fulfilled
// State after: { profile: {...updated data}, updating: false, error: null }
`;

export default {
  apiEndpoints,
  requestPayloads,
  responseStructures,
  headers,
  statusCodes,
  completeApiFlowExample,
};
