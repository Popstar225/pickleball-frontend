/**
 * Match Management Component
 */

import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Swords, AlertTriangle, CheckCircle2, Clock, Trophy, Flag,
  Pencil, ListPlus, ChevronRight, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MatchRecord {
  id: string;
  player1: { id: string; name: string };
  player2: { id: string; name: string };
  status: 'pending' | 'played' | 'walkover' | 'withdrawal' | 'cancelled' | 'disqualified';
  winner?: { id: string; name: string };
  set1?: { p1: number; p2: number };
  set2?: { p1: number; p2: number };
  set3?: { p1: number; p2: number };
  notes?: string;
}
interface Props {
  groupId?: string; eventId: string;
  matches: MatchRecord[];
  onMatchUpdate: (matchId: string, data: Partial<MatchRecord>) => Promise<void>;
  hideHeader?: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, {
  label: string; icon: React.ElementType;
  cls: string; dot: string; desc?: string;
}> = {
  pending:      { label: 'Pendiente',      icon: Clock,         cls: 'bg-white/[0.04] text-white/35 border-white/[0.08]',        dot: 'bg-white/20' },
  played:       { label: 'Jugado',         icon: CheckCircle2,  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  walkover:     { label: 'Walkover',       icon: Trophy,        cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       dot: 'bg-amber-400 animate-pulse',
    desc: 'El jugador no se presentó al partido. El oponente avanza automáticamente.' },
  withdrawal:   { label: 'Retirada',       icon: Flag,          cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20',    dot: 'bg-orange-400',
    desc: 'El jugador se retiró del partido. El oponente avanza automáticamente.' },
  disqualified: { label: 'Descalificado',  icon: AlertTriangle, cls: 'bg-red-500/10 text-red-400 border-red-500/20',            dot: 'bg-red-400',
    desc: 'El jugador fue descalificado. El oponente avanza automáticamente.' },
  cancelled:    { label: 'Cancelado',      icon: X,             cls: 'bg-white/[0.04] text-white/30 border-white/[0.08]',        dot: 'bg-white/20',
    desc: 'El partido ha sido cancelado y no se jugará.' },
};

const SPECIAL_STATES = ['walkover', 'withdrawal', 'disqualified', 'cancelled'] as const;

// ─── Atoms ────────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.pending;
  const Icon = c.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0', c.cls)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  );
}

function ScoreSet({ label, p1, p2, p1Name, p2Name }: {
  label: string; p1: number; p2: number; p1Name: string; p2Name: string;
}) {
  const p1Wins = p1 > p2;
  const p2Wins = p2 > p1;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 w-8 shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-1">
        <span className={cn('text-sm font-black tabular-nums', p1Wins ? 'text-[#ace600]' : 'text-white/35')}>{p1}</span>
        <span className="text-white/15 text-xs">–</span>
        <span className={cn('text-sm font-black tabular-nums', p2Wins ? 'text-[#ace600]' : 'text-white/35')}>{p2}</span>
      </div>
    </div>
  );
}

