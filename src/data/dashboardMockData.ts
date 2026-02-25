// Mock data for federation dashboard

export type UserType = 'player' | 'coach' | 'club' | 'partner' | 'state' | 'admin';
export type MembershipStatus = 'free' | 'premium' | 'pro';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface DashboardUser {
  id: string;
  user_type: UserType;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  state: string;
  city: string;
  skill_level?: string;
  membership_status: MembershipStatus;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  profile_photo?: string;
  business_name?: string;
  contact_person?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_type: UserType;
  recipient_type: 'all_players' | 'all_clubs' | 'all_states' | 'individual';
  recipient_id?: string;
  subject: string;
  body: string;
  sent_at: string;
  read: boolean;
}

const states = [
  'Aguascalientes',
  'Baja California',
  'CDMX',
  'Chihuahua',
  'Jalisco',
  'Nuevo León',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'Sonora',
  'Yucatán',
  'Estado de México',
  'Guanajuato',
  'Veracruz',
  'Coahuila',
];

const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];

export const mockPlayers: DashboardUser[] = Array.from({ length: 24 }, (_, i) => ({
  id: `player-${i + 1}`,
  user_type: 'player' as UserType,
  username: `player${i + 1}`,
  email: `player${i + 1}@example.com`,
  full_name: [
    'Carlos García',
    'María López',
    'Juan Hernández',
    'Ana Martínez',
    'Roberto Díaz',
    'Sofía Torres',
    'Diego Ramírez',
    'Valentina Cruz',
    'Fernando Morales',
    'Camila Reyes',
    'Alejandro Flores',
    'Isabella Ruiz',
    'Miguel Sánchez',
    'Lucía Vargas',
    'Andrés Castro',
    'Paula Mendoza',
    'Ricardo Ortiz',
    'Daniela Peña',
    'José Guerrero',
    'Natalia Romero',
    'Eduardo Silva',
    'Gabriela Navarro',
    'Luis Jiménez',
    'Mariana Domínguez',
  ][i],
  phone: `+52 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
  state: states[i % states.length],
  city: ['Monterrey', 'Guadalajara', 'CDMX', 'Cancún', 'Puebla', 'Querétaro'][i % 6],
  skill_level: skillLevels[i % 4],
  membership_status: (['free', 'premium', 'pro'] as MembershipStatus[])[i % 3],
  is_verified: i % 3 !== 2,
  is_active: i % 5 !== 4,
  created_at: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
}));

export const mockClubs: DashboardUser[] = Array.from({ length: 12 }, (_, i) => ({
  id: `club-${i + 1}`,
  user_type: 'club' as UserType,
  username: `club${i + 1}`,
  email: `club${i + 1}@example.com`,
  full_name: '',
  business_name: [
    'Club Pickleball Monterrey',
    'Guadalajara PB Club',
    'CDMX Pickleball',
    'Cancún Paddle Club',
    'Puebla Pickleball',
    'Querétaro PB',
    'Mérida Pickleball Club',
    'Tijuana PB Sports',
    'León Pickleball',
    'Playa del Carmen PB',
    'San Miguel PB Club',
    'Oaxaca Pickleball',
  ][i],
  contact_person: [
    'Pedro Álvarez',
    'Laura Ríos',
    'Marco Vega',
    'Claudia Soto',
    'Raúl Medina',
    'Elena Paredes',
    'Tomás Luna',
    'Adriana Campos',
    'Sergio Delgado',
    'Mónica Aguilar',
    'Víctor Herrera',
    'Patricia Fuentes',
  ][i],
  phone: `+52 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
  state: states[i % states.length],
  city: ['Monterrey', 'Guadalajara', 'CDMX', 'Cancún', 'Puebla', 'Querétaro'][i % 6],
  membership_status: (['free', 'premium'] as MembershipStatus[])[i % 2],
  is_verified: i % 4 !== 3,
  is_active: true,
  created_at: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
}));

export const mockStates: DashboardUser[] = states.map((state, i) => ({
  id: `state-${i + 1}`,
  user_type: 'state' as UserType,
  username: state.toLowerCase().replace(/\s/g, '-'),
  email: `${state.toLowerCase().replace(/\s/g, '')}@fmpb.mx`,
  full_name: '',
  business_name: `Asociación de Pickleball de ${state}`,
  contact_person: [
    'Juan Pérez',
    'María González',
    'Carlos Rodríguez',
    'Ana Fernández',
    'Luis Muñoz',
    'Rosa Jiménez',
    'Pedro Álvarez',
    'Laura Torres',
    'Miguel Sánchez',
    'Claudia López',
    'Roberto Díaz',
    'Sofía Martínez',
    'Diego Reyes',
    'Valentina Cruz',
    'Fernando Morales',
  ][i],
  phone: `+52 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
  state,
  city: state,
  membership_status: 'free' as MembershipStatus,
  is_verified: i % 3 !== 2,
  is_active: true,
  created_at: new Date(2024, i % 12, 1).toISOString(),
}));

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    sender_id: 'admin-1',
    sender_name: 'Federación FMPB',
    sender_type: 'admin',
    recipient_type: 'all_players',
    subject: 'Nuevo torneo nacional 2025',
    body: 'Se anuncia el calendario del Torneo Nacional de Pickleball 2025. Las inscripciones abren el 15 de marzo.',
    sent_at: new Date(2025, 1, 10).toISOString(),
    read: false,
  },
  {
    id: 'msg-2',
    sender_id: 'admin-1',
    sender_name: 'Federación FMPB',
    sender_type: 'admin',
    recipient_type: 'all_clubs',
    subject: 'Actualización de reglamento para clubes',
    body: 'Se han actualizado los requisitos de registro para clubes afiliados. Favor de revisar el documento adjunto.',
    sent_at: new Date(2025, 1, 8).toISOString(),
    read: true,
  },
  {
    id: 'msg-3',
    sender_id: 'admin-1',
    sender_name: 'Federación FMPB',
    sender_type: 'admin',
    recipient_type: 'all_states',
    subject: 'Reunión de asociaciones estatales',
    body: 'Convocamos a reunión virtual de todas las asociaciones estatales el día 20 de febrero a las 10:00 AM.',
    sent_at: new Date(2025, 1, 5).toISOString(),
    read: false,
  },
  {
    id: 'msg-4',
    sender_id: 'admin-1',
    sender_name: 'Federación FMPB',
    sender_type: 'admin',
    recipient_type: 'all_players',
    subject: 'Programa de becas deportivas',
    body: 'Se abre la convocatoria para el programa de becas deportivas 2025. Los jugadores interesados pueden aplicar hasta el 30 de abril.',
    sent_at: new Date(2025, 0, 28).toISOString(),
    read: true,
  },
];

export const dashboardStats = {
  totalPlayers: 1247,
  totalClubs: 86,
  totalStates: 28,
  totalCoaches: 134,
  activeTournaments: 5,
  pendingVerifications: 23,
  newRegistrations: 47,
  totalMessages: 156,
};
