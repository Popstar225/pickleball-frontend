import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../store';
import { registerUser } from '../../store/slices/authSlice';
import { toast } from 'sonner';
import { MembershipSelector } from '@/components/payment/MembershipSelector';
import {
  User,
  Mail,
  Lock,
  Building2,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Shield,
  Sparkles,
  MapPin,
} from 'lucide-react';

const RequiredFieldsPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    business_name: '',
    latitude: '',
    longitude: '',
    privacy_policy_accepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<string>('');

  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [registeredUserType, setRegisteredUserType] = useState<string>('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const USER_TYPES_REQUIRING_PAYMENT = ['player', 'coach', 'club', 'state'];

  const navigateToDashboard = (type: string) => {
    switch (type) {
      case 'player': navigate('/players/dashboard'); break;
      case 'coach': navigate('/coaches/dashboard'); break;
      case 'club': navigate('/clubs/dashboard'); break;
      case 'partner': navigate('/partner/dashboard'); break;
      case 'state': navigate('/state/dashboard'); break;
      default: navigate('/players/dashboard');
    }
  };

  // Redirect to dashboard if already authenticated and no pending payment
  useEffect(() => {
    if (isAuthenticated && user && !pendingPayment) {
      navigateToDashboard(user.user_type);
    }
  }, [isAuthenticated, user, navigate, pendingPayment]);

  useEffect(() => {
    const storedUserType = localStorage.getItem('registration_user_type');
    if (!storedUserType) {
      navigate('/register/select-type');
      return;
    }
    setUserType(storedUserType);
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    console.log('Form field change:', { name, value, type, checked, newValue });

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const validateForm = () => {
    if (!formData.username || formData.username.length < 3) {
      toast.error(t('auth.requiredFields.validate_username'));
      return false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error(t('auth.requiredFields.validate_email'));
      return false;
    }
    if (!formData.password || formData.password.length < 3) {
      toast.error(t('auth.requiredFields.validate_password_len'));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.requiredFields.validate_password_match'));
      return false;
    }
    if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
      toast.error(t('auth.requiredFields.validate_email'));
      return false;
    }
    if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
      toast.error(t('auth.requiredFields.validate_email'));
      return false;
    }
    if (userType === 'club' || userType === 'partner') {
      if (!formData.business_name) {
        toast.error(t('auth.requiredFields.validate_business_name'));
        return false;
      }
    } else {
      if (!formData.full_name) {
        toast.error(t('auth.requiredFields.validate_full_name'));
        return false;
      }
    }

    // Always require privacy policy acceptance regardless of user type
    console.log('Validating privacy policy for:', userType);
    console.log(
      'Privacy policy value:',
      formData.privacy_policy_accepted,
      typeof formData.privacy_policy_accepted,
    );
    if (!formData.privacy_policy_accepted) {
      toast.error(t('auth.requiredFields.validate_privacy'));
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    localStorage.setItem(
      'registration_required_fields',
      JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        business_name: formData.business_name,
        latitude: formData.latitude,
        longitude: formData.longitude,
        privacy_policy_accepted: formData.privacy_policy_accepted,
      }),
    );

    navigate('/register/optional-fields');
  };

  const handleBack = () => {
    navigate('/register/select-type');
  };

  const handleSkipToRegister = async () => {
    console.log('handleSkipToRegister called');
    console.log('Current form data:', formData);
    console.log('Privacy policy accepted:', formData.privacy_policy_accepted);

    if (!validateForm()) return;

    if (userType === 'player' || userType === 'coach') {
      toast.error(t('auth.requiredFields.validate_player_coach'));
      return;
    }

    try {
      const registrationData = {
        user_type: userType as any,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        business_name: formData.business_name,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        privacy_policy_accepted: Boolean(formData.privacy_policy_accepted),
      };

      console.log('Sending registration data:', registrationData);
      console.log(
        'Privacy policy accepted:',
        formData.privacy_policy_accepted,
        typeof formData.privacy_policy_accepted,
      );
      console.log('Form data state:', formData);
      console.log('User type:', userType);

      const result = await dispatch(registerUser(registrationData));

      const registrationResult = result as any;
      console.log('Registration result:', registrationResult);

      const apiResponse = registrationResult?.payload;
      console.log('API response from payload:', apiResponse);

      if (apiResponse?.data?.user && apiResponse?.data?.tokens) {
        localStorage.removeItem('registration_user_type');

        const type = apiResponse.data.user.user_type;
        setRegisteredUserType(type);

        if (USER_TYPES_REQUIRING_PAYMENT.includes(type)) {
          setPendingPayment(true);
          toast.success('¡Registro exitoso! Por favor completa tu membresía.');
          setShowMembershipModal(true);
        } else {
          // Partner — free
          toast.success(t('auth.requiredFields.toast_success'));
          navigateToDashboard(type);
        }
      } else {
        toast.error(t('auth.requiredFields.toast_error_server'));
        console.error('Registration failed - Invalid response structure:', apiResponse);
      }
    } catch (err) {
      toast.error(error || t('auth.requiredFields.toast_error_server'));
    }
  };

  const getRequiredFields = () => {
    const baseFields = [
      {
        name: 'username',
        label: t('auth.requiredFields.field_username'),
        type: 'text',
        placeholder: t('auth.requiredFields.field_username_placeholder'),
        icon: User,
      },
      {
        name: 'email',
        label: t('auth.requiredFields.field_email'),
        type: 'email',
        placeholder: t('auth.requiredFields.field_email_placeholder'),
        icon: Mail,
      },
      {
        name: 'password',
        label: t('auth.requiredFields.field_password'),
        type: 'password',
        placeholder: t('auth.requiredFields.field_password_placeholder'),
        icon: Lock,
      },
      {
        name: 'confirmPassword',
        label: t('auth.requiredFields.field_confirm_password'),
        type: 'password',
        placeholder: t('auth.requiredFields.field_confirm_password_placeholder'),
        icon: Lock,
      },
    ];

    const locationFields = [
      {
        name: 'latitude',
        label: t('auth.requiredFields.field_latitude'),
        type: 'text',
        placeholder: t('auth.requiredFields.field_latitude_placeholder'),
        icon: MapPin,
      },
      {
        name: 'longitude',
        label: t('auth.requiredFields.field_longitude'),
        type: 'text',
        placeholder: t('auth.requiredFields.field_longitude_placeholder'),
        icon: MapPin,
      },
    ];

    if (userType === 'club' || userType === 'partner') {
      return [
        ...baseFields,
        {
          name: 'business_name',
          label: t('auth.requiredFields.field_business_name'),
          type: 'text',
          placeholder: t('auth.requiredFields.field_business_name_placeholder'),
          icon: Building2,
        },
        ...locationFields,
      ];
    } else {
      return [
        ...baseFields,
        {
          name: 'full_name',
          label: t('auth.requiredFields.field_full_name'),
          type: 'text',
          placeholder: t('auth.requiredFields.field_full_name_placeholder'),
          icon: User,
        },
        ...locationFields,
      ];
    }
  };

  const getUserTypeLabel = () => {
    return t(`userTypes.${userType}.title`, { defaultValue: userType });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(124, 252, 0, 0.1) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(124, 252, 0, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <main className="flex-1 relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <span className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-wider uppercase bg-primary/10 px-6 py-2.5 rounded-full border border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span>{t('auth.requiredFields.step')}</span>
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              <span className="block bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent leading-tight">
                {t('auth.requiredFields.heading', { role: getUserTypeLabel() })}
              </span>
            </h3>

            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t('auth.requiredFields.subtitle')}
            </p>
          </div>

          {/* Main Form Card */}
          <div className="group relative mb-6">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-lime-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden">
              {/* Card Header */}
              <div className="relative px-8 py-6 border-b border-slate-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    {t('auth.requiredFields.account_details')}
                  </h2>
                  <p className="text-slate-400 mt-2 ml-13">
                    {t('auth.requiredFields.account_details_sub')}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="px-8 py-8 space-y-6">
                {getRequiredFields().map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.name} className="group/field">
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-semibold text-slate-300 mb-2.5"
                      >
                        {field.label}
                      </label>

                      <div className="relative">
                        {/* Icon */}
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-500 group-focus-within/field:text-primary transition-colors duration-300">
                          <Icon className="w-6 h-6" />
                        </div>

                        {/* Input */}
                        <input
                          id={field.name}
                          name={field.name}
                          type={
                            field.type === 'password'
                              ? field.name === 'password'
                                ? showPassword
                                  ? 'text'
                                  : 'password'
                                : showConfirmPassword
                                  ? 'text'
                                  : 'password'
                              : field.type
                          }
                          placeholder={field.placeholder}
                          value={formData[field.name as keyof typeof formData] as string}
                          onChange={handleChange}
                          required
                          className="w-full h-14 pl-14 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 
                          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 
                          transition-all duration-300 backdrop-blur-sm
                          hover:border-slate-600/50"
                        />

                        {/* Password Toggle */}
                        {field.type === 'password' && (
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-all duration-300 hover:scale-110"
                            onClick={() => {
                              if (field.name === 'password') {
                                setShowPassword(!showPassword);
                              } else {
                                setShowConfirmPassword(!showConfirmPassword);
                              }
                            }}
                          >
                            {field.name === 'password' ? (
                              showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )
                            ) : showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Privacy Policy Card - Visible for all user types */}
          <div className="group relative mb-8">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-lime-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden">
              {/* Card Header */}
              <div className="relative px-8 py-6 border-b border-slate-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 via-transparent to-transparent" />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-lime-500" />
                    </div>
                    {t('auth.requiredFields.privacy_title')}
                  </h2>
                  <p className="text-slate-400 mt-2 ml-13">
                    {t('auth.requiredFields.privacy_sub')}
                  </p>
                </div>
              </div>

              {/* Privacy Content */}
              <div className="px-8 py-8">
                <div className="flex items-start gap-4 group/check">
                  <div className="relative mt-1.5 flex-shrink-0">
                    <input
                      id="privacy_policy_accepted"
                      name="privacy_policy_accepted"
                      type="checkbox"
                      checked={formData.privacy_policy_accepted}
                      onChange={handleChange}
                      required
                      className="peer sr-only"
                    />
                    <div
                      className="w-6 h-6 border-2 border-slate-600 rounded-lg cursor-pointer peer-checked:bg-gradient-to-br peer-checked:from-primary peer-checked:to-lime-500 peer-checked:border-transparent transition-all duration-300 hover:border-primary/70 flex items-center justify-center"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          privacy_policy_accepted: !formData.privacy_policy_accepted,
                        })
                      }
                    >
                      {formData.privacy_policy_accepted && (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-sm text-slate-300 leading-relaxed">
                    <label htmlFor="privacy_policy_accepted" className="cursor-pointer font-medium">
                      {t('auth.requiredFields.privacy_accept')}{' '}
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-lime-500 underline transition-colors duration-300"
                      >
                        {t('auth.requiredFields.privacy_link')}
                      </a>{' '}
                      {t('auth.requiredFields.privacy_accept_rest')}
                    </label>
                    <p className="mt-3 text-slate-400 text-xs leading-relaxed">
                      {t('auth.requiredFields.privacy_desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="group/btn relative overflow-hidden px-6 py-4 rounded-xl border border-slate-700/50 
              bg-slate-800/30 backdrop-blur-sm text-slate-300 font-semibold
              hover:border-slate-600/50 hover:bg-slate-800/50 transition-all duration-300
              w-full sm:w-auto"
            >
              <div className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform duration-300" />
                <span>{t('auth.requiredFields.back')}</span>
              </div>
            </button>

            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
              {/* Skip Button - Only for clubs and partners */}
              {userType !== 'player' && userType !== 'coach' && (
                <button
                  onClick={handleSkipToRegister}
                  disabled={loading}
                  className="group/btn relative overflow-hidden px-6 py-4 rounded-xl border border-slate-700/50 
                  bg-slate-800/30 backdrop-blur-sm text-slate-300 font-semibold
                  hover:border-primary/50 hover:bg-slate-800/50 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700/50
                  w-full sm:flex-1"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span>{loading ? t('auth.requiredFields.creating') : t('auth.requiredFields.skip')}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                </button>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={loading}
                className="group/btn relative overflow-hidden px-6 py-4 rounded-xl
                bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold
                hover:shadow-xl hover:shadow-primary/50 transition-all duration-500
                disabled:opacity-50 disabled:cursor-not-allowed
                w-full sm:flex-1"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <span>{t('auth.requiredFields.continue')}</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Post-registration membership payment modal */}
      {showMembershipModal && (
        <MembershipSelector
          isOpen={showMembershipModal}
          onClose={() => {
            setShowMembershipModal(false);
            setPendingPayment(false);
            navigateToDashboard(registeredUserType);
          }}
          userType={registeredUserType}
          onSuccess={() => {
            setShowMembershipModal(false);
            setPendingPayment(false);
            toast.success('¡Membresía activada! Bienvenido a la Federación Mexicana de Pickleball.');
            navigateToDashboard(registeredUserType);
          }}
        />
      )}
    </div>
  );
};

export default RequiredFieldsPage;
