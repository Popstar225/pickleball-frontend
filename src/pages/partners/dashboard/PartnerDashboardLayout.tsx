import DashboardLayoutBase, { NavItem } from '@/components/layouts/DashboardLayoutBase';
import { LayoutDashboard, User, MessageSquare, Receipt } from 'lucide-react';

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/partners/dashboard',
    icon: LayoutDashboard,
    description: 'Vista general',
  },
  {
    title: 'Mi Cuenta',
    url: '/partners/dashboard/account',
    icon: User,
    description: 'Gestionar mi cuenta',
  },
  {
    title: 'Mensajes',
    url: '/partners/dashboard/messages',
    icon: MessageSquare,
    description: 'Mensajes y comunicaciones',
  },
  {
    title: 'Pagos',
    url: '/partners/dashboard/payments',
    icon: Receipt,
    description: 'Historial de pagos',
  },
];

const partnerUser = {
  name: 'Partner Company S.A.',
  email: 'contact@partnercompany.com',
  role: 'Partner',
  avatar: null,
};

export default function PartnerDashboardLayout() {
  return (
    <DashboardLayoutBase
      navItems={navItems}
      brandTitle="FEDMEX"
      brandSubtitle="Panel de Partner"
      BrandIcon={User}
      user={partnerUser}
      basePath="/partners/dashboard"
    />
  );
}
