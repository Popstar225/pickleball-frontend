/**
 * REDUX SLICES QUICK REFERENCE
 * Complete list of all Redux actions for each dashboard with descriptions
 */

// ============================================================================
// STATE DASHBOARD SLICE ACTIONS
// ============================================================================

export const stateDashboardActions = {
  asyncThunks: {
    fetchStateProfile: {
      name: 'fetchStateProfile',
      description: 'Fetch current state profile from API',
      dispatch: 'dispatch(fetchStateProfile())',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['profileLoading', 'profileError'],
      returnValue: 'StateProfile',
    },
    updateStateProfile: {
      name: 'updateStateProfile',
      description: 'Update state profile information',
      dispatch: 'dispatch(updateStateProfile({stateName: "..."})))',
      payload: 'Partial<StateProfile>',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['updating', 'profileError'],
      returnValue: 'StateProfile',
    },
    deleteStateAccount: {
      name: 'deleteStateAccount',
      description: 'Delete state account permanently',
      dispatch: 'dispatch(deleteStateAccount(confirmationToken))',
      payload: 'string (confirmationToken)',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['deleting', 'error'],
      returnValue: '{message: string}',
    },
    fetchStateStatistics: {
      name: 'fetchStateStatistics',
      description: 'Fetch state dashboard statistics',
      dispatch: 'dispatch(fetchStateStatistics())',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['statisticsLoading', 'error'],
      returnValue: 'StateStatistics',
    },
    fetchStateActivities: {
      name: 'fetchStateActivities',
      description: 'Fetch recent state activities',
      dispatch: 'dispatch(fetchStateActivities({limit: 10, offset: 0}))',
      payload: '{limit?: number, offset?: number}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['activitiesLoading', 'error'],
      returnValue: '{activities: Activity[], total: number}',
    },
    fetchUpcomingEvents: {
      name: 'fetchUpcomingEvents',
      description: 'Fetch upcoming state events',
      dispatch: 'dispatch(fetchUpcomingEvents({limit: 10}))',
      payload: '{limit?: number}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['eventsLoading', 'error'],
      returnValue: '{events: Event[], total: number}',
    },
    createStateEvent: {
      name: 'createStateEvent',
      description: 'Create new state event',
      dispatch: 'dispatch(createStateEvent({...eventData}))',
      payload: 'Omit<Event, "id">',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['eventsLoading', 'error'],
      returnValue: 'Event',
    },
  },
  syncActions: {
    clearError: {
      name: 'clearError',
      description: 'Clear general error message',
      dispatch: 'dispatch(clearError())',
      clearState: 'error = null',
    },
    clearProfileError: {
      name: 'clearProfileError',
      description: 'Clear profile-specific error',
      dispatch: 'dispatch(clearProfileError())',
      clearState: 'profileError = null',
    },
    resetDashboard: {
      name: 'resetDashboard',
      description: 'Reset entire state dashboard to initial state',
      dispatch: 'dispatch(resetDashboard())',
      resetState: 'All state reset to initialState',
    },
  },
  sliceSelector: 'state.stateDashboard',
};

// ============================================================================
// PLAYER DASHBOARD SLICE ACTIONS
// ============================================================================

