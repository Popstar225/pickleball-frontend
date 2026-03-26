import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Users,
  GraduationCap,
  Building2,
  Handshake,
  Flag,
  Shield,
  Star,
  Zap,
  ChevronDown,
  ChevronUp,
  Trophy,
  MapPin,
  Calendar,
  CreditCard,
  BarChart3,
  Lock,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanFeature {
  label: string;
  included: boolean;
  note?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  period: string;
  description: string;
  features: PlanFeature[];
  additionalFeatures?: { label: string; price: string }[];
  badge?: string;
  badgeColor?: string;
  highlighted?: boolean;
  ctaLabel: string;
  ctaHref: string;
  icon: React.ReactNode;
  accentColor: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const pricingPlans: PricingPlan[] = [
  // Players
  {
    id: 'player',
    name: 'Jugador',
    price: '$500',
    priceNote: 'MXN',
    period: '/año',
    description: 'Afiliación anual para jugadores que desean participar oficialmente en la federación.',
    icon: <Users className="w-7 h-7" />,
    accentColor: 'from-blue-500 to-cyan-500',
    features: [
      { label: 'Perfil de jugador activo', included: true },
      { label: 'Participación en torneos oficiales', included: true },
      { label: 'Seguimiento de estadísticas', included: true },
      { label: 'Credencial digital', included: true },
    ],
    additionalFeatures: [
      { label: 'Búsqueda de Jugadores Cercanos', price: '$200 MXN (único)' },
      { label: 'Inscripción a Torneos', price: 'Variable por torneo' },
      { label: 'Reserva de Canchas', price: 'Variable por cancha' },
    ],
    ctaLabel: 'Registrarse como Jugador',
    ctaHref: '/register',
  },
  // Coaches
  {
    id: 'coach',
    name: 'Entrenador',
    price: '$800',
    priceNote: 'MXN',
    period: '/año',
    description: 'Afiliación anual para entrenadores certificados y activos dentro de la federación.',
    icon: <GraduationCap className="w-7 h-7" />,
    accentColor: 'from-violet-500 to-purple-600',
    features: [
      { label: 'Perfil de entrenador activo', included: true },
      { label: 'Herramientas de entrenamiento', included: true },
      { label: 'Credencial digital', included: true },
      { label: 'Licencias/Certificaciones', included: true, note: 'Disponibles por separado' },
    ],
    ctaLabel: 'Registrarse como Entrenador',
    ctaHref: '/register',
  },
  // Club Basic
  {
    id: 'club-basic',
    name: 'Club Básico',
    price: '$2,000',
    priceNote: 'MXN',
    period: '/año',
    description: 'Afiliación oficial para clubes que desean gestionar sus miembros dentro de la plataforma.',
    icon: <Building2 className="w-7 h-7" />,
    accentColor: 'from-emerald-500 to-green-600',
    features: [
      { label: 'Afiliación oficial', included: true },
      { label: 'Perfil de club activo', included: true },
      { label: 'Gestión de miembros', included: true },
      { label: 'Gestión de Canchas', included: false },
      { label: 'Creación de Torneos', included: false },
      { label: 'Ingresos por rentas', included: false },
      { label: 'Análisis avanzado', included: false },
    ],
    ctaLabel: 'Afiliar Club Básico',
    ctaHref: '/register',
  },
  // Club Premium
  {
    id: 'club-premium',
    name: 'Club Premium',
    price: '$5,000',
    priceNote: 'MXN',
    period: '/año',
    description: 'Plan completo para clubes que quieren aprovechar todas las funcionalidades de la plataforma.',
    icon: <Building2 className="w-7 h-7" />,
    accentColor: 'from-amber-500 to-orange-500',
    badge: 'POPULAR',
    badgeColor: 'bg-amber-500 text-black',
    highlighted: true,
    features: [
      { label: 'Afiliación oficial', included: true },
      { label: 'Perfil de club activo', included: true },
      { label: 'Gestión de miembros', included: true },
      { label: 'Gestión de Canchas', included: true },
      { label: 'Creación de Torneos', included: true },
      { label: 'Ingresos por rentas', included: true },
      { label: 'Análisis avanzado', included: true },
    ],
    ctaLabel: 'Afiliar Club Premium',
    ctaHref: '/register',
  },
  // Partners Free
  {
    id: 'partner-free',
    name: 'Socio Gratuito',
    price: 'Gratis',
    priceNote: '',
    period: '',
    description: 'Registro gratuito de afiliación para socios que desean visibilidad en la plataforma.',
    icon: <Handshake className="w-7 h-7" />,
    accentColor: 'from-teal-500 to-cyan-600',
    features: [
      { label: 'Registro y afiliación gratuita', included: true },
      { label: 'Perfil de socio', included: true },
      { label: 'Visibilidad básica en plataforma', included: true },
      { label: 'Gestión de Canchas', included: false },
      { label: 'Creación de Torneos', included: false },
      { label: 'Herramientas de patrocinio', included: false },
    ],
    ctaLabel: 'Registrarse Gratis',
    ctaHref: '/register',
  },
  // Partners Premium
  {
    id: 'partner-premium',
    name: 'Socio Premium',
    price: '$8,000',
    priceNote: 'MXN',
    period: '/año',
    description: 'Plan premium para socios que buscan máxima visibilidad y herramientas avanzadas de patrocinio.',
    icon: <Handshake className="w-7 h-7" />,
    accentColor: 'from-rose-500 to-pink-600',
    badge: 'RECOMENDADO',
    badgeColor: 'bg-rose-500 text-white',
    features: [
      { label: 'Registro y afiliación', included: true },
      { label: 'Perfil de socio destacado', included: true },
      { label: 'Visibilidad premium en plataforma', included: true },
      { label: 'Gestión de Canchas', included: true },
      { label: 'Creación de Torneos', included: true },
      { label: 'Herramientas de patrocinio', included: true },
    ],
    ctaLabel: 'Unirse como Socio Premium',
    ctaHref: '/register',
  },
  // States
  {
    id: 'state',
    name: 'Asociación Estatal',
    price: '$15,000',
    priceNote: 'MXN',
    period: '/año',
    description:
      'Afiliación completa para asociaciones estatales. Sin planes adicionales — la cuota cubre acceso total.',
    icon: <Flag className="w-7 h-7" />,
    accentColor: 'from-indigo-500 to-blue-600',
    badge: 'ACCESO TOTAL',
    badgeColor: 'bg-indigo-500 text-white',
    features: [
      { label: 'Gestión de torneos estatales', included: true },
      { label: 'Validación de resultados', included: true },
      { label: 'Gestión de clubes y jugadores', included: true },
      { label: 'Panel de administración estatal', included: true },
      { label: 'Estadísticas completas', included: true },
    ],
    ctaLabel: 'Afiliar Estado',
    ctaHref: '/register',
  },
  // Federation
  {
    id: 'federation',
    name: 'Federación',
    price: 'Gratis',
    priceNote: '',
    period: '',
    description: 'La Federación tiene acceso completo sin costo a todas las funcionalidades de la plataforma.',
    icon: <Shield className="w-7 h-7" />,
    accentColor: 'from-slate-400 to-slate-500',
    badge: 'SIN COSTO',
    badgeColor: 'bg-slate-500 text-white',
    features: [
      { label: 'Acceso completo a la plataforma', included: true },
      { label: 'Administración de todos los usuarios', included: true },
      { label: 'Gestión nacional de torneos', included: true },
      { label: 'Reportes y estadísticas globales', included: true },
      { label: 'Control total de configuración', included: true },
    ],
    ctaLabel: 'Contactar Federación',
    ctaHref: '/contact',
  },
];

const faqItems: FaqItem[] = [
  {
    question: '¿Cuándo se renueva la Afiliación anual?',
    answer:
      'La Afiliación se renueva automáticamente cada año desde la fecha de tu registro. Recibirás un aviso por correo electrónico 30 días antes del vencimiento para que puedas renovar con tiempo.',
  },
  {
    question: '¿Los cargos por inscripción a torneos están incluidos en la Afiliación?',
    answer:
      'No. La Afiliación anual te da acceso a la plataforma y al perfil oficial, pero la inscripción a cada torneo tiene un costo variable que depende del organizador del evento.',
  },
  {
    question: '¿Puedo cambiar mi plan de Club Básico a Club Premium en cualquier momento?',
    answer:
      'Sí. Puedes actualizar tu plan en cualquier momento desde el panel de tu club. El costo proporcional se calculará según el tiempo restante de tu Afiliación actual.',
  },
  {
    question: '¿Qué pasa si un club quiere reservar canchas pero tiene plan básico?',
    answer:
      'La gestión y renta de canchas está disponible únicamente en el Plan Premium de Clubes o Socios Premium. Si tienes el plan básico, deberás actualizarlo para acceder a esta funcionalidad.',
  },
  {
    question: '¿Los socios (Partners) necesitan pagar para registrarse?',
    answer:
      'No, el registro de socios es completamente gratuito. La afiliación básica no tiene costo anual. Si deseas acceder a herramientas avanzadas de gestión y patrocinio, existe el Plan Premium a $8,000 MXN/año.',
  },
  {
    question: '¿Las asociaciones estatales necesitan un plan premium?',
    answer:
      'No. Las asociaciones estatales pagan una cuota anual única de $15,000 MXN que incluye acceso completo al panel estatal, gestión de torneos, validación de resultados y todas las herramientas disponibles. No existe un nivel premium adicional.',
  },
  {
    question: '¿Cómo se realizan los pagos?',
    answer:
      'Los pagos pueden realizarse mediante transferencia bancaria, tarjeta de crédito/débito o en efectivo en las oficinas de la federación. Al completar el pago recibirás tu credencial digital de manera inmediata.',
  },
  {
    question: '¿La Federación cobra por su acceso a la plataforma?',
    answer:
      'No. La Federación Mexicana de Pickleball tiene acceso completo a todas las funcionalidades de la plataforma sin ningún costo, ya que es la entidad administradora del sistema.',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const FeatureRow: React.FC<{ feature: PlanFeature }> = ({ feature }) => (
  <li className="flex items-start gap-3 py-1.5">
    <span
      className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
        feature.included
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-slate-700/50 text-slate-300'
      }`}
    >
      {feature.included ? (
        <Check className="w-3 h-3" />
      ) : (
        <span className="w-2 h-0.5 bg-slate-600 rounded-full block" />
      )}
    </span>
    <span className={`text-sm leading-relaxed ${feature.included ? 'text-slate-300' : 'text-slate-300'}`}>
      {feature.label}
      {feature.note && (
        <span className="ml-1.5 text-xs text-slate-300 italic">({feature.note})</span>
      )}
    </span>
  </li>
);

const AdditionalFeatureRow: React.FC<{ label: string; price: string }> = ({ label, price }) => (
  <li className="flex items-center justify-between py-1.5 border-b border-slate-700/40 last:border-0">
    <span className="text-sm text-slate-200">{label}</span>
    <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
      {price}
    </span>
  </li>
);

const PricingCard: React.FC<{ plan: PricingPlan }> = ({ plan }) => (
  <div
    className={`relative flex flex-col h-full rounded-2xl border transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
      plan.highlighted
        ? 'border-amber-500/50 bg-slate-800/90 shadow-xl shadow-amber-500/10'
        : 'border-slate-700/50 bg-slate-800/60 hover:border-slate-600/70'
    }`}
  >
    {/* Top accent line */}
    <div className={`h-1 w-full bg-gradient-to-r ${plan.accentColor}`} />

    {/* Badge */}
    {plan.badge && (
      <div className="absolute top-5 right-5 z-10">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${plan.badgeColor}`}>
          {plan.badge}
        </span>
      </div>
    )}

    <div className="flex flex-col flex-1 p-6">
      {/* Header */}
      <div className="mb-5">
        <div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${plan.accentColor} text-white mb-4 shadow-lg`}
        >
          {plan.icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
        <p className="text-sm text-slate-200 leading-relaxed">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6 pb-6 border-b border-slate-700/50">
        <div className="flex items-end gap-1">
          <span className={`text-4xl font-extrabold bg-gradient-to-r ${plan.accentColor} bg-clip-text text-transparent`}>
            {plan.price}
          </span>
          {plan.priceNote && (
            <span className="text-base font-semibold text-slate-200 mb-1">{plan.priceNote}</span>
          )}
          {plan.period && (
            <span className="text-sm text-slate-300 mb-1">{plan.period}</span>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="flex-1">
        <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">
          Incluido
        </p>
        <ul className="space-y-0.5">
          {plan.features.map((feature, idx) => (
            <FeatureRow key={idx} feature={feature} />
          ))}
        </ul>

        {/* Additional paid features */}
        {plan.additionalFeatures && plan.additionalFeatures.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-700/50">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">
              Servicios adicionales
            </p>
            <ul>
              {plan.additionalFeatures.map((af, idx) => (
                <AdditionalFeatureRow key={idx} label={af.label} price={af.price} />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-6 pt-4">
        <Link to={plan.ctaHref}>
          <Button
            className={`w-full font-semibold transition-all duration-200 ${
              plan.highlighted
                ? `bg-gradient-to-r ${plan.accentColor} text-white hover:opacity-90 border-0`
                : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
            }`}
            size="lg"
          >
            {plan.ctaLabel}
          </Button>
        </Link>
      </div>
    </div>
  </div>
);

const FaqAccordion: React.FC<{ items: FaqItem[] }> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden transition-all duration-200"
        >
          <button
            className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-700/30 transition-colors duration-200"
            onClick={() => toggle(idx)}
            aria-expanded={openIndex === idx}
          >
            <span className="text-sm font-medium text-white">{item.question}</span>
            <span className="flex-shrink-0 text-slate-200">
              {openIndex === idx ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>
          {openIndex === idx && (
            <div className="px-6 pb-5">
              <p className="text-sm text-slate-200 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Stat cards for hero ───────────────────────────────────────────────────────

const statItems = [
  { icon: <Trophy className="w-5 h-5" />, label: 'Torneos Oficiales', value: 'Incluido' },
  { icon: <CreditCard className="w-5 h-5" />, label: 'Desde', value: '$500 MXN/año' },
  { icon: <Globe className="w-5 h-5" />, label: 'Cobertura', value: 'Nacional' },
  { icon: <Lock className="w-5 h-5" />, label: 'Pagos Seguros', value: '100%' },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <main className="flex-1">
        {/* ── Hero Section ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 pt-16 pb-20 sm:pt-20 sm:pb-24 md:pt-24 md:pb-28">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-lime-500/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/6 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Label */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase bg-primary/10 px-5 py-2 rounded-full border border-primary/20">
                <Zap className="w-4 h-4" />
                Afiliacións y Cuotas
              </span>
            </div>

            {/* Title */}
            <div className="text-center max-w-3xl mx-auto mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
                Planes y{' '}
                <span className="bg-gradient-to-r from-primary to-lime-400 bg-clip-text text-transparent">
                  Precios
                </span>
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-slate-200 leading-relaxed max-w-2xl mx-auto">
                Transparencia total en las cuotas de afiliación para jugadores, entrenadores, clubes,
                socios y asociaciones estatales de la Federación Mexicana de Pickleball.
              </p>
            </div>

            {/* Federation note */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex items-center gap-2.5 bg-slate-800/70 border border-slate-700/60 rounded-xl px-5 py-3 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-slate-200" />
                <span className="text-sm text-slate-300">
                  La Federación tiene{' '}
                  <span className="font-semibold text-white">acceso completo sin costo</span>
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {statItems.map((stat, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1.5 bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-4 backdrop-blur-sm"
                >
                  <span className="text-primary">{stat.icon}</span>
                  <span className="text-xs text-slate-300 text-center">{stat.label}</span>
                  <span className="text-sm font-bold text-white text-center">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Players & Coaches Section ─────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-slate-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 mb-4">
                <Users className="w-4 h-4" />
                Individuales
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Jugadores y Entrenadores
              </h2>
              <p className="mt-3 text-slate-200 max-w-xl mx-auto text-sm sm:text-base">
                Afiliacións anuales para participar activamente en la federación.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {pricingPlans
                .filter((p) => p.id === 'player' || p.id === 'coach')
                .map((plan) => (
                  <PricingCard key={plan.id} plan={plan} />
                ))}
            </div>
          </div>
        </section>

        {/* ── Clubs Section ─────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-emerald-400 text-sm font-semibold uppercase bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 mb-4">
                <Building2 className="w-4 h-4" />
                Clubes
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Planes para Clubes
              </h2>
              <p className="mt-3 text-slate-200 max-w-xl mx-auto text-sm sm:text-base">
                Dos niveles de afiliación para que tu club crezca dentro de la federación.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {pricingPlans
                .filter((p) => p.id === 'club-basic' || p.id === 'club-premium')
                .map((plan) => (
                  <PricingCard key={plan.id} plan={plan} />
                ))}
            </div>

            {/* Club comparison note */}
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <Star className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-amber-400">Club Premium</span> incluye todo lo
                  del plan básico más gestión de canchas, organización de torneos propios, generación
                  de ingresos por rentas y análisis avanzado de tu club.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Partners Section ──────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-rose-400 text-sm font-semibold uppercase bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20 mb-4">
                <Handshake className="w-4 h-4" />
                Socios
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Planes para Socios
              </h2>
              <p className="mt-3 text-slate-200 max-w-xl mx-auto text-sm sm:text-base">
                Únete como socio de forma gratuita o potencia tu presencia con el plan premium.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {pricingPlans
                .filter((p) => p.id === 'partner-free' || p.id === 'partner-premium')
                .map((plan) => (
                  <PricingCard key={plan.id} plan={plan} />
                ))}
            </div>
          </div>
        </section>

        {/* ── States & Federation Section ───────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-indigo-400 text-sm font-semibold uppercase bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 mb-4">
                <Flag className="w-4 h-4" />
                Institucionales
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Estados y Federación
              </h2>
              <p className="mt-3 text-slate-200 max-w-xl mx-auto text-sm sm:text-base">
                Cuotas institucionales para asociaciones estatales y acceso sin costo para la federación.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {pricingPlans
                .filter((p) => p.id === 'state' || p.id === 'federation')
                .map((plan) => (
                  <PricingCard key={plan.id} plan={plan} />
                ))}
            </div>

            {/* State note */}
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="flex items-start gap-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                <BarChart3 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-indigo-400">Asociaciones Estatales:</span> la
                  cuota anual única de $15,000 MXN cubre acceso completo al panel estatal. No se
                  requiere un plan premium adicional — todo está incluido.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Summary Comparison Table ──────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-slate-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Resumen de Cuotas
              </h2>
              <p className="mt-2 text-slate-200 text-sm sm:text-base">
                Todas las cuotas de afiliación en un solo vistazo.
              </p>
            </div>

            <div className="max-w-2xl mx-auto overflow-hidden rounded-2xl border border-slate-700/50">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700/50">
                      <th className="text-left px-5 py-3 text-slate-200 font-semibold">Tipo de Usuario</th>
                      <th className="text-right px-5 py-3 text-slate-200 font-semibold">Cuota Anual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {[
                      { label: 'Jugador', price: '$500 MXN', color: 'text-blue-400' },
                      { label: 'Entrenador', price: '$800 MXN', color: 'text-violet-400' },
                      { label: 'Club Básico', price: '$2,000 MXN', color: 'text-emerald-400' },
                      { label: 'Club Premium', price: '$5,000 MXN', color: 'text-amber-400', tag: 'POPULAR' },
                      { label: 'Socio (Gratuito)', price: 'Gratis', color: 'text-teal-400' },
                      { label: 'Socio Premium', price: '$8,000 MXN', color: 'text-rose-400', tag: 'RECOMENDADO' },
                      { label: 'Asociación Estatal', price: '$15,000 MXN', color: 'text-indigo-400', tag: 'TODO INCLUIDO' },
                      { label: 'Federación / Admin', price: 'Sin costo', color: 'text-slate-200' },
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className="bg-slate-800/30 hover:bg-slate-800/60 transition-colors duration-150"
                      >
                        <td className="px-5 py-3.5 text-slate-300 font-medium">
                          {row.label}
                          {row.tag && (
                            <span className="ml-2 text-[10px] font-bold bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded-full">
                              {row.tag}
                            </span>
                          )}
                        </td>
                        <td className={`px-5 py-3.5 text-right font-bold ${row.color}`}>
                          {row.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-slate-300">
              Todos los precios en pesos mexicanos (MXN). Vigencia anual desde la fecha de registro.
            </p>
          </div>
        </section>

        {/* ── CTA Section ───────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative max-w-3xl mx-auto rounded-2xl border border-slate-700/50 bg-slate-800/50 overflow-hidden p-8 sm:p-12 text-center">
              {/* Glow effects */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/6 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-lime-500 text-white mb-6 shadow-xl shadow-primary/30">
                  <Trophy className="w-7 h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                  ¿Listo para unirte?
                </h2>
                <p className="text-slate-200 mb-8 max-w-lg mx-auto text-sm sm:text-base">
                  Regístrate hoy y forma parte de la comunidad oficial de Pickleball en México.
                  Tu Afiliación activa acceso inmediato a todos los beneficios de tu plan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 px-8"
                    >
                      Registrarse ahora
                    </Button>
                  </Link>
                  <Link to="/about/benefits">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 px-8"
                    >
                      Ver beneficios
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ───────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-4">
                Preguntas Frecuentes
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                ¿Tienes dudas sobre los precios?
              </h2>
              <p className="mt-3 text-slate-200 max-w-xl mx-auto text-sm sm:text-base">
                Respondemos las preguntas más comunes sobre Afiliacións, cuotas y pagos.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <FaqAccordion items={faqItems} />
            </div>

            {/* Contact prompt */}
            <div className="mt-12 text-center">
              <p className="text-slate-300 text-sm">
                ¿No encontraste lo que buscas?{' '}
                <Link
                  to="/contact"
                  className="text-primary hover:text-lime-400 font-medium transition-colors duration-200 underline underline-offset-2"
                >
                  Contáctanos directamente
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
