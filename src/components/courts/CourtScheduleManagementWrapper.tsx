'use client';

import CourtScheduleManagement from './CourtScheduleManagement';

/**
 * Wrapper component that automatically mounts CourtScheduleManagement
 * Used in routes for clean route configuration
 */
export default function CourtScheduleManagementWrapper() {
  return <CourtScheduleManagement />;
}
