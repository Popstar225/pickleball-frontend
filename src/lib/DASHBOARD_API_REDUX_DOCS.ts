/**
 * DASHBOARD API & REDUX DOCUMENTATION
 * Complete guide for State, Player, Club, Partner, and Coach dashboards
 * including Redux integration, payloads, and return data
 */

// ============================================================================
// STATE DASHBOARD - API & REDUX
// ============================================================================

/**
 * STATE DASHBOARD REDUX SLICE: stateDashboardSlice
 * Dispatch actions to manage state dashboard data
 */

// Example: Fetch State Profile
export const fetchStateProfileExample = {
  dispatch: `dispatch(fetchStateProfile())`,
  endpoint: `GET /api/state/profile`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer {token}',
  },
  response: {
    success: true,
    data: {
      id: 'state_001',
      stateName: 'Estado de México',
      coordinatorName: 'María González Rodríguez',
      email: 'coordinador@estado.federacion.com',
      phone: '+52 55 1234 5678',
      address: 'Av. Principal 123, Toluca, Estado de México',
      website: 'https://estado.federacion.com',
      foundationDate: '2020-03-15',
      totalMembers: 1250,
      activeClubs: 45,
      description: 'Delegación estatal responsable de promover y desarrollar el pickleball',
      logoUrl: 'https://cdn.federacion.com/logos/estado_mx.png',
      createdAt: '2020-03-15T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
    },
    timestamp: '2024-01-15T14:35:00Z',
  },
};

// Example: Update State Profile
export const updateStateProfileExample = {
  dispatch: `dispatch(updateStateProfile({
    coordinatorName: 'María González',
    email: 'nuevo@estado.federacion.com',
    phone: '+52 55 9876 5432',
    description: 'Delegación estatal actualizada'
  }))`,
  endpoint: `PUT /api/state/profile`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer {token}',
  },
  payload: {
    coordinatorName: 'María González',
    email: 'nuevo@estado.federacion.com',
    phone: '+52 55 9876 5432',
    description: 'Delegación estatal actualizada',
  },
  response: {
    success: true,
    data: {
      id: 'state_001',
      stateName: 'Estado de México',
      coordinatorName: 'María González',
      email: 'nuevo@estado.federacion.com',
      phone: '+52 55 9876 5432',
      address: 'Av. Principal 123, Toluca, Estado de México',
      website: 'https://estado.federacion.com',
      foundationDate: '2020-03-15',
      totalMembers: 1250,
      activeClubs: 45,
      description: 'Delegación estatal actualizada',
      createdAt: '2020-03-15T10:00:00Z',
      updatedAt: '2024-01-15T14:35:00Z',
    },
  },
};

// Example: Delete State Account
export const deleteStateAccountExample = {
  dispatch: `dispatch(deleteStateAccount('confirmation_token_123'))`,
  endpoint: `DELETE /api/state/account`,
  payload: {
    confirmationToken: 'confirmation_token_123',
  },
  response: {
    success: true,
    message: 'Account deleted successfully',
    timestamp: '2024-01-15T14:35:00Z',
  },
};

// Example: Fetch State Statistics
export const fetchStateStatisticsExample = {
  dispatch: `dispatch(fetchStateStatistics())`,
  endpoint: `GET /api/state/statistics`,
  response: {
    success: true,
    data: {
      totalMembers: 1250,
      activeClubs: 45,
      tournamentsThisYear: 28,
      upcomingEvents: 12,
      membershipGrowth: 15.5,
      messagesUnread: 8,
    },
    timestamp: '2024-01-15T14:35:00Z',
  },
};

// Example: Fetch Recent Activities
export const fetchStateActivitiesExample = {
  dispatch: `dispatch(fetchStateActivities({ limit: 10, offset: 0 }))`,
  endpoint: `GET /api/state/activities?limit=10&offset=0`,
  response: {
    success: true,
    data: {
      activities: [
        {
          id: 'activity_001',
          type: 'tournament',
          title: 'Torneo Estatal Juvenil',
          description: 'Completado exitosamente con 156 participantes',
          date: '2024-01-15',
          status: 'completed',
        },
        {
          id: 'activity_002',
          type: 'club',
          title: 'Nuevo Club Afiliado',
          description: 'Club Pickleball Centro se unió a la federación',
          date: '2024-01-12',
          status: 'new',
        },
      ],
      total: 2,
    },
    timestamp: '2024-01-15T14:35:00Z',
  },
};

