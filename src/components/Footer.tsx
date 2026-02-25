import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logoImage from '@/assets/images/Logos/Logo pickleball compressed.png';

const footerLinks = {
  'Acerca de FEDMEX': [
    { label: 'Sobre nosotros', href: '/about/who-we-are' },
    { label: 'Misión y visión', href: '/about/who-we-are' },
    { label: 'Liderazgo', href: '/about/board-of-directors' },
    { label: 'Clubes miembros', href: '/associations' },
    { label: 'Beneficios', href: '/about/benefits' },
  ],
  Recursos: [
    { label: 'Reglas y reglamentos', href: '/rules' },
    { label: 'Programa de árbitros', href: '/training/referees' },
    { label: 'Estándares de equipamiento', href: '/rules' },
    { label: 'Descargas', href: '/rules' },
  ],
  Eventos: [
    { label: 'Calendario de torneos', href: '/federation/tournaments' },
    { label: 'Encontrar canchas', href: '/federation/courts' },
    { label: 'Eventos regionales', href: '/federation/tournaments' },
    { label: 'Programas juveniles', href: '/players/categories' },
  ],
  Jugadores: [
    { label: 'Ranking', href: '/players/ranking' },
    { label: 'Destacados de jugadores', href: '/players/showcase' },
    { label: 'Categorías', href: '/players/categories' },
    { label: 'Buscar jugadores', href: '/players/search' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

const Footer = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center lg:text-left">
              <h3 className="font-display text-xl sm:text-2xl text-white mb-1 sm:mb-2">
                Mantente Actualizado con FEDMEX
              </h3>
              <p className="text-white/60 text-sm sm:text-base">
                Obtén las últimas noticias, actualizaciones de torneos y ofertas exclusivas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Input
                type="email"
                placeholder="Ingresa tu correo electrónico"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 w-full sm:min-w-[280px] h-11"
              />
              <Button className="bg-primary text-primary-foreground hover:bg-lime-dark whitespace-nowrap h-11 w-full sm:w-auto">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Mobile: Accordion style | Desktop: Grid */}
        <div className="lg:hidden">
          {/* Logo & Contact - Always visible on mobile */}
          <div className="mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoImage}
                alt="FEDMEX Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 object-contain"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-white/70">
              <a
                href="#"
                className="flex items-center gap-2 hover:text-primary transition-colors py-1.5"
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Ciudad de México, México</span>
              </a>
              <a
                href="tel:+525512345678"
                className="flex items-center gap-2 hover:text-primary transition-colors py-1.5"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+52 55 1234 5678</span>
              </a>
              <a
                href="mailto:info@fedmexpickleball.mx"
                className="flex items-center gap-2 hover:text-primary transition-colors py-1.5"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">info@fedmexpickleball.mx</span>
              </a>
            </div>
          </div>

          {/* Accordion Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="border-b border-white/10">
              <button
                onClick={() => toggleSection(title)}
                className="flex items-center justify-between w-full py-4 text-left"
              >
                <h4 className="font-semibold text-white text-sm sm:text-base">{title}</h4>
                <ChevronDown
                  className={`w-4 h-4 text-white/60 transition-transform ${
                    expandedSection === title ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === title && (
                <ul className="pb-4 space-y-1">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-1 group py-2"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-5 gap-8">
          {/* Logo & Contact */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img
                src={logoImage}
                alt="FEDMEX Logo"
                className="w-12 h-12 flex-shrink-0 object-contain"
              />
              <div>
                <span className="font-display text-xl text-white">FEDMEX</span>
                <p className="text-xs text-white/60">Federación de Pickleball</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-white/70">
              <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                Ciudad de México, México
              </a>
              <a
                href="tel:+525512345678"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                +52 55 1234 5678
              </a>
              <a
                href="mailto:info@fedmexpickleball.mx"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                info@fedmexpickleball.mx
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-1 group"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            {/* Copyright & Legal Links */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-white/40 text-center sm:text-left">
              <span>© 2026 FEDMEX Pickleball. Todos los Derechos Reservados.</span>
              <div className="flex items-center gap-3 sm:gap-4">
                <a href="#" className="hover:text-white transition-colors">
                  Privacidad
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Términos
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Cookies
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 sm:gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors group"
                    aria-label={social.label}
                  >
                    <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:text-primary-foreground" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
