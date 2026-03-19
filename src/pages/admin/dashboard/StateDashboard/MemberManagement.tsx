import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  AlertCircle,
  X,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { AdminUsersResponse, User } from '@/types/api';

// Types
type UserRole = 'admin' | 'manager' | 'moderator' | 'member';
type MembershipStatus = 'active' | 'inactive' | 'banned';

interface Member {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  club_name?: string;
  joined_date: string;
  status: MembershipStatus;
  is_verified: boolean;
  phone?: string;
  activity_date?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type SortField = 'name' | 'email' | 'joined_date' | 'role';
type SortOrder = 'asc' | 'desc';

export default function MemberManagement() {
  // State for data
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('joined_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    managers: 0,
    active: 0,
    inactive: 0,
  });

  // Load mock data
  useEffect(() => {
    loadMembersData();
  }, []);

  const loadMembersData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all users from admin endpoint
      const response = await api.get<AdminUsersResponse>('/admin/users?limit=100&page=1');
      
      if (response?.success && Array.isArray(response.data)) {
        const generatedMembers: Member[] = response.data.map((user: User) => ({
          id: `member-${user.id}`,
          name: user.full_name || user.username,
          email: user.email,
          role: user.user_type === 'admin' ? 'admin' : user.user_type === 'state' ? 'manager' : 'member' as UserRole,
          club_name: user.business_name || undefined,
          joined_date: user.created_at || new Date().toISOString(),
          status: user.is_active ? 'active' : 'inactive' as MembershipStatus,
          is_verified: user.is_verified ?? false,
          phone: user.phone,
          activity_date: user.updated_at || new Date().toISOString(),
        }));
        setMembers(generatedMembers);
      } else {
        toast.error('Error al cargar miembros');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al cargar miembros');
      console.error('[MemberManagement]', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters
  const filteredMembers = useMemo(() => {
    let filtered = [...members];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.name?.toLowerCase().includes(searchLower) ||
          member.email?.toLowerCase().includes(searchLower) ||
          member.club_name?.toLowerCase().includes(searchLower),
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((member) => member.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((member) => member.status === statusFilter);
    }

    // Verified filter
    if (verifiedFilter === 'verified') {
      filtered = filtered.filter((member) => member.is_verified);
    } else if (verifiedFilter === 'unverified') {
      filtered = filtered.filter((member) => !member.is_verified);
    }

    return filtered;
  }, [members, search, roleFilter, statusFilter, verifiedFilter]);

  // Apply sorting
  const sortedMembers = useMemo(() => {
    const sorted = [...filteredMembers];
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
  }, [filteredMembers, sortField, sortOrder]);

  // Apply pagination
  const paginatedMembers = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return sortedMembers.slice(start, end);
  }, [sortedMembers, pagination.page, pagination.limit]);

