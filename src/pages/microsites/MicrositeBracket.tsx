import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Maximize, Minimize, X, ChevronDown, Zap, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import TournamentBracket from '@/components/tournament/TournamentBracket';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TournamentEvent {
  id: string;
  skill_block: string;
  gender: string;
  modality: string;
  format: string;
  registration_status: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pickBestTournament(tournaments: any[]): any | null {
  if (!tournaments.length) return null;
  const live = tournaments.find(t => t.status === 'in_progress');
  if (live) return live;
  const done = [...tournaments]
    .filter(t => t.status === 'completed')
    .sort((a, b) =>
      new Date(b.end_date ?? b.start_date).getTime() -
      new Date(a.end_date ?? a.start_date).getTime(),
    );
  return done[0] ?? tournaments[tournaments.length - 1];
}

function eventLabel(e: TournamentEvent): string {
  const g: Record<string, string> = { M: 'Varonil', F: 'Femenil', Mixed: 'Mixto' };
  return `${e.skill_block} ${g[e.gender] ?? e.gender} ${e.modality}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MicrositeBracket({
  tournaments,
  tc,
}: {
  tournaments: any[];
  tc: string;
}) {
  const [selectedTournament, setSelectedTournament] = useState<any | null>(null);
  const [events, setEvents] = useState<TournamentEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Bracket data (same shape TournamentBracket expects)
  const [bracketData, setBracketData] = useState<{
    matches: any[];
    total_rounds: number;
    tournament_name?: string;
    event_type?: string;
  } | null>(null);

  // Group stage data
  const [groupMatches, setGroupMatches] = useState<any[]>([]);
  const [groups, setGroups]             = useState<any[]>([]);

  const [loadingEvents,  setLoadingEvents]  = useState(false);
  const [loadingBracket, setLoadingBracket] = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen]     = useState(false);
  const [pickerOpen, setPickerOpen]         = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setIsFullscreen(f => !f); }
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Pick best tournament on mount / list change
  useEffect(() => {
    setSelectedTournament(pickBestTournament(tournaments));
  }, [tournaments]);

  // Fetch events whenever tournament changes
  useEffect(() => {
    if (!selectedTournament) return;
    setLoadingEvents(true);
    setEvents([]);
    setSelectedEventId(null);
    setBracketData(null);
    setGroupMatches([]);
    setGroups([]);
    setError(null);

    api.get<any>(`/tournaments/${selectedTournament.id}/events`)
      .then(res => {
        const list: TournamentEvent[] = Array.isArray(res) ? res : (res?.data ?? []);
        setEvents(list);
        if (list.length) setSelectedEventId(list[0].id);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, [selectedTournament]);

  // Fetch bracket + group data whenever event changes
  useEffect(() => {
    if (!selectedTournament || !selectedEventId) return;
    setLoadingBracket(true);
    setBracketData(null);
    setGroupMatches([]);
    setGroups([]);
    setError(null);

    const tid = selectedTournament.id;
    const eid = selectedEventId;

    Promise.all([
      api.get<any>(`/tournaments/${tid}/events/${eid}/bracket`),
      api.get<any>(`/tournaments/${tid}/events/${eid}/matches`),
      api.get<any>(`/tournaments/${tid}/events/${eid}/groups`),
    ])
      .then(([bracketRes, matchesRes, groupsRes]) => {
        // Bracket
        const bRaw = bracketRes?.data ?? bracketRes;
        if (bRaw && Array.isArray(bRaw.matches)) {
          setBracketData(bRaw);
        } else {
          setError('El cuadro aún no ha sido generado para este evento.');
        }

        // All event matches → filter to group stage only
        const allMatches: any[] = Array.isArray(matchesRes) ? matchesRes : (matchesRes?.data ?? []);
        setGroupMatches(allMatches.filter((m: any) => m.match_type === 'group_stage'));

        // Groups list
        const gList: any[] = Array.isArray(groupsRes) ? groupsRes : (groupsRes?.data ?? []);
        setGroups(gList);
      })
      .catch(() => setError('No se pudo cargar el cuadro. El torneo podría no haber iniciado aún.'))
      .finally(() => setLoadingBracket(false));
  }, [selectedTournament, selectedEventId]);

  const isLive = selectedTournament?.status === 'in_progress';

  // Champion from bracket data
  const finalMatch = bracketData?.matches.find(
    m => m.round === bracketData.total_rounds && m.winner_id,
  );
  const championName = finalMatch
    ? (finalMatch.winner_id === finalMatch.player1_id ? finalMatch.player1_name : finalMatch.player2_name)
    : null;
  const runnerUpName = finalMatch
    ? (finalMatch.winner_id === finalMatch.player1_id ? finalMatch.player2_name : finalMatch.player1_name)
    : null;

  if (!tournaments.length) return null;

  return (
    <section className="py-8 sm:py-14 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.055]"
        style={{ backgroundImage: `radial-gradient(${tc} 1px, transparent 1px)`, backgroundSize: '28px 28px' }}
      />
      {/* Ambient glows */}
      <div
        className="absolute top-0 right-0 w-[45vw] h-[45vh] rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{ background: tc }}
      />
      <div
        className="absolute bottom-0 left-0 w-[30vw] h-[35vh] rounded-full blur-[110px] opacity-08 pointer-events-none"
        style={{ background: tc }}
      />

      <div
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6 flex flex-col overflow-y-auto'
            : 'container mx-auto px-4 sm:px-6 relative z-10'
        }
      >
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="relative shrink-0">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div className="absolute inset-0 blur-md bg-yellow-400 opacity-40 pointer-events-none" />
              </div>
              {isLive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" /> En Vivo
                </span>
              )}
            </div>

            <h2
              className="font-black text-white leading-tight uppercase tracking-tight text-3xl sm:text-5xl md:text-6xl"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Cuadro del Torneo
            </h2>

            {/* Tournament selector */}
            <div className="relative mt-2">
              <button
                onClick={() => tournaments.length > 1 && setPickerOpen(o => !o)}
                className="inline-flex items-center gap-1.5 group"
              >
                <span className="text-slate-200 text-sm font-semibold truncate max-w-[300px]">
                  {selectedTournament?.name ?? 'Seleccionar torneo'}
                </span>
                {tournaments.length > 1 && (
                  <ChevronDown
                    className={`w-4 h-4 text-slate-300 transition-transform shrink-0 ${pickerOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              <AnimatePresence>
                {pickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 z-30 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden min-w-[280px]"
                  >
                    {tournaments.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setSelectedTournament(t); setPickerOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-between gap-3 ${
                          selectedTournament?.id === t.id ? 'text-white bg-slate-800/50' : 'text-slate-200'
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        <span
                          className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                          style={
                            t.status === 'in_progress'
                              ? { background: `${tc}25`, color: tc }
                              : { background: '#1e293b', color: '#64748b' }
                          }
                        >
                          {t.status === 'in_progress' ? 'En curso'
                            : t.status === 'completed' ? 'Finalizado' : 'Próximo'}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsFullscreen(f => !f)}
              title={isFullscreen ? 'Salir (Esc)' : 'Pantalla completa (Ctrl+F)'}
              className="w-9 h-9 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl flex items-center justify-center transition-all"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            {isFullscreen && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="w-9 h-9 border border-slate-700 bg-slate-800 hover:bg-red-900 text-slate-300 hover:text-white rounded-xl flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Event tabs ── */}
        {!loadingEvents && events.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {events.map(evt => (
              <button
                key={evt.id}
                onClick={() => setSelectedEventId(evt.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  selectedEventId === evt.id
                    ? 'text-black shadow-md'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
                style={selectedEventId === evt.id ? { background: tc } : {}}
              >
                {eventLabel(evt)}
              </button>
            ))}
          </div>
        )}

        {/* ── Info bar ── */}
        {bracketData && (
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-slate-200">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: tc }} />
              {bracketData.matches.length} Partidos
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Trophy className="w-3.5 h-3.5 shrink-0" style={{ color: tc }} />
              {bracketData.total_rounds} Rondas
            </span>
            {selectedTournament?.start_date && (
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: tc }} />
                {new Date(selectedTournament.start_date).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            )}
            {isLive && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-200">En Vivo</span>
              </span>
            )}
          </div>
        )}

        {/* ── Loading ── */}
        {(loadingEvents || loadingBracket) && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `${tc}18` }}
              >
                <Trophy className="w-6 h-6" style={{ color: tc }} />
              </motion.div>
              <p className="text-slate-300 text-xs font-black uppercase tracking-widest">
                {loadingEvents ? 'Cargando eventos…' : 'Cargando cuadro…'}
              </p>
            </div>
          </div>
        )}

        {/* ── Error / empty ── */}
        {!loadingEvents && !loadingBracket && (error || !bracketData) && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border border-slate-800"
              style={{ background: `${tc}10` }}
            >
              <Trophy className="w-7 h-7" style={{ color: tc }} />
            </div>
            <p
              className="text-white font-black text-2xl mb-2 uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {events.length === 0 ? 'Sin eventos' : 'Cuadro no disponible'}
            </p>
            <p className="text-slate-300 text-sm max-w-sm">
              {events.length === 0
                ? 'Este torneo no tiene eventos registrados.'
                : error ?? 'El cuadro se generará cuando el torneo esté en curso.'}
            </p>
          </div>
        )}

        {/* ── Bracket (same component as dashboard) ── */}
        {!loadingBracket && (bracketData || groupMatches.length > 0) && (
          <div className={isFullscreen ? 'flex-1' : ''}>
            <TournamentBracket
              bracketData={bracketData}
              onMatchClick={() => {}}
              groupMatches={groupMatches}
              groups={groups}
            />
          </div>
        )}

        {/* ── Champion banner ── */}
        {championName && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 rounded-3xl border border-yellow-500/20 overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.07) 0%, transparent 100%)' }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-12 bg-yellow-400" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-08 bg-amber-500" />
            </div>
            <div className="relative px-6 py-7 sm:px-9 sm:py-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-yellow-400 blur-2xl opacity-25 animate-pulse" />
                <Trophy
                  className="relative w-16 h-16 drop-shadow-2xl"
                  style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 18px rgba(251,191,36,0.65))' }}
                />
              </div>
              <div className="flex-1">
                <p className="text-yellow-400/55 text-[10px] font-black uppercase tracking-[0.25em] mb-1">
                  🏆 Campeón — {bracketData?.event_type}
                </p>
                <h3
                  className="font-black text-white text-3xl sm:text-4xl uppercase leading-none"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {championName}
                </h3>
                {runnerUpName && (
                  <p className="text-slate-200 text-sm mt-1.5 font-medium">
                    Final: venció a{' '}
                    <span className="text-slate-300 font-bold">{runnerUpName}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-6 shrink-0">
                <div className="text-center">
                  <p
                    className="font-black text-white text-3xl tabular-nums"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {bracketData?.matches.filter(m => m.status === 'completed').length ?? 0}
                  </p>
                  <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mt-0.5">
                    Jugados
                  </p>
                </div>
                <div className="text-center">
                  <p
                    className="font-black text-white text-3xl tabular-nums"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {bracketData?.total_rounds ?? 0}
                  </p>
                  <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mt-0.5">
                    Rondas
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
