'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchVenuesByClub, createVenue, updateVenue, deleteVenue,
} from '@/store/slices/venuesSlice';
import type { Venue } from '@/store/slices/venuesSlice';
import { Input } from '@/components/ui/input';
import { StateAutocomplete } from '@/components/ui/StateAutocomplete';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertCircle, Plus, Trash2, Edit2, Eye, ChevronLeft, ChevronRight,
  Loader2, MapPin, DollarSign, LayoutGrid, Layers, Phone, X,
  Clock, CheckCircle2, Info, BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const inputCls =
  'h-10 rounded-xl text-sm bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20 ' +
  'focus-visible:ring-0 focus-visible:border-[#ace600]/50 focus-visible:bg-[#ace600]/[0.03] transition-all';
const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5';
const selectTriggerCls =
  'h-10 rounded-xl text-sm bg-white/[0.04] border-white/[0.09] text-white ' +
  'focus:ring-0 focus:border-[#ace600]/50 transition-all data-[placeholder]:text-white/20';

// ─── Config ───────────────────────────────────────────────────────────────────
const COURT_TYPES   = ['covered', 'indoor', 'outdoor'] as const;
const SURFACE_TYPES = ['wood', 'concrete', 'acrylic', 'tartan', 'other'] as const;
const FILTER_OPTIONS = [
  { value: 'all',   label: 'Todos'    },
  { value: 'true',  label: 'Activos'  },
  { value: 'false', label: 'Inactivos' },
];
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABEL: Record<string, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue',
  friday: 'Vie', saturday: 'Sáb', sunday: 'Dom',
};
const labelOf = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

// ─── Types ────────────────────────────────────────────────────────────────────
type DayHours = { open: string; close: string; closed: boolean };
type OperatingHours = Record<string, DayHours>;
type FormData = {
  name: string; state: string; address: string; phone: string; whatsapp: string;
  court_type: string; surface_type: string; base_price_per_hour: number;
  number_of_courts: number; description: string; facilities: string[];
  operating_hours: OperatingHours;
};

const defaultDayHours = (): DayHours => ({ open: '08:00', close: '22:00', closed: false });
const defaultOperatingHours = (): OperatingHours =>
  Object.fromEntries(DAYS.map(d => [d, defaultDayHours()]));

const emptyForm: FormData = {
  name: '', state: '', address: '', phone: '', whatsapp: '',
  court_type: 'outdoor', surface_type: 'concrete',
  base_price_per_hour: 0, number_of_courts: 1, description: '', facilities: [],
  operating_hours: defaultOperatingHours(),
};

