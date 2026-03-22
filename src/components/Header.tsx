import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { navigationMenu } from '@/data/mockData';
import { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import logoFedmex from '@/assets/logo-fedmex.png';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setUserDropdownOpen(false);
    navigate('/');
  };

  const getRoleBasedLinks = () => {
    const links: { label: string; href: string; icon: any }[] = [];

    switch (user?.user_type) {
      case 'player':
        links.push(
          { label: t('header.my_account'), href: '/players/dashboard/account', icon: User },
          { label: t('header.my_dashboard'), href: '/players/dashboard', icon: User },
        );
        break;
      case 'coach':
        links.push(
          { label: t('header.my_account'), href: '/coaches/dashboard/account', icon: User },
          { label: t('header.my_dashboard'), href: '/coaches/dashboard', icon: User },
        );
        break;
      case 'club':
        links.push(
          { label: t('header.my_account'), href: '/clubs/dashboard/account', icon: User },
          { label: t('header.my_dashboard'), href: '/clubs/dashboard', icon: User },
        );
        break;
      case 'partner':
        links.push(
          { label: t('header.my_account'), href: '/partners/dashboard/account', icon: User },
          { label: t('header.my_dashboard'), href: '/partners/dashboard', icon: User },
        );
        break;
      case 'state':
        links.push(
          { label: t('header.my_account'), href: '/state/dashboard/account', icon: User },
          { label: t('header.my_dashboard'), href: '/state/dashboard/home', icon: User },
        );
        break;
      case 'admin':
        links.push(
          { label: t('header.my_dashboard'), href: '/admin/dashboard', icon: User },
        );
        break;
      default:
        break;
    }

    return links;
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-8 sm:h-10 text-[10px] sm:text-xs">
            <div className="hidden md:flex items-center gap-3 lg:gap-6">
              <span className="text-white/60">FEDMEX Pickleball A.C.</span>
              <span className="text-white/60 hidden lg:inline">{t('header.topbar_gira')}</span>
              <span className="text-white/60 hidden xl:inline">{t('header.topbar_nacional')}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="bg-secondary/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <img
                src={logoFedmex}
                alt="FEDMEX Pickleball"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-0.5" ref={dropdownRef}>
              {navigationMenu.map((item) => (
                <div key={item.label} className="relative">
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={() =>
                          setActiveDropdown(activeDropdown === item.label ? null : item.label)
                        }
                        className="nav-link-light flex items-center gap-1 px-2 xl:px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-sm"
                      >
                        <span className="whitespace-nowrap">{item.label}</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform flex-shrink-0 ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {activeDropdown === item.label && item.items && (
                        <div className="absolute top-full left-0 mt-2 bg-[#0d1117] border border-white/[0.08] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] py-1.5 min-w-[200px] z-50">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.label}
                              to={subItem.href}
                              className="block px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.href || '/'}
                      className="nav-link-light flex items-center gap-1 px-2 xl:px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-sm"
                    >
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Buttons - Tablet and up */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-primary text-primary text-xs lg:text-sm px-4 lg:px-6 py-2 lg:py-2.5 font-semibold rounded-lg transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/50"
                    onClick={() => navigate('/login')}
                  >
                    {t('header.login')}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary via-lime-400 to-lime-500 text-slate-900 text-xs lg:text-sm px-4 lg:px-6 py-2 lg:py-2.5 font-semibold rounded-lg shadow-lg shadow-primary/50 ring-2 ring-lime-500/20 hover:ring-lime-500/40 hover:shadow-2xl hover:shadow-lime-500/50 transition-all duration-300 hover:scale-110"
                    onClick={() => navigate('/register')}
                  >
                    {t('header.register')}
                  </Button>
                </>
              ) : (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-lime-500">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white truncate max-w-[100px]">
                      {user?.username || 'Usuario'}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-[#0d1117] border border-white/[0.08] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] py-1.5 min-w-[200px] z-50">
                      <div className="px-4 py-2.5 border-b border-white/[0.07]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">{t('header.account_type')}</p>
                        <p className="text-sm font-semibold text-white capitalize mt-0.5">
                          {user?.user_type}
                        </p>
                      </div>
                      {getRoleBasedLinks().map((link) => (
                        <Link
                          key={link.label}
                          to={link.href}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <link.icon className="w-4 h-4 text-white/40" />
                          <span>{link.label}</span>
                        </Link>
                      ))}
                      <div className="border-t border-white/[0.07] my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/[0.08] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('header.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="xl:hidden p-2 text-white -mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? t('header.close_menu') : t('header.open_menu')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 top-[calc(3.5rem+2rem)] sm:top-[calc(4rem+2.5rem)] bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed left-0 right-0 top-[calc(3.5rem+2rem)] sm:top-[calc(4rem+2.5rem)] bg-secondary border-b border-white/10 max-h-[calc(100vh-5.5rem)] sm:max-h-[calc(100vh-6.5rem)] overflow-y-auto z-50">
          <div className="container mx-auto px-3 sm:px-4 py-4">
            <nav className="flex flex-col gap-1">
              {navigationMenu.map((item) => (
                <div key={item.label}>
                  {item.hasDropdown ? (
                    <div>
                      <button
                        onClick={() =>
                          setActiveDropdown(activeDropdown === item.label ? null : item.label)
                        }
                        className="nav-link-light flex items-center justify-between w-full px-3 py-3 rounded-md hover:bg-white/10 transition-colors text-left"
                      >
                        <span className="text-sm sm:text-base">{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {activeDropdown === item.label && item.items && (
                        <div className="pl-4 mt-1 space-y-0.5 border-l-2 border-primary/30 ml-3">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.label}
                              to={subItem.href}
                              className="block px-3 py-2.5 text-sm text-white/70 hover:text-primary transition-colors"
                              onClick={() => {
                                setActiveDropdown(null);
                                setMobileMenuOpen(false);
                              }}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href || '/'}
                      className="nav-link-light flex items-center justify-between px-3 py-3 rounded-md hover:bg-white/10 transition-colors text-left"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-sm sm:text-base">{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 pt-4 border-t border-white/10">
                {!isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground h-11"
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                    >
                      {t('header.login')}
                    </Button>
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-lime-dark h-11"
                      onClick={() => {
                        navigate('/register');
                        setMobileMenuOpen(false);
                      }}
                    >
                      {t('header.register')}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-3 rounded-md bg-white/5 flex-1">
                      <p className="text-xs text-slate-200 mb-1">{t('header.logged_in_as')}</p>
                      <p className="text-sm font-medium text-white">
                        {user?.username || 'Usuario'}
                      </p>
                      <p className="text-xs text-slate-200 capitalize mt-1">{user?.user_type}</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {getRoleBasedLinks().map((link) => (
                        <Link
                          key={link.label}
                          to={link.href}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <link.icon className="w-4 h-4" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10 h-11"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('header.logout')}
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
