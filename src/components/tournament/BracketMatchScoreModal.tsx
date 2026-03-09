/**
 * BracketMatchScoreModal
 *
 * Full set-score entry form for elimination bracket matches.
 * Supports normal score entry (best-of-3 to 11) and special outcomes
 * (walkover, no-show, withdrawal, injury, disqualification).
 */

import { useState } from 'react';
import { X, Trophy, AlertTriangle, Minus, Plus } from 'lucide-react';

interface Player {
  id: string;
  name: string;
}

interface SetScore {
  set: number;
  player1: number;
  player2: number;
}

type SpecialOutcome = 'walkover' | 'no_show' | 'withdrawal' | 'injury' | 'disqualification';

interface BracketMatchScoreModalProps {
  matchId: string;
  player1: Player;
  player2: Player;
  matchFormat?: string; // 'best_of_3_to_11' | 'best_of_3_to_15' | 'best_of_5_to_11'
  onSubmit: (payload: {
    matchId: string;
    winnerId: string;
    loserId: string;
    setScores: SetScore[];
    winnerBy: string;
    reason?: string;
  }) => Promise<void>;
  onClose: () => void;
}

const SPECIAL_OUTCOMES: { key: SpecialOutcome; label: string; color: string }[] = [
  { key: 'walkover',        label: 'Walkover',         color: '#f59e0b' },
  { key: 'no_show',         label: 'No se presentó',   color: '#ef4444' },
  { key: 'withdrawal',      label: 'Retiro',            color: '#8b5cf6' },
  { key: 'injury',          label: 'Lesión',            color: '#f97316' },
  { key: 'disqualification',label: 'Descalificación',  color: '#dc2626' },
];

function ScoreInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 flex items-center justify-center rounded bg-white/[0.07] hover:bg-white/[0.12] text-white/60 hover:text-white transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <input
        type="number"
        min={0}
        max={30}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(30, Number(e.target.value))))}
        className="w-12 text-center text-sm font-bold text-white bg-white/[0.07] border border-white/10 rounded py-1 focus:outline-none focus:border-[#ace600]"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(30, value + 1))}
        className="w-7 h-7 flex items-center justify-center rounded bg-white/[0.07] hover:bg-white/[0.12] text-white/60 hover:text-white transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

function validateSets(sets: SetScore[], pointsTo: number): string | null {
  for (const s of sets) {
    const p1 = s.player1;
    const p2 = s.player2;
    if (p1 === p2) return `Set ${s.set}: el marcador no puede ser empate`;
    const max = Math.max(p1, p2);
    const min = Math.min(p1, p2);
    if (max < pointsTo) return `Set ${s.set}: el ganador necesita al menos ${pointsTo} puntos`;
    if (max === pointsTo && max - min < 2) return `Set ${s.set}: se requiere ventaja de 2 puntos`;
    if (max > pointsTo && max - min !== 2) return `Set ${s.set}: diferencia en deuce debe ser exactamente 2`;
  }
  return null;
}

