'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Court } from '@/types/api';
import { cn } from '@/lib/utils';
import { COURT_SURFACES as SURFACE_LABEL } from '@/constants/constants';
import {
  X, Star, Clock, DollarSign, Users, Ruler, Layers,
  Zap, ShieldCheck, Package, CheckCircle2, XCircle,
  Wrench, Calendar, Tag, BarChart3, TrendingUp, Edit3,
  Image as ImageIcon,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const COURT_TYPE_LABEL: Record<string, string> = {
  indoor: 'Cubierta', outdoor: 'Abierta', covered: 'Techada',
};
const DAY_LABEL: Record<string, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue',
  friday: 'Vie', saturday: 'Sáb', sunday: 'Dom',
};
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const fmt = (v: number | string | undefined) =>
  v !== undefined && v !== null && v !== ''
    ? `$${Number(v).toLocaleString('en-US')}`
    : '—';

// ─── Atoms ────────────────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, iconColor, iconBg, title }: {
  icon: React.ElementType; iconColor: string; iconBg: string; title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={cn('w-6 h-6 rounded-lg border flex items-center justify-center shrink-0', iconBg)}>
        <Icon className={cn('w-3 h-3', iconColor)} />
      </div>
      <p className="text-[10px] font-black text-white/25 uppercase tracking-widest">{title}</p>
      <div className="flex-1 h-px bg-white/[0.04]" />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: React.ReactNode; icon: React.ElementType; accent?: string;
}) {
  return (
    <div className="flex flex-col gap-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-4 py-3.5 hover:border-white/[0.10] transition-colors">
      <div className={cn('w-7 h-7 rounded-xl border flex items-center justify-center', accent ?? 'bg-white/[0.04] border-white/[0.08]')}>
        <Icon className={cn('w-3.5 h-3.5', accent ? '' : 'text-white/25')} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-base font-black text-white leading-none">{value ?? '—'}</p>
      </div>
    </div>
  );
}

function FeatureFlag({ label, on }: { label: string; on: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors',
      on
        ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-400'
        : 'bg-white/[0.02] border-white/[0.05] text-white/20',
    )}>
      {on
        ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        : <XCircle className="w-3.5 h-3.5 shrink-0 text-white/15" />}
      {label}
    </div>
  );
}

function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border',
      accent
        ? 'bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]'
        : 'bg-white/[0.04] border-white/[0.08] text-white/45',
    )}>
      {children}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props {
  court: Court | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (court: Court) => void;
}