// Example: Fetch Upcoming Events
export const fetchUpcomingEventsExample = {
  dispatch: `dispatch(fetchUpcomingEvents({ limit: 10 }))`,
  endpoint: `GET /api/state/events/upcoming?limit=10`,
  response: {
    success: true,
    data: {
      events: [
        {
          id: 'event_001',
          title: 'Campeonato Estatal 2024',
          date: '2024-03-15',
          location: 'Centro Deportivo Principal',
          participants: 200,
          type: 'tournament',
          description: 'Campeonato anual del estado',
          createdBy: 'state_001',
          createdAt: '2024-01-10T10:00:00Z',
        },
      ],
      total: 1,
    },
    timestamp: '2024-01-15T14:35:00Z',
  },
};

// Example: Create New Event
export const createStateEventExample = {
  dispatch: `dispatch(createStateEvent({
    title: 'Campeonato Estatal 2024',
    date: '2024-03-15',
    location: 'Centro Deportivo Principal',
    participants: 200,
    type: 'tournament',
    description: 'Campeonato anual del estado'
  }))`,
  endpoint: `POST /api/state/events`,
  payload: {
    title: 'Campeonato Estatal 2024',
    date: '2024-03-15',
    location: 'Centro Deportivo Principal',
    participants: 200,
    type: 'tournament',
    description: 'Campeonato anual del estado',
  },
  response: {
    success: true,
    data: {
      id: 'event_new_001',
      title: 'Campeonato Estatal 2024',
      date: '2024-03-15',
      location: 'Centro Deportivo Principal',
      participants: 200,
      type: 'tournament',
      description: 'Campeonato anual del estado',
      createdBy: 'state_001',
      createdAt: '2024-01-15T14:35:00Z',
    },
  },
};

// ============================================================================
// PLAYER DASHBOARD - API & REDUX
// ============================================================================

/**
 * PLAYER DASHBOARD REDUX SLICE: playerDashboardSlice
 */

// Example: Fetch Player Profile
export const fetchPlayerProfileExample = {
  dispatch: `dispatch(fetchPlayerProfile())`,
  endpoint: `GET /api/players/profile`,
  response: {
    success: true,
    data: {
      id: 'player_001',
      firstName: 'Carlos',
      lastName: 'Mendoza',
      email: 'carlos@email.com',
      phone: '+52 55 1234 5678',
      dateOfBirth: '1990-05-15',
      gender: 'M',
      level: 'Advanced',
      club: 'club_001',
      profileImageUrl: 'https://cdn.federacion.com/profiles/carlos.jpg',
      bio: 'Professional pickleball player with 10 years experience',
      createdAt: '2022-03-10T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
    },
  },
};

// Example: Fetch Player Credentials
export const fetchPlayerCredentialsExample = {
  dispatch: `dispatch(fetchPlayerCredentials())`,
  endpoint: `GET /api/players/credentials`,
  response: {
    success: true,
    data: {
      credentials: [
        {
          id: 'cred_001',
          playerId: 'player_001',
          credentialType: 'Federal',
          credentialNumber: 'FED-2024-001',
          issueDate: '2024-01-01',
          expiryDate: '2024-12-31',
          status: 'active',
          federalCode: 'QR-CODE-123456',
          qrCodeUrl: 'https://cdn.federacion.com/qr/cred_001.png',
          createdAt: '2024-01-01T10:00:00Z',
        },
      ],
    },
  },
};

// Example: Renew Credential (Stripe Payment)
export const renewPlayerCredentialExample = {
  dispatch: `dispatch(renewPlayerCredential({
    credentialId: 'cred_001',
    stripePaymentMethodId: 'pm_1234567890'
  }))`,
  endpoint: `POST /api/players/credentials/renew`,
  payload: {
    credentialId: 'cred_001',
    stripePaymentMethodId: 'pm_1234567890',
  },
  response: {
    success: true,
    data: {
      paymentId: 'pay_001',
      paymentStatus: 'processing',
      credentialStatus: 'renewal_pending',
    },
    message: 'Credential renewal initiated. We will process your payment.',
  },
};

