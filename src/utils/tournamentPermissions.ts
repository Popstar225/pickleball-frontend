/**
 * Tournament Role-Based Permissions
 *
 * Defines permissions for each user role in tournament management.
 * Used to control component visibility and feature access.
 *
 * @version 1.0.0
 */

export type UserRole =
  | 'tournament_organizer'
  | 'federation_admin'
  | 'state_admin'
  | 'club_admin'
  | 'club_director'
  | 'coach'
  | 'player'
  | 'guest';

export interface TournamentPermissions {
  canGenerateGroups: boolean;
  canViewStandings: boolean;
  canRecordMatches: boolean;
  canExtractQualifiers: boolean;
  canRecordBracketResults: boolean;
  canManageEvents: boolean;
  canViewOpponentInfo: boolean;
  canViewAnyGroup: boolean;
  canViewOwnGroupOnly: boolean;
}

/**
 * Get tournament permissions for a specific user role
 */
export function getTournamentPermissions(role: UserRole): TournamentPermissions {
  const permissionsMap: Record<UserRole, TournamentPermissions> = {
    // Super Admin - Full access
    tournament_organizer: {
      canGenerateGroups: true,
      canViewStandings: true,
      canRecordMatches: true,
      canExtractQualifiers: true,
      canRecordBracketResults: true,
      canManageEvents: true,
      canViewOpponentInfo: true,
      canViewAnyGroup: true,
      canViewOwnGroupOnly: false,
    },

    // Federation Admin - Manage federation-wide tournaments
    federation_admin: {
      canGenerateGroups: true,
      canViewStandings: true,
      canRecordMatches: true,
      canExtractQualifiers: true,
      canRecordBracketResults: true,
      canManageEvents: true,
      canViewOpponentInfo: true,
      canViewAnyGroup: true,
      canViewOwnGroupOnly: false,
    },

    // State Admin - Manage state tournaments
    state_admin: {
      canGenerateGroups: true,
      canViewStandings: true,
      canRecordMatches: true,
      canExtractQualifiers: true,
      canRecordBracketResults: true,
      canManageEvents: true,
      canViewOpponentInfo: true,
      canViewAnyGroup: true,
      canViewOwnGroupOnly: false,
    },

    // Club Admin - Manage club tournaments
    club_admin: {
      canGenerateGroups: true,
      canViewStandings: true,
      canRecordMatches: true,
      canExtractQualifiers: true,
      canRecordBracketResults: true,
      canManageEvents: true,
      canViewOpponentInfo: true,
      canViewAnyGroup: true,
      canViewOwnGroupOnly: false,
    },

    // Club Director - View-only access to standings
    club_director: {
      canGenerateGroups: false,
      canViewStandings: true,
      canRecordMatches: false,
      canExtractQualifiers: false,
      canRecordBracketResults: false,
      canManageEvents: false,
      canViewOpponentInfo: true,
      canViewAnyGroup: true,
      canViewOwnGroupOnly: false,
    },

    // Coach - View standings for coached players
    coach: {
      canGenerateGroups: false,
      canViewStandings: true,
      canRecordMatches: false,
      canExtractQualifiers: false,
      canRecordBracketResults: false,
      canManageEvents: false,
      canViewOpponentInfo: true,
      canViewAnyGroup: false,
      canViewOwnGroupOnly: true,
    },

    // Player - View own group only
    player: {
      canGenerateGroups: false,
      canViewStandings: true,
      canRecordMatches: false,
      canExtractQualifiers: false,
      canRecordBracketResults: false,
      canManageEvents: false,
      canViewOpponentInfo: true,
      canViewAnyGroup: false,
      canViewOwnGroupOnly: true,
    },

    // Guest - No access
    guest: {
      canGenerateGroups: false,
      canViewStandings: false,
      canRecordMatches: false,
      canExtractQualifiers: false,
      canRecordBracketResults: false,
      canManageEvents: false,
      canViewOpponentInfo: false,
      canViewAnyGroup: false,
      canViewOwnGroupOnly: false,
    },
  };

  return permissionsMap[role] || permissionsMap.guest;
}

