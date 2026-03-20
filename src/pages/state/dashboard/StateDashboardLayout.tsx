import { useSelector } from 'react-redux';
import DashboardLayoutBase, { NavItem } from '@/components/layouts/DashboardLayoutBase';
import { RootState } from '@/store';
import { LayoutDashboard, User, Trophy, Zap, Users, Building2, Grid3X3, MessageSquare, BarChart2, CheckSquare, CalendarDays, Receipt } from 'lucide-react';
import { getFullImageUrl } from '@/common/tools';

const navItems: NavItem[] = [
  {
    title: 'Panel de estatal',
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
  // {
  //   title: 'Validación de Eventos',
  //   url: '/state/dashboard/events',
  //   icon: Users,
  //   description: 'Aprobar eventos locales',
  // },
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
  // {
  //   title: 'Canchas',
  //   url: '/state/dashboard/courts',
  //   icon: Grid3X3,
  //   description: 'Administrar canchas del estado',
  // },
  // {
  //   title: 'Correcciones de Marcador',
  //   url: '/state/dashboard/corrections',
  //   icon: CheckSquare,
  //   description: 'Aprobar o rechazar correcciones de marcador',
  // },
  {
    title: 'Mensajes',
    url: '/state/dashboard/messages',
    icon: MessageSquare,
    description: 'Mensajes y comunicaciones',
  },
  {
    title: 'Estadísticas',
    url: '/state/dashboard/stats',
    icon: BarChart2,
    description: 'Estadísticas del estado',
  },
  {
    title: 'Pagos',
    url: '/state/dashboard/payments',
    icon: Receipt,
    description: 'Membresía y pagos',
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
        avatar: getFullImageUrl(user.profile_photo) || null,
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
