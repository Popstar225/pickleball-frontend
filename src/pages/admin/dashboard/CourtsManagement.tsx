import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchCourts, updateCourt, deleteCourt } from '../../../store/slices/courtsSlice';
import CourtActionModal from './ActionModals/CourtActionModal';
import { useToast } from '@/hooks/use-toast';
import { Court } from '../../../types/api';
import {
  Search,
  Filter,
  MoreHorizontal,
  Heart,
  MapPin,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Download,
  Upload,
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
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const COURT_TYPES = {
  indoor: 'Cubierta',
  outdoor: 'Aire Libre',
  covered: 'Techada',
};

const COURT_SURFACES = {
  concrete: 'Concreto',
  asphalt: 'Asfalto',
  synthetic: 'Sintética',
  grass: 'Pasto',
  clay: 'Arcilla',
};

export default function CourtsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { courts, loading, pagination } = useSelector((state: RootState) => state.courts);

  // Modal state
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [courtTypeFilter, setCourtTypeFilter] = useState('');
  const [surfaceFilter, setSurfaceFilter] = useState('');
  const [availableFilter, setAvailableFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('');

  // Pagination
  const currentPage = pagination?.page || 1;
  const pageLimit = pagination?.limit || 10;

  // Fetch courts on mount and when pagination changes
  useEffect(() => {
    const params: any = {
      page: currentPage,
      limit: pageLimit,
    };

    if (searchTerm) params.search = searchTerm;
    if (courtTypeFilter) params.court_type = courtTypeFilter;
    if (surfaceFilter) params.surface = surfaceFilter;
    if (availableFilter !== '') params.is_available = availableFilter;
    if (clubFilter) params.club_id = clubFilter;

    console.log('🔄 Fetching courts with params:', params);
    dispatch(fetchCourts(params));
  }, [
    dispatch,
    currentPage,
    pageLimit,
    searchTerm,
    courtTypeFilter,
    surfaceFilter,
    availableFilter,
    clubFilter,
  ]);

  useEffect(() => {
    console.log('📊 Courts from Redux:', {
      loading,
      courtsCount: Array.isArray(courts) ? courts.length : 'not an array',
      courts,
      pagination,
    });
  }, [courts, loading, pagination]);

  const handleViewCourt = useCallback((court: Court) => {
    navigate(`/admin/dashboard/courts/${court.id}`);
  }, []);

  const handleEditCourt = useCallback((court: Court) => {
    setSelectedCourt(court);
    setModalMode('edit');
    setIsModalOpen(true);
  }, []);

  const handleDeleteCourt = useCallback((court: Court) => {
    setSelectedCourt(court);
    setModalMode('edit');
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedCourt(null);
    }, 300);
  }, []);

  const handleSaveSuccess = useCallback(() => {
    toast({
      title: 'Éxito',
      description: 'Cancha actualizada correctamente',
    });
    const params: any = {
      page: currentPage,
      limit: pageLimit,
    };
    if (searchTerm) params.search = searchTerm;
    if (courtTypeFilter) params.court_type = courtTypeFilter;
    if (surfaceFilter) params.surface = surfaceFilter;
    if (availableFilter !== '') params.is_available = availableFilter;
    dispatch(fetchCourts(params));
    handleModalClose();
  }, [
    dispatch,
    currentPage,
    pageLimit,
    searchTerm,
    courtTypeFilter,
    surfaceFilter,
    availableFilter,
    handleModalClose,
    toast,
  ]);

  // Get unique clubs for filtering
  const clubOptions = useMemo(() => {
    const clubs = new Map();
    if (Array.isArray(courts)) {
      courts.forEach((court) => {
        if (court.club_id && court.club_name) {
          clubs.set(court.club_id, court.club_name);
        }
      });
    }
    return Array.from(clubs.entries()).map(([id, name]) => ({ id, name }));
  }, [courts]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (pagination?.pages || 1)) {
      const params: any = {
        page: newPage,
        limit: pageLimit,
      };
      if (searchTerm) params.search = searchTerm;
      dispatch(fetchCourts(params));
    }
  };

  const getSurfaceColor = (surface?: string) => {
    const colorMap: Record<string, string> = {
      concrete: 'bg-gray-600',
      asphalt: 'bg-slate-600',
      synthetic: 'bg-blue-600',
      grass: 'bg-green-600',
      clay: 'bg-orange-600',
    };
    return colorMap[surface || ''] || 'bg-gray-600';
  };

  const getCourtTypeColor = (type?: string) => {
    const colorMap: Record<string, string> = {
      indoor: 'bg-purple-600',
      outdoor: 'bg-yellow-600',
      covered: 'bg-indigo-600',
    };
    return colorMap[type || ''] || 'bg-gray-600';
  };

  const paginationData = pagination || {
    page: currentPage,
    limit: pageLimit,
    total: 0,
    pages: 0,
  };

  const handleLimitChange = (limit: string) => {
    const params: any = {
      page: 1,
      limit: Number(limit),
    };
    if (searchTerm) params.search = searchTerm;
    if (courtTypeFilter) params.court_type = courtTypeFilter;
    if (surfaceFilter) params.surface = surfaceFilter;
    if (availableFilter !== '') params.is_available = availableFilter;
    if (clubFilter) params.club_id = clubFilter;
    dispatch(fetchCourts(params));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            Gestión de Canchas
            <Badge className="bg-primary/10 text-primary border-primary/20 text-sm">En vivo</Badge>
          </h1>
          <p className="text-slate-400">Administra todas las canchas disponibles</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params: any = { page: currentPage, limit: pageLimit };
              if (searchTerm) params.search = searchTerm;
              dispatch(fetchCourts(params));
            }}
            disabled={loading}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ChevronLeft className="h-4 w-4 mr-2 rotate-180" />
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
            <Edit className="h-4 w-4 mr-2" />
            Nueva Cancha
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Buscar canchas por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-10 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400 hover:text-white" />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm text-slate-300 block mb-2">Tipo de Cancha</label>
                <Select value={courtTypeFilter} onValueChange={setCourtTypeFilter}>
                  <SelectTrigger className="h-11 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(COURT_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="text-white">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-300 block mb-2">Superficie</label>
                <Select value={surfaceFilter} onValueChange={setSurfaceFilter}>
                  <SelectTrigger className="h-11 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(COURT_SURFACES).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="text-white">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-300 block mb-2">Disponibilidad</label>
                <Select value={availableFilter} onValueChange={setAvailableFilter}>
                  <SelectTrigger className="h-11 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="true" className="text-white">
                      Disponibles
                    </SelectItem>
                    <SelectItem value="false" className="text-white">
                      No Disponibles
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-300 block mb-2">Club</label>
                <Select value={clubFilter} onValueChange={setClubFilter}>
                  <SelectTrigger className="h-11 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {clubOptions.map((club) => (
                      <SelectItem key={club.id} value={club.id} className="text-white">
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-300 block mb-2">&nbsp;</label>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setCourtTypeFilter('');
                    setSurfaceFilter('');
                    setAvailableFilter('');
                    setClubFilter('');
                  }}
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </div>
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
          de <span className="font-semibold text-white">{paginationData.total}</span> canchas
        </p>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Mostrar:</span>
          <Select value={String(paginationData.limit)} onValueChange={handleLimitChange}>
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

      {/* Courts Table */}
      <Card className="border-slate-800 bg-slate-800/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : Array.isArray(courts) && courts.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-slate-700">
                <TableRow>
                  <TableHead className="text-slate-300">Nombre</TableHead>
                  <TableHead className="text-slate-300">Club</TableHead>
                  <TableHead className="text-slate-300">Tipo</TableHead>
                  <TableHead className="text-slate-300">Superficie</TableHead>
                  <TableHead className="text-slate-300">Tarifa/Hora</TableHead>
                  <TableHead className="text-slate-300">Disponible</TableHead>
                  <TableHead className="text-slate-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courts.map((court) => (
                  <TableRow
                    key={court.id}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <TableCell className="text-white font-medium">{court.name}</TableCell>
                    <TableCell className="text-slate-300">{court.club_name || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${getCourtTypeColor(court.court_type)} text-white capitalize`}
                      >
                        {COURT_TYPES[court.court_type as keyof typeof COURT_TYPES] ||
                          court.court_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getSurfaceColor(court.surface)} text-white capitalize`}>
                        {COURT_SURFACES[court.surface as keyof typeof COURT_SURFACES] ||
                          court.surface}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {court.hourly_rate ? `$${Number(court.hourly_rate).toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={court.is_available ? 'default' : 'secondary'}>
                        {court.is_available ? 'Disponible' : 'No disponible'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-300 hover:text-white hover:bg-slate-700"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-800 border-slate-700" align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewCourt(court)}
                            className="text-slate-300 cursor-pointer focus:bg-slate-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditCourt(court)}
                            className="text-slate-300 cursor-pointer focus:bg-slate-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCourt(court)}
                            className="text-red-400 cursor-pointer focus:bg-slate-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-400 text-lg">No se encontraron canchas</p>
              <p className="text-slate-500 text-sm">
                Intenta cambiar los filtros e intentar de nuevo
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Mostrando <span className="font-semibold">{courts.length}</span> de{' '}
            <span className="font-semibold">{pagination.total}</span> canchas
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Court Action Modal */}
      <CourtActionModal
        isOpen={isModalOpen}
        court={selectedCourt}
        mode={modalMode}
        onClose={handleModalClose}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
