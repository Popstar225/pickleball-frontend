import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCourts, deleteCourt } from '@/store/slices/courtsSlice';
import type { Court } from '../../../types/api';
import CourtActionModal from './ActionModals/CourtActionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ACCENT = '#ace600';

export default function ClubsCourtManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { courts, loading, error } = useSelector((state: RootState) => state.courts);
  const user = useSelector((state: RootState) => state.auth.user);

  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterSurface, setFilterSurface] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(
      fetchCourts({
        search: searchTerm || undefined,
        court_type: (filterType || undefined) as 'indoor' | 'outdoor' | 'covered' | undefined,
        surface: (filterSurface || undefined) as
          | 'concrete'
          | 'asphalt'
          | 'synthetic'
          | 'grass'
          | 'clay'
          | undefined,
        page: currentPage,
        limit: itemsPerPage,
      }) as any,
    );
  }, [dispatch, searchTerm, filterType, filterSurface, currentPage]);

  const handleEditCourt = (court: Court) => {
    setSelectedCourt(court);
    setIsModalOpen(true);
  };

  const handleCreateCourt = () => {
    setSelectedCourt(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourt(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    dispatch(
      fetchCourts({
        search: searchTerm || undefined,
        court_type: (filterType || undefined) as 'indoor' | 'outdoor' | 'covered' | undefined,
        surface: (filterSurface || undefined) as
          | 'concrete'
          | 'asphalt'
          | 'synthetic'
          | 'grass'
          | 'clay'
          | undefined,
        page: currentPage,
        limit: itemsPerPage,
      }) as any,
    );
  };

  const handleDelete = async (courtId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cancha?')) {
      try {
        await dispatch(deleteCourt(courtId));
        toast.success('Cancha eliminada exitosamente');
        dispatch(
          fetchCourts({
            search: searchTerm || undefined,
            court_type: (filterType || undefined) as 'indoor' | 'outdoor' | 'covered' | undefined,
            surface: (filterSurface || undefined) as
              | 'concrete'
              | 'asphalt'
              | 'synthetic'
              | 'grass'
              | 'clay'
              | undefined,
            page: currentPage,
            limit: itemsPerPage,
          }) as any,
        );
      } catch (err) {
        toast.error('Error al eliminar la cancha');
      }
    }
  };

  const filteredCourts = Array.isArray(courts)
    ? courts.filter((court) => {
        const matchesSearch =
          !searchTerm ||
          court.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          court.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = !filterType || court.court_type === filterType;
        const matchesSurface = !filterSurface || court.surface === filterSurface;

        return matchesSearch && matchesType && matchesSurface;
      })
    : [];

  const totalPages = Math.ceil(filteredCourts.length / itemsPerPage);
  const displayedCourts = filteredCourts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-[#080c14] text-[#f0f4ff] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gestión de Canchas</h1>
            <p className="text-[#4a5a72]">Administra las canchas de pickleball de tu club</p>
          </div>
          <Button
            onClick={handleCreateCourt}
            className="bg-[#ace600] text-black hover:bg-[#d4f000]"
          >
            <Plus size={18} className="mr-2" />
            Nueva Cancha
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-red-500 font-semibold">Error</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
          <Input
            placeholder="Buscar canchas..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111827] border-white/10 text-[#f0f4ff] placeholder:text-white/20 focus-visible:border-[#ace600] focus-visible:ring-[#ace600]"
          />

          <Select
            value={filterType}
            onValueChange={(value) => {
              setFilterType(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="bg-[#111827] border-white/10 text-[#f0f4ff]">
              <SelectValue placeholder="Tipo de cancha" />
            </SelectTrigger>
            <SelectContent className="bg-[#111827] text-white border-white/10">
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="indoor">Cubierta</SelectItem>
              <SelectItem value="outdoor">Abierta</SelectItem>
              <SelectItem value="covered">Techada</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterSurface}
            onValueChange={(value) => {
              setFilterSurface(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="bg-[#111827] border-white/10 text-[#f0f4ff]">
              <SelectValue placeholder="Superficie" />
            </SelectTrigger>
            <SelectContent className="bg-[#111827] text-white border-white/10">
              <SelectItem value="all">Todas las superficies</SelectItem>
              <SelectItem value="concrete">Concreto</SelectItem>
              <SelectItem value="asphalt">Asfalto</SelectItem>
              <SelectItem value="synthetic">Sintético</SelectItem>
              <SelectItem value="grass">Pasto</SelectItem>
              <SelectItem value="clay">Arcilla</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#111827] border border-white/10 rounded-lg p-4">
            <div className="text-sm text-[#4a5a72] mb-1">Total</div>
            <div className="text-2xl font-bold" style={{ color: ACCENT }}>
              {filteredCourts.length}
            </div>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-lg p-4">
            <div className="text-sm text-[#4a5a72] mb-1">Disponibles</div>
            <div className="text-2xl font-bold" style={{ color: ACCENT }}>
              {filteredCourts.filter((c) => c.is_available).length}
            </div>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-lg p-4">
            <div className="text-sm text-[#4a5a72] mb-1">En Mantenimiento</div>
            <div className="text-2xl font-bold" style={{ color: ACCENT }}>
              {filteredCourts.filter((c) => c.is_maintenance).length}
            </div>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-lg p-4">
            <div className="text-sm text-[#4a5a72] mb-1">Rating Promedio</div>
            <div className="text-2xl font-bold" style={{ color: ACCENT }}>
              {filteredCourts.length > 0
                ? (
                    filteredCourts.reduce(
                      (sum, c) =>
                        sum + (typeof c.average_rating === 'number' ? c.average_rating : 0),
                      0,
                    ) / filteredCourts.length
                  ).toFixed(1)
                : '—'}
            </div>
          </div>
        </div>

        {/* Courts Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin mb-3" style={{ color: ACCENT }} />
            <p className="text-[#4a5a72]">Cargando canchas...</p>
          </div>
        ) : displayedCourts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#111827] border border-white/10 rounded-lg">
            <p className="text-[#4a5a72] mb-2">No hay canchas disponibles</p>
            <p className="text-sm text-[#4a5a72]">Crea tu primera cancha para comenzar</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {displayedCourts.map((court) => (
                <div
                  key={court.id}
                  className="bg-[#111827] border border-white/10 hover:border-[#ace600]/30 rounded-lg p-5 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{court.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-[#4a5a72] mb-2">
                        <span className="capitalize">
                          {court.court_type === 'indoor'
                            ? 'Cubierta'
                            : court.court_type === 'outdoor'
                              ? 'Abierta'
                              : 'Techada'}
                        </span>
                        •<span className="capitalize">{court.surface}</span>
                      </div>
                      {court.description && (
                        <p className="text-xs text-[#4a5a72] line-clamp-2">{court.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCourt(court)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#7a8ba8] hover:text-white"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(court.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-[11px] text-[#4a5a72] mb-1">Tarifa/Hora</div>
                      <div className="font-semibold text-white">${court.hourly_rate}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-[11px] text-[#4a5a72] mb-1">Capacidad</div>
                      <div className="font-semibold text-white">{court.capacity} personas</div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${
                        court.is_available
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}
                    >
                      {court.is_available ? 'Disponible' : 'No disponible'}
                    </Badge>
                    {court.is_maintenance && (
                      <Badge
                        variant="outline"
                        className="text-[11px] bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                      >
                        En mantenimiento
                      </Badge>
                    )}
                    {court.average_rating && typeof court.average_rating === 'number' && (
                      <Badge
                        variant="outline"
                        className="text-[11px]"
                        style={{
                          background: 'rgba(172,230,0,0.1)',
                          borderColor: 'rgba(172,230,0,0.3)',
                          color: ACCENT,
                        }}
                      >
                        ⭐ {court.average_rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-[#4a5a72]">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                  {Math.min(currentPage * itemsPerPage, filteredCourts.length)} de{' '}
                  {filteredCourts.length} canchas
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-white/10 text-[#4a5a72] hover:text-white"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      style={
                        page === currentPage
                          ? { background: ACCENT, color: 'black' }
                          : { borderColor: 'rgba(255,255,255,0.1)', color: '#4a5a72' }
                      }
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-white/10 text-[#4a5a72] hover:text-white"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Court Action Modal */}
      <CourtActionModal
        isOpen={isModalOpen}
        court={selectedCourt}
        mode={selectedCourt ? 'edit' : 'view'}
        onClose={handleCloseModal}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