/**
 * Check if role has specific permission
 */
export function hasPermission(role: UserRole, permission: keyof TournamentPermissions): boolean {
  const permissions = getTournamentPermissions(role);
  return permissions[permission];
}

/**
 * Should user see tournament management UI
 */
export function canManageTournaments(role: UserRole): boolean {
  const perms = getTournamentPermissions(role);
  return (
    perms.canGenerateGroups ||
    perms.canRecordMatches ||
    perms.canExtractQualifiers ||
    perms.canRecordBracketResults ||
    perms.canManageEvents
  );
}

/**
 * Should user see spectator/view UI
 */
export function canViewTournaments(role: UserRole): boolean {
  const perms = getTournamentPermissions(role);
  return perms.canViewStandings || canManageTournaments(role);
}

/**
 * Get dashboard component for role
 */
export function getTournamentDashboard(role: UserRole): string {
  switch (role) {
    case 'tournament_organizer':
    case 'federation_admin':
    case 'club_admin':
      return 'ClubTournamentDashboard';

    case 'state_admin':
      return 'FederationTournamentDashboard';

    case 'player':
      return 'PlayerTournamentView';

    case 'coach':
      return 'CoachTournamentView';

    case 'club_director':
      return 'ClubDirectorTournamentView';

    default:
      return 'TournamentView';
  }
}

/**
 * Feature visibility by role
 */
export interface RoleFeatures {
  canGenerateGroups: boolean;
  canViewGroupStandings: boolean;
  canRecordMatches: boolean;
  canSelectQualifiers: boolean;
  canManageBracket: boolean;
  viewScope: 'all' | 'own' | 'club' | 'none';
}

export function getRoleFeatures(role: UserRole): RoleFeatures {
  switch (role) {
    case 'tournament_organizer':
    case 'federation_admin':
    case 'state_admin':
    case 'club_admin':
      return {
        canGenerateGroups: true,
        canViewGroupStandings: true,
        canRecordMatches: true,
        canSelectQualifiers: true,
        canManageBracket: true,
        viewScope: 'all',
      };

    case 'club_director':
      return {
        canGenerateGroups: false,
        canViewGroupStandings: true,
        canRecordMatches: false,
        canSelectQualifiers: false,
        canManageBracket: false,
        viewScope: 'club',
      };

    case 'coach':
      return {
        canGenerateGroups: false,
        canViewGroupStandings: true,
        canRecordMatches: false,
        canSelectQualifiers: false,
        canManageBracket: false,
        viewScope: 'own',
      };

    case 'player':
      return {
        canGenerateGroups: false,
        canViewGroupStandings: true,
        canRecordMatches: false,
        canSelectQualifiers: false,
        canManageBracket: false,
        viewScope: 'own',
      };

    default:
      return {
        canGenerateGroups: false,
        canViewGroupStandings: false,
        canRecordMatches: false,
        canSelectQualifiers: false,
        canManageBracket: false,
        viewScope: 'none',
      };
  }
}

/**
 * Middleware to check tournament access
 */
export function checkTournamentAccess(
  userRole: UserRole,
  requiredPermission: keyof TournamentPermissions,
): { allowed: boolean; reason?: string } {
  const permissions = getTournamentPermissions(userRole);

  if (!permissions[requiredPermission]) {
    return {
      allowed: false,
      reason: `Your role (${userRole}) does not have permission to ${requiredPermission}`,
    };
  }

  return { allowed: true };
}

/**
 * Example usage in components:
 *
 * import { getTournamentPermissions, hasPermission } from '@/utils/tournamentPermissions';
 *
 * const permissions = getTournamentPermissions(userRole);
 *
 * if (hasPermission(userRole, 'canGenerateGroups')) {
 *   // Show group generation UI
 * }
 *
 * if (permissions.canViewAnyGroup) {
 *   // Show all groups
 * } else if (permissions.canViewOwnGroupOnly) {
 *   // Show only user's group
 * }
 */