// Example: Search Clubs
export const searchClubsExample = {
  dispatch: `dispatch(searchClubs({
    query: 'Pickleball',
    city: 'Mexico City',
    limit: 10,
    offset: 0
  }))`,
  endpoint: `GET /api/players/clubs/search?q=Pickleball&city=Mexico%20City&limit=10&offset=0`,
  response: {
    success: true,
    data: {
      clubs: [
        {
          id: 'club_001',
          name: 'Club Pickleball Central',
          location: 'Downtown',
          city: 'Mexico City',
          state: 'Mexico',
          coordinatorName: 'Juan García',
          phone: '+52 55 1234 5678',
          email: 'info@clubcentral.com',
          memberCount: 150,
          createdAt: '2020-06-15T10:00:00Z',
        },
      ],
      total: 1,
    },
  },
};

// Example: Join Club
export const joinClubExample = {
  dispatch: `dispatch(joinClub({
    clubId: 'club_001',
    message: 'I would like to join your club'
  }))`,
  endpoint: `POST /api/players/clubs/join`,
  payload: {
    clubId: 'club_001',
    message: 'I would like to join your club',
  },
  response: {
    success: true,
    data: {
      requestId: 'req_001',
      status: 'pending_approval',
    },
    message: 'Membership request sent successfully',
  },
};

// Example: Fetch Player Tournaments
export const fetchPlayerTournamentsExample = {
  dispatch: `dispatch(fetchPlayerTournaments())`,
  endpoint: `GET /api/players/tournaments`,
  response: {
    success: true,
    data: {
      registrations: [
        {
          id: 'reg_001',
          playerId: 'player_001',
          tournamentId: 'tour_001',
          tournamentName: 'Championship 2024',
          category: "Men's Singles",
          registrationDate: '2024-01-10T10:00:00Z',
          status: 'confirmed',
          paymentStatus: 'paid',
          registrationFee: 500,
        },
      ],
    },
  },
};

// Example: Fetch Player Messages
export const fetchPlayerMessagesExample = {
  dispatch: `dispatch(fetchPlayerMessages({ limit: 20, offset: 0 }))`,
  endpoint: `GET /api/players/messages?limit=20&offset=0`,
  response: {
    success: true,
    data: {
      messages: [
        {
          id: 'msg_001',
          senderId: 'admin_001',
          senderName: 'Admin',
          subject: 'Credential Renewal Reminder',
          body: 'Your credential expires on 2024-12-31',
          date: '2024-01-15T10:00:00Z',
          read: false,
        },
      ],
      total: 5,
      unread: 2,
    },
  },
};

// Example: Fetch Player Payments
export const fetchPlayerPaymentsExample = {
  dispatch: `dispatch(fetchPlayerPayments({ limit: 10, offset: 0 }))`,
  endpoint: `GET /api/players/payments?limit=10&offset=0`,
  response: {
    success: true,
    data: {
      payments: [
        {
          id: 'pay_001',
          paymentDate: '2024-01-15T10:00:00Z',
          description: 'Federal License Renewal 2024',
          amount: 2500,
          currency: 'MXN',
          status: 'completed',
          paymentMethod: 'stripe',
          transactionId: 'txn_1234567890',
          invoice: 'INV-2024-001',
        },
      ],
      total: 3,
    },
  },
};

// ============================================================================
// CLUB DASHBOARD - API & REDUX
// ============================================================================

/**
 * CLUB DASHBOARD REDUX SLICE: clubDashboardSlice
 */