  // Update pagination when filtered data changes
  useEffect(() => {
    const total = sortedMembers.length;
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
      admins: sortedMembers.filter((m) => m.role === 'admin').length,
      managers: sortedMembers.filter((m) => m.role === 'manager').length,
      active: sortedMembers.filter((m) => m.status === 'active').length,
      inactive: sortedMembers.filter((m) => m.status === 'inactive').length,
    });
  }, [sortedMembers, pagination.limit]);

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
    setRoleFilter('all');
    setStatusFilter('all');
    setVerifiedFilter('all');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters =
    search || roleFilter !== 'all' || statusFilter !== 'all' || verifiedFilter !== 'all';

  const getRoleColor = (role: UserRole) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-300 border-red-500/30',
      manager: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      moderator: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      member: 'bg-slate-700/50 text-slate-300 border-slate-600',
    };
    return colors[role] || 'bg-slate-700 text-slate-300';
  };

  const getStatusColor = (status: MembershipStatus) => {
    const colors = {
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      inactive: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      banned: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return colors[status] || 'bg-slate-700 text-slate-300';
  };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      admin: Shield,
      manager: UserCheck,
      moderator: UserCheck,
      member: UserX,
    };
    const Icon = icons[role];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAssignRole = async (memberId: string, newRole: UserRole) => {
    try {
      const userId = memberId.replace('member-', '');
      const roleMap = { admin: 'admin', manager: 'state', moderator: 'coach', member: 'player' };
      
      await api.put(`/admin/users/${userId}`, { 
        user_type: roleMap[newRole] 
      });
      
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
      toast.success('Rol actualizado');
      loadMembersData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al actualizar rol');
    }
  };

  const handleChangeStatus = async (memberId: string, newStatus: MembershipStatus) => {
    try {
      const userId = memberId.replace('member-', '');
      
      await api.put(`/admin/users/${userId}`, { 
        is_active: newStatus === 'active' 
      });
      
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, status: newStatus } : m)));
      toast.success('Estado actualizado');
      loadMembersData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const userId = memberId.replace('member-', '');
      
      await api.delete(`/admin/users/${userId}`);
      
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success('Miembro eliminado');
      loadMembersData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al eliminar miembro');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-700 bg-slate-900/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-200">Total Miembros</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-900/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-200">Administradores</p>
              <p className="text-3xl font-bold text-red-400">{stats.admins}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-900/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-200">Gerentes</p>
              <p className="text-3xl font-bold text-purple-400">{stats.managers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-900/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-200">Activos</p>
              <p className="text-3xl font-bold text-green-400">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-900/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-200">Inactivos</p>
              <p className="text-3xl font-bold text-amber-400">{stats.inactive}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="border-slate-700 bg-slate-900/50">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input
                placeholder="Buscar por nombre, email o club..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-300"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap lg:flex-nowrap">
              <Select
                value={roleFilter}
                onValueChange={(val) => {
                  setRoleFilter(val);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <SelectTrigger className="w-full lg:w-[140px] bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todos los Roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                  <SelectItem value="member">Miembro</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <SelectTrigger className="w-full lg:w-[140px] bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="banned">Bloqueado</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={verifiedFilter}
                onValueChange={(val) => {
                  setVerifiedFilter(val);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <SelectTrigger className="w-full lg:w-[140px] bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Verificación" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="verified">Verificado</SelectItem>
                  <SelectItem value="unverified">No Verificado</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMembersData}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-700 bg-slate-900/50">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginatedMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-200">
              <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay miembros</p>
              <p className="text-sm">Intenta ajustar los filtros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-200">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 hover:text-white transition-colors"
                      >
                        Nombre
                        {getSortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead className="text-slate-200">Email</TableHead>
                    <TableHead className="text-slate-200">Club</TableHead>
                    <TableHead className="text-slate-200">
                      <button
                        onClick={() => handleSort('role')}
                        className="flex items-center gap-2 hover:text-white transition-colors"
                      >
                        Rol
                        {getSortIcon('role')}
                      </button>
                    </TableHead>
                    <TableHead className="text-slate-200">Estado</TableHead>
                    <TableHead className="text-slate-200">
                      <button
                        onClick={() => handleSort('joined_date')}
                        className="flex items-center gap-2 hover:text-white transition-colors"
                      >
                        Fecha de Unión
                        {getSortIcon('joined_date')}
                      </button>
                    </TableHead>
                    <TableHead className="text-slate-200">Historial</TableHead>
                    <TableHead className="text-right text-slate-200">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers.map((member) => (
                    <TableRow key={member.id} className="border-slate-700 hover:bg-slate-800/30">
                      <TableCell className="font-medium text-white">{member.name}</TableCell>
                      <TableCell className="text-slate-300">{member.email}</TableCell>
                      <TableCell className="text-slate-300">{member.club_name || '-'}</TableCell>
                      <TableCell>
                        <Badge className={cn('border', getRoleColor(member.role))}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1 capitalize">{member.role}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('border', getStatusColor(member.status))}>
                          {member.status === 'active' && <UserCheck className="h-3 w-3 mr-1" />}
                          {member.status === 'inactive' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {member.status === 'banned' && <UserX className="h-3 w-3 mr-1" />}
                          {member.status === 'active'
                            ? 'Activo'
                            : member.status === 'inactive'
                              ? 'Inactivo'
                              : 'Bloqueado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex flex-col gap-1">
                          <span>{formatDate(member.joined_date)}</span>
                          {member.activity_date && (
                            <span className="text-xs text-slate-300">
                              Última actividad: {formatDate(member.activity_date)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-200 hover:text-white hover:bg-slate-700/50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-200 hover:text-white hover:bg-slate-700/50"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 bg-slate-800 border-slate-700"
                          >
                            <DropdownMenuLabel className="text-white">Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-700" />

                            {/* Assign Role */}
                            <DropdownMenuLabel className="text-xs text-slate-200 font-normal px-2 py-1.5">
                              Asignar Rol
                            </DropdownMenuLabel>
                            {(['admin', 'manager', 'moderator'] as UserRole[]).map((role) => (
                              <DropdownMenuItem
                                key={role}
                                onClick={() => handleAssignRole(member.id, role)}
                                className="text-slate-300 hover:text-white hover:bg-slate-700/50 cursor-pointer"
                              >
                                <span className="capitalize">{role}</span>
                              </DropdownMenuItem>
                            ))}

                            <DropdownMenuSeparator className="bg-slate-700" />

                            {/* Change Status */}
                            <DropdownMenuLabel className="text-xs text-slate-200 font-normal px-2 py-1.5">
                              Cambiar Estado
                            </DropdownMenuLabel>
                            {(['active', 'inactive', 'banned'] as MembershipStatus[]).map(
                              (status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() => handleChangeStatus(member.id, status)}
                                  className="text-slate-300 hover:text-white hover:bg-slate-700/50 cursor-pointer"
                                >
                                  <span className="capitalize">
                                    {status === 'active'
                                      ? 'Activar'
                                      : status === 'inactive'
                                        ? 'Desactivar'
                                        : 'Bloquear'}
                                  </span>
                                </DropdownMenuItem>
                              ),
                            )}

                            <DropdownMenuSeparator className="bg-slate-700" />

                            <DropdownMenuItem
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar Miembro
                            </DropdownMenuItem>
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

      {/* Pagination */}
      {pagination.pages > 1 && !loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-200">
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
