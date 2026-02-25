import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Settings,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// Redux imports
import { AppDispatch, RootState } from '@/store';
import { createTournament, fetchTournaments } from '@/store/slices/tournamentsSlice';

// Types
import type { CreateTournamentRequest, TournamentOrganizerPermissions } from '@/types/api';

interface TournamentCreationProps {
  onTournamentCreated?: (tournamentId: string) => void;
}

const TournamentCreation: React.FC<TournamentCreationProps> = ({ onTournamentCreated }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state: RootState) => state.tournaments);
  const { user } = useSelector((state: RootState) => state.auth);

  // Local state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [organizerPermissions, setOrganizerPermissions] = useState<
    TournamentOrganizerPermissions['data'] | null
  >(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [tournamentFormData, setTournamentFormData] = useState<CreateTournamentRequest>({
    name: '',
    tournament_type: 'local',
    category: 'singles',
    description: '',
    organizer_type: 'club',
    venue_name: '',
    venue_address: '',
    state: '',
    city: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    entry_fee: 0,
    max_participants: 64,
    rules: '',
    contact_email: '',
    contact_phone: '',
  });

  // Load permissions on mount
  useEffect(() => {
    checkOrganizerPermissions();
  }, []);

  // Check organizer permissions
  const checkOrganizerPermissions = async () => {
    try {
      setPermissionsLoading(true);
      // This would be an API call to check permissions
      // For now, we'll simulate based on user type
      const canCreate = ['club', 'state', 'admin'].includes(user?.user_type || '');

      const mockPermissions: TournamentOrganizerPermissions['data'] = {
        can_create_tournaments: canCreate,
        allowed_tournament_types: getAllowedTournamentTypes(),
        max_participants_limit: getMaxParticipantsLimit(),
        max_teams_limit: 16,
        can_create_paid_events: canCreatePaidEvents(),
        can_create_state_level: canCreateStateLevel(),
        can_create_national_level: canCreateNationalLevel(),
        requires_approval: requiresApproval(),
        approval_required_by: getApprovalRequiredBy(),
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

  // Helper functions for permissions
  const getAllowedTournamentTypes = (): ('local' | 'state' | 'national')[] => {
    const userType = user?.user_type;
    switch (userType) {
      case 'admin':
        return ['local', 'state', 'national'];
      case 'state':
        return ['local', 'state'];
      case 'club':
        return ['local'];
      default:
        return ['local'];
    }
  };

  const getMaxParticipantsLimit = (): number => {
    const userType = user?.user_type;
    switch (userType) {
      case 'admin':
        return 1000;
      case 'state':
        return 500;
      case 'club':
        return 128;
      default:
        return 64;
    }
  };

  const canCreatePaidEvents = (): boolean => {
    return ['admin', 'state', 'club'].includes(user?.user_type || '');
  };

  const canCreateStateLevel = (): boolean => {
    return ['admin', 'state'].includes(user?.user_type || '');
  };

  const canCreateNationalLevel = (): boolean => {
    return user?.user_type === 'admin';
  };

  const requiresApproval = (): boolean => {
    return user?.user_type === 'club';
  };

  const getApprovalRequiredBy = (): 'club' | 'state' | 'federation' | 'admin' | undefined => {
    const userType = user?.user_type;
    switch (userType) {
      case 'club':
        return 'state';
      default:
        return undefined;
    }
  };

  // Check if user can create tournaments
  const canCreateTournaments = () => {
    return organizerPermissions?.can_create_tournaments ?? false;
  };

  // Handle form submission
  const handleCreateTournament = async () => {
    if (!canCreateTournaments()) {
      alert('You do not have permission to create tournaments.');
      return;
    }

    // Validate required fields
    if (
      !tournamentFormData.name ||
      !tournamentFormData.venue_name ||
      !tournamentFormData.state ||
      !tournamentFormData.city
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    // Validate dates
    if (new Date(tournamentFormData.start_date) >= new Date(tournamentFormData.end_date)) {
      alert('End date must be after start date.');
      return;
    }

    if (
      new Date(tournamentFormData.registration_deadline) >= new Date(tournamentFormData.start_date)
    ) {
      alert('Registration deadline must be before start date.');
      return;
    }

    // Validate max participants
    if (
      tournamentFormData.max_participants &&
      tournamentFormData.max_participants > (organizerPermissions?.max_participants_limit ?? 64)
    ) {
      alert(
        `Maximum participants exceeded. Your limit is ${organizerPermissions?.max_participants_limit ?? 64}.`,
      );
      return;
    }

    try {
      const result = await dispatch(createTournament(tournamentFormData)).unwrap();
      setShowCreateDialog(false);

      // Reset form
      setTournamentFormData({
        name: '',
        tournament_type: 'local',
        category: 'singles',
        description: '',
        organizer_type: 'club',
        venue_name: '',
        venue_address: '',
        state: '',
        city: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        entry_fee: 0,
        max_participants: 64,
        rules: '',
        contact_email: '',
        contact_phone: '',
      });

      // Call callback if provided
      if (onTournamentCreated && result && typeof result === 'object' && 'id' in result) {
        onTournamentCreated((result as any).id);
      } else {
        // Navigate to tournaments page
        navigate('/tournaments');
      }
    } catch (error) {
      console.error('Failed to create tournament:', error);
      alert('Failed to create tournament. Please try again.');
    }
  };

  // Get tournament type description
  const getTournamentTypeDescription = (type: string) => {
    switch (type) {
      case 'local':
        return 'City/Area level tournament';
      case 'state':
        return 'Federal Entity level tournament';
      case 'national':
        return 'Country Level; Annual Main Event';
      default:
        return '';
    }
  };

  if (!canCreateTournaments() && !permissionsLoading) {
    return (
      <Card className="bg-[#111827] border-white/10">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Access Restricted</h3>
          <p className="text-gray-400 mb-4">
            Only clubs, state organizations, and administrators can create tournaments.
          </p>
          <p className="text-sm text-gray-500">
            Your current user type: {user?.user_type || 'Unknown'}
          </p>
        </CardContent>
      </Card>
    );
  }

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
                <p className="text-gray-400">User Type</p>
                <p className="text-white font-medium capitalize">{user?.user_type}</p>
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
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-2">Allowed Tournament Types:</p>
              <div className="flex gap-2">
                {organizerPermissions.allowed_tournament_types.map((type) => (
                  <Badge key={type} variant="secondary" className="capitalize">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Tournament Button */}
      <div className="flex justify-center">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#ace600] hover:bg-[#9bc500] text-black px-8 py-3 text-lg"
              disabled={!canCreateTournaments() || permissionsLoading}
            >
              <Plus className="w-6 h-6 mr-2" />
              Create New Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111827] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create Tournament</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new tournament. Events will be created within this tournament.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Tournament Name *</Label>
                    <Input
                      id="name"
                      value={tournamentFormData.name}
                      onChange={(e) =>
                        setTournamentFormData({ ...tournamentFormData, name: e.target.value })
                      }
                      className="bg-[#111827] border-white/10 text-white"
                      placeholder="Enter tournament name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="tournament_type">Tournament Type *</Label>
                    <Select
                      value={tournamentFormData.tournament_type}
                      onValueChange={(value: 'local' | 'state' | 'national') =>
                        setTournamentFormData({ ...tournamentFormData, tournament_type: value })
                      }
                    >
                      <SelectTrigger className="bg-[#111827] border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-white/10">
                        {organizerPermissions?.allowed_tournament_types.map((type) => (
                          <SelectItem key={type} value={type}>
                            <div>
                              <div className="font-medium capitalize">{type}</div>
                              <div className="text-xs text-gray-400">
                                {getTournamentTypeDescription(type)}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={tournamentFormData.description}
                    onChange={(e) =>
                      setTournamentFormData({ ...tournamentFormData, description: e.target.value })
                    }
                    className="bg-[#111827] border-white/10 text-white"
                    placeholder="Tournament description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={tournamentFormData.category}
                      onValueChange={(value: 'singles' | 'doubles' | 'mixed_doubles' | 'team') =>
                        setTournamentFormData({ ...tournamentFormData, category: value })
                      }
                    >
                      <SelectTrigger className="bg-[#111827] border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-white/10">
                        <SelectItem value="singles">Singles</SelectItem>
                        <SelectItem value="doubles">Doubles</SelectItem>
                        <SelectItem value="mixed_doubles">Mixed Doubles</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={tournamentFormData.max_participants || ''}
                      onChange={(e) =>
                        setTournamentFormData({
                          ...tournamentFormData,
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
                </div>
              </div>

              {/* Venue Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Venue Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venue_name">Venue Name *</Label>
                    <Input
                      id="venue_name"
                      value={tournamentFormData.venue_name}
                      onChange={(e) =>
                        setTournamentFormData({ ...tournamentFormData, venue_name: e.target.value })
                      }
                      className="bg-[#111827] border-white/10 text-white"
                      placeholder="Club name or venue"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="venue_address">Venue Address</Label>
                    <Input
                      id="venue_address"
                      value={tournamentFormData.venue_address}
                      onChange={(e) =>
                        setTournamentFormData({
                          ...tournamentFormData,
                          venue_address: e.target.value,
                        })
                      }
                      className="bg-[#111827] border-white/10 text-white"
                      placeholder="Full address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={tournamentFormData.state}
                      onChange={(e) =>
                        setTournamentFormData({ ...tournamentFormData, state: e.target.value })
                      }
                      className="bg-[#111827] border-white/10 text-white"
                      placeholder="State/Federal Entity"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={tournamentFormData.city}
                      onChange={(e) =>
                        setTournamentFormData({ ...tournamentFormData, city: e.target.value })
                      }
                      className="bg-[#111827] border-white/10 text-white"
                      placeholder="City"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Dates & Deadlines
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={tournamentFormData.start_date}
                      onChange={(e) =>
                        setTournamentFormData({ ...tournamentFormData, start_date: e.target.value })
                      }
                      className="bg-[#111827] border-white/10 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={tournamentFormData.end_date}
                      onChange={(e) =>
                        setTournamentFormData({ ...tournamentFormData, end_date: e.target.value })
                      }
                      className="bg-[#111827] border-white/10 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="registration_deadline">Registration Deadline *</Label>
                    <Input
                      id="registration_deadline"
                      type="date"
                      value={tournamentFormData.registration_deadline}
                      onChange={(e) =>
                        setTournamentFormData({
                          ...tournamentFormData,
                          registration_deadline: e.target.value,
                        })
                      }
                      className="bg-[#111827] border-white/10 text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Entry Fee */}
              {organizerPermissions?.can_create_paid_events && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Entry Fee</h3>

                  <div className="max-w-xs">
                    <Label htmlFor="entry_fee">Entry Fee (MXN)</Label>
                    <Input
                      id="entry_fee"
                      type="number"
                      value={tournamentFormData.entry_fee || ''}
                      onChange={(e) =>
                        setTournamentFormData({
                          ...tournamentFormData,
                          entry_fee: parseFloat(e.target.value),
                        })
                      }
                      className="bg-[#111827] border-white/10 text-white"
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={tournamentFormData.contact_email}
                      onChange={(e) =>
                        setTournamentFormData({
                          ...tournamentFormData,
                          contact_email: e.target.value,
                        })
                      }
                      className="bg-[#111827] border-white/10 text-white"
                      placeholder="contact@tournament.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={tournamentFormData.contact_phone}
                      onChange={(e) =>
                        setTournamentFormData({
                          ...tournamentFormData,
                          contact_phone: e.target.value,
                        })
                      }
                      className="bg-[#111827] border-white/10 text-white"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                </div>
              </div>

              {/* Rules */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Tournament Rules</h3>

                <div>
                  <Label htmlFor="rules">Rules & Regulations</Label>
                  <Textarea
                    id="rules"
                    value={tournamentFormData.rules}
                    onChange={(e) =>
                      setTournamentFormData({ ...tournamentFormData, rules: e.target.value })
                    }
                    className="bg-[#111827] border-white/10 text-white"
                    placeholder="Enter tournament rules and regulations"
                    rows={4}
                  />
                </div>
              </div>

              {/* Approval Notice */}
              {organizerPermissions?.requires_approval && (
                <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                    <div>
                      <p className="text-yellow-400 font-medium">Approval Required</p>
                      <p className="text-yellow-400/80 text-sm">
                        This tournament will require approval from{' '}
                        {organizerPermissions.approval_required_by} before it can be published.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateTournament}
                  className="bg-[#ace600] hover:bg-[#9bc500] text-black flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Tournament
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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

export default TournamentCreation;
