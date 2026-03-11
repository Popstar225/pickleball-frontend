import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar, MapPin, Trophy, Clock, X,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay,
  addMonths, subMonths, addWeeks, addDays,
  isWithinInterval, parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';

type CalView = 'day' | 'week' | 'month' | 'year';

interface T {
  id: string;
  name: string;
  start_date: string;
  end_date?: string;
  city?: string;
  state?: string;
  tournament_type?: string;
  status?: string;
}

const STATUS_COLOR: Record<string, string> = {
  in_progress: '#22c55e',
  completed:   '#94a3b8',
  published:   '#3b82f6',
  approved:    '#a78bfa',
  draft:       '#64748b',
};

function colorOf(t: T, tc: string) {
  return STATUS_COLOR[t.status ?? ''] ?? tc;
}

function forDate(date: Date, ts: T[]): T[] {
  return ts.filter(t => {
    try {
      const s = parseISO(t.start_date);
      const e = t.end_date ? parseISO(t.end_date) : s;
      return isWithinInterval(date, { start: s, end: e });
    } catch { return false; }
  });
}

function statusLabel(t: T): string {
  switch (t.status) {
    case 'in_progress': return 'En curso';
    case 'completed':   return 'Finalizado';
    case 'published':   return 'Inscripciones';
    case 'approved':    return 'Aprobado';
    default:            return 'Próximo';
  }
}

// ── Pill component ────────────────────────────────────────────────────────────
function Pill({ t, tc, tiny = false }: { t: T; tc: string; tiny?: boolean }) {
  const c = colorOf(t, tc);
  return (
    <div
      className={`truncate font-bold rounded-lg leading-none ${tiny ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'}`}
      style={{ background: `${c}1a`, color: c, border: `1px solid ${c}30` }}
      title={t.name}
    >
      {t.name}
    </div>
  );
}

