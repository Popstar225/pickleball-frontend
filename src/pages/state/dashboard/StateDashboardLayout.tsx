import DashboardLayoutBase, { NavItem } from '@/components/layouts/DashboardLayoutBase';
import { LayoutDashboard, User } from 'lucide-react';

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/state/dashboard',
    icon: LayoutDashboard,
    description: 'Vista general',
  },
  {
    title: 'Mi Cuenta',
    url: '/state/dashboard/account',
    icon: User,
    description: 'Gestionar mi cuenta',
  },
];

const stateUser = {
  name: 'Delegación Estatal',
  email: 'estado@federacion.com',
  role: 'State',
  avatar: null,
};

export default function StateDashboardLayout() {
  return (
    <DashboardLayoutBase
      navItems={navItems}
      brandTitle="FEDMEX"
      brandSubtitle="Panel Estatal"
      BrandIcon={User}
      user={stateUser}
      basePath="/state/dashboard"
    />
  );
}
