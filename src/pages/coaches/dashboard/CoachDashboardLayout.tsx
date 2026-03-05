import { useSelector } from 'react-redux';
import DashboardLayoutBase, { NavItem } from '@/components/layouts/DashboardLayoutBase';
import { RootState } from '@/store';
import {
  LayoutDashboard,
  User,
  Shield,
  MessageSquare,
  Receipt,
  Trophy,
  Activity,
} from 'lucide-react';

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/coaches/dashboard',
    icon: LayoutDashboard,
    description: 'Vista general',
  },
  {
    title: 'Torneo Dashboard',
    url: '/coaches/dashboard/tournaments/dashboard',
    icon: Activity,
    description: 'Registrar marcadores y ver partidos',
  },
  {
    title: 'Mi Cuenta',
    url: '/coaches/dashboard/account',
    icon: User,
    description: 'Gestionar mi cuenta',
  },
  {
    title: 'Credenciales Digitales',
    url: '/coaches/dashboard/credentials',
    icon: Shield,
    description: 'Mis credenciales NRTP',
  },
  {
    title: 'Panel de Torneos',
    url: '/coaches/dashboard/tournaments/view',
    icon: Shield,
    description: 'Monitorear torneos de equipo',
  },
  {
    title: 'Mensajes',
    url: '/coaches/dashboard/messages',
    icon: MessageSquare,
    description: 'Mensajes y comunicaciones',
  },
  {
    title: 'Pagos',
    url: '/coaches/dashboard/payments',
    icon: Receipt,
    description: 'Historial de pagos',
  },
];

const coachUser = {
  name: 'Juan Pérez',
  email: 'juan.perez@email.com',
  role: 'Coach',
  avatar: null,
};

export default function CoachDashboardLayout() {
  const { user } = useSelector((state: RootState) => state.auth);

  const userData = user
    ? {
        name: user.full_name || user.username || 'Usuario',
        email: user.email || '',
        role: 'Coach',
        avatar: user.profile_photo || null,
      }
    : coachUser;

  return (
    <DashboardLayoutBase
      navItems={navItems}
      brandTitle="FEDMEX"
      brandSubtitle="Panel de Coach"
      BrandIcon={User}
      user={userData}
      basePath="/coaches/dashboard"
    />
  );
}
