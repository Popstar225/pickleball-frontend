import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import { fetchCourt, updateCourt, deleteCourt } from '../../../store/slices/courtsSlice';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, MapPin, DollarSign, LayoutGrid, Star, CalendarDays,
  Clock, Settings, Users, BarChart3, MessageSquare,
  Pencil, Trash2, Save, XCircle, Check, CheckCircle2,
  Loader2, Zap, Image as ImageIcon, Lightbulb,
  Wifi, Droplets, Package, ChevronRight, X, AlertTriangle,
  Building2, Store, Activity,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const COURT_TYPES: Record<string, string> = {
  indoor: 'Cubierta', outdoor: 'Aire Libre', covered: 'Techada',
};
const COURT_SURFACES: Record<string, string> = {
  concrete: 'Concreto', asphalt: 'Asfalto', synthetic: 'Sintético',
  grass: 'Pasto', clay: 'Arcilla',
};
const SURFACE_COLORS: Record<string, string> = {
  concrete: 'bg-slate-400', asphalt: 'bg-stone-500', synthetic: 'bg-sky-400',
  grass: 'bg-emerald-400', clay: 'bg-orange-400',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface CourtStats {
  total_matches: number;
  completed_matches: number;
  utilization_rate: number;
  average_rating: number;
  total_bookings: number;
}

interface Booking {
  id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';
  user?: { name?: string; email?: string };
}

interface EditForm {
  name: string;
  court_type: string;
  surface: string;
  description: string;
  capacity: number;
  hourly_rate: number | string;
  has_lighting: boolean;
  has_net: boolean;
  has_equipment: boolean;
  is_available: boolean;
  is_active: boolean;
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
const cn2 = (...c: (string | undefined | false | null)[]) => c.filter(Boolean).join(' ');

const Badge = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span className={cn2('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', className)}>
    {children}
  </span>
);

const Btn = ({
  children, variant = 'primary', size = 'md', className = '', onClick, disabled = false, type = 'button',
}: {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'save';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none';
  const variants = {
    primary: 'bg-[#ace600] hover:bg-[#beff00] text-slate-900 shadow-lg shadow-[#ace600]/20',
    outline: 'border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white',
    ghost:   'text-white/60 hover:text-white hover:bg-white/5',
    danger:  'border border-red-500/30 bg-red-950/40 hover:bg-red-950/60 text-red-400 hover:text-red-300',
    save:    'bg-[#ace600] hover:bg-[#beff00] text-slate-900 shadow-lg shadow-[#ace600]/25',
  };
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-9 px-4 text-sm', lg: 'h-11 px-6 text-sm', icon: 'h-9 w-9' };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={cn2(base, variants[variant], sizes[size], className)}>
      {children}
    </button>
  );
};

const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={cn2('bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden', className)}>
    {children}
  </div>
);

const SectionHead = ({
  icon: Icon2, title, right,
}: {
  icon: React.ElementType; title: string; right?: ReactNode;
}) => (
  <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06]">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
        <Icon2 className="w-3.5 h-3.5 text-[#ace600]" />
      </div>
      <h2 className="text-sm font-black uppercase tracking-widest text-white/60">{title}</h2>
    </div>
    {right}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-widest text-[#ace600]/50 mb-1">{label}</p>
    <p className="text-sm font-semibold text-white/75">{value ?? '—'}</p>
  </div>
);

