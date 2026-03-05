import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Search,
  Filter,
  X,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppDispatch, RootState } from '@/store';
import { fetchAdminUsers, updateUser, deleteUser } from '@/store/slices/usersSlice';
import UserActionModal from '@/pages/admin/dashboard/ActionModals/UserActionModal';

const userTypeCfg: { [key: string]: { label: string; color: string } } = {
  player: { label: 'Jugador', color: '#3b82f6' },
  coach: { label: 'Entrenador', color: '#8b5cf6' },
  club: { label: 'Club', color: '#10b981' },
  partner: { label: 'Socio', color: '#f59e0b' },
};

const membershipCfg: { [key: string]: { label: string; color: string } } = {
  free: { label: 'Gratis', color: '#6b7280' },
  basic: { label: 'Básico', color: '#0ea5e9' },
  pro: { label: 'Pro', color: '#f59e0b' },
  premium: { label: 'Premium', color: '#ec4899' },
  expired: { label: 'Expirado', color: '#ef4444' },
};

const TypeBadge = ({ type }: { type: string }) => {
  const config = userTypeCfg[type] || { label: type, color: '#ffffff' };
  return (
    <Badge
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      {config.label}
    </Badge>
  );
};

const MemberBadge = ({ membership }: { membership: string }) => {
  const config = membershipCfg[membership] || { label: membership, color: '#ffffff' };
  return (
    <Badge
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      {config.label}
    </Badge>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  return status === 'active' ? (
    <Badge className="gap-1 bg-green-500/10 text-green-400 border-green-500/20">
      <CheckCircle2 className="w-3 h-3" />
      Activo
    </Badge>
  ) : (
    <Badge className="gap-1 bg-red-500/10 text-red-400 border-red-500/20">
      <AlertCircle className="w-3 h-3" />
      Inactivo
    </Badge>
  );
};

const FilterChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <Badge
    className="gap-2 bg-[#ace600]/10 text-[#ace600] border-[#ace600]/20 cursor-pointer"
    onClick={onRemove}
  >
    {label}
    <X className="w-3 h-3" />
  </Badge>
);

