import { useState, useEffect } from 'react';
import type { Court } from '../../types/api';
import { Loader2, Save, RotateCcw, Clock, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface OperatingHours {
  [day: string]: { start: string; end: string };
}

interface Props {
  court: Court;
  clubId?: string;
  initialHours: OperatingHours | null;
  onSave: (courtId: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_SHORT: Record<string, string> = {
  Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mié',
  Thursday: 'Jue', Friday: 'Vie', Saturday: 'Sáb', Sunday: 'Dom',
};

const DAY_COLORS: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  Monday:    { dot: 'bg-sky-400',     bg: 'bg-sky-400/10',     border: 'border-sky-400/20',     text: 'text-sky-400' },
  Tuesday:   { dot: 'bg-violet-400',  bg: 'bg-violet-400/10',  border: 'border-violet-400/20',  text: 'text-violet-400' },
  Wednesday: { dot: 'bg-[#ace600]',   bg: 'bg-[#ace600]/10',   border: 'border-[#ace600]/20',   text: 'text-[#ace600]' },
  Thursday:  { dot: 'bg-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   text: 'text-amber-400' },
  Friday:    { dot: 'bg-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', text: 'text-emerald-400' },
  Saturday:  { dot: 'bg-pink-400',    bg: 'bg-pink-400/10',    border: 'border-pink-400/20',    text: 'text-pink-400' },
  Sunday:    { dot: 'bg-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20',  text: 'text-orange-400' },
};

const DEFAULT_HOURS: OperatingHours = Object.fromEntries(
  DAYS.map(d => [d, { start: '08:00', end: '20:00' }])
);

// ─── Tokens ───────────────────────────────────────────────────────────────────
const timeCls =
  'bg-white/[0.04] border border-white/[0.09] rounded-xl text-white/80 text-sm px-3 py-2 ' +
  'outline-none transition-all duration-150 focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03] ' +
  '[color-scheme:dark] w-full';

const labelCls = 'block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1.5';

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OperatingHoursConfigurator({ court, clubId, initialHours, onSave }: Props) {
  const { t } = useTranslation();
  const [hours,      setHours]      = useState<OperatingHours>(initialHours || DEFAULT_HOURS);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving,   setIsSaving]   = useState(false);

  useEffect(() => {
    if (initialHours) setHours(initialHours);
  }, [initialHours]);

  const handleTimeChange = (day: string, field: 'start' | 'end', value: string) => {
    setHours(p => ({ ...p, [day]: { ...p[day], [field]: value } }));
    setHasChanges(true);
  };

  const handleApplyToAll = (day: string) => {
    const { start, end } = hours[day];
    setHours(Object.fromEntries(DAYS.map(d => [d, { start, end }])));
    setHasChanges(true);
    toast.success(t('OperatingHours.appliedToAll'));
  };

  const handleReset = () => {
    setHours(initialHours || DEFAULT_HOURS);
    setHasChanges(false);
  };

  const handleSave = async () => {
    for (const day of DAYS) {
      if (hours[day].start >= hours[day].end) {
        toast.error(t('OperatingHours.invalidTimeRange', { day }));
        return;
      }
    }
    setIsSaving(true);
    try {
      await api.put<any>(`/courts/${court.id}/availability/operating-hours`, { operatingHours: hours });
      toast.success(t('OperatingHours.saved'));
      setHasChanges(false);
      onSave(court.id);
    } catch {
      toast.error(t('OperatingHours.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
      {/* accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-[#ace600]/40 via-[#ace600]/15 to-transparent" />

      <div className="p-5">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-[#ace600]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{t('OperatingHours.title')}</p>
            <p className="text-[11px] text-white/25 mt-0.5">{t('OperatingHours.description')}</p>
          </div>
        </div>

        {/* ── Days grid ──────────────────────────────────────────────────── */}
        <div className="space-y-2">
          {DAYS.map((day) => {
            const c = DAY_COLORS[day];
            return (
              <div key={day}
                className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:border-white/[0.09] transition-colors">

                {/* Day label */}
                <div className="flex items-center gap-2.5 w-24">
                  <span className={cn('w-2 h-2 rounded-full shrink-0', c.dot)} />
                  <span className="text-xs font-black text-white/60 uppercase tracking-widest">
                    {DAY_SHORT[day]}
                  </span>
                </div>

                {/* Start time */}
                <div>
                  <label className={labelCls}>{t('OperatingHours.openTime')}</label>
                  <input
                    type="time"
                    value={hours[day]?.start ?? '08:00'}
                    onChange={e => handleTimeChange(day, 'start', e.target.value)}
                    className={timeCls}
                  />
                </div>

                {/* End time */}
                <div>
                  <label className={labelCls}>{t('OperatingHours.closeTime')}</label>
                  <input
                    type="time"
                    value={hours[day]?.end ?? '20:00'}
                    onChange={e => handleTimeChange(day, 'end', e.target.value)}
                    className={timeCls}
                  />
                </div>

                {/* Apply to all */}
                <button
                  onClick={() => handleApplyToAll(day)}
                  title={t('OperatingHours.applyToAll')}
                  className={cn(
                    'w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all hover:opacity-100',
                    c.bg, c.border, 'opacity-50 hover:opacity-90',
                  )}>
                  <Copy className={cn('w-3.5 h-3.5', c.text)} />
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="flex gap-2.5 mt-5 pt-4 border-t border-white/[0.05]">
          <button
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
            className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-30 transition-all">
            <RotateCcw className="w-3.5 h-3.5" />
            {t('OperatingHours.reset')}
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex-1 h-10 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)] disabled:opacity-30 transition-all">
            {isSaving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t('OperatingHours.saving')}</>
              : <><Save className="w-3.5 h-3.5" />{t('OperatingHours.save')}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}