// Example: Fetch Club Profile
export const fetchClubProfileExample = {
  dispatch: `dispatch(fetchClubProfile())`,
  endpoint: `GET /api/clubs/profile`,
  response: {
    success: true,
    data: {
      id: 'club_001',
      name: 'Club Pickleball Central',
      location: 'Centro Deportivo Downtown',
      city: 'Mexico City',
      state: 'Mexico',
      coordinatorName: 'Juan García López',
      coordinatorEmail: 'juan@clubcentral.com',
      coordinatorPhone: '+52 55 1234 5678',
      clubEmail: 'info@clubcentral.com',
      clubPhone: '+52 55 5678 1234',
      foundationDate: '2020-06-15',
      memberCount: 150,
      activeMembers: 142,
      totalMembers: 150,
      website: 'https://clubcentral.com',
      description: 'Leading pickleball club in Mexico City',
      logoUrl: 'https://cdn.federacion.com/logos/clubcentral.png',
      createdAt: '2020-06-15T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
    },
  },
};

// Example: Fetch Club Statistics
export const fetchClubStatisticsExample = {
  dispatch: `dispatch(fetchClubStatistics())`,
  endpoint: `GET /api/clubs/statistics`,
  response: {
    success: true,
    data: {
      totalMembers: 150,
      activeMembers: 142,
      tournamentsOrganized: 12,
      upcomingEvents: 3,
      monthlyGrowth: 5.2,
      federationStatus: 'active',
      membershipFeesDue: 85000,
    },
  },
};

// Example: Fetch Club Members
export const fetchClubMembersExample = {
  dispatch: `dispatch(fetchClubMembers({ limit: 20, offset: 0, status: 'active' }))`,
  endpoint: `GET /api/clubs/members?limit=20&offset=0&status=active`,
  response: {
    success: true,
    data: {
      members: [
        {
          id: 'member_001',
          playerId: 'player_001',
          firstName: 'Carlos',
          lastName: 'Mendoza',
          email: 'carlos@email.com',
          phone: '+52 55 1234 5678',
          level: 'Advanced',
          joinDate: '2022-03-15',
          membershipStatus: 'active',
          membershipFee: 5000,
          lastPaymentDate: '2024-01-10',
          credentialStatus: 'valid',
        },
      ],
      total: 150,
    },
  },
};

// Example: Add Club Member
export const addClubMemberExample = {
  dispatch: `dispatch(addClubMember({
    playerId: 'player_002',
    membershipFee: 5000,
    notes: 'Referred by Carlos'
  }))`,
  endpoint: `POST /api/clubs/members`,
  payload: {
    playerId: 'player_002',
    membershipFee: 5000,
    notes: 'Referred by Carlos',
  },
  response: {
    success: true,
    data: {
      id: 'member_new_001',
      playerId: 'player_002',
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana@email.com',
      phone: '+52 55 9876 5432',
      level: 'Intermediate',
      joinDate: '2024-01-15',
      membershipStatus: 'pending_approval',
      membershipFee: 5000,
      credentialStatus: 'pending',
    },
    message: 'Member added successfully',
  },
};

// Example: Update Club Member
export const updateClubMemberExample = {
  dispatch: `dispatch(updateClubMember({
    memberId: 'member_001',
    membershipStatus: 'active',
    membershipFee: 5500
  }))`,
  endpoint: `PUT /api/clubs/members/{memberId}`,
  payload: {
    membershipStatus: 'active',
    membershipFee: 5500,
  },
  response: {
    success: true,
    data: {
      id: 'member_001',
      playerId: 'player_001',
      firstName: 'Carlos',
      lastName: 'Mendoza',
      membershipStatus: 'active',
      membershipFee: 5500,
    },
  },
};

// Example: Remove Club Member
export const removeClubMemberExample = {
  dispatch: `dispatch(removeClubMember('member_001'))`,
  endpoint: `DELETE /api/clubs/members/{memberId}`,
  response: {
    success: true,
    message: 'Member removed successfully',
  },
};

// Example: Fetch Membership Fees
export const fetchClubMembershipFeesExample = {
  dispatch: `dispatch(fetchClubMembershipFees({ limit: 20, offset: 0 }))`,
  endpoint: `GET /api/clubs/membership-fees?limit=20&offset=0`,
  response: {
    success: true,
    data: {
      payments: [
        {
          id: 'pay_001',
          memberId: 'member_001',
          memberName: 'Carlos Mendoza',
          amount: 5000,
          dueDate: '2024-02-01',
          paymentDate: '2024-01-28',
          status: 'paid',
          paymentMethod: 'stripe',
        },
        {
          id: 'pay_002',
          memberId: 'member_002',
          memberName: 'Ana García',
          amount: 5000,
          dueDate: '2024-02-01',
          status: 'pending',
        },
      ],
      totalDue: 85000,
      totalPaid: 145000,
    },
  },
};