function SetInput({ label, valP1, valP2, onP1, onP2, p1Name, p2Name }: {
  label: string; valP1: number; valP2: number;
  onP1: (v: number) => void; onP2: (v: number) => void;
  p1Name: string; p2Name: string;
}) {
  const inputCls = cn(
    'w-16 h-10 text-center text-sm font-bold rounded-xl',
    'bg-white/[0.04] border-white/[0.09] text-white',
    'focus-visible:ring-0 focus-visible:border-[#ace600]/50 focus-visible:bg-[#ace600]/[0.03]',
    'transition-all',
  );
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
      <span className="text-[10px] font-black uppercase tracking-widest text-white/20 w-8 shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 text-right">
          <p className="text-[9px] text-white/20 mb-1 truncate">{p1Name.split(' ')[0]}</p>
          <Input type="number" min={0} max={15} value={valP1}
            onChange={e => onP1(parseInt(e.target.value) || 0)}
            className={inputCls} />
        </div>
        <span className="text-white/15 font-bold text-sm shrink-0">–</span>
        <div className="flex-1">
          <p className="text-[9px] text-white/20 mb-1 truncate">{p2Name.split(' ')[0]}</p>
          <Input type="number" min={0} max={15} value={valP2}
            onChange={e => onP2(parseInt(e.target.value) || 0)}
            className={inputCls} />
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const MatchManagement: React.FC<Props> = ({ groupId, eventId, matches, onMatchUpdate, hideHeader }) => {
  const [selectedMatch, setSelectedMatch]           = useState<MatchRecord | null>(null);
  const [showResultDialog, setShowResultDialog]     = useState(false);
  const [showSpecialDialog, setShowSpecialDialog]   = useState(false);
  const [resultData, setResultData] = useState({
    set1P1: 0, set1P2: 0, set2P1: 0, set2P2: 0, set3P1: 0, set3P2: 0,
    winnerId: '', notes: '',
  });
  const [specialState, setSpecialState]   = useState<string>('');
  const [specialNotes, setSpecialNotes]   = useState('');
  const [saving, setSaving]               = useState(false);

  const openResult = (match: MatchRecord) => {
    setSelectedMatch(match);
    setResultData({
      set1P1: match.set1?.p1 ?? 0, set1P2: match.set1?.p2 ?? 0,
      set2P1: match.set2?.p1 ?? 0, set2P2: match.set2?.p2 ?? 0,
      set3P1: match.set3?.p1 ?? 0, set3P2: match.set3?.p2 ?? 0,
      winnerId: match.winner?.id ?? '', notes: match.notes ?? '',
    });
    setShowResultDialog(true);
  };

  const openSpecial = (match: MatchRecord) => {
    setSelectedMatch(match);
    setSpecialState('');
    setSpecialNotes('');
    setShowSpecialDialog(true);
  };

  const handleRecordResult = async () => {
    if (!selectedMatch) return;
    setSaving(true);
    const result: any = {
      status: 'played',
      set1: { p1: resultData.set1P1, p2: resultData.set1P2 },
      set2: { p1: resultData.set2P1, p2: resultData.set2P2 },
      notes: resultData.notes,
    };
    if (resultData.set3P1 > 0 || resultData.set3P2 > 0)
      result.set3 = { p1: resultData.set3P1, p2: resultData.set3P2 };

    if (resultData.winnerId) {
      result.winner = selectedMatch.player1.id === resultData.winnerId
        ? selectedMatch.player1 : selectedMatch.player2;
    } else {
      const p1Sets =
        (result.set1.p1 > result.set1.p2 ? 1 : 0) +
        (result.set2.p1 > result.set2.p2 ? 1 : 0) +
        (result.set3 && result.set3.p1 > result.set3.p2 ? 1 : 0);
      result.winner = p1Sets >= 2 ? selectedMatch.player1 : selectedMatch.player2;
    }
    try {
      await onMatchUpdate(selectedMatch.id, result);
      setShowResultDialog(false);
      setSelectedMatch(null);
    } finally { setSaving(false); }
  };

  const handleSpecialState = async () => {
    if (!selectedMatch || !specialState) return;
    setSaving(true);
    const update: any = { status: specialState, notes: specialNotes };
    if (specialState === 'walkover' || specialState === 'disqualified')
      update.winner = selectedMatch.player1;
    try {
      await onMatchUpdate(selectedMatch.id, update);
      setShowSpecialDialog(false);
      setSelectedMatch(null);
      setSpecialState('');
      setSpecialNotes('');
    } finally { setSaving(false); }
  };

  const played    = matches.filter(m => m.status !== 'pending').length;
  const pending   = matches.filter(m => m.status === 'pending').length;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Header strip ────────────────────────────────────────────────────── */}
      {!hideHeader && <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
            <Swords className="w-4 h-4 text-[#ace600]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white/80">Partidos</p>
            <p className="text-[10px] text-white/25">{matches.length} total · {pending} pendientes</p>
          </div>
        </div>
        {/* Mini progress */}
        {matches.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-[#ace600] rounded-full transition-all"
                style={{ width: `${Math.round((played / matches.length) * 100)}%` }} />
            </div>
            <span className="text-[10px] font-mono text-white/25">{played}/{matches.length}</span>
          </div>
        )}
      </div>}

      {/* ── Match list ──────────────────────────────────────────────────────── */}
      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <Swords className="w-5 h-5 text-white/10" />
          </div>
          <p className="text-sm text-white/25">Sin partidos programados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map(match => {
            const s = STATUS_CFG[match.status] ?? STATUS_CFG.pending;
            const StatusIcon = s.icon;
            const isPending = match.status === 'pending';
            const isPlayed  = match.status === 'played';

            return (
              <div key={match.id}
                className={cn(
                  'bg-[#0d1117] border rounded-2xl overflow-hidden transition-all',
                  isPending ? 'border-white/[0.07] hover:border-white/[0.12]' :
                  isPlayed  ? 'border-emerald-500/15' :
                              'border-white/[0.06]',
                )}>

                {/* Top accent bar for completed */}
                {isPlayed  && <div className="h-0.5 bg-emerald-500/40" />}

                <div className="p-4">
                  {/* Players row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      {/* VS layout */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          'text-sm font-bold truncate',
                          isPlayed && match.winner?.id === match.player1.id ? 'text-[#ace600]' : 'text-white/75',
                        )}>
                          {match.player1.name}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20 shrink-0">vs</span>
                        <span className={cn(
                          'text-sm font-bold truncate',
                          isPlayed && match.winner?.id === match.player2.id ? 'text-[#ace600]' : 'text-white/75',
                        )}>
                          {match.player2.name}
                        </span>
                      </div>

                      {/* Winner line */}
                      {isPlayed && match.winner && (
                        <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Ganador: {match.winner.name}
                        </p>
                      )}
                    </div>

                    <StatusPill status={match.status} />
                  </div>

                  {/* Score */}
                  {isPlayed && (
                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 mb-3 space-y-1.5">
                      {match.set1 && (
                        <ScoreSet label="S1" p1={match.set1.p1} p2={match.set1.p2}
                          p1Name={match.player1.name} p2Name={match.player2.name} />
                      )}
                      {match.set2 && (
                        <ScoreSet label="S2" p1={match.set2.p1} p2={match.set2.p2}
                          p1Name={match.player1.name} p2Name={match.player2.name} />
                      )}
                      {match.set3 && (
                        <ScoreSet label="S3" p1={match.set3.p1} p2={match.set3.p2}
                          p1Name={match.player1.name} p2Name={match.player2.name} />
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {match.notes && (
                    <div className="flex items-start gap-2 mb-3 p-2.5 bg-amber-500/[0.05] border border-amber-500/15 rounded-xl">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-400/80 leading-relaxed">{match.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {isPending && (
                    <div className="flex gap-2">
                      <button onClick={() => openResult(match)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_8px_rgba(172,230,0,0.12)] transition-all">
                        <ListPlus className="w-3.5 h-3.5" /> Registrar Resultado
                      </button>
                      <button onClick={() => openSpecial(match)}
                        className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-bold border border-white/[0.09] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white transition-all">
                        <Flag className="w-3.5 h-3.5" /> Estado Especial
                      </button>
                    </div>
                  )}
                  {isPlayed && (
                    <button onClick={() => openResult(match)}
                      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-[10px] font-bold border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.07] text-white/30 hover:text-white transition-all">
                      <Pencil className="w-3 h-3" /> Editar resultado
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Record Result Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="bg-[#0d1117] border-white/[0.09] rounded-2xl max-w-md p-0 overflow-hidden">
          <div className="h-0.5 bg-[#ace600]" />
          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
                  <Swords className="w-4 h-4 text-[#ace600]" />
                </div>
                <DialogTitle className="text-base font-bold text-white">Registrar Resultado</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-white/30 ml-11">
                {selectedMatch?.player1.name}
                <span className="text-white/15 mx-1.5">vs</span>
                {selectedMatch?.player2.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2.5 mb-5">
              {/* Player name header */}
              <div className="flex items-center gap-3 px-4">
                <span className="w-8 shrink-0" />
                <div className="flex-1 flex gap-2 text-[9px] font-bold uppercase tracking-widest text-white/20">
                  <span className="flex-1 text-right truncate">{selectedMatch?.player1.name.split(' ')[0]}</span>
                  <span className="w-4 text-center" />
                  <span className="flex-1 truncate">{selectedMatch?.player2.name.split(' ')[0]}</span>
                </div>
              </div>

              {[
                { label: 'S1', p1: resultData.set1P1, p2: resultData.set1P2,
                  onP1: (v: number) => setResultData(d => ({ ...d, set1P1: v })),
                  onP2: (v: number) => setResultData(d => ({ ...d, set1P2: v })) },
                { label: 'S2', p1: resultData.set2P1, p2: resultData.set2P2,
                  onP1: (v: number) => setResultData(d => ({ ...d, set2P1: v })),
                  onP2: (v: number) => setResultData(d => ({ ...d, set2P2: v })) },
                { label: 'S3', p1: resultData.set3P1, p2: resultData.set3P2,
                  onP1: (v: number) => setResultData(d => ({ ...d, set3P1: v })),
                  onP2: (v: number) => setResultData(d => ({ ...d, set3P2: v })) },
              ].map(({ label, p1, p2, onP1, onP2 }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 w-8 shrink-0">{label}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <Input type="number" min={0} max={15} value={p1}
                      onChange={e => onP1(parseInt(e.target.value) || 0)}
                      className="w-14 h-9 text-center text-sm font-bold rounded-xl bg-white/[0.04] border-white/[0.09] text-white focus-visible:ring-0 focus-visible:border-[#ace600]/50 transition-all" />
                    <span className="text-white/15 font-bold text-sm shrink-0">–</span>
                    <Input type="number" min={0} max={15} value={p2}
                      onChange={e => onP2(parseInt(e.target.value) || 0)}
                      className="w-14 h-9 text-center text-sm font-bold rounded-xl bg-white/[0.04] border-white/[0.09] text-white focus-visible:ring-0 focus-visible:border-[#ace600]/50 transition-all" />
                  </div>
                  {label === 'S3' && (
                    <span className="text-[9px] text-white/15 font-bold shrink-0">OPCIONAL</span>
                  )}
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">
                Notas <span className="text-white/15 normal-case font-normal tracking-normal">(opcional)</span>
              </label>
              <Input
                placeholder="Circunstancias especiales, lesiones…"
                value={resultData.notes}
                onChange={e => setResultData(d => ({ ...d, notes: e.target.value }))}
                className="h-10 rounded-xl text-sm bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-[#ace600]/50 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => setShowResultDialog(false)}
                className="flex-1 h-10 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white transition-all">
                Cancelar
              </button>
              <button onClick={handleRecordResult} disabled={saving}
                className="flex-1 h-10 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.18)] transition-all disabled:opacity-50">
                {saving ? 'Guardando…' : 'Guardar Resultado'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Special State Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showSpecialDialog} onOpenChange={setShowSpecialDialog}>
        <DialogContent className="bg-[#0d1117] border-white/[0.09] rounded-2xl max-w-sm p-0 overflow-hidden">
          <div className="h-0.5 bg-amber-500/60" />
          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Flag className="w-4 h-4 text-amber-400" />
                </div>
                <DialogTitle className="text-base font-bold text-white">Estado Especial</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-white/30 ml-11">
                {selectedMatch?.player1.name}
                <span className="text-white/15 mx-1.5">vs</span>
                {selectedMatch?.player2.name}
              </DialogDescription>
            </DialogHeader>

            {/* State picker */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {SPECIAL_STATES.map(s => {
                const c = STATUS_CFG[s];
                const Icon = c.icon;
                const active = specialState === s;
                return (
                  <button key={s} onClick={() => setSpecialState(active ? '' : s)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-center transition-all',
                      active ? cn(c.cls) : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.05]',
                    )}>
                    <Icon className={cn('w-4 h-4', active ? '' : 'text-white/20')} />
                    <span className={cn('text-[10px] font-bold leading-tight', active ? '' : 'text-white/30')}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Description */}
            {specialState && (
              <div className="flex items-start gap-2.5 p-3 mb-4 bg-amber-500/[0.05] border border-amber-500/15 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-400/80 leading-relaxed">
                  {STATUS_CFG[specialState]?.desc}
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">Motivo</label>
              <Input
                placeholder="Explica el motivo de este estado…"
                value={specialNotes}
                onChange={e => setSpecialNotes(e.target.value)}
                className="h-10 rounded-xl text-sm bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-[#ace600]/50 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setShowSpecialDialog(false); setSpecialState(''); setSpecialNotes(''); }}
                className="flex-1 h-10 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white transition-all">
                Cancelar
              </button>
              <button onClick={handleSpecialState} disabled={!specialState || saving}
                className="flex-1 h-10 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                {saving ? 'Confirmando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MatchManagement;