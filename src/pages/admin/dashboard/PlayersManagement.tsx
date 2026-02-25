import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchAdminUsers, updateUser, deleteUser } from '../../../store/slices/usersSlice';
import UserActionModal from './ActionModals/UserActionModal';
import { useToast } from '@/hooks/use-toast';
import { User } from '../../../types/api';
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Eye,
  UserPlus,
  Download,
  Upload,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Trophy,
  Edit,
  Trash2,
  UserCheck,
  AlertCircle,
  X,
  ShieldCheck,
  Ban,
  Activity,
  Clock,
  TrendingUp,
  Users,
  Loader2,
  FileDown,
  Settings,
  Zap,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Types matching backend
type UserType = 'player' | 'coach' | 'club' | 'partner' | 'state' | 'admin';
type MembershipStatus = 'basic' | 'pro' | 'premium' | 'free' | 'premium' | 'expired';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type SortField = 'full_name' | 'email' | 'created_at' | 'user_type';
type SortOrder = 'asc' | 'desc';

export default function PlayersManagement() {
  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error, pagination } = useSelector((state: RootState) => state.users);
  const { toast } = useToast();

  // Filters
  const [search, setSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');

  // Pagination - controlled locally
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    pro: 0,
    active: 0,
  });

  // Build fetch parameters
  const buildParams = useCallback(() => {
    const params: Record<string, string> = {
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
    };

    if (search.trim()) params.search = search.trim();
    if (userTypeFilter !== 'all') params.user_type = userTypeFilter;
    if (statusFilter === 'active') params.is_active = 'true';
    if (statusFilter === 'inactive') params.is_active = 'false';
    if (verifiedFilter === 'verified') params.is_verified = 'true';
    if (verifiedFilter === 'pending') params.is_verified = 'false';
    if (membershipFilter !== 'all') params.membership_status = membershipFilter;

    return params;
  }, [
    currentPage,
    itemsPerPage,
    search,
    userTypeFilter,
    statusFilter,
    verifiedFilter,
    membershipFilter,
  ]);

  // Fetch users function
  const fetchUsers = useCallback(() => {
    const params = buildParams();
    dispatch(fetchAdminUsers(params as any));
  }, [buildParams, dispatch]);

  // Calculate stats from current users
  useEffect(() => {
    if (users && users.length > 0 && pagination) {
      setStats({
        total: pagination.total || 0,
        verified: users.filter((u: any) => u.is_verified).length,
        pending: users.filter((u: any) => !u.is_verified).length,
        pro: users.filter((u: any) => u.membership_status === 'pro').length,
        active: users.filter((u: any) => u.is_active).length,
      });
    }
  }, [users, pagination]);

  // Fetch when page or limit changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  // Debounced fetch for filters
  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset to page 1 when filters change
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, userTypeFilter, statusFilter, verifiedFilter, membershipFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-primary" />
    );
  };

  // Client-side sorting
  const sortedUsers = useMemo(() => {
    if (!users) return [];
    const sorted = [...users];
    sorted.sort((a: any, b: any) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [users, sortField, sortOrder]);

  const clearFilters = () => {
    setSearch('');
    setUserTypeFilter('all');
    setStatusFilter('all');
    setVerifiedFilter('all');
    setMembershipFilter('all');
  };

  const hasActiveFilters =
    search ||
    userTypeFilter !== 'all' ||
    statusFilter !== 'all' ||
    verifiedFilter !== 'all' ||
    membershipFilter !== 'all';

  const getUserTypeColor = (type: UserType) => {
    const colors = {
      player: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      coach: 'bg-green-500/10 text-green-400 border-green-500/30',
      club: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      partner: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      state: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      admin: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return colors[type] || 'bg-slate-700 text-slate-300';
  };

  const getMembershipColor = (status: MembershipStatus) => {
    const colors = {
      free: 'bg-slate-600/50 text-slate-300 border-slate-600',
      basic: 'bg-slate-700/50 text-slate-300 border-slate-600',
      pro: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      premium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      expired: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-slate-700 text-slate-300';
  };

  // Action Handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    // Delete confirmation is handled within the modal
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveSuccess = () => {
    toast({
      title: 'Éxito',
      description:
        modalMode === 'edit' && selectedUser
          ? `Usuario ${selectedUser.full_name} actualizado correctamente`
          : 'Operación completada',
      duration: 3000,
    });
    handleModalClose();
    // Refetch users to update the list
    fetchUsers();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleLimitChange = (limit: string) => {
    setItemsPerPage(Number(limit));
    setCurrentPage(1); // Reset to first page
  };

  // Get pagination data from Redux or use defaults
  const paginationData = pagination || {
    page: currentPage,
    limit: itemsPerPage,
    total: 0,
    pages: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
            Gestión de Usuarios
            <Badge className="bg-primary/10 text-primary border-primary/20 text-sm">
              <Zap className="h-3 w-3 mr-1" />
              En vivo
            </Badge>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Administra y supervisa todos los usuarios del sistema
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers()}
            disabled={loading}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button
            size="sm"
            className="bg-primary text-slate-900 hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, email o usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-10 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400 hover:text-white" />
                </button>
              )}
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="h-11 bg-slate-800/50 border-slate-700 text-white">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Tipo de usuario" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">
                    Todos los tipos
                  </SelectItem>
                  <SelectItem value="player" className="text-white">
                    Jugadores
                  </SelectItem>
                  <SelectItem value="coach" className="text-white">
                    Entrenadores
                  </SelectItem>
                  <SelectItem value="club" className="text-white">
                    Clubes
                  </SelectItem>
                  <SelectItem value="partner" className="text-white">
                    Socios
                  </SelectItem>
                  <SelectItem value="state" className="text-white">
                    Estados
                  </SelectItem>
                  <SelectItem value="admin" className="text-white">
                    Administrador
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger className="h-11 bg-slate-800/50 border-slate-700 text-white">
                  <UserCheck className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Verificación" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">
                    Todos
                  </SelectItem>
                  <SelectItem value="verified" className="text-white">
                    Verificados
                  </SelectItem>
                  <SelectItem value="pending" className="text-white">
                    Pendientes
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 bg-slate-800/50 border-slate-700 text-white">
                  <Activity className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">
                    Todos
                  </SelectItem>
                  <SelectItem value="active" className="text-white">
                    Activos
                  </SelectItem>
                  <SelectItem value="inactive" className="text-white">
                    Inactivos
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                <SelectTrigger className="h-11 bg-slate-800/50 border-slate-700 text-white">
                  <Trophy className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Membresía" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">
                    Todas
                  </SelectItem>
                  <SelectItem value="free" className="text-white">
                    Gratis
                  </SelectItem>
                  <SelectItem value="basic" className="text-white">
                    Básica
                  </SelectItem>
                  <SelectItem value="pro" className="text-white">
                    Pro
                  </SelectItem>
                  <SelectItem value="premium" className="text-white">
                    Premium
                  </SelectItem>
                  <SelectItem value="expired" className="text-white">
                    Expirada
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Filtros activos:</span>
                {search && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-800 text-slate-300 border-slate-700"
                  >
                    Búsqueda: {search}
                    <button onClick={() => setSearch('')} className="ml-2 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {userTypeFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-800 text-slate-300 border-slate-700"
                  >
                    Tipo: {userTypeFilter}
                    <button
                      onClick={() => setUserTypeFilter('all')}
                      className="ml-2 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {verifiedFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-800 text-slate-300 border-slate-700"
                  >
                    {verifiedFilter === 'verified' ? 'Verificados' : 'Pendientes'}
                    <button
                      onClick={() => setVerifiedFilter('all')}
                      className="ml-2 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-800 text-slate-300 border-slate-700"
                  >
                    {statusFilter === 'active' ? 'Activos' : 'Inactivos'}
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="ml-2 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {membershipFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-800 text-slate-300 border-slate-700"
                  >
                    {membershipFilter}
                    <button
                      onClick={() => setMembershipFilter('all')}
                      className="ml-2 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Limpiar todo
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-400">
          Mostrando{' '}
          <span className="font-semibold text-white">
            {paginationData.total === 0 ? 0 : (paginationData.page - 1) * paginationData.limit + 1}
          </span>{' '}
          -{' '}
          <span className="font-semibold text-white">
            {Math.min(paginationData.page * paginationData.limit, paginationData.total)}
          </span>{' '}
          de <span className="font-semibold text-white">{paginationData.total}</span> usuarios
        </p>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Mostrar:</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-20 h-9 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="5" className="text-white">
                5
              </SelectItem>
              <SelectItem value="10" className="text-white">
                10
              </SelectItem>
              <SelectItem value="20" className="text-white">
                20
              </SelectItem>
              <SelectItem value="50" className="text-white">
                50
              </SelectItem>
              <SelectItem value="100" className="text-white">
                100
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/30">
                  <TableHead className="text-slate-300 font-semibold">
                    <button
                      onClick={() => handleSort('full_name')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Usuario
                      {getSortIcon('full_name')}
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-slate-300 font-semibold">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Email
                      {getSortIcon('email')}
                    </button>
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    <button
                      onClick={() => handleSort('user_type')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Tipo
                      {getSortIcon('user_type')}
                    </button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell text-slate-300 font-semibold">
                    Membresía
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">Estado</TableHead>
                  <TableHead className="hidden xl:table-cell text-slate-300 font-semibold">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Registro
                      {getSortIcon('created_at')}
                    </button>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-slate-400">Cargando usuarios...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center">
                          <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            No se encontraron usuarios
                          </h3>
                          <p className="text-sm text-slate-400 mb-4">
                            Intenta ajustar los filtros de búsqueda
                          </p>
                          {hasActiveFilters && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearFilters}
                              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Limpiar filtros
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedUsers.map((user: any) => (
                    <TableRow
                      key={user.id}
                      className="border-slate-800 hover:bg-slate-800/30 transition-colors group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-primary/20">
                              {user.full_name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            {user.is_active && (
                              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-slate-900" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm group-hover:text-primary transition-colors">
                              {user.full_name}
                            </p>
                            <p className="text-xs text-slate-400">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Mail className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn('text-xs capitalize', getUserTypeColor(user.user_type))}
                        >
                          {user.user_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          className={cn(
                            'text-xs capitalize',
                            getMembershipColor(user.membership_status),
                          )}
                        >
                          {user.membership_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.is_verified ? (
                            <>
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                              <span className="text-xs text-slate-400 hidden xl:inline">
                                Verificado
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                              <Clock className="h-4 w-4 text-red-400" />
                              <span className="text-xs text-slate-400 hidden xl:inline">
                                Pendiente
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-slate-400">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-slate-800 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-slate-800 border-slate-700 text-white"
                          >
                            <DropdownMenuLabel className="text-slate-400 text-xs">
                              Acciones
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem
                              onClick={() => handleViewUser(user)}
                              className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" /> Ver perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                              className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              {user.is_verified ? 'Revocar verificación' : 'Verificar usuario'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">
                              <Ban className="h-4 w-4 mr-2" />
                              {user.is_active ? 'Desactivar' : 'Activar'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {paginationData.pages > 1 && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-sm text-slate-400">
            Página <span className="font-semibold text-white">{paginationData.page}</span> de{' '}
            <span className="font-semibold text-white">{paginationData.pages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={paginationData.page === 1}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            >
              Primera
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(paginationData.page - 1)}
              disabled={paginationData.page === 1}
              className="h-9 w-9 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, paginationData.pages) }, (_, i) => {
                let pageNum;
                if (paginationData.pages <= 5) {
                  pageNum = i + 1;
                } else if (paginationData.page <= 3) {
                  pageNum = i + 1;
                } else if (paginationData.page >= paginationData.pages - 2) {
                  pageNum = paginationData.pages - 4 + i;
                } else {
                  pageNum = paginationData.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={paginationData.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      'h-9 w-9',
                      paginationData.page === pageNum
                        ? 'bg-primary text-slate-900 hover:bg-primary/90 shadow-lg shadow-primary/20'
                        : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white',
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(paginationData.page + 1)}
              disabled={paginationData.page === paginationData.pages}
              className="h-9 w-9 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(paginationData.pages)}
              disabled={paginationData.page === paginationData.pages}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            >
              Última
            </Button>
          </div>
        </div>
      )}

      {/* User Action Modal */}
      <UserActionModal
        isOpen={isModalOpen}
        user={selectedUser}
        mode={modalMode}
        onClose={handleModalClose}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
