import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCourts } from '@/store/slices/courtsSlice';
import type { Court } from '../../types/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock, Calendar, Loader2, LayoutGrid, ChevronRight,
  Users, Layers, Tag, CheckCircle2, XCircle, Settings2, Search, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import OperatingHoursConfigurator from './OperatingHoursConfigurator';
import CourtBlockingCalendar from './CourtBlockingCalendar';
import UnavailabilityList from './UnavailabilityList';
import CourtImage from '@/assets/images/courts/court4.jpg'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const COURT_TYPE_LABEL: Record<string, string> = {
  indoor: 'Cubierta', outdoor: 'Abierta', covered: 'Techada',
};
const SURFACE_LABEL: Record<string, string> = {
  concrete: 'Concreto', asphalt: 'Asfalto', synthetic: 'Sintético',
  grass: 'Pasto', clay: 'Arcilla', wood: 'Madera', acrylic: 'Acrílico',
  tartan: 'Tartán', other: 'Otro',
};

interface OperatingHours {
  [day: string]: { start: string; end: string };
}

interface CourtScheduleManagementProps {
  clubId?: string; // Optional for future use, not needed for API calls
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
function StatusDot({ available }: { available: boolean }) {
  return (
    <span className={cn(
      'w-1.5 h-1.5 rounded-full shrink-0',
      available ? 'bg-emerald-400' : 'bg-red-400',
    )} />
  );
}

function CourtCard({ court, selected, onSelect }: {
  court: Court; selected: boolean; onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onSelect}
      className={cn(
        'group w-full text-left bg-[#0d1117] rounded-2xl border overflow-hidden transition-all duration-200',
        selected
          ? 'border-[#ace600]/40 shadow-[0_0_20px_rgba(172,230,0,0.08)]'
          : 'border-white/[0.07] hover:border-white/[0.14]',
      )}>
      {/* accent bar */}
      <div className={cn(
        'h-0.5 bg-gradient-to-r via-transparent to-transparent transition-all',
        selected ? 'from-[#ace600]/50' : 'from-white/[0.06] group-hover:from-white/[0.12]',
      )} />

      {/* image */}
      <div className="h-32 w-full overflow-hidden">
        <img
          src={CourtImage}
          alt={court.name}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
        />
      </div>

      <div className="p-5">
        {/* name + status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="font-black text-white text-sm leading-tight truncate">{court.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <StatusDot available={!!court.is_available} />
              <span className={cn('text-[10px] font-bold uppercase tracking-widest',
                court.is_available ? 'text-emerald-400' : 'text-red-400')}>
                {court.is_available ? 'Disponible' : 'No disponible'}
              </span>
            </div>
          </div>
          {selected && (
            <div className="w-5 h-5 rounded-full bg-[#ace600]/15 border border-[#ace600]/30 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-[#ace600]" />
            </div>
          )}
        </div>

        {/* meta */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="w-3 h-3 text-white/20 shrink-0" />
            <span className="text-[11px] text-white/40 font-medium">
              {COURT_TYPE_LABEL[court.court_type] ?? court.court_type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-3 h-3 text-white/20 shrink-0" />
            <span className="text-[11px] text-white/40 font-medium capitalize">
              {SURFACE_LABEL[court.surface] ?? court.surface}
            </span>
          </div>
          {court.capacity && (
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-white/20 shrink-0" />
              <span className="text-[11px] text-white/40 font-medium">
                {court.capacity} {t('CourtSchedule.players')}
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className={cn(
          'mt-4 pt-3.5 border-t border-white/[0.05] flex items-center justify-between transition-all',
        )}>
          <span className={cn(
            'text-[11px] font-bold uppercase tracking-widest transition-colors',
            selected ? 'text-[#ace600]' : 'text-white/20 group-hover:text-white/40',
          )}>
            {selected ? 'Seleccionada' : t('CourtSchedule.configureSchedule')}
          </span>
          <ChevronRight className={cn(
            'w-3.5 h-3.5 transition-all',
            selected ? 'text-[#ace600] translate-x-0.5' : 'text-white/15 group-hover:text-white/30 group-hover:translate-x-0.5',
          )} />
        </div>
      </div>
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CourtScheduleManagement({ clubId }: CourtScheduleManagementProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { courts, loading } = useSelector((state: RootState) => state.courts);

  const [selectedCourt,  setSelectedCourt]  = useState<Court | null>(null);
  const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(null);
  const [loadingHours,   setLoadingHours]   = useState(false);
  const [activeTab,      setActiveTab]      = useState('courts');
  const [searchQuery,    setSearchQuery]    = useState('');

  useEffect(() => {
    dispatch(fetchCourts({}) as any);
  }, [dispatch]);

  useEffect(() => {
    if (selectedCourt) loadOperatingHours(selectedCourt.id);
  }, [selectedCourt]);

  const loadOperatingHours = async (courtId: string) => {
    setLoadingHours(true);
    try {
      const response = await api.get<any>(`/courts/${courtId}/availability/operating-hours`);
      setOperatingHours(response?.data?.operatingHours ?? null);
    } catch (error) {
      console.error('Error loading operating hours:', error);
      toast.error(t('CourtSchedule.hoursLoadError'));
    } finally {
      setLoadingHours(false);
    }
  };

  const handleSelectCourt = (court: Court) => {
    setSelectedCourt(court);
    setActiveTab('schedule');
  };

  const filteredCourts = courts?.filter(court =>
    court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (court.court_type && court.court_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (court.surface && SURFACE_LABEL[court.surface]?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) ?? [];

  return (
    <div className="space-y-6">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[22px] font-black text-white tracking-tight">
              {t('CourtSchedule.title')}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <Settings2 className="w-2.5 h-2.5" />
              {courts?.length ?? 0} canchas
            </span>
          </div>
          <p className="text-xs text-white/25">{t('CourtSchedule.subtitle')}</p>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex h-auto w-fit gap-1 bg-[#0d1117] border border-white/[0.07] rounded-2xl p-1.5">
          <TabsTrigger value="courts"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all text-white/30 hover:text-white/55 data-[state=active]:bg-[#ace600] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(172,230,0,0.18)]">
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            {t('CourtSchedule.courts')}
          </TabsTrigger>
          <TabsTrigger value="schedule"
            disabled={!selectedCourt}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all text-white/30 hover:text-white/55 disabled:opacity-30 disabled:cursor-not-allowed data-[state=active]:bg-[#ace600] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(172,230,0,0.18)]">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            {t('CourtSchedule.schedule')}
            {selectedCourt && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/20 text-[9px] font-black truncate max-w-[80px]">
                {selectedCourt.name}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Courts tab ───────────────────────────────────────────────────── */}
        <TabsContent value="courts" className="mt-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-56 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
              <p className="text-xs text-white/20">Cargando canchas…</p>
            </div>
          ) : courts?.length > 0 ? (
            <div className="space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  type="text"
                  placeholder={'Buscar canchas...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-xl text-sm bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 pl-10 pr-4 focus-visible:ring-0 focus-visible:border-[#ace600]/50 focus-visible:bg-[#ace600]/[0.03] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Courts grid */}
              {filteredCourts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredCourts.map(court => (
                    <CourtCard
                      key={court.id}
                      court={court}
                      selected={selectedCourt?.id === court.id}
                      onSelect={() => handleSelectCourt(court)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-white/[0.07] rounded-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <Search className="w-6 h-6 text-white/10" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white/20">No se encontraron canchas</p>
                    <p className="text-xs text-white/10 mt-1">Intenta con otro término de búsqueda</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-white/[0.07] rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-white/10" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white/20">{t('CourtSchedule.noCourts')}</p>
                <p className="text-xs text-white/10 mt-1">Agrega canchas para comenzar</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Schedule tab ─────────────────────────────────────────────────── */}
        <TabsContent value="schedule" className="mt-5">
          {selectedCourt && (
            <div className="space-y-4">

              {/* selected court banner */}
              <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-[#ace600]/40 via-[#ace600]/15 to-transparent" />
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[#ace600]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white/25 uppercase tracking-widest mb-0.5">
                        {t('CourtSchedule.managingScheduleFor')}
                      </p>
                      <p className="text-sm font-black text-white">{selectedCourt.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot available={!!selectedCourt.is_available} />
                    <span className={cn(
                      'text-[10px] font-black uppercase tracking-widest',
                      selectedCourt.is_available ? 'text-emerald-400' : 'text-red-400',
                    )}>
                      {selectedCourt.is_available ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>

              {/* schedule content */}
              {loadingHours ? (
                <div className="flex flex-col items-center justify-center h-56 gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
                  <p className="text-xs text-white/20">Cargando horarios…</p>
                </div>
              ) : (
                <>
                  <OperatingHoursConfigurator
                    court={selectedCourt}
                    clubId={clubId}
                    initialHours={operatingHours}
                    onSave={loadOperatingHours}
                  />
                  <CourtBlockingCalendar court={selectedCourt} clubId={clubId} />
                  <UnavailabilityList court={selectedCourt} clubId={clubId} />
                </>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}