export const playerDashboardActions = {
  asyncThunks: {
    fetchPlayerProfile: {
      name: 'fetchPlayerProfile',
      description: 'Fetch current player profile',
      dispatch: 'dispatch(fetchPlayerProfile())',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['profileLoading', 'profileError'],
      returnValue: 'PlayerProfile',
    },
    updatePlayerProfile: {
      name: 'updatePlayerProfile',
      description: 'Update player profile',
      dispatch: 'dispatch(updatePlayerProfile({level: "Advanced"}))',
      payload: 'Partial<PlayerProfile>',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['updating', 'profileError'],
      returnValue: 'PlayerProfile',
    },
    deletePlayerAccount: {
      name: 'deletePlayerAccount',
      description: 'Delete player account',
      dispatch: 'dispatch(deletePlayerAccount(token))',
      payload: 'string (confirmationToken)',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['deleting', 'error'],
    },
    fetchPlayerCredentials: {
      name: 'fetchPlayerCredentials',
      description: 'Fetch digital credentials',
      dispatch: 'dispatch(fetchPlayerCredentials())',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['credentialsLoading', 'error'],
      returnValue: '{credentials: DigitalCredential[]}',
    },
    renewPlayerCredential: {
      name: 'renewPlayerCredential',
      description: 'Renew credential with Stripe payment',
      dispatch: 'dispatch(renewPlayerCredential({credentialId, stripePaymentMethodId}))',
      payload: '{credentialId: string, stripePaymentMethodId: string}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['renewing', 'error'],
      returnValue: '{paymentId: string, paymentStatus: string}',
    },
    searchClubs: {
      name: 'searchClubs',
      description: 'Search for clubs',
      dispatch: 'dispatch(searchClubs({query, city, limit, offset}))',
      payload: '{query: string, city?: string, state?: string, limit?: number, offset?: number}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['searching', 'error'],
      returnValue: '{clubs: Club[], total: number}',
    },
    joinClub: {
      name: 'joinClub',
      description: 'Request to join a club',
      dispatch: 'dispatch(joinClub({clubId, message?}))',
      payload: '{clubId: string, message?: string}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['joining', 'error'],
      returnValue: '{requestId: string, status: string}',
    },
    getPlayerClubs: {
      name: 'getPlayerClubs',
      description: 'Get clubs player is member of',
      dispatch: 'dispatch(getPlayerClubs())',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['clLoading', 'error'],
      returnValue: '{clubs: Club[], total: number}',
    },
    fetchPlayerTournaments: {
      name: 'fetchPlayerTournaments',
      description: 'Fetch player tournament registrations',
      dispatch: 'dispatch(fetchPlayerTournaments())',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['tournamentsLoading', 'error'],
      returnValue: '{registrations: TournamentRegistration[]}',
    },
    registerTournament: {
      name: 'registerTournament',
      description: 'Register for a tournament with payment',
      dispatch: 'dispatch(registerTournament({tournamentId, category, stripePaymentMethodId}))',
      payload: '{tournamentId: string, category: string, stripePaymentMethodId: string}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['registering', 'error'],
    },
    fetchPlayerMessages: {
      name: 'fetchPlayerMessages',
      description: 'Fetch player messages',
      dispatch: 'dispatch(fetchPlayerMessages({limit, offset}))',
      payload: '{limit?: number, offset?: number}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['messagesLoading', 'error'],
      returnValue: '{messages: Message[], total: number, unread: number}',
    },
    sendPlayerMessage: {
      name: 'sendPlayerMessage',
      description: 'Send a message',
      dispatch: 'dispatch(sendPlayerMessage({to, subject, body}))',
      payload: '{to: string, subject: string, body: string}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['sending', 'error'],
    },
    fetchPlayerPayments: {
      name: 'fetchPlayerPayments',
      description: 'Fetch payment history',
      dispatch: 'dispatch(fetchPlayerPayments({limit, offset}))',
      payload: '{limit?: number, offset?: number}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['paymentsLoading', 'error'],
      returnValue: '{payments: Payment[], total: number}',
    },
  },
  sliceSelector: 'state.playerDashboard',
};

// ============================================================================
// CLUB DASHBOARD SLICE ACTIONS
// ============================================================================

