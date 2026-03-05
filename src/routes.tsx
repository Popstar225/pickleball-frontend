// Core imports
import React from 'react';
import { useParams } from 'react-router-dom';

// Public pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Benefits from './pages/about/Benefits';
import BoardOfDirectors from './pages/about/BoardOfDirectors';
import WhoWeAre from './pages/about/WhoWeAre';
import InternationalFederation from './pages/about/InternationalFederation';
import Rules from './pages/Rules';
import Association from './pages/Associations';
import Ranking from './pages/players/Ranking';
import Showcase from './pages/players/Showcase';
import ShowcaseDetail from './pages/players/ShowcaseDetail';
import Categories from './pages/players/Categories';
import PlayerSearch from './pages/players/PlayerSearch';
import Referees from './pages/training/Referees';
import Courts from './pages/admin/Courts';
import Tournaments from './pages/admin/Tournaments';
import PressReleases from './pages/communication/PressReleases';
import Partners from './pages/partners/Partners';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SelectUserTypePage from './pages/auth/SelectUserTypePage';
import RequiredFieldsPage from './pages/auth/RequiredFieldsPage';
import OptionalFieldsPage from './pages/auth/OptionalFieldsPage';

import FederationDashboardLayout from './pages/admin/dashboard/DashboardLayout';
import MessagesPage from './pages/admin/dashboard/MessagesPage';
import ClubsManagement from './pages/admin/dashboard/ClubsManagement';
import CourtsManagement from './pages/admin/dashboard/CourtsManagement';
import CourtDetails from './pages/admin/dashboard/CourtDetails';
import DashboardHome from './pages/admin/dashboard/DashboardHome';
import PlayersManagement from './pages/admin/dashboard/PlayersManagement';
import FederationTournamentManagementPage from './pages/admin/dashboard/Tournament/FederationTournamentManagementPage';
import FederationTournamentEventManagement from './pages/admin/dashboard/Tournament/TournamentEventManagement';
import FederationEventsPage from './pages/admin/dashboard/FederationEvents';

// State Dashboard pages
import StateDashboardLayout from './pages/state/dashboard/StateDashboardLayout';
import StateDashboardHome from './pages/state/dashboard/StateDashboardHome';
import StateAccountPage from './pages/state/dashboard/StateAccountPage';
import TournamentValidationPage from './pages/state/dashboard/TournamentValidation';
import StateTournamentManagementPage from './pages/state/dashboard/StateTournamentManagement';
import StateTournamentEventManagement from './pages/state/dashboard/Tournament/TournamentEventManagement';
import EventValidationPage from './pages/state/dashboard/EventValidation';
import StatePlayersManagement from './pages/state/dashboard/StatePlayersManagement';
import StateClubsManagement from './pages/state/dashboard/StateClubsManagement';
import StateCourtsManagement from './pages/state/dashboard/StateCourtsManagement';

// Player Dashboard pages
import PlayerDashboardLayout from './pages/players/dashboard/PlayerDashboardLayout';
import PlayerDashboardHome from './pages/players/dashboard/DashboardHome';
import PlayerAccountPage from './pages/players/dashboard/AccountPage';
import PlayerCredentialsPage from './pages/players/dashboard/CredentialsPage';
import PlayerClubsPage from './pages/players/dashboard/ClubsPage';
import PlayerSearchPage from './pages/players/dashboard/PlayersPage';
import PlayerTournamentsPage from './pages/players/dashboard/TournamentsPage';
import PlayerMessagesPage from './pages/players/dashboard/MessagesPage';
import PlayerPaymentsPage from './pages/players/dashboard/PaymentsPage';

// Partner Dashboard pages
import PartnerDashboardLayout from './pages/partners/dashboard/PartnerDashboardLayout';
import PartnerDashboardHome from './pages/partners/dashboard/PartnerDashboardHome';
import PartnerAccountPage from './pages/partners/dashboard/PartnerAccountPage';
import PartnerMessagesPage from './pages/partners/dashboard/PartnerMessagesPage';
import PartnerPaymentsPage from './pages/partners/dashboard/PartnerPaymentsPage';