// ============================================================================
// PARTNER DASHBOARD - API & REDUX
// ============================================================================

/**
 * PARTNER DASHBOARD REDUX SLICE: partnerDashboardSlice
 */

// Example: Fetch Partner Profile
export const fetchPartnerProfileExample = {
  dispatch: `dispatch(fetchPartnerProfile())`,
  endpoint: `GET /api/partners/profile`,
  response: {
    success: true,
    data: {
      id: 'partner_001',
      companyName: 'TechSports Inc',
      contactName: 'Roberto García',
      email: 'roberto@techsports.com',
      phone: '+52 55 1234 5678',
      website: 'https://techsports.com',
      industry: 'Technology',
      sponsorshipLevel: 'Gold',
      sponsorshipAmount: 500000,
      sponsorshipStartDate: '2024-01-01',
      sponsorshipEndDate: '2024-12-31',
      partneredSince: '2023-06-15',
      logoUrl: 'https://cdn.federacion.com/partners/techsports.png',
      description: 'Leading technology partner for pickleball federation',
      createdAt: '2023-06-15T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
    },
  },
};

// Example: Update Partner Profile
export const updatePartnerProfileExample = {
  dispatch: `dispatch(updatePartnerProfile({
    companyName: 'TechSports Global',
    sponsorshipLevel: 'Platinum',
    sponsorshipAmount: 750000
  }))`,
  endpoint: `PUT /api/partners/profile`,
  payload: {
    companyName: 'TechSports Global',
    sponsorshipLevel: 'Platinum',
    sponsorshipAmount: 750000,
  },
  response: {
    success: true,
    data: {
      id: 'partner_001',
      companyName: 'TechSports Global',
      contactName: 'Roberto García',
      email: 'roberto@techsports.com',
      sponsorshipLevel: 'Platinum',
      sponsorshipAmount: 750000,
      updatedAt: '2024-01-15T14:35:00Z',
    },
  },
};

// Example: Fetch Partner Payments
export const fetchPartnerPaymentsExample = {
  dispatch: `dispatch(fetchPartnerPayments({ limit: 10, offset: 0 }))`,
  endpoint: `GET /api/partners/payments?limit=10&offset=0`,
  response: {
    success: true,
    data: {
      payments: [
        {
          id: 'pay_001',
          paymentDate: '2024-01-15T10:00:00Z',
          description: '2024 Sponsorship Payment',
          amount: 750000,
          currency: 'MXN',
          status: 'completed',
          paymentMethod: 'transfer',
          transactionId: 'txn_1234567890',
          invoice: 'INV-2024-SPONSOR-001',
        },
      ],
      total: 2,
    },
  },
};

// ============================================================================
// COACH DASHBOARD - API & REDUX
// ============================================================================

/**
 * COACH DASHBOARD REDUX SLICE: coachDashboardSlice
 */

// Example: Fetch Coach Profile
export const fetchCoachProfileExample = {
  dispatch: `dispatch(fetchCoachProfile())`,
  endpoint: `GET /api/coaches/profile`,
  response: {
    success: true,
    data: {
      id: 'coach_001',
      firstName: 'Miguel',
      lastName: 'Rodríguez',
      email: 'miguel@coaching.com',
      phone: '+52 55 1234 5678',
      specialization: 'Technique and Tactics',
      yearsOfExperience: 15,
      certification: 'NRTP Level 3',
      hourlyRate: 500,
      studentsCount: 25,
      profileImageUrl: 'https://cdn.federacion.com/coaches/miguel.jpg',
      bio: 'Certified pickleball coach with 15 years of experience',
      club: 'club_001',
      createdAt: '2021-03-10T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
    },
  },
};

