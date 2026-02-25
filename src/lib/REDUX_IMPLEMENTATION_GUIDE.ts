/**
 * DASHBOARD REDUX IMPLEMENTATION GUIDE
 * Complete examples for integrating Redux slices in dashboard components
 */

// ============================================================================
// STATE DASHBOARD - IMPLEMENTATION EXAMPLES
// ============================================================================

/**
 * Example 1: StateAccountPage Component with Redux
 * File: src/pages/state/dashboard/StateAccountPage.tsx
 */

const stateAccountPageExample = `
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchStateProfile,
  updateStateProfile,
  deleteStateAccount,
  clearProfileError,
} from '@/store/slices/stateDashboardSlice';

export default function StateAccountPage() {
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.stateDashboard.profile);
  const loading = useSelector((state: RootState) => state.stateDashboard.profileLoading);
  const error = useSelector((state: RootState) => state.stateDashboard.profileError);
  const updating = useSelector((state: RootState) => state.stateDashboard.updating);
  const deleting = useSelector((state: RootState) => state.stateDashboard.deleting);

  useEffect(() => {
    dispatch(fetchStateProfile());
  }, [dispatch]);

  const handleSaveProfile = async (data: Partial<StateProfile>) => {
    try {
      await dispatch(updateStateProfile(data)).unwrap();
      // Show success toast
      toast({ title: 'Profile updated', description: 'Changes saved successfully' });
    } catch (err) {
      // Show error toast
      toast({ 
        title: 'Error', 
        description: error || 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAccount = async (token: string) => {
    try {
      await dispatch(deleteStateAccount(token)).unwrap();
      // Redirect to login
      dispatch(logout());
      navigate('/');
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete account',
        variant: 'destructive'
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} />}
      <ProfileForm 
        profile={profile}
        loading={updating}
        onSave={handleSaveProfile}
      />
      {/* ... rest of component */}
    </div>
  );
}
`;

/**
 * Example 2: StateDashboardHome Component with Redux
 */

const stateDashboardHomeExample = `
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchStateStatistics,
  fetchStateActivities,
  fetchUpcomingEvents,
} from '@/store/slices/stateDashboardSlice';

export default function StateDashboardHome() {
  const dispatch = useDispatch<AppDispatch>();
  const stats = useSelector((state: RootState) => state.stateDashboard.statistics);
  const activities = useSelector((state: RootState) => state.stateDashboard.activities);
  const events = useSelector((state: RootState) => state.stateDashboard.events);
  const statsLoading = useSelector((state: RootState) => state.stateDashboard.statisticsLoading);
  const activitiesLoading = useSelector((state: RootState) => state.stateDashboard.activitiesLoading);
  const eventsLoading = useSelector((state: RootState) => state.stateDashboard.eventsLoading);

  useEffect(() => {
    dispatch(fetchStateStatistics());
    dispatch(fetchStateActivities({ limit: 10, offset: 0 }));
    dispatch(fetchUpcomingEvents({ limit: 10 }));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} loading={statsLoading} />
      <ActivitySection activities={activities} loading={activitiesLoading} />
      <EventsSection events={events} loading={eventsLoading} />
    </div>
  );
}
`;

// ============================================================================
// PLAYER DASHBOARD - IMPLEMENTATION EXAMPLES
// ============================================================================

/**
 * Example 3: PlayerAccountPage with Redux
 */

const playerAccountPageExample = `
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchPlayerProfile,
  updatePlayerProfile,
  deletePlayerAccount,
} from '@/store/slices/playerDashboardSlice';

export default function PlayerAccountPage() {
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.playerDashboard.profile);
  const loading = useSelector((state: RootState) => state.playerDashboard.profileLoading);

  useEffect(() => {
    dispatch(fetchPlayerProfile());
  }, [dispatch]);

  const handleUpdateProfile = async (data: Partial<PlayerProfile>) => {
    try {
      await dispatch(updatePlayerProfile(data)).unwrap();
      toast({ title: 'Success', description: 'Profile updated' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
    }
  };

  return (
    <div>
      {loading ? <Spinner /> : (
        <ProfileForm profile={profile} onSubmit={handleUpdateProfile} />
      )}
    </div>
  );
}
`;

