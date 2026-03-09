/**
 * Qualifier Selection Component
 */

import React, { useState } from 'react';
import { Trophy, Users, Zap, CheckCircle2, Target, Award, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Qualifier {
  userId: string; userName: string; position: number;
  groupId: string; groupNumber: number; matchesWon: number; qualified: boolean;
}
interface Props {
  eventId: string; eventName: string; groups: any[];
  qualifiers: Qualifier[]; advanceCount: number;
  onExtractQualifiers: (strategy: 'topN' | 'bestOf') => Promise<void>;
  onConfirmAdvancement: () => Promise<void>;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STRATEGIES = [
  {
    id: 'topN' as const,
    label: 'Top N por Grupo',
    sub: 'Método simple',
    icon: Target,
    desc: 'Extrae los mejores N jugadores de cada grupo. Simple y directo.',
    example: '5 grupos × 2 = 10 clasificados',
  },
  {
    id: 'bestOf' as const,
    label: 'Mejor de Restantes',
    sub: 'Método competitivo',
    icon: Award,
    desc: 'Top N de cada grupo, luego los mejores restantes completan el bracket para garantizar competencia equilibrada.',
    example: '5 grupos: 10 clasificados → 3 mejores 2° avanzaron (8 total)',
  },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, children, sub }: {
  icon: React.ElementType; children: React.ReactNode; sub?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-[#ace600]" />
      </div>
      <div>
        <p className="text-sm font-bold text-white/80">{children}</p>
        {sub && <p className="text-[10px] text-white/25">{sub}</p>}
      </div>
    </div>
  );
}

function StatMini({ label, value, color = 'text-white' }: {
  label: string; value: React.ReactNode; color?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
      <p className={cn('text-2xl font-black leading-none', color)}>{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 text-center">{label}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const QualifierSelection: React.FC<Props> = ({
  eventId, eventName, groups, qualifiers, advanceCount,
  onExtractQualifiers, onConfirmAdvancement,
}) => {
  const [strategy, setStrategy]     = useState<'topN' | 'bestOf'>('topN');
  const [isExtracting, setExtracting] = useState(false);
  const [isConfirming, setConfirming] = useState(false);

  const handleExtract = async () => {
    setExtracting(true);
    try { await onExtractQualifiers(strategy); }
    catch (e) { console.error(e); }
    finally   { setExtracting(false); }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try { await onConfirmAdvancement(); }
    catch (e) { console.error(e); }
    finally   { setConfirming(false); }
  };

  const qualifierCount = qualifiers.length;
  let bracketSize = 1;
  while (bracketSize < qualifierCount) bracketSize *= 2;
  const byeCount = bracketSize - qualifierCount;

  const qualifiersByGroup = groups.map(g => ({
    ...g, qualifiers: qualifiers.filter(q => q.groupId === g.id),
  }));

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Strategy + Extract ──────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <SectionHeading icon={Trophy} sub={eventName}>Estrategia de Clasificación</SectionHeading>
        </div>

        <div className="p-5 space-y-5">
          {/* Strategy cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STRATEGIES.map(s => {
              const Icon   = s.icon;
              const active = strategy === s.id;
              return (
                <button key={s.id} type="button" onClick={() => setStrategy(s.id)}
                  className={cn(
                    'text-left p-4 rounded-xl border transition-all',
                    active
                      ? 'bg-[#ace600]/[0.06] border-[#ace600]/30'
                      : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.04]',
                  )}>
                  <div className="flex items-start gap-3 mb-2">
                    <div className={cn(
                      'w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-all',
                      active ? 'bg-[#ace600]/10 border-[#ace600]/20' : 'bg-white/[0.05] border-white/[0.08]',
                    )}>
                      <Icon className={cn('w-4 h-4', active ? 'text-[#ace600]' : 'text-white/25')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('text-sm font-bold transition-colors', active ? 'text-white' : 'text-white/55')}>
                          {s.label}
                        </p>
                        <div className={cn(
                          'w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-all',
                          active ? 'border-[#ace600] bg-[#ace600]' : 'border-white/20',
                        )} />
                      </div>
                      <p className="text-[10px] font-mono text-white/25">{s.sub}</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/30 leading-relaxed mb-2">{s.desc}</p>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07]">
                    <span className="text-[9px] font-bold text-white/25 font-mono">Ej: {s.example}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Extract CTA */}
          <button onClick={handleExtract} disabled={isExtracting}
            className="w-full h-10 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_14px_rgba(172,230,0,0.18)] transition-all disabled:opacity-50">
            {isExtracting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Extrayendo Clasificados…</>
              : <><Zap className="w-4 h-4" />Extraer Clasificados</>
            }
          </button>
        </div>
      </div>

      {/* ── Bracket preview ─────────────────────────────────────────────────── */}
      {qualifierCount > 0 && (
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
            <SectionHeading icon={Users} sub={`${qualifierCount} clasificados confirmados`}>
              Vista Previa del Bracket
            </SectionHeading>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatMini label="Clasificados" value={qualifierCount} color="text-[#ace600]" />
              <StatMini label="Tamaño Bracket" value={bracketSize} />
              <StatMini label="Byes" value={byeCount} color={byeCount > 0 ? 'text-amber-400' : 'text-white'} />
            </div>

            <div className={cn(
              'flex items-start gap-2.5 p-3.5 rounded-xl border text-xs leading-relaxed',
              strategy === 'topN'
                ? 'bg-sky-500/[0.05] border-sky-500/15 text-sky-400/70'
                : 'bg-violet-500/[0.05] border-violet-500/15 text-violet-400/70',
            )}>
              <ChevronRight className={cn('w-3.5 h-3.5 shrink-0 mt-0.5', strategy === 'topN' ? 'text-sky-400' : 'text-violet-400')} />
              {strategy === 'topN'
                ? `${qualifierCount} clasificados formarán un bracket de ${bracketSize} con ${byeCount} bye${byeCount !== 1 ? 's' : ''} asignados a las semillas más altas.`
                : `Los mejores ${Math.ceil(qualifierCount / Math.max(groups.length, 1))} por grupo avanzan. Los lugares restantes se completan con los mejores 2°s lugares.`
              }
            </div>
          </div>
        </div>
      )}

      {/* ── Qualifiers by group ──────────────────────────────────────────────── */}
      {qualifierCount > 0 && (
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <SectionHeading icon={Trophy} sub={`${qualifierCount} clasificados en total`}>
              Clasificados por Grupo
            </SectionHeading>
          </div>

          <div className="p-5 space-y-4">
            {qualifiersByGroup.map((group, gi) => (
              <div key={group.id}>
                {/* Group header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[10px] font-black text-[#ace600] shrink-0">
                    {group.groupNumber ?? gi + 1}
                  </div>
                  <span className="text-xs font-bold text-white/50">
                    Grupo {group.groupNumber ?? gi + 1}
                  </span>
                  <span className="text-[10px] text-white/20">·</span>
                  <span className="text-[10px] text-white/25">{group.qualifiers.length} clasificados</span>
                  <div className="flex-1 h-px bg-white/[0.05] ml-1" />
                </div>

                {/* Qualifier rows */}
                {group.qualifiers.length > 0 ? (
                  <div className="space-y-1.5 pl-8">
                    {group.qualifiers.map((q: Qualifier) => {
                      const autoAdvances = q.position <= advanceCount;
                      return (
                        <div key={q.userId}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all',
                            autoAdvances
                              ? 'bg-[#ace600]/[0.04] border-[#ace600]/20'
                              : 'bg-white/[0.02] border-white/[0.05]',
                          )}>
                          {/* Position badge */}
                          <span className={cn(
                            'w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0',
                            q.position === 1 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' :
                            q.position === 2 ? 'bg-slate-400/15 text-slate-300 border border-slate-400/20' :
                                               'bg-white/[0.05] text-white/25 border border-white/[0.08]',
                          )}>
                            {q.position}
                          </span>

                          {/* Name */}
                          <span className={cn(
                            'flex-1 text-xs font-semibold truncate',
                            autoAdvances ? 'text-white/80' : 'text-white/55',
                          )}>
                            {q.userName}
                          </span>

                          {/* Wins */}
                          <span className="text-[10px] font-mono text-white/25 shrink-0">
                            {q.matchesWon}G
                          </span>

                          {/* Auto-advance pill */}
                          {autoAdvances && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#ace600] shrink-0">
                              <CheckCircle2 className="w-3 h-3" /> Avanza
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="pl-8 text-[11px] text-white/20">Sin clasificados en este grupo</p>
                )}
              </div>
            ))}

            {/* Confirm button */}
            <div className="pt-2 border-t border-white/[0.05]">
              <button onClick={handleConfirm} disabled={isConfirming || qualifierCount === 0}
                className="w-full h-10 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_14px_rgba(172,230,0,0.18)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isConfirming
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Confirmando…</>
                  : <><Trophy className="w-4 h-4" />Confirmar Avance y Generar Bracket</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualifierSelection;