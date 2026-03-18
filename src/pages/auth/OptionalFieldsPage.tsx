import { useState, useEffect } from 'react';
import { compressImage } from '@/lib/imageCompress';
import { AvatarCropDialog } from '@/components/ui/AvatarCropDialog';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../store';
import { registerUser } from '../../store/slices/authSlice';
import { toast } from 'sonner';
import { MembershipSelector } from '@/components/payment/MembershipSelector';
import { StateAutocomplete } from '@/components/ui/StateAutocomplete';
import { Mexico } from '@/constants/constants';
import {
  Phone,
  MapPin,
  Globe,
  Calendar,
  User,
  Award,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  AlertCircle,
  Building2,
  Briefcase,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const OptionalFieldsPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    date_of_birth: '',
    gender: '',
    phone: '',
    profile_photo: '',
    bio: '',
    skill_level: '',
    state: '',
    city: '',
    address: '',
    timezone: '',
    curp: '',
    rfc: '',
    website: '',
    contact_person: '',
    job_title: '',
  });

  const [files, setFiles] = useState({
    profile_photo: null as File | null,
  });
  const [userType, setUserType] = useState<string>('');
  const [requiredFields, setRequiredFields] = useState<any>({});
  const [dragActive, setDragActive] = useState({ profile: false, document: false });
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState('');
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [registeredUserType, setRegisteredUserType] = useState<string>('');
  const [showLevelsModal, setShowLevelsModal] = useState(false);

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
    const storedRequiredFields = localStorage.getItem('registration_required_fields');

    if (!storedUserType || !storedRequiredFields) {
      navigate('/register/select-type');
      return;
    }

    setUserType(storedUserType);
    setRequiredFields(JSON.parse(storedRequiredFields));
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (name: string, file: File | null) => {
    if (file && name === 'profile_photo') {
      setCropSrc(URL.createObjectURL(file));
      setCropFileName(file.name);
    } else {
      setFiles((prev) => ({ ...prev, [name]: file }));
    }
  };

  const handlePhotoCropComplete = async (croppedFile: File) => {
    setCropSrc(null);
    const compressed = await compressImage(croppedFile);
    setFiles((prev) => ({ ...prev, profile_photo: compressed }));
  };

  const handleCropCancel = () => setCropSrc(null);

  const handleDrag = (e: React.DragEvent, type: 'profile' | 'document') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive((prev) => ({ ...prev, [type]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, name: string, type: 'profile' | 'document') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(name, e.dataTransfer.files[0]);
    }
  };

  const getOptionalFields = () => {
    const baseFields = [
      {
        name: 'phone',
        label: t('auth.optionalFields.field_phone'),
        type: 'tel',
        placeholder: t('auth.optionalFields.field_phone_placeholder'),
        icon: Phone,
      },
      {
        name: 'state',
        label: t('auth.optionalFields.field_state'),
        type: 'autocomplete',
        placeholder: t('auth.optionalFields.field_state_placeholder'),
        icon: MapPin,
      },
      {
        name: 'city',
        label: t('auth.optionalFields.field_city'),
        type: 'text',
        placeholder: t('auth.optionalFields.field_city_placeholder'),
        icon: MapPin,
      },
      {
        name: 'address',
        label: t('auth.optionalFields.field_address'),
        type: 'textarea',
        placeholder: t('auth.optionalFields.field_address_placeholder'),
        icon: MapPin,
      },
      {
        name: 'website',
        label: t('auth.optionalFields.field_website'),
        type: 'url',
        placeholder: t('auth.optionalFields.field_website_placeholder'),
        icon: Globe,
        optional: true,
      },
    ];

    if (userType === 'player' || userType === 'coach') {
      return [
        {
          name: 'date_of_birth',
          label: t('auth.optionalFields.field_date_of_birth'),
          type: 'date',
          placeholder: '',
          icon: Calendar,
        },
        {
          name: 'gender',
          label: t('auth.optionalFields.field_gender'),
          type: 'select',
          options: ['masculino', 'femenino'],
          icon: User,
        },
        {
          name: 'skill_level',
          label: t('auth.optionalFields.field_skill_level'),
          type: 'select',
          options: ['2.5', '3.5', '4.5', '5+'],
          icon: Award,
        },
        { name: 'curp', label: t('auth.optionalFields.field_curp'), type: 'text', placeholder: t('auth.optionalFields.field_curp_placeholder'), icon: FileText },
        ...baseFields,
      ];
    } else if (userType === 'club' || userType === 'partner') {
      return [
        {
          name: 'contact_person',
          label: t('auth.optionalFields.field_contact_person'),
          type: 'text',
          placeholder: t('auth.optionalFields.field_contact_person_placeholder'),
          icon: User,
        },
        {
          name: 'job_title',
          label: t('auth.optionalFields.field_job_title'),
          type: 'text',
          placeholder: t('auth.optionalFields.field_job_title_placeholder'),
          icon: Briefcase,
        },
        {
          name: 'rfc',
          label: t('auth.optionalFields.field_rfc'),
          type: 'text',
          placeholder: t('auth.optionalFields.field_rfc_placeholder'),
          icon: FileText,
        },
        ...baseFields,
      ];
    } else {
      return baseFields;
    }
  };

  const handleRegister = async () => {
    try {
      // Validate files for player/coach
      if (userType === 'player' || userType === 'coach') {
        if (!files.profile_photo) {
          toast.error(t('auth.optionalFields.validate_photo'));
          return;
        }
      }

      // Validate all required optional fields (everything except website)
      const requiredOptionalFields = getOptionalFields().filter((f: any) => !f.optional);
      for (const field of requiredOptionalFields) {
        const value = formData[field.name as keyof typeof formData];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          toast.error(`El campo "${field.label}" es obligatorio`);
          return;
        }
      }

      const validationErrors: string[] = [];

      if (userType === 'player' || userType === 'coach') {
        if (!requiredFields.full_name || requiredFields.full_name.trim() === '') {
          validationErrors.push(t('auth.optionalFields.validate_full_name'));
        }
      }

      if (userType === 'club' || userType === 'partner') {
        if (!requiredFields.business_name || requiredFields.business_name.trim() === '') {
          validationErrors.push(t('auth.optionalFields.validate_business_name'));
        }
      }

      if (!requiredFields.privacy_policy_accepted) {
        validationErrors.push(t('auth.optionalFields.validate_privacy'));
      }

      if (!requiredFields.email || requiredFields.email.trim() === '') {
        validationErrors.push(t('auth.optionalFields.validate_email'));
      }
      if (!requiredFields.password || requiredFields.password.trim() === '') {
        validationErrors.push(t('auth.optionalFields.validate_password'));
      }

      if (validationErrors.length > 0) {
        toast.error(
          `${t('auth.optionalFields.validate_issues')}\n${validationErrors.join('\n')}`,
        );
        return;
      }

      const formDataToSend = new FormData();

      formDataToSend.append('user_type', userType);
      Object.entries(requiredFields).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          formDataToSend.append(key, String(value));
        }
      });

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && typeof value === 'string') {
          formDataToSend.append(key, value);
        }
      });

      if (files.profile_photo) {
        formDataToSend.append('profile_photo', files.profile_photo);
      }

      // Set pending payment flag before dispatch so the isAuthenticated effect doesn't navigate
      if (USER_TYPES_REQUIRING_PAYMENT.includes(userType)) {
        setPendingPayment(true);
      }

      const result = await dispatch(registerUser(formDataToSend));
      const registrationResult = result as any;
      const apiResponse = registrationResult?.payload;

      if (apiResponse?.data?.user && apiResponse?.data?.tokens) {
        localStorage.removeItem('registration_user_type');
        localStorage.removeItem('registration_required_fields');

        const type = apiResponse.data.user.user_type;
        setRegisteredUserType(type);

        if (USER_TYPES_REQUIRING_PAYMENT.includes(type)) {
          toast.success('¡Registro exitoso! Por favor completa tu membresía.');
          setShowMembershipModal(true);
        } else {
          // Partner — free, navigate immediately
          setPendingPayment(false);
          toast.success(t('auth.optionalFields.toast_success'));
          navigateToDashboard(type);
        }
      } else {
        setPendingPayment(false);
        toast.error(t('auth.optionalFields.toast_error_server'));
        console.error('Registration failed - Invalid response structure:', apiResponse);
      }
    } catch (err) {
      toast.error(error || t('auth.optionalFields.toast_error_server'));
    }
  };

  const handleBack = () => {
    navigate('/register/required-fields');
  };

  const handleSkip = async () => {
    try {
      const registrationData = {
        user_type: userType as any,
        ...requiredFields,
      };

      const validationErrors = [];

      if (userType === 'club' || userType === 'partner') {
        if (!requiredFields.business_name || requiredFields.business_name.trim() === '') {
          validationErrors.push(t('auth.optionalFields.validate_business_name'));
        }
      }

      if (!requiredFields.privacy_policy_accepted) {
        validationErrors.push(t('auth.optionalFields.validate_privacy'));
      }

      if (!requiredFields.email || requiredFields.email.trim() === '') {
        validationErrors.push(t('auth.optionalFields.validate_email'));
      }
      if (!requiredFields.password || requiredFields.password.trim() === '') {
        validationErrors.push(t('auth.optionalFields.validate_password'));
      }

      if (validationErrors.length > 0) {
        toast.error(
          `${t('auth.optionalFields.validate_issues')}\n${validationErrors.join('\n')}`,
        );
        return;
      }

      if (USER_TYPES_REQUIRING_PAYMENT.includes(userType)) {
        setPendingPayment(true);
      }

      const result = await dispatch(registerUser(registrationData));
      const registrationResult = result as any;
      const apiResponse = registrationResult?.payload;

      if (apiResponse?.data?.user && apiResponse?.data?.tokens) {
        localStorage.removeItem('registration_user_type');
        localStorage.removeItem('registration_required_fields');

        const type = apiResponse.data.user.user_type;
        setRegisteredUserType(type);

        if (USER_TYPES_REQUIRING_PAYMENT.includes(type)) {
          toast.success('¡Registro exitoso! Por favor completa tu membresía.');
          setShowMembershipModal(true);
        } else {
          setPendingPayment(false);
          toast.success(t('auth.optionalFields.toast_success_skip'));
          navigateToDashboard(type);
        }
      } else {
        setPendingPayment(false);
        toast.error(t('auth.optionalFields.toast_error_server'));
        console.error('Registration failed - Invalid response structure:', apiResponse);
      }
    } catch (err) {
      toast.error(error || t('auth.optionalFields.toast_error_server'));
    }
  };

  const getUserTypeLabel = () => {
    return t(`userTypes.${userType}.title`, { defaultValue: userType });
  };

  const renderField = (field: any) => {
    const Icon = field.icon;

    return (
      <div key={field.name} className="group/field">
        <label htmlFor={field.name} className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2.5">
          <span>
            {field.label}
            {!field.optional && <span className="text-red-400 ml-1">*</span>}
            {field.optional && <span className="text-xs text-slate-300 ml-2">(opcional)</span>}
          </span>
          {field.name === 'skill_level' && (
            <button
              type="button"
              onClick={() => setShowLevelsModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-lime-400 bg-primary/10 hover:bg-primary/20 border border-primary/30 px-2 py-0.5 rounded-full transition-all duration-200 shrink-0"
            >
              Ver más <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </label>

        <div className="relative">
          {!field.type.includes('select') &&
            !field.type.includes('textarea') &&
            !field.type.includes('autocomplete') && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-primary transition-colors duration-300">
                <Icon className="w-5 h-5" />
              </div>
            )}

          {field.type === 'autocomplete' ? (
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-primary transition-colors duration-300 pointer-events-none">
                <Icon className="w-5 h-5" />
              </div>
              <StateAutocomplete
                value={formData[field.name as keyof typeof formData] as string}
                onChange={(value) => handleSelectChange(field.name, value)}
                placeholder={field.placeholder}
                className="w-full h-14 pl-12 pr-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 
                transition-all duration-300 backdrop-blur-sm hover:border-slate-600/50"
              />
            </div>
          ) : field.type === 'select' ? (
            <div className="relative">
              <select
                value={formData[field.name as keyof typeof formData]}
                onChange={(e) => handleSelectChange(field.name, e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white 
                appearance-none cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 
                transition-all duration-300 backdrop-blur-sm hover:border-slate-600/50"
              >
                <option value="" className="bg-slate-800">
                  {t('auth.optionalFields.select_prefix')} {field.label.toLowerCase()}
                </option>
                {field.options.map((option: string) => {
                  const optionLabels: Record<string, string> = {
                    masculino: t('auth.optionalFields.gender_male'),
                    femenino: t('auth.optionalFields.gender_female'),
                    otro: option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' '),
                    prefiero_no_decir: option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' '),
                  };
                  const label =
                    optionLabels[option] ||
                    option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ');
                  return (
                    <option key={option} value={option} className="bg-slate-800">
                      {label}
                    </option>
                  );
                })}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                <Icon className="w-5 h-5" />
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          ) : field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name as keyof typeof formData]}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 
              transition-all duration-300 backdrop-blur-sm hover:border-slate-600/50 resize-none"
            />
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name as keyof typeof formData]}
              onChange={handleChange}
              className="w-full h-14 pl-12 pr-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 
              transition-all duration-300 backdrop-blur-sm hover:border-slate-600/50"
            />
          )}
        </div>
      </div>
    );
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <span className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-wider uppercase bg-primary/10 px-6 py-2.5 rounded-full border border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span>{t('auth.optionalFields.step')}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              <span className="block bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent leading-tight">
                {t('auth.optionalFields.title')}
              </span>
            </h1>

            <p className="text-slate-200 text-lg max-w-2xl mx-auto">
              {t('auth.optionalFields.subtitle', { role: getUserTypeLabel() })}
            </p>
          </div>

          {/* File Upload Section - Only for Players and Coaches */}
          {(userType === 'player' || userType === 'coach') && (
            <div className="group relative mb-8">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-lime-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden">
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-slate-700/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      {t('auth.optionalFields.docs_title')}
                    </h2>
                    <p className="text-slate-200 mt-2 ml-13">
                      {t('auth.optionalFields.docs_sub')}
                    </p>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="px-8 pt-6">
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-slate-300 leading-relaxed">
                        <strong className="text-primary">{t('auth.optionalFields.info_banner_title')}</strong> {t('auth.optionalFields.info_banner_text')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Upload Areas */}
                <div className="px-8 py-8 grid md:grid-cols-2 gap-6">
                  {/* Profile Photo Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-300">
                      {t('auth.optionalFields.photo_label')}
                      <span className="text-primary ml-1">*</span>
                      <span className="text-xs text-slate-300 ml-2">({t('auth.optionalFields.photo_optional')})</span>
                    </label>

                    <div
                      onDragEnter={(e) => handleDrag(e, 'profile')}
                      onDragLeave={(e) => handleDrag(e, 'profile')}
                      onDragOver={(e) => handleDrag(e, 'profile')}
                      onDrop={(e) => handleDrop(e, 'profile_photo', 'profile')}
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 
                      ${
                        dragActive.profile
                          ? 'border-primary bg-primary/5 scale-[1.02]'
                          : 'border-slate-700/50 hover:border-primary/50 hover:bg-slate-800/30'
                      }`}
                    >
                      {files.profile_photo ? (
                        <div className="space-y-4">
                          <div className="relative w-24 h-24 mx-auto">
                            <img
                              src={URL.createObjectURL(files.profile_photo)}
                              alt={t('auth.optionalFields.photo_preview_alt')}
                              className="w-full h-full object-cover rounded-full border-4 border-primary/30"
                            />
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-slate-900" />
                            </div>
                          </div>
                          <p className="text-sm text-slate-300 font-medium truncate px-4">
                            {files.profile_photo.name}
                          </p>
                          <button
                            onClick={() => handleFileChange('profile_photo', null)}
                            className="group/btn inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 
                            text-slate-300 rounded-lg transition-all duration-300 text-sm font-medium"
                          >
                            <X className="w-4 h-4" />
                            {t('auth.optionalFields.photo_remove')}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-slate-300 font-medium">
                              {t('auth.optionalFields.photo_drag')}
                            </p>
                            <p className="text-xs text-slate-300">{t('auth.optionalFields.photo_formats')}</p>
                          </div>
                          <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 leading-relaxed">
                            Tiene que ser una foto donde se ve tu cara despejada y de frente.
                          </p>
                          <input
                            id="profile_photo"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileChange('profile_photo', e.target.files?.[0] || null)
                            }
                            className="hidden"
                          />
                          <button
                            onClick={() => document.getElementById('profile_photo')?.click()}
                            className="group/btn inline-flex items-center gap-2 px-6 py-3 bg-primary/20 hover:bg-primary 
                            text-primary hover:text-slate-900 border border-primary/30 rounded-xl 
                            transition-all duration-300 font-semibold"
                          >
                            <Upload className="w-5 h-5" />
                            {t('auth.optionalFields.photo_btn')}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* WhatsApp compression tip */}
                    <div className="flex gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                      <span className="text-emerald-400 text-lg leading-none shrink-0">💡</span>
                      <p className="text-xs text-emerald-300/90 leading-relaxed">
                        <span className="font-semibold">Tip:</span> Te recomendamos que la imagen que quieras cargar, se la envíes a alguien por WhatsApp, y luego la descargues en esa misma conversación. WhatsApp compacta el peso de las imágenes de forma automática.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Optional Fields Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Personal Information Card */}
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-lime-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden">
                <div className="relative px-8 py-6 border-b border-slate-700/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      {t('auth.optionalFields.personal_info')}
                    </h2>
                    <p className="text-slate-200 mt-2 ml-13">{t('auth.optionalFields.personal_info_sub')}</p>
                  </div>
                </div>

                <div className="px-8 py-8 space-y-6">
                  {getOptionalFields()
                    .slice(0, Math.ceil(getOptionalFields().length / 2))
                    .map((field) => renderField(field))}
                </div>
              </div>
            </div>

            {/* Additional Details Card */}
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-lime-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden">
                <div className="relative px-8 py-6 border-b border-slate-700/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 via-transparent to-transparent" />
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-lime-500" />
                      </div>
                      {t('auth.optionalFields.additional_details')}
                    </h2>
                    <p className="text-slate-200 mt-2 ml-13">
                      {t('auth.optionalFields.additional_details_sub')}
                    </p>
                  </div>
                </div>

                <div className="px-8 py-8 space-y-6">
                  {getOptionalFields()
                    .slice(Math.ceil(getOptionalFields().length / 2))
                    .map((field) => renderField(field))}
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
                <span>{t('auth.optionalFields.back')}</span>
              </div>
            </button>

            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
              {/* Complete Registration Button */}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="group/btn relative overflow-hidden px-6 py-4 rounded-xl
                bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold
                hover:shadow-xl hover:shadow-primary/50 transition-all duration-500
                disabled:opacity-50 disabled:cursor-not-allowed
                w-full sm:flex-1"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <span>{loading ? t('auth.optionalFields.creating') : t('auth.optionalFields.complete')}</span>
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
            // Allow user to skip payment and pay later from dashboard
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

      {cropSrc && (
        <AvatarCropDialog
          imageSrc={cropSrc}
          originalFileName={cropFileName}
          onCropComplete={handlePhotoCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* ── Levels Info Modal (bottom-sheet on mobile) ─────────────────── */}
      {showLevelsModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowLevelsModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Sheet */}
          <div
            className="relative w-full sm:max-w-2xl bg-slate-900 border border-slate-700/50 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-slate-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">Niveles de Juego (NRTP)</h3>
                <p className="text-xs text-slate-200 mt-0.5">Elige el nivel que mejor te describe</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://pickleball-frontend-ten.vercel.app/players/categories"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-lime-400 transition-colors"
                >
                  Ver completo <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setShowLevelsModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors ml-2"
                >
                  <X className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-6 py-4 space-y-3">
              {[
                {
                  level: '2.0',
                  name: 'Principiante',
                  color: 'text-green-400',
                  bg: 'bg-green-500/10 border-green-500/20',
                  dot: 'bg-green-400',
                  description: 'Jugador nuevo que está aprendiendo las reglas básicas y la técnica fundamental.',
                  traits: ['Conoce las reglas básicas', 'Puede mantener rallies cortos', 'Desarrollando técnica de servicio'],
                },
                {
                  level: '2.5',
                  name: 'Principiante Avanzado',
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10 border-emerald-500/20',
                  dot: 'bg-emerald-400',
                  description: 'Fundamentos sólidos, busca mejorar consistencia.',
                  traits: ['Servicio más consistente', 'Rallies más largos', 'Entiende estrategia básica de dobles'],
                },
                {
                  level: '3.0',
                  name: 'Intermedio',
                  color: 'text-sky-400',
                  bg: 'bg-sky-500/10 border-sky-500/20',
                  dot: 'bg-sky-400',
                  description: 'Técnica desarrollada y comprensión táctica del juego.',
                  traits: ['Golpes consistentes desde línea de fondo', 'Dinks con control', 'Servicio con dirección intencional'],
                },
                {
                  level: '3.5',
                  name: 'Intermedio Alto',
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10 border-blue-500/20',
                  dot: 'bg-blue-400',
                  description: 'Variedad de golpes y pensamiento estratégico avanzado.',
                  traits: ['Volleys consistentes', 'Drops del tercer golpe', 'Reconoce oportunidades de ataque'],
                },
                {
                  level: '4.0',
                  name: 'Avanzado',
                  color: 'text-violet-400',
                  bg: 'bg-violet-500/10 border-violet-500/20',
                  dot: 'bg-violet-400',
                  description: 'Jugador competitivo con arsenal técnico completo.',
                  traits: ['Drops del tercer golpe consistentes', 'Buen control de ritmo', 'Estrategia de dobles desarrollada'],
                },
                {
                  level: '4.5',
                  name: 'Avanzado Alto',
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10 border-purple-500/20',
                  dot: 'bg-purple-400',
                  description: 'Altamente competitivo, cerca del nivel profesional.',
                  traits: ['Potencia y control en todos los golpes', 'Excelente anticipación', 'Varía velocidad y spin efectivamente'],
                },
                {
                  level: '5.0+',
                  name: 'Open / Elite',
                  color: 'text-primary',
                  bg: 'bg-primary/10 border-primary/20',
                  dot: 'bg-primary',
                  description: 'Jugador profesional o de nivel competitivo más alto.',
                  traits: ['Dominio completo del juego', 'Competidor en torneos profesionales', 'Adaptación táctica inmediata'],
                },
              ].map((cat) => (
                <div key={cat.level} className={`flex gap-3 p-3 rounded-xl border ${cat.bg}`}>
                  <div className="shrink-0 pt-0.5">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${cat.dot}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold ${cat.color}`}>{cat.level}</span>
                      <span className="text-sm font-semibold text-white">{cat.name}</span>
                    </div>
                    <p className="text-xs text-slate-200 mb-1.5">{cat.description}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {cat.traits.map((t) => (
                        <span key={t} className="text-[10px] text-slate-300">• {t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-700/50 shrink-0">
              <button
                onClick={() => setShowLevelsModal(false)}
                className="w-full py-3 bg-primary hover:bg-lime-500 text-slate-900 font-bold rounded-xl transition-colors text-sm"
              >
                Entendido, ya sé mi nivel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionalFieldsPage;
