import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchVenueById } from '../../../store/slices/venuesSlice';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Building2, MapPin, DollarSign, Layers,
  Loader2, Phone, LayoutGrid, CheckCircle2, XCircle,
  Store, ChevronRight,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────
const COURT_TYPES: Record<string, string> = {
  indoor: 'Cubierta', outdoor: 'Aire Libre', covered: 'Techada',
};
const COURT_SURFACES: Record<string, string> = {
  concrete: 'Concreto', asphalt: 'Asfalto', synthetic: 'Sintético',
  wood: 'Madera', rubber: 'Caucho', grass: 'Pasto', clay: 'Arcilla',
};

// ─── Atoms ──────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type?: string }) {
  const styles: Record<string, string> = {
    indoor:  'bg-violet-500/10 border-violet-500/20 text-violet-400',
    outdoor: 'bg-amber-500/10  border-amber-500/20  text-amber-400',
    covered: 'bg-sky-500/10    border-sky-500/20    text-sky-400',
  };
  const cls = styles[type ?? ''] ?? 'bg-white/[0.04] border-white/[0.08] text-white/30';
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest', cls)}>
      {COURT_TYPES[type ?? ''] ?? type ?? '—'}
    </span>
  );
}

function SurfaceDot({ surface }: { surface?: string }) {
  const dots: Record<string, string> = {
    concrete: 'bg-slate-400', asphalt: 'bg-stone-500', synthetic: 'bg-emerald-400',
    wood: 'bg-amber-500', rubber: 'bg-rose-400', grass: 'bg-green-400', clay: 'bg-orange-500',
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-white/45 font-medium">
      <span className={cn('w-2 h-2 rounded-full shrink-0', dots[surface ?? ''] ?? 'bg-white/20')} />
      {COURT_SURFACES[surface ?? ''] ?? surface ?? '—'}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white/70">{value ?? '—'}</p>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedVenue: venue, loading, error } = useSelector(
    (state: RootState) => state.venues,
  );

  useEffect(() => {
    if (id) dispatch(fetchVenueById(id));
  }, [id, dispatch]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
        <p className="text-xs text-white/25">Cargando sede…</p>
      </div>
    );
  }

  // ── Error / Not found ──
  if (error || !venue) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <XCircle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white/40 mb-1">Sede no encontrada</p>
          <p className="text-xs text-white/20">{error ?? 'No se pudo cargar la información.'}</p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard/courts')}
          className="inline-flex items-center gap-1.5 h-8 px-4 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white text-xs font-bold transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver
        </button>
      </div>
    );
  }

  const courts = venue.courts ?? [];

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate('/admin/dashboard/courts')}
          className="mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white transition-all shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
            <h1 className="text-[22px] font-black text-white tracking-tight truncate">{venue.name}</h1>
            <span className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest shrink-0',
              venue.is_active
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400',
            )}>
              {venue.is_active ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
              {venue.is_active ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          {venue.club && (
            <div className="flex items-center gap-1.5 text-xs text-white/30 font-medium">
              <Building2 className="w-3 h-3 shrink-0" />
              {venue.club.name}
              {venue.club.state && <><span className="text-white/15">·</span><span>{venue.club.state}</span></>}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: 'Canchas',    value: courts.length,                        accent: 'text-[#ace600]' },
          { label: 'Precio/hr',  value: venue.base_price_per_hour != null ? `$${Number(venue.base_price_per_hour).toFixed(2)}` : '—', accent: 'text-sky-400' },
          { label: 'Tipo',       value: COURT_TYPES[venue.court_type] ?? venue.court_type ?? '—',     accent: 'text-violet-400' },
          { label: 'Superficie', value: COURT_SURFACES[venue.surface_type] ?? venue.surface_type ?? '—', accent: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">{s.label}</p>
            <p className={cn('text-xl font-black leading-none', s.accent)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Venue info ─────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
          <Store className="w-4 h-4 text-white/25" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/35">Información de la Sede</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <InfoItem label="Nombre" value={venue.name} />
          <InfoItem label="Estado" value={venue.state} />
          <InfoItem label="Dirección" value={venue.address} />
          {venue.phone && <InfoItem label="Teléfono" value={venue.phone} />}
          {venue.whatsapp && <InfoItem label="WhatsApp" value={venue.whatsapp} />}
          <InfoItem label="N° Canchas (config.)" value={venue.number_of_courts} />
        </div>
        {venue.description && (
          <div className="pt-3 border-t border-white/[0.05]">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">Descripción</p>
            <p className="text-sm text-white/50 leading-relaxed">{venue.description}</p>
          </div>
        )}
        {venue.facilities && venue.facilities.length > 0 && (
          <div className="pt-3 border-t border-white/[0.05]">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">Facilidades</p>
            <div className="flex flex-wrap gap-2">
              {venue.facilities.map(f => (
                <span key={f} className="inline-flex items-center px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] text-white/50 font-medium">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Courts list ────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-white/25" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/35">Canchas en esta Sede</span>
          </div>
          <span className="text-[11px] text-white/20 font-semibold">{courts.length} cancha{courts.length !== 1 ? 's' : ''}</span>
        </div>

        {courts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Layers className="w-5 h-5 text-white/10" />
            </div>
            <p className="text-sm font-bold text-white/25">Sin canchas registradas</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {courts.map(court => (
              <button
                key={court.id}
                onClick={() => navigate(`/admin/dashboard/courts/${court.id}`)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group text-left">

                {/* Number */}
                <div className="w-7 h-7 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-[#ace600]">{court.court_number ?? '·'}</span>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors truncate">{court.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <TypeBadge type={court.court_type} />
                    <SurfaceDot surface={court.surface_type} />
                    {court.hourly_rate != null && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-white/35 font-semibold">
                        <DollarSign className="w-3 h-3" />{Number(court.hourly_rate).toFixed(2)}/hr
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black',
                    court.is_active
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400',
                  )}>
                    {court.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                  {court.is_available !== undefined && (
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black',
                      court.is_available
                        ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                        : 'bg-white/[0.04] border-white/[0.08] text-white/20',
                    )}>
                      {court.is_available ? 'Disponible' : 'Ocupada'}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
