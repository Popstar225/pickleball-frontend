import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchCourts } from '../../../store/slices/courtsSlice';
import CourtActionModal from './ActionModals/CourtActionModal';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Court } from '../../../types/api';
import { COURT_SURFACES, COURT_SURFACE_COLORS } from '@/constants/constants';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import {
  Search, MapPin, DollarSign, Loader2, X, Download,
  Plus, RefreshCw, Building2, Store, LayoutGrid,
  ChevronRight, ArrowLeft, CheckCircle2, XCircle,
  Layers, Hash,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Constants ────────────────────────────────────────────────────────────────
const COURT_TYPES: Record<string, string> = {
  indoor: 'Cubierta', outdoor: 'Aire Libre', covered: 'Techada',
};
const TYPE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  indoor:  { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  outdoor: { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400'  },
  covered: { bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    text: 'text-sky-400'    },
};

// ─── View levels ──────────────────────────────────────────────────────────────
type ViewLevel = 'clubs' | 'venues' | 'courts';

// ─── Data shapes ──────────────────────────────────────────────────────────────
interface ClubRow {
  club_id: string;
  club_name: string;
  venue_count: number;
  court_count: number;
  court_type: string;
  surface: string;
  min_price: number | null;
  state: string;
  address: string;
}

interface VenueRow {
  venue_id: string | null;
  venue_name: string;
  court_count: number;
  court_type: string;
  surface: string;
  price: number | null;
  state: string;
  address: string;
}

interface CourtRow {
  id: string;
  name: string;
  court_number: number | null;
  court_type: string;
  surface: string;
  hourly_rate: number | null;
  is_active: boolean;
  is_available: boolean;
}

// ─── Build helpers ────────────────────────────────────────────────────────────
function mostFrequent(arr: string[]): string {
  if (!arr.length) return '';
  const freq: Record<string, number> = {};
  arr.forEach(v => { if (v) freq[v] = (freq[v] ?? 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
}

function buildClubRows(courts: any[]): ClubRow[] {
  const map = new Map<string, any[]>();
  courts.forEach(c => {
    const key = c.club_id ?? 'unknown';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  });

  return Array.from(map.entries()).map(([club_id, group]) => {
    const first = group[0];
    const club  = first.club as any;

    const types = group.map(c => (c.venue as any)?.court_type || c.court_type || '').filter(Boolean);
    const surfs = group.map(c => (c.venue as any)?.surface_type || c.surface || '').filter(Boolean);
    const prices = group.flatMap(c => {
      const v = c.venue as any;
      const p = v?.base_price_per_hour != null ? Number(v.base_price_per_hour) : Number(c.hourly_rate);
      return p > 0 ? [p] : [];
    });

    const venueIds = new Set(group.map(c => c.venue_id).filter(Boolean));

    return {
      club_id,
      club_name:   first.club_name ?? club?.name ?? '—',
      venue_count: venueIds.size,
      court_count: group.length,
      court_type:  mostFrequent(types),
      surface:     mostFrequent(surfs),
      min_price:   prices.length ? Math.min(...prices) : null,
      state:       club?.state   ?? '—',
      address:     club?.address ?? '—',
    };
  });
}

function buildVenueRows(courts: any[], clubId: string): VenueRow[] {
  const filtered = courts.filter(c => c.club_id === clubId);
  const map = new Map<string, any[]>();
  filtered.forEach(c => {
    const key = c.venue_id ? String(c.venue_id) : '__no_venue__';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  });

  return Array.from(map.entries()).map(([, group]) => {
    const first = group[0];
    const venue = first.venue as any;
    const club  = first.club  as any;

    const courtType = venue?.court_type || mostFrequent(group.map(c => c.court_type || ''));
    const surface   = venue?.surface_type || mostFrequent(group.map(c => c.surface || ''));

    let price: number | null = null;
    if (venue?.base_price_per_hour != null) {
      price = Number(venue.base_price_per_hour);
    } else {
      const rates = group.map(c => Number(c.hourly_rate)).filter(n => n > 0);
      if (rates.length) price = Math.min(...rates);
    }

    return {
      venue_id:    first.venue_id ?? null,
      venue_name:  venue?.name ?? '—',
      court_count: group.length,
      court_type:  courtType,
      surface,
      price,
      state:   club?.state   ?? venue?.state   ?? '—',
      address: venue?.address ?? club?.address ?? '—',
    };
  });
}

function buildCourtRows(courts: any[], venueId: string | null, clubId: string): CourtRow[] {
  return courts
    .filter(c => {
      if (venueId) return String(c.venue_id) === String(venueId);
      return c.club_id === clubId && !c.venue_id;
    })
    .map(c => {
      const venue = c.venue as any;
      return {
        id:           c.id,
        name:         c.name,
        court_number: c.court_number ?? null,
        court_type:   venue?.court_type  || c.court_type || '',
        surface:      venue?.surface_type || c.surface   || '',
        hourly_rate:  c.hourly_rate ? Number(c.hourly_rate) : null,
        is_active:    c.is_active   ?? true,
        is_available: c.is_available ?? true,
      };
    });
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type?: string }) {
  const s = TYPE_STYLES[type ?? ''] ?? { bg: 'bg-white/[0.04]', border: 'border-white/[0.08]', text: 'text-white/30' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest', s.bg, s.border, s.text)}>
      {COURT_TYPES[type ?? ''] ?? type ?? '—'}
    </span>
  );
}

function SurfaceBadge({ surface }: { surface?: string }) {
  const dot = COURT_SURFACE_COLORS[surface as keyof typeof COURT_SURFACE_COLORS] ?? 'bg-white/20';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-white/50 font-medium">
      <span className={cn('w-2 h-2 rounded-full shrink-0', dot)} />
      {COURT_SURFACES[surface as keyof typeof COURT_SURFACES] ?? surface ?? '—'}
    </span>
  );
}

function StatusDot({ active, label }: { active: boolean; label?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-black',
      active
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        : 'bg-red-500/10 border-red-500/20 text-red-400',
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-emerald-400' : 'bg-red-400')} />
      {label ?? (active ? 'Activa' : 'Inactiva')}
    </span>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3.5 hover:border-white/[0.12] transition-colors">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">{label}</p>
      <p className={cn('text-2xl font-black leading-none', accent ?? 'text-white')}>{value}</p>
    </div>
  );
}

// ─── Select style helpers ─────────────────────────────────────────────────────
const selTrigger = 'h-9 bg-white/[0.04] border-white/[0.08] text-white/60 text-sm focus:border-[#ace600]/30 focus:ring-0 rounded-xl';
const selContent = 'bg-[#0d1117] border-white/[0.09] rounded-xl shadow-2xl';
const selItem    = 'text-white/60 focus:bg-white/[0.06] focus:text-white rounded-lg';

// ─── Excel export helper ──────────────────────────────────────────────────────
function applyHeaderStyle(ws: XLSX.WorkSheet, headerRow: number, colCount: number) {
  for (let c = 0; c < colCount; c++) {
    const addr = XLSX.utils.encode_cell({ r: headerRow, c });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font:      { bold: true, color: { rgb: '000000' }, sz: 11 },
      fill:      { fgColor: { rgb: 'ACE600' }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        bottom: { style: 'medium', color: { rgb: '6B8F00' } },
      },
    };
  }
}

function buildClubsSheet(courts: any[]): XLSX.WorkSheet {
  const TYPES: Record<string, string>    = { indoor: 'Cubierta', outdoor: 'Aire Libre', covered: 'Techada' };
  const SURFS: Record<string, string>    = {
    concrete: 'Concreto', asphalt: 'Asfalto', synthetic: 'Sintético',
    wood: 'Madera', rubber: 'Caucho', grass: 'Pasto', clay: 'Arcilla',
  };

  const rows = buildClubRows(courts);
  const data: any[][] = [
    ['Club', 'N° Sedes', 'N° Canchas', 'Tipo principal', 'Material de construcción', 'Precio mínimo/hr ($)', 'Estado / Provincia', 'Domicilio'],
    ...rows.map(r => [
      r.club_name,
      r.venue_count,
      r.court_count,
      TYPES[r.court_type] ?? r.court_type ?? '',
      SURFS[r.surface]    ?? r.surface    ?? '',
      r.min_price != null ? r.min_price : '',
      r.state,
      r.address,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [32, 10, 12, 16, 22, 20, 18, 36].map(w => ({ wch: w }));
  applyHeaderStyle(ws, 0, data[0].length);
  return ws;
}

function buildVenuesSheet(courts: any[]): XLSX.WorkSheet {
  const TYPES: Record<string, string> = { indoor: 'Cubierta', outdoor: 'Aire Libre', covered: 'Techada' };
  const SURFS: Record<string, string> = {
    concrete: 'Concreto', asphalt: 'Asfalto', synthetic: 'Sintético',
    wood: 'Madera', rubber: 'Caucho', grass: 'Pasto', clay: 'Arcilla',
  };

  // Build venue rows across ALL clubs
  const map = new Map<string, any[]>();
  courts.forEach(c => {
    const key = c.venue_id ? String(c.venue_id) : `__no_venue__${c.club_id}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  });

  const data: any[][] = [
    ['Club', 'Sede', 'N° Canchas', 'Tipo', 'Superficie', 'Precio base/hr ($)', 'Estado / Provincia', 'Dirección', 'Activa'],
  ];

  map.forEach(group => {
    const first = group[0];
    const venue = first.venue as any;
    const club  = first.club  as any;
    const courtType = TYPES[venue?.court_type || mostFrequent(group.map(c => c.court_type || ''))] ?? '';
    const surface   = SURFS[venue?.surface_type || mostFrequent(group.map(c => c.surface || ''))] ?? '';
    let price = '';
    if (venue?.base_price_per_hour != null) price = Number(venue.base_price_per_hour).toFixed(2);
    else {
      const rates = group.map(c => Number(c.hourly_rate)).filter(n => n > 0);
      if (rates.length) price = Math.min(...rates).toFixed(2);
    }

    data.push([
      club?.name ?? first.club_name ?? '—',
      venue?.name ?? '—',
      group.length,
      courtType,
      surface,
      price,
      club?.state ?? venue?.state ?? '—',
      venue?.address ?? club?.address ?? '—',
      venue?.is_active !== false ? 'Sí' : 'No',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [28, 28, 12, 14, 16, 18, 18, 34, 8].map(w => ({ wch: w }));
  applyHeaderStyle(ws, 0, data[0].length);
  return ws;
}

function buildCourtsSheet(courts: any[]): XLSX.WorkSheet {
  const TYPES: Record<string, string> = { indoor: 'Cubierta', outdoor: 'Aire Libre', covered: 'Techada' };
  const SURFS: Record<string, string> = {
    concrete: 'Concreto', asphalt: 'Asfalto', synthetic: 'Sintético',
    wood: 'Madera', rubber: 'Caucho', grass: 'Pasto', clay: 'Arcilla',
  };

  const data: any[][] = [
    [
      '#', 'Club', 'Sede', 'Nombre de cancha', 'N° Cancha',
      'Tipo', 'Superficie', 'Precio/hr ($)', 'Precio diario ($)', 'Capacidad',
      'Iluminación', 'Red incluida', 'Equipamiento',
      'Activa', 'Disponible', 'En mantenimiento',
      'Total reservas', 'Horas reservadas', 'Calificación promedio', 'N° Reseñas',
      'Estado / Provincia', 'Descripción',
    ],
  ];

  courts.forEach((c, i) => {
    const venue = c.venue as any;
    const club  = c.club  as any;
    data.push([
      i + 1,
      club?.name  ?? c.club_name ?? '—',
      venue?.name ?? '—',
      c.name,
      c.court_number ?? '',
      TYPES[venue?.court_type || c.court_type] ?? c.court_type ?? '',
      SURFS[venue?.surface_type || c.surface]  ?? c.surface ?? '',
      c.hourly_rate  != null ? Number(c.hourly_rate).toFixed(2)  : '',
      c.daily_rate   != null ? Number(c.daily_rate).toFixed(2)   : '',
      c.capacity     ?? 4,
      c.has_lighting  ? 'Sí' : 'No',
      c.has_net       ? 'Sí' : 'No',
      c.has_equipment ? 'Sí' : 'No',
      c.is_active     !== false ? 'Sí' : 'No',
      c.is_available  !== false ? 'Sí' : 'No',
      c.is_maintenance ? 'Sí' : 'No',
      c.total_bookings     ?? 0,
      c.total_hours_booked != null ? Number(c.total_hours_booked).toFixed(1) : 0,
      c.average_rating     != null ? Number(c.average_rating).toFixed(2)     : '',
      c.review_count       ?? 0,
      club?.state ?? venue?.state ?? '—',
      c.description ?? '',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [5, 26, 24, 22, 10, 14, 14, 14, 14, 10, 12, 12, 14, 8, 10, 16, 14, 16, 18, 10, 16, 36].map(w => ({ wch: w }));
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  applyHeaderStyle(ws, 0, data[0].length);
  return ws;
}

function downloadXLSX(courts: any[]) {
  const wb = XLSX.utils.book_new();

  wb.Props = {
    Title:   'Reporte de Canchas – Pickleball',
    Subject: 'Gestión de canchas',
    Author:  'Sistema Pickleball',
    CreatedDate: new Date(),
  };

  XLSX.utils.book_append_sheet(wb, buildClubsSheet(courts),  'Resumen por Club');
  XLSX.utils.book_append_sheet(wb, buildVenuesSheet(courts), 'Sedes');
  XLSX.utils.book_append_sheet(wb, buildCourtsSheet(courts), 'Canchas');

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `reporte-canchas-${date}.xlsx`);
}

// ─── Column header ────────────────────────────────────────────────────────────
function TH({ children }: { children: React.ReactNode }) {
  return (
    <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/35 h-10 px-4 whitespace-nowrap">
      {children}
    </TableHead>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CourtsManagement() {
  const dispatch   = useDispatch<AppDispatch>();
  const navigate   = useNavigate();
  const { toast }  = useToast();

  const { courts, loading, pagination } = useSelector((state: RootState) => state.courts);
  const courtsArray = Array.isArray(courts) ? courts : [];

  // ── Drill-down state ──
  const [view,          setView]          = useState<ViewLevel>('clubs');
  const [selectedClub,  setSelectedClub]  = useState<ClubRow | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<VenueRow | null>(null);

  // ── Modal state ──
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [modalMode,     setModalMode]     = useState<'view' | 'edit' | 'create'>('view');
  const [isModalOpen,   setIsModalOpen]   = useState(false);

  // ── Filter state (reset on level change) ──
  const [searchTerm,    setSearchTerm]    = useState('');
  const [typeFilter,    setTypeFilter]    = useState('');
  const [surfaceFilter, setSurfaceFilter] = useState('');
  const [isExporting,   setIsExporting]   = useState(false);

  const currentPage = pagination?.page  ?? 1;
  const pageLimit   = pagination?.limit ?? 10;

  useEffect(() => {
    dispatch(fetchCourts({ page: currentPage, limit: 500 }));
  }, [dispatch]);

  // ── Reset filters when view changes ──
  const goTo = (level: ViewLevel) => {
    setView(level);
    setSearchTerm(''); setTypeFilter(''); setSurfaceFilter('');
  };

  // ── Grouped data ──
  const clubRows  = useMemo(() => buildClubRows(courtsArray),  [courtsArray]);
  const venueRows = useMemo(
    () => selectedClub ? buildVenueRows(courtsArray, selectedClub.club_id) : [],
    [courtsArray, selectedClub],
  );
  const courtRows = useMemo(
    () => selectedClub ? buildCourtRows(courtsArray, selectedVenue?.venue_id ?? null, selectedClub.club_id) : [],
    [courtsArray, selectedClub, selectedVenue],
  );

  // ── Filtered data for current level ──
  const filteredClubs = useMemo(() => {
    let list = clubRows;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r =>
        r.club_name.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q),
      );
    }
    if (typeFilter)    list = list.filter(r => r.court_type === typeFilter);
    if (surfaceFilter) list = list.filter(r => r.surface    === surfaceFilter);
    return list;
  }, [clubRows, searchTerm, typeFilter, surfaceFilter]);

  const filteredVenues = useMemo(() => {
    let list = venueRows;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r =>
        r.venue_name.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q),
      );
    }
    if (typeFilter)    list = list.filter(r => r.court_type === typeFilter);
    if (surfaceFilter) list = list.filter(r => r.surface    === surfaceFilter);
    return list;
  }, [venueRows, searchTerm, typeFilter, surfaceFilter]);

  const filteredCourts = useMemo(() => {
    let list = courtRows;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q));
    }
    if (typeFilter)    list = list.filter(r => r.court_type === typeFilter);
    if (surfaceFilter) list = list.filter(r => r.surface    === surfaceFilter);
    return list;
  }, [courtRows, searchTerm, typeFilter, surfaceFilter]);

  const hasFilters   = !!(searchTerm || typeFilter || surfaceFilter);
  const clearFilters = () => { setSearchTerm(''); setTypeFilter(''); setSurfaceFilter(''); };

  // ── Handlers ──
  const handleCreateCourt = useCallback(() => {
    setSelectedCourt(null); setModalMode('create'); setIsModalOpen(true);
  }, []);
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false); setTimeout(() => setSelectedCourt(null), 300);
  }, []);
  const handleSaveSuccess = useCallback(() => {
    toast({ title: 'Éxito', description: 'Cancha actualizada correctamente' });
    dispatch(fetchCourts({ page: currentPage, limit: 500 }));
    handleModalClose();
  }, [dispatch, currentPage, handleModalClose, toast]);

  // ── Export ──
  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      // Fetch all courts with full data (limit=2000 to get everything)
      const res = await api.get('/courts?limit=2000&page=1') as any;
      const all: any[] = res?.data?.data ?? res?.data?.courts ?? [];
      if (!all.length) {
        toast({ title: 'Sin datos', description: 'No hay canchas para exportar.', variant: 'destructive' });
        return;
      }
      downloadXLSX(all);
      toast({ title: 'Exportación exitosa', description: `${all.length} canchas exportadas a Excel.` });
    } catch {
      toast({ title: 'Error al exportar', description: 'No se pudo generar el reporte.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  // ── Breadcrumb ──
  const Breadcrumb = () => (
    <nav className="flex items-center gap-1.5 text-xs text-white/30 flex-wrap">
      <button
        onClick={() => goTo('clubs')}
        className={cn('font-bold hover:text-white transition-colors', view === 'clubs' ? 'text-white/60 cursor-default pointer-events-none' : 'text-[#ace600]/70 hover:text-[#ace600]')}>
        Clubes
      </button>
      {(view === 'venues' || view === 'courts') && selectedClub && (
        <>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <button
            onClick={() => goTo('venues')}
            className={cn('font-bold hover:text-white transition-colors', view === 'venues' ? 'text-white/60 cursor-default pointer-events-none' : 'text-[#ace600]/70 hover:text-[#ace600]')}>
            {selectedClub.club_name}
          </button>
        </>
      )}
      {view === 'courts' && selectedVenue && (
        <>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-white/60 font-bold">{selectedVenue.venue_name}</span>
        </>
      )}
    </nav>
  );

  // ── Filter bar (shared) ──
  const FilterBar = () => (
    <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={view === 'courts' ? 'Buscar cancha…' : view === 'venues' ? 'Buscar sede…' : 'Buscar club, estado o dirección…'}
          className="pl-9 pr-8 h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-[#ace600]/30 focus-visible:ring-0 rounded-xl"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}>
        <SelectTrigger className={cn(selTrigger, 'sm:w-36')}><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent className={selContent}>
          <SelectItem value="all" className={selItem}>Todos los tipos</SelectItem>
          {Object.entries(COURT_TYPES).map(([v, l]) => <SelectItem key={v} value={v} className={selItem}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={surfaceFilter || 'all'} onValueChange={v => setSurfaceFilter(v === 'all' ? '' : v)}>
        <SelectTrigger className={cn(selTrigger, 'sm:w-36')}><SelectValue placeholder="Superficie" /></SelectTrigger>
        <SelectContent className={selContent}>
          <SelectItem value="all" className={selItem}>Todas</SelectItem>
          {Object.entries(COURT_SURFACES).map(([v, l]) => <SelectItem key={v} value={v} className={selItem}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
      {hasFilters && (
        <button onClick={clearFilters}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/35 hover:text-white text-xs font-bold transition-all">
          <X className="w-3.5 h-3.5" /> Limpiar
        </button>
      )}
    </div>
  );

  // ── Empty state ──
  const EmptyState = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <Layers className="w-6 h-6 text-white/10" />
      </div>
      <div>
        <p className="text-sm font-bold text-white/30 mb-1">{label}</p>
        {hasFilters && <p className="text-xs text-white/15">Intenta ajustar los filtros.</p>}
      </div>
      {hasFilters && (
        <button onClick={clearFilters}
          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/30 hover:text-white text-xs font-bold transition-all">
          <X className="w-3.5 h-3.5" /> Limpiar filtros
        </button>
      )}
    </div>
  );

  const totalCourts = clubRows.reduce((s, r) => s + r.court_count, 0);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
        <div>
          {/* Breadcrumb */}
          <Breadcrumb />
          <div className="flex items-center gap-2.5 mt-2 mb-1 flex-wrap">
            {view !== 'clubs' && (
              <button
                onClick={() => view === 'courts' ? goTo('venues') : goTo('clubs')}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white transition-all shrink-0">
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
            <h1 className="text-[22px] font-black text-white tracking-tight">
              {view === 'clubs'  && 'Gestión de Canchas'}
              {view === 'venues' && (selectedClub?.club_name ?? 'Sedes')}
              {view === 'courts' && (selectedVenue?.venue_name ?? 'Canchas')}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              {view === 'clubs'  && <><Building2 className="w-2.5 h-2.5" />{filteredClubs.length} clubes</>}
              {view === 'venues' && <><Store className="w-2.5 h-2.5" />{filteredVenues.length} sedes</>}
              {view === 'courts' && <><LayoutGrid className="w-2.5 h-2.5" />{filteredCourts.length} canchas</>}
            </span>
          </div>
          <p className="text-xs text-white/25">
            {view === 'clubs'  && `Club → Sede → ${totalCourts} canchas en total`}
            {view === 'venues' && `${selectedClub?.court_count ?? 0} canchas · haz clic en una sede para ver sus canchas`}
            {view === 'courts' && `Sede: ${selectedVenue?.venue_name ?? '—'} · haz clic en una cancha para ver detalles`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => dispatch(fetchCourts({ page: currentPage, limit: 500 }))}
            disabled={loading}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white text-xs font-bold disabled:opacity-40 transition-all">
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            Actualizar
          </button>
          <button onClick={handleExport} disabled={isExporting}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-xs font-bold disabled:opacity-50 transition-all">
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {isExporting ? 'Generando Excel…' : 'Exportar Excel'}
          </button>
          <button
            onClick={handleCreateCourt}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-black bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_16px_rgba(172,230,0,0.18)] hover:shadow-[0_0_24px_rgba(172,230,0,0.30)] transition-all">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Nueva Cancha
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      {view === 'clubs' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatCard label="Clubes"        value={clubRows.length}       accent="text-[#ace600]" />
          <StatCard label="Total canchas" value={totalCourts}            accent="text-sky-400"   />
          <StatCard label="Sedes totales" value={clubRows.reduce((s, r) => s + r.venue_count, 0)} accent="text-violet-400" />
          <StatCard label="Superficie más usada"
            value={COURT_SURFACES[mostFrequent(clubRows.map(r => r.surface)) as keyof typeof COURT_SURFACES] ?? '—'}
            accent="text-amber-400" />
        </div>
      )}
      {view === 'venues' && selectedClub && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatCard label="Sedes"        value={venueRows.length}             accent="text-[#ace600]" />
          <StatCard label="Canchas"      value={selectedClub.court_count}     accent="text-sky-400"   />
          <StatCard label="Estado"       value={selectedClub.state}           accent="text-violet-400" />
          <StatCard label="Precio desde" value={selectedClub.min_price != null ? `$${selectedClub.min_price.toFixed(0)}` : '—'} accent="text-amber-400" />
        </div>
      )}
      {view === 'courts' && selectedVenue && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatCard label="Canchas"    value={courtRows.length}                                          accent="text-[#ace600]" />
          <StatCard label="Activas"    value={courtRows.filter(c => c.is_active).length}                 accent="text-emerald-400" />
          <StatCard label="Precio/hr"  value={selectedVenue.price != null ? `$${selectedVenue.price.toFixed(2)}` : '—'} accent="text-sky-400" />
          <StatCard label="Superficie" value={COURT_SURFACES[selectedVenue.surface as keyof typeof COURT_SURFACES] ?? selectedVenue.surface ?? '—'} accent="text-amber-400" />
        </div>
      )}

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <FilterBar />

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">

        {/* Table head bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            {view === 'clubs'  && <Building2 className="w-4 h-4 text-white/25" />}
            {view === 'venues' && <Store     className="w-4 h-4 text-white/25" />}
            {view === 'courts' && <LayoutGrid className="w-4 h-4 text-white/25" />}
            <span className="text-[10px] font-black uppercase tracking-widest text-white/35">
              {view === 'clubs'  && 'Lista de Clubes'}
              {view === 'venues' && `Sedes de ${selectedClub?.club_name}`}
              {view === 'courts' && `Canchas · ${selectedVenue?.venue_name}`}
            </span>
          </div>
          {!loading && (
            <span className="text-[11px] text-white/20 font-semibold">
              {view === 'clubs'  && `${filteredClubs.length} de ${clubRows.length} clubes`}
              {view === 'venues' && `${filteredVenues.length} de ${venueRows.length} sedes`}
              {view === 'courts' && `${filteredCourts.length} de ${courtRows.length} canchas`}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-5 h-5 text-[#ace600] animate-spin" />
            <p className="text-xs text-white/20">Cargando…</p>
          </div>
        )}

        {/* ── CLUBS TABLE ─────────────────────────────────────────────────── */}
        {!loading && view === 'clubs' && (
          filteredClubs.length === 0
            ? <EmptyState label="No se encontraron clubes" />
            : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
                    <TH>Nombre del club</TH>
                    <TH>Numero de canchas</TH>
                    <TH>Tipo</TH>
                    <TH>Material de construcción</TH>
                    <TH>Precio</TH>
                    <TH>Estado</TH>
                    <TH>Domicilio</TH>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClubs.map(row => (
                    <TableRow
                      key={row.club_id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors group cursor-pointer"
                      onClick={() => { setSelectedClub(row); goTo('venues'); }}>

                      {/* Club */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-[#ace600]" />
                          </div>
                          <div>
                            <p className="font-bold text-white/80 text-sm group-hover:text-white transition-colors leading-tight">
                              {row.club_name}
                            </p>
                            <p className="text-[10px] text-white/25 mt-0.5">{row.venue_count} sede{row.venue_count !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Court count */}
                      <TableCell className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-sky-500/10 border-sky-500/20 text-sky-400 text-xs font-black">
                          <Hash className="w-2.5 h-2.5" />{row.court_count}
                        </span>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="py-3.5 px-4"><TypeBadge type={row.court_type} /></TableCell>

                      {/* Surface */}
                      <TableCell className="py-3.5 px-4"><SurfaceBadge surface={row.surface} /></TableCell>

                      {/* Price */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-sm font-black text-white/70">
                          <DollarSign className="w-3.5 h-3.5 text-white/30" />
                          {row.min_price != null ? row.min_price.toFixed(0) : '—'}
                        </div>
                      </TableCell>

                      {/* State */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-white/60 font-medium">
                          <MapPin className="w-3 h-3 text-white/25 shrink-0" />{row.state}
                        </div>
                      </TableCell>

                      {/* Address */}
                      <TableCell className="py-3.5 px-4 max-w-[200px]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-white/45 truncate" title={row.address}>{row.address}</p>
                          <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-[#ace600]/50 transition-colors shrink-0" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
        )}

        {/* ── VENUES TABLE ────────────────────────────────────────────────── */}
        {!loading && view === 'venues' && (
          filteredVenues.length === 0
            ? <EmptyState label="No se encontraron sedes" />
            : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
                    <TH>Nombre de sede</TH>
                    <TH>N° Canchas</TH>
                    <TH>Tipo</TH>
                    <TH>Superficie</TH>
                    <TH>Precio/hr</TH>
                    <TH>Estado</TH>
                    <TH>Dirección</TH>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVenues.map(row => (
                    <TableRow
                      key={row.venue_id ?? '__no_venue__'}
                      className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors group cursor-pointer"
                      onClick={() => { setSelectedVenue(row); goTo('courts'); }}>

                      {/* Venue name */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4 text-violet-400" />
                          </div>
                          <p className="font-bold text-white/80 text-sm group-hover:text-white transition-colors">
                            {row.venue_name}
                          </p>
                        </div>
                      </TableCell>

                      {/* Count */}
                      <TableCell className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600] text-xs font-black">
                          <Hash className="w-2.5 h-2.5" />{row.court_count}
                        </span>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="py-3.5 px-4"><TypeBadge type={row.court_type} /></TableCell>

                      {/* Surface */}
                      <TableCell className="py-3.5 px-4"><SurfaceBadge surface={row.surface} /></TableCell>

                      {/* Price */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-sm font-black text-white/70">
                          <DollarSign className="w-3.5 h-3.5 text-white/30" />
                          {row.price != null ? row.price.toFixed(2) : '—'}
                        </div>
                      </TableCell>

                      {/* State */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-white/60 font-medium">
                          <MapPin className="w-3 h-3 text-white/25 shrink-0" />{row.state}
                        </div>
                      </TableCell>

                      {/* Address */}
                      <TableCell className="py-3.5 px-4 max-w-[200px]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-white/45 truncate" title={row.address}>{row.address}</p>
                          <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-violet-400/50 transition-colors shrink-0" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
        )}

        {/* ── COURTS TABLE ────────────────────────────────────────────────── */}
        {!loading && view === 'courts' && (
          filteredCourts.length === 0
            ? <EmptyState label="No se encontraron canchas" />
            : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
                    <TH>#</TH>
                    <TH>Nombre</TH>
                    <TH>Tipo</TH>
                    <TH>Superficie</TH>
                    <TH>Precio/hr</TH>
                    <TH>Estado</TH>
                    <TH>Disponibilidad</TH>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourts.map(row => (
                    <TableRow
                      key={row.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/dashboard/courts/${row.id}`)}>

                      {/* Number */}
                      <TableCell className="py-3.5 px-4 w-12">
                        <div className="w-7 h-7 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
                          <span className="text-[10px] font-black text-[#ace600]">{row.court_number ?? '·'}</span>
                        </div>
                      </TableCell>

                      {/* Name */}
                      <TableCell className="py-3.5 px-4">
                        <p className="font-bold text-white/80 text-sm group-hover:text-white transition-colors">
                          {row.name}
                        </p>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="py-3.5 px-4"><TypeBadge type={row.court_type} /></TableCell>

                      {/* Surface */}
                      <TableCell className="py-3.5 px-4"><SurfaceBadge surface={row.surface} /></TableCell>

                      {/* Price */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-sm font-black text-white/70">
                          <DollarSign className="w-3.5 h-3.5 text-white/30" />
                          {row.hourly_rate != null ? row.hourly_rate.toFixed(2) : '—'}
                        </div>
                      </TableCell>

                      {/* Active */}
                      <TableCell className="py-3.5 px-4">
                        <StatusDot active={row.is_active} />
                      </TableCell>

                      {/* Available */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center justify-between gap-2">
                          <StatusDot active={row.is_available} label={row.is_available ? 'Disponible' : 'Ocupada'} />
                          <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-[#ace600]/50 transition-colors shrink-0" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
        )}
      </div>

      <CourtActionModal
        isOpen={isModalOpen}
        court={selectedCourt}
        mode={modalMode as 'view' | 'edit' | 'create'}
        onClose={handleModalClose}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
