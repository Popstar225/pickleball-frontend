// ============= Mexico Pickleball Federation Mock Data =============
// Centralized mock data for FEDMEX (Federación Mexicana de Pickleball)
// Ready for AI integration - just replace with API calls when needed

import videoCap1 from '../assets/images/_DSC8411.png';
import videoCap2 from '../assets/images/_DSC8182.png';
import videoCap3 from '../assets/images/_DSC8354.png';
import videoCap4 from '../assets/images/_DSC8745.png';

import article1 from '../assets/images/blogs/image8.png';
import article2 from '../assets/images/blogs/Image9-1.png';
import article3 from '../assets/images/blogs/Image7-1.png';
import article4 from '../assets/images/blogs/image9.png';

import upcoming1 from '../assets/images/_DSC7870.png';
import upcoming2 from '../assets/images/_DSC8895.png';
import upcoming3 from '../assets/images/blogs/Image8-1.png';
import upcoming4 from '../assets/images/_DSC8285.png';
import upcoming5 from '../assets/images/_DSC8285.png';

import headless4 from '../assets/images/blogs/image7.png';
import headless2 from '../assets/images/blogs/image8.png';
import headless3 from '../assets/images/blogs/image9.png';
import headless1 from '../assets/images/blogs/two-girls.png';

import director1 from '../assets/images/Persons for de directive comite/Jorge Antonio Cordero Gómez Del Campo.png';
import director2 from '../assets/images/Persons for de directive comite/José Armando Solís Morales.png';
import director3 from '../assets/images/Persons for de directive comite/Erika Basave Moran.png';
import director4 from '../assets/images/Persons for de directive comite/Eugenio Riego Riego.png';
import director5 from '../assets/images/Persons for de directive comite/Guillermo Mascareñas Cortina.png';
import director6 from '../assets/images/Persons for de directive comite/Antonio Assad Sayun.png';
import director7 from '../assets/images/Persons for de directive comite/Geroge Anthony Cordero Brown.png';

import association1 from '../assets/images/associations/cdmx.png';

import blog1 from '../assets/images/blogs/image7.png';
import blog11 from '../assets/images/blogs/Image7-1.png';
import blog2 from '../assets/images/blogs/image8.png';
import blog21 from '../assets/images/blogs/Image8-1.png';
import blog3 from '../assets/images/blogs/image9.png';
import blog31 from '../assets/images/blogs/Image9-1.png';
import blog4 from '../assets/images/blogs/two-girls.png';
import blog41 from '../assets/images/blogs/two-girls.png';

import court1 from '../assets/images/courts/court1.png';
import court2 from '../assets/images/courts/court2.png';
import court3 from '../assets/images/courts/court3.png';
import court4 from '../assets/images/courts/court4.png';
import court5 from '../assets/images/courts/court5.png';

import { Play, Award, TrendingUp, Star } from 'lucide-react';

// Estructura del Menú de Navegación (traducido al español)
export const navigationMenu = [
  {
    label: 'Nosotros',
    hasDropdown: true,
    items: [
      { label: 'Beneficios de Afiliarse', href: '/about/benefits' },
      { label: 'Junta Directiva', href: '/about/board' },
      { label: '¿Quiénes Somos?', href: '/about/who-we-are' },
      { label: 'Federación Internacional', href: '/about/international' },
    ],
  },
  {
    label: 'Reglas',
    hasDropdown: false,
    href: '/rules',
  },
  {
    label: 'Asociaciones',
    hasDropdown: false,
    href: '/associations',
  },
  {
    label: 'Socios',
    hasDropdown: true,
    items: [{ label: 'Socios', href: '/partners' }],
  },
  {
    label: 'Jugadores',
    hasDropdown: true,
    items: [
      { label: 'Ranking', href: '/players/ranking' },
      { label: 'Vitrina de Jugadores', href: '/players/showcase' },
      { label: 'Categorías (NRTP)', href: '/players/categories' },
      { label: 'Búsqueda de Jugadores', href: '/players/search' },
    ],
  },
  {
    label: 'Capacitación',
    hasDropdown: true,
    items: [{ label: 'Árbitros', href: '/training/referees' }],
  },
  {
    label: 'Federación',
    hasDropdown: true,
    items: [
      { label: 'Canchas', href: '/federation/courts' },
      { label: 'Torneos', href: '/federation/tournaments' },
    ],
  },
  {
    label: 'Comunicación',
    hasDropdown: true,
    items: [{ label: 'Comunicados de Prensa', href: '/communication/press' }],
  },
];

// Country flags mapping (using flag CDN for better quality)
export const countryFlags: Record<string, string> = {
  MX: 'https://flagcdn.com/w40/mx.png',
  US: 'https://flagcdn.com/w40/us.png',
  BR: 'https://flagcdn.com/w40/br.png',
  ES: 'https://flagcdn.com/w40/es.png',
  AR: 'https://flagcdn.com/w40/ar.png',
  CO: 'https://flagcdn.com/w40/co.png',
  CA: 'https://flagcdn.com/w40/ca.png',
  CL: 'https://flagcdn.com/w40/cl.png',
};

