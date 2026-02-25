import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Users,
  Trophy,
  Calendar,
  Settings,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Award,
  AlertTriangle,
} from 'lucide-react';

// Redux imports
import { AppDispatch, RootState } from '@/store';
import {
  fetchTournamentEvents,
  fetchTournamentEvent,
  createTournamentEvent,
  updateTournamentEvent,
  deleteTournamentEvent,
  generateGroups,
  fetchEventStandings,
  fetchEventRegistrations,
  registerForEvent,
  fetchEventGroups,
  fetchEventMatches,
  createTournamentMatch,
  recordMatchResult,
  finalizeGroup,
  checkRegistrationEligibility,
} from '@/store/slices/tournamentsSlice';
import { fetchClubProfile } from '@/store/slices/clubDashboardSlice';

// Types
import type {
  TournamentEvent,
  CreateTournamentEventRequest,
  UpdateTournamentEventRequest,
  RegisterForEventRequest,
  CreateTournamentMatchRequest,
  RecordMatchResultRequest,
  EligibilityCheckResponse,
  TournamentOrganizerPermissions,
} from '@/types/api';

interface TournamentEventManagementProps {
  tournamentId: string;
}

const TournamentEventManagement: React.FC<TournamentEventManagementProps> = ({ tournamentId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    tournamentEvents,
    currentEvent,
    eventRegistrations,
    eventGroups,
    eventMatches,
    groupStandings,
    loading,
    error,
  } = useSelector((state: RootState) => state.tournaments);

  const { profile } = useSelector((state: any) => state.clubDashboard);

  // Local state
  const [activeTab, setActiveTab] = useState('events');
  const [selectedEvent, setSelectedEvent] = useState<TournamentEvent | null>(null);
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [organizerPermissions, setOrganizerPermissions] = useState<
    TournamentOrganizerPermissions['data'] | null
  >(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [eventFormData, setEventFormData] = useState<CreateTournamentEventRequest>({
    skill_block: '3.0',
    gender: 'male',
    modality: 'singles',
    max_participants: 64,
    minimum_participants: 8,
    format: 'round_robin',
    sets_format: 'best_of_3_to_11',
    seeding_method: 'ranking',
  });
  const [registrationData, setRegistrationData] = useState<RegisterForEventRequest>({
    user_id: '',
  });
  const [matchData, setMatchData] = useState<CreateTournamentMatchRequest>({
    player1_id: '',
    player2_id: '',
    match_format: 'best_of_3_to_11',
  });
  const [matchResultData, setMatchResultData] = useState<RecordMatchResultRequest>({
    set_scores: [],
    winner_by: 'score',
  });

  // Load data on mount
  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentEvents({ tournamentId }));
      checkOrganizerPermissions();
    }
    if (!profile) {
      dispatch(fetchClubProfile());
    }
  }, [tournamentId, dispatch, profile]);

  // Check organizer permissions
  const checkOrganizerPermissions = async () => {
    try {
      setPermissionsLoading(true);
      // This would be an API call to check permissions
      // For now, we'll simulate based on user type
      const mockPermissions: TournamentOrganizerPermissions['data'] = {
        can_create_tournaments: true,
        allowed_tournament_types: ['local', 'state', 'national'],
        max_participants_limit: 128,
        max_teams_limit: 16,
        can_create_paid_events: true,
        can_create_state_level: true,
        can_create_national_level: false,
        requires_approval: false,
        current_subscription_level: 'premium',
        upgrade_required_for: [],
      };
      setOrganizerPermissions(mockPermissions);
    } catch (error) {
      console.error('Failed to check permissions:', error);
    } finally {
      setPermissionsLoading(false);
    }
  };

  // Check if user can create events
  const canCreateEvents = () => {
    return organizerPermissions?.can_create_tournaments ?? false;
  };

  // Get allowed tournament types based on permissions
  const getAllowedTournamentTypes = () => {
    return organizerPermissions?.allowed_tournament_types ?? ['local'];
  };

  // Event handlers
  const handleCreateEvent = async () => {
    if (!canCreateEvents()) {
      alert(
        'You do not have permission to create tournament events. Please upgrade your subscription.',
      );
      return;
    }

    if (eventFormData.max_participants > (organizerPermissions?.max_participants_limit ?? 64)) {
      alert(
        `Maximum participants exceeded. Your limit is ${organizerPermissions?.max_participants_limit ?? 64}.`,
      );
      return;
    }

    try {
      await dispatch(createTournamentEvent({ tournamentId, eventData: eventFormData })).unwrap();
      setShowCreateEventDialog(false);
      setEventFormData({
        skill_block: '3.0',
        gender: 'male',
        modality: 'singles',
        max_participants: 64,
        minimum_participants: 8,
        format: 'round_robin',
        sets_format: 'best_of_3_to_11',
        seeding_method: 'ranking',
      });
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create tournament event. Please try again.');
    }
  };

  const handleSelectEvent = (event: TournamentEvent) => {
    setSelectedEvent(event);
    dispatch(fetchTournamentEvent({ tournamentId, eventId: event.id }));
    dispatch(fetchEventRegistrations({ tournamentId, eventId: event.id }));
    if (event.groupsGenerated) {
      dispatch(fetchEventGroups({ tournamentId, eventId: event.id }));
      dispatch(fetchEventStandings({ tournamentId, eventId: event.id }));
    }
  };

  const handleGenerateGroups = async () => {
    if (selectedEvent) {
      await dispatch(generateGroups({ tournamentId, eventId: selectedEvent.id }));
      // Refresh data
      dispatch(fetchTournamentEvent({ tournamentId, eventId: selectedEvent.id }));
      dispatch(fetchEventGroups({ tournamentId, eventId: selectedEvent.id }));
    }
  };

  const handleRegisterForEvent = async () => {
    if (selectedEvent) {
      try {
        // Check eligibility first
        const eligibilityData = await dispatch(
          checkRegistrationEligibility(registrationData.user_id),
        ).unwrap();
        if ((eligibilityData as any)?.eligible) {
          await dispatch(
            registerForEvent({
              tournamentId,
              eventId: selectedEvent.id,
              registrationData,
            }),
          ).unwrap();
          setShowRegisterDialog(false);
          dispatch(fetchEventRegistrations({ tournamentId, eventId: selectedEvent.id }));
        } else {
          alert(`Not eligible: ${(eligibilityData as any).reasonIfIneligible}`);
        }
      } catch (error) {
        console.error('Registration failed:', error);
        alert('Failed to register for event');
      }
    }
  };

  const handleCreateMatch = async () => {
    if (selectedEvent) {
      await dispatch(
        createTournamentMatch({
          tournamentId,
          eventId: selectedEvent.id,
          matchData,
        }),
      );
      setShowMatchDialog(false);
      dispatch(fetchEventMatches({ tournamentId, eventId: selectedEvent.id }));
    }
  };

  const handleRecordMatchResult = async (matchId: string) => {
    await dispatch(recordMatchResult({ matchId, resultData: matchResultData }));
    if (selectedEvent) {
      dispatch(fetchEventMatches({ tournamentId, eventId: selectedEvent.id }));
      dispatch(fetchEventStandings({ tournamentId, eventId: selectedEvent.id }));
    }
  };

  const handleFinalizeGroup = async (groupId: string) => {
    if (selectedEvent) {
      await dispatch(finalizeGroup({ tournamentId, eventId: selectedEvent.id, groupId }));
      dispatch(fetchEventGroups({ tournamentId, eventId: selectedEvent.id }));
    }
  };

  // Helper functions
  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGroupStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Permissions Info */}
      {organizerPermissions && (
        <Card className="bg-[#111827] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Tournament Creation Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Subscription Level</p>
                <p className="text-white font-medium">
                  {organizerPermissions.current_subscription_level}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Max Participants</p>
                <p className="text-white font-medium">
                  {organizerPermissions.max_participants_limit}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Can Create Paid Events</p>
                <p className="text-white font-medium">
                  {organizerPermissions.can_create_paid_events ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Requires Approval</p>
                <p className="text-white font-medium">
                  {organizerPermissions.requires_approval ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            {organizerPermissions.upgrade_required_for &&
              organizerPermissions.upgrade_required_for.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    Upgrade required for: {organizerPermissions.upgrade_required_for.join(', ')}
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Tournament Event Management</h2>
          <p className="text-gray-400">Manage events, registrations, groups, and matches</p>
        </div>
        <Dialog open={showCreateEventDialog} onOpenChange={setShowCreateEventDialog}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#ace600] hover:bg-[#9bc500] text-black"
              disabled={!canCreateEvents() || permissionsLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Create Tournament Event</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new tournament event with skill block and format
                {organizerPermissions && (
                  <div className="mt-2 text-sm">
                    <p>Max Participants: {organizerPermissions.max_participants_limit}</p>
                    <p>Subscription Level: {organizerPermissions.current_subscription_level}</p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="skill_block">Skill Block</Label>
                <Select
                  value={eventFormData.skill_block}
                  onValueChange={(value) =>
                    setEventFormData({ ...eventFormData, skill_block: value })
                  }
                >
                  <SelectTrigger className="bg-[#111827] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="3.0">3.0</SelectItem>
                    <SelectItem value="3.5">3.5</SelectItem>
                    <SelectItem value="4.0">4.0</SelectItem>
                    <SelectItem value="4.5">4.5</SelectItem>
                    <SelectItem value="5.0">5.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={eventFormData.gender}
                  onValueChange={(value: 'male' | 'female' | 'mixed') =>
                    setEventFormData({ ...eventFormData, gender: value })
                  }
                >
                  <SelectTrigger className="bg-[#111827] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="modality">Modality</Label>
                <Select
                  value={eventFormData.modality}
                  onValueChange={(value: 'singles' | 'doubles' | 'mixed') =>
                    setEventFormData({ ...eventFormData, modality: value })
                  }
                >
                  <SelectTrigger className="bg-[#111827] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="singles">Singles</SelectItem>
                    <SelectItem value="doubles">Doubles</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="format">Format</Label>
                <Select
                  value={eventFormData.format}
                  onValueChange={(
                    value: 'round_robin' | 'round_robin_to_bracket' | 'bracket_only',
                  ) => setEventFormData({ ...eventFormData, format: value })}
                >
                  <SelectTrigger className="bg-[#111827] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="round_robin">Round Robin</SelectItem>
                    <SelectItem value="round_robin_to_bracket">Round Robin to Bracket</SelectItem>
                    <SelectItem value="bracket_only">Bracket Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sets_format">Sets Format</Label>
                <Select
                  value={eventFormData.sets_format}
                  onValueChange={(
                    value: 'best_of_3_to_11' | 'best_of_3_to_15' | 'best_of_5_to_11',
                  ) => setEventFormData({ ...eventFormData, sets_format: value })}
                >
                  <SelectTrigger className="bg-[#111827] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="best_of_3_to_11">Best of 3 to 11</SelectItem>
                    <SelectItem value="best_of_3_to_15">Best of 3 to 15</SelectItem>
                    <SelectItem value="best_of_5_to_11">Best of 5 to 11</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={eventFormData.max_participants || 64}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      max_participants: parseInt(e.target.value),
                    })
                  }
                  className="bg-[#111827] border-white/10 text-white"
                  min={1}
                  max={organizerPermissions?.max_participants_limit ?? 64}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Max allowed: {organizerPermissions?.max_participants_limit ?? 64}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateEvent}
                  className="bg-[#ace600] hover:bg-[#9bc500] text-black"
                >
                  Create Event
                </Button>
                <Button variant="outline" onClick={() => setShowCreateEventDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#111827] border-white/10">
          <TabsTrigger
            value="events"
            className="data-[state=active]:bg-[#ace600] data-[state=active]:text-black"
          >
            Events
          </TabsTrigger>
          <TabsTrigger
            value="registrations"
            className="data-[state=active]:bg-[#ace600] data-[state=active]:text-black"
          >
            Registrations
          </TabsTrigger>
          <TabsTrigger
            value="groups"
            className="data-[state=active]:bg-[#ace600] data-[state=active]:text-black"
          >
            Groups
          </TabsTrigger>
          <TabsTrigger
            value="matches"
            className="data-[state=active]:bg-[#ace600] data-[state=active]:text-black"
          >
            Matches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournamentEvents.map((event: TournamentEvent) => (
              <Card
                key={event.id}
                className={`bg-[#111827] border-white/10 cursor-pointer transition-all hover:border-[#ace600]/50 ${
                  selectedEvent?.id === event.id ? 'border-[#ace600]' : ''
                }`}
                onClick={() => handleSelectEvent(event)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">
                        {event.skillBlock} {event.modality}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {event.gender} • {event.format.replace('_', ' ')}
                      </CardDescription>
                    </div>
                    <Badge className={getEventStatusColor(event.status)}>{event.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Participants:</span>
                      <span className="text-white">
                        {event.participantCount}/{event.maxParticipants}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Groups:</span>
                      <span className="text-white">{event.groupCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sets:</span>
                      <span className="text-white">{event.setsFormat.replace('_', ' ')}</span>
                    </div>
                    {event.groupsGenerated && (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          className="w-full bg-[#ace600] hover:bg-[#9bc500] text-black"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateGroups();
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Regenerate Groups
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          {selectedEvent && (
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Registrations for {selectedEvent.skillBlock} {selectedEvent.modality}
              </h3>
              <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#ace600] hover:bg-[#9bc500] text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Register Player
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#111827] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Register for Event</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Add a player to this tournament event
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="user_id">User ID</Label>
                      <Input
                        id="user_id"
                        value={registrationData.user_id}
                        onChange={(e) =>
                          setRegistrationData({ ...registrationData, user_id: e.target.value })
                        }
                        className="bg-[#111827] border-white/10 text-white"
                        placeholder="Enter user ID"
                      />
                    </div>
                    {selectedEvent.modality !== 'singles' && (
                      <div>
                        <Label htmlFor="partner_user_id">Partner User ID (optional)</Label>
                        <Input
                          id="partner_user_id"
                          value={registrationData.partner_user_id || ''}
                          onChange={(e) =>
                            setRegistrationData({
                              ...registrationData,
                              partner_user_id: e.target.value,
                            })
                          }
                          className="bg-[#111827] border-white/10 text-white"
                          placeholder="Enter partner user ID"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleRegisterForEvent}
                        className="bg-[#ace600] hover:bg-[#9bc500] text-black"
                      >
                        Register
                      </Button>
                      <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <Card className="bg-[#111827] border-white/10">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white">Player</TableHead>
                    <TableHead className="text-white">Partner</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventRegistrations.map((registration: any) => (
                    <TableRow key={registration.id} className="border-white/10">
                      <TableCell className="text-white">{registration.player.name}</TableCell>
                      <TableCell className="text-white">
                        {registration.partner?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            registration.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : registration.status === 'withdrawn'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {registration.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(registration.registeredAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          {selectedEvent && !selectedEvent.groupsGenerated && (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Groups Not Generated</h3>
              <p className="text-gray-400 mb-4">Generate groups to start the tournament phase</p>
              <Button
                onClick={handleGenerateGroups}
                className="bg-[#ace600] hover:bg-[#9bc500] text-black"
              >
                <Play className="w-4 h-4 mr-2" />
                Generate Groups
              </Button>
            </div>
          )}

          {selectedEvent && selectedEvent.groupsGenerated && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">
                  Groups for {selectedEvent.skillBlock} {selectedEvent.modality}
                </h3>
                <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#ace600] hover:bg-[#9bc500] text-black">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Match
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#111827] border-white/10 text-white">
                    <DialogHeader>
                      <DialogTitle>Create Match</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Schedule a new match for this event
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="player1_id">Player 1 ID</Label>
                        <Input
                          id="player1_id"
                          value={matchData.player1_id}
                          onChange={(e) =>
                            setMatchData({ ...matchData, player1_id: e.target.value })
                          }
                          className="bg-[#111827] border-white/10 text-white"
                          placeholder="Enter player 1 ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="player2_id">Player 2 ID</Label>
                        <Input
                          id="player2_id"
                          value={matchData.player2_id}
                          onChange={(e) =>
                            setMatchData({ ...matchData, player2_id: e.target.value })
                          }
                          className="bg-[#111827] border-white/10 text-white"
                          placeholder="Enter player 2 ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="group_id">Group ID (optional)</Label>
                        <Input
                          id="group_id"
                          value={matchData.group_id || ''}
                          onChange={(e) => setMatchData({ ...matchData, group_id: e.target.value })}
                          className="bg-[#111827] border-white/10 text-white"
                          placeholder="Enter group ID"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateMatch}
                          className="bg-[#ace600] hover:bg-[#9bc500] text-black"
                        >
                          Create Match
                        </Button>
                        <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventGroups.map((group: any) => (
                  <Card key={group.id} className="bg-[#111827] border-white/10">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white">Group {group.groupNumber}</CardTitle>
                        <Badge className={getGroupStatusColor(group.status)}>
                          {group.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-400">
                        {group.playerCount} players • {group.matchesCompleted}/{group.totalMatches}{' '}
                        matches
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-[#ace600] h-2 rounded-full"
                            style={{ width: `${group.completionPercent}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-400">{group.completionPercent}% complete</p>
                        {group.status !== 'completed' && (
                          <Button
                            size="sm"
                            onClick={() => handleFinalizeGroup(group.id)}
                            className="w-full bg-[#ace600] hover:bg-[#9bc500] text-black"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Finalize Group
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card className="bg-[#111827] border-white/10">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white">Players</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Score</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventMatches.map((match: any) => (
                    <TableRow key={match.id} className="border-white/10">
                      <TableCell className="text-white">
                        {match.player1.name} vs {match.player2.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            match.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {match.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {match.setScores?.length > 0
                          ? match.setScores
                              .map((set: any) => `${set.player1}-${set.player2}`)
                              .join(', ')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {match.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Open match result dialog
                              setMatchResultData({
                                set_scores: [],
                                winner_by: 'score',
                              });
                              // Handle recording result
                            }}
                          >
                            Record Result
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ace600]"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentEventManagement;
