/**
 * Profile Registration Modal with Integrated Payment
 * 
 * Handles complete user registration workflow with payment
 * Supports all user types: individual, coach, club, venue, partner
 */

import { useState, FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './StripeProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import PaymentService from '@/services/paymentService';
import { PaymentForm } from './PaymentForm';

const registrationSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  user_type: z.enum([
    'player',
    'coach',
    'club',
    'state',
    'partner',
  ]),
  organization_name: z.string().optional(),
  country: z.string().min(2, 'Please select a country'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface ProfileRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userId: string, email: string) => void;
  registrationFee?: number;
}

// Annual membership fees in MXN - Partners register FREE
const USER_TYPE_FEES: Record<string, number> = {
  player: 50000, // $500 MXN in cents
  coach: 80000, // $800 MXN in cents
  club: 200000, // $2,000 MXN in cents
  state: 1500000, // $15,000 MXN in cents
  partner: 0, // FREE - partners do not pay annual membership
};

const USER_TYPE_LABELS: Record<string, string> = {
  player: 'Jugador',
  coach: 'Entrenador',
  club: 'Club',
  state: 'Federación Estatal',
  partner: 'Socio / Partner',
};

export const ProfileRegistrationModal = ({
  isOpen,
  onClose,
  onSuccess,
  registrationFee = 999,
}: ProfileRegistrationModalProps) => {
  const [currentStep, setCurrentStep] = useState<'registration' | 'payment' | 'success'>(
    'registration'
  );
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    clientSecret: string;
    amount: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    userId: string;
    email: string;
  } | null>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      user_type: 'player',
      organization_name: '',
      country: '',
    },
  });

  const selectedUserType = form.watch('user_type');
  const registrationAmount =
    USER_TYPE_FEES[selectedUserType] || registrationFee;

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Partners register for FREE - skip payment step
      if (data.user_type === 'partner') {
        setSuccessData({
          userId: `user_${Date.now()}`,
          email: data.email,
        });
        onSuccess?.(data.email, 'free_registration');
        setCurrentStep('success');
        setTimeout(() => handleClose(), 3000);
        return;
      }

      // Create payment intent for paid user types
      const paymentResponse = await PaymentService.createPaymentIntent({
        amount: registrationAmount,
        payment_type: 'profile_registration',
        description: `${USER_TYPE_LABELS[data.user_type]} - Registro`,
        currency: 'mxn',
        metadata: {
          user_type: data.user_type,
          email: data.email,
        },
      });

      if (!paymentResponse.success || !paymentResponse.data) {
        throw new Error('Failed to create payment intent');
      }

      setPaymentData({
        paymentId: paymentResponse.data.payment_id,
        clientSecret: paymentResponse.data.client_secret,
        amount: registrationAmount,
      });

      setCurrentStep('payment');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    const data = form.getValues();
    
    setSuccessData({
      userId: `user_${Date.now()}`, // Placeholder - backend generates actual ID
      email: data.email,
    });

    // Call parent callback
    onSuccess?.(data.email, paymentIntentId);

    setCurrentStep('success');

    // Auto-close after 3 seconds
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    setCurrentStep('registration');
  };

  const handleClose = () => {
    setCurrentStep('registration');
    setPaymentData(null);
    setError(null);
    setSuccessData(null);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Your Account</DialogTitle>
          <DialogDescription>
            Join the pickleball community in just a few steps
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {currentStep === 'success' ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
                <h3 className="text-2xl font-bold">Welcome!</h3>
                <p className="text-gray-600 text-center">
                  Your account has been created successfully.
                  <br />
                  Check your email for activation details.
                </p>
                <Button onClick={handleClose} className="mt-4">
                  Done
                </Button>
              </div>
            </Card>
          ) : currentStep === 'payment' ? (
            paymentData && (
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
                    amount={paymentData.amount}
                    currency="usd"
                    description={`${USER_TYPE_LABELS[selectedUserType]} Registration`}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
                <Button
                  onClick={() => setCurrentStep('registration')}
                  variant="outline"
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            )
          ) : (
            // Registration Form
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* User Type Selection */}
                <Card className="p-4 border-primary/20 bg-primary/5">
                  <FormField
                    control={form.control}
                    name="user_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="player">Jugador</SelectItem>
                            <SelectItem value="coach">Entrenador</SelectItem>
                            <SelectItem value="club">Club</SelectItem>
                            <SelectItem value="state">Federación Estatal</SelectItem>
                            <SelectItem value="partner">Socio / Partner (Gratis)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-gray-600 mt-3 pt-3 border-t">
                    Cuota de Registro:{' '}
                    <span className="font-bold">
                      {registrationAmount === 0 ? 'GRATIS' : `$${(registrationAmount / 100).toFixed(2)} MXN`}
                    </span>
                  </p>
                </Card>

                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {['club', 'state', 'partner'].includes(selectedUserType) && (
                  <FormField
                    control={form.control}
                    name="organization_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Organization" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="MX">Mexico</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Summary Card */}
                <Card className="p-4 bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration Type:</span>
                      <span className="font-semibold">
                        {USER_TYPE_LABELS[selectedUserType]}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-lg font-bold text-primary">
                        {registrationAmount === 0 ? 'GRATIS' : `$${(registrationAmount / 100).toFixed(2)} MXN`}
                      </span>
                    </div>
                  </div>
                </Card>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    selectedUserType === 'partner' ? 'Registrarse Gratis' : 'Continuar al Pago'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileRegistrationModal;