// Player Rankings Data - Mexico Pickleball Elite
export const playerRankings = [
  {
    rank: 1,
    name: 'Carlos Mendez',
    points: '8,590',
    change: '+2',
    countryCode: 'MX',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    rank: 2,
    name: 'Ana Martinez',
    points: '8,100',
    change: '+1',
    countryCode: 'MX',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    rank: 3,
    name: 'Diego Lopez',
    points: '7,850',
    change: '-1',
    countryCode: 'US',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    rank: 4,
    name: 'Maria Garcia',
    points: '7,500',
    change: '+3',
    countryCode: 'MX',
    avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
  },
  {
    rank: 5,
    name: 'Roberto Silva',
    points: '7,200',
    change: '0',
    countryCode: 'BR',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
  {
    rank: 6,
    name: 'Laura Hernandez',
    points: '6,900',
    change: '+2',
    countryCode: 'MX',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
  },
  {
    rank: 7,
    name: 'Pedro Ramirez',
    points: '6,750',
    change: '-2',
    countryCode: 'ES',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
  },
  {
    rank: 8,
    name: 'Sofia Torres',
    points: '6,500',
    change: '+1',
    countryCode: 'MX',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
  },
  {
    rank: 9,
    name: 'Maria Garcia',
    points: '7,500',
    change: '+3',
    countryCode: 'MX',
    avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
  },
  {
    rank: 10,
    name: 'Roberto Silva',
    points: '7,200',
    change: '0',
    countryCode: 'BR',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
];

// Tournament Results Data
export const tournamentResults = [
  {
    id: 1,
    name: 'Ranking Nacional',
    date: '20-22 Ene',
    status: 'terminada' as const,
    location: 'CDMX',
    top3: [
      { place: 1, name: 'Carlos Mendez', countryCode: 'MX' },
      { place: 2, name: 'Ana Martinez', countryCode: 'MX' },
      { place: 3, name: 'Diego Lopez', countryCode: 'US' },
    ],
  },
  {
    id: 2,
    name: 'Ranking Nacional',
    date: '15-17 Ene',
    status: 'terminada' as const,
    location: 'MTY',
    top3: [
      { place: 1, name: 'Maria Garcia', countryCode: 'MX' },
      { place: 2, name: 'Roberto Silva', countryCode: 'BR' },
      { place: 3, name: 'Laura Hernandez', countryCode: 'MX' },
    ],
  },
  {
    id: 3,
    name: 'Ranking Nacional',
    date: '10-12 Ene',
    status: 'terminada' as const,
    location: 'GDL',
    top3: [
      { place: 1, name: 'Pedro Ramirez', countryCode: 'ES' },
      { place: 2, name: 'Sofia Torres', countryCode: 'MX' },
      { place: 3, name: 'Carlos Mendez', countryCode: 'MX' },
    ],
  },
  {
    id: 4,
    name: 'Ranking Nacional',
    date: '5-7 Ene',
    status: 'terminada' as const,
    location: 'CUN',
    top3: [
      { place: 1, name: 'Ana Martinez', countryCode: 'MX' },
      { place: 2, name: 'Diego Lopez', countryCode: 'US' },
      { place: 3, name: 'Maria Garcia', countryCode: 'MX' },
    ],
  },
  {
    id: 5,
    name: 'Ranking Nacional',
    date: '28-30 Dic',
    status: 'terminada' as const,
    location: 'TIJ',
    top3: [
      { place: 1, name: 'Roberto Silva', countryCode: 'BR' },
      { place: 2, name: 'Carlos Mendez', countryCode: 'MX' },
      { place: 3, name: 'Pedro Ramirez', countryCode: 'ES' },
    ],
  },
  {
    id: 6,
    name: 'Ranking Nacional',
    date: '20-22 Dic',
    status: 'terminada' as const,
    location: 'QRO',
    top3: [
      { place: 1, name: 'Laura Hernandez', countryCode: 'MX' },
      { place: 2, name: 'Sofia Torres', countryCode: 'MX' },
      { place: 3, name: 'Ana Martinez', countryCode: 'MX' },
    ],
  },
  {
    id: 7,
    name: 'Ranking Nacional',
    date: '15-17 Dic',
    status: 'terminada' as const,
    location: 'PUE',
    top3: [
      { place: 1, name: 'Diego Lopez', countryCode: 'US' },
      { place: 2, name: 'Maria Garcia', countryCode: 'MX' },
      { place: 3, name: 'Roberto Silva', countryCode: 'BR' },
    ],
  },
  {
    id: 8,
    name: 'Ranking Nacional',
    date: '10-12 Dic',
    status: 'terminada' as const,
    location: 'LEO',
    top3: [
      { place: 1, name: 'Sofia Torres', countryCode: 'MX' },
      { place: 2, name: 'Pedro Ramirez', countryCode: 'ES' },
      { place: 3, name: 'Laura Hernandez', countryCode: 'MX' },
    ],
  },
];

// News Articles Data - FEDMEX Noticias de Pickleball
export const newsArticles = [
  {
    id: 1,
    category: 'NOTICIAS PRINCIPALES',
    title: 'Temporada 2026: Nuevos Equipos y Estrellas del Pickleball Mexicano',
    excerpt:
      'Prepárate para la temporada más emocionante con equipos expandidos y talento internacional que se unen a la FEDMEX.',
    date: 'Hace 2 horas',
    image: article1,
  },
  {
    id: 2,
    category: 'DESTACADO DE JUGADORES',
    title: 'Las Nuevas Estrellas: Próxima Generación de Campeones Mexicanos',
    excerpt:
      'Conoce a los jóvenes talentos que están revolucionando el circuito profesional del pickleball en México.',
    date: 'Hace 4 horas',
    image: article2,
  },
  {
    id: 3,
    category: 'TIPS DE ENTRENAMIENTO',
    title: 'Domina el Dink: Técnicas Profesionales para la Cocina (Kitchen)',
    excerpt:
      'Aprende las estrategias que separan a los jugadores amateurs de los profesionales del pickleball.',
    date: 'Hace 6 horas',
    image: article3,
  },
  {
    id: 4,
    category: 'CAMPEONATO NACIONAL',
    title: 'Campeonato Nacional 2026: Inscripciones Abiertas Ahora',
    excerpt: 'Asegura tu lugar en la competencia de pickleball más importante de México.',
    date: 'Hace 8 horas',
    image: article4,
  },
];

// Video Recaps Data - Videos de Pickleball FEDMEX
export const videoRecaps = [
  {
    id: 1,
    title: 'Resumen Semifinales: CDMX vs Monterrey',
    thumbnail: videoCap1,
    category: 'REFLEJOS',
    duration: '12:34',
  },
  {
    id: 2,
    title: 'Consejos Pro: Mejora tu Técnica de Saque en Pickleball',
    thumbnail: videoCap2,
    category: 'TUTORIAL',
    duration: '11:45',
  },
  {
    id: 3,
    title: 'Finales del Campeonato: Los Mejores Momentos',
    thumbnail: videoCap3,
    category: 'CAMPEONATO',
    duration: '10:22',
  },
  {
    id: 4,
    title: 'Entrevista: Carlos Mendez, Campeón Nacional',
    thumbnail: videoCap4,
    category: 'ENTREVISTA',
    duration: '13:15',
  },
];

// State Associations Data - Asociaciones Estatales de Pickleball
export const stateAssociations = [
  {
    name: 'Asociación de Pickleball CDMX',
    state: 'CDMX',
    hasProfile: true,
    href: '/associations/cdmx',
    image: association1,
  },
  {
    name: 'Asociación Estatal de Pickleball Jalisco',
    state: 'Jalisco',
    hasProfile: true,
    href: '/associations/jalisco',
    image: association1,
  },
  {
    name: 'Asociación de Pickleball Nuevo León',
    state: 'Nuevo León',
    hasProfile: true,
    href: '/associations/nuevo-leon',
    image: association1,
  },
  {
    name: 'Asociación de Pickleball Quintana Roo',
    state: 'Quintana Roo',
    hasProfile: true,
    href: '/associations/quintana-roo',
    image: association1,
  },
  {
    name: 'Asociación de Pickleball Baja California',
    state: 'Baja California',
    hasProfile: false,
    href: null,
    image: association1,
  },
  {
    name: 'Asociación de Pickleball Yucatán',
    state: 'Yucatán',
    hasProfile: true,
    href: '/associations/yucatan',
    image: association1,
  },
];

// Rules/Documents Data - Documentos Oficiales FEDMEX
export const rulesDocuments = [
  {
    id: 1,
    title: 'Reglas Oficiales de Pickleball 2026',
    fileUrl: '/documents/rules-2026.pdf',
    category: 'Reglas Oficiales',
  },
  {
    id: 2,
    title: 'Reglamento de Torneos FEDMEX',
    fileUrl: '/documents/tournament-regulations.pdf',
    category: 'Torneos',
  },
  {
    id: 3,
    title: 'Código de Conducta del Jugador',
    fileUrl: '/documents/code-of-conduct.pdf',
    category: 'Conducta',
  },
  {
    id: 4,
    title: 'Manual del Árbitro de Pickleball',
    fileUrl: '/documents/referee-guidelines.pdf',
    category: 'Árbitros',
  },
  {
    id: 5,
    title: 'Especificaciones de Canchas de Pickleball',
    fileUrl: '/documents/court-specs.pdf',
    category: 'Instalaciones',
  },
];

// Partners Data
export const partners = [
  { name: 'CONADE', logo: '/assets/logo-conade.jpg', tier: 'government' },
  { name: 'UWPF', logo: '/assets/logo-uwpf.png', tier: 'international' },
];

// Sponsors Data - Patrocinadores Oficiales FEDMEX
export const sponsors = [
  {
    name: 'Selkirk',
    logo: 'https://via.placeholder.com/120x60?text=Selkirk+Pickleball',
    tier: 'platinum',
  },
  { name: 'Joola', logo: 'https://via.placeholder.com/120x60?text=Joola', tier: 'gold' },
  {
    name: 'Franklin Sports',
    logo: 'https://via.placeholder.com/120x60?text=Franklin',
    tier: 'gold',
  },
  { name: 'Onix', logo: 'https://via.placeholder.com/120x60?text=Onix+Pickleball', tier: 'silver' },
];

// Tournament Single Elimination Bracket Data - Campeonato Nacional FEDMEX 2026
// 64-team bracket structure with 6 rounds (Round of 64, 32, 16, 8, Semi-finals, Final)

export const singleEliminationMatches = [
  // ============================================
  // FINAL (Round 6) - 1 match
  // ============================================
  {
    id: 'final-1',
    name: 'Final - Campeonato Nacional',
    nextLooserMatchId: null,
    nextMatchId: null,
    participants: [
      {
        id: 'team-sf1-winner',
        isWinner: true,
        name: 'Los Tigres CDMX',
        picture: null,
        resultText: '11-9, 11-7',
        status: 'PLAYED',
      },
      {
        id: 'team-sf2-winner',
        isWinner: false,
        name: 'Águilas de Monterrey',
        picture: null,
        resultText: '9-11, 7-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-30',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Final',
  },

  // ============================================
  // SEMI-FINALS (Round 5) - 2 matches
  // ============================================
  {
    id: 'sf-1',
    name: 'Semi Final 1',
    nextLooserMatchId: null,
    nextMatchId: 'final-1',
    participants: [
      {
        id: 'team-qf1-winner',
        isWinner: true,
        name: 'Los Tigres CDMX',
        picture: null,
        resultText: '11-8, 11-6',
        status: 'PLAYED',
      },
      {
        id: 'team-qf2-winner',
        isWinner: false,
        name: 'Leones de Guadalajara',
        picture: null,
        resultText: '8-11, 6-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-29',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Semi-Final',
  },
  {
    id: 'sf-2',
    name: 'Semi Final 2',
    nextLooserMatchId: null,
    nextMatchId: 'final-1',
    participants: [
      {
        id: 'team-qf3-winner',
        isWinner: true,
        name: 'Águilas de Monterrey',
        picture: null,
        resultText: '11-9, 9-11, 11-8',
        status: 'PLAYED',
      },
      {
        id: 'team-qf4-winner',
        isWinner: false,
        name: 'Pumas Querétaro',
        picture: null,
        resultText: '9-11, 11-9, 8-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-29',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Semi-Final',
  },

  // ============================================
  // QUARTER-FINALS (Round 4) - 4 matches
  // ============================================
  {
    id: 'qf-1',
    name: 'Quarter Final 1',
    nextLooserMatchId: null,
    nextMatchId: 'sf-1',
    participants: [
      {
        id: 'team-r16-1-winner',
        isWinner: true,
        name: 'Los Tigres CDMX',
        picture: null,
        resultText: '11-5, 11-7',
        status: 'PLAYED',
      },
      {
        id: 'team-r16-2-winner',
        isWinner: false,
        name: 'Diablos Rojos Puebla',
        picture: null,
        resultText: '5-11, 7-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-28',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Cuartos',
  },
  {
    id: 'qf-2',
    name: 'Quarter Final 2',
    nextLooserMatchId: null,
    nextMatchId: 'sf-1',
    participants: [
      {
        id: 'team-r16-3-winner',
        isWinner: true,
        name: 'Leones de Guadalajara',
        picture: null,
        resultText: '11-7, 11-9',
        status: 'PLAYED',
      },
      {
        id: 'team-r16-4-winner',
        isWinner: false,
        name: 'Halcones Tijuana',
        picture: null,
        resultText: '7-11, 9-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-28',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Cuartos',
  },
  {
    id: 'qf-3',
    name: 'Quarter Final 3',
    nextLooserMatchId: null,
    nextMatchId: 'sf-2',
    participants: [
      {
        id: 'team-r16-5-winner',
        isWinner: true,
        name: 'Águilas de Monterrey',
        picture: null,
        resultText: '11-6, 11-8',
        status: 'PLAYED',
      },
      {
        id: 'team-r16-6-winner',
        isWinner: false,
        name: 'Coyotes Cancún',
        picture: null,
        resultText: '6-11, 8-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-28',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Cuartos',
  },
  {
    id: 'qf-4',
    name: 'Quarter Final 4',
    nextLooserMatchId: null,
    nextMatchId: 'sf-2',
    participants: [
      {
        id: 'team-r16-7-winner',
        isWinner: true,
        name: 'Pumas Querétaro',
        picture: null,
        resultText: '11-4, 11-6',
        status: 'PLAYED',
      },
      {
        id: 'team-r16-8-winner',
        isWinner: false,
        name: 'Toros Toluca',
        picture: null,
        resultText: '4-11, 6-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-28',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Cuartos',
  },

  // ============================================
  // ROUND OF 16 (Round 3) - 8 matches
  // ============================================
  {
    id: 'r16-1',
    name: 'Redonda of 16 - Fósforo 1',
    nextLooserMatchId: null,
    nextMatchId: 'qf-1',
    participants: [
      {
        id: 'team-r32-1-winner',
        isWinner: true,
        name: 'Los Tigres CDMX',
        picture: null,
        resultText: '11-3, 11-5',
        status: 'PLAYED',
      },
      {
        id: 'team-r32-2-winner',
        isWinner: false,
        name: 'Zorros Morelia',
        picture: null,
        resultText: '3-11, 5-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-28',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Octavos',
  },
  {
    id: 'r16-2',
    name: 'Redonda of 16 - Fósforo 2',
    nextLooserMatchId: null,
    nextMatchId: 'qf-1',
    participants: [
      {
        id: 'team-r32-3-winner',
        isWinner: true,
        name: 'Diablos Rojos Puebla',
        picture: null,
        resultText: '11-8, 11-9',
        status: 'PLAYED',
      },
      {
        id: 'team-r32-4-winner',
        isWinner: false,
        name: 'Panteras Pachuca',
        picture: null,
        resultText: '8-11, 9-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-28',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Octavos',
  },
  {
    id: 'r16-3',
    name: 'Redonda of 16 - Fósforo 3',
    nextLooserMatchId: null,
    nextMatchId: 'qf-2',
    participants: [
      {
        id: 'team-r32-5-winner',
        isWinner: true,
        name: 'Leones de Guadalajara',
        picture: null,
        resultText: '11-7, 11-6',
        status: 'PLAYED',
      },
      {
        id: 'team-r32-6-winner',
        isWinner: false,
        name: 'Rayos Veracruz',
        picture: null,
        resultText: '7-11, 6-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-28',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Octavos',
  },
  {
    id: 'r16-4',
    name: 'Redonda of 16 - Fósforo 4',
    nextLooserMatchId: null,
    nextMatchId: 'qf-2',
    participants: [
      {
        id: 'team-r32-7-winner',
        isWinner: true,
        name: 'Halcones Tijuana',
        picture: null,
        resultText: '11-9, 9-11, 11-7',
        status: 'PLAYED',
      },
      {
        id: 'team-r32-8-winner',
        isWinner: false,
        name: 'Serpientes Saltillo',
        picture: null,
        resultText: '9-11, 11-9, 7-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-28',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Octavos',
  },
  {
    id: 'r16-5',
    name: 'Redonda of 16 - Fósforo 5',
    nextLooserMatchId: null,
    nextMatchId: 'qf-3',
    participants: [
      {
        id: 'team-r32-9-winner',
        isWinner: true,
        name: 'Águilas de Monterrey',
        picture: null,
        resultText: '11-4, 11-6',
        status: 'PLAYED',
      },
      {
        id: 'team-r32-10-winner',
        isWinner: false,
        name: 'Búhos Mérida',
        picture: null,
        resultText: '4-11, 6-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-28',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Octavos',
  },
  {
    id: 'r16-6',
    name: 'Redonda of 16 - Fósforo 6',
    nextLooserMatchId: null,
    nextMatchId: 'qf-3',
    participants: [
      {
        id: 'team-r32-11-winner',
        isWinner: true,
        name: 'Coyotes Cancún',
        picture: null,
        resultText: '11-8, 11-10',
        status: 'PLAYED',
      },
      {
        id: 'team-r32-12-winner',
        isWinner: false,
        name: 'Jaguares Tuxtla',
        picture: null,
        resultText: '8-11, 10-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-28',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Octavos',
  },
  {
    id: 'r16-7',
    name: 'Redonda of 16 - Fósforo 7',
    nextLooserMatchId: null,
    nextMatchId: 'qf-4',
    participants: [
      {
        id: 'team-r32-13-winner',
        isWinner: true,
        name: 'Pumas Querétaro',
        picture: null,
        resultText: '11-5, 11-7',
        status: 'PLAYED',
      },
      {
        id: 'team-r32-14-winner',
        isWinner: false,
        name: 'Lobos Durango',
        picture: null,
        resultText: '5-11, 7-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-28',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Octavos',
  },
  {
    id: 'r16-8',
    name: 'Redonda of 16 - Fósforo 8',
    nextLooserMatchId: null,
    nextMatchId: 'qf-4',
    participants: [
      {
        id: 'team-r32-15-winner',
        isWinner: true,
        name: 'Toros Toluca',
        picture: null,
        resultText: '11-6, 11-8',
        status: 'PLAYED',
      },
      {
        id: 'team-r32-16-winner',
        isWinner: false,
        name: 'Delfines Mazatlán',
        picture: null,
        resultText: '6-11, 8-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-28',
    state: 'SCORE_DONE',
    tournamentRoundText: 'Octavos',
  },

  // ============================================
  // ROUND OF 32 (Round 2) - 16 matches
  // ============================================
  {
    id: 'r32-1',
    name: 'Redonda of 32 - Fósforo 1',
    nextLooserMatchId: null,
    nextMatchId: 'r16-1',
    participants: [
      {
        id: 'team1',
        isWinner: true,
        name: 'Los Tigres CDMX',
        picture: null,
        resultText: '11-4, 11-6',
        status: 'PLAYED',
      },
      {
        id: 'team32',
        isWinner: false,
        name: 'Colibríes Oaxaca',
        picture: null,
        resultText: '4-11, 6-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-2',
    name: 'Redonda of 32 - Fósforo 2',
    nextLooserMatchId: null,
    nextMatchId: 'r16-1',
    participants: [
      {
        id: 'team16',
        isWinner: false,
        name: 'Gallos Aguascalientes',
        picture: null,
        resultText: '8-11, 9-11',
        status: 'PLAYED',
      },
      {
        id: 'team17',
        isWinner: true,
        name: 'Zorros Morelia',
        picture: null,
        resultText: '11-8, 11-9',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-3',
    name: 'Redonda of 32 - Fósforo 3',
    nextLooserMatchId: null,
    nextMatchId: 'r16-2',
    participants: [
      {
        id: 'team8',
        isWinner: false,
        name: 'Relámpagos León',
        picture: null,
        resultText: '7-11, 6-11',
        status: 'PLAYED',
      },
      {
        id: 'team25',
        isWinner: true,
        name: 'Diablos Rojos Puebla',
        picture: null,
        resultText: '11-7, 11-6',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-4',
    name: 'Redonda of 32 - Fósforo 4',
    nextLooserMatchId: null,
    nextMatchId: 'r16-2',
    participants: [
      {
        id: 'team9',
        isWinner: false,
        name: 'Espartanos SLP',
        picture: null,
        resultText: '5-11, 7-11',
        status: 'PLAYED',
      },
      {
        id: 'team24',
        isWinner: true,
        name: 'Panteras Pachuca',
        picture: null,
        resultText: '11-5, 11-7',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-5',
    name: 'Redonda of 32 - Fósforo 5',
    nextLooserMatchId: null,
    nextMatchId: 'r16-3',
    participants: [
      {
        id: 'team4',
        isWinner: true,
        name: 'Leones de Guadalajara',
        picture: null,
        resultText: '11-6, 11-8',
        status: 'PLAYED',
      },
      {
        id: 'team29',
        isWinner: false,
        name: 'Flamingos Campeche',
        picture: null,
        resultText: '6-11, 8-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-6',
    name: 'Redonda of 32 - Fósforo 6',
    nextLooserMatchId: null,
    nextMatchId: 'r16-3',
    participants: [
      {
        id: 'team13',
        isWinner: false,
        name: 'Bravos Juárez',
        picture: null,
        resultText: '9-11, 10-11',
        status: 'PLAYED',
      },
      {
        id: 'team20',
        isWinner: true,
        name: 'Rayos Veracruz',
        picture: null,
        resultText: '11-9, 11-10',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-7',
    name: 'Redonda of 32 - Fósforo 7',
    nextLooserMatchId: null,
    nextMatchId: 'r16-4',
    participants: [
      {
        id: 'team5',
        isWinner: false,
        name: 'Vaqueros Chihuahua',
        picture: null,
        resultText: '8-11, 7-11',
        status: 'PLAYED',
      },
      {
        id: 'team28',
        isWinner: true,
        name: 'Halcones Tijuana',
        picture: null,
        resultText: '11-8, 11-7',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-8',
    name: 'Redonda of 32 - Fósforo 8',
    nextLooserMatchId: null,
    nextMatchId: 'r16-4',
    participants: [
      {
        id: 'team12',
        isWinner: false,
        name: 'Osos Hermosillo',
        picture: null,
        resultText: '6-11, 8-11',
        status: 'PLAYED',
      },
      {
        id: 'team21',
        isWinner: true,
        name: 'Serpientes Saltillo',
        picture: null,
        resultText: '11-6, 11-8',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-9',
    name: 'Redonda of 32 - Fósforo 9',
    nextLooserMatchId: null,
    nextMatchId: 'r16-5',
    participants: [
      {
        id: 'team2',
        isWinner: true,
        name: 'Águilas de Monterrey',
        picture: null,
        resultText: '11-3, 11-5',
        status: 'PLAYED',
      },
      {
        id: 'team31',
        isWinner: false,
        name: 'Garzas Nayarit',
        picture: null,
        resultText: '3-11, 5-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-10',
    name: 'Redonda of 32 - Fósforo 10',
    nextLooserMatchId: null,
    nextMatchId: 'r16-5',
    participants: [
      {
        id: 'team15',
        isWinner: false,
        name: 'Piratas La Paz',
        picture: null,
        resultText: '7-11, 8-11',
        status: 'PLAYED',
      },
      {
        id: 'team18',
        isWinner: true,
        name: 'Búhos Mérida',
        picture: null,
        resultText: '11-7, 11-8',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-11',
    name: 'Redonda of 32 - Fósforo 11',
    nextLooserMatchId: null,
    nextMatchId: 'r16-6',
    participants: [
      {
        id: 'team7',
        isWinner: false,
        name: 'Guerreros Acapulco',
        picture: null,
        resultText: '9-11, 8-11',
        status: 'PLAYED',
      },
      {
        id: 'team26',
        isWinner: true,
        name: 'Coyotes Cancún',
        picture: null,
        resultText: '11-9, 11-8',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-12',
    name: 'Redonda of 32 - Fósforo 12',
    nextLooserMatchId: null,
    nextMatchId: 'r16-6',
    participants: [
      {
        id: 'team10',
        isWinner: false,
        name: 'Tiburones Los Cabos',
        picture: null,
        resultText: '6-11, 9-11',
        status: 'PLAYED',
      },
      {
        id: 'team23',
        isWinner: true,
        name: 'Jaguares Tuxtla',
        picture: null,
        resultText: '11-6, 11-9',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-13',
    name: 'Redonda of 32 - Fósforo 13',
    nextLooserMatchId: null,
    nextMatchId: 'r16-7',
    participants: [
      {
        id: 'team3',
        isWinner: true,
        name: 'Pumas Querétaro',
        picture: null,
        resultText: '11-7, 11-5',
        status: 'PLAYED',
      },
      {
        id: 'team30',
        isWinner: false,
        name: 'Iguanas Tabasco',
        picture: null,
        resultText: '7-11, 5-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-14',
    name: 'Redonda of 32 - Fósforo 14',
    nextLooserMatchId: null,
    nextMatchId: 'r16-7',
    participants: [
      {
        id: 'team14',
        isWinner: false,
        name: 'Cóndores Zacatecas',
        picture: null,
        resultText: '8-11, 6-11',
        status: 'PLAYED',
      },
      {
        id: 'team19',
        isWinner: true,
        name: 'Lobos Durango',
        picture: null,
        resultText: '11-8, 11-6',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-15',
    name: 'Redonda of 32 - Fósforo 15',
    nextLooserMatchId: null,
    nextMatchId: 'r16-8',
    participants: [
      {
        id: 'team6',
        isWinner: true,
        name: 'Toros Toluca',
        picture: null,
        resultText: '11-9, 11-7',
        status: 'PLAYED',
      },
      {
        id: 'team27',
        isWinner: false,
        name: 'Aztecas Texcoco',
        picture: null,
        resultText: '9-11, 7-11',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
  {
    id: 'r32-16',
    name: 'Redonda of 32 - Fósforo 16',
    nextLooserMatchId: null,
    nextMatchId: 'r16-8',
    participants: [
      {
        id: 'team11',
        isWinner: false,
        name: 'Caballeros Celaya',
        picture: null,
        resultText: '7-11, 10-11',
        status: 'PLAYED',
      },
      {
        id: 'team22',
        isWinner: true,
        name: 'Delfines Mazatlán',
        picture: null,
        resultText: '11-7, 11-10',
        status: 'PLAYED',
      },
    ],
    startTime: '2026-01-27',
    state: 'SCORE_DONE',
    tournamentRoundText: 'R32',
  },
];

// Helper function to get team statistics
export const getTournamentStats = () => {
  return {
    totalTeams: 64,
    totalMatches: singleEliminationMatches.length,
    rounds: 6,
    champion: 'Los Tigres CDMX',
    runnerUp: 'Águilas de Monterrey',
    venue: 'CDMX Sports Complex',
    dates: '27-30 Enero 2026',
    prize: '$50,000 MXN',
  };
};

// Schedule Calandar Data - Calendario de Eventos FEDMEX
// Events Mock Data for Schedule Calendar
// Events Mock Data for Schedule Calendar
export const upcomingEvents = [
  {
    id: 1,
    title: 'Campeonato Nacional 2026',
    type: 'Torneo',
    date: 'Febrero 28, 2026',
    time: '10:00 AM',
    location: 'CDMX Sports Complex',
    attendees: 128,
    prize: '$50,000 MXN',
    featured: true,
    image: upcoming1,
    description: "The ultimate showdown for Mexico's best pickleball players",
  },
  {
    id: 2,
    title: 'Índice regional - Norte',
    type: 'Índice',
    date: 'Febrero 5, 2026',
    time: '9:00 AM',
    location: 'Club de Tenis Monterrey',
    attendees: 64,
    prize: '$10,000 MXN',
    image: upcoming2,
    description: 'Northern region qualifying tournament',
  },
  {
    id: 3,
    title: 'Taller para principiantes',
    type: 'Capacitación',
    date: 'Febrero 8, 2026',
    time: '2:00 PM',
    location: 'Centro Deportivo Polanco',
    attendees: 24,
    image: upcoming3,
    description: 'Learn the basics of pickleball',
  },
  {
    id: 4,
    title: 'Campeonato de Dobles',
    type: 'Torneo',
    date: 'Febrero 12, 2026',
    time: '10:00 AM',
    location: 'Arena de Guadalajara',
    attendees: 96,
    prize: '$25,000 MXN',
    image: upcoming4,
    description: 'Premier doubles tournament',
  },
  {
    id: 5,
    title: 'Pro Training Camp',
    type: 'Capacitación',
    date: 'Febrero 15, 2026',
    time: '8:00 AM',
    location: 'Cancún Sports Resort',
    attendees: 32,
    prize: null,
    image: upcoming5,
    description: 'Intensive training with professional coaches',
  },
];

// Calendar days for mini calendar widget
export const calendarDays = [
  { day: 1, hasEvent: false, isToday: false },
  { day: 2, hasEvent: false, isToday: false },
  { day: 3, hasEvent: true, isToday: false },
  { day: 4, hasEvent: false, isToday: false },
  { day: 5, hasEvent: true, isToday: false },
  { day: 6, hasEvent: false, isToday: false },
  { day: 7, hasEvent: false, isToday: false },
  { day: 8, hasEvent: true, isToday: false },
  { day: 9, hasEvent: false, isToday: false },
  { day: 10, hasEvent: false, isToday: false },
  { day: 11, hasEvent: false, isToday: false },
  { day: 12, hasEvent: true, isToday: false },
  { day: 13, hasEvent: false, isToday: false },
  { day: 14, hasEvent: false, isToday: false },
  { day: 15, hasEvent: true, isToday: false },
  { day: 16, hasEvent: false, isToday: false },
  { day: 17, hasEvent: false, isToday: false },
  { day: 18, hasEvent: false, isToday: false },
  { day: 19, hasEvent: false, isToday: false },
  { day: 20, hasEvent: false, isToday: false },
  { day: 21, hasEvent: false, isToday: false },
  { day: 22, hasEvent: true, isToday: false },
  { day: 23, hasEvent: false, isToday: false },
  { day: 24, hasEvent: false, isToday: false },
  { day: 25, hasEvent: false, isToday: false },
  { day: 26, hasEvent: false, isToday: false },
  { day: 27, hasEvent: false, isToday: false },
  { day: 28, hasEvent: true, isToday: true },
  { day: 29, hasEvent: false, isToday: false },
  { day: 30, hasEvent: true, isToday: false },
  { day: 31, hasEvent: false, isToday: false },
];

// Scheduler events data in Kendo format
export const schedulerEvents = [
  {
    id: 1,
    title: 'Campeonato Nacional 2026',
    start: new Date('2026-01-28T10:00:00'),
    end: new Date('2026-01-30T18:00:00'),
    description: 'La gran final del campeonato nacional de pickleball',
    isAllDay: false,
    recurrenceRule: null,
    recurrenceId: null,
    recurrenceException: null,
    type: 'Torneo',
    location: 'Complejo Deportivo CDMX',
    attendees: 128,
    prize: '$50,000 MXN',
    color: '#eab308', // yellow/gold for tournaments
  },
  {
    id: 2,
    title: 'Clasificatorio regional - Norte',
    start: new Date('2026-01-28T09:00:00'),
    end: new Date('2026-02-05T17:00:00'),
    description: 'Clasificatorio regional del norte',
    isAllDay: false,
    recurrenceRule: null,
    recurrenceId: null,
    recurrenceException: null,
    type: 'Índice',
    location: 'Club de Tenis Monterrey',
    attendees: 64,
    prize: '$10,000 MXN',
    color: '#3b82f6', // blue for qualifiers
  },
  {
    id: 3,
    title: 'Taller para principiantes',
    start: new Date('2026-01-29T14:00:00'),
    end: new Date('2026-01-29T17:00:00'),
    description: 'Aprende los conceptos básicos del pickleball.',
    isAllDay: false,
    recurrenceRule: null,
    recurrenceId: null,
    recurrenceException: null,
    type: 'Training',
    location: 'Polanco Sports Center',
    attendees: 24,
    prize: null,
    color: '#10b981', // green for training
  },
  {
    id: 4,
    title: 'Doubles Championship',
    start: new Date('2026-02-12T10:00:00'),
    end: new Date('2026-02-12T18:00:00'),
    description: 'Premier doubles tournament',
    isAllDay: false,
    recurrenceRule: null,
    recurrenceId: null,
    recurrenceException: null,
    type: 'Torneo',
    location: 'Guadalajara Arena',
    attendees: 96,
    prize: '$25,000 MXN',
    color: '#eab308',
  },
  {
    id: 5,
    title: 'Pro Training Camp',
    start: new Date('2026-02-15T08:00:00'),
    end: new Date('2026-02-15T16:00:00'),
    description: 'Intensive training with professional coaches',
    isAllDay: false,
    recurrenceRule: null,
    recurrenceId: null,
    recurrenceException: null,
    type: 'Training',
    location: 'Cancún Sports Resort',
    attendees: 32,
    prize: null,
    color: '#10b981',
  },
  {
    id: 6,
    title: 'Singles Tournament',
    start: new Date('2026-02-20T09:00:00'),
    end: new Date('2026-02-20T17:00:00'),
    description: 'Individual competition for advanced players',
    isAllDay: false,
    recurrenceRule: null,
    recurrenceId: null,
    recurrenceException: null,
    type: 'Torneo',
    location: 'Puebla Sports Center',
    attendees: 48,
    prize: '$15,000 MXN',
    color: '#eab308',
  },
  {
    id: 7,
    title: 'Youth Camp',
    start: new Date('2026-02-22T10:00:00'),
    end: new Date('2026-02-22T14:00:00'),
    description: 'Pickleball training for young players (ages 8-16)',
    isAllDay: false,
    recurrenceRule: null,
    recurrenceId: null,
    recurrenceException: null,
    type: 'Training',
    location: 'Querétaro Youth Center',
    attendees: 40,
    prize: null,
    color: '#10b981',
  },
  {
    id: 8,
    title: 'Regional Índice - South',
    start: new Date('2026-02-25T09:00:00'),
    end: new Date('2026-02-25T17:00:00'),
    description: 'Southern region qualifying tournament',
    isAllDay: false,
    recurrenceRule: null,
    recurrenceId: null,
    recurrenceException: null,
    type: 'Índice',
    location: 'Oaxaca Tennis Club',
    attendees: 56,
    prize: '$10,000 MXN',
    color: '#3b82f6',
  },
  {
    id: 9,
    title: 'Mixed Doubles Showcase',
    start: new Date('2026-03-01T11:00:00'),
    end: new Date('2026-03-01T18:00:00'),
    description: 'Exhibition matches with top players',
    isAllDay: false,
    recurrenceRule: null,
    recurrenceId: null,
    recurrenceException: null,
    type: 'Exhibition',
    location: 'CDMX Sports Complex',
    attendees: 200,
    prize: null,
    color: '#8b5cf6', // purple for exhibitions
  },
  {
    id: 10,
    title: 'Advanced Techniques Workshop',
    start: new Date('2026-03-05T13:00:00'),
    end: new Date('2026-03-05T17:00:00'),
    description: 'Learn advanced shots and strategies',
    isAllDay: false,
    recurrenceRule: null,
    recurrenceId: null,
    recurrenceException: null,
    type: 'Training',
    location: 'Tijuana Training Center',
    attendees: 20,
    prize: null,
    color: '#10b981',
  },
];

export const affiliationBenefits = [
  {
    icon: 'trophy',
    title: 'Acceso al Ranking',
    description: 'Sigue tu progreso y compite por los primeros lugares',
  },
  {
    icon: 'id-card',
    title: 'Credencial Digital',
    description: 'Credencial oficial de membresía de la federación',
  },
  {
    icon: 'map-pin',
    title: 'Acceso a Miles de Canchas',
    description: 'Juega en canchas afiliadas en todo el país',
  },
  {
    icon: 'calendar',
    title: 'Torneos y Ligas',
    description: 'Acceso a eventos reconocidos por la federación que otorgan puntos de ranking',
  },
  {
    icon: 'flag',
    title: 'Oportunidades en la Selección Nacional',
    description: 'Califica para representar a México en torneos internacionales',
  },
  {
    icon: 'graduation-cap',
    title: 'Capacitación y Certificaciones',
    description: 'Programas de desarrollo profesional',
  },
  {
    icon: 'gift',
    title: 'Incentivos y Patrocinios',
    description: 'Acceso a becas y oportunidades de patrocinio',
  },
];

// Board of Directors Data 2026-2030
export const boardOfDirectors = [
  {
    name: 'Jorge Antonio Cordero Gómez Del Campo',
    position: 'Presidente',
    image: director1,
    row: 1,
  },
  {
    name: 'José Armando Solís Morales',
    position: 'Vicepresidente Ejecutivo',
    image: director2,
    row: 2,
  },
  {
    name: 'Erika Basave Moran',
    position: 'Vicepresidenta Comercial',
    image: director3,
    row: 2,
  },
  {
    name: 'Eugenio Riego Riego',
    position: 'Vicepresidente Financiero',
    image: director4,
    row: 2,
  },
  {
    name: 'Guillermo Mascareñas Cortina',
    position: 'Director de Reglamentos y Competencias',
    image: director5,
    row: 3,
  },
  {
    name: 'Antonio Assad Sayun',
    position: 'Director de Marketing y Patrocinios',
    image: director6,
    row: 3,
  },
  {
    name: 'Geroge Anthony Cordero Brown',
    position: 'Representante Legal',
    image: director7,
    row: 3,
  },
];

export const playerShowcases = [
  {
    id: 'jorge-barajas',
    slug: 'jorge-barajas',
    icon: Play,
    label: 'NUEVA',
    color: 'bg-primary',
    headlineThumbnail: headless1,
    title: 'Talento mexicano abriendo camino',
    headlineTitle:
      'Las mejores jugadas de la semana: Intercambios de golpes increíbles y remates espectaculares.',
    playerName: 'Jorge Daniel Barajas',
    excerpt:
      'Jorge Daniel Barajas se ha consolidado como uno de los jugadores mexicanos más destacados del pickleball a nivel internacional.',
    featuredImage: blog1,
    thumbnail: blog11,
    publishedAt: '2025-01-15',
    content: `Jorge Daniel Barajas se ha consolidado como uno de los jugadores mexicanos más destacados del pickleball a nivel internacional. Su ascenso meteórico en el ranking DUPR y su presencia constante en finales lo ubican entre la élite del deporte en la región, convirtiéndolo en un contendiente natural al campeonato nacional de pickleball.

## Rendimiento y rankings

- **Top 5** jugador mexicano de dobles (Fuente: DUPR)
- **Top 15** en dobles y singles en Centroamérica y el Caribe (Fuente: DUPR)
- **Ranking DUPR:** 5.1

En 2024, Jorge fue finalista y medallista de plata en el torneo internacional DUPR Nationals en Venezuela, compitiendo en la final contra Gabriel Tardío, un jugador Top 5 mundial y compañero de dobles de Ben Johns, el actual número uno global. Un hito que confirma su nivel competitivo contra los mejores.

## Trayectoria atlética de alto rendimiento

Antes del pickleball, Jorge construyó una sólida carrera atlética como exfutbolista profesional del Club América, complementada con alto rendimiento en squash, pádel y natación. Esta combinación explica su potencia física, lectura de juego y adaptabilidad en cancha, haciéndolo un atleta naturalmente talentoso en múltiples deportes.

## Circuitos y competencias

Participa activamente en los principales circuitos del país:

- Circuito Pickleball México
- Elevate Sports by Skechers
- Matchpoint
- Liga de la Federación Mexicana de Pickleball

## Medallero nacional (categoría Open)

- 🥇 **25** Oros
- 🥈 **15** Platas
- 🥉 **15** Bronces`,
    stats: {
      gold: 25,
      silver: 15,
      bronze: 15,
      duprRating: '5.0',
    },
  },
  {
    id: 'jessica-torres',
    slug: 'jessica-torres',
    icon: Award,
    label: 'NUEVA',
    color: 'bg-secondary',
    headlineThumbnail: headless2,
    title:
      'Jessica Torres: consistencia, liderazgo y proyección internacional del pickleball femenino mexicano',
    headlineTitle: 'Carlos Méndez alcanza las 1000 victorias en su carrera.',
    playerName: 'Jessica Torres',
    excerpt:
      'Jessica Torres se ha posicionado rápidamente como una de las jugadoras de pickleball más competitivas y completas de México.',
    featuredImage: blog21,
    thumbnail: blog2,
    publishedAt: '2025-01-10',
    content: `Jessica Torres se ha posicionado rápidamente como una de las jugadoras de pickleball más competitivas y completas de México. Su disciplina, visión de juego y liderazgo le han permitido destacar tanto en cancha como en el desarrollo de nuevas generaciones.

## Resultados que hacen historia

Jessica ha obtenido más de 60 medallas en torneos nacionales e internacionales:

- 🥇 **38** oros
- 🥈 **14** platas
- 🥉 **13** bronces

Ha competido en México, Estados Unidos, Chile y Venezuela, manteniendo un rendimiento consistente contra rivales de alto nivel.

En la Mexico Cup, logró:
- **3er lugar** nacional en singles femenino
- **2do lugar** nacional en dobles femenino, solo detrás de Carlota Treviño y Aline Morales, figuras líderes del pickleball femenino nacional.

## Entrenamiento, liderazgo y desarrollo deportivo

Más allá de la competencia, Jessica es entrenadora certificada PPR (Professional Pickleball Registry) y actualmente se desempeña como Head Coach en Pickspot Club en Querétaro, donde promueve el desarrollo técnico y humano dentro de la comunidad.

Ha realizado clínicas en todo el país, contribuyendo activamente a la profesionalización del deporte y al fortalecimiento del talento femenino.

## Proyección internacional y reconocimientos

- Seleccionada para representar a México en el **Campeonato Mundial de Pickleball 2025**
- Destacada por **Dink Authority Magazine** como jugadora a observar
- Reconocida en diciembre 2025 como **Mejor Jugadora Extranjera** en los Cero Cero Dos Awards

## Un modelo a seguir para el pickleball femenino

Jessica Torres representa a una nueva generación de atletas mexicanas: competitivas, preparadas y comprometidas con el crecimiento del pickleball dentro y fuera de la cancha. Su historia refleja el avance del deporte en México y el impacto que las mujeres están teniendo en su consolidación internacional.`,
    stats: {
      gold: 38,
      silver: 14,
      bronze: 13,
      duprRating: '5.0',
    },
  },
  {
    id: 'ricardo-villa',
    slug: 'ricardo-villa',
    icon: TrendingUp,
    label: 'NUEVA',
    color: 'bg-secondary',
    headlineThumbnail: headless3,
    title: 'Ricardo Villa: dominio, mentalidad competitiva y excelencia internacional',
    headlineTitle: 'NBC Peacock: Cobertura exclusiva de las finales de la MLP.',
    playerName: 'Ricardo Villa',
    excerpt:
      'Ricardo Villa es sinónimo de alto rendimiento y consistencia competitiva en el pickleball mexicano.',
    featuredImage: blog3,
    thumbnail: blog31,
    publishedAt: '2025-01-05',
    content: `*Nota institucional · Federación*

Ricardo Villa es sinónimo de alto rendimiento y consistencia competitiva en el pickleball mexicano. Su trayectoria atlética, forjada en el tenis de mesa de élite, lo ha llevado a convertirse en uno de los jugadores más dominantes y respetados del país, con impacto real en el escenario internacional.

## Logros que definen una era

- **Campeón Nacional de Pickleball**
- **5to lugar mundial** en Pickleball
- **Mayor ganador de eventos** en México en 2025
- **Ex número uno nacional** en tenis de mesa

Estos resultados reflejan no solo talento, sino también una disciplina táctica y mental poco común—clave para el éxito sostenido al más alto nivel.

## De la mesa a la cancha

Antes de destacar en pickleball, Ricardo fue el número uno nacional en tenis de mesa, una base que hoy se traduce en reflejos excepcionales, control, lectura de juego y precisión. Esta transición exitosa explica su rápida adaptación y dominio en torneos clave.

## Un referente del pickleball mexicano

Con apariciones consistentes en finales y un histórico 2025 como su año más exitoso, Ricardo Villa representa el estándar competitivo que impulsa al pickleball mexicano hacia nuevas metas internacionales.`,
    stats: {
      gold: 30,
      silver: 12,
      bronze: 8,
      duprRating: '5.0',
    },
  },
  {
    id: 'futuras-estrellas-juveniles',
    slug: 'futuras-estrellas-juveniles',
    icon: Star,
    label: 'NUEVA',
    color: 'bg-secondary',
    headlineThumbnail: headless4,
    title:
      'Andrea y Gabriela Zamora: Disciplina, talento y proyección juvenil en el pickleball mexicano',
    headlineTitle: 'Mejores momentos del fin de semana de campeonato',
    playerName: 'Andrea Zamora y Gabriela Zamora',
    excerpt:
      'Andrea (16) y Gabriela (14) Zamora representan la nueva generación del pickleball mexicano, combinando experiencia en tenis con dedicación de tiempo completo para alcanzar el nivel profesional.',
    featuredImage: blog4,
    thumbnail: blog41,
    publishedAt: '2025-01-20',
    content: `El crecimiento del pickleball en México se refleja en historias que combinan talento, disciplina y una visión clara de futuro. Tal es el caso de Andrea Zamora (16 años) y Gabriela Zamora (14 años), dos jóvenes atletas que han encontrado en este deporte una plataforma para su desarrollo integral y competitivo.

## Del tenis al pickleball

Andrea y Gabriela comenzaron a practicar pickleball hace tres años, mientras entrenaban tenis. Fue durante este proceso de transición cuando descubrieron el potencial del pickleball como disciplina competitiva. Sin embargo, fue hace aproximadamente un año y medio cuando decidieron comprometerse por completo con la competencia, comenzando a participar regularmente en torneos en Estados Unidos, particularmente en Texas y Oklahoma.

Antes de consolidarse en el pickleball, Andrea ya había destacado notablemente en el tenis, convirtiéndose en campeona distrital durante dos años consecutivos y obteniendo el tercer lugar a nivel estatal, experiencia que hoy se refleja en su madurez deportiva y rendimiento en la cancha.

## Éxito competitivo nacional

Hace seis meses, ambas atletas regresaron a México y se integraron de inmediato al circuito competitivo nacional. Desde entonces, su impacto ha sido notable:

- 🏆 Campeonas juveniles e intermedias en la Copa México
- Resultados destacados en los torneos de Chapala, San Miguel de Allende y Querétaro
- Presencia constante en diversos eventos competitivos locales

## Compromiso deportivo de tiempo completo

Tras su participación en el torneo de San Miguel de Allende, Andrea y Gabriela tomaron una decisión clave en su proceso de desarrollo deportivo: optar por un modelo de educación en casa (homeschool), lo que les permite dedicarse de tiempo completo a su preparación con el objetivo claro de alcanzar el nivel profesional en los más altos estándares.

### Régimen de entrenamiento

Actualmente entrenan cinco días a la semana con:

- 4 a 5 horas diarias de sesiones en cancha
- 1.5 horas de acondicionamiento físico en gimnasio
- Una mentalidad profesional poco común a su corta edad

## El futuro del pickleball mexicano

Historias como la de Andrea y Gabriela Zamora representan tanto el presente como el futuro del pickleball en México. Su dedicación, constancia y visión a largo plazo ejemplifican el potencial de las nuevas generaciones y el camino que puede construirse a través de una estructura deportiva sólida y un desarrollo integral.`,
    stats: {
      gold: 6,
      silver: 4,
      bronze: 3,
      duprRating: '4.0',
    },
  },
];

export const nrtpCategories = [
  {
    level: '2.0',
    name: 'Principiante',
    groupName: 'Principiantes',
    description: 'Jugador nuevo que está aprendiendo las reglas básicas y la técnica fundamental.',
    characteristics: [
      'Conoce las reglas básicas del juego',
      'Puede mantener un rally corto',
      'Está desarrollando la técnica de servicio',
      'Posicionamiento básico en la cancha',
    ],
  },
  {
    level: '2.5',
    name: 'Principiante Avanzado',
    groupName: 'Principiantes',
    description: 'Jugador con fundamentos sólidos que busca mejorar consistencia.',
    characteristics: [
      'Servicio más consistente',
      'Puede sostener rallies más largos',
      'Entiende la estrategia básica de dobles',
      'Mejorando control de dinks',
    ],
  },
  {
    level: '3.0',
    name: 'Intermedio',
    groupName: 'Intermedio',
    description: 'Jugador con técnica desarrollada y comprensión táctica del juego.',
    characteristics: [
      'Golpes consistentes desde la línea de fondo',
      'Puede ejecutar dinks con control',
      'Comprende la estrategia de la cocina',
      'Servicio con dirección intencional',
    ],
  },
  {
    level: '3.5',
    name: 'Intermedio Alto',
    groupName: 'Intermedio',
    description: 'Jugador con variedad de golpes y pensamiento estratégico avanzado.',
    characteristics: [
      'Volleys consistentes',
      'Puede ejecutar drops del tercer golpe',
      'Juego de pies mejorado',
      'Reconoce oportunidades de ataque',
    ],
  },
  {
    level: '4.0',
    name: 'Avanzado',
    groupName: 'Avanzado',
    description: 'Jugador competitivo con arsenal técnico completo.',
    characteristics: [
      'Drops del tercer golpe consistentes',
      'Volleys ofensivos y defensivos sólidos',
      'Buen control de ritmo de juego',
      'Estrategia de dobles desarrollada',
    ],
  },
  {
    level: '4.5',
    name: 'Avanzado Alto',
    groupName: 'Avanzado',
    description: 'Jugador altamente competitivo cerca del nivel profesional.',
    characteristics: [
      'Todos los golpes ejecutados con potencia y control',
      'Excelente anticipación',
      'Puede variar velocidad y spin efectivamente',
      'Liderazgo en estrategia de dobles',
    ],
  },
  {
    level: '5.0+',
    name: 'Open / Elite',
    groupName: 'Open / Elite',
    description: 'Jugador profesional o de nivel competitivo más alto.',
    characteristics: [
      'Dominio completo de todos los aspectos del juego',
      'Competidor en torneos profesionales',
      'Capacidad de adaptación táctica inmediata',
      'Físicamente preparado para competencias de alto nivel',
    ],
  },
];

// Referees Data
export const referees = [
  {
    id: 'ref-001',
    name: 'Miguel Ángel Rodríguez',
    avatar: 'https://randomuser.me/api/portraits/men/61.jpg',
    certification: 'Level 3 - National',
    state: 'CDMX',
    email: 'miguel.rodriguez@fmp.org.mx',
    phone: '+52 55 1234 5678',
    eventsOfficiated: 45,
    yearsExperience: 5,
    specialization: 'Singles & Doubles',
    bio: 'Árbitro certificado con amplia experiencia en torneos nacionales e internacionales.',
  },
  {
    id: 'ref-002',
    name: 'Patricia López Hernández',
    avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
    certification: 'Level 3 - National',
    state: 'Jalisco',
    email: 'patricia.lopez@fmp.org.mx',
    phone: '+52 33 9876 5432',
    eventsOfficiated: 38,
    yearsExperience: 4,
    specialization: 'Doubles',
    bio: 'Especialista en torneos de dobles con certificación internacional PPR.',
  },
  {
    id: 'ref-003',
    name: 'Roberto García Méndez',
    avatar: 'https://randomuser.me/api/portraits/men/63.jpg',
    certification: 'Level 2 - Regional',
    state: 'Nuevo León',
    email: 'roberto.garcia@fmp.org.mx',
    phone: '+52 81 5555 1234',
    eventsOfficiated: 22,
    yearsExperience: 2,
    specialization: 'Singles',
    bio: 'Árbitro regional activo en el circuito del norte de México.',
  },
  {
    id: 'ref-004',
    name: 'Carmen Ruiz Torres',
    avatar: 'https://randomuser.me/api/portraits/women/64.jpg',
    certification: 'Level 3 - National',
    state: 'Querétaro',
    email: 'carmen.ruiz@fmp.org.mx',
    phone: '+52 44 2222 3333',
    eventsOfficiated: 50,
    yearsExperience: 6,
    specialization: 'All Categories',
    bio: 'Instructora de árbitros y oficial principal en campeonatos nacionales.',
  },
  {
    id: 'ref-005',
    name: 'Fernando Martínez Soto',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
    certification: 'Level 2 - Regional',
    state: 'Quintana Roo',
    email: 'fernando.martinez@fmp.org.mx',
    phone: '+52 99 8888 7777',
    eventsOfficiated: 18,
    yearsExperience: 2,
    specialization: 'Doubles & Mixed',
    bio: 'Árbitro especializado en eventos turísticos y regionales del sureste.',
  },
  {
    id: 'ref-006',
    name: 'Laura Vega Castillo',
    avatar: 'https://randomuser.me/api/portraits/women/66.jpg',
    certification: 'Level 1 - Local',
    state: 'Puebla',
    email: 'laura.vega@fmp.org.mx',
    phone: '+52 22 1111 2222',
    eventsOfficiated: 8,
    yearsExperience: 1,
    specialization: 'Beginner Events',
    bio: 'Árbitro en formación con enfoque en eventos para principiantes.',
  },
];

// Referees Data
export const coaches = [
  {
    id: 'ref-001',
    name: 'Miguel Ángel Rodríguez',
    avatar: 'https://randomuser.me/api/portraits/men/61.jpg',
    certification: 'Level 3 - National',
    state: 'CDMX',
    email: 'miguel.rodriguez@fmp.org.mx',
    phone: '+52 55 1234 5678',
    eventsOfficiated: 45,
    yearsExperience: 5,
    specialization: 'Singles & Doubles',
    bio: 'Árbitro certificado con amplia experiencia en torneos nacionales e internacionales.',
  },
  {
    id: 'ref-002',
    name: 'Patricia López Hernández',
    avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
    certification: 'Level 3 - National',
    state: 'Jalisco',
    email: 'patricia.lopez@fmp.org.mx',
    phone: '+52 33 9876 5432',
    eventsOfficiated: 38,
    yearsExperience: 4,
    specialization: 'Doubles',
    bio: 'Especialista en torneos de dobles con certificación internacional PPR.',
  },
  {
    id: 'ref-003',
    name: 'Roberto García Méndez',
    avatar: 'https://randomuser.me/api/portraits/men/63.jpg',
    certification: 'Level 2 - Regional',
    state: 'Nuevo León',
    email: 'roberto.garcia@fmp.org.mx',
    phone: '+52 81 5555 1234',
    eventsOfficiated: 22,
    yearsExperience: 2,
    specialization: 'Singles',
    bio: 'Árbitro regional activo en el circuito del norte de México.',
  },
  {
    id: 'ref-004',
    name: 'Carmen Ruiz Torres',
    avatar: 'https://randomuser.me/api/portraits/women/64.jpg',
    certification: 'Level 3 - National',
    state: 'Querétaro',
    email: 'carmen.ruiz@fmp.org.mx',
    phone: '+52 44 2222 3333',
    eventsOfficiated: 50,
    yearsExperience: 6,
    specialization: 'All Categories',
    bio: 'Instructora de árbitros y oficial principal en campeonatos nacionales.',
  },
];

// Courts Data
export const courts = [
  {
    id: 'court-001',
    name: 'Pickspot Club Querétaro',
    address: 'Av. Constituyentes 123, Col. Centro, Querétaro, QRO',
    state: 'Querétaro',
    type: 'Interior',
    numberOfCourts: 8,
    surface: 'Concreto acolchonado',
    amenities: ['Estacionamiento', 'Vestuarios', 'Tienda Pro', 'Cafetería', 'Renta de equipo'],
    contactEmail: 'info@pickspot.mx',
    contactPhone: '+52 44 2345 6789',
    hours: 'Lun-Dom: 7:00 AM - 10:00 PM',
    image: court1,
    verified: true,
    registeredBy: 'club',
  },
  {
    id: 'court-002',
    name: 'CDMX Sports Complex',
    address: 'Av. Insurgentes Sur 456, Col. Roma, CDMX',
    state: 'CDMX',
    type: 'Exterior',
    numberOfCourts: 12,
    surface: 'Asfalto',
    amenities: ['Estacionamiento', 'Iluminación', 'Baños', 'Bebederos'],
    contactEmail: 'canchas@cdmxsports.com',
    contactPhone: '+52 55 3456 7890',
    hours: 'Lun-Dom: 6:00 AM - 9:00 PM',
    image: court2,
    verified: true,
    registeredBy: 'partner',
  },
  {
    id: 'court-003',
    name: 'Monterrey Pickleball Arena',
    address: 'Calle Tecnológico 789, Col. Valle, Monterrey, NL',
    state: 'Nuevo León',
    type: 'Interior',
    numberOfCourts: 6,
    surface: 'Piso deportivo',
    amenities: [
      'Estacionamiento',
      'Aire acondicionado',
      'Vestuarios',
      'Cafetería',
      'Renta de equipo',
      'Entrenamiento',
    ],
    contactEmail: 'reservas@mtypickleball.com',
    contactPhone: '+52 81 4567 8901',
    hours: 'Lun-Vie: 8:00 AM - 10:00 PM, Sáb-Dom: 7:00 AM - 8:00 PM',
    image: court3,
    verified: true,
    registeredBy: 'club',
  },
  {
    id: 'court-004',
    name: 'Cancún Beach Courts',
    address: 'Blvd. Kukulcán Km 12, Zona Hotelera, Cancún, QR',
    state: 'Quintana Roo',
    type: 'Exterior',
    numberOfCourts: 4,
    surface: 'Concreto',
    amenities: ['Acceso a la playa', 'Regaderas', 'Renta de equipo', 'Bar'],
    contactEmail: 'play@cancunbeachpickleball.com',
    contactPhone: '+52 99 5678 9012',
    hours: 'Diario: 7:00 AM - Atardecer',
    image: court4,
    verified: false,
    registeredBy: 'partner',
  },
  {
    id: 'court-005',
    name: 'Club Deportivo Guadalajara',
    address: 'Av. Vallarta 234, Col. Americana, Guadalajara, JAL',
    state: 'Jalisco',
    type: 'Interior',
    numberOfCourts: 10,
    surface: 'Madera acolchonada',
    amenities: [
      'Estacionamiento',
      'Spa',
      'Restaurante',
      'Tienda Pro',
      'Entrenamiento',
      'Guardería',
    ],
    contactEmail: 'pickleball@cdguadalajara.com',
    contactPhone: '+52 33 6789 0123',
    hours: 'Lun-Dom: 6:00 AM - 11:00 PM',
    image: court5,
    verified: true,
    registeredBy: 'club',
  },
];

// Tournaments Calendar Data
export type TournamentStatus =
  | 'pending_validation'
  | 'validated'
  | 'published'
  | 'completed'
  | 'cancelled';
export type TournamentCreator = 'admin' | 'state_committee' | 'partner' | 'club';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: string;
  state: string;
  venue: string;
  categories: string[];
  format: string;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: string;
  prizePool: string | null;
  image: string;
  status: TournamentStatus;
  createdBy: TournamentCreator;
  creatorName: string;
  validatedBy: string | null;
  validatedAt: string | null;
  featured: boolean;
}

export const tournaments: Tournament[] = [
  {
    id: 'tourn-001',
    name: 'Abierto Mexicano de Pickleball 2026',
    description:
      'El torneo más importante del año con participación de jugadores de todo México y competidores internacionales.',
    startDate: '2026-03-15',
    endDate: '2026-03-18',
    registrationDeadline: '2026-03-01',
    location: 'Ciudad de México',
    state: 'CDMX',
    venue: 'Centro Deportivo Olímpico Mexicano',
    categories: ['Singles Open', 'Doubles Open', 'Mixed Doubles', 'Senior 50+', 'Junior U18'],
    format: 'Double Elimination',
    maxParticipants: 512,
    currentParticipants: 324,
    entryFee: '$800 MXN',
    prizePool: '$150,000 MXN',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop',
    status: 'published',
    createdBy: 'admin',
    creatorName: 'Federación Mexicana de Pickleball',
    validatedBy: null,
    validatedAt: null,
    featured: true,
  },
  {
    id: 'tourn-002',
    name: 'Copa Nuevo León 2026',
    description: 'Torneo regional del norte de México con categorías para todos los niveles.',
    startDate: '2026-02-22',
    endDate: '2026-02-23',
    registrationDeadline: '2026-02-15',
    location: 'Monterrey',
    state: 'Nuevo León',
    venue: 'Arena Monterrey',
    categories: ['Singles 3.0-3.5', 'Singles 4.0+', 'Doubles All Levels'],
    format: 'Round Robin + Playoffs',
    maxParticipants: 128,
    currentParticipants: 98,
    entryFee: '$500 MXN',
    prizePool: '$30,000 MXN',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    status: 'published',
    createdBy: 'state_committee',
    creatorName: 'Comité Estatal Nuevo León',
    validatedBy: 'Federación Mexicana de Pickleball',
    validatedAt: '2026-01-15',
    featured: false,
  },
  {
    id: 'tourn-003',
    name: 'Torneo Pickspot Spring Classic',
    description:
      'Evento para principiantes e intermedios en las instalaciones de Pickspot Querétaro.',
    startDate: '2026-03-08',
    endDate: '2026-03-08',
    registrationDeadline: '2026-03-05',
    location: 'Querétaro',
    state: 'Querétaro',
    venue: 'Pickspot Club Querétaro',
    categories: ['Beginners 2.0-2.5', 'Intermediate 3.0-3.5'],
    format: 'Round Robin',
    maxParticipants: 48,
    currentParticipants: 32,
    entryFee: '$350 MXN',
    prizePool: null,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    status: 'validated',
    createdBy: 'club',
    creatorName: 'Pickspot Club',
    validatedBy: 'Comité Estatal Querétaro',
    validatedAt: '2026-01-20',
    featured: false,
  },
  {
    id: 'tourn-004',
    name: 'Riviera Maya Open',
    description: 'Torneo en la playa con vista al Caribe mexicano.',
    startDate: '2026-04-05',
    endDate: '2026-04-06',
    registrationDeadline: '2026-03-28',
    location: 'Playa del Carmen',
    state: 'Quintana Roo',
    venue: 'Cancún Beach Courts',
    categories: ['Open Doubles', 'Mixed Doubles'],
    format: 'Double Elimination',
    maxParticipants: 64,
    currentParticipants: 18,
    entryFee: '$600 MXN',
    prizePool: '$20,000 MXN',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop',
    status: 'pending_validation',
    createdBy: 'partner',
    creatorName: 'Cancún Beach Sports',
    validatedBy: null,
    validatedAt: null,
    featured: false,
  },
  {
    id: 'tourn-005',
    name: 'Liga Jalisco - Jornada 3',
    description: 'Tercera jornada de la liga estatal de Jalisco.',
    startDate: '2026-02-15',
    endDate: '2026-02-15',
    registrationDeadline: '2026-02-12',
    location: 'Guadalajara',
    state: 'Jalisco',
    venue: 'Club Deportivo Guadalajara',
    categories: ['Liga Teams'],
    format: 'League Match',
    maxParticipants: 32,
    currentParticipants: 32,
    entryFee: 'Included in League',
    prizePool: null,
    image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&h=400&fit=crop',
    status: 'published',
    createdBy: 'state_committee',
    creatorName: 'Comité Estatal Jalisco',
    validatedBy: 'Federación Mexicana de Pickleball',
    validatedAt: '2026-01-10',
    featured: false,
  },
];