const StatusBooking: Record<string, { label: string; cls: string }> = {
  confirmed:  { label: 'Confirmada',  cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  pending:    { label: 'Pendiente',   cls: 'bg-amber-500/10  border-amber-500/20  text-amber-400'   },
  cancelled:  { label: 'Cancelada',   cls: 'bg-red-500/10    border-red-500/20    text-red-400'     },
  completed:  { label: 'Completada',  cls: 'bg-sky-500/10    border-sky-500/20    text-sky-400'     },
  no_show:    { label: 'No se presentó', cls: 'bg-white/5    border-white/10      text-white/40'    },
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function CourtDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const dispatch  = useDispatch<AppDispatch>();

  const { currentCourt: court, loading, error } = useSelector(
    (state: RootState) => state.courts,
  );

  // ── Local state ──
  const [stats,         setStats]         = useState<CourtStats | null>(null);
  const [bookings,      setBookings]      = useState<Booking[]>([]);
  const [statsLoading,  setStatsLoading]  = useState(false);
  const [editMode,      setEditMode]      = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast,         setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [formData,      setFormData]      = useState<EditForm | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch court ──
  useEffect(() => {
    if (id) dispatch(fetchCourt(id));
  }, [id, dispatch]);

  // ── Init form when court loads ──
  useEffect(() => {
    if (court && (court as any).id === id) {
      const c = court as any;
      setFormData({
        name:          c.name            ?? '',
        court_type:    c.court_type      ?? 'outdoor',
        surface:       c.surface         ?? 'concrete',
        description:   c.description     ?? '',
        capacity:      c.capacity        ?? 4,
        hourly_rate:   c.hourly_rate     ?? 0,
        has_lighting:  c.has_lighting    ?? false,
        has_net:       c.has_net         ?? true,
        has_equipment: c.has_equipment   ?? false,
        is_available:  c.is_available    ?? true,
        is_active:     c.is_active       ?? true,
      });
    }
  }, [court, id]);

  // ── Fetch stats & bookings (once court is confirmed loaded) ──
  useEffect(() => {
    if (!id || !court || (court as any).id !== id) return;

    const fetchAux = async () => {
      setStatsLoading(true);
      try {
        const [statsRes, bookingsRes] = await Promise.allSettled([
          api.get(`/courts/${id}/stats`),
          api.get(`/courts/${id}/bookings?limit=5`),
        ]);

        if (statsRes.status === 'fulfilled') {
          const s = (statsRes.value as any)?.data?.stats;
          if (s) setStats(s);
        }
        if (bookingsRes.status === 'fulfilled') {
          const b = (bookingsRes.value as any)?.data?.data ?? [];
          setBookings(Array.isArray(b) ? b : []);
        }
      } finally {
        setStatsLoading(false);
      }
    };
    fetchAux();
  }, [id, court]);

  // ── Save edits ──
  const handleSave = useCallback(async () => {
    if (!id || !formData) return;
    setSaving(true);
    try {
      const result = await dispatch(updateCourt({ id, courtData: formData as Parameters<typeof updateCourt>[0]['courtData'] })).unwrap();
      // Re-fetch to get fresh data (including nested venue/club)
      await dispatch(fetchCourt(id));
      setEditMode(false);
      showToast('Cambios guardados exitosamente');
    } catch (err: any) {
      showToast(err?.message ?? 'Error al guardar los cambios', 'error');
    } finally {
      setSaving(false);
    }
  }, [id, formData, dispatch]);

  // ── Cancel edit ──
  const handleCancel = useCallback(() => {
    if (!court) return;
    const c = court as any;
    setFormData({
      name:          c.name         ?? '',
      court_type:    c.court_type   ?? 'outdoor',
      surface:       c.surface      ?? 'concrete',
      description:   c.description  ?? '',
      capacity:      c.capacity     ?? 4,
      hourly_rate:   c.hourly_rate  ?? 0,
      has_lighting:  c.has_lighting  ?? false,
      has_net:       c.has_net       ?? true,
      has_equipment: c.has_equipment ?? false,
      is_available:  c.is_available  ?? true,
      is_active:     c.is_active     ?? true,
    });
    setEditMode(false);
  }, [court]);

  // ── Delete ──
  const handleDelete = useCallback(async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await dispatch(deleteCourt(id)).unwrap();
      showToast('Cancha eliminada');
      setTimeout(() => navigate(-1), 1000);
    } catch (err: any) {
      showToast(err?.message ?? 'Error al eliminar la cancha', 'error');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }, [id, dispatch, navigate]);

  const setField = <K extends keyof EditForm>(key: K, val: EditForm[K]) =>
    setFormData(p => p ? { ...p, [key]: val } : p);

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (loading && !court) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-7 h-7 text-[#ace600] animate-spin" />
        <p className="text-sm text-white/30">Cargando cancha…</p>
      </div>
    );
  }

  // ─── ERROR / NOT FOUND ────────────────────────────────────────────────────
  if ((error && !court) || (court && (court as any).id !== id && !loading)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white/50 mb-1">No se encontró la cancha</p>
          <p className="text-xs text-white/25">{error ?? 'Verifica el ID e inténtalo de nuevo.'}</p>
        </div>
        <Btn variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-3.5 h-3.5" /> Volver
        </Btn>
      </div>
    );
  }

  if (!court || !formData) return null;

  const c = court as any;
  const venue = c.venue as any;
  const club  = venue?.club as any;

  // ── Helpers ──
  const courtTypeLabel   = COURT_TYPES[c.court_type]   ?? c.court_type   ?? '—';
  const surfaceLabel     = COURT_SURFACES[c.surface]   ?? c.surface      ?? '—';
  const surfaceDot       = SURFACE_COLORS[c.surface]   ?? 'bg-white/20';
  const displayName      = editMode ? formData.name    : c.name;
  const rating           = stats?.average_rating ?? c.average_rating ?? 0;
  const totalBookings    = stats?.total_bookings ?? c.total_bookings ?? 0;

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        {/* Left: back + title */}
        <div className="flex items-start gap-4">
          <Btn variant="outline" size="icon" className="shrink-0 mt-1" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Btn>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {editMode ? (
                <input
                  value={formData.name}
                  onChange={e => setField('name', e.target.value)}
                  className="text-2xl sm:text-3xl font-black bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-[#ace600]/50 w-full max-w-sm"
                />
              ) : (
                <>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                    {displayName}
                  </h1>
                  <Badge className={cn2(
                    c.is_active
                      ? 'bg-[#ace600]/10 border-[#ace600]/25 text-[#ace600]'
                      : 'bg-red-500/10 border-red-500/25 text-red-400',
                  )}>
                    <span className={cn2('w-1.5 h-1.5 rounded-full',
                      c.is_active ? 'bg-[#ace600] animate-pulse' : 'bg-red-400',
                    )} />
                    {c.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                  {!c.is_available && (
                    <Badge className="bg-amber-500/10 border-amber-500/25 text-amber-400">
                      Ocupada
                    </Badge>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-white/40 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-[#ace600] shrink-0" />
              {club?.name && <span className="font-semibold text-white/60">{club.name}</span>}
              {club?.name && venue?.name && <span className="text-white/20">·</span>}
              {venue?.name && <span className="text-white/50">{venue.name}</span>}
              {(club?.city || club?.state) && (
                <>
                  <span className="text-white/20">·</span>
                  <span>{[club?.city, club?.state].filter(Boolean).join(', ')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {!editMode ? (
            <>
              <Btn variant="primary" size="sm" onClick={() => setEditMode(true)}>
                <Pencil className="w-3.5 h-3.5" /> Editar
              </Btn>
              <Btn variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eliminar</span>
              </Btn>
            </>
          ) : (
            <>
              <Btn variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                <XCircle className="w-3.5 h-3.5" /> Cancelar
              </Btn>
              <Btn variant="save" size="sm" onClick={handleSave} disabled={saving}>
                {saving
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Btn>
            </>
          )}
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Price */}
        <div className="relative bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.14] transition-all group">
          <div className="h-px bg-gradient-to-r from-[#ace600]/40 via-[#ace600]/10 to-transparent" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Tarifa / Hora</p>
              <div className="w-8 h-8 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
                <DollarSign className="w-3.5 h-3.5 text-[#ace600]" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#ace600] leading-none">
              ${Number(c.hourly_rate ?? 0).toFixed(0)}
            </p>
            <p className="text-[10px] text-white/25 mt-2">MXN · por hora</p>
          </div>
        </div>

        {/* Type + Surface */}
        <div className="relative bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.14] transition-all">
          <div className="h-px bg-gradient-to-r from-sky-400/30 via-sky-400/10 to-transparent" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Tipo de Cancha</p>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
              </div>
            </div>
            <p className="text-2xl font-black text-sky-400 leading-none">{courtTypeLabel}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={cn2('w-2 h-2 rounded-full shrink-0', surfaceDot)} />
              <p className="text-[10px] text-white/30 font-medium">{surfaceLabel}</p>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="relative bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.14] transition-all">
          <div className="h-px bg-gradient-to-r from-amber-400/30 via-amber-400/10 to-transparent" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Calificación</p>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Star className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
            {statsLoading ? (
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            ) : (
              <>
                <p className="text-3xl font-black text-amber-400 leading-none">
                  {Number(rating).toFixed(1)} ★
                </p>
                <p className="text-[10px] text-white/25 mt-2">
                  {c.review_count ?? 0} reseña{(c.review_count ?? 0) !== 1 ? 's' : ''}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Total bookings */}
        <div className="relative bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.14] transition-all">
          <div className="h-px bg-gradient-to-r from-emerald-400/30 via-emerald-400/10 to-transparent" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Reservaciones</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
            {statsLoading ? (
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            ) : (
              <>
                <p className="text-3xl font-black text-emerald-400 leading-none">{totalBookings}</p>
                <p className="text-[10px] text-white/25 mt-2">totales acumuladas</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left col (2/3) ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* ── Basic info (editable) ── */}
          <Panel className="p-5">
            <SectionHead icon={LayoutGrid} title="Información de la Cancha" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">

              {/* Court type */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ace600]/50 mb-1.5">Tipo</p>
                {editMode ? (
                  <select
                    value={formData.court_type}
                    onChange={e => setField('court_type', e.target.value)}
                    className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-[#ace600]/40 appearance-none">
                    {Object.entries(COURT_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ) : (
                  <p className="text-sm font-bold text-white/80">{courtTypeLabel}</p>
                )}
              </div>

              {/* Surface */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ace600]/50 mb-1.5">Superficie</p>
                {editMode ? (
                  <select
                    value={formData.surface}
                    onChange={e => setField('surface', e.target.value)}
                    className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-[#ace600]/40 appearance-none">
                    {Object.entries(COURT_SURFACES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className={cn2('w-2.5 h-2.5 rounded-full shrink-0', surfaceDot)} />
                    <p className="text-sm font-bold text-white/80">{surfaceLabel}</p>
                  </div>
                )}
              </div>

              {/* Hourly rate */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ace600]/50 mb-1.5">Precio / hr</p>
                {editMode ? (
                  <input
                    type="number" min="0" step="0.01"
                    value={formData.hourly_rate}
                    onChange={e => setField('hourly_rate', e.target.value)}
                    className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-[#ace600]/40"
                  />
                ) : (
                  <p className="text-sm font-bold text-white/80">${Number(c.hourly_rate ?? 0).toFixed(2)}</p>
                )}
              </div>

              {/* Capacity */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ace600]/50 mb-1.5">Capacidad</p>
                {editMode ? (
                  <input
                    type="number" min="1" max="100"
                    value={formData.capacity}
                    onChange={e => setField('capacity', Number(e.target.value))}
                    className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-[#ace600]/40"
                  />
                ) : (
                  <p className="text-sm font-bold text-white/80">{c.capacity ?? 4} jugadores</p>
                )}
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ace600]/50 mb-1.5">Estado</p>
                {editMode ? (
                  <select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onChange={e => setField('is_active', e.target.value === 'active')}
                    className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-[#ace600]/40 appearance-none">
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                  </select>
                ) : (
                  <span className={cn2(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black',
                    c.is_active
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400',
                  )}>
                    <span className={cn2('w-1.5 h-1.5 rounded-full', c.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')} />
                    {c.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                )}
              </div>

              {/* Availability */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ace600]/50 mb-1.5">Disponibilidad</p>
                {editMode ? (
                  <select
                    value={formData.is_available ? 'available' : 'unavailable'}
                    onChange={e => setField('is_available', e.target.value === 'available')}
                    className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-[#ace600]/40 appearance-none">
                    <option value="available">Disponible</option>
                    <option value="unavailable">Ocupada</option>
                  </select>
                ) : (
                  <span className={cn2(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black',
                    c.is_available
                      ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                  )}>
                    {c.is_available ? 'Disponible' : 'Ocupada'}
                  </span>
                )}
              </div>
            </div>
          </Panel>

          {/* ── Description ── */}
          <Panel className="p-5">
            <SectionHead icon={Zap} title="Descripción" />
            {editMode ? (
              <textarea
                value={formData.description}
                onChange={e => setField('description', e.target.value)}
                rows={4}
                placeholder="Describe la cancha…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#ace600]/40 resize-none leading-relaxed"
              />
            ) : c.description ? (
              <p className="text-sm text-white/50 leading-relaxed">{c.description}</p>
            ) : (
              <p className="text-sm text-white/20 italic">Sin descripción</p>
            )}
          </Panel>

          {/* ── Features / Equipment ── */}
          <Panel className="p-5">
            <SectionHead icon={Settings}  title="Equipamiento"
              right={
                <Badge className="bg-white/5 border-white/10 text-white/40 text-[10px]">
                  {[c.has_lighting, c.has_net, c.has_equipment].filter(Boolean).length} / 3
                </Badge>
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: 'has_lighting'  as const, icon: Lightbulb, label: 'Iluminación',  active: editMode ? formData.has_lighting  : c.has_lighting  },
                { key: 'has_net'       as const, icon: Wifi,       label: 'Red / Malla',  active: editMode ? formData.has_net       : c.has_net       },
                { key: 'has_equipment' as const, icon: Package,    label: 'Equipamiento', active: editMode ? formData.has_equipment : c.has_equipment },
              ].map(({ key, icon: Ic, label, active }) => (
                <div
                  key={key}
                  onClick={() => editMode && setField(key, !active)}
                  className={cn2(
                    'flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all',
                    editMode ? 'cursor-pointer' : '',
                    active
                      ? 'bg-[#ace600]/[0.06] border-[#ace600]/20 hover:border-[#ace600]/30'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.10]',
                  )}>
                  <div className={cn2(
                    'w-8 h-8 rounded-lg border flex items-center justify-center shrink-0',
                    active ? 'bg-[#ace600]/10 border-[#ace600]/20' : 'bg-white/5 border-white/[0.08]',
                  )}>
                    <Ic className={cn2('w-4 h-4', active ? 'text-[#ace600]' : 'text-white/20')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn2('text-sm font-semibold transition-colors', active ? 'text-white/80' : 'text-white/30')}>
                      {label}
                    </p>
                    <p className={cn2('text-[10px]', active ? 'text-[#ace600]/60' : 'text-white/20')}>
                      {active ? 'Disponible' : 'No disponible'}
                    </p>
                  </div>
                  {active && <Check className="w-3.5 h-3.5 text-[#ace600] shrink-0" />}
                </div>
              ))}
            </div>
          </Panel>

          {/* ── Recent bookings ── */}
          <Panel>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
                  <CalendarDays className="w-3.5 h-3.5 text-[#ace600]" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-white/50">Reservaciones recientes</span>
              </div>
              {statsLoading && <Loader2 className="w-3.5 h-3.5 text-white/20 animate-spin" />}
            </div>

            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                <CalendarDays className="w-8 h-8 text-white/10" />
                <p className="text-sm text-white/20">Sin reservaciones registradas</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {bookings.map(bk => {
                  const s = StatusBooking[bk.status] ?? StatusBooking.pending;
                  return (
                    <div key={bk.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-white/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/70 truncate">
                          {bk.user?.name ?? bk.user?.email ?? 'Usuario'}
                        </p>
                        <p className="text-[11px] text-white/30 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {bk.reservation_date} · {bk.start_time} – {bk.end_time}
                        </p>
                      </div>
                      <span className={cn2('inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black shrink-0', s.cls)}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* ── Right col (1/3) ─────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* ── Venue info ── */}
          <Panel className="p-5">
            <SectionHead icon={Store} title="Sede" />
            <div className="space-y-4">
              <InfoRow label="Nombre de la sede" value={venue?.name} />
              <InfoRow label="Dirección"          value={venue?.address} />
              <InfoRow label="Estado"             value={venue?.state} />
              {venue?.base_price_per_hour != null && (
                <InfoRow label="Precio base / hr" value={`$${Number(venue.base_price_per_hour).toFixed(2)}`} />
              )}
            </div>
          </Panel>

          {/* ── Club info ── */}
          <Panel className="p-5">
            <SectionHead icon={Building2} title="Club" />
            <div className="space-y-4">
              <InfoRow label="Nombre del club" value={club?.name} />
              <InfoRow label="Ciudad / Estado"  value={[club?.city, club?.state].filter(Boolean).join(', ') || null} />
              {club?.contact_email && <InfoRow label="Email"    value={club.contact_email} />}
              {club?.contact_phone && <InfoRow label="Teléfono" value={club.contact_phone} />}
            </div>
            {venue?.id && (
              <button
                onClick={() => navigate(`/admin/dashboard/venues/${venue.id}`)}
                className="mt-4 w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#ace600]/20 transition-all group">
                <span className="text-xs font-semibold text-white/40 group-hover:text-white/70 transition-colors">
                  Ver sede completa
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-[#ace600]/50 transition-colors" />
              </button>
            )}
          </Panel>

          {/* ── Stats panel (if loaded) ── */}
          {stats && (
            <Panel className="p-5">
              <SectionHead icon={BarChart3} title="Estadísticas" />
              <div className="space-y-3">
                {[
                  { label: 'Total partidos',    value: stats.total_matches     },
                  { label: 'Partidos completados', value: stats.completed_matches },
                  { label: 'Tasa de uso',       value: `${Number(stats.utilization_rate ?? 0).toFixed(1)}%` },
                  { label: 'Horas reservadas',  value: c.total_hours_booked ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-xs text-white/35 font-medium">{label}</span>
                    <span className="text-sm font-black text-white/70">{value}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* ── Quick actions ── */}
          {!editMode && (
            <Panel className="p-5">
              <SectionHead icon={Settings} title="Acciones rápidas" />
              <div className="space-y-2">
                {[
                  { label: 'Ver reservaciones', icon: Users,       color: 'text-sky-400',    onClick: () => {} },
                  { label: 'Estadísticas',       icon: BarChart3,   color: 'text-violet-400', onClick: () => {} },
                  { label: 'Ver reseñas',        icon: MessageSquare, color: 'text-amber-400', onClick: () => {} },
                ].map(({ label, icon: Ic, color, onClick }) => (
                  <button key={label} onClick={onClick}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group text-left">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/[0.07] flex items-center justify-center shrink-0">
                      <Ic className={cn2('w-3.5 h-3.5', color)} />
                    </div>
                    <span className="text-sm font-semibold text-white/45 group-hover:text-white/75 transition-colors flex-1">
                      {label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-colors" />
                  </button>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* ── Confirm delete dialog ──────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !deleting && setConfirmDelete(false)}>
          <div
            className="bg-[#0d1117] border border-white/[0.09] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">¿Eliminar cancha?</h3>
                <p className="text-xs text-white/35 mt-0.5">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <p className="text-xs text-white/40 mb-5 leading-relaxed">
              Se eliminará <span className="font-bold text-white/60">"{c.name}"</span> permanentemente.
              Las reservaciones activas deben cancelarse primero.
            </p>
            <div className="flex gap-2">
              <Btn variant="outline" size="sm" className="flex-1" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                Cancelar
              </Btn>
              <Btn variant="danger" size="sm" className="flex-1" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {deleting ? 'Eliminando…' : 'Sí, eliminar'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0d1117] border border-white/10 shadow-2xl shadow-black/50 text-sm font-semibold text-white whitespace-nowrap">
          <div className={cn2(
            'w-5 h-5 rounded-full border flex items-center justify-center',
            toast.type === 'success'
              ? 'bg-[#ace600]/20 border-[#ace600]/30'
              : 'bg-red-500/20 border-red-500/30',
          )}>
            {toast.type === 'success'
              ? <Check className="w-2.5 h-2.5 text-[#ace600]" />
              : <X className="w-2.5 h-2.5 text-red-400" />}
          </div>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
