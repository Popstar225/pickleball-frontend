import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCoachCourts, Court } from '@/store/slices/coachDashboardSlice';
import CourtActionModal from './ActionModals/CourtActionModal';
import {
  Plus,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertCircle,
  MapPin,
  Zap,
  Users,
  DollarSign,
} from 'lucide-react';
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

const ACCENT = '#ace600';
const ACCENT_DIM = 'rgba(172,230,0,0.12)';
const ACCENT_BORD = 'rgba(172,230,0,0.25)';

const inputCls = `w-full bg-[#111827] border border-white/10 rounded-xl text-[#f0f4ff] text-sm px-3.5 py-2.5
  outline-none transition-all duration-150
  focus:border-[#ace600] focus:ring-2 focus:ring-[#ace600]/20
  disabled:opacity-40 disabled:cursor-not-allowed placeholder:text-white/20`;

const labelCls = 'block text-[11px] font-semibold text-[#4a5a72] uppercase tracking-widest mb-1.5';

interface FormData {
  name: string;
  court_type: string;
  surface: string;
  hourly_rate: number | string;
  max_capacity: number | string;
  lights: boolean;
  covered: boolean;
  description: string;
  is_available: boolean;
  is_active: boolean;
}

function CourtCard({ court, onEdit }: { court: Court; onEdit: (court: Court) => void }) {
  return (
    <div
      className="bg-[#0d1421] border border-white/[0.06] hover:border-white/10 rounded-2xl overflow-hidden p-6 flex flex-col gap-4 transition-colors"
      style={{ background: '#111827', border: '1px solid rgba(172,230,0,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-white mb-1">{court.name}</h3>
          <div className="flex items-center gap-2 text-[#7a8ba8] text-sm mb-2">
            <MapPin size={14} />
            {court.court_type} - {court.surface}
          </div>
          {court.description && (
            <p className="text-xs text-[#4a5a72] line-clamp-2">{court.description}</p>
          )}
        </div>
        <button
          onClick={() => onEdit(court)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#7a8ba8] hover:text-white"
        >
          <Edit2 size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-[11px] text-[#4a5a72] mb-1">Tarifa/Hora</div>
          <div className="flex items-center gap-1.5 text-white">
            <DollarSign size={14} style={{ color: ACCENT }} />
            <span className="font-semibold">${court.hourly_rate}</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-[11px] text-[#4a5a72] mb-1">Capacidad</div>
          <div className="flex items-center gap-1.5 text-white">
            <Users size={14} style={{ color: ACCENT }} />
            <span className="font-semibold">{court.capacity}</span>
          </div>
        </div>
      </div>

      {/* Features & Status */}
      <div className="flex flex-wrap gap-2">
        {court.surface && (
          <Badge
            variant="outline"
            className="text-[11px]"
            style={{
              background: ACCENT_DIM,
              border: `1px solid ${ACCENT_BORD}`,
              color: ACCENT,
            }}
          >
            <Zap size={12} className="mr-1" />
            Iluminación
          </Badge>
        )}
        {court.court_type && (
          <Badge
            variant="outline"
            className="text-[11px]"
            style={{
              background: ACCENT_DIM,
              border: `1px solid ${ACCENT_BORD}`,
              color: ACCENT,
            }}
          >
            Techada
          </Badge>
        )}
        <Badge
          variant="outline"
          className="text-[11px]"
          style={{
            background: court.is_available ? 'rgba(16,185,129,0.12)' : 'rgba(244,67,54,0.12)',
            border: court.is_available
              ? '1px solid rgba(16,185,129,0.25)'
              : '1px solid rgba(244,67,54,0.25)',
            color: court.is_available ? '#34d399' : '#ff6b6b',
          }}
        >
          {court.is_available ? 'Disponible' : 'No disponible'}
        </Badge>
      </div>
    </div>
  );
}

export default function CoachCourtsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { courts, courtsLoading, courtsError, courtsPagination } = useSelector(
    (state: RootState) => state.coachDashboard,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSurface, setFilterSurface] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchCoachCourts({
        page: currentPage,
        limit: 10,
        court_type: filterType || undefined,
        surface: filterSurface || undefined,
        search: searchTerm || undefined,
      }),
    );
  }, [dispatch, currentPage, filterType, filterSurface, searchTerm]);

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
      fetchCoachCourts({
        page: currentPage,
        limit: 10,
        court_type: filterType || undefined,
        surface: filterSurface || undefined,
        search: searchTerm || undefined,
      }),
    );
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-[#f0f4ff]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Gestión de Canchas</h1>
            <p className="text-[#4a5a72]">Administra tus canchas de pickleball</p>
          </div>
          <button
            onClick={handleCreateCourt}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-black transition-all"
            style={{ background: ACCENT }}
          >
            <Plus size={16} />
            Nueva Cancha
          </button>
        </div>

        {/* Error */}
        {courtsError && (
          <div
            className="rounded-xl p-4 mb-8 text-[#ff6b6b] text-sm flex items-start gap-3"
            style={{
              background: 'rgba(244,67,54,0.1)',
              border: '1px solid rgba(244,67,54,0.3)',
            }}
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p>{courtsError}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-8">
          <Input
            placeholder="Buscar canchas..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111827] border-white/10 text-[#f0f4ff]"
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
            <SelectContent className="bg-[#111827] border-white/10">
              <SelectItem value="">Todos los tipos</SelectItem>
              <SelectItem value="indoor">Indoor</SelectItem>
              <SelectItem value="outdoor">Outdoor</SelectItem>
              <SelectItem value="semi-covered">Semi-Cubierta</SelectItem>
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
            <SelectContent className="bg-[#111827] border-white/10">
              <SelectItem value="">Todas las superficies</SelectItem>
              <SelectItem value="hard-court">Hard Court</SelectItem>
              <SelectItem value="clay">Clay</SelectItem>
              <SelectItem value="grass">Grass</SelectItem>
              <SelectItem value="acrylic">Acrylic</SelectItem>
              <SelectItem value="concrete">Concrete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Courts Grid */}
        {courtsLoading ? (
          <div className="flex justify-center items-center h-96">
            <span className="animate-spin" style={{ color: ACCENT }}>
              <Loader size={32} />
            </span>
          </div>
        ) : courts.length === 0 ? (
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-12 text-center">
            <p className="text-[#4a5a72] mb-4">No hay canchas registradas</p>
            <Button
              onClick={handleCreateCourt}
              className="text-black font-semibold"
              style={{ background: ACCENT }}
            >
              <Plus size={16} className="mr-2" />
              Crear tu primera cancha
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courts.map((court) => (
                <CourtCard key={court.id} court={court} onEdit={handleEditCourt} />
              ))}
            </div>

            {/* Pagination */}
            {courtsPagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || courtsLoading}
                  className="p-2 rounded-lg border border-white/10 text-[#f0f4ff] hover:bg-white/5 disabled:opacity-50 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: courtsPagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className="px-3 py-1 rounded-lg transition-all"
                      style={{
                        background: page === currentPage ? ACCENT : 'transparent',
                        color: page === currentPage ? '#080c14' : '#f0f4ff',
                        border: page === currentPage ? 'none' : '1px solid rgba(172,230,0,0.25)',
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(courtsPagination.pages, currentPage + 1))}
                  disabled={currentPage === courtsPagination.pages || courtsLoading}
                  className="p-2 rounded-lg border border-white/10 text-[#f0f4ff] hover:bg-white/5 disabled:opacity-50 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <CourtActionModal
        isOpen={isModalOpen}
        court={selectedCourt}
        mode="edit"
        onClose={handleCloseModal}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
