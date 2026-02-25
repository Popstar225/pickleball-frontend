import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Eye,
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
  Edit,
  Trash2,
  AlertCircle,
  X,
  ShieldCheck,
  Ban,
  Users,
  Loader2,
  Building2,
  Phone,
  Globe,
  Award,
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
import { mockClubs } from './../../../data/dashboardMockData';

// Types
type MembershipStatus = 'basic' | 'pro' | 'premium';

interface Club {
  id: string;
  business_name: string;
  contact_person?: string;
  email: string;
  phone?: string;
  state?: string;
  city?: string;
  address?: string;
  website?: string;
  membership_status: MembershipStatus;
  is_verified: boolean;
  is_active: boolean;
  member_count?: number;
  created_at: string;
  updated_at?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type SortField = 'business_name' | 'email' | 'created_at' | 'state';
type SortOrder = 'asc' | 'desc';

export default function ClubsManagement() {
  // State for data
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    premium: 0,
    active: 0,
  });

  // Load mock data
  useEffect(() => {
    loadClubsData();
  }, []);

  const loadClubsData = useCallback(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const processedClubs = mockClubs.map((club: any) => ({
        id: club.id,
        business_name: club.business_name || club.full_name || club.username || '',
        contact_person: club.contact_person || club.full_name,
        email: club.email,
        phone: club.phone,
        state: club.state,
        city: club.city,
        address: club.address,
        website: club.website,
        membership_status: club.membership_status || 'basic',
        is_verified: club.is_verified !== false,
        is_active: club.is_verified !== false,
        member_count: club.member_count,
        created_at: club.created_at || new Date().toISOString(),
        updated_at: club.updated_at,
      })) as Club[];
      setClubs(processedClubs);
      setLoading(false);
    }, 300);
  }, []);

  // Apply filters
  const filteredClubs = useMemo(() => {
    let filtered = [...clubs];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (club) =>
          club.business_name?.toLowerCase().includes(searchLower) ||
          club.contact_person?.toLowerCase().includes(searchLower) ||
          club.email?.toLowerCase().includes(searchLower) ||
          club.state?.toLowerCase().includes(searchLower),
      );
    }

    // State filter
    if (stateFilter !== 'all') {
      filtered = filtered.filter((club) => club.state === stateFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((club) => club.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((club) => !club.is_active);
    }

    // Verified filter
    if (verifiedFilter === 'verified') {
      filtered = filtered.filter((club) => club.is_verified);
    } else if (verifiedFilter === 'pending') {
      filtered = filtered.filter((club) => !club.is_verified);
    }

    // Membership filter
    if (membershipFilter !== 'all') {
      filtered = filtered.filter((club) => club.membership_status === membershipFilter);
    }

    return filtered;
  }, [clubs, search, stateFilter, statusFilter, verifiedFilter, membershipFilter]);

  // Apply sorting
  const sortedClubs = useMemo(() => {
    const sorted = [...filteredClubs];
    sorted.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredClubs, sortField, sortOrder]);

  // Apply pagination
  const paginatedClubs = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return sortedClubs.slice(start, end);
  }, [sortedClubs, pagination.page, pagination.limit]);

  // Update pagination when filtered data changes
  useEffect(() => {
    const total = sortedClubs.length;
    const pages = Math.ceil(total / pagination.limit);
    setPagination((prev) => ({
      ...prev,
      total,
      pages,
      page: Math.min(prev.page, Math.max(1, pages)),
    }));

    // Calculate stats
    setStats({
      total,
      verified: sortedClubs.filter((c) => c.is_verified).length,
      pending: sortedClubs.filter((c) => !c.is_verified).length,
      premium: sortedClubs.filter((c) => c.membership_status === 'premium').length,
      active: sortedClubs.filter((c) => c.is_active).length,
    });
  }, [sortedClubs, pagination.limit]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  const clearFilters = () => {
    setSearch('');
    setStateFilter('all');
    setStatusFilter('all');
    setVerifiedFilter('all');
    setMembershipFilter('all');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters =
    search ||
    stateFilter !== 'all' ||
    statusFilter !== 'all' ||
    verifiedFilter !== 'all' ||
    membershipFilter !== 'all';

  const getMembershipColor = (status: MembershipStatus) => {
    const colors = {
      basic: 'bg-slate-700/50 text-slate-300 border-slate-600',
      pro: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      premium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };
    return colors[status] || 'bg-slate-700 text-slate-300';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get unique states for filter
  const uniqueStates = useMemo(() => {
    const states = clubs.map((c) => c.state).filter(Boolean);
    return Array.from(new Set(states)).sort();
  }, [clubs]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2
              className="text-3xl font-bold tracking-wide text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Gestión de Clubes
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-400">En vivo</span>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Administra y supervisa todos los clubes del sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadClubsData}
            disabled={loading}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
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
            className="bg-primary hover:bg-primary/90 text-slate-900 font-semibold shadow-lg shadow-primary/20"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Nuevo Club
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              placeholder="Buscar por nombre, contacto, email o estado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-10 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Todos los estados" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {uniqueStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Todos" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="verified">Verificados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Todos" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={membershipFilter} onValueChange={setMembershipFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Todas" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="basic">Básica</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700">
              <span className="text-xs text-slate-400 font-medium">Filtros activos:</span>
              {search && (
                <Badge
                  variant="secondary"
                  className="bg-slate-700/50 text-slate-300 hover:bg-slate-700 pl-2 pr-1"
                >
                  Búsqueda: {search}
                  <button onClick={() => setSearch('')} className="ml-2 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {stateFilter !== 'all' && (
                <Badge
                  variant="secondary"
                  className="bg-slate-700/50 text-slate-300 hover:bg-slate-700 pl-2 pr-1"
                >
                  Estado: {stateFilter}
                  <button onClick={() => setStateFilter('all')} className="ml-2 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {verifiedFilter !== 'all' && (
                <Badge
                  variant="secondary"
                  className="bg-slate-700/50 text-slate-300 hover:bg-slate-700 pl-2 pr-1"
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
                  className="bg-slate-700/50 text-slate-300 hover:bg-slate-700 pl-2 pr-1"
                >
                  {statusFilter === 'active' ? 'Activos' : 'Inactivos'}
                  <button onClick={() => setStatusFilter('all')} className="ml-2 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {membershipFilter !== 'all' && (
                <Badge
                  variant="secondary"
                  className="bg-slate-700/50 text-slate-300 hover:bg-slate-700 pl-2 pr-1"
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
                className="h-7 text-xs text-slate-400 hover:text-white"
              >
                Limpiar todo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-400">
          Mostrando{' '}
          <span className="text-white font-medium">
            {(pagination.page - 1) * pagination.limit + 1}
          </span>{' '}
          -{' '}
          <span className="text-white font-medium">
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{' '}
          de <span className="text-white font-medium">{pagination.total}</span> clubes
        </p>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Mostrar:</span>
          <Select
            value={pagination.limit.toString()}
            onValueChange={(v) => setPagination((prev) => ({ ...prev, limit: Number(v), page: 1 }))}
          >
            <SelectTrigger className="h-9 w-20 bg-slate-800/50 border-slate-700 text-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">
                    <button
                      onClick={() => handleSort('business_name')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Club
                      {getSortIcon('business_name')}
                    </button>
                  </TableHead>
                  <TableHead className="text-slate-400">Contacto</TableHead>
                  <TableHead className="text-slate-400">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Email
                      {getSortIcon('email')}
                    </button>
                  </TableHead>
                  <TableHead className="text-slate-400">
                    <button
                      onClick={() => handleSort('state')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Estado
                      {getSortIcon('state')}
                    </button>
                  </TableHead>
                  <TableHead className="text-slate-400">Membresía</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                  <TableHead className="text-slate-400">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Registro
                      {getSortIcon('created_at')}
                    </button>
                  </TableHead>
                  <TableHead className="text-slate-400 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-slate-400 text-sm">Cargando clubes...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedClubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Building2 className="h-12 w-12 text-slate-600" />
                        <div className="text-center">
                          <p className="text-slate-300 font-medium mb-1">
                            No se encontraron clubes
                          </p>
                          <p className="text-slate-500 text-sm">
                            Intenta ajustar los filtros de búsqueda
                          </p>
                        </div>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="mt-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            Limpiar filtros
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClubs.map((club, index) => (
                    <TableRow
                      key={club.id}
                      className="border-slate-700 hover:bg-slate-800/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                {club.business_name
                                  ?.split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </span>
                            </div>
                            {club.is_active && (
                              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-slate-900 rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{club.business_name}</p>
                            <p className="text-xs text-slate-500">
                              {club.city && `${club.city}, `}
                              {club.state}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-slate-300">{club.contact_person || '-'}</p>
                          {club.phone && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" />
                              {club.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-300">{club.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-300">{club.state || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            'border text-xs font-medium',
                            getMembershipColor(club.membership_status),
                          )}
                        >
                          {club.membership_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {club.is_verified ? (
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            </div>
                            <span className="text-xs text-green-400 font-medium">Verificado</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center">
                              <XCircle className="h-4 w-4 text-orange-400" />
                            </div>
                            <span className="text-xs text-orange-400 font-medium">Pendiente</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-400">
                          {formatDate(club.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-800 border-slate-700"
                          >
                            <DropdownMenuLabel className="text-slate-400">
                              Acciones
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-white">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-white">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-white">
                              {club.is_verified ? (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Revocar verificación
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-4 w-4 mr-2" />
                                  Verificar club
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-white">
                              {club.is_active ? (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
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
      {pagination.pages > 1 && !loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Página <span className="text-white font-medium">{pagination.page}</span> de{' '}
            <span className="text-white font-medium">{pagination.pages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            >
              Primera
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="h-9 w-9 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <Button
                    key={i}
                    variant="outline"
                    size="icon"
                    onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                    className={cn(
                      'h-9 w-9',
                      pagination.page === pageNum
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
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="h-9 w-9 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.pages }))}
              disabled={pagination.page === pagination.pages}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            >
              Última
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
