import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { userTypes } from '@/constants/constants';
import {
  User,
  Users,
  Building2,
  Handshake,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Import images
import playerImage from '@/assets/images/blogs/Image8-1.png';
import coachImage from '@/assets/images/blogs/image8.png';
import clubImage from '@/assets/images/courts.jpg';
import partnerImage from '@/assets/images/_DSC8895.png';
import stateImage from '@/assets/images/blogs/Image9-1.png';

const SelectUserTypePage = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const userType = user.user_type;
      switch (userType) {
        case 'player':
          navigate('/player/dashboard');
          break;
        case 'coach':
          navigate('/coach/dashboard');
          break;
        case 'club':
          navigate('/clubs/dashboard');
          break;
        case 'partner':
          navigate('/partner/dashboard');
          break;
        case 'state':
          navigate('/state/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/player/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleContinue = () => {
    if (selectedType) {
      localStorage.setItem('registration_user_type', selectedType);
      navigate('/register/required-fields');
    }
  };

  const getIcon = (type: string) => {
    const iconClass = 'w-full h-full';
    switch (type) {
      case 'player':
        return <User className={iconClass} />;
      case 'coach':
        return <Users className={iconClass} />;
      case 'club':
        return <Building2 className={iconClass} />;
      case 'partner':
        return <Handshake className={iconClass} />;
      case 'state':
        return <MapPin className={iconClass} />;
      default:
        return <User className={iconClass} />;
    }
  };

  const getImage = (type: string) => {
    switch (type) {
      case 'player':
        return playerImage;
      case 'coach':
        return coachImage;
      case 'club':
        return clubImage;
      case 'partner':
        return partnerImage;
      case 'state':
        return stateImage;
      default:
        return playerImage;
    }
  };

  const selectedUserType = userTypes.find((t) => t.type === selectedType);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Side - Preview Panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Background Images - Transitioning */}
        <div className="absolute inset-0">
          {userTypes.map((userType) => (
            <div
              key={userType.type}
              className={`absolute inset-0 transition-opacity duration-700 ${
                selectedType === userType.type ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={getImage(userType.type)}
                alt={userType.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/50 to-slate-950/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
            </div>
          ))}

          {/* Default state when nothing selected */}
          {!selectedType && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
              <div className="absolute inset-0 opacity-10">
                <div
                  style={{
                    backgroundImage: `linear-gradient(rgba(124, 252, 0, 0.2) 1px, transparent 1px), 
                    linear-gradient(90deg, rgba(124, 252, 0, 0.2) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                  }}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-lime-500 flex items-center justify-center shadow-lg shadow-primary/50">
              <Shield className="w-7 h-7 text-slate-900" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Pickleball Federation</h3>
              <p className="text-slate-400 text-sm">Official Registration</p>
            </div>
          </div>

          {/* Main Preview Content */}
          <div className="space-y-8 max-w-xl">
            {selectedType ? (
              <>
                {/* Selected Role Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-xl">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-primary text-sm font-semibold">
                    {selectedUserType?.title}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                    {selectedUserType?.description}
                  </h2>
                  <p className="text-lg text-slate-400">
                    This account type is designed specifically for your needs in the pickleball
                    community.
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">What's Included</h3>
                  <ul className="space-y-3">
                    {selectedUserType?.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-base leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* Default State */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-primary text-sm font-semibold">GET STARTED</span>
                </div>

                <div>
                  <h2 className="text-5xl xl:text-6xl font-bold leading-tight mb-4">
                    <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                      Join the Pickleball Community
                    </span>
                  </h2>
                  <p className="text-xl text-slate-400 leading-relaxed">
                    Select your role from the list to see detailed features and benefits tailored
                    for you.
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-semibold text-white">Why Choose Us</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-300 text-sm font-medium">Comprehensive Platform</p>
                        <p className="text-slate-500 text-xs">Everything you need in one place</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-300 text-sm font-medium">Active Community</p>
                        <p className="text-slate-500 text-xs">50K+ members nationwide</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-300 text-sm font-medium">Secure & Trusted</p>
                        <p className="text-slate-500 text-xs">Bank-level encryption</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">50K+</div>
              <div className="text-sm text-slate-500">Miembros</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-lime-500 mb-1">1000+</div>
              <div className="text-sm text-slate-500">Eventos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">150+</div>
              <div className="text-sm text-slate-500">Clubes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Role Selection List */}
      <div className="w-full lg:w-[480px] xl:w-[540px] bg-slate-900 flex flex-col relative">
        {/* Background Accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="p-8 pb-6 border-b border-white/10">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-lime-500 flex items-center justify-center shadow-lg shadow-primary/50">
                <Shield className="w-7 h-7 text-slate-900" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Pickleball Federation</h3>
                <p className="text-slate-400 text-sm">Official Registration</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Step Indicator */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary text-xs font-semibold tracking-wide">
                  STEP 1 OF 3
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-white">Select Your Role</h1>
              <p className="text-slate-400">Choose the option that best describes you</p>
            </div>
          </div>

          {/* Role List - Scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-3">
            {userTypes.map((userType) => {
              const isSelected = selectedType === userType.type;

              return (
                <button
                  key={userType.type}
                  onClick={() => setSelectedType(userType.type)}
                  className={`group w-full text-left transition-all duration-300 ${
                    isSelected ? 'scale-[1.02]' : ''
                  }`}
                >
                  <Card
                    className={`relative overflow-hidden transition-all duration-300 backdrop-blur-lg border ${
                      isSelected
                        ? 'bg-transparent border-primary/60 shadow-lg shadow-primary/20'
                        : 'bg-transparent border-white/20 hover:border-white/30'
                    }`}
                  >
                    {/* Selection Indicator Strip */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                        isSelected ? 'bg-primary' : 'bg-transparent'
                      }`}
                    />

                    <div className="p-5 pl-6">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isSelected
                              ? 'bg-transparent text-primary shadow-md shadow-primary/30'
                              : 'bg-transparent text-slate-400 group-hover:text-slate-300 group-hover:scale-105'
                          }`}
                        >
                          <div className="w-6 h-6">{getIcon(userType.type)}</div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <h3
                              className={`text-lg font-bold transition-colors duration-300 ${
                                isSelected ? 'text-primary' : 'text-white'
                              }`}
                            >
                              {userType.title}
                            </h3>

                            {/* Selection Indicator */}
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-primary border-primary'
                                  : 'border-slate-600 group-hover:border-slate-500'
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                            </div>
                          </div>
                          {/* Feature Count Badge */}
                          <div className="mt-2 flex items-center gap-2">
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-300 ${
                                isSelected
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-white/5 text-slate-500'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{userType.features.length} features</span>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1 text-xs text-primary">
                                <span>View details</span>
                                <ChevronRight className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>

          {/* Footer - CTA */}
          <div className="p-8 pt-6 border-t border-white/10 space-y-4">
            <Button
              onClick={handleContinue}
              disabled={!selectedType}
              className="group/btn w-full h-14 px-6 bg-gradient-to-r from-primary to-lime-500 hover:from-primary/90 hover:to-lime-400 text-slate-900 font-bold text-base rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {selectedType ? (
                  <>
                    Continue as {selectedUserType?.title}
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </>
                ) : (
                  'Select a role to continue'
                )}
              </span>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            </Button>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure registration • Change anytime in settings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(124, 252, 0, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(124, 252, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default SelectUserTypePage;
