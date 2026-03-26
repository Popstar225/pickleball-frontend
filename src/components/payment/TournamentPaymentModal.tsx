/**
 * Tournament Payment Modal
 * 
 * Handle payment for tournament/event registration
 * Supports team registration and individual entry fees
 */

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './StripeProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Loader2, AlertCircle, CheckCircle2, Users, DollarSign } from 'lucide-react';
import PaymentService from '@/services/paymentService';
import { PaymentForm } from './PaymentForm';

export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  entryFee: number;
  teamSize: number;
  division: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  maxParticipants: number;
  currentParticipants: number;
  currency?: string;
}

interface TournamentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  onSuccess?: (paymentId: string) => void;
  participantType?: 'individual' | 'team';
  teamSize?: number;
}

export const TournamentPaymentModal = ({
  isOpen,
  onClose,
  tournament,
  onSuccess,
  participantType = 'individual',
  teamSize = 1,
}: TournamentPaymentModalProps) => {
  const [registrationType, setRegistrationType] = useState<'individual' | 'team'>(
    participantType
  );
  const [numberOfParticipants, setNumberOfParticipants] = useState<string>(
    teamSize.toString()
  );
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    clientSecret: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currency = tournament.currency || 'usd';
  
  // Calculate total amount based on registration type
  const totalAmount = useMemo(() => {
    const participants = parseInt(numberOfParticipants) || 1;
    if (registrationType === 'team') {
      // Team registration: flat fee
      return tournament.entryFee;
    } else {
      // Individual registration: per person
      return tournament.entryFee * participants;
    }
  }, [registrationType, numberOfParticipants, tournament.entryFee]);

  const handleConfirmRegistration = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const participants = parseInt(numberOfParticipants) || 1;
      const description = `${tournament.name} - ${
        registrationType === 'team' ? 'Team' : `${participants} Individual`
      } Registration`;

      // Create payment intent
      const response = await PaymentService.createPaymentIntent({
        amount: totalAmount,
        payment_type: 'tournament_registration',
        description,
        currency,
        metadata: {
          tournament_id: tournament.id,
          tournament_name: tournament.name,
          registration_type: registrationType,
          participants: numberOfParticipants,
        },
      });

      if (!response.success || !response.data) {
        throw new Error('Failed to create payment intent');
      }

      setPaymentData({
        paymentId: response.data.payment_id,
        clientSecret: response.data.client_secret,
      });

      setShowPayment(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to process registration';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    onSuccess?.(paymentIntentId);
    onClose();
  };

  const spotsAvailable = tournament.maxParticipants - tournament.currentParticipants;
  const isSoldOut = spotsAvailable <= 0;
  const canRegister =
    !isSoldOut && tournament.status === 'upcoming';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{tournament.name}</DialogTitle>
          <DialogDescription>
            Complete your tournament registration and payment
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-1">
        {showPayment && paymentData ? (
          // Payment Step
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: paymentData.clientSecret }}
            >
              <PaymentForm
                paymentId={paymentData.paymentId}
                clientSecret={paymentData.clientSecret}
                amount={totalAmount}
                currency={currency}
                description={`${tournament.name} Entry Fee`}
                onSuccess={handlePaymentSuccess}
                onError={(err) => {
                  setError(err);
                  setShowPayment(false);
                }}
              />
            </Elements>
            <Button
              onClick={() => setShowPayment(false)}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        ) : (
          // Tournament Details & Registration Options
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isSoldOut && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This tournament is fully booked. Check back for future events.
                </AlertDescription>
              </Alert>
            )}

            {tournament.status !== 'upcoming' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Registration is {tournament.status === 'ongoing' ? 'closed' : 'not available'} for this tournament.
                </AlertDescription>
              </Alert>
            )}

            {/* Tournament Info */}
            <Card className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-300 text-sm">Location</p>
                  <p className="font-semibold">{tournament.location}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Division</p>
                  <p className="font-semibold">{tournament.division}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Dates</p>
                  <p className="font-semibold">
                    {new Date(tournament.startDate).toLocaleDateString()} -{' '}
                    {new Date(tournament.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Available Spots</p>
                  <p className="font-semibold">
                    {spotsAvailable > 0 ? (
                      <span className="text-green-600">
                        {spotsAvailable} / {tournament.maxParticipants}
                      </span>
                    ) : (
                      <span className="text-red-600">Sold Out</span>
                    )}
                  </p>
                </div>
              </div>
            </Card>

            {/* Registration Type Selection */}
            {canRegister && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Registration Type</h3>
                <Tabs value={registrationType} onValueChange={(val) => 
                  setRegistrationType(val as 'individual' | 'team')
                }>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="individual">Individual Entry</TabsTrigger>
                    <TabsTrigger value="team">Team Entry</TabsTrigger>
                  </TabsList>

                  <TabsContent value="individual" className="space-y-4">
                    <Card className="p-4">
                      <p className="text-sm text-gray-300 mb-3">
                        How many players are registering?
                      </p>
                      <Select value={numberOfParticipants} onValueChange={setNumberOfParticipants}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} Player{num > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Card>
                  </TabsContent>

                  <TabsContent value="team" className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="w-4 h-4" />
                        <p className="text-sm text-gray-300">
                          Team size: {tournament.teamSize} players
                        </p>
                      </div>
                      <p className="text-sm text-gray-300">
                        One registration fee covers your entire team
                      </p>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Price Summary */}
                <Card className="p-4 border-primary/20 bg-primary/5">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">
                        {registrationType === 'team' ? 'Team Fee' : `Per Player × ${numberOfParticipants}`}
                      </span>
                      <span className="font-semibold">
                        ${(tournament.entryFee / 100).toFixed(2)}
                        {registrationType === 'individual' && numberOfParticipants !== '1' && (
                          <span className="text-gray-300 text-sm ml-1">
                            × {numberOfParticipants}
                          </span>
                        )}
                      </span>
                    </div>
                    {registrationType === 'individual' && parseInt(numberOfParticipants) > 1 && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold">Subtotal</span>
                        <span className="font-semibold">
                          ${((tournament.entryFee * parseInt(numberOfParticipants)) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t">
                      <span className="font-bold text-lg">Total Amount</span>
                      <span className="text-xl font-bold text-primary">
                        {currency.toUpperCase()} ${(totalAmount / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleConfirmRegistration}
                    className="flex-1"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Continue to Payment
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentPaymentModal;
