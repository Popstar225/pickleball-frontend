import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Users, Search, MapPin, Trophy, Star, MessageCircle,
  UserPlus, Filter, X, Clock, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Player {
  id: number; name: string; location: string; skillLevel: string;
  rating: number; tournamentsPlayed: number; club: string; avatar: string;
  lastActive: string; bio: string; preferredPositions: string[]; availability: string;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────
const PLAYERS: Player[] = [
  { id: 1, name: 'María González',  location: 'Ciudad de México', skillLevel: 'Avanzado',    rating: 4.9, tournamentsPlayed: 28, club: 'Club Pickleball CDMX',       avatar: '', lastActive: '2024-03-20', bio: 'Jugadora apasionada con experiencia en torneos nacionales.',                              preferredPositions: ['Derecha', 'Ambos'],     availability: 'Fines de semana' },
  { id: 2, name: 'Carlos Rodríguez',location: 'Guadalajara',      skillLevel: 'Intermedio',  rating: 4.3, tournamentsPlayed: 15, club: 'Pickleball Guadalajara',     avatar: '', lastActive: '2024-03-19', bio: 'Busco compañeros para entrenar y mejorar mi juego.',                                     preferredPositions: ['Izquierda'],            availability: 'Entre semana' },
  { id: 3, name: 'Ana López',        location: 'Monterrey',        skillLevel: 'Principiante',rating: 4.1, tournamentsPlayed: 5,  club: 'Club Deportivo Monterrey',   avatar: '', lastActive: '2024-03-18', bio: 'Nueva en el pickleball, buscando aprender con jugadores experimentados.',                 preferredPositions: ['Ambos'],               availability: 'Fines de semana' },
  { id: 4, name: 'Roberto Sánchez', location: 'Querétaro',        skillLevel: 'Avanzado',    rating: 4.8, tournamentsPlayed: 42, club: 'Club Querétaro Pickleball',  avatar: '', lastActive: '2024-03-20', bio: 'Ex campeón estatal, disponible para coaching y partidos competitivos.',                   preferredPositions: ['Derecha', 'Izquierda'],availability: 'Todos los días' },
  { id: 5, name: 'Laura Martínez',  location: 'Tijuana',          skillLevel: 'Intermedio',  rating: 4.5, tournamentsPlayed: 22, club: 'Pickleball Tijuana',         avatar: '', lastActive: '2024-03-17', bio: 'Me encanta el dobles mixto y los torneos locales.',                                      preferredPositions: ['Ambos'],               availability: 'Fines de semana' },
];

const COMMUNITY_STATS = [
  { label: 'Jugadores Activos',   value: '1,247', color: 'text-[#ace600]', bg: 'bg-[#ace600]/10 border-[#ace600]/20', icon: Users },
  { label: 'Clubes Registrados',  value: '89',    color: 'text-sky-400',   bg: 'bg-sky-500/10 border-sky-500/20',     icon: Trophy },
  { label: 'Torneos este Mes',    value: '156',   color: 'text-violet-400',bg: 'bg-violet-500/10 border-violet-500/20',icon: Trophy },
  { label: 'Rating Promedio',     value: '4.6',   color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Star },
];

const SKILL_CONFIG: Record<string, { cls: string; dot: string }> = {
  Principiante: { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Intermedio:   { cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20',             dot: 'bg-sky-400' },
  Avanzado:     { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       dot: 'bg-amber-400' },
  Profesional:  { cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20',    dot: 'bg-violet-400' },
};

const SKILL_LEVELS = ['Principiante', 'Intermedio', 'Avanzado', 'Profesional'];

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Initials({ name }: { name: string }) {
  const letters = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-12 h-12 rounded-2xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-sm font-black text-[#ace600] shrink-0 select-none">
      {letters}
    </div>
  );
}

function SkillPill({ level }: { level: string }) {
  const c = SKILL_CONFIG[level] ?? { cls: 'bg-white/[0.05] text-white/30 border-white/[0.08]', dot: 'bg-white/20' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0', c.cls)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
      {level}
    </span>
  );
}

function MetaChip({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-white/30">
      <Icon className="w-3 h-3 text-white/20 shrink-0" />
      {children}
    </span>
  );
}

const inputCls = cn(
  'h-10 rounded-xl text-sm',
  'bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20',
  'focus-visible:ring-0 focus-visible:border-[#ace600]/50 focus-visible:bg-[#ace600]/[0.03]',
  'transition-all',
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PlayerSearchPage() {
  const [search, setSearch]       = useState('');
  const [location, setLocation]   = useState('');
  const [skill, setSkill]         = useState('');
  const [showFilters, setFilters] = useState(false);

  const filtered = PLAYERS.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q)) &&
      (!location || p.location.toLowerCase().includes(location.toLowerCase())) &&
      (!skill || p.skillLevel === skill)
    );
  });

  const activeFilters = [
    location && { label: location, clear: () => setLocation('') },
    skill    && { label: skill,    clear: () => setSkill('') },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[22px] font-bold text-white tracking-tight">Buscar Jugadores</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-white/25">Encuentra compañeros de juego y conecta con la comunidad</p>
        </div>
        <button onClick={() => setFilters(v => !v)}
          className={cn(
            'inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold border transition-all',
            showFilters
              ? 'bg-[#ace600]/10 border-[#ace600]/30 text-[#ace600]'
              : 'bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.07]',
          )}>
          <Filter className="w-3.5 h-3.5" />
          Filtros
          {activeFilters.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#ace600] text-black text-[9px] font-black flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Search + filters panel ───────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
          <Input className={cn(inputCls, 'pl-10 pr-9')}
            placeholder="Buscar por nombre o club…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/[0.05]">
            {/* Location */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">Ubicación</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
                <Input className={cn(inputCls, 'pl-10 pr-9')}
                  placeholder="Ciudad o estado…"
                  value={location} onChange={e => setLocation(e.target.value)} />
                {location && (
                  <button onClick={() => setLocation('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Skill level — pill tabs */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">Nivel de Habilidad</label>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setSkill('')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all',
                    !skill
                      ? 'bg-[#ace600] border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                      : 'bg-white/[0.03] border-white/[0.07] text-white/30 hover:text-white/55 hover:border-white/[0.12]',
                  )}>
                  Todos
                </button>
                {SKILL_LEVELS.map(s => {
                  const c = SKILL_CONFIG[s];
                  const active = skill === s;
                  return (
                    <button key={s} onClick={() => setSkill(active ? '' : s)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all',
                        active ? cn(c.cls) : 'bg-white/[0.03] border-white/[0.07] text-white/30 hover:text-white/55 hover:border-white/[0.12]',
                      )}>
                      {active && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.05]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Filtros activos:</span>
            {activeFilters.map(({ label, clear }) => (
              <button key={label} onClick={clear}
                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600] hover:opacity-70 transition-opacity">
                {label} <X className="w-3 h-3" />
              </button>
            ))}
            <button onClick={() => { setSearch(''); setLocation(''); setSkill(''); }}
              className="text-[11px] text-white/20 hover:text-white/45 transition-colors">
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <Users className="w-5 h-5 text-white/10" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/35 mb-1">No se encontraron jugadores</p>
            <p className="text-xs text-white/20 max-w-[200px] leading-relaxed">
              Intenta ajustar tus criterios de búsqueda
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(player => (
            <div key={player.id}
              className="group bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-all">
              <div className="flex items-start gap-4">
                <Initials name={player.name} />

                <div className="flex-1 min-w-0">
                  {/* Row 1: name + badges */}
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <h3 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                        {player.name}
                      </h3>
                      <SkillPill level={player.skillLevel} />
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-400">{player.rating}</span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => alert(`Mensaje al jugador ${player.id}`)}
                        className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-bold border border-white/[0.09] bg-white/[0.04] hover:bg-white/[0.09] text-white/40 hover:text-white transition-all">
                        <MessageCircle className="w-3 h-3" /> Mensaje
                      </button>
                      <button onClick={() => alert(`Conectar con jugador ${player.id}`)}
                        className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_8px_rgba(172,230,0,0.12)] transition-all">
                        <UserPlus className="w-3 h-3" /> Conectar
                      </button>
                    </div>
                  </div>

                  {/* Row 2: meta chips */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2.5">
                    <MetaChip icon={MapPin}>{player.location}</MetaChip>
                    <MetaChip icon={Trophy}>{player.tournamentsPlayed} torneos</MetaChip>
                    <MetaChip icon={Users}>{player.club}</MetaChip>
                    <MetaChip icon={Clock}>
                      Activo {new Date(player.lastActive).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </MetaChip>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-white/35 leading-relaxed mb-3">{player.bio}</p>

                  {/* Tags row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Posiciones:</span>
                    {player.preferredPositions.map((pos, i) => (
                      <span key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.04] border border-white/[0.08] text-white/35">
                        {pos}
                      </span>
                    ))}
                    <span className="ml-1 text-[10px] text-white/20">·</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Disponible:</span>
                    <span className="text-[10px] text-white/35">{player.availability}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Community stats ──────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4">Estadísticas de la Comunidad</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COMMUNITY_STATS.map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center justify-center gap-2 py-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
              <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center', bg)}>
                <Icon className={cn('w-3.5 h-3.5', color)} />
              </div>
              <p className={cn('text-xl font-bold leading-none', color)}>{value}</p>
              <p className="text-[10px] text-white/20 text-center leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}