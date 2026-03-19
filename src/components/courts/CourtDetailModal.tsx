'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Court } from '@/types/api';
import { cn } from '@/lib/utils';
import {
  X, Star, Clock, DollarSign, Users, Ruler, Layers,
  Zap, ShieldCheck, Package, CheckCircle2, XCircle,
  Wrench, Calendar, Tag, BarChart3, TrendingUp, Eye,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────
const COURT_TYPE_LABEL: Record<string, string> = {
  indoor: 'Cubierta', outdoor: 'Abierta', covered: 'Techada',
};
const SURFACE_LABEL: Record<string, string> = {
  concrete: 'Concreto', asphalt: 'Asfalto', synthetic: 'Sintético',
  grass: 'Pasto', clay: 'Arcilla', wood: 'Madera', acrylic: 'Acrílico',
  tartan: 'Tartán', other: 'Otro',
};
const DAY_LABEL: Record<string, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue',
  friday: 'Vie', saturday: 'Sáb', sunday: 'Dom',
};
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const fmt = (v: number | string | undefined) =>
  v !== undefined && v !== null && v !== '' ? `$${Number(v).toLocaleString('en-US')}` : '—';

// ─── sub-components ───────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2.5">
      {children}
    </p>
  );
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border',
      accent
        ? 'bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]'
        : 'bg-white/[0.04] border-white/[0.08] text-white/50',
    )}>
      {children}
    </span>
  );
}

function StatBox({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: React.FC<any> }) {
  return (
    <div className="flex flex-col gap-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3">
      <div className="flex items-center gap-1.5 text-white/25">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-base font-bold text-white leading-none">{value}</p>
    </div>
  );
}