export default function BracketMatchScoreModal({
  matchId,
  player1,
  player2,
  matchFormat = 'best_of_3_to_11',
  onSubmit,
  onClose,
}: BracketMatchScoreModalProps) {
  const maxSets = matchFormat.includes('best_of_5') ? 5 : 3;
  const setsToWin = Math.ceil(maxSets / 2);
  const pointsTo = matchFormat.includes('_to_15') ? 15 : 11;

  const [sets, setSets] = useState<SetScore[]>([{ set: 1, player1: 0, player2: 0 }]);
  const [specialMode, setSpecialMode] = useState<SpecialOutcome | null>(null);
  const [specialWinner, setSpecialWinner] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine winner/loser from set scores
  const setsWonP1 = sets.filter((s) => s.player1 > s.player2).length;
  const setsWonP2 = sets.filter((s) => s.player2 > s.player1).length;
  const scoreWinnerId = setsWonP1 >= setsToWin ? player1.id : setsWonP2 >= setsToWin ? player2.id : null;
  const scoreLoserId = scoreWinnerId === player1.id ? player2.id : scoreWinnerId === player2.id ? player1.id : null;

  const addSet = () => {
    if (sets.length < maxSets) {
      setSets([...sets, { set: sets.length + 1, player1: 0, player2: 0 }]);
    }
  };

  const removeLastSet = () => {
    if (sets.length > 1) setSets(sets.slice(0, -1));
  };

  const updateSet = (idx: number, player: 'player1' | 'player2', val: number) => {
    const next = [...sets];
    next[idx] = { ...next[idx], [player]: val };
    setSets(next);
  };

  const handleSubmit = async () => {
    setError(null);

    if (specialMode) {
      if (!specialWinner) {
        setError('Selecciona qué jugador avanza');
        return;
      }
      const loserId = specialWinner === player1.id ? player2.id : player1.id;
      setSubmitting(true);
      try {
        await onSubmit({ matchId, winnerId: specialWinner, loserId, setScores: [], winnerBy: specialMode, reason });
        onClose();
      } catch (e: any) {
        setError(e?.message || 'Error al guardar');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Normal score validation
    const validationError = validateSets(sets, pointsTo);
    if (validationError) { setError(validationError); return; }

    if (!scoreWinnerId) {
      setError(`Se requieren ${setsToWin} sets ganados para determinar ganador`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ matchId, winnerId: scoreWinnerId, loserId: scoreLoserId!, setScores: sets, winnerBy: 'score' });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#ace600]" />
            <span className="text-white font-semibold text-sm">Registrar Resultado</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Players */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 text-center">
              <p className="text-white font-semibold text-sm truncate">{player1.name}</p>
              {!specialMode && <p className="text-[#ace600] text-lg font-bold mt-0.5">{setsWonP1}</p>}
            </div>
            <span className="text-white/30 text-xs font-bold shrink-0">VS</span>
            <div className="flex-1 text-center">
              <p className="text-white font-semibold text-sm truncate">{player2.name}</p>
              {!specialMode && <p className="text-[#ace600] text-lg font-bold mt-0.5">{setsWonP2}</p>}
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setSpecialMode(null); setSpecialWinner(null); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${!specialMode ? 'bg-[#ace600] text-black' : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.08]'}`}
            >
              Marcador
            </button>
            <button
              type="button"
              onClick={() => { setSpecialMode('walkover'); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${specialMode ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.08]'}`}
            >
              Caso Especial
            </button>
          </div>

          {/* Normal score entry */}
          {!specialMode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs uppercase tracking-wider">Sets</span>
                <span className="text-white/30 text-xs">{matchFormat.replace(/_/g, ' ')}</span>
              </div>

              {sets.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-white/30 text-xs w-10 shrink-0">Set {s.set}</span>
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <ScoreInput value={s.player1} onChange={(v) => updateSet(i, 'player1', v)} />
                    <span className="text-white/20 text-xs">–</span>
                    <ScoreInput value={s.player2} onChange={(v) => updateSet(i, 'player2', v)} />
                  </div>
                  {/* Set winner indicator */}
                  <span className="text-xs w-16 text-right shrink-0">
                    {s.player1 > s.player2
                      ? <span className="text-[#ace600] font-semibold truncate block">{player1.name.split(' ')[0]}</span>
                      : s.player2 > s.player1
                        ? <span className="text-[#ace600] font-semibold truncate block">{player2.name.split(' ')[0]}</span>
                        : null}
                  </span>
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                {sets.length < maxSets && (
                  <button
                    type="button"
                    onClick={addSet}
                    className="flex-1 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors"
                  >
                    + Agregar Set
                  </button>
                )}
                {sets.length > 1 && (
                  <button
                    type="button"
                    onClick={removeLastSet}
                    className="flex-1 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 bg-white/[0.03] hover:bg-red-500/[0.08] border border-white/[0.06] transition-colors"
                  >
                    − Quitar Set
                  </button>
                )}
              </div>

              {scoreWinnerId && (
                <div className="bg-[#ace600]/10 border border-[#ace600]/20 rounded-lg px-3 py-2 text-center">
                  <span className="text-[#ace600] text-xs font-semibold">
                    Ganador: {scoreWinnerId === player1.id ? player1.name : player2.name}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Special outcome */}
          {specialMode && (
            <div className="space-y-4">
              {/* Outcome type */}
              <div className="space-y-2">
                <span className="text-white/50 text-xs uppercase tracking-wider">Tipo de resultado</span>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIAL_OUTCOMES.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => setSpecialMode(o.key)}
                      className="py-2 px-3 rounded-lg text-xs font-semibold text-left transition-colors"
                      style={{
                        background: specialMode === o.key ? `${o.color}22` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${specialMode === o.key ? o.color + '55' : 'rgba(255,255,255,0.07)'}`,
                        color: specialMode === o.key ? o.color : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Who advances */}
              <div className="space-y-2">
                <span className="text-white/50 text-xs uppercase tracking-wider">Jugador que avanza</span>
                <div className="flex gap-2">
                  {[player1, player2].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSpecialWinner(p.id)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors truncate ${
                        specialWinner === p.id
                          ? 'bg-[#ace600]/20 border border-[#ace600]/40 text-[#ace600]'
                          : 'bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white/80'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional reason */}
              <div className="space-y-1.5">
                <span className="text-white/50 text-xs uppercase tracking-wider">Motivo (opcional)</span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Ej: Jugador no se presentó a la hora acordada"
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#ace600]/50 resize-none"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm text-white/50 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#ace600] hover:bg-[#c8f000] text-black transition-colors disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