// ─── Field atom ───────────────────────────────────────────────────────────────
function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>
        {label}{req && <span className="text-[#ace600] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Venue Detail Modal ───────────────────────────────────────────────────────
function VenueDetailModal({
  venue, open, onClose, onEdit,
}: { venue: Venue | null; open: boolean; onClose: () => void; onEdit: (v: Venue) => void }) {
  if (!venue) return null;
  const hours = venue.operating_hours as OperatingHours | undefined;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-[#0d1117] border-white/[0.09] rounded-2xl p-0 overflow-hidden max-w-lg max-h-[90vh] overflow-y-auto [&>button]:hidden">
        {/* accent */}
        <div className={cn(
          'h-0.5 bg-gradient-to-r to-transparent',
          venue.is_active ? 'from-[#ace600]/60 via-[#ace600]/30' : 'from-white/20 via-white/10',
        )} />

        {/* header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className="text-lg font-bold text-white">{venue.name}</h2>
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider',
                venue.is_active
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-white/[0.04] border-white/[0.08] text-white/25',
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', venue.is_active ? 'bg-emerald-400' : 'bg-white/20')} />
                {venue.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="text-xs text-white/30 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />{venue.address}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEdit(venue)}
              className="h-8 px-3 rounded-xl text-[11px] font-bold border border-[#ace600]/20 bg-[#ace600]/[0.06] hover:bg-[#ace600]/[0.12] text-[#ace600] transition-all"
            >
              Editar
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-white/30 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* meta grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: MapPin,     label: 'Estado',      value: venue.state },
              { icon: LayoutGrid, label: 'Canchas',     value: `${venue.number_of_courts}` },
              { icon: Layers,     label: 'Tipo',        value: labelOf(venue.court_type) },
              { icon: DollarSign, label: 'Precio/hora', value: `$${venue.base_price_per_hour.toLocaleString('en-US')}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3">
                <Icon className="w-3.5 h-3.5 text-white/20 shrink-0" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">{label}</p>
                  <p className="text-sm font-semibold text-white/65">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* contact */}
          {(venue.phone || venue.whatsapp) && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Contacto</p>
              <div className="flex flex-wrap gap-3">
                {venue.phone && (
                  <span className="flex items-center gap-1.5 text-xs text-white/50">
                    <Phone className="w-3 h-3 text-white/20" /> {venue.phone}
                  </span>
                )}
                {venue.whatsapp && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400/60">
                    <Phone className="w-3 h-3" /> WhatsApp: {venue.whatsapp}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* description */}
          {venue.description && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Descripción</p>
              <p className="text-sm text-white/45 leading-relaxed">{venue.description}</p>
            </div>
          )}

          {/* facilities */}
          {Array.isArray(venue.facilities) && venue.facilities.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                Instalaciones ({venue.facilities.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {venue.facilities.map(f => (
                  <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600] text-[11px] font-semibold">
                    <CheckCircle2 className="w-2.5 h-2.5" />{f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* operating hours */}
          {hours && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Horario</p>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                {DAYS.map((day, i) => {
                  const slot = hours[day];
                  const closed = slot?.closed || !slot;
                  return (
                    <div key={day} className={cn(
                      'flex items-center justify-between px-4 py-2 text-xs',
                      i !== DAYS.length - 1 && 'border-b border-white/[0.04]',
                    )}>
                      <span className="font-semibold text-white/40 w-8">{DAY_LABEL[day]}</span>
                      {closed ? (
                        <span className="text-white/20">Cerrado</span>
                      ) : (
                        <span className="text-white/55 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-white/20" />
                          {slot.open} – {slot.close}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* courts list if available */}
          {Array.isArray(venue.courts) && venue.courts.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                Canchas ({venue.courts.length})
              </p>
              <div className="space-y-1.5">
                {venue.courts.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-xs">
                    <span className="text-white/60 font-semibold">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">{labelOf(c.court_type)}</span>
                      <span className={cn(
                        'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                        c.is_available ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400',
                      )}>
                        {c.is_available ? '●' : '○'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* meta */}
          <div className="pt-2 border-t border-white/[0.05] flex flex-wrap gap-4 text-[11px] text-white/20">
            {venue.created_at && <span>Creado: {new Date(venue.created_at).toLocaleDateString('en-US')}</span>}
            <span>ID: {venue.id}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PartnerVenuesManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { venues, loading, error } = useSelector((s: RootState) => s.venues);
  const user = useSelector((s: RootState) => s.auth.user);
  // Partners use their own user.id as the club/partner identifier
  const partnerId = (user as any)?.club_id || user?.id;

  const [isOpen,      setIsOpen]      = useState(false);
  const [isEdit,      setIsEdit]      = useState(false);
  const [editId,      setEditId]      = useState<string | null>(null);
  const [detailVenue, setDetailVenue] = useState<Venue | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);
  const [filter,      setFilter]      = useState('all');
  const [form,        setForm]        = useState<FormData>(emptyForm);
  const [facilityInput, setFacilityInput] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'hours'>('basic');
  const PER_PAGE = 9;

  useEffect(() => {
    if (!partnerId) return;
    dispatch(fetchVenuesByClub({
      clubId: partnerId, page, limit: PER_PAGE,
      isActive: filter === 'true' ? true : filter === 'false' ? false : undefined,
    }));
  }, [dispatch, partnerId, page, filter]);

  const setF = (k: keyof FormData, v: any) => setForm(p => ({ ...p, [k]: v }));
  const setHours = (day: string, field: keyof DayHours, val: string | boolean) =>
    setForm(p => ({
      ...p,
      operating_hours: {
        ...p.operating_hours,
        [day]: { ...p.operating_hours[day], [field]: val },
      },
    }));

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setIsEdit(false);
    setActiveTab('basic');
    setFacilityInput('');
    setIsOpen(true);
  };

  const openEdit = (v: Venue) => {
    const oh = (v.operating_hours as OperatingHours | undefined) ?? defaultOperatingHours();
    setForm({
      name: v.name, state: v.state, address: v.address,
      phone: v.phone ?? '', whatsapp: v.whatsapp ?? '',
      court_type: v.court_type, surface_type: v.surface_type,
      base_price_per_hour: v.base_price_per_hour,
      number_of_courts: v.number_of_courts,
      description: v.description ?? '',
      facilities: v.facilities ?? [],
      operating_hours: oh,
    });
    setEditId(v.id);
    setIsEdit(true);
    setActiveTab('basic');
    setFacilityInput('');
    setIsOpen(true);
  };

  const closeModal  = () => { setIsOpen(false); setEditId(null); setIsEdit(false); };
  const openDetail  = (v: Venue) => { setDetailVenue(v); setIsDetailOpen(true); };
  const closeDetail = () => { setIsDetailOpen(false); setDetailVenue(null); };

  const addFacility = () => {
    const val = facilityInput.trim();
    if (!val) return;
    if (!form.facilities.includes(val)) setF('facilities', [...form.facilities, val]);
    setFacilityInput('');
  };
  const removeFacility = (f: string) => setF('facilities', form.facilities.filter(x => x !== f));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Ingresa el nombre del venue'); return; }
    if (!form.state.trim()) { toast.error('Selecciona el estado'); return; }
    if (!form.address.trim()) { toast.error('Ingresa la dirección'); return; }
    try {
      const payload = { ...form, club_id: partnerId };
      if (isEdit && editId) {
        await dispatch(updateVenue({ id: editId, data: payload })).unwrap();
        toast.success('Venue actualizado');
      } else {
        await dispatch(createVenue(payload)).unwrap();
        toast.success('Venue creado');
      }
      closeModal();
      dispatch(fetchVenuesByClub({
        clubId: partnerId!, page, limit: PER_PAGE,
        isActive: filter === 'true' ? true : filter === 'false' ? false : undefined,
      }));
    } catch (e: any) {
      toast.error(e?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este venue? Esta acción no se puede deshacer.')) return;
    try {
      await dispatch(deleteVenue(id)).unwrap();
      toast.success('Venue eliminado');
    } catch (e: any) {
      toast.error(e?.message || 'Error al eliminar');
    }
  };

  const filtered   = venues.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  // ── no partner id ──────────────────────────────────────────────────────────
  if (!partnerId) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-amber-400" />
      </div>
      <p className="text-sm text-white/30 text-center max-w-[260px] leading-relaxed">
        No se pudo cargar el perfil del partner. Asegúrate de estar autenticado.
      </p>
    </div>
  );

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[22px] font-bold text-white tracking-tight">Gestión de Venues</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
              {filtered.length} venues
            </span>
          </div>
          <p className="text-xs text-white/25">Administra tus venues y canchas</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_14px_rgba(172,230,0,0.18)] transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar Venue
        </button>
      </div>

      {/* ── Search + Filter ── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
          <Input
            className={cn(inputCls, 'pl-10 pr-9')}
            placeholder="Buscar venues…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {FILTER_OPTIONS.map(o => (
            <button key={o.value} onClick={() => { setFilter(o.value); setPage(1); }}
              className={cn(
                'h-10 px-4 rounded-xl text-[11px] font-bold border transition-all',
                filter === o.value
                  ? 'bg-[#ace600] border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                  : 'bg-white/[0.03] border-white/[0.07] text-white/30 hover:text-white/55 hover:border-white/[0.12]',
              )}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* ── Content ── */}
      {loading && venues.length === 0 ? (
        <div className="flex items-center justify-center h-56">
          <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
        </div>

      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white/10" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/35 mb-1">Sin venues encontrados</p>
            <p className="text-xs text-white/20 mb-4">
              {search ? 'Prueba con otro nombre' : 'Crea tu primer venue para comenzar'}
            </p>
            {!search && (
              <button onClick={openCreate}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black transition-all">
                <Plus className="w-3.5 h-3.5" /> Crear Venue
              </button>
            )}
          </div>
        </div>

      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginated.map(venue => (
              <div key={venue.id}
                className="group bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all">
                <div className={cn('h-0.5', venue.is_active
                  ? 'bg-gradient-to-r from-[#ace600]/60 via-[#ace600]/30 to-transparent'
                  : 'bg-white/[0.04]')} />

                <div className="p-4">
                  {/* name + status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate">
                        {venue.name}
                      </p>
                      <p className="text-[11px] text-white/25 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />{venue.address}
                      </p>
                    </div>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0',
                      venue.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-white/[0.04] text-white/25 border-white/[0.08]',
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', venue.is_active ? 'bg-emerald-400' : 'bg-white/20')} />
                      {venue.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {/* meta grid */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {[
                      { icon: MapPin,     label: 'Estado',    value: venue.state },
                      { icon: LayoutGrid, label: 'Canchas',   value: `${venue.number_of_courts}` },
                      { icon: Layers,     label: 'Tipo',      value: labelOf(venue.court_type) },
                      { icon: DollarSign, label: 'Precio/hr', value: `$${venue.base_price_per_hour}` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-2 px-2.5 py-2 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                        <Icon className="w-3 h-3 text-white/20 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 leading-none mb-0.5">{label}</p>
                          <p className="text-[11px] font-semibold text-white/60 truncate">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* actions */}
                  <div className="flex gap-1.5">
                    <button onClick={() => openDetail(venue)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-xl text-[11px] font-bold border border-[#ace600]/20 bg-[#ace600]/[0.05] hover:bg-[#ace600]/[0.10] text-[#ace600] transition-all">
                      <Eye className="w-3 h-3" /> Ver
                    </button>
                    <button onClick={() => openEdit(venue)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-xl text-[11px] font-bold border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-white/50 hover:text-white transition-all">
                      <Edit2 className="w-3 h-3" /> Editar
                    </button>
                    <button onClick={() => handleDelete(venue.id)}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.05] hover:bg-red-500/[0.12] text-red-400 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/[0.05] transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={cn(
                    'w-8 h-8 rounded-xl text-[11px] font-bold border transition-all',
                    n === page
                      ? 'bg-[#ace600] border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                      : 'border-white/[0.07] text-white/30 hover:text-white hover:bg-white/[0.05]',
                  )}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/[0.05] transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Create / Edit Modal ── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#0d1117] border-white/[0.09] rounded-2xl p-0 overflow-hidden max-w-lg max-h-[90vh] overflow-y-auto">
          <div className={cn('h-0.5', isEdit
            ? 'bg-gradient-to-r from-sky-400/60 via-sky-400/30 to-transparent'
            : 'bg-gradient-to-r from-[#ace600]/60 via-[#ace600]/30 to-transparent')} />

          <div className="p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-3 mb-1">
                <div className={cn(
                  'w-8 h-8 rounded-xl border flex items-center justify-center shrink-0',
                  isEdit ? 'bg-sky-500/10 border-sky-500/20' : 'bg-[#ace600]/10 border-[#ace600]/20',
                )}>
                  {isEdit ? <Edit2 className="w-4 h-4 text-sky-400" /> : <Plus className="w-4 h-4 text-[#ace600]" />}
                </div>
                <DialogTitle className="text-base font-bold text-white">
                  {isEdit ? 'Editar Venue' : 'Nuevo Venue'}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-white/25 ml-11">
                {isEdit ? 'Actualiza los detalles del venue.' : 'Agrega un nuevo venue a tu red de instalaciones.'}
              </DialogDescription>
            </DialogHeader>

            {/* Tab switcher */}
            <div className="flex gap-1.5 mb-5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              {[
                { key: 'basic', label: 'Información básica' },
                { key: 'hours', label: 'Horario' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    'flex-1 h-8 rounded-lg text-[11px] font-bold transition-all',
                    activeTab === tab.key
                      ? isEdit ? 'bg-sky-500 text-white' : 'bg-[#ace600] text-black'
                      : 'text-white/30 hover:text-white/60',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'basic' ? (
              <div className="space-y-4">
                <Field label="Nombre del Venue" req>
                  <Input className={inputCls} placeholder="Ej. Canchas Norte"
                    value={form.name} onChange={e => setF('name', e.target.value)} />
                </Field>
                <Field label="Estado" req>
                  <StateAutocomplete value={form.state} onChange={v => setF('state', v)} placeholder="Buscar estado…" />
                </Field>
                <Field label="Dirección" req>
                  <Input className={inputCls} placeholder="Calle, número, colonia"
                    value={form.address} onChange={e => setF('address', e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Teléfono">
                    <Input className={inputCls} placeholder="+52 55 0000 0000"
                      value={form.phone} onChange={e => setF('phone', e.target.value)} />
                  </Field>
                  <Field label="WhatsApp">
                    <Input className={inputCls} placeholder="+52 55 0000 0000"
                      value={form.whatsapp} onChange={e => setF('whatsapp', e.target.value)} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tipo de Cancha" req>
                    <Select value={form.court_type} onValueChange={v => setF('court_type', v)}>
                      <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl">
                        {COURT_TYPES.map(t => (
                          <SelectItem key={t} value={t} className="text-white/70 focus:bg-white/[0.06] focus:text-white">{labelOf(t)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Superficie" req>
                    <Select value={form.surface_type} onValueChange={v => setF('surface_type', v)}>
                      <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl">
                        {SURFACE_TYPES.map(t => (
                          <SelectItem key={t} value={t} className="text-white/70 focus:bg-white/[0.06] focus:text-white">{labelOf(t)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Precio Base / Hora ($)" req>
                    <Input type="number" className={inputCls} placeholder="0.00"
                      value={form.base_price_per_hour}
                      onChange={e => setF('base_price_per_hour', parseFloat(e.target.value) || 0)} />
                  </Field>
                  <Field label="Número de Canchas" req>
                    <Input type="number" className={inputCls} placeholder="1" min={1}
                      value={form.number_of_courts}
                      onChange={e => setF('number_of_courts', parseInt(e.target.value) || 1)} />
                  </Field>
                </div>
                <Field label="Descripción">
                  <textarea rows={3} placeholder="Descripción del venue…" value={form.description}
                    onChange={e => setF('description', e.target.value)}
                    className={cn(
                      'w-full rounded-xl text-sm px-3.5 py-2.5 resize-y',
                      'bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20',
                      'outline-none focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03] transition-all',
                    )} />
                </Field>

                {/* Facilities */}
                <Field label="Instalaciones">
                  <div className="flex gap-2 mb-2">
                    <Input
                      className={cn(inputCls, 'flex-1')}
                      placeholder="Ej. Estacionamiento, Cafetería…"
                      value={facilityInput}
                      onChange={e => setFacilityInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFacility(); } }}
                    />
                    <button onClick={addFacility}
                      className="h-10 px-3 rounded-xl text-[11px] font-bold bg-[#ace600]/10 hover:bg-[#ace600]/20 text-[#ace600] border border-[#ace600]/20 transition-all">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {form.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {form.facilities.map(f => (
                        <span key={f}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600] text-[11px] font-semibold">
                          {f}
                          <button onClick={() => removeFacility(f)} className="hover:text-white transition-colors ml-0.5">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </Field>
              </div>
            ) : (
              /* ── Hours tab ── */
              <div className="space-y-2">
                <p className="text-xs text-white/30 mb-3">Configura el horario de operación para cada día de la semana.</p>
                {DAYS.map(day => {
                  const slot = form.operating_hours[day] ?? defaultDayHours();
                  return (
                    <div key={day} className="flex items-center gap-3 px-3.5 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                      <span className="w-8 text-[11px] font-bold text-white/40 shrink-0">{DAY_LABEL[day]}</span>
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={!slot.closed}
                          onChange={e => setHours(day, 'closed', !e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#ace600] cursor-pointer"
                        />
                        <span className="text-[11px] text-white/30">Abierto</span>
                      </label>
                      {!slot.closed && (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={slot.open}
                            onChange={e => setHours(day, 'open', e.target.value)}
                            className="flex-1 h-8 rounded-lg text-xs bg-white/[0.04] border border-white/[0.09] text-white px-2 outline-none focus:border-[#ace600]/50"
                          />
                          <span className="text-white/20 text-xs">–</span>
                          <input
                            type="time"
                            value={slot.close}
                            onChange={e => setHours(day, 'close', e.target.value)}
                            className="flex-1 h-8 rounded-lg text-xs bg-white/[0.04] border border-white/[0.09] text-white px-2 outline-none focus:border-[#ace600]/50"
                          />
                        </div>
                      )}
                      {slot.closed && (
                        <span className="flex-1 text-xs text-white/20">Cerrado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* actions */}
            <div className="flex gap-2 mt-6 pt-4 border-t border-white/[0.06]">
              <button onClick={closeModal}
                className="flex-1 h-10 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white transition-all">
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className={cn(
                  'flex-1 h-10 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50',
                  isEdit
                    ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-[0_0_12px_rgba(14,165,233,0.18)]'
                    : 'bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.18)]',
                )}>
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
                  : isEdit ? 'Actualizar Venue' : 'Crear Venue'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Venue Detail Modal ── */}
      <VenueDetailModal
        venue={detailVenue}
        open={isDetailOpen}
        onClose={closeDetail}
        onEdit={v => { closeDetail(); openEdit(v); }}
      />
    </div>
  );
}