// Coach Dashboard pages
import CoachDashboardLayout from './pages/coaches/dashboard/CoachDashboardLayout';
import CoachDashboardHome from './pages/coaches/dashboard/CoachDashboardHome';
import CoachAccountPage from './pages/coaches/dashboard/CoachAccountPage';
import CoachCredentialsPage from './pages/coaches/dashboard/CoachCredentialsPage';
import CoachMessagesPage from './pages/coaches/dashboard/CoachMessagesPage';
import CoachPaymentsPage from './pages/coaches/dashboard/CoachPaymentsPage';

// Club Dashboard pages
import ClubDashboardLayout from './pages/clubs/dashboard/ClubDashboardLayout';
import ClubDashboardHome from './pages/clubs/dashboard/ClubDashboardHome';
import ClubAccountPage from './pages/clubs/dashboard/ClubAccountPage';
import ClubMembersPage from './pages/clubs/dashboard/ClubMembersPage';
import ClubCourtsPage from './pages/clubs/dashboard/CourtsManagement';
import ClubVenuesPage from './pages/clubs/dashboard/VenuesManagement';
import TournamentEventManagement from './pages/clubs/dashboard/Tournament/TournamentEventManagement';
import TournamentManagement from './pages/clubs/dashboard/Tournament/TournamentManagement';
import ClubTournamentManagementPage from './pages/clubs/dashboard/Tournament/ClubTournamentManagementPage';
import TournamentCreation from './pages/clubs/dashboard/Tournament/TournamentCreation';
import TournamentDetails from './pages/clubs/dashboard/Tournament/TournamentDetails';
import TournamentEdit from './pages/clubs/dashboard/Tournament/TournamentEdit';
import { ClubTournamentCreationPage } from './pages/clubs/dashboard/tournaments/CreatePage';
import { StateTournamentCreationPage } from './pages/state/dashboard/tournaments/CreatePage';
import { FederationTournamentCreationPage } from './pages/admin/dashboard/tournaments/CreatePage';

// Player Tournament Registration pages
import TournamentListPage from './pages/tournaments/TournamentListPage';
import TournamentDetailsPage from './pages/tournaments/TournamentDetailsPage';
import PlayerRegistrationFlowPage from './pages/tournaments/PlayerRegistrationFlowPage';
import PaymentPage from './pages/tournaments/PaymentPage';
import RegistrationConfirmationPage from './pages/tournaments/RegistrationConfirmationPage';
import TournamentStart from './pages/tournaments/TournamentStart';
import Validation from './pages/tournaments/Validation';
import Confirmation from './pages/tournaments/Confirmation';
import InsufficientEntries from './pages/tournaments/InsufficientEntries';

// Role-based Tournament Dashboards
import ClubTournamentDashboard from './pages/tournament/ClubTournamentDashboard';
import FederationTournamentDashboard from './pages/tournament/FederationTournamentDashboard';
import StateTournamentDashboard from './pages/tournament/StateTournamentDashboard';
import PlayerTournamentView from './pages/tournament/PlayerTournamentView';
import CoachTournamentView from './pages/tournament/CoachTournamentView';
import CoachDashboardComponent from './pages/coaches/dashboard/CoachTournamentDashboard';
import { MapPin } from 'lucide-react';
import StatesManagement from './pages/admin/dashboard/StatesManagement';

// Wrapper components for routes with parameters
const TournamentEventManagementWrapper: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  return <TournamentEventManagement tournamentId={tournamentId || ''} />;
};

const FederationTournamentEventManagementWrapper: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  return <FederationTournamentEventManagement tournamentId={tournamentId || ''} />;
};

const StateTournamentEventManagementWrapper: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  return <StateTournamentEventManagement tournamentId={tournamentId || ''} />;
};

const TournamentDetailsWrapper: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  return <TournamentDetails tournamentId={tournamentId || ''} />;
};