export default function CourtDetailModal({ court, open, onClose, onEdit }: Props) {
  if (!court) return null;

  const hours     = court.operating_hours as Record<string, { open: string; close: string; closed?: boolean }> | undefined;
  const amenities = Array.isArray(court.amenities)          ? court.amenities          : [];
  const equipment = Array.isArray(court.equipment_included) ? court.equipment_included : [];
  const photos    = Array.isArray(court.photos)             ? court.photos             : [];
  const rating    = typeof court.average_rating === 'number' ? court.average_rating :
                    typeof court.average_rating === 'string' ? parseFloat(court.average_rating) : null;

  const statusColor = court.is_maintenance
    ? { from: 'from-amber-400/50', dot: 'bg-amber-400 animate-pulse', ring: 'bg-amber-500/10 border-amber-500/20 text-amber-400', label: 'En mantenimiento' }
    : court.is_available
      ? { from: 'from-[#ace600]/50', dot: 'bg-emerald-400', ring: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', label: 'Disponible' }
      : { from: 'from-red-400/50', dot: 'bg-red-400', ring: 'bg-red-500/10 border-red-500/20 text-red-400', label: 'No disponible' };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-[#080c10] border-white/[0.07] rounded-2xl p-0 overflow-hidden max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">

        {/* ── accent bar ── */}
        <div className={cn('h-0.5 bg-gradient-to-r via-transparent to-transparent', statusColor.from)} />

        {/* ── header ── */}
        <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">

              {/* name + featured */}
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <h2 className="text-2xl font-black text-white leading-tight tracking-tight">{court.name}</h2>
                {court.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                    <Star className="w-2.5 h-2.5 fill-amber-400" /> Destacada
                  </span>
                )}
              </div>

              {/* meta pills */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/45 text-[11px] font-bold">
                  <Layers className="w-3 h-3" />
                  {COURT_TYPE_LABEL[court.court_type] ?? court.court_type}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/45 text-[11px] font-bold">
                  <Tag className="w-3 h-3" />
                  {SURFACE_LABEL[court.surface] ?? court.surface}
                </span>
                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold', statusColor.ring)}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', statusColor.dot)} />
                  {statusColor.label}
                </span>
              </div>
            </div>

            {/* actions */}
            <div className="flex items-center gap-2 shrink-0">
              {onEdit && (
                <button onClick={() => onEdit(court)}
                  className="h-8 px-3 rounded-xl text-[11px] font-bold border border-[#ace600]/20 bg-[#ace600]/[0.07] hover:bg-[#ace600]/[0.14] text-[#ace600] transition-all flex items-center gap-1.5">
                  <Edit3 className="w-3 h-3" /> Editar
                </button>
              )}
              <button onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-white/25 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* ── primary stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatCard label="Tarifa / Hora" value={fmt(court.hourly_rate)} icon={DollarSign}
              accent="bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]" />
            <StatCard label="Tarifa Diaria" value={fmt(court.daily_rate)} icon={DollarSign}
              accent="bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]" />
            <StatCard label="Capacidad" value={court.capacity ? `${court.capacity} pers.` : '—'} icon={Users}
              accent="bg-sky-400/10 border-sky-400/20 text-sky-400" />
            <StatCard
              label="Rating"
              icon={Star}
              accent="bg-amber-400/10 border-amber-400/20 text-amber-400"
              value={rating !== null ? (
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {rating.toFixed(1)}
                  <span className="text-xs text-white/25 font-normal">({court.review_count ?? 0})</span>
                </span>
              ) : '—'}
            />
          </div>

          {/* ── secondary stats ── */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Reservas Totales" value={court.total_bookings ?? 0} icon={BarChart3}
              accent="bg-violet-400/10 border-violet-400/20 text-violet-400" />
            <StatCard label="Horas Reservadas"
              value={court.total_hours_booked !== undefined ? `${Number(court.total_hours_booked).toFixed(0)} h` : '—'}
              icon={TrendingUp} accent="bg-emerald-400/10 border-emerald-400/20 text-emerald-400" />
            {court.member_discount && Number(court.member_discount) > 0
              ? <StatCard label="Desc. Miembro" value={`${court.member_discount}%`} icon={ShieldCheck}
                  accent="bg-pink-400/10 border-pink-400/20 text-pink-400" />
              : <StatCard label="Tarifa Miembro" value={fmt(court.member_rate)} icon={ShieldCheck}
                  accent="bg-pink-400/10 border-pink-400/20 text-pink-400" />
            }
          </div>

          {/* ── description ── */}
          {court.description && (
            <div>
              <SectionHead icon={Tag} iconColor="text-white/30" iconBg="bg-white/[0.04] border-white/[0.08]" title="Descripción" />
              <p className="text-sm text-white/40 leading-relaxed">{court.description}</p>
            </div>
          )}

          {/* ── dimensions ── */}
          {court.dimensions && (
            <div>
              <SectionHead icon={Ruler} iconColor="text-sky-400" iconBg="bg-sky-400/10 border-sky-400/20" title="Dimensiones" />
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white/55 font-semibold">
                <Ruler className="w-4 h-4 text-white/20" />
                {typeof court.dimensions === 'object'
                  ? `${(court.dimensions as any).width ?? '?'} m × ${(court.dimensions as any).length ?? '?'} m`
                  : String(court.dimensions)}
              </div>
            </div>
          )}

          {/* ── feature flags ── */}
          <div>
            <SectionHead icon={Zap} iconColor="text-[#ace600]" iconBg="bg-[#ace600]/10 border-[#ace600]/20" title="Características" />
            <div className="grid grid-cols-3 gap-2">
              <FeatureFlag label="Iluminación" on={!!court.has_lighting} />
              <FeatureFlag label="Red incluida" on={!!court.has_net} />
              <FeatureFlag label="Equipo incl." on={!!court.has_equipment} />
            </div>
          </div>

          {/* ── amenities ── */}
          {amenities.length > 0 && (
            <div>
              <SectionHead icon={ShieldCheck} iconColor="text-emerald-400" iconBg="bg-emerald-400/10 border-emerald-400/20"
                title={`Amenidades (${amenities.length})`} />
              <div className="flex flex-wrap gap-1.5">
                {amenities.map(a => <Pill key={a} accent>{a}</Pill>)}
              </div>
            </div>
          )}

          {/* ── equipment ── */}
          {equipment.length > 0 && (
            <div>
              <SectionHead icon={Package} iconColor="text-violet-400" iconBg="bg-violet-400/10 border-violet-400/20"
                title={`Equipamiento incluido (${equipment.length})`} />
              <div className="flex flex-wrap gap-1.5">
                {equipment.map(e => (
                  <Pill key={e}><Package className="w-2.5 h-2.5 mr-1" />{e}</Pill>
                ))}
              </div>
            </div>
          )}

          {/* ── operating hours ── */}
          {hours && (
            <div>
              <SectionHead icon={Clock} iconColor="text-sky-400" iconBg="bg-sky-400/10 border-sky-400/20" title="Horario de operación" />
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                {DAYS.map((day, i) => {
                  const slot   = hours[day];
                  const closed = slot?.closed || !slot;
                  const isLast = i === DAYS.length - 1;
                  return (
                    <div key={day}
                      className={cn('flex items-center justify-between px-4 py-2.5', !isLast && 'border-b border-white/[0.04]')}>
                      <span className="text-xs font-black text-white/30 uppercase tracking-widest w-8">{DAY_LABEL[day]}</span>
                      {closed ? (
                        <span className="text-[11px] text-white/15 font-semibold">Cerrado</span>
                      ) : (
                        <span className="text-[11px] text-white/55 font-semibold flex items-center gap-1.5">
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

          {/* ── maintenance ── */}
          {court.is_maintenance && (
            <div className="bg-amber-500/[0.05] border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-amber-400/15 border border-amber-400/25 flex items-center justify-center shrink-0">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-xs font-black text-amber-400/70 uppercase tracking-widest">En Mantenimiento</p>
              </div>
              {court.maintenance_notes && (
                <p className="text-sm text-amber-400/60 mb-3 leading-relaxed">{court.maintenance_notes}</p>
              )}
              {(court.maintenance_start || court.maintenance_end) && (
                <div className="flex flex-wrap gap-4 text-[11px] text-amber-400/40 font-semibold">
                  {court.maintenance_start && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Desde: {new Date(court.maintenance_start).toLocaleDateString('es-MX')}
                    </span>
                  )}
                  {court.maintenance_end && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Hasta: {new Date(court.maintenance_end).toLocaleDateString('es-MX')}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── notes ── */}
          {court.notes && (
            <div>
              <SectionHead icon={Tag} iconColor="text-white/20" iconBg="bg-white/[0.03] border-white/[0.06]" title="Notas internas" />
              <p className="text-sm text-white/30 leading-relaxed italic">{court.notes}</p>
            </div>
          )}

          {/* ── photos ── */}
          {photos.length > 0 && (
            <div>
              <SectionHead icon={ImageIcon} iconColor="text-sky-400" iconBg="bg-sky-400/10 border-sky-400/20"
                title={`Fotos (${photos.length})`} />
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] group relative">
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── meta ── */}
          <div className="pt-3 border-t border-white/[0.04] flex flex-wrap gap-4 text-[10px] text-white/15 font-semibold">
            {court.created_at && (
              <span>Creado: {new Date(court.created_at).toLocaleDateString('es-MX')}</span>
            )}
            {court.updated_at && (
              <span>Actualizado: {new Date(court.updated_at).toLocaleDateString('es-MX')}</span>
            )}
            <span className="font-mono">ID: {court.id}</span>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}