import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';

// Redux imports
import { AppDispatch, RootState } from '@/store';
import {
  fetchTournaments,
  updateTournament,
  deleteTournament,
  updateTournamentStatus,
} from '@/store/slices/tournamentsSlice';

// Components
import TournamentCreation from './TournamentCreation';

// Types
import type { Tournament, TournamentsQueryParams } from '@/types/api';

const TournamentManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { tournaments, loading, error } = useSelector((state: RootState) => state.tournaments);
  const { user } = useSelector((state: RootState) => state.auth);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'draft' | 'published' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled'
  >('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'local' | 'state' | 'national'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load tournaments on mount
  useEffect(() => {
    loadTournaments();
  }, [statusFilter, typeFilter]);

  // Load tournaments with filters
  const loadTournaments = () => {
    const params: TournamentsQueryParams = {
      page: 1,
      limit: 50,
    };

    if (statusFilter !== 'all') {
      params.status = statusFilter as any;
    }

    if (typeFilter !== 'all') {
      params.tournament_type = typeFilter;
    }

    dispatch(fetchTournaments(params));
  };

  // Filter tournaments by search term
  const filteredTournaments = tournaments.filter(
    (tournament) =>
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.venue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.city.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Get tournament status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      published: { variant: 'default' as const, label: 'Published' },
      ongoing: { variant: 'default' as const, label: 'Ongoing' },
      completed: { variant: 'secondary' as const, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Get tournament type badge
  const getTypeBadge = (type: string) => {
    const typeConfig = {
      local: { variant: 'outline' as const, label: 'Local' },
      state: { variant: 'outline' as const, label: 'State' },
      national: { variant: 'outline' as const, label: 'National' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.local;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Handle tournament creation
  const handleTournamentCreated = (tournamentId: string) => {
    setShowCreateDialog(false);
    loadTournaments();
    // Navigate to the new tournament's management page
    navigate(`/tournaments/${tournamentId}/manage`);
  };

  // Handle delete tournament
  const handleDeleteTournament = async () => {
    if (!selectedTournament) return;

    try {
      await dispatch(deleteTournament(selectedTournament.id)).unwrap();
      setShowDeleteDialog(false);
      setSelectedTournament(null);
      loadTournaments();
    } catch (error) {
      console.error('Failed to delete tournament:', error);
    }
  };

  // Handle update tournament status
  const handleUpdateStatus = async (tournamentId: string, newStatus: string) => {
    try {
      await dispatch(updateTournamentStatus({ id: tournamentId, status: newStatus })).unwrap();
      setSelectedTournament(null);
      loadTournaments();
    } catch (error) {
      console.error('Failed to update tournament status:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if user can manage tournament
  const canManageTournament = (tournament: Tournament) => {
    // Admin can manage all tournaments
    if (user?.user_type === 'admin') return true;

    // State can manage their own tournaments and local tournaments in their state
    if (user?.user_type === 'state') {
      return tournament.organizer_type === 'state' || tournament.tournament_type === 'local';
    }

    // Club can only manage their own tournaments
    if (user?.user_type === 'club') {
      return tournament.organizer_type === 'club';
    }

    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tournament Management</h1>
          <p className="text-gray-400">Create and manage your tournaments</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#ace600] hover:bg-[#9bc500] text-black">
              <Plus className="w-4 h-4 mr-2" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111827] border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Tournament</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new tournament. Events will be created within this tournament.
              </DialogDescription>
            </DialogHeader>
            <TournamentCreation onTournamentCreated={handleTournamentCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-[#111827] border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tournaments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#111827] border-white/10 text-white"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48 bg-[#111827] border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#111827] border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-full sm:w-48 bg-[#111827] border-white/10 text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-[#111827] border-white/10">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="state">State</SelectItem>
                <SelectItem value="national">National</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tournaments Table */}
      <Card className="bg-[#111827] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Your Tournaments</CardTitle>
          <CardDescription className="text-gray-400">
            {filteredTournaments.length} tournament{filteredTournaments.length !== 1 ? 's' : ''}{' '}
            found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ace600]"></div>
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No tournaments found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Create your first tournament to get started.'}
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-[#ace600] hover:bg-[#9bc500] text-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tournament
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white">Tournament</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Dates</TableHead>
                    <TableHead className="text-white">Venue</TableHead>
                    <TableHead className="text-white">Participants</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTournaments.map((tournament) => (
                    <TableRow key={tournament.id} className="border-white/10">
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{tournament.name}</div>
                          <div className="text-sm text-gray-400">{tournament.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(tournament.tournament_type)}</TableCell>
                      <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-white">
                            {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                          </div>
                          <div className="text-gray-400">
                            Reg: {formatDate(tournament.registration_deadline)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-white">{tournament.venue_name}</div>
                          <div className="text-gray-400">
                            {tournament.city}, {tournament.state}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-white">
                            {tournament.current_participants || 0} / {tournament.max_participants}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#111827] border-white/10">
                            <DropdownMenuItem
                              onClick={() => navigate(`/clubs/dashboard/tournaments/${tournament.id}`)}
                              className="text-white hover:bg-white/10"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/clubs/dashboard/tournaments/${tournament.id}/manage`)}
                              className="text-white hover:bg-white/10"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Manage Events
                            </DropdownMenuItem>
                            {canManageTournament(tournament) && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/clubs/dashboard/tournaments/${tournament.id}/edit`)}
                                  className="text-white hover:bg-white/10"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Tournament
                                </DropdownMenuItem>
                                {tournament.status === 'draft' && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(tournament.id, 'published')}
                                    className="text-white hover:bg-white/10"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Publish
                                  </DropdownMenuItem>
                                )}
                                {tournament.status === 'published' && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(tournament.id, 'cancelled')}
                                    className="text-white hover:bg-white/10"
                                  >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTournament(tournament);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="text-red-400 hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#111827] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Tournament</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{selectedTournament?.name}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button onClick={handleDeleteTournament} variant="destructive" className="flex-1">
              Delete
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentManagement;
