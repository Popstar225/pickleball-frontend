import { useSelector } from 'react-redux';
import DashboardLayoutBase, { NavItem } from '@/components/layouts/DashboardLayoutBase';
import type { RootState } from '@/store';
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  MessageSquare,
  Shield,
  Trophy,
  Zap,
} from 'lucide-react';

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Vista general',
  },
  {
    title: 'Jugadores',
    url: '/admin/dashboard/players',
    icon: Users,
    description: 'Gestionar jugadores',
  },
  {
    title: 'Clubes',
    url: '/admin/dashboard/clubs',
    icon: Building2,
    description: 'Gestionar clubes',
  },
  // {
  //   title: 'Canchas',
  //   url: '/admin/dashboard/courts',
  //   icon: Trophy,
  //   description: 'Gestionar canchas',
  // },
  {
    title: 'Estados',
    url: '/admin/dashboard/states',
    icon: MapPin,
    description: 'Gestionar estados',
  },
  {
    title: 'Tournaments',
    url: '/admin/dashboard/tournaments',
    icon: Trophy,
    description: 'Manage national tournaments',
  },
  {
    title: 'Tournament Dashboard',
    url: '/admin/dashboard/tournaments-view',
    icon: Zap,
    description: 'Monitor all tournaments',
  },
  {
    title: 'Tournament Events',
    url: '/admin/dashboard/events',
    icon: Zap,
    description: 'Approve state events',
  },
  {
    title: 'Mensajes',
    url: '/admin/dashboard/messages',
    icon: MessageSquare,
    description: 'Ver mensajes',
    badge: 3,
  },
];

export default function DashboardLayout() {
  const user = useSelector((state: RootState) => state.auth.user);

  const displayUser = user
    ? {
        name: user.name || user.email || 'Admin',
        email: user.email || '',
        role: user.user_type === 'admin' ? 'System Administrator' : 'Administrator',
        avatar: user.profile_picture || null,
      }
    : {
        name: 'Admin Usuario',
        email: 'admin@fedmex.com',
        role: 'Administrator',
        avatar: null,
      };

  return (
    <DashboardLayoutBase
      navItems={navItems}
      brandTitle="FEDMEX Admin"
      brandSubtitle="Panel de Control"
      BrandIcon={Shield}
      user={displayUser}
      basePath="/admin/dashboard"
    />
  );
}
