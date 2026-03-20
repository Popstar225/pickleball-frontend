import { useState, useEffect } from 'react';
import type { Court } from '../../types/api';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Lock, Trash2, Loader2, List, AlertCircle,
  Wrench, ShieldOff, PartyPopper, Sparkles, Hammer, MoreHorizontal,
  Calendar, Clock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Unavailability {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  description?: string;
}

interface Props {
  court: Court;
  clubId?: string;
}

// ─── Reason config (matches CourtBlockingCalendar) ────────────────────────────
const REASON_CONFIG: Record<string, {
  icon: React.ElementType; color: string; bg: string; border: string; label: string;
}> = {
  maintenance:      { icon: Wrench,        color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   label: 'Mantenimiento' },
  blocked_by_owner: { icon: ShieldOff,     color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     label: 'Bloqueado por dueño' },
  private_event:    { icon: PartyPopper,   color: 'text-violet-400',  bg: 'bg-violet-400/10',  border: 'border-violet-400/20',  label: 'Evento privado' },
  cleaning:         { icon: Sparkles,      color: 'text-sky-400',     bg: 'bg-sky-400/10',     border: 'border-sky-400/20',     label: 'Limpieza' },
  repair:           { icon: Hammer,        color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20',  label: 'Reparación' },
  other:            { icon: MoreHorizontal,color: 'text-white/40',    bg: 'bg-white/[0.04]',   border: 'border-white/[0.08]',   label: 'Otro' },
};
const getReason = (r: string) => REASON_CONFIG[r] ?? REASON_CONFIG.other;

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function UnavailabilityList({ court, clubId }: Props) {
  const { t, i18n } = useTranslation();
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadUnavailabilities();
    window.addEventListener('unavailabilitiesUpdated', loadUnavailabilities);
    return () => window.removeEventListener('unavailabilitiesUpdated', loadUnavailabilities);
  }, [court.id]);

  const loadUnavailabilities = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<any>(`/courts/${court.id}/availability/unavailabilities`);
      setUnavailabilities(response?.data?.unavailabilities ?? []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await api.delete<any>(`/courts/${court.id}/availability/unavailabilities/${id}`);
      toast.success(t('UnavailabilityList.deleted'));
      setUnavailabilities(p => p.filter(u => u.id !== id));
    } catch {
      toast.error(t('UnavailabilityList.deleteError'));
    } finally {
      setIsDeleting(null);
    }
  };

  const fmtDate = (d: string) => {
    try {
      return format(new Date(d), 'PPpp', { locale: i18n.language === 'es' ? es : undefined });
    } catch { return d; }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading && unavailabilities.length === 0) {
    return (
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-red-400/40 via-red-400/15 to-transparent" />
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
            <List className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{t('UnavailabilityList.title')}</p>
            <p className="text-[11px] text-white/25 mt-0.5">{t('UnavailabilityList.description')}</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#ace600]" />
          <span className="text-xs text-white/20">Cargando bloqueos…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
      {/* accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-red-400/40 via-red-400/15 to-transparent" />

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
            <List className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{t('UnavailabilityList.title')}</p>
            <p className="text-[11px] text-white/25 mt-0.5">{t('UnavailabilityList.description')}</p>
          </div>
        </div>
        {/* count badge */}
        <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-white/[0.04] border-white/[0.08] text-white/30">
          {unavailabilities.length}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="p-5">
        {unavailabilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white/10" />
            </div>
            <p className="text-xs text-white/20">{t('UnavailabilityList.noBlocks')}</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {unavailabilities.map(u => {
              const cfg = getReason(u.reason);
              const Icon = cfg.icon;
              return (
                <div key={u.id}
                  className="group flex items-start gap-3 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:border-white/[0.10] transition-all">

                  {/* reason icon badge */}
                  <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5', cfg.bg, cfg.border)}>
                    <Icon className={cn('w-4 h-4', cfg.color)} />
                  </div>

                  {/* content */}
                  <div className="flex-1 min-w-0">
                    {/* reason pill */}
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest mb-2',
                      cfg.bg, cfg.border, cfg.color,
                    )}>
                      {cfg.label}
                    </span>

                    {/* dates */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-white/40 font-medium">
                        <Calendar className="w-3 h-3 text-white/20 shrink-0" />
                        <span className="text-white/25 font-bold uppercase tracking-widest text-[9px] mr-1">
                          {t('UnavailabilityList.from')}
                        </span>
                        {fmtDate(u.start_date)}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/40 font-medium">
                        <Clock className="w-3 h-3 text-white/20 shrink-0" />
                        <span className="text-white/25 font-bold uppercase tracking-widest text-[9px] mr-1">
                          {t('UnavailabilityList.to')}
                        </span>
                        {fmtDate(u.end_date)}
                      </div>
                    </div>

                    {/* description */}
                    {u.description && (
                      <p className="text-[11px] text-white/25 mt-2 italic leading-relaxed">
                        {u.description}
                      </p>
                    )}
                  </div>

                  {/* delete */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        disabled={isDeleting === u.id}
                        className="w-8 h-8 rounded-xl border border-red-500/15 bg-red-500/[0.06] hover:bg-red-500/[0.14] text-red-400/50 hover:text-red-400 flex items-center justify-center shrink-0 transition-all disabled:opacity-30 opacity-0 group-hover:opacity-100">
                        {isDeleting === u.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent className="bg-[#0d1117] border-white/[0.09] rounded-2xl p-0 overflow-hidden max-w-sm">
                      <div className="h-0.5 bg-gradient-to-r from-red-400/50 via-red-400/20 to-transparent" />
                      <div className="p-6">
                        <AlertDialogHeader className="mb-4">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </div>
                            <AlertDialogTitle className="text-base font-bold text-white">
                              {t('UnavailabilityList.confirmDelete')}
                            </AlertDialogTitle>
                          </div>
                          <AlertDialogDescription className="text-xs text-white/30 leading-relaxed ml-12">
                            {t('UnavailabilityList.deleteWarning')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        {/* preview */}
                        <div className={cn('rounded-xl border p-3.5 space-y-1.5 mb-5', cfg.bg, cfg.border)}>
                          <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'inherit' }}>
                            <span className={cn('text-[10px] font-black uppercase tracking-widest', cfg.color)}>{cfg.label}</span>
                          </div>
                          <div className="text-[11px] text-white/40 space-y-1">
                            <p><span className="text-white/20 font-bold uppercase tracking-widest text-[9px] mr-1">{t('UnavailabilityList.from')}</span>{fmtDate(u.start_date)}</p>
                            <p><span className="text-white/20 font-bold uppercase tracking-widest text-[9px] mr-1">{t('UnavailabilityList.to')}</span>{fmtDate(u.end_date)}</p>
                          </div>
                        </div>

                        <div className="flex gap-2.5">
                          <AlertDialogCancel className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white text-xs font-bold transition-all">
                            {t('UnavailabilityList.cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(u.id)}
                            className="flex-1 h-10 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.2)] transition-all">
                            {t('UnavailabilityList.delete')}
                          </AlertDialogAction>
                        </div>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}