import DashboardLayoutBase, { NavItem } from '@/components/layouts/DashboardLayoutBase';
import {
  LayoutDashboard,
  User,
  CreditCard,
  Building2,
  Users,
  Trophy,
  MessageSquare,
  Receipt,
} from 'lucide-react';

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/players/dashboard',
    icon: LayoutDashboard,
    description: 'Vista general',
  },
  {
    title: 'Mi Cuenta',
    url: '/players/dashboard/account',
    icon: User,
    description: 'Gestionar mi cuenta',
  },
  {
    title: 'Credenciales Digitales',
    url: '/players/dashboard/credentials',
    icon: CreditCard,
    description: 'Mis credenciales digitales',
  },
  {
    title: 'Buscar Clubes',
    url: '/players/dashboard/clubs',
    icon: Building2,
    description: 'Encontrar y unirme a clubes',
  },
  {
    title: 'Buscar Jugadores',
    url: '/players/dashboard/players',
    icon: Users,
    description: 'Encontrar otros jugadores',
  },
  {
    title: 'Torneos',
    url: '/players/dashboard/tournaments',
    icon: Trophy,
    description: 'Ver y registrarme en torneos',
  },
  {
    title: 'Mensajes',
    url: '/players/dashboard/messages',
    icon: MessageSquare,
    description: 'Mis mensajes',
  },
  {
    title: 'Pagos',
    url: '/players/dashboard/payments',
    icon: Receipt,
    description: 'Historial de pagos',
  },
];

const playerUser = {
  name: 'Juan Pérez',
  email: 'juan.perez@email.com',
  role: 'Jugador',
  avatar: null,
};

export default function PlayerDashboardLayout() {
  return (
    <DashboardLayoutBase
      navItems={navItems}
      brandTitle="FEDMEX"
      brandSubtitle="Panel de Jugador"
      BrandIcon={Trophy}
      user={playerUser}
      basePath="/players/dashboard"
    />
  );
}
