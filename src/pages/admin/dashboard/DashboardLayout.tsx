import DashboardLayoutBase, { NavItem } from '@/components/layouts/DashboardLayoutBase';
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  MessageSquare,
  Shield,
  Trophy,
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
  {
    title: 'Canchas',
    url: '/admin/dashboard/courts',
    icon: Trophy,
    description: 'Gestionar canchas',
  },
  {
    title: 'Estados',
    url: '/admin/dashboard/states',
    icon: MapPin,
    description: 'Gestionar estados',
  },
  {
    title: 'Mensajes',
    url: '/admin/dashboard/messages',
    icon: MessageSquare,
    description: 'Ver mensajes',
    badge: 3,
  },
];

const adminUser = {
  name: 'Admin Usuario',
  email: 'admin@fedmex.com',
  role: 'Super Admin',
  avatar: null,
};

export default function DashboardLayout() {
  return (
    <DashboardLayoutBase
      navItems={navItems}
      brandTitle="FEDMEX Admin"
      brandSubtitle="Panel de Control"
      BrandIcon={Shield}
      user={adminUser}
      basePath="/admin/dashboard"
    />
  );
}