export const clubDashboardActions = {
  asyncThunks: {
    fetchClubProfile: {
      name: 'fetchClubProfile',
      description: 'Fetch club profile',
      dispatch: 'dispatch(fetchClubProfile())',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['profileLoading', 'profileError'],
      returnValue: 'ClubProfile',
    },
    updateClubProfile: {
      name: 'updateClubProfile',
      description: 'Update club profile',
      dispatch: 'dispatch(updateClubProfile({name: "..."}))',
      payload: 'Partial<ClubProfile>',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['updating', 'profileError'],
      returnValue: 'ClubProfile',
    },
    deleteClubAccount: {
      name: 'deleteClubAccount',
      description: 'Delete club account',
      dispatch: 'dispatch(deleteClubAccount(token))',
      payload: 'string',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['deleting', 'error'],
    },
    fetchClubStatistics: {
      name: 'fetchClubStatistics',
      description: 'Fetch club statistics',
      dispatch: 'dispatch(fetchClubStatistics())',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['statsLoading', 'error'],
      returnValue: 'ClubStatistics',
    },
    fetchClubMembers: {
      name: 'fetchClubMembers',
      description: 'Fetch club members with pagination',
      dispatch: 'dispatch(fetchClubMembers({clubId, limit, offset, status}))',
      payload: '{clubId: string, limit?: number, offset?: number, status?: string}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['membersLoading', 'error'],
      returnValue: '{members: ClubMember[], total: number}',
    },
    addClubMember: {
      name: 'addClubMember',
      description: 'Add new member to club',
      dispatch: 'dispatch(addClubMember({playerId, membershipFee, notes}))',
      payload: '{playerId: string, membershipFee: number, notes?: string}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['adding', 'error'],
      returnValue: 'ClubMember',
    },
    updateClubMember: {
      name: 'updateClubMember',
      description: 'Update club member info',
      dispatch: 'dispatch(updateClubMember({memberId, data}))',
      payload: '{memberId: string, data: Partial<ClubMember>}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['updating', 'error'],
      returnValue: 'ClubMember',
    },
    removeClubMember: {
      name: 'removeClubMember',
      description: 'Remove member from club',
      dispatch: 'dispatch(removeClubMember(memberId))',
      payload: 'string (memberId)',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['deleting', 'error'],
    },
    fetchClubMembershipFees: {
      name: 'fetchClubMembershipFees',
      description: 'Fetch membership fee payments',
      dispatch: 'dispatch(fetchClubMembershipFees({limit, offset}))',
      payload: '{limit?: number, offset?: number}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['feesLoading', 'error'],
      returnValue: '{payments: MembershipPayment[], totalDue: number, totalPaid: number}',
    },
    sendMembershipReminder: {
      name: 'sendMembershipReminder',
      description: 'Send payment reminder to members',
      dispatch: 'dispatch(sendMembershipReminder({memberIds, message}))',
      payload: '{memberIds: string[], message: string}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['sending', 'error'],
    },
    fetchFederationMembership: {
      name: 'fetchFederationMembership',
      description: 'Fetch federation membership status',
      dispatch: 'dispatch(fetchFederationMembership())',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['federationLoading', 'error'],
      returnValue: '{status: string, renewalDate: string, ...}',
    },
    renewFederationMembership: {
      name: 'renewFederationMembership',
      description: 'Renew federation membership',
      dispatch: 'dispatch(renewFederationMembership(paymentMethodId))',
      payload: 'string (stripePaymentMethodId)',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['renewing', 'error'],
    },
  },
  sliceSelector: 'state.clubDashboard',
};

// ============================================================================
// PARTNER DASHBOARD SLICE ACTIONS
// ============================================================================

export const partnerDashboardActions = {
  asyncThunks: {
    fetchPartnerProfile: {
      name: 'fetchPartnerProfile',
      description: 'Fetch partner profile',
      dispatch: 'dispatch(fetchPartnerProfile())',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['profileLoading', 'profileError'],
      returnValue: 'PartnerProfile',
    },
    updatePartnerProfile: {
      name: 'updatePartnerProfile',
      description: 'Update partner profile',
      dispatch: 'dispatch(updatePartnerProfile({sponsorshipLevel: "Platinum"}))',
      payload: 'Partial<PartnerProfile>',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['updating', 'profileError'],
    },
    deletePartnerAccount: {
      name: 'deletePartnerAccount',
      description: 'Delete partner account',
      dispatch: 'dispatch(deletePartnerAccount(token))',
      payload: 'string',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['deleting', 'error'],
    },
    fetchPartnerMessages: {
      name: 'fetchPartnerMessages',
      description: 'Fetch partner messages',
      dispatch: 'dispatch(fetchPartnerMessages({limit, offset}))',
      payload: '{limit?: number, offset?: number}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['messagesLoading', 'error'],
    },
    sendPartnerMessage: {
      name: 'sendPartnerMessage',
      description: 'Send message from partner',
      dispatch: 'dispatch(sendPartnerMessage({to, subject, body}))',
      payload: '{to: string, subject: string, body: string}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['sending', 'error'],
    },
    fetchPartnerPayments: {
      name: 'fetchPartnerPayments',
      description: 'Fetch sponsorship payments',
      dispatch: 'dispatch(fetchPartnerPayments({limit, offset}))',
      payload: '{limit?: number, offset?: number}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['paymentsLoading', 'error'],
    },
  },
  sliceSelector: 'state.partnerDashboard',
};

