/**
 * Match Schedule Page
 *
 * Allows tournament organizers to set scheduled_time on generated matches.
 *
 * Two modes:
 *  - Manual: edit each match individually (date + time picker per row)
 *  - Auto:   fill in start date/time, match duration, court count → system assigns all
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar,
  Clock,
  Zap,
  ChevronLeft,
  Check,
  AlertCircle,
  Loader2,
  CalendarDays,
  LayoutGrid,
  Timer,
  RefreshCw,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import {
  fetchEventSchedule,
  scheduleMatch,
  autoScheduleMatches,
} from '@/store/slices/tournamentsSlice';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function toLocalInputDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

function toLocalInputTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function combineDatetime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

// ─── types ──────────────────────────────────────────────────────────────────

interface MatchRow {
  id: string;
  group_id: string | null;
  match_number: number;
  player1: { id: string; name: string };
  player2: { id: string; name: string };
  scheduled_time: string | null;
  court_id: string | null;
  status: 'completed' | 'scheduled' | 'unscheduled';
}

interface ManualDraft {
  [matchId: string]: { date: string; time: string };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MatchSchedulePage() {
  const { tournamentId, eventId } = useParams<{ tournamentId: string; eventId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { loading } = useSelector((s: RootState) => s.tournaments);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [tab, setTab] = useState<'manual' | 'auto'>('manual');
  const [draft, setDraft] = useState<ManualDraft>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [autoSuccess, setAutoSuccess] = useState<string | null>(null);

  // Auto-schedule form state
  const [autoForm, setAutoForm] = useState({
    start_date: new Date().toISOString().slice(0, 10),
    start_time: '08:00',
    match_duration_minutes: 45,
    court_count: 2,
    break_minutes: 5,
    overwrite: false,
  });
  const [autoLoading, setAutoLoading] = useState(false);

  const load = useCallback(async () => {
    if (!tournamentId || !eventId) return;
    const result = await dispatch(fetchEventSchedule({ tournamentId, eventId }));
    if (fetchEventSchedule.fulfilled.match(result)) {
      const payload = result.payload as any;
      const rows: MatchRow[] = payload?.matches || [];
      setMatches(rows);
      // Pre-fill draft from existing scheduled_time
      const initialDraft: ManualDraft = {};
      rows.forEach((m) => {
        if (m.scheduled_time) {
          initialDraft[m.id] = {
            date: toLocalInputDate(m.scheduled_time),
            time: toLocalInputTime(m.scheduled_time),
          };
        } else {
          initialDraft[m.id] = { date: '', time: '' };
        }
      });
      setDraft(initialDraft);
    }
  }, [dispatch, tournamentId, eventId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Manual save ──

  const handleSaveOne = async (matchId: string) => {
    const { date, time } = draft[matchId] || {};
    if (!date || !time) {
      setError('Debes ingresar fecha y hora para este partido.');
      return;
    }
    setError(null);
    setSaving((p) => ({ ...p, [matchId]: true }));
    try {
      const result = await dispatch(
        scheduleMatch({
          tournamentId: tournamentId!,
          eventId: eventId!,
          matchId,
          data: { scheduled_time: combineDatetime(date, time) },
        }),
      );
      if (scheduleMatch.fulfilled.match(result)) {
        setSaved((p) => ({ ...p, [matchId]: true }));
        setTimeout(() => setSaved((p) => ({ ...p, [matchId]: false })), 2000);
        await load();
      } else {
        setError((result.payload as any) || 'Error al guardar');
      }
    } finally {
      setSaving((p) => ({ ...p, [matchId]: false }));
    }
  };

  // ── Auto-schedule ──

  const handleAutoSchedule = async () => {
    if (!autoForm.start_date) {
      setError('Selecciona la fecha de inicio.');
      return;
    }
    setError(null);
    setAutoSuccess(null);
    setAutoLoading(true);
    try {
      const result = await dispatch(
        autoScheduleMatches({
          tournamentId: tournamentId!,
          eventId: eventId!,
          data: autoForm,
        }),
      );
      if (autoScheduleMatches.fulfilled.match(result)) {
        const payload = result.payload as any;
        setAutoSuccess(payload?.message || 'Partidos programados exitosamente');
        await load();
      } else {
        setError('Error al programar automáticamente');
      }
    } finally {
      setAutoLoading(false);
    }
  };

  // ── Group matches by group_id ──

  const grouped = matches.reduce<Record<string, MatchRow[]>>((acc, m) => {
    const key = m.group_id || 'bracket';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const groupKeys = Object.keys(grouped).sort();
  const scheduledCount = matches.filter((m) => m.scheduled_time).length;
  const totalCount = matches.length;

  // ── Estimated end time for auto preview ──

  const estimatedSlots =
    autoForm.court_count > 0 ? Math.ceil(totalCount / autoForm.court_count) : 0;
  const estimatedEndMinutes =
    estimatedSlots > 0
      ? (() => {
          const [h, min] = autoForm.start_time.split(':').map(Number);
          const totalMin =
            h * 60 +
            min +
            estimatedSlots * (autoForm.match_duration_minutes + autoForm.break_minutes);
          return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
        })()
      : '--:--';

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.07] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white/60" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Programar Horarios</h1>
          <p className="text-xs text-white/40 mt-0.5">
            {scheduledCount} / {totalCount} partidos programados
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-[#ace600] transition-all duration-500"
            style={{ width: `${(scheduledCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl w-fit">
        {(['manual', 'auto'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-[#ace600] text-black'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {t === 'manual' ? <Calendar className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
            {t === 'manual' ? 'Manual' : 'Automático'}
          </button>
        ))}
      </div>

      {/* ── MANUAL TAB ── */}
      {tab === 'manual' && (
        <div className="space-y-4">
          {loading && matches.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
            </div>
          ) : totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-2">
              <CalendarDays className="w-10 h-10 text-white/20" />
              <p className="text-white/40 text-sm">No hay partidos generados aún</p>
              <p className="text-white/25 text-xs">Primero genera los grupos del evento</p>
            </div>
          ) : (
            groupKeys.map((groupKey, gi) => (
              <div key={groupKey} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                    {groupKey === 'bracket' ? 'Cuadro' : `Grupo ${gi + 1}`}
                  </span>
                  <span className="text-[10px] text-white/30">
                    {grouped[groupKey].filter((m) => m.scheduled_time).length}/{grouped[groupKey].length} programados
                  </span>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {grouped[groupKey].map((match) => {
                    const d = draft[match.id] || { date: '', time: '' };
                    const isSaving = saving[match.id];
                    const isSaved = saved[match.id];
                    const isCompleted = match.status === 'completed';

                    return (
                      <div key={match.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Players */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {match.status === 'scheduled' || match.status === 'completed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#ace600] shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-white/20 shrink-0" />
                            )}
                            <span className="text-sm font-medium text-white truncate">
                              {match.player1.name}
                              <span className="text-white/30 mx-1.5">vs</span>
                              {match.player2.name}
                            </span>
                          </div>
                          {match.scheduled_time && (
                            <p className="text-[11px] text-white/35 mt-0.5 ml-5">
                              Actual: {fmtDate(match.scheduled_time)} {fmtTime(match.scheduled_time)}
                            </p>
                          )}
                        </div>

                        {/* Date + Time inputs */}
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="date"
                            value={d.date}
                            disabled={isCompleted}
                            onChange={(e) =>
                              setDraft((p) => ({
                                ...p,
                                [match.id]: { ...p[match.id], date: e.target.value },
                              }))
                            }
                            className="px-2.5 py-1.5 bg-white/[0.06] border border-white/[0.10] rounded-lg text-white text-xs focus:border-[#ace600] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                          />
                          <input
                            type="time"
                            value={d.time}
                            disabled={isCompleted}
                            onChange={(e) =>
                              setDraft((p) => ({
                                ...p,
                                [match.id]: { ...p[match.id], time: e.target.value },
                              }))
                            }
                            className="px-2.5 py-1.5 bg-white/[0.06] border border-white/[0.10] rounded-lg text-white text-xs focus:border-[#ace600] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                          />
                          <button
                            onClick={() => handleSaveOne(match.id)}
                            disabled={isCompleted || isSaving || !d.date || !d.time}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#ace600]/10 border border-[#ace600]/30 text-[#ace600] hover:bg-[#ace600]/20"
                          >
                            {isSaving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isSaved ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            {isSaved ? 'Guardado' : 'Guardar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── AUTO TAB ── */}
      {tab === 'auto' && (
        <div className="space-y-4 max-w-xl">
          {autoSuccess && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#ace600]/10 border border-[#ace600]/30 rounded-xl text-[#ace600] text-sm">
              <Check className="w-4 h-4 shrink-0" />
              {autoSuccess}
            </div>
          )}

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ace600]" />
              Configuración de Horario Automático
            </h3>

            {/* Start date */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 font-medium flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                Fecha de inicio
              </label>
              <input
                type="date"
                value={autoForm.start_date}
                onChange={(e) => setAutoForm((p) => ({ ...p, start_date: e.target.value }))}
                className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.10] rounded-lg text-white text-sm focus:border-[#ace600] focus:outline-none"
              />
            </div>

            {/* Start time */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Hora de inicio
              </label>
              <input
                type="time"
                value={autoForm.start_time}
                onChange={(e) => setAutoForm((p) => ({ ...p, start_time: e.target.value }))}
                className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.10] rounded-lg text-white text-sm focus:border-[#ace600] focus:outline-none"
              />
            </div>

            {/* Match duration + break */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 font-medium flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5" />
                  Duración partido (min)
                </label>
                <input
                  type="number"
                  min={15}
                  max={180}
                  value={autoForm.match_duration_minutes}
                  onChange={(e) =>
                    setAutoForm((p) => ({ ...p, match_duration_minutes: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.10] rounded-lg text-white text-sm focus:border-[#ace600] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Descanso (min)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={autoForm.break_minutes}
                  onChange={(e) =>
                    setAutoForm((p) => ({ ...p, break_minutes: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.10] rounded-lg text-white text-sm focus:border-[#ace600] focus:outline-none"
                />
              </div>
            </div>

            {/* Court count */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 font-medium flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" />
                Número de canchas disponibles
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={autoForm.court_count}
                onChange={(e) =>
                  setAutoForm((p) => ({ ...p, court_count: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.10] rounded-lg text-white text-sm focus:border-[#ace600] focus:outline-none"
              />
            </div>

            {/* Overwrite toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setAutoForm((p) => ({ ...p, overwrite: !p.overwrite }))}
                className={`relative w-9 h-5 rounded-full transition-colors ${autoForm.overwrite ? 'bg-[#ace600]' : 'bg-white/10'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${autoForm.overwrite ? 'translate-x-4' : ''}`}
                />
              </div>
              <span className="text-xs text-white/50">
                Sobreescribir horarios existentes
              </span>
            </label>
          </div>

          {/* Preview card */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-white/30">Total de partidos</p>
              <p className="text-white font-bold mt-0.5">{totalCount}</p>
            </div>
            <div>
              <p className="text-white/30">Canchas</p>
              <p className="text-white font-bold mt-0.5">{autoForm.court_count}</p>
            </div>
            <div>
              <p className="text-white/30">Rondas necesarias</p>
              <p className="text-white font-bold mt-0.5">{estimatedSlots}</p>
            </div>
            <div>
              <p className="text-white/30">Hora estimada fin</p>
              <p className="text-[#ace600] font-bold mt-0.5">{estimatedEndMinutes}</p>
            </div>
          </div>

          <button
            onClick={handleAutoSchedule}
            disabled={autoLoading || totalCount === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#ace600] text-black font-bold rounded-xl hover:bg-[#c5ff00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {autoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {autoLoading ? 'Programando...' : 'Programar automáticamente'}
          </button>

          {/* Refresh */}
          {autoSuccess && (
            <button
              onClick={load}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-white/50 hover:text-white/80 text-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Ver resultado en pestaña Manual
            </button>
          )}
        </div>
      )}
    </div>
  );
}
