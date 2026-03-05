/**
 * TournamentStartWorkflow.tsx
 *
 * Main organizer dashboard component for tournament start workflow
 * Handles:
 * 1. Pre-flight validation
 * 2. Event health status display
 * 3. Event management actions (cancel, change format, merge)
 * 4. Final confirmation before start
 * 5. Post-start view (groups, brackets, results)
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import tournament actions
import {
  validateTournamentStart,
  startTournament,
  fetchTournamentDetails,
  cancelEvent,
  changeEventFormat,
  mergeEvents,
} from '@/store/slices/tournamentSlice';

// Import sub-components
import { EventHealthCard } from './EventHealthCard';
import { EventManagementTable } from './EventManagementTable';
import { PreflightValidationPanel } from './PreflightValidationPanel';
import { FinalConfirmationModal } from './FinalConfirmationModal';
import { InsufficientEntriesDialog } from './InsufficientEntriesDialog';
import { PostStartView } from './PostStartView';

export default function TournamentStartWorkflow() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const tournament = useSelector((state: any) => state.tournament.currentTournament);
  const validation = useSelector((state: any) => state.tournament.validation);
  const loading = useSelector((state: any) => state.tournament.loading);

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInsufficientDialog, setShowInsufficientDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // helper to open the insufficient dialog for any event-level action
  const handleEventAction = (action: string, event: any) => {
    setSelectedEvent(event);
    if (['cancel', 'format', 'merge', 'insufficient'].includes(action)) {
      setShowInsufficientDialog(true);
    }
  };

  // Fetch tournament details on load
  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentDetails(tournamentId) as any);
    }
  }, [tournamentId, dispatch]);

  // Validate tournament readiness
  useEffect(() => {
    if (tournamentId && !validation) {
      dispatch(validateTournamentStart(tournamentId) as any);
    }
  }, [tournamentId, validation, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Tournament not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const canStart = validation?.valid && tournament.status !== 'in_progress';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <p className="text-gray-500 mt-1">
            {tournament.venue_name} • {tournament.state}, {tournament.city}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/tournaments/${tournamentId}`)}>
          Back to Tournament
        </Button>
      </div>

      {/* Status Badge */}
      <StatusBadge tournament={tournament} />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events Management</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          {tournament.status === 'in_progress' && (
            <TabsTrigger value="progress">Tournament Progress</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Status</CardTitle>
              <CardDescription>Current state and key information</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-semibold capitalize">{tournament.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="text-lg font-semibold">
                  {new Date(tournament.start_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Registrations</p>
                <p className="text-lg font-semibold">{tournament.current_participants}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Events</p>
                <p className="text-lg font-semibold">{tournament.events?.length || 0}</p>
              </div>
            </CardContent>
          </Card>

          {/* Event Health Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Event Health Check</CardTitle>
              <CardDescription>Traffic light status of all tournament events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tournament.events?.map((event) => (
                  <EventHealthCard
                    key={event.id}
                    event={event}
                    onAction={(action) => handleEventAction(action, event)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          {tournament.status !== 'in_progress' && (
            <Card
              className={canStart ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}
            >
              <CardHeader>
                <CardTitle>Ready to Start?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!canStart && validation?.issues && validation.issues.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {validation.issues.length} issue{validation.issues.length > 1 ? 's' : ''} to
                      resolve before starting
                    </AlertDescription>
                  </Alert>
                )}

                {canStart && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Tournament is ready to start!
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  size="lg"
                  disabled={!canStart}
                  onClick={() => setShowConfirmation(true)}
                  className="w-full"
                >
                  {canStart ? 'Start Tournament' : 'Resolve Issues First'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Events Management Tab */}
        <TabsContent value="events">
          <EventManagementTable
            events={tournament.events}
            onAction={(action, event) => handleEventAction(action, event)}
          />
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation">
          <PreflightValidationPanel validation={validation} />
        </TabsContent>

        {/* Tournament Progress Tab */}
        {tournament.status === 'in_progress' && (
          <TabsContent value="progress">
            <PostStartView tournament={tournament} events={tournament.events} />
          </TabsContent>
        )}
      </Tabs>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <FinalConfirmationModal
          isOpen={showConfirmation}
          isLoading={loading}
          tournament={tournament}
          onConfirm={async () => {
            await dispatch(startTournament({ tournamentId }) as any);
            setShowConfirmation(false);
          }}
          onCancel={() => setShowConfirmation(false)}
        />
      )}

      {/* Insufficient Entries Dialog */}
      {showInsufficientDialog && selectedEvent && (
        <InsufficientEntriesDialog
          isOpen={showInsufficientDialog}
          isLoading={loading}
          event={selectedEvent}
          otherEvents={tournament.events?.filter((e: any) => e.id !== selectedEvent.id) || []}
          onAction={async (action, details) => {
            // dispatch appropriate thunk based on chosen action
            try {
              if (action === 'cancel') {
                await dispatch(
                  cancelEvent({
                    tournamentId: tournamentId || '',
                    eventId: selectedEvent.id,
                    reason: details.comments || '',
                  }) as any,
                ).unwrap();
              } else if (action === 'format') {
                await dispatch(
                  changeEventFormat({
                    tournamentId: tournamentId || '',
                    eventId: selectedEvent.id,
                    newFormat: 'single_elimination', // assume conversion to SE
                    reason: details.comments || '',
                  }) as any,
                ).unwrap();
              } else if (action === 'merge') {
                await dispatch(
                  mergeEvents({
                    tournamentId: tournamentId || '',
                    sourceEventId: selectedEvent.id,
                    targetEventId: details.targetEventId,
                    reason: details.comments || '',
                  }) as any,
                ).unwrap();
              }
            } catch (err) {
              console.error('Failed to perform event action', err);
            }
            setShowInsufficientDialog(false);
            setSelectedEvent(null);
            // refresh tournament details to pick up any changes
            if (tournamentId) dispatch(fetchTournamentDetails(tournamentId) as any);
          }}
          onCancel={() => {
            setShowInsufficientDialog(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ tournament }) {
  const statusConfig = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
    pending_validation: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
    approved: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
    registration_open: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    in_progress: { bg: 'bg-purple-100', text: 'text-purple-800', icon: CheckCircle },
    completed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
  };

  const config = statusConfig[tournament.status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.text}`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium capitalize">{tournament.status.replace(/_/g, ' ')}</span>
    </div>
  );
}