// ============================================================================
// COACH DASHBOARD SLICE ACTIONS
// ============================================================================

export const coachDashboardActions = {
  asyncThunks: {
    fetchCoachProfile: {
      name: 'fetchCoachProfile',
      description: 'Fetch coach profile',
      dispatch: 'dispatch(fetchCoachProfile())',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['profileLoading', 'profileError'],
      returnValue: 'CoachProfile',
    },
    updateCoachProfile: {
      name: 'updateCoachProfile',
      description: 'Update coach profile',
      dispatch: 'dispatch(updateCoachProfile({hourlyRate: 600}))',
      payload: 'Partial<CoachProfile>',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['updating', 'profileError'],
    },
    deleteCoachAccount: {
      name: 'deleteCoachAccount',
      description: 'Delete coach account',
      dispatch: 'dispatch(deleteCoachAccount(token))',
      payload: 'string',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['deleting', 'error'],
    },
    fetchCoachCredentials: {
      name: 'fetchCoachCredentials',
      description: 'Fetch NRTP credentials',
      dispatch: 'dispatch(fetchCoachCredentials())',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['credentialsLoading', 'error'],
      returnValue: '{credentials: Credential[]}',
    },
    renewCoachCredential: {
      name: 'renewCoachCredential',
      description: 'Renew NRTP credential',
      dispatch: 'dispatch(renewCoachCredential({credentialId, stripePaymentMethodId}))',
      payload: '{credentialId: string, stripePaymentMethodId: string}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['renewing', 'error'],
      renewalFee: 3000,
    },
    fetchCoachStudents: {
      name: 'fetchCoachStudents',
      description: 'Fetch list of students',
      dispatch: 'dispatch(fetchCoachStudents({limit, offset}))',
      payload: '{limit?: number, offset?: number}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['studentsLoading', 'error'],
      returnValue: '{students: Student[], total: number}',
    },
    fetchCoachMessages: {
      name: 'fetchCoachMessages',
      description: 'Fetch coach messages',
      dispatch: 'dispatch(fetchCoachMessages({limit, offset}))',
      payload: '{limit?: number, offset?: number}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['messagesLoading', 'error'],
    },
    fetchCoachPayments: {
      name: 'fetchCoachPayments',
      description: 'Fetch earnings and payments',
      dispatch: 'dispatch(fetchCoachPayments({limit, offset}))',
      payload: '{limit?: number, offset?: number}',
      states: ['pending', 'fulfilled', 'rejected'],
      stateKeys: ['paymentsLoading', 'error'],
      returnValue: '{payments: Payment[], total: number, totalEarnings: number}',
    },
  },
  sliceSelector: 'state.coachDashboard',
};

// ============================================================================
// QUICK USAGE REFERENCE
// ============================================================================

export const quickReference = `
// IMPORT
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchStateProfile, updateStateProfile } from '@/store/slices/stateDashboardSlice';

// HOOK SETUP
const dispatch = useDispatch<AppDispatch>();
const profile = useSelector((state: RootState) => state.stateDashboard.profile);
const loading = useSelector((state: RootState) => state.stateDashboard.profileLoading);
const error = useSelector((state: RootState) => state.stateDashboard.profileError);

// USE IN EFFECT
useEffect(() => {
  dispatch(fetchStateProfile());
}, [dispatch]);

// HANDLE ACTION
const handleUpdate = async (data: Partial<StateProfile>) => {
  try {
    await dispatch(updateStateProfile(data)).unwrap();
    toast({ title: 'Success' });
  } catch (err) {
    toast({ title: 'Error', variant: 'destructive' });
  }
};

// CONDITIONAL RENDERING
{loading && <Spinner />}
{error && <ErrorAlert />}
{profile && <ProfileContent />}
`;

export default {
  stateDashboardActions,
  playerDashboardActions,
  clubDashboardActions,
  partnerDashboardActions,
  coachDashboardActions,
  quickReference,
};
