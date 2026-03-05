import { useSelector } from 'react-redux';
import DashboardLayoutBase, { NavItem } from '@/components/layouts/DashboardLayoutBase';
import type { RootState } from '@/store';
import { LayoutDashboard, User, Users, Trophy, MessageSquare, Receipt } from 'lucide-react';

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/clubs/dashboard',
    icon: LayoutDashboard,
    description: 'Vista general',
  },
  {
    title: 'Mi Cuenta',
    url: '/clubs/dashboard/account',
    icon: User,
    description: 'Gestionar mi cuenta',
  },
  {
    title: 'Miembros',
    url: '/clubs/dashboard/members',
    icon: Users,
    description: 'Gestionar miembros del club',
  },
  {
    title: 'Instalaciones',
    url: '/clubs/dashboard/venues',
    icon: Trophy,
    description: 'Gestionar canchas e instalaciones',
  },
  {
    title: 'Torneos',
    url: '/clubs/dashboard/tournaments',
    icon: Trophy,
    description: 'Torneos del club',
  },
  // {
  //   title: 'Ver Torneos',
  //   url: '/clubs/dashboard/tournaments/view/active',
  //   icon: Trophy,
  //   description: 'Panel de Torneos Activos',
  // },
  {
    title: 'Mensajes',
    url: '/clubs/dashboard/messages',
    icon: MessageSquare,
    description: 'Mensajes del club',
  },
  {
    title: 'Pagos',
    url: '/clubs/dashboard/payments',
    icon: Receipt,
    description: 'Historial de pagos',
  },
];

export default function ClubDashboardLayout() {
  const user = useSelector((state: RootState) => state.auth.user);

  const displayUser = user
    ? {
        name: user.club_name || user.name || user.email || 'Club',
        email: user.email || '',
        role: 'Club Manager',
        avatar: user.profile_picture || null,
      }
    : {
        name: 'Club Pickleball',
        email: 'club@fedmex.com',
        role: 'Club',
        avatar: null,
      };

  return (
    <DashboardLayoutBase
      navItems={navItems}
      brandTitle="FEDMEX"
      brandSubtitle="Panel de Club"
      BrandIcon={Trophy}
      user={displayUser}
      basePath="/clubs/dashboard"
    />
  );
}
