import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchPlayerRankings, fetchCurrentUserRanking } from '@/store/slices/rankingsSlice';
import { getImageUrl } from '@/lib/utils';
import { TrendingUp, Trophy, Medal, Star, RefreshCcw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: '', label: 'Todas las categorías' },
  { value: 'singles', label: 'Singles' },
  { value: 'doubles', label: 'Dobles' },
  { value: 'mixed_doubles', label: 'Dobles Mixto' },
];

const SKILL_LEVELS = [
  { value: '', label: 'Todos los niveles' },
  { value: '5+', label: 'Profesional 5+' },
  { value: '4.5', label: 'Avanzado 4.5' },
  { value: '4.0', label: 'Avanzado 4.0' },
  { value: '3.5', label: 'Intermedio 3.5' },
  { value: '3.0', label: 'Intermedio 3.0' },
  { value: '2.5', label: 'Principiante 2.5' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function positionBadge(pos: number) {
  if (pos === 1) return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-400/20 border border-yellow-400/40">
      <Trophy className="w-3.5 h-3.5 text-yellow-400" />
    </span>
  );
  if (pos === 2) return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 border border-slate-300/40">
      <Medal className="w-3.5 h-3.5 text-slate-300" />
    </span>
  );
  if (pos === 3) return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-400/20 border border-orange-400/40">
      <Medal className="w-3.5 h-3.5 text-orange-400" />
    </span>
  );
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 text-white/50 text-[13px] font-bold tabular-nums">
      {pos}
    </span>
  );
}

