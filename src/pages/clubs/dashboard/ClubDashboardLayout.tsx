import DashboardLayoutBase, { NavItem } from '@/components/layouts/DashboardLayoutBase';
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

const clubUser = {
  name: 'Club Pickleball CDMX',
  email: 'info@clubpickelballcdmx.com',
  role: 'Club',
  avatar: null,
};

export default function ClubDashboardLayout() {
  return (
    <DashboardLayoutBase
      navItems={navItems}
      brandTitle="FEDMEX"
      brandSubtitle="Panel de Club"
      BrandIcon={Trophy}
      user={clubUser}
      basePath="/clubs/dashboard"
    />
  );
}