const TournamentEditWrapper: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  return <TournamentEdit tournamentId={tournamentId || ''} />;
};

// Player Tournament Registration Wrappers
const TournamentDetailsPageWrapper: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  return <TournamentDetailsPage tournamentId={tournamentId || ''} />;
};

const PlayerRegistrationFlowPageWrapper: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  return <PlayerRegistrationFlowPage tournamentId={tournamentId || ''} />;
};

const PaymentPageWrapper: React.FC = () => {
  const { tournamentId, registrationId } = useParams<{
    tournamentId: string;
    registrationId: string;
  }>();
  return <PaymentPage tournamentId={tournamentId || ''} registrationId={registrationId || ''} />;
};

const RegistrationConfirmationPageWrapper: React.FC = () => {
  const { tournamentId, registrationId } = useParams<{
    tournamentId: string;
    registrationId: string;
  }>();
  return (
    <RegistrationConfirmationPage
      tournamentId={tournamentId || ''}
      registrationId={registrationId || ''}
    />
  );
};

export const routes = [
  // Public routes
  {
    key: 'root',
    path: '/',
    element: <Index />,
    public: true,
  },
  {
    key: 'about_benefits',
    path: '/about/benefits',
    element: <Benefits />,
    public: true,
  },
  {
    key: 'about_board',
    path: '/about/board',
    element: <BoardOfDirectors />,
    public: true,
  },
  {
    key: 'about_who_we_are',
    path: '/about/who-we-are',
    element: <WhoWeAre />,
    public: true,
  },
  {
    key: 'about_international',
    path: '/about/international',
    element: <InternationalFederation />,
    public: true,
  },
  {
    key: 'rules',
    path: '/rules',
    element: <Rules />,
    public: true,
  },
  {
    key: 'associations',
    path: '/associations',
    element: <Association />,
    public: true,
  },
  {
    key: 'players_ranking',
    path: '/players/ranking',
    element: <Ranking />,
    public: true,
  },
  {
    key: 'players_showcase',
    path: '/players/showcase',
    element: <Showcase />,
    public: true,
  },
  {
    key: 'players_showcase_detail',
    path: '/players/showcase/:slug',
    element: <ShowcaseDetail />,
    public: true,
  },
  {
    key: 'players_categories',
    path: '/players/categories',
    element: <Categories />,
    public: true,
  },
  {
    key: 'players_search',
    path: '/players/search',
    element: <PlayerSearch />,
    public: true,
  },
  {
    key: 'training_referees',
    path: '/training/referees',
    element: <Referees />,
    public: true,
  },
  {
    key: 'federation_courts',
    path: '/federation/courts',
    element: <Courts />,
    public: true,
  },
  {
    key: 'federation_tournaments',
    path: '/federation/tournaments',
    element: <Tournaments />,
    public: true,
  },
  {
    key: 'communication_press',
    path: '/communication/press',
    element: <PressReleases />,
    public: true,
  },
  {
    key: 'partners',
    path: '/partners',
    element: <Partners />,
    public: true,
  },
  {
    key: 'login',
    path: '/login',
    element: <LoginPage />,
    public: true,
  },
  {
    key: 'register',
    path: '/register',
    element: <SelectUserTypePage />,
    public: true,
  },
  {
    key: 'register-select-type',
    path: '/register/select-type',
    element: <SelectUserTypePage />,
    public: true,
  },
  {
    key: 'register-required-fields',
    path: '/register/required-fields',
    element: <RequiredFieldsPage />,
    public: true,
  },
  {
    key: 'register-optional-fields',
    path: '/register/optional-fields',
    element: <OptionalFieldsPage />,
    public: true,
  },
  // Tournament routes
  {
    key: 'tournaments-list',
    path: '/tournaments',
    element: <TournamentListPage />,
    public: true,
  },
  {
    key: 'tournament-details',
    path: '/tournaments/:tournamentId',
    element: <TournamentDetailsPageWrapper />,
    public: true,
  },
  {
    key: 'player-registration',
    path: '/tournaments/:tournamentId/register',
    element: <PlayerRegistrationFlowPageWrapper />,
    public: false,
  },
  {
    key: 'player-payment',
    path: '/tournaments/:tournamentId/register/:registrationId/payment',
    element: <PaymentPageWrapper />,
    public: false,
  },
  {
    key: 'registration-confirmation',
    path: '/tournaments/:tournamentId/register/:registrationId/confirmation',
    element: <RegistrationConfirmationPageWrapper />,
    public: false,
  },
  {
    key: 'tournament-start',
    path: '/tournaments/:tournamentId/start',
    element: <TournamentStart />,
    public: true,
  },
  {
    key: 'validation',
    path: '/tournaments/validation',
    element: <Validation />,
    public: true,
  },
  {
    key: 'confirmation',
    path: '/tournaments/confirmation',
    element: <Confirmation />,
    public: true,
  },
  {
    key: 'insufficient-entries',
    path: '/tournaments/insufficient-entries',
    element: <InsufficientEntries />,
    public: true,
  },
  {
    key: 'admin-dashboard',
    path: '/admin/dashboard',
    element: <FederationDashboardLayout />,
    subroutes: [
      {
        key: 'dashboard-home',
        path: '/admin/dashboard/home',
        element: <DashboardHome />,
        public: false,
      },
      {
        key: 'dashboard-players',
        path: '/admin/dashboard/players',
        element: <PlayersManagement />,
        public: false,
      },
      {
        key: 'dashboard-clubs',
        path: '/admin/dashboard/venues',
        element: <ClubVenuesPage />,
        public: false,
      },
      {
        key: 'dashboard-clubs',
        path: '/admin/dashboard/clubs',
        element: <ClubsManagement />,
        public: false,
      },
      {
        key: 'dashboard-courts',
        path: '/admin/dashboard/courts',
        element: <CourtsManagement />,
        public: false,
      },
      {
        key: 'dashboard-states',
        path: '/admin/dashboard/states',
        element: <StatesManagement />,
        public: false,
      },
      {
        key: 'dashboard-court-details',
        path: '/admin/dashboard/courts/:id',
        element: <CourtDetails />,
        public: false,
      },
      {
        key: 'dashboard-messages',
        path: '/admin/dashboard/messages',
        element: <MessagesPage />,
        public: false,
      },
      {
        key: 'federation-tournaments',
        path: '/admin/dashboard/tournaments',
        element: <FederationTournamentManagementPage />,
        public: false,
      },
      {
        key: 'federation-tournament-create',
        path: '/admin/dashboard/tournaments/create',
        element: <FederationTournamentCreationPage />,
        public: false,
      },
      {
        key: 'federation-tournament-manage',
        path: '/admin/dashboard/tournaments/:tournamentId/manage',
        element: <FederationTournamentEventManagementWrapper />,
        public: false,
      },
      {
        key: 'federation-events',
        path: '/admin/dashboard/events',
        element: <FederationEventsPage />,
        public: false,
      },
      {
        key: 'federation-tournament-view',
        path: '/admin/dashboard/tournaments-view',
        element: <FederationTournamentDashboard />,
        public: false,
      },
    ],
  },
  {
    key: 'state-dashboard',
    path: '/state/dashboard',
    element: <StateDashboardLayout />,
    subroutes: [
      {
        key: 'state-dashboard-home',
        path: '/state/dashboard/home',
        element: <StateDashboardHome />,
        public: false,
      },
      {
        key: 'state-dashboard-account',
        path: '/state/dashboard/account',
        element: <StateAccountPage />,
        public: false,
      },
      {
        key: 'state-tournament-validation',
        path: '/state/dashboard/validation',
        element: <TournamentValidationPage />,
        public: false,
      },
      {
        key: 'state-tournament-management',
        path: '/state/dashboard/tournaments',
        element: <StateTournamentManagementPage />,
        public: false,
      },
      {
        key: 'state-tournament-create',
        path: '/state/dashboard/tournaments/create',
        element: <StateTournamentCreationPage />,
        public: false,
      },
      {
        key: 'state-tournament-manage',
        path: '/state/dashboard/tournaments/:tournamentId/manage',
        element: <StateTournamentEventManagementWrapper />,
        public: false,
      },
      {
        key: 'state-tournament-view',
        path: '/state/dashboard/tournaments-view',
        element: <StateTournamentDashboard />,
        public: false,
      },
      {
        key: 'state-event-validation',
        path: '/state/dashboard/events',
        element: <EventValidationPage />,
        public: false,
      },
      {
        key: 'state-players-management',
        path: '/state/dashboard/players',
        element: <StatePlayersManagement />,
        public: false,
      },
      {
        key: 'state-clubs-management',
        path: '/state/dashboard/clubs',
        element: <StateClubsManagement />,
        public: false,
      },
      {
        key: 'state-courts-management',
        path: '/state/dashboard/courts',
        element: <StateCourtsManagement />,
        public: false,
      },
    ],
  },
  {
    key: 'player-dashboard',
    path: '/players/dashboard',
    element: <PlayerDashboardLayout />,
    subroutes: [
      {
        key: 'player-dashboard-home',
        path: '/players/dashboard',
        element: <PlayerDashboardHome />,
        public: false,
      },
      {
        key: 'player-dashboard-account',
        path: '/players/dashboard/account',
        element: <PlayerAccountPage />,
        public: false,
      },
      {
        key: 'player-dashboard-credentials',
        path: '/players/dashboard/credentials',
        element: <PlayerCredentialsPage />,
        public: false,
      },
      {
        key: 'player-dashboard-clubs',
        path: '/players/dashboard/clubs',
        element: <PlayerClubsPage />,
        public: false,
      },
      {
        key: 'player-dashboard-players',
        path: '/players/dashboard/players',
        element: <PlayerSearchPage />,
        public: false,
      },
      {
        key: 'player-dashboard-tournaments',
        path: '/players/dashboard/tournaments',
        element: <PlayerTournamentsPage />,
        public: false,
      },
      {
        key: 'player-tournament-view',
        path: '/players/dashboard/tournaments-view',
        element: <PlayerTournamentView />,
        public: false,
      },
      {
        key: 'player-dashboard-messages',
        path: '/players/dashboard/messages',
        element: <PlayerMessagesPage />,
        public: false,
      },
      {
        key: 'player-dashboard-payments',
        path: '/players/dashboard/payments',
        element: <PlayerPaymentsPage />,
        public: false,
      },
      {
        key: 'player-dashboard-registrations',
        path: '/players/dashboard/registrations',
        element: <PlayerTournamentsPage />,
        public: false,
      },
      {
        key: 'player-dashboard-registration-details',
        path: '/players/dashboard/registrations/:registrationId',
        element: <PlayerTournamentsPage />,
        public: false,
      },
    ],
  },
  {
    key: 'partner-dashboard',
    path: '/partners/dashboard',
    element: <PartnerDashboardLayout />,
    subroutes: [
      {
        key: 'partner-dashboard-home',
        path: '/partners/dashboard',
        element: <PartnerDashboardHome />,
        public: false,
      },
      {
        key: 'partner-dashboard-account',
        path: '/partners/dashboard/account',
        element: <PartnerAccountPage />,
        public: false,
      },
      {
        key: 'partner-dashboard-messages',
        path: '/partners/dashboard/messages',
        element: <PartnerMessagesPage />,
        public: false,
      },
      {
        key: 'partner-dashboard-payments',
        path: '/partners/dashboard/payments',
        element: <PartnerPaymentsPage />,
        public: false,
      },
    ],
  },
  {
    key: 'coach-dashboard',
    path: '/coaches/dashboard',
    element: <CoachDashboardLayout />,
    subroutes: [
      {
        key: 'coach-dashboard-home',
        path: '/coaches/dashboard',
        element: <CoachDashboardHome />,
        public: false,
      },
      {
        key: 'coach-dashboard-account',
        path: '/coaches/dashboard/account',
        element: <CoachAccountPage />,
        public: false,
      },
      {
        key: 'coach-dashboard-credentials',
        path: '/coaches/dashboard/credentials',
        element: <CoachCredentialsPage />,
        public: false,
      },
      {
        key: 'coach-dashboard-messages',
        path: '/coaches/dashboard/messages',
        element: <CoachMessagesPage />,
        public: false,
      },
      {
        key: 'coach-dashboard-payments',
        path: '/coaches/dashboard/payments',
        element: <CoachPaymentsPage />,
        public: false,
      },
      {
        key: 'coach-tournament-view',
        path: '/coaches/dashboard/tournaments/view',
        element: <CoachTournamentView />,
        public: false,
      },
      {
        key: 'coach-tournament-dashboard',
        path: '/coaches/dashboard/tournaments/dashboard',
        element: <CoachDashboardComponent />,
        public: false,
      },
    ],
  },
  {
    key: 'partner-dashboard',
    path: '/partners/dashboard',
    element: <PartnerDashboardLayout />,
    subroutes: [
      {
        key: 'partner-dashboard-home',
        path: '/partners/dashboard',
        element: <PartnerDashboardHome />,
        public: false,
      },
      {
        key: 'partner-dashboard-account',
        path: '/partners/dashboard/account',
        element: <PartnerAccountPage />,
        public: false,
      },
      {
        key: 'partner-dashboard-messages',
        path: '/partners/dashboard/messages',
        element: <PartnerMessagesPage />,
        public: false,
      },
      {
        key: 'partner-dashboard-payments',
        path: '/partners/dashboard/payments',
        element: <PartnerPaymentsPage />,
        public: false,
      },
    ],
  },
  // 404 route
  {
    key: 'club-dashboard',
    path: '/clubs/dashboard',
    element: <ClubDashboardLayout />,
    subroutes: [
      {
        key: 'club-dashboard-home',
        path: '/clubs/dashboard',
        element: <ClubDashboardHome />,
        public: false,
      },
      {
        key: 'club-dashboard-account',
        path: '/clubs/dashboard/account',
        element: <ClubAccountPage />,
        public: false,
      },
      {
        key: 'club-dashboard-members',
        path: '/clubs/dashboard/members',
        element: <ClubMembersPage />,
        public: false,
      },
      {
        key: 'club-dashboard-courts',
        path: '/clubs/dashboard/courts',
        element: <ClubCourtsPage />,
        public: false,
      },
      {
        key: 'club-dashboard-venues',
        path: '/clubs/dashboard/venues',
        element: <ClubVenuesPage />,
        public: false,
      },
      {
        key: 'tournament-management',
        path: '/clubs/dashboard/tournaments',
        element: <ClubTournamentManagementPage />,
        public: false,
      },
      {
        key: 'tournament-create',
        path: '/clubs/dashboard/tournaments/create',
        element: <ClubTournamentCreationPage />,
        public: false,
      },
      {
        key: 'tournament-manage',
        path: '/clubs/dashboard/tournaments/:tournamentId/manage',
        element: <TournamentEventManagementWrapper />,
        public: false,
      },
      {
        key: 'tournament-details',
        path: '/clubs/dashboard/tournaments/:tournamentId',
        element: <TournamentDetailsWrapper />,
        public: false,
      },
      {
        key: 'tournament-edit',
        path: '/clubs/dashboard/tournaments/:tournamentId/edit',
        element: <TournamentEditWrapper />,
        public: false,
      },
      {
        key: 'club-tournament-view',
        path: '/clubs/dashboard/tournaments/view/:tournamentId',
        element: <ClubTournamentDashboard />,
        public: false,
      },
    ],
  },
  {
    key: '404',
    path: '*',
    element: <NotFound />,
    public: true,
  },
];

export default routes;
