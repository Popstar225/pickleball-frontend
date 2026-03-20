import { useState } from 'react';
import type { Court } from '../../types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar, Lock, Loader2, Plus, Clock, AlignLeft,
  Wrench, ShieldOff, PartyPopper, Sparkles, Hammer, MoreHorizontal,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface BlockingFormData {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  reason: 'maintenance' | 'blocked_by_owner' | 'private_event' | 'cleaning' | 'repair' | 'other';
  description: string;
}

interface Props {
  court: Court;
  clubId?: string;
}

// ─── Tokens ───────────────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-white/[0.04] border border-white/[0.09] rounded-xl text-white/80 text-sm px-3.5 py-2.5 ' +
  'outline-none transition-all duration-150 focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03] ' +
  'disabled:opacity-35 placeholder:text-white/20 [color-scheme:dark]';

const labelCls = 'block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1.5';

const REASON_CONFIG = {
  maintenance:      { icon: Wrench,       color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20',   label: 'Mantenimiento' },
  blocked_by_owner: { icon: ShieldOff,    color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20',       label: 'Bloqueado por dueño' },
  private_event:    { icon: PartyPopper,  color: 'text-violet-400',  bg: 'bg-violet-400/10 border-violet-400/20', label: 'Evento privado' },
  cleaning:         { icon: Sparkles,     color: 'text-sky-400',     bg: 'bg-sky-400/10 border-sky-400/20',       label: 'Limpieza' },
  repair:           { icon: Hammer,       color: 'text-orange-400',  bg: 'bg-orange-400/10 border-orange-400/20', label: 'Reparación' },
  other:            { icon: MoreHorizontal,color: 'text-white/40',   bg: 'bg-white/[0.04] border-white/[0.08]',   label: 'Otro' },
} as const;

export default function CourtBlockingCalendar({ court, clubId }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BlockingFormData>({
    startDate: new Date().toISOString().split('T')[0],
    startTime: '00:00',
    endDate:   new Date().toISOString().split('T')[0],
    endTime:   '23:59',
    reason:    'blocked_by_owner',
    description: '',
  });

  const set = (field: keyof BlockingFormData, value: string) =>
    setFormData(p => ({ ...p, [field]: value }));

  const selectedReason = REASON_CONFIG[formData.reason];
  const ReasonIcon = selectedReason.icon;

  const handleAddBlock = async () => {
    if (formData.startDate > formData.endDate) {
      toast.error(t('CourtBlocking.invalidDateRange'));
      return;
    }
    if (formData.startDate === formData.endDate && formData.startTime >= formData.endTime) {
      toast.error(t('CourtBlocking.invalidTimeRange'));
      return;
    }
    setIsLoading(true);
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime   = new Date(`${formData.endDate}T${formData.endTime}`);

      await api.post<any>(`/courts/${court.id}/availability/unavailabilities`, {
        startDate:   startDateTime.toISOString(),
        endDate:     endDateTime.toISOString(),
        reason:      formData.reason,
        description: formData.description,
      });

      toast.success(t('CourtBlocking.blockCreated'));
      setFormData({
        startDate: new Date().toISOString().split('T')[0],
        startTime: '00:00',
        endDate:   new Date().toISOString().split('T')[0],
        endTime:   '23:59',
        reason:    'blocked_by_owner',
        description: '',
      });
      setOpen(false);
      window.dispatchEvent(new CustomEvent('unavailabilitiesUpdated'));
    } catch {
      toast.error(t('CourtBlocking.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Trigger card ─────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-amber-400/40 via-amber-400/15 to-transparent" />
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{t('CourtBlocking.title')}</p>
              <p className="text-[11px] text-white/25 mt-0.5">{t('CourtBlocking.description')}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)] transition-all shrink-0">
            <Plus className="w-3.5 h-3.5" />
            {t('CourtBlocking.addBlock')}
          </button>
        </div>
      </div>

      {/* ── Dialog ───────────────────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0d1117] border-white/[0.09] rounded-2xl p-0 overflow-hidden max-w-lg">
          {/* Accent bar */}
          <div className="h-0.5 bg-gradient-to-r from-amber-400/50 via-amber-400/20 to-transparent" />

          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <DialogTitle className="text-base font-bold text-white">
                  {t('CourtBlocking.createBlock')}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4">

              {/* ── Date & time range ────────────────────────────────────────── */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> {t('CourtBlocking.startDate')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{t('CourtBlocking.startDate')}</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => set('startDate', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t('CourtBlocking.startTime')}</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={e => set('startTime', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-white/[0.05]" />
                  <Clock className="w-3 h-3 text-white/15" />
                  <div className="flex-1 h-px bg-white/[0.05]" />
                </div>

                <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> {t('CourtBlocking.endDate')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{t('CourtBlocking.endDate')}</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      min={formData.startDate}
                      onChange={e => set('endDate', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t('CourtBlocking.endTime')}</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={e => set('endTime', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* ── Reason ───────────────────────────────────────────────────── */}
              <div>
                <label className={labelCls}>{t('CourtBlocking.reason')}</label>
                <Select
                  value={formData.reason}
                  onValueChange={v => set('reason', v)}>
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.09] rounded-xl text-white/80 text-sm h-10 focus:border-[#ace600]/50 focus:ring-0">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-5 h-5 rounded-lg border flex items-center justify-center shrink-0', selectedReason.bg)}>
                        <ReasonIcon className={cn('w-3 h-3', selectedReason.color)} />
                      </div>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1117] border-white/[0.09] rounded-xl">
                    {(Object.entries(REASON_CONFIG) as [keyof typeof REASON_CONFIG, typeof REASON_CONFIG[keyof typeof REASON_CONFIG]][]).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <SelectItem key={key} value={key}
                          className="text-white/70 focus:bg-white/[0.06] focus:text-white rounded-lg my-0.5">
                          <div className="flex items-center gap-2.5">
                            <div className={cn('w-6 h-6 rounded-lg border flex items-center justify-center shrink-0', cfg.bg)}>
                              <Icon className={cn('w-3 h-3', cfg.color)} />
                            </div>
                            <span className="text-sm">{cfg.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Description ──────────────────────────────────────────────── */}
              <div>
                <label className={cn(labelCls, 'flex items-center gap-1.5')}>
                  <AlignLeft className="w-2.5 h-2.5" />
                  {t('CourtBlocking.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder={t('CourtBlocking.descriptionPlaceholder')}
                  rows={3}
                  className={cn(inputCls, 'resize-none')}
                />
              </div>

              {/* ── Actions ──────────────────────────────────────────────────── */}
              <div className="flex gap-2.5 pt-1 border-t border-white/[0.05]">
                <button
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                  className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white text-xs font-bold disabled:opacity-40 transition-all">
                  {t('CourtBlocking.cancel')}
                </button>
                <button
                  onClick={handleAddBlock}
                  disabled={isLoading}
                  className="flex-1 h-10 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_12px_rgba(251,191,36,0.2)] disabled:opacity-40 transition-all">
                  {isLoading ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t('CourtBlocking.creating')}</>
                  ) : (
                    <><Lock className="w-3.5 h-3.5" />{t('CourtBlocking.createBlock')}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}