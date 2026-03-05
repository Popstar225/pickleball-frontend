import { useSelector } from 'react-redux';
import DashboardLayoutBase, { NavItem } from '@/components/layouts/DashboardLayoutBase';
import { RootState } from '@/store';
import { LayoutDashboard, User, Trophy, Zap, Users, Building2, Grid3X3 } from 'lucide-react';

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/state/dashboard/home',
    icon: LayoutDashboard,
    description: 'Vista general',
  },
  {
    title: 'Mi Cuenta',
    url: '/state/dashboard/account',
    icon: User,
    description: 'Gestionar mi cuenta',
  },
  {
    title: 'Validación de Torneos',
    url: '/state/dashboard/validation',
    icon: Trophy,
    description: 'Aprobar torneos de clubes',
  },
  {
    title: 'Mis Torneos',
    url: '/state/dashboard/tournaments',
    icon: Zap,
    description: 'Gestionar torneos estatales',
  },
  {
    title: 'Validación de Eventos',
    url: '/state/dashboard/events',
    icon: Users,
    description: 'Aprobar eventos locales',
  },
  {
    title: 'Jugadores',
    url: '/state/dashboard/players',
    icon: Users,
    description: 'Administrar jugadores estatales',
  },
  {
    title: 'Clubes',
    url: '/state/dashboard/clubs',
    icon: Building2,
    description: 'Administrar clubes del estado',
  },
  {
    title: 'Canchas',
    url: '/state/dashboard/courts',
    icon: Grid3X3,
    description: 'Administrar canchas del estado',
  },
];

const stateUser = {
  name: 'Delegación Estatal',
  email: 'estado@federacion.com',
  role: 'State',
  avatar: null,
};

export default function StateDashboardLayout() {
  const { user } = useSelector((state: RootState) => state.auth);

  const userData = user
    ? {
        name: user.full_name || user.username || 'Delegación Estatal',
        email: user.email || '',
        role: 'Delegación Estatal',
        avatar: user.profile_photo || null,
      }
    : stateUser;

  return (
    <DashboardLayoutBase
      navItems={navItems}
      brandTitle="FEDMEX"
      brandSubtitle="Panel Estatal"
      BrandIcon={User}
      user={userData}
      basePath="/state/dashboard"
    />
  );
}