/**
 * Example 4: PlayerCredentialsPage with Redux
 */

const playerCredentialsPageExample = `
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchPlayerCredentials,
  renewPlayerCredential,
} from '@/store/slices/playerDashboardSlice';

export default function PlayerCredentialsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const credentials = useSelector((state: RootState) => state.playerDashboard.credentials);
  const loading = useSelector((state: RootState) => state.playerDashboard.credentialsLoading);
  const renewing = useSelector((state: RootState) => state.playerDashboard.renewing);

  useEffect(() => {
    dispatch(fetchPlayerCredentials());
  }, [dispatch]);

  const handleRenewCredential = async (credentialId: string, paymentMethodId: string) => {
    try {
      const result = await dispatch(
        renewPlayerCredential({ credentialId, stripePaymentMethodId: paymentMethodId })
      ).unwrap();
      toast({ title: 'Success', description: 'Payment processing initiated' });
    } catch (error) {
      toast({ title: 'Error', description: 'Payment failed', variant: 'destructive' });
    }
  };

  return (
    <div>
      {credentials?.map(cred => (
        <CredentialCard
          key={cred.id}
          credential={cred}
          loading={renewing}
          onRenew={handleRenewCredential}
        />
      ))}
    </div>
  );
}
`;

/**
 * Example 5: PlayerClubsPage (Search and Join)
 */

const playerClubsPageExample = `
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  searchClubs,
  joinClub,
  getPlayerClubs,
} from '@/store/slices/playerDashboardSlice';

export default function PlayerClubsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState('');
  const searchResults = useSelector((state: RootState) => state.playerDashboard.searchResults);
  const myClubs = useSelector((state: RootState) => state.playerDashboard.myClubs);
  const searching = useSelector((state: RootState) => state.playerDashboard.searching);
  const joining = useSelector((state: RootState) => state.playerDashboard.joining);

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      dispatch(searchClubs({ query, limit: 10, offset: 0 }));
    }
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      await dispatch(joinClub({ clubId, message: '' })).unwrap();
      toast({ title: 'Success', description: 'Request sent to club' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to join club', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <SearchBar value={searchQuery} onChange={setSearchQuery} onSearch={handleSearch} />
      <div>
        <h2>Search Results</h2>
        {searching ? <Spinner /> : (
          <ClubList clubs={searchResults} onJoin={handleJoinClub} joining={joining} />
        )}
      </div>
      <div>
        <h2>My Clubs</h2>
        <ClubList clubs={myClubs} />
      </div>
    </div>
  );
}
`;

// ============================================================================
// CLUB DASHBOARD - IMPLEMENTATION EXAMPLES
// ============================================================================

/**
 * Example 6: ClubMembersPage with Redux
 */

const clubMembersPageExample = `
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchClubMembers,
  addClubMember,
  updateClubMember,
  removeClubMember,
} from '@/store/slices/clubDashboardSlice';

export default function ClubMembersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const members = useSelector((state: RootState) => state.clubDashboard.members);
  const loading = useSelector((state: RootState) => state.clubDashboard.membersLoading);
  const isAdding = useSelector((state: RootState) => state.clubDashboard.adding);
  const [page, setPage] = useState(0);

  useEffect(() => {
    dispatch(fetchClubMembers({ limit: 20, offset: page * 20 }));
  }, [dispatch, page]);

  const handleAddMember = async (playerId: string, fee: number) => {
    try {
      await dispatch(addClubMember({ playerId, membershipFee: fee })).unwrap();
      toast({ title: 'Success', description: 'Member added to club' });
      dispatch(fetchClubMembers({ limit: 20, offset: 0 }));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add member', variant: 'destructive' });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await dispatch(removeClubMember(memberId)).unwrap();
      toast({ title: 'Success', description: 'Member removed' });
      dispatch(fetchClubMembers({ limit: 20, offset: page * 20 }));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove member', variant: 'destructive' });
    }
  };

  return (
    <div>
      <MembersTable
        members={members}
        loading={loading}
        onAdd={handleAddMember}
        onRemove={handleRemoveMember}
        isAdding={isAdding}
      />
      <Pagination page={page} onPageChange={setPage} />
    </div>
  );
}
`;

