import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { loginUser } from '../../store/slices/authSlice';
import { toast } from 'sonner';
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Trophy,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Import your images
import loginHeroImage from '@/assets/images/login-hero.jpg'; // Main hero image
import pickleballCourtImage from '@/assets/images/federation.png'; // Court background
import playerActionImage from '@/assets/images/image 7.jpeg'; // Action shot
import logoImage from '@/assets/images/Logos/Logo pickleball compressed.png'; // Your logo

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const loading = useSelector((state: RootState) => state.auth.loading);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { pending } = useSelector((state: RootState) => state.pending);
  console.log('Auth State:', { loading, user, isAuthenticated });
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const userType = user.user_type;
      switch (userType) {
        case 'players':
          navigate('/players/dashboard');
          break;
        case 'coaches':
          navigate('/coaches/dashboard');
          break;
        case 'clubs':
          navigate('/clubs/dashboard');
          break;
        case 'partners':
          navigate('/partners/dashboard');
          break;
        case 'state':
          navigate('/state/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/players/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const result = await dispatch(loginUser(formData));
      const loginResult = result as any;

      if (loginResult.type === 'auth/loginUser/fulfilled') {
        const apiResponse = loginResult?.payload;

        if (apiResponse?.data?.user && apiResponse?.data?.tokens) {
          toast.success('¡Inicio de sesión exitoso!');

          const userType = apiResponse.data.user.user_type;

          switch (userType) {
            case 'player':
              navigate('/players/dashboard');
              break;
            case 'coach':
              navigate('/coaches/dashboard');
              break;
            case 'club':
              navigate('/clubs/dashboard');
              break;
            case 'partner':
              navigate('/partners/dashboard');
              break;
            case 'state':
              navigate('/state/dashboard');
              break;
            case 'admin':
              navigate('/admin/dashboard');
              break;
            default:
              navigate('/players/dashboard');
          }
        } else {
          toast.error('Inicio de sesión fallido - Respuesta inválida del servidor');
        }
      } else if (loginResult.type === 'auth/loginUser/rejected') {
        const errorMessage = loginResult?.payload || 'Inicio de sesión fallido';
        toast.error(errorMessage);
      }
    } catch (err) {
      toast.error('Inicio de sesión fallido - Error inesperado');
      console.error('Login error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isAnyActionPending = pending || loading;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(124, 252, 0, 0.1) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(124, 252, 0, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Left Side - Hero Image Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={pickleballCourtImage}
            alt="Cancha de Pickleball"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        <div className="w-full max-w-md xl:max-w-lg">
          {/* Main Card */}
          <div className="group relative">
            {/* Glow Effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-lime-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

            <Card className="relative border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 group-hover:border-primary/50 transition-all duration-700 overflow-hidden">
              {/* Top Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-lime-500 to-primary" />

              {/* Pattern Overlay */}
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(124, 252, 0, 0.3) 1px, transparent 0)`,
                  backgroundSize: '32px 32px',
                }}
              />

              <CardHeader className="space-y-1 pb-6 pt-8 px-6 sm:px-8 relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 text-primary text-xs sm:text-sm font-bold tracking-wider uppercase bg-primary/10 px-4 py-2 rounded-full border border-primary/20 backdrop-blur-sm w-fit">
                  <Sparkles className="w-4 h-4" />
                  <span>Inicio Seguro</span>
                </div>

                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent pt-3">
                  Iniciar Sesión
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm sm:text-base">
                  Ingresa tus credenciales para acceder a tu panel
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 sm:px-8 pb-8 relative z-10">
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                      Correo Electrónico
                    </Label>
                    <div className="relative group/input">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-primary transition-colors duration-300 pointer-events-none z-10" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu.correo@ejemplo.com"
                        disabled={isAnyActionPending}
                        className="h-12 sm:h-14 pl-12 pr-4 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 text-sm sm:text-base focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                        Password
                      </Label>
                      <Link
                        to="/forgot-password"
                        className="text-xs sm:text-sm text-primary hover:text-lime-500 transition-colors duration-300 font-medium"
                        style={{ pointerEvents: isAnyActionPending ? 'none' : 'auto' }}
                      >
                        ¿Olvidaste?
                      </Link>
                    </div>
                    <div className="relative group/input">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-primary transition-colors duration-300 pointer-events-none z-10" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Ingresa tu contraseña"
                        disabled={isAnyActionPending}
                        className="h-12 sm:h-14 pl-12 pr-12 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 text-sm sm:text-base focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors duration-300 z-10"
                        disabled={isAnyActionPending}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isAnyActionPending}
                    className="group/btn w-full h-12 sm:h-14 lg:h-16 px-6 bg-gradient-to-r from-primary to-lime-500 hover:from-primary hover:to-lime-400 text-slate-900 font-bold text-sm sm:text-base lg:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all duration-500 overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isAnyActionPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                          <span>Iniciando sesión...</span>
                        </>
                      ) : (
                        <>
                          <span>Iniciar Sesión</span>
                          <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6 sm:my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700/50" />
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-500">
                      ¿Nuevo en la plataforma?
                    </span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-sm sm:text-base text-slate-400">
                    ¿No tienes una cuenta?{' '}
                    <Link
                      to="/register/select-type"
                      className="inline-flex items-center gap-2 text-primary hover:text-lime-500 font-semibold transition-colors duration-300 group/link"
                      style={{ pointerEvents: isAnyActionPending ? 'none' : 'auto' }}
                    >
                      <span>Crear cuenta</span>
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </p>
                </div>
              </CardContent>

              {/* Corner Gradients */}
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-lime-500/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </Card>
          </div>

          {/* Bottom Info */}
          <div className="mt-6 sm:mt-8 text-center space-y-2">
            <p className="text-xs sm:text-sm text-slate-500 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Protegido por cifrado estándar de la industria
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
