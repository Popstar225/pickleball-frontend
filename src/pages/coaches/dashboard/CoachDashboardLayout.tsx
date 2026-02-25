import DashboardLayoutBase, { NavItem } from '@/components/layouts/DashboardLayoutBase';
import { LayoutDashboard, User, Shield, MessageSquare, Receipt } from 'lucide-react';

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/coaches/dashboard',
    icon: LayoutDashboard,
    description: 'Vista general',
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
  return (
    <DashboardLayoutBase
      navItems={navItems}
      brandTitle="FEDMEX"
      brandSubtitle="Panel de Coach"
      BrandIcon={User}
      user={coachUser}
      basePath="/coaches/dashboard"
    />
  );
}