// Example: Fetch Coach Credentials
export const fetchCoachCredentialsExample = {
  dispatch: `dispatch(fetchCoachCredentials())`,
  endpoint: `GET /api/coaches/credentials`,
  response: {
    success: true,
    data: {
      credentials: [
        {
          id: 'cred_coach_001',
          coachId: 'coach_001',
          credentialType: 'NRTP Certification',
          credentialNumber: 'NRTP-2024-001',
          issueDate: '2024-01-01',
          expiryDate: '2024-12-31',
          status: 'active',
          certificateUrl: 'https://cdn.federacion.com/certs/nrtp_coach_001.pdf',
          createdAt: '2024-01-01T10:00:00Z',
        },
      ],
    },
  },
};

// Example: Renew Coach Credential
export const renewCoachCredentialExample = {
  dispatch: `dispatch(renewCoachCredential({
    credentialId: 'cred_coach_001',
    stripePaymentMethodId: 'pm_1234567890'
  }))`,
  endpoint: `POST /api/coaches/credentials/renew`,
  payload: {
    credentialId: 'cred_coach_001',
    stripePaymentMethodId: 'pm_1234567890',
  },
  response: {
    success: true,
    data: {
      paymentId: 'pay_coach_001',
      paymentStatus: 'processing',
      credentialStatus: 'renewal_pending',
      renewalAmount: 3000,
    },
    message: 'Credential renewal initiated. We will process your payment.',
  },
};

// Example: Fetch Coach Students
export const fetchCoachStudentsExample = {
  dispatch: `dispatch(fetchCoachStudents({ limit: 20, offset: 0 }))`,
  endpoint: `GET /api/coaches/students?limit=20&offset=0`,
  response: {
    success: true,
    data: {
      students: [
        {
          id: 'student_001',
          playerId: 'player_005',
          firstName: 'José',
          lastName: 'López',
          level: 'Beginner',
          joinDate: '2023-06-15',
          totalSessions: 24,
          lastSessionDate: '2024-01-12',
          status: 'active',
          progress: 'Good improvement',
        },
      ],
      total: 25,
    },
  },
};

// Example: Fetch Coach Payments
export const fetchCoachPaymentsExample = {
  dispatch: `dispatch(fetchCoachPayments({ limit: 10, offset: 0 }))`,
  endpoint: `GET /api/coaches/payments?limit=10&offset=0`,
  response: {
    success: true,
    data: {
      payments: [
        {
          id: 'pay_coach_001',
          paymentDate: '2024-01-15T10:00:00Z',
          description: 'Student Sessions - January 2024',
          amount: 12000,
          currency: 'MXN',
          status: 'completed',
          paymentMethod: 'stripe',
          transactionId: 'txn_coach_001',
          sessionsCount: 24,
        },
      ],
      total: 5,
      totalEarnings: 60000,
    },
  },
};

// ============================================================================
// REDUX STATE SELECTORS EXAMPLE
// ============================================================================

/**
 * Example of using Redux selectors in components
 */

export const reduxSelectorExamples = {
  stateProfile: `
    import { useSelector } from 'react-redux';
    
    export function StateAccountComponent() {
      const profile = useSelector((state: RootState) => state.stateDashboard.profile);
      const loading = useSelector((state: RootState) => state.stateDashboard.profileLoading);
      const error = useSelector((state: RootState) => state.stateDashboard.profileError);
      
      return (
        <div>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
          {profile && <p>State: {profile.stateName}</p>}
        </div>
      );
    }
  `,

  playerProfile: `
    import { useSelector } from 'react-redux';
    
    const profile = useSelector((state: RootState) => state.playerDashboard.profile);
  `,

  clubMembers: `
    import { useSelector } from 'react-redux';
    
    const members = useSelector((state: RootState) => state.clubDashboard.members);
    const membersLoading = useSelector((state: RootState) => state.clubDashboard.membersLoading);
  `,
};

// ============================================================================
// ERROR HANDLING PATTERNS
// ============================================================================

export const errorHandlingExample = {
  dispatch: `
    try {
      await dispatch(fetchStateProfile()).unwrap();
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Handle error - show toast, alert, etc
    }
  `,
};