export default function StatePlayersManagement() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, pagination } = useSelector((state: RootState) => state.users);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    user_type: 'all',
    is_active: 'all',
    is_verified: 'all',
    membership_status: 'all',
  });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    const params: any = {
      page,
      limit,
      state: currentUser?.state,
    };

    if (search) params.search = search;
    if (filters.user_type !== 'all') params.user_type = filters.user_type;
    if (filters.is_active !== 'all') params.is_active = filters.is_active === 'true';
    if (filters.is_verified !== 'all') params.is_verified = filters.is_verified === 'true';
    if (filters.membership_status !== 'all') params.membership_status = filters.membership_status;

    // Exclude state and admin users - only show players, coaches, clubs, partners
    params.user_type_not = ['state', 'admin'];

    dispatch(fetchAdminUsers(params));
  }, [dispatch, page, limit, search, filters, currentUser?.state]);

  const handleClearFilters = () => {
    setSearch('');
    setFilters({
      user_type: 'all',
      is_active: 'all',
      is_verified: 'all',
      membership_status: 'all',
    });
    setPage(1);
  };

  const openUserModal = (user: any, mode: 'view' | 'edit' = 'view') => {
    setSelectedUser(user);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo eliminar el usuario',
        variant: 'destructive',
      });
    }
  };

  const activeCount = users?.filter((u: any) => u.is_active)?.length || 0;
  const verifiedCount = users?.filter((u: any) => u.is_verified)?.length || 0;
  const proCount = users?.filter((u: any) => u.membership_status === 'pro')?.length || 0;

  const hasActiveFilters =
    search ||
    filters.user_type !== 'all' ||
    filters.is_active !== 'all' ||
    filters.is_verified !== 'all' ||
    filters.membership_status !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-[#ace600]" />
          Gestión de Jugadores
        </h1>
        <p className="text-sm text-white/35 mt-1">Administra los jugadores en tu estado</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0d1117] border-white/[0.07]">
          <CardContent className="pt-6">
            <div className="text-sm text-white/50 mb-1">Total de Jugadores</div>
            <div className="text-2xl font-bold text-white">{pagination?.total || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0d1117] border-white/[0.07]">
          <CardContent className="pt-6">
            <div className="text-sm text-white/50 mb-1">Activos</div>
            <div className="text-2xl font-bold text-[#ace600]">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0d1117] border-white/[0.07]">
          <CardContent className="pt-6">
            <div className="text-sm text-white/50 mb-1">Verificados</div>
            <div className="text-2xl font-bold text-blue-400">{verifiedCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0d1117] border-white/[0.07]">
          <CardContent className="pt-6">
            <div className="text-sm text-white/50 mb-1">Plan Pro</div>
            <div className="text-2xl font-bold text-yellow-400">{proCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0d1117] border-white/[0.07]">
        <CardHeader>
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                placeholder="Buscar jugador..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20"
              />
            </div>
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                size="sm"
                variant="outline"
                className="border-white/[0.08] text-white/50 hover:text-white"
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select
              value={filters.user_type}
              onValueChange={(v) => setFilters({ ...filters, user_type: v })}
            >
              <SelectTrigger className="h-10 rounded-xl bg-white/[0.04] border-white/[0.08] text-white">
                <SelectValue placeholder="Tipo de usuario" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1117] border-white/[0.08]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="player">Jugador</SelectItem>
                <SelectItem value="coach">Entrenador</SelectItem>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="partner">Socio</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.is_verified}
              onValueChange={(v) => setFilters({ ...filters, is_verified: v })}
            >
              <SelectTrigger className="h-10 rounded-xl bg-white/[0.04] border-white/[0.08] text-white">
                <SelectValue placeholder="Verificación" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1117] border-white/[0.08]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Verificado</SelectItem>
                <SelectItem value="false">Pendiente</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.is_active}
              onValueChange={(v) => setFilters({ ...filters, is_active: v })}
            >
              <SelectTrigger className="h-10 rounded-xl bg-white/[0.04] border-white/[0.08] text-white">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1117] border-white/[0.08]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.membership_status}
              onValueChange={(v) => setFilters({ ...filters, membership_status: v })}
            >
              <SelectTrigger className="h-10 rounded-xl bg-white/[0.04] border-white/[0.08] text-white">
                <SelectValue placeholder="Membresía" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1117] border-white/[0.08]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="free">Gratis</SelectItem>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2">
              {search && (
                <FilterChip label={`Búsqueda: ${search}`} onRemove={() => setSearch('')} />
              )}
              {filters.user_type !== 'all' && (
                <FilterChip
                  label={`Tipo: ${filters.user_type}`}
                  onRemove={() => setFilters({ ...filters, user_type: 'all' })}
                />
              )}
              {filters.is_verified !== 'all' && (
                <FilterChip
                  label={`Verificado: ${filters.is_verified}`}
                  onRemove={() => setFilters({ ...filters, is_verified: 'all' })}
                />
              )}
              {filters.is_active !== 'all' && (
                <FilterChip
                  label={`Estado: ${filters.is_active}`}
                  onRemove={() => setFilters({ ...filters, is_active: 'all' })}
                />
              )}
              {filters.membership_status !== 'all' && (
                <FilterChip
                  label={`Membresía: ${filters.membership_status}`}
                  onRemove={() => setFilters({ ...filters, membership_status: 'all' })}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="bg-[#0d1117] border-white/[0.07]">
        <CardHeader>
          <CardTitle className="text-sm text-white">
            Resultados ({pagination?.total || 0} jugadores)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 text-[#ace600] animate-spin" />
            </div>
          ) : users && users.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.07]">
                      <th className="text-left py-3 px-4 text-white/50 font-medium">Jugador</th>
                      <th className="text-left py-3 px-4 text-white/50 font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-white/50 font-medium">Tipo</th>
                      <th className="text-left py-3 px-4 text-white/50 font-medium">Membresía</th>
                      <th className="text-left py-3 px-4 text-white/50 font-medium">Estado</th>
                      <th className="text-left py-3 px-4 text-white/50 font-medium">Registro</th>
                      <th className="text-left py-3 px-4 text-white/50 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr
                        key={user.id}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-4 text-white font-medium">{user.name}</td>
                        <td className="py-3 px-4 text-white/60 text-xs">{user.email}</td>
                        <td className="py-3 px-4">
                          <TypeBadge type={user.user_type} />
                        </td>
                        <td className="py-3 px-4">
                          <MemberBadge membership={user.membership_status || 'free'} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                        </td>
                        <td className="py-3 px-4 text-white/60 text-xs">
                          {new Date(user.created_at).toLocaleDateString('es-MX')}
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-[#0d1117] border-white/[0.08]"
                            >
                              <DropdownMenuItem
                                onClick={() => openUserModal(user, 'view')}
                                className="text-white/70 cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openUserModal(user, 'edit')}
                                className="text-white/70 cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-400 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.07]">
                <div className="text-sm text-white/50">
                  Página {page} de {Math.ceil((pagination?.total || 0) / limit)}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="border-white/[0.08]"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-white/[0.08]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({
                    length: Math.min(5, Math.ceil((pagination?.total || 0) / limit)),
                  }).map((_, i) => {
                    const pageNum = Math.max(1, page - 2) + i;
                    if (pageNum > Math.ceil((pagination?.total || 0) / limit)) return null;
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={page === pageNum ? 'default' : 'outline'}
                        onClick={() => setPage(pageNum)}
                        className={
                          page === pageNum ? 'bg-[#ace600] text-black' : 'border-white/[0.08]'
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setPage((p) => Math.min(Math.ceil((pagination?.total || 0) / limit), p + 1))
                    }
                    disabled={page >= Math.ceil((pagination?.total || 0) / limit)}
                    className="border-white/[0.08]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(Math.ceil((pagination?.total || 0) / limit))}
                    disabled={page >= Math.ceil((pagination?.total || 0) / limit)}
                    className="border-white/[0.08]"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
                <Select
                  value={limit.toString()}
                  onValueChange={(v) => {
                    setLimit(parseInt(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-24 h-8 text-xs bg-white/[0.04] border-white/[0.08]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1117] border-white/[0.08]">
                    <SelectItem value="5">5 por página</SelectItem>
                    <SelectItem value="10">10 por página</SelectItem>
                    <SelectItem value="25">25 por página</SelectItem>
                    <SelectItem value="50">50 por página</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-white/50">No se encontraron jugadores</div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {selectedUser && (
        <UserActionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          mode={modalMode}
          onSaveSuccess={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
            dispatch(
              fetchAdminUsers({
                page,
                limit,
                state: currentUser?.state,
              }),
            );
          }}
        />
      )}
    </div>
  );
}
