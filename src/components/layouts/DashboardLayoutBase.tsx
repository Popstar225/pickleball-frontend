import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
  Menu,
  ChevronLeft,
  Bell,
  Search,
  ChevronDown,
  HelpCircle,
  LogOut,
  User,
  Settings,
} from 'lucide-react';

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  description?: string;
  badge?: number;
};

type UserData = {
  name: string;
  email?: string;
  role?: string;
  avatar?: string | null;
};

type Props = {
  navItems: NavItem[];
  brandTitle: string;
  brandSubtitle?: string;
  BrandIcon: LucideIcon;
  user: UserData;
  basePath: string; // used for breadcrumb root link
};

export default function DashboardLayoutBase({
  navItems,
  brandTitle,
  brandSubtitle,
  BrandIcon,
  user,
  basePath,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    path === basePath ? location.pathname === basePath : location.pathname.startsWith(path);

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {navItems.map((item) => (
        <Link
          key={item.url}
          to={item.url}
          onClick={() => setMobileOpen(false)}
          className={cn(
            'relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
            isActive(item.url)
              ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white',
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {item.badge}
                </span>
              )}
            </>
          )}
          {collapsed && item.badge && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300 lg:relative',
          collapsed ? 'w-[72px]' : 'w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-slate-800 bg-slate-900 px-4',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <BrandIcon className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <span className="block text-base font-bold text-white">{brandTitle}</span>
                {brandSubtitle && (
                  <span className="block text-xs text-slate-400">{brandSubtitle}</span>
                )}
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <BrandIcon className="h-5 w-5 text-slate-900" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCollapsed(!collapsed);
              setMobileOpen(false);
            }}
            className="hidden lg:flex hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <SidebarContent />
          {!collapsed && <div className="mx-3 my-4 border-t border-slate-800" />}
          <div className="px-3 space-y-1">
            <Link
              to={`${basePath}/settings`}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Configuración</span>}
            </Link>
            <Link
              to={`${basePath}/help`}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <HelpCircle className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Ayuda</span>}
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-800 bg-slate-900 p-3">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border-2 border-primary/20 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-slate-900">
                    {getUserInitials()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.role}</p>
                </div>
              </div>
              <Link
                to="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>Cerrar Sesión</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border-2 border-primary/20 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-slate-900">
                    {getUserInitials()}
                  </div>
                )}
              </div>
              <Link
                to="/"
                className="flex items-center justify-center rounded-lg p-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-slate-800 text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {navItems.find((item) => isActive(item.url))?.title || 'Dashboard'}
              </h1>
              <p className="text-sm text-slate-400 hidden sm:block">
                {navItems.find((item) => isActive(item.url))?.description || 'Vista general'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              {!searchOpen ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-slate-800 text-slate-400 hover:text-white"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      className="h-9 w-64 rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 text-sm text-white placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                      onBlur={() => setSearchOpen(false)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                className="hidden md:flex items-center gap-2 hover:bg-slate-800 text-slate-300 hover:text-white"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border-2 border-slate-700 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-slate-900">
                    {getUserInitials()}
                  </div>
                )}
                <span className="text-sm font-medium hidden lg:block">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-slate-400 transition-transform',
                    userMenuOpen && 'rotate-180',
                  )}
                />
              </Button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-slate-700 bg-slate-800 shadow-2xl">
                    <div className="border-b border-slate-700 p-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-12 w-12 rounded-full border-2 border-slate-700 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-bold text-slate-900">
                            {getUserInitials()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        to={`${basePath}/profile`}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>
                      <Link
                        to={`${basePath}/settings`}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Configuración</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-700 p-2">
                      <Link
                        to="/"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-6">
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
            <Link to={basePath} className="hover:text-white transition-colors">
              Dashboard
            </Link>
            {location.pathname !== basePath && (
              <>
                <span>/</span>
                <span className="font-medium text-white">
                  {navItems.find((item) => isActive(item.url))?.title}
                </span>
              </>
            )}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
