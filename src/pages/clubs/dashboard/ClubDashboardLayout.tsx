import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import DashboardLayoutBase, { NavItem } from '@/components/layouts/DashboardLayoutBase';
import type { RootState } from '@/store';
import { LayoutDashboard, User, Users, Trophy, MessageSquare, Receipt, CalendarDays, Clock } from 'lucide-react';
import { getFullImageUrl } from '@/common/tools';

export default function ClubDashboardLayout() {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);

  const navItems: NavItem[] = [
    {
      title: t('club_dashboard.nav.dashboard'),
      url: '/clubs/dashboard',
      icon: LayoutDashboard,
      description: t('club_dashboard.nav.dashboard_desc'),
    },
    {
      title: t('club_dashboard.nav.account'),
      url: '/clubs/dashboard/account',
      icon: User,
      description: t('club_dashboard.nav.account_desc'),
    },
    {
      title: t('club_dashboard.nav.members'),
      url: '/clubs/dashboard/members',
      icon: Users,
      description: t('club_dashboard.nav.members_desc'),
    },
    {
      title: t('club_dashboard.nav.venues'),
      url: '/clubs/dashboard/venues',
      icon: Trophy,
      description: t('club_dashboard.nav.venues_desc'),
    },
    // {
    //   title: t('club_dashboard.nav.court_schedule'),
    //   url: '/clubs/dashboard/court-schedule',
    //   icon: Clock,  // import Clock from 'lucide-react'
    //   description: t('club_dashboard.nav.court_schedule_desc'),
    // },
    {
      title: t('club_dashboard.nav.tournaments'),
      url: '/clubs/dashboard/tournaments',
      icon: Trophy,
      description: t('club_dashboard.nav.tournaments_desc'),
    },
    {
      title: t('club_dashboard.nav.schedule'),
      url: '/clubs/dashboard/schedule',
      icon: CalendarDays,
      description: t('club_dashboard.nav.schedule_desc'),
    },
    {
      title: t('club_dashboard.nav.messages'),
      url: '/clubs/dashboard/messages',
      icon: MessageSquare,
      description: t('club_dashboard.nav.messages_desc'),
    },
    {
      title: t('club_dashboard.nav.payments'),
      url: '/clubs/dashboard/payments',
      icon: Receipt,
      description: t('club_dashboard.nav.payments_desc'),
    },
  ];

  const displayUser = user
    ? {
        name: user.club_name || user.name || user.email || 'Club',
        email: user.email || '',
        role: t('club_dashboard.nav.role'),
        avatar: getFullImageUrl(user.profile_picture) || null,
      }
    : {
        name: 'Club Pickleball',
        email: 'club@fedmex.com',
        role: t('club_dashboard.nav.role'),
        avatar: null,
      };

  return (
    <DashboardLayoutBase
      navItems={navItems}
      brandTitle="FEDMEX"
      brandSubtitle={t('club_dashboard.nav.brand_subtitle')}
      BrandIcon={Trophy}
      user={displayUser}
      basePath="/clubs/dashboard"
    />
  );
}
