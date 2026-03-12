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
  CheckSquare,
  CalendarDays,
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
    title: 'Validación de Torneos',
    url: '/admin/dashboard/validation',
    icon: Trophy,
    description: 'Aprobar torneos estatales',
  },
  {
    title: 'Gestión de Torneos',
    url: '/admin/dashboard/tournaments',
    icon: Trophy,
    description: 'Gestionar torneos nacionales',
  },
  // {
  //   title: 'Panel de Torneo',
  //   url: '/admin/dashboard/tournaments-view',
  //   icon: Zap,
  //   description: 'Monitorear torneos activos',
  // },
  // {
  //   title: 'Eventos de Torneo',
  //   url: '/admin/dashboard/events',
  //   icon: Zap,
  //   description: 'Aprobar eventos estatales',
  // },
  // {
  //   title: 'Correcciones de Marcador',
  //   url: '/admin/dashboard/corrections',
  //   icon: CheckSquare,
  //   description: 'Aprobar o rechazar correcciones de marcador',
  // },
  {
    title: 'Horarios',
    url: '/admin/dashboard/schedule',
    icon: CalendarDays,
    description: 'Programar horarios de partidos',
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