// ============================================================================
// COACH DASHBOARD - IMPLEMENTATION EXAMPLES
// ============================================================================

/**
 * Example 7: CoachCredentialsPage with Redux
 */

const coachCredentialsPageExample = `
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchCoachCredentials,
  renewCoachCredential,
} from '@/store/slices/coachDashboardSlice';

export default function CoachCredentialsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const credentials = useSelector((state: RootState) => state.coachDashboard.credentials);
  const loading = useSelector((state: RootState) => state.coachDashboard.credentialsLoading);
  const renewing = useSelector((state: RootState) => state.coachDashboard.renewing);

  useEffect(() => {
    dispatch(fetchCoachCredentials());
  }, [dispatch]);

  const handleRenewNRTP = async (credentialId: string, paymentMethodId: string) => {
    try {
      const result = await dispatch(
        renewCoachCredential({ credentialId, stripePaymentMethodId: paymentMethodId })
      ).unwrap();
      
      toast({
        title: 'Success',
        description: \`Renewal payment of MXN \${result.renewalAmount} will be processed\`,
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Renewal failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {credentials?.map(cred => (
        <CredentialCard
          key={cred.id}
          credential={cred}
          loading={renewing}
          onRenew={handleRenewNRTP}
        />
      ))}
    </div>
  );
}
`;

// ============================================================================
// ASYNC THUNK RESPONSE HANDLING PATTERNS
// ============================================================================

export const asyncThunkPatterns = {
  withUnwrap: `
    const handleFetch = async () => {
      try {
        const result = await dispatch(fetchStateProfile()).unwrap();
        console.log('Success:', result);
      } catch (error) {
        console.error('Error:', error);
      }
    };
  `,

  withPendingFulfilled: `
    useEffect(() => {
      dispatch(fetchStateProfile())
        .then((action) => {
          if (action.payload) {
            console.log('Fulfilled:', action.payload);
          } else {
            console.error('Rejected:', action);
          }
        });
    }, [dispatch]);
  `,

  typeScript: `
    interface ThunkResponse {
      success: boolean;
      data?: ProfileType;
      error?: string;
    }

    const result = await dispatch(fetchStateProfile()).unwrap() as ThunkResponse;
  `,
};

// ============================================================================
// COMMON REDUX PATTERNS FOR DASHBOARDS
// ============================================================================

export const commonPatterns = {
  loadingIndicator: `
    const { loading } = useSelector((state: RootState) => state.stateDashboard);
    
    return (
      <div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <Content />
        )}
      </div>
    );
  `,

  errorHandling: `
    const { error, profileError } = useSelector((state: RootState) => state.stateDashboard);
    
    return (
      <div>
        {error && <ErrorAlert message={error} onDismiss={() => dispatch(clearError())} />}
        {profileError && <ErrorAlert message={profileError} onDismiss={() => dispatch(clearProfileError())} />}
        <Content />
      </div>
    );
  `,

  pagination: `
    const { pagination } = useSelector((state: RootState) => state.clubDashboard);
    const [page, setPage] = useState(0);
    
    const handlePageChange = (newPage: number) => {
      dispatch(fetchClubMembers({ limit: 20, offset: newPage * 20 }));
      setPage(newPage);
    };
  `,

  optimisticUpdates: `
    const handleUpdateProfile = (data: Partial<Profile>) => {
      // Optimistic update
      setLocalProfile({ ...profile, ...data });
      
      // Then dispatch to Redux
      dispatch(updateStateProfile(data))
        .unwrap()
        .catch((error) => {
          // Revert on error
          setLocalProfile(profile);
          toast({ description: 'Update failed', variant: 'destructive' });
        });
    };
  `,
};

export default {
  stateAccountPageExample,
  stateDashboardHomeExample,
  playerAccountPageExample,
  playerCredentialsPageExample,
  playerClubsPageExample,
  clubMembersPageExample,
  coachCredentialsPageExample,
  asyncThunkPatterns,
  commonPatterns,
};