const selectCls =
  'h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white ' +
  'px-3 outline-none appearance-none cursor-pointer ' +
  'focus:border-[#ace600]/50 transition-colors duration-150';

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RankingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const { playerRankings, userRanking, loading, pagination } = useSelector(
    (s: RootState) => s.rankings,
  );

  const [category, setCategory] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [page, setPage] = useState(1);

  // Load leaderboard
  useEffect(() => {
    dispatch(fetchPlayerRankings({
      category: category || undefined,
      skill_level: skillLevel || undefined,
      page,
      limit: 20,
    }));
  }, [dispatch, category, skillLevel, page]);

  // Load current user's own ranking once
  useEffect(() => {
    if (user?.id) dispatch(fetchCurrentUserRanking(user.id));
  }, [dispatch, user?.id]);

  const totalPages = pagination?.pages ?? 1;

  return (
    <div className="min-h-screen bg-[#06080E] text-white font-['DM_Sans',sans-serif] p-6 pb-16">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 bg-[#ace600]/[0.07] border border-[#ace600]/[0.15] rounded-full px-3 py-1 mb-2.5 text-[10px] font-bold tracking-[2px] text-[#ace600] uppercase">
          <TrendingUp className="w-2.5 h-2.5" /> Ranking Nacional
        </div>
        <h1 className="font-extrabold text-[clamp(24px,4vw,36px)] leading-none tracking-tight">
          TABLA DE <span className="text-[#ace600]">POSICIONES</span>
        </h1>
        <p className="text-white/50 text-[11px] tracking-[2px] uppercase font-bold mt-1.5">
          FEDMEX Pickleball — Sistema de puntos oficial
        </p>
      </div>

      {/* My rank banner */}
      {userRanking && (
        <div className="mb-6 bg-[#ace600]/[0.06] border border-[#ace600]/[0.2] rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ace600]/10 border border-[#ace600]/30 flex items-center justify-center">
              <Star className="w-4.5 h-4.5 text-[#ace600]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#ace600]/60">
                Tu posición actual
              </p>
              <p className="text-white font-extrabold text-[15px]">
                #{userRanking.position}
                <span className="text-white/50 font-normal text-[13px] ml-2">
                  {userRanking.category} · Nivel {userRanking.skill_level}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-[#ace600] font-extrabold text-[22px] leading-none">
                {userRanking.points}
              </p>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">puntos</p>
            </div>
            <div>
              <p className="text-white/80 font-bold text-[18px] leading-none">
                {userRanking.tournaments_played ?? 0}
              </p>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">torneos</p>
            </div>
            {userRanking.best_finish && (
              <div>
                <p className="text-white/80 font-bold text-[18px] leading-none">
                  #{userRanking.best_finish}
                </p>
                <p className="text-white/50 text-[10px] uppercase tracking-wider mt-0.5">mejor resultado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
            className={selectCls}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value} className="bg-[#0d1117]">{c.label}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            value={skillLevel}
            onChange={e => { setSkillLevel(e.target.value); setPage(1); }}
            className={selectCls}
          >
            {SKILL_LEVELS.map(s => (
              <option key={s.value} value={s.value} className="bg-[#0d1117]">{s.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => dispatch(fetchPlayerRankings({
            category: category || undefined,
            skill_level: skillLevel || undefined,
            page,
            limit: 20,
          }))}
          className="h-9 px-4 rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/70 text-sm hover:bg-white/[0.07] transition-colors flex items-center gap-2"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Actualizar
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[44px_1fr_120px_100px_80px] gap-3 px-5 py-3 border-b border-white/[0.05] text-[10px] font-bold uppercase tracking-widest text-white/40">
          <span>#</span>
          <span>Jugador</span>
          <span className="text-right">Puntos</span>
          <span className="text-right hidden sm:block">Torneos</span>
          <span className="text-right hidden sm:block">Nivel</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-white/40">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando ranking…</span>
          </div>
        ) : playerRankings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-white/40">
            <TrendingUp className="w-8 h-8" />
            <p className="text-sm">No hay datos de ranking para estos filtros.</p>
          </div>
        ) : (
          playerRankings.map((row: any) => {
            const isMe = row.user?.id === user?.id;
            const photo = row.user?.profile_photo
              ? getImageUrl(row.user.profile_photo)
              : null;
            return (
              <div
                key={row.id}
                className={cn(
                  'grid grid-cols-[44px_1fr_120px_100px_80px] gap-3 px-5 py-3.5',
                  'border-b border-white/[0.04] last:border-0',
                  'text-[13px] transition-colors duration-100',
                  isMe
                    ? 'bg-[#ace600]/[0.07] border-l-2 border-l-[#ace600]'
                    : 'hover:bg-white/[0.02]',
                )}
              >
                {/* Position */}
                <div className="flex items-center">
                  {positionBadge(row.position)}
                </div>

                {/* Player */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex-shrink-0 overflow-hidden flex items-center justify-center text-white/40 text-xs">
                    {photo
                      ? <img src={photo} alt="" className="w-full h-full object-cover" />
                      : (row.user?.full_name?.[0] ?? '?')}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      'font-semibold truncate',
                      isMe ? 'text-[#ace600]' : 'text-white/90',
                    )}>
                      {row.user?.full_name || row.user?.username || '—'}
                      {isMe && <span className="ml-1.5 text-[9px] font-bold tracking-widest text-[#ace600]/60 uppercase">Tú</span>}
                    </p>
                    <p className="text-[11px] text-white/40 truncate">
                      {row.user?.state || '—'}
                    </p>
                  </div>
                </div>

                {/* Points */}
                <div className="flex items-center justify-end">
                  <span className={cn(
                    'font-extrabold tabular-nums',
                    isMe ? 'text-[#ace600]' : 'text-white/85',
                  )}>
                    {row.points?.toLocaleString('en-US') ?? 0}
                  </span>
                </div>

                {/* Tournaments */}
                <div className="hidden sm:flex items-center justify-end text-white/55">
                  {row.tournaments_played ?? 0}
                </div>

                {/* Skill level */}
                <div className="hidden sm:flex items-center justify-end">
                  <span className="text-[11px] font-bold bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-md text-white/60">
                    {row.skill_level}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-white/60 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[13px] text-white/50 tabular-nums">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-white/60 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* System info */}
      <div className="mt-8 bg-white/[0.02] border border-white/[0.05] rounded-xl px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#ace600]/50 mb-3">
          Cómo se calculan los puntos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px] text-white/55">
          <div>
            <p className="font-semibold text-white/70 mb-1">Tier 3 — Nacional</p>
            <p>Todos los resultados cuentan. Máximo 300 pts por torneo (Campeonato Nacional, nivel 5+).</p>
          </div>
          <div>
            <p className="font-semibold text-white/70 mb-1">Tier 2 — Estatal</p>
            <p>Todos los resultados cuentan. Máximo 200 pts (Campeonato Estatal).</p>
          </div>
          <div>
            <p className="font-semibold text-white/70 mb-1">Tier 1 — Local</p>
            <p>Mejores 3 resultados (Municipal) o mejores 6 (Locales). Máximo 100 pts.</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-white/40">
          {[
            ['Campeón', '100%'],
            ['Finalista', '75%'],
            ['3° Lugar', '50%'],
            ['Cuartos', '35%'],
            ['Octavos', '20%'],
            ['Participación', '10%'],
          ].map(([label, pct]) => (
            <span key={label}>{label}: <span className="text-[#ace600]/70 font-bold">{pct}</span></span>
          ))}
        </div>
      </div>
    </div>
  );
}
