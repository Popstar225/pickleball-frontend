/**
 * Registration Payment Page
 *
 * Shown when a user has registered but hasn't paid their annual membership yet.
 * The payment modal is mandatory and cannot be dismissed.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { updateUser } from '@/store/slices/authSlice';
import { MembershipSelector } from '@/components/payment/MembershipSelector';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const RegistrationPaymentPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Redirect to dashboard if already paid
  useEffect(() => {
    if (user && user.membership_status !== 'pending_payment') {
      navigateToDashboard(user.user_type);
    }
  }, [user]);

  const navigateToDashboard = (type: string) => {
    switch (type) {
      case 'player': navigate('/players/dashboard'); break;
      case 'coach': navigate('/coaches/dashboard'); break;
      case 'club': navigate('/clubs/dashboard'); break;
      case 'partner': navigate('/partners/dashboard'); break;
      case 'state': navigate('/state/dashboard'); break;
      default: navigate('/players/dashboard');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#06080E] flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C8FF00]/[0.04] rounded-full blur-3xl" />
      </div>

      {/* Logo / brand strip */}
      <div className="relative z-10 flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#C8FF00]" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Federación Mexicana de Pickleball</p>
          <p className="text-white/35 text-xs">Completa tu registro</p>
        </div>
      </div>

      {/* Non-dismissible payment modal */}
      <MembershipSelector
        isOpen={true}
        required
        onClose={() => {
          toast.error('El pago de afiliación es obligatorio para activar tu cuenta.');
        }}
        userType={user.user_type}
        onSuccess={(planType) => {
          dispatch(updateUser({ membership_status: planType === 'premium_plan' ? 'premium' : 'active', membership_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() }));
          toast.success('¡Afiliación activada! Bienvenido a la Federación Mexicana de Pickleball.');
          navigateToDashboard(user.user_type);
        }}
      />
    </div>
  );
};

export default RegistrationPaymentPage;
