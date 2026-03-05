import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  Users,
  Clock,
  MapPin,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';
import EligibilityCheckModal from './EligibilityCheckModal';
import type { TournamentEvent, EligibilityCheckResult, ApiResponse } from '@/types/api';

interface PlayerRegistrationFormProps {
  tournamentId: string;
  userId: string;
  userName: string;
  skillLevel: string;
  onRegistrationComplete?: () => void;
}

type RegistrationStep =
  | 'event-selection'
  | 'eligibility-check'
  | 'partner-selection'
  | 'confirmation';

export default function PlayerRegistrationForm({
  tournamentId,
  userId,
  userName,
  skillLevel,
  onRegistrationComplete,
}: PlayerRegistrationFormProps) {
  const dispatch = useDispatch();
  const [step, setStep] = useState<RegistrationStep>('event-selection');
  const [events, setEvents] = useState<TournamentEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Step 1: Event selection
  const [selectedEvent, setSelectedEvent] = useState<TournamentEvent | null>(null);

  // Step 2: Eligibility check
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityCheckResult | null>(null);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);

  // Step 3: Partner selection (for doubles/mixed)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [availablePartners, setAvailablePartners] = useState<any[]>([]);

  // Step 4: Confirmation
  const [registering, setRegistering] = useState(false);
  const [registrationResponse, setRegistrationResponse] = useState<any>(null);

  // Fetch available events on mount
  useEffect(() => {
    fetchAvailableEvents();
  }, [tournamentId]);

  const fetchAvailableEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<any>>(`/tournaments/${tournamentId}/events`);
      setEvents(response.data as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setStep('eligibility-check');
      // Automatically show eligibility modal
      setShowEligibilityModal(true);
    }
  };

  const handleEligibilityComplete = (result: EligibilityCheckResult) => {
    setEligibilityResult(result);
    setShowEligibilityModal(false);

    if (result.eligible) {
      if (selectedEvent?.modality === 'Singles') {
        // Skip partner selection for singles
        setStep('confirmation');
      } else {
        // Go to partner selection for doubles/mixed
        setStep('partner-selection');
        fetchAvailablePartners();
      }
    }
  };

  const fetchAvailablePartners = async () => {
    try {
      // Fetch players who can partner
      const response = await api.get<ApiResponse<any>>(
        `/tournaments/${tournamentId}/available-partners?user_id=${userId}&event_id=${selectedEvent?.id}`,
      );
      setAvailablePartners(response.data as any);
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    }
  };

  const handleRegisterClick = async () => {
    if (!selectedEvent || !eligibilityResult?.eligible) {
      setError('Please complete eligibility check first');
      return;
    }

    try {
      setRegistering(true);
      setError(null);

      const payload = {
        user_id: userId,
        partner_user_id: selectedEvent.modality !== 'Singles' ? selectedPartnerId : undefined,
        ranking_points: selectedEvent.skill_block || '3.5',
      };

      const response = await api.post<ApiResponse<any>>(
        `/tournaments/${tournamentId}/events/${selectedEvent.id}/register`,
        payload,
      );

      setRegistrationResponse(response.data as any);
      setSuccess(true);
      setStep('confirmation');

      // Notify parent component
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirmation' && !success) {
      setStep('partner-selection');
    } else if (step === 'partner-selection') {
      setStep('eligibility-check');
      setShowEligibilityModal(true);
    } else if (step === 'eligibility-check') {
      setStep('event-selection');
    }
  };

  const handleReset = () => {
    setStep('event-selection');
    setSelectedEvent(null);
    setEligibilityResult(null);
    setSelectedPartnerId('');
    setSuccess(false);
    setRegistrationResponse(null);
    setError(null);
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle2 className="h-6 w-6" />
            Registration Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 space-y-2">
            <div>
              <p className="text-sm text-gray-600">Event</p>
              <p className="font-semibold text-lg">
                {selectedEvent?.skill_block} {selectedEvent?.gender} {selectedEvent?.modality}
              </p>
            </div>

            {selectedEvent?.modality !== 'Singles' && selectedPartnerId && (
              <div>
                <p className="text-sm text-gray-600">Partner</p>
                <p className="font-semibold">
                  {availablePartners.find((p) => p.id === selectedPartnerId)?.full_name ||
                    selectedPartnerId}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Registration ID</p>
              <p className="font-mono text-sm break-all">{registrationResponse?.id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className="mt-1 bg-green-600">Confirmed</Badge>
            </div>
          </div>

          <Alert className="border-green-300 bg-green-100">
            <Info className="h-4 w-4 text-green-700" />
            <AlertDescription className="text-green-800">
              You're registered! Check the tournament dashboard for group assignments after
              registration closes.
            </AlertDescription>
          </Alert>

          <Button onClick={handleReset} variant="outline" className="w-full">
            Register for Another Event
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex gap-2">
        {(
          ['event-selection', 'eligibility-check', 'partner-selection', 'confirmation'] as const
        ).map((s, idx) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-colors ${
              ['event-selection', 'eligibility-check', 'partner-selection', 'confirmation'].indexOf(
                step,
              ) >= idx
                ? 'bg-blue-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* STEP 1: Event Selection */}
      {step === 'event-selection' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Step 1: Select Event
            </CardTitle>
            <CardDescription>Choose a tournament event to register for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Player info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Registered as</p>
              <p className="font-semibold text-lg">{userName}</p>
              <p className="text-sm text-gray-500 mt-1">Skill Level: {skillLevel}</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : events.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No events available for registration at this time.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => handleEventSelect(event.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {event.skill_block} {event.gender} {event.modality}
                          </h3>
                          <Badge variant="outline">{event.registration_status || 'open'}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.current_participants}/{event.max_participants} registered
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.format} format
                          </div>
                        </div>

                        {event.current_participants >= event.max_participants && (
                          <Alert className="mt-2 border-yellow-200 bg-yellow-50">
                            <AlertCircle className="h-4 w-4 text-yellow-700" />
                            <AlertDescription className="text-yellow-800 text-sm">
                              Event is full - you may be waitlisted
                            </AlertDescription>
                          </Alert>
                        )}

                        {event.current_participants >= event.minimum_participants &&
                          event.current_participants < event.max_participants && (
                            <Alert className="mt-2 border-blue-200 bg-blue-50">
                              <Info className="h-4 w-4 text-blue-700" />
                              <AlertDescription className="text-blue-800 text-sm">
                                Spots available!{' '}
                                {event.max_participants - event.current_participants} remaining
                              </AlertDescription>
                            </Alert>
                          )}
                      </div>
                      <Button className="ml-2">Select</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Eligibility Check */}
      {step === 'eligibility-check' && selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Step 2: Eligibility Check
            </CardTitle>
            <CardDescription>
              Verifying your eligibility for {selectedEvent.skill_block} {selectedEvent.gender}{' '}
              {selectedEvent.modality}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {eligibilityResult ? (
              <div className="space-y-3">
                {eligibilityResult.eligible ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      You're eligible for this event!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{eligibilityResult.reasons?.join(', ')}</AlertDescription>
                  </Alert>
                )}

                {eligibilityResult.playerInfo && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Skill Block</p>
                      <p className="text-gray-900">{eligibilityResult.playerInfo.skill_block}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Membership</p>
                      <p className="text-gray-900">
                        {eligibilityResult.playerInfo.membership_status || 'Active'}
                      </p>
                    </div>
                    {eligibilityResult.warnings && eligibilityResult.warnings.length > 0 && (
                      <div>
                        <p className="text-gray-600 font-medium">Warnings</p>
                        <p className="text-gray-900">{eligibilityResult.warnings.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}

            <div className="flex justify-between gap-3">
              <Button onClick={handleBack} variant="outline">
                Back
              </Button>
              {eligibilityResult?.eligible && (
                <Button
                  onClick={() =>
                    selectedEvent.modality === 'Singles'
                      ? setStep('confirmation')
                      : setStep('partner-selection')
                  }
                  className="flex-1"
                >
                  {selectedEvent.modality === 'Singles'
                    ? 'Continue to Confirmation'
                    : 'Select Partner'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Partner Selection (for doubles/mixed) */}
      {step === 'partner-selection' && selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Step 3: Select Partner
            </CardTitle>
            <CardDescription>
              Choose a partner for {selectedEvent.skill_block} {selectedEvent.gender}{' '}
              {selectedEvent.modality}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availablePartners.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No available partners at this time. Check back later or contact support.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePartners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.full_name} (Skill: {partner.skill_level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPartnerId && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Partner Details</p>
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {availablePartners.find((p) => p.id === selectedPartnerId)?.full_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Skill Level:{' '}
                        {availablePartners.find((p) => p.id === selectedPartnerId)?.skill_level}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between gap-3">
              <Button onClick={handleBack} variant="outline">
                Back
              </Button>
              <Button
                onClick={() => setStep('confirmation')}
                disabled={!selectedPartnerId}
                className="flex-1"
              >
                Continue to Confirmation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: Confirmation */}
      {step === 'confirmation' && selectedEvent && eligibilityResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Step 4: Confirm Registration
            </CardTitle>
            <CardDescription>Review and confirm your tournament registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Event</p>
                <p className="font-semibold text-lg">
                  {selectedEvent.skill_block} {selectedEvent.gender} {selectedEvent.modality}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Format</p>
                <p className="text-sm">
                  {selectedEvent.format === 'hybrid'
                    ? 'Group Play + Bracket'
                    : 'Single Elimination'}
                  {selectedEvent.format === 'hybrid' && selectedEvent.target_group_size && (
                    <span> - Groups of {selectedEvent.target_group_size}</span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Player</p>
                <p className="text-sm">{userName}</p>
              </div>

              {selectedEvent.modality !== 'Singles' && selectedPartnerId && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Partner</p>
                  <p className="text-sm">
                    {availablePartners.find((p) => p.id === selectedPartnerId)?.full_name}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">Registration Status</p>
                <Badge className="mt-1 bg-blue-600">Pending Confirmation</Badge>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-700" />
              <AlertDescription className="text-blue-800 text-sm">
                Upon registration, you'll be assigned to a group. Check the tournament dashboard
                after registration closes to see your group and matches.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between gap-3">
              <Button onClick={handleBack} variant="outline" disabled={registering}>
                Back
              </Button>
              <Button
                onClick={handleRegisterClick}
                disabled={registering}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {registering ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm Registration
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eligibility Check Modal */}
      {selectedEvent && (
        <EligibilityCheckModal
          open={showEligibilityModal}
          eventId={selectedEvent.id}
          userId={userId}
          onClose={() => setShowEligibilityModal(false)}
          onRegisterClick={() => handleRegisterClick()}
        />
      )}
    </div>
  );
}