// ── Section header (matches SectionHead pattern from parent page) ─────────────
function Head({ tc }: { tc: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tc}18` }}>
          <Calendar className="w-[18px] h-[18px]" style={{ color: tc }} />
        </div>
        <h2
          className="font-black uppercase text-slate-900 tracking-tight leading-none"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
        >
          Calendario
        </h2>
      </div>
      <p className="text-slate-400 text-sm font-medium ml-12">Programa de torneos día a día, semana a semana</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MicrositeSchedule({ tournaments, tc }: { tournaments: T[]; tc: string }) {
  const [view, setView] = useState<CalView>('month');
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  // Navigation
  const go = (dir: 1 | -1) => {
    setSelected(null);
    setCursor(c => {
      if (view === 'day')   return addDays(c, dir);
      if (view === 'week')  return addWeeks(c, dir);
      if (view === 'month') return addMonths(c, dir);
      return new Date(c.getFullYear() + dir, c.getMonth(), 1);
    });
  };

  const periodLabel = useMemo(() => {
    if (view === 'day')
      return format(cursor, "EEEE, d 'de' MMMM yyyy", { locale: es });
    if (view === 'week') {
      const s = startOfWeek(cursor, { weekStartsOn: 1 });
      const e = endOfWeek(cursor, { weekStartsOn: 1 });
      return `${format(s, 'd MMM', { locale: es })} – ${format(e, 'd MMM yyyy', { locale: es })}`;
    }
    if (view === 'month') return format(cursor, 'MMMM yyyy', { locale: es });
    return String(cursor.getFullYear());
  }, [view, cursor]);

  // Month grid days
  const monthDays = useMemo(() => {
    const s = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const e = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: s, end: e });
  }, [cursor]);

  // Week grid days
  const weekDays = useMemo(() => {
    const s = startOfWeek(cursor, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }, [cursor]);

  // Year months
  const yearMonths = useMemo(
    () => Array.from({ length: 12 }, (_, i) => new Date(cursor.getFullYear(), i, 1)),
    [cursor],
  );

  const selectedTs = selected ? forDate(selected, tournaments) : [];

  return (
    <section id="schedule" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Head tc={tc} />

        {/* ── Controls bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

          {/* View tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl gap-0.5">
            {(['day', 'week', 'month', 'year'] as CalView[]).map(v => (
              <button
                key={v}
                onClick={() => { setView(v); setSelected(null); }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                  view === v ? 'text-black shadow-sm' : 'text-slate-400 hover:text-slate-700'
                }`}
                style={view === v ? { background: tc } : {}}
              >
                {{ day: 'Día', week: 'Semana', month: 'Mes', year: 'Año' }[v]}
              </button>
            ))}
          </div>

          {/* Period navigation */}
          <div className="flex items-center gap-2">
            <button onClick={() => go(-1)}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="min-w-[190px] text-center text-sm font-black text-slate-900 capitalize select-none">
              {periodLabel}
            </span>
            <button onClick={() => go(1)}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setCursor(new Date()); setSelected(new Date()); }}
              className="px-3 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              Hoy
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >

            {/* ─────────────────────── MONTH VIEW ─────────────────────────── */}
            {view === 'month' && (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                    <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {monthDays.map((day, i) => {
                    const ts = forDate(day, tournaments);
                    const inMonth = isSameMonth(day, cursor);
                    const isToday = isSameDay(day, new Date());
                    const isSel = selected ? isSameDay(day, selected) : false;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelected(isSel ? null : day)}
                        className={`min-h-[84px] p-2 border-b border-r border-slate-100 last:border-r-0 text-left transition-colors ${
                          !inMonth ? 'opacity-30' : 'hover:bg-slate-50'
                        } ${isSel ? 'ring-2 ring-inset ring-offset-0' : ''}`}
                        style={isSel ? { '--tw-ring-color': tc } as any : {}}
                      >
                        {/* Day number */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black mb-1.5 ${
                            isToday ? 'text-black' : 'text-slate-700'
                          }`}
                          style={isToday ? { background: tc } : {}}
                        >
                          {format(day, 'd')}
                        </div>
                        {/* Event pills */}
                        <div className="space-y-0.5">
                          {ts.slice(0, 2).map(t => <Pill key={t.id} t={t} tc={tc} tiny />)}
                          {ts.length > 2 && (
                            <div className="text-[9px] font-bold text-slate-400 px-1">
                              +{ts.length - 2} más
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─────────────────────── WEEK VIEW ──────────────────────────── */}
            {view === 'week' && (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 divide-x divide-slate-100">
                  {weekDays.map((day, i) => {
                    const ts = forDate(day, tournaments);
                    const isToday = isSameDay(day, new Date());
                    const isSel = selected ? isSameDay(day, selected) : false;
                    return (
                      <div
                        key={i}
                        className={isSel ? 'ring-2 ring-inset' : ''}
                        style={isSel ? { '--tw-ring-color': tc } as any : {}}
                      >
                        {/* Day label */}
                        <button
                          onClick={() => setSelected(isSel ? null : day)}
                          className="w-full p-3 text-center border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 capitalize">
                            {format(day, 'EEE', { locale: es })}
                          </div>
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black mx-auto ${
                              isToday ? 'text-black' : 'text-slate-700'
                            }`}
                            style={isToday ? { background: tc } : {}}
                          >
                            {format(day, 'd')}
                          </div>
                        </button>
                        {/* Events */}
                        <div className="p-2 min-h-[160px] space-y-1">
                          {ts.map(t => <Pill key={t.id} t={t} tc={tc} />)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─────────────────────── DAY VIEW ───────────────────────────── */}
            {view === 'day' && (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Day header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 capitalize">
                      {format(cursor, 'EEEE', { locale: es })}
                    </div>
                    <div
                      className="font-black text-3xl text-slate-900 capitalize"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      {format(cursor, "d 'de' MMMM yyyy", { locale: es })}
                    </div>
                  </div>
                  {isSameDay(cursor, new Date()) && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-black"
                      style={{ background: tc }}>
                      Hoy
                    </span>
                  )}
                </div>
                {/* Day events */}
                <div className="p-5">
                  {(() => {
                    const ts = forDate(cursor, tournaments);
                    if (ts.length === 0) return (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border border-slate-100"
                          style={{ background: `${tc}08` }}>
                          <Calendar className="w-6 h-6" style={{ color: tc }} />
                        </div>
                        <p className="font-bold text-slate-400 text-sm">Sin eventos este día</p>
                      </div>
                    );
                    return (
                      <div className="space-y-3">
                        {ts.map(t => (
                          <div
                            key={t.id}
                            className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
                            style={{ background: `${tc}04` }}
                          >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `${tc}18` }}>
                              <Trophy className="w-5 h-5" style={{ color: tc }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-slate-900 text-lg leading-tight"
                                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                                {t.name}
                              </h4>
                              {(t.city || t.state) && (
                                <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: tc }} />
                                  {[t.city, t.state].filter(Boolean).join(', ')}
                                </p>
                              )}
                              {t.end_date && t.end_date !== t.start_date && (
                                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                                  <Clock className="w-3 h-3" style={{ color: tc }} />
                                  Hasta {format(parseISO(t.end_date), "d 'de' MMMM", { locale: es })}
                                </p>
                              )}
                            </div>
                            <span
                              className="shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                              style={{
                                background: `${colorOf(t, tc)}15`,
                                color: colorOf(t, tc),
                              }}
                            >
                              {statusLabel(t)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ─────────────────────── YEAR VIEW ──────────────────────────── */}
            {view === 'year' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {yearMonths.map((m, i) => {
                  const ms = startOfMonth(m);
                  const me = endOfMonth(m);
                  const ts = tournaments.filter(t => {
                    try {
                      const s = parseISO(t.start_date);
                      const e = t.end_date ? parseISO(t.end_date) : s;
                      return s <= me && e >= ms;
                    } catch { return false; }
                  });
                  const isCurrent = isSameMonth(m, new Date());
                  return (
                    <button
                      key={i}
                      onClick={() => { setCursor(m); setView('month'); }}
                      className={`p-4 rounded-2xl border text-left hover:shadow-md transition-all ${
                        isCurrent ? 'border-2' : 'border-slate-100 hover:border-slate-200'
                      }`}
                      style={isCurrent ? { borderColor: tc, background: `${tc}06` } : {}}
                    >
                      <div className="font-black text-xl mb-3 capitalize text-slate-900"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                        {format(m, 'MMMM', { locale: es })}
                      </div>
                      {ts.length > 0 ? (
                        <div className="space-y-1">
                          {ts.slice(0, 3).map(t => <Pill key={t.id} t={t} tc={tc} tiny />)}
                          {ts.length > 3 && (
                            <div className="text-[9px] font-bold text-slate-400 px-1">
                              +{ts.length - 3} más
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-300 font-medium">Sin torneos</p>
                      )}
                      {ts.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: tc }}>
                            {ts.length} torneo{ts.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── Selected date detail panel ── */}
        <AnimatePresence>
          {selected && selectedTs.length > 0 && view !== 'day' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="mt-4 overflow-hidden"
            >
              <div className="p-4 rounded-2xl border border-slate-100 shadow-sm" style={{ background: `${tc}05` }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-lg text-slate-900 capitalize"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {format(selected, "EEEE d 'de' MMMM", { locale: es })}
                  </h3>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedTs.map(t => (
                    <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${tc}15` }}>
                        <Trophy className="w-4 h-4" style={{ color: tc }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 text-sm leading-tight"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                          {t.name}
                        </p>
                        {(t.city || t.state) && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" style={{ color: tc }} />
                            {[t.city, t.state].filter(Boolean).join(', ')}
                          </p>
                        )}
                        <span
                          className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                          style={{ background: `${colorOf(t, tc)}15`, color: colorOf(t, tc) }}
                        >
                          {statusLabel(t)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Legend ── */}
        <div className="mt-5 flex flex-wrap items-center gap-4 justify-end">
          {(Object.entries({
            in_progress: 'En curso',
            completed: 'Finalizado',
            published: 'Inscripciones',
            approved: 'Aprobado',
          }) as [string, string][]).map(([s, label]) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR[s] }} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
