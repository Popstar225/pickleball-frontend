/**
 * DASHBOARD DOCUMENTATION INDEX
 * Complete guide to all documentation files and their contents
 */

export const documentationIndex = {
  title: 'Dashboard API & Redux Documentation',
  version: '2.0.0',
  lastUpdated: '2024-01-15',

  files: {
    'DASHBOARD_API_REDUX_DOCS.ts': {
      name: 'Dashboard API & Redux Documentation',
      path: 'src/lib/DASHBOARD_API_REDUX_DOCS.ts',
      description: 'Complete examples for all dashboard APIs with Redux integration',
      contents: [
        'STATE DASHBOARD API Examples',
        '  - fetchStateProfile',
        '  - updateStateProfile',
        '  - deleteStateAccount',
        '  - fetchStateStatistics',
        '  - fetchStateActivities',
        '  - fetchUpcomingEvents',
        '  - createStateEvent',
        'PLAYER DASHBOARD API Examples',
        '  - fetchPlayerProfile',
        '  - fetchPlayerCredentials',
        '  - renewPlayerCredential (Stripe)',
        '  - searchClubs',
        '  - joinClub',
        '  - fetchPlayerTournaments',
        '  - fetchPlayerMessages',
        '  - fetchPlayerPayments',
        'CLUB DASHBOARD API Examples',
        '  - fetchClubProfile',
        '  - fetchClubStatistics',
        '  - fetchClubMembers',
        '  - addClubMember',
        '  - updateClubMember',
        '  - removeClubMember',
        '  - fetchClubMembershipFees',
        'PARTNER DASHBOARD API Examples',
        '  - fetchPartnerProfile',
        '  - updatePartnerProfile',
        '  - fetchPartnerPayments',
        'COACH DASHBOARD API Examples',
        '  - fetchCoachProfile',
        '  - fetchCoachCredentials',
        '  - renewCoachCredential (Stripe)',
        '  - fetchCoachStudents',
        '  - fetchCoachPayments',
        'Redux Selector Examples',
        'Error Handling Patterns',
      ],
      usage:
        'Reference for API endpoint payloads and response structures with Redux dispatch examples',
    },

    'REDUX_IMPLEMENTATION_GUIDE.ts': {
      name: 'Redux Implementation Guide',
      path: 'src/lib/REDUX_IMPLEMENTATION_GUIDE.ts',
      description: 'Step-by-step guide for implementing Redux in dashboard components',
      contents: [
        'StateAccountPage Example - Profile management with Redux',
        'StateDashboardHome Example - Dashboard statistics and activities',
        'PlayerAccountPage Example - Player profile with Redux',
        'PlayerCredentialsPage Example - Digital credential renewal',
        'PlayerClubsPage Example - Club search and join functionality',
        'ClubMembersPage Example - Member management with CRUD',
        'CoachCredentialsPage Example - NRTP credential renewal',
        'Async Thunk Response Handling Patterns',
        'Common Redux patterns for dashboards',
        '  - Loading indicators',
        '  - Error handling',
        '  - Pagination',
        '  - Optimistic updates',
      ],
      usage: 'Copy and adapt component examples for implementing Redux in your dashboard pages',
    },

    'API_COMPLETE_REFERENCE.ts': {
      name: 'Complete API Reference',
      path: 'src/lib/API_COMPLETE_REFERENCE.ts',
      description: 'Comprehensive API endpoints, payloads, and responses reference',
      contents: [
        'API Endpoints Reference Table',
        '  - State Dashboard endpoints',
        '  - Player Dashboard endpoints',
        '  - Club Dashboard endpoints',
        '  - Partner Dashboard endpoints',
        '  - Coach Dashboard endpoints',
        'Request Payload Structures',
        '  - Update profile payloads',
        '  - Create/update operations',
        '  - Payment operations',
        '  - Search and filter parameters',
        'Response Data Structures',
        '  - Success response format',
        '  - Error response format',
        '  - Paginated response format',
        '  - Payment response format',
        'HTTP Headers Required',
        'HTTP Status Codes & Error Handling',
        'Complete API Call Flow Example',
      ],
      usage: 'Reference for exact request/response formats and HTTP details',
    },

    'REDUX_SLICE_REFERENCE.ts': {
      name: 'Redux Slice Reference',
      path: 'src/lib/REDUX_SLICE_REFERENCE.ts',
      description: 'Quick reference for all Redux slice actions and state keys',
      contents: [
        'STATE DASHBOARD SLICE',
        '  - Async Thunks (fetchStateProfile, updateStateProfile, etc.)',
        '  - Sync Actions (clearError, resetDashboard)',
        'PLAYER DASHBOARD SLICE',
        '  - Async Thunks (12 actions)',
        '  - State: profileLoading, credentialsLoading, searching, etc.',
        'CLUB DASHBOARD SLICE',
        '  - Async Thunks (10 actions)',
        '  - State: membersLoading, statsLoading, federationLoading, etc.',
        'PARTNER DASHBOARD SLICE',
        '  - Async Thunks (6 actions)',
        'COACH DASHBOARD SLICE',
        '  - Async Thunks (7 actions)',
        'Quick Usage Reference - Copy-paste setup code',
      ],
      usage: 'Quick lookup for exact action names and what state they set',
    },
  },

  // ============================================================================
  // DOCUMENTATION ROADMAP
  // ============================================================================

  readingOrder: [
    {
      step: 1,
      file: 'REDUX_SLICE_REFERENCE.ts',
      reason: 'Start here to understand what actions are available',
      time: '10 minutes',
    },
    {
      step: 2,
      file: 'API_COMPLETE_REFERENCE.ts',
      reason: 'Learn the exact payloads and response formats',
      time: '15 minutes',
    },
    {
      step: 3,
      file: 'DASHBOARD_API_REDUX_DOCS.ts',
      reason: 'See real examples of dispatching actions and getting responses',
      time: '15 minutes',
    },
    {
      step: 4,
      file: 'REDUX_IMPLEMENTATION_GUIDE.ts',
      reason: 'Implement Redux in your component using the examples',
      time: '20 minutes',
    },
  ],

  // ============================================================================
  // QUICK START SCENARIOS
  // ============================================================================

  quickStartScenarios: {
    scenario1: {
      title: 'I need to fetch and display state profile',
      steps: [
        '1. Open REDUX_SLICE_REFERENCE.ts, find "fetchStateProfile" under stateDashboardActions',
        '2. Copy the quick usage reference code from bottom of same file',
        '3. Import the action: import { fetchStateProfile } from "@/store/slices/stateDashboardSlice"',
        '4. Dispatch in useEffect: dispatch(fetchStateProfile())',
        '5. Select from Redux: const profile = useSelector(state => state.stateDashboard.profile)',
        '6. Reference API_COMPLETE_REFERENCE.ts for response structure',
      ],
    },

    scenario2: {
      title: 'I need to update a profile and handle success/error',
      steps: [
        '1. Open REDUX_IMPLEMENTATION_GUIDE.ts, find "PlayerAccountPage Example"',
        '2. Copy the handleUpdateProfile function',
        '3. Adapt it for your needs (change action name, state names)',
        '4. Check DASHBOARD_API_REDUX_DOCS.ts for the exact request payload',
        '5. Check API_COMPLETE_REFERENCE.ts for response structure',
      ],
    },

    scenario3: {
      title: 'I need to implement member management (CRUD)',
      steps: [
        '1. Open REDUX_IMPLEMENTATION_GUIDE.ts, find "ClubMembersPage Example"',
        '2. This shows add, remove, and table operations',
        '3. Check REDUX_SLICE_REFERENCE.ts under clubDashboardActions for all member actions',
        '4. Reference API_COMPLETE_REFERENCE.ts for payloads (addClubMember, removeClubMember, etc.)',
        '5. Copy example components or adapt as needed',
      ],
    },

    scenario4: {
      title: 'I need to implement payment flow with Stripe',
      steps: [
        '1. Open DASHBOARD_API_REDUX_DOCS.ts, find "renewPlayerCredentialExample"',
        '2. This shows how to pass stripePaymentMethodId to the API',
        '3. The Redux action will call the API which handles Stripe',
        '4. Check response structure in API_COMPLETE_REFERENCE.ts for paymentResponse',
        '5. Mock Stripe setup and payment method collection in UI',
      ],
    },
  },

  // ============================================================================
  // STATE STRUCTURE REFERENCE
  // ============================================================================

  stateStructures: {
    stateDashboard: {
      profile: 'StateProfile | null',
      statistics: 'StateStatistics | null',
      activities: 'Activity[]',
      events: 'Event[]',
      loading: 'boolean',
      profileLoading: 'boolean',
      statisticsLoading: 'boolean',
      activitiesLoading: 'boolean',
      eventsLoading: 'boolean',
      updating: 'boolean',
      deleting: 'boolean',
      error: 'string | null',
      profileError: 'string | null',
    },

    playerDashboard: {
      profile: 'PlayerProfile | null',
      credentials: 'DigitalCredential[]',
      myClubs: 'Club[]',
      searchResults: 'Club[]',
      tournaments: 'TournamentRegistration[]',
      messages: 'Message[]',
      payments: 'Payment[]',
      profileLoading: 'boolean',
      credentialsLoading: 'boolean',
      searching: 'boolean',
      joining: 'boolean',
      renewing: 'boolean',
      tournamentsLoading: 'boolean',
      messagesLoading: 'boolean',
      paymentsLoading: 'boolean',
      error: 'string | null',
      profileError: 'string | null',
    },

    clubDashboard: {
      profile: 'ClubProfile | null',
      statistics: 'ClubStatistics | null',
      members: 'ClubMember[]',
      fees: 'MembershipPayment[]',
      profileLoading: 'boolean',
      statsLoading: 'boolean',
      membersLoading: 'boolean',
      feesLoading: 'boolean',
      adding: 'boolean',
      updating: 'boolean',
      deleting: 'boolean',
      federationLoading: 'boolean',
      renewing: 'boolean',
      error: 'string | null',
      profileError: 'string | null',
    },

    partnerDashboard: {
      profile: 'PartnerProfile | null',
      messages: 'Message[]',
      payments: 'Payment[]',
      profileLoading: 'boolean',
      messagesLoading: 'boolean',
      paymentsLoading: 'boolean',
      updating: 'boolean',
      error: 'string | null',
    },

    coachDashboard: {
      profile: 'CoachProfile | null',
      credentials: 'Credential[]',
      students: 'Student[]',
      messages: 'Message[]',
      payments: 'Payment[]',
      profileLoading: 'boolean',
      credentialsLoading: 'boolean',
      studentsLoading: 'boolean',
      messagesLoading: 'boolean',
      paymentsLoading: 'boolean',
      renewing: 'boolean',
      error: 'string | null',
    },
  },

  // ============================================================================
  // COMMON ERRORS & SOLUTIONS
  // ============================================================================

  commonErrors: {
    error1: {
      message: 'Selector returned undefined',
      cause: 'Slice not imported in store/index.ts',
      solution: `
        1. Check src/store/index.ts
        2. Verify dashboard slice is imported: 
           import stateDashboardReducer from './slices/stateDashboardSlice'
        3. Add to reducer config:
           stateDashboard: stateDashboardReducer,
      `,
    },

    error2: {
      message: 'Action dispatch throws error',
      cause: 'Action not exported from slice',
      solution: `
        1. Open the slice file (e.g., stateDashboardSlice.ts)
        2. Verify export: export const { action1, action2 } = sliceName.actions
        3. Check import in component: import { actionName } from "@/store/slices/..."
      `,
    },

    error3: {
      message: 'API returns 401 Unauthorized',
      cause: 'Token missing or expired',
      solution: `
        1. Check token in localStorage.getItem('token')
        2. Verify Authorization header in fetch calls
        3. Ensure token refresh logic in auth slice
      `,
    },

    error4: {
      message: 'Payment fails with Stripe',
      cause: 'Invalid stripe API key or payment method',
      solution: `
        1. Check Stripe public key configuration
        2. Ensure payment method is created on frontend
        3. Pass correct stripePaymentMethodId to API
        4. Check API error response for detailed message
      `,
    },
  },

  // ============================================================================
  // TESTING CHECKLIST
  // ============================================================================

  testingChecklist: {
    before_deploying: [
      '[ ] All Redux slices imported in store/index.ts',
      '[ ] All components can successfully dispatch actions',
      '[ ] Loading states show while fetching (profileLoading, membersLoading, etc.)',
      '[ ] Error states display error messages clearly',
      '[ ] Success messages show after operations',
      '[ ] Pagination works correctly for list views',
      '[ ] Stripe payment flow completes successfully',
      '[ ] Account deletion requires confirmation token',
      '[ ] API calls include correct Authorization header',
      '[ ] Sensitive data (passwords) not logged to console',
      '[ ] All endpoints return expected response structure',
      "[ ] Error handling doesn't crash app (try/catch)",
      '[ ] Loading indicators prevent duplicate submissions',
      "[ ] Refresh/reload doesn't lose recent changes",
    ],
  },
};

/**
 * IMPLEMENTATION FLOW
 *
 * 1. SETUP REDUX
 *    ✓ Redux slices already exist in src/store/slices/
 *    ✓ All slices registered in src/store/index.ts
 *    ✓ Store provided in main.tsx
 *
 * 2. USE REDUX IN COMPONENTS
 *    const dispatch = useDispatch<AppDispatch>();
 *    const data = useSelector((state: RootState) => state.componentSlice.data);
 *
 * 3. DISPATCH ACTIONS
 *    await dispatch(fetchStateProfile()).unwrap();
 *    try/catch for error handling
 *
 * 4. SELECT & RENDER
 *    Show loading, error, or data based on state
 *    Use useEffect hook to fetch initial data
 *
 * 5. TEST
 *    Check console for errors
 *    Verify API calls in Network tab
 *    Check Redux state in DevTools
 */

export default documentationIndex;