function Flag({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {on
        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        : <XCircle className="w-3.5 h-3.5 text-white/15 shrink-0" />}
      <span className={cn('text-xs', on ? 'text-white/65' : 'text-white/20')}>{label}</span>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────
interface Props {
  court: Court | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (court: Court) => void;
}

export default function CourtDetailModal({ court, open, onClose, onEdit }: Props) {
  if (!court) return null;

  const hours = court.operating_hours as Record<string, { open: string; close: string; closed?: boolean }> | undefined;
  const amenities: string[] = Array.isArray(court.amenities) ? court.amenities : [];
  const equipment: string[] = Array.isArray(court.equipment_included) ? court.equipment_included : [];
  const photos: string[] = Array.isArray(court.photos) ? court.photos : [];
  const rating = typeof court.average_rating === 'number' ? court.average_rating :
    typeof court.average_rating === 'string' ? parseFloat(court.average_rating) : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#0d1117] border-white/[0.09] rounded-2xl p-0 overflow-hidden max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">

        {/* top accent */}
        <div className={cn(
          'h-0.5 bg-gradient-to-r to-transparent',
          court.is_maintenance
            ? 'from-amber-400/60 via-amber-400/30'
            : court.is_available
              ? 'from-[#ace600]/60 via-[#ace600]/30'
              : 'from-red-400/60 via-red-400/30',
        )} />

        {/* ── header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-white leading-tight">{court.name}</h2>
              {court.is_featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                  <Star className="w-2.5 h-2.5" /> Destacada
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* type */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50 text-[11px] font-semibold">
                <Layers className="w-3 h-3" />
                {COURT_TYPE_LABEL[court.court_type] ?? court.court_type}
              </span>
              {/* surface */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50 text-[11px] font-semibold">
                <Tag className="w-3 h-3" />
                {SURFACE_LABEL[court.surface] ?? court.surface}
              </span>
              {/* availability */}
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold',
                court.is_maintenance
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : court.is_available
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400',
              )}>
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  court.is_maintenance ? 'bg-amber-400 animate-pulse' :
                  court.is_available ? 'bg-emerald-400' : 'bg-red-400',
                )} />
                {court.is_maintenance ? 'En mantenimiento' : court.is_available ? 'Disponible' : 'No disponible'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(court)}
                className="h-8 px-3 rounded-xl text-[11px] font-bold border border-[#ace600]/20 bg-[#ace600]/[0.06] hover:bg-[#ace600]/[0.12] text-[#ace600] transition-all"
              >
                Editar
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-white/30 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* ── stats row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatBox label="Tarifa/Hora" value={fmt(court.hourly_rate)} icon={DollarSign} />
            <StatBox label="Tarifa Diaria" value={fmt(court.daily_rate)} icon={DollarSign} />
            <StatBox label="Capacidad" value={court.capacity ? `${court.capacity} pers.` : '—'} icon={Users} />
            <StatBox
              label="Rating"
              value={rating !== null ? (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {rating.toFixed(1)}
                  <span className="text-xs text-white/30 font-normal">({court.review_count ?? 0})</span>
                </span>
              ) : '—'}
              icon={Star}
            />
          </div>

          {/* ── second row: bookings + dimensions ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <StatBox label="Reservas Totales" value={court.total_bookings ?? 0} icon={BarChart3} />
            <StatBox label="Horas Reservadas" value={
              court.total_hours_booked !== undefined ? `${Number(court.total_hours_booked).toFixed(0)} h` : '—'
            } icon={TrendingUp} />
            {court.member_discount && Number(court.member_discount) > 0 ? (
              <StatBox label="Descuento Miembro" value={`${court.member_discount}%`} icon={ShieldCheck} />
            ) : (
              <StatBox label="Tarifa Miembro" value={fmt(court.member_rate)} icon={ShieldCheck} />
            )}
          </div>

          {/* ── description ── */}
          {court.description && (
            <div>
              <SectionTitle>Descripción</SectionTitle>
              <p className="text-sm text-white/45 leading-relaxed">{court.description}</p>
            </div>
          )}

          {/* ── dimensions ── */}
          {court.dimensions && (
            <div>
              <SectionTitle>Dimensiones</SectionTitle>
              <div className="flex items-center gap-2 text-sm text-white/55">
                <Ruler className="w-4 h-4 text-white/20" />
                {typeof court.dimensions === 'object'
                  ? `${(court.dimensions as any).width ?? '?'}m × ${(court.dimensions as any).length ?? '?'}m`
                  : String(court.dimensions)}
              </div>
            </div>
          )}

          {/* ── feature flags ── */}
          <div>
            <SectionTitle>Características</SectionTitle>
            <div className="grid grid-cols-3 gap-y-2 gap-x-4">
              <Flag label="Iluminación" on={!!court.has_lighting} />
              <Flag label="Red incluida" on={!!court.has_net} />
              <Flag label="Equipo incl." on={!!court.has_equipment} />
            </div>
          </div>

          {/* ── amenities ── */}
          {amenities.length > 0 && (
            <div>
              <SectionTitle>Amenidades ({amenities.length})</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {amenities.map((a) => <Chip key={a} accent>{a}</Chip>)}
              </div>
            </div>
          )}

          {/* ── equipment ── */}
          {equipment.length > 0 && (
            <div>
              <SectionTitle>Equipamiento incluido ({equipment.length})</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {equipment.map((e) => <Chip key={e}><Package className="w-3 h-3 mr-1" />{e}</Chip>)}
              </div>
            </div>
          )}

          {/* ── operating hours ── */}
          {hours && (
            <div>
              <SectionTitle>Horario de operación</SectionTitle>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                {DAYS.map((day, i) => {
                  const slot = hours[day];
                  const closed = slot?.closed || !slot;
                  return (
                    <div
                      key={day}
                      className={cn(
                        'flex items-center justify-between px-4 py-2.5 text-xs',
                        i !== DAYS.length - 1 && 'border-b border-white/[0.04]',
                      )}
                    >
                      <span className="font-semibold text-white/40 w-8">{DAY_LABEL[day]}</span>
                      {closed ? (
                        <span className="text-white/20">Cerrado</span>
                      ) : (
                        <span className="text-white/60 flex items-center gap-1.5">
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

          {/* ── maintenance info ── */}
          {court.is_maintenance && (
            <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <SectionTitle>En Mantenimiento</SectionTitle>
              </div>
              {court.maintenance_notes && (
                <p className="text-sm text-amber-400/70 mb-2">{court.maintenance_notes}</p>
              )}
              {(court.maintenance_start || court.maintenance_end) && (
                <div className="flex items-center gap-2 text-xs text-amber-400/50">
                  <Calendar className="w-3.5 h-3.5" />
                  {court.maintenance_start && (
                    <span>Desde: {new Date(court.maintenance_start).toLocaleDateString('en-US')}</span>
                  )}
                  {court.maintenance_end && (
                    <span>Hasta: {new Date(court.maintenance_end).toLocaleDateString('en-US')}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── notes ── */}
          {court.notes && (
            <div>
              <SectionTitle>Notas internas</SectionTitle>
              <p className="text-sm text-white/35 leading-relaxed italic">{court.notes}</p>
            </div>
          )}

          {/* ── photos ── */}
          {photos.length > 0 && (
            <div>
              <SectionTitle>Fotos ({photos.length})</SectionTitle>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── meta ── */}
          <div className="pt-2 border-t border-white/[0.05] flex flex-wrap gap-4 text-[11px] text-white/20">
            {court.created_at && (
              <span>Creado: {new Date(court.created_at).toLocaleDateString('en-US')}</span>
            )}
            {court.updated_at && (
              <span>Actualizado: {new Date(court.updated_at).toLocaleDateString('en-US')}</span>
            )}
            <span>ID: {court.id}</span>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
