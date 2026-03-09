/**
 * TournamentBracket
 *
 * Renders the full tournament in a single horizontally-scrollable tree:
 *
 *   [GROUP STAGE]          [→]        [ELIMINATION BRACKET]
 *   Grupo 1 | Grupo 2 | …  ──────►   Semis | Final
 *   [match cards]                     [bracket SVG via @g-loot]
 *
 * Everything lives in ONE scrollable container so the visual flow reads
 * left-to-right, just like a real bracket wall.
 */

import React, { useMemo } from 'react';
import { SingleEliminationBracket, createTheme } from '@g-loot/react-tournament-brackets';

// ─── Theme ────────────────────────────────────────────────────────────────────
const darkTheme = createTheme({
  textColor: { main: '#6b7280', highlighted: '#f9fafb', dark: '#374151' },
  matchBackground: { wonColor: '#071c10', lostColor: '#0d1117' },
  score: {
    background: { wonColor: '#071c10', lostColor: '#161c25' },
    text: { highlightedWonColor: '#4ade80', highlightedLostColor: '#6b7280' },
  },
  border: { color: '#1f2937', highlightedColor: '#22c55e33' },
  roundHeader: { backgroundColor: '#161c25', fontColor: '#6b7280' },
  connectorColor: '#1f2937',
  connectorColorHighlight: '#22c55e30',
  svgBackground: '#0d1117',
});

// ─── Style constants ──────────────────────────────────────────────────────────
const FONT = 'system-ui,-apple-system,sans-serif';
const BORDER = '#1f2937';
const SURFACE = '#111827';
const BG = '#0d1117';
const GREEN = '#22c55e';
const GREEN_TEXT = '#4ade80';
const MUTED = '#6b7280';
const TEXT = '#d1d5db';
const COL_W = 210; // group-stage column width

// ─── Zone header bar ──────────────────────────────────────────────────────────
function ZoneHeader({
  label,
  accent,
  width,
}: {
  label: string;
  accent: string;
  width?: number | string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
        width: width ?? '100%',
      }}
    >
      <div
        style={{ width: 3, height: 14, borderRadius: 2, background: accent, flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: MUTED,
          fontFamily: FONT,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}

// ─── Group-stage match card ───────────────────────────────────────────────────
function GroupMatchCard({ match }: { match: any }) {
  const p1 = match.player1 ?? { id: match.player1_id, name: match.player1_name ?? 'TBD' };
  const p2 = match.player2 ?? { id: match.player2_id, name: match.player2_name ?? 'TBD' };

  const winnerId = match.winner_id;
  const p1Won = !!(winnerId && winnerId === p1.id);
  const p2Won = !!(winnerId && winnerId === p2.id);
  const isCompleted = match.status === 'completed';

  const scores: any[] = Array.isArray(match.setScores)
    ? match.setScores
    : Array.isArray(match.set_scores)
      ? match.set_scores
      : [];

  const setsP1 = scores.filter((s) => (s.player1 ?? s.p1 ?? 0) > (s.player2 ?? s.p2 ?? 0)).length;
  const setsP2 = scores.filter((s) => (s.player2 ?? s.p2 ?? 0) > (s.player1 ?? s.p1 ?? 0)).length;
  const hasSets = setsP1 > 0 || setsP2 > 0;

  const row = (won: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30,
    padding: '0 8px',
    background: won ? 'rgba(5,46,22,0.7)' : 'transparent',
    borderLeft: `2px solid ${won ? GREEN : 'transparent'}`,
    boxSizing: 'border-box',
  });

  const name = (won: boolean): React.CSSProperties => ({
    fontSize: 11,
    color: won ? GREEN_TEXT : TEXT,
    fontWeight: won ? 700 : 400,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    fontFamily: FONT,
  });

  const score = (won: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 700,
    color: won ? GREEN_TEXT : MUTED,
    marginLeft: 6,
    minWidth: 14,
    textAlign: 'center',
    flexShrink: 0,
  });

  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 7,
        boxSizing: 'border-box',
      }}
    >
      <div style={row(p1Won)}>
        <span style={name(p1Won)}>{p1.name || 'TBD'}</span>
        {isCompleted && (
          <span style={score(p1Won)}>{hasSets ? setsP1 : p1Won ? 'W' : 'L'}</span>
        )}
      </div>
      <div style={{ height: 1, background: BORDER }} />
      <div style={row(p2Won)}>
        <span style={name(p2Won)}>{p2.name || 'TBD'}</span>
        {isCompleted && (
          <span style={score(p2Won)}>{hasSets ? setsP2 : p2Won ? 'W' : 'L'}</span>
        )}
      </div>
      <div
        style={{
          height: 13,
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          borderTop: `1px solid ${BORDER}`,
          background: BG,
        }}
      >
        <span
          style={{
            fontSize: 8,
            color: isCompleted ? GREEN : '#374151',
            letterSpacing: '0.04em',
            fontFamily: FONT,
          }}
        >
          {isCompleted ? '✓ Completado' : 'Pendiente'}
        </span>
      </div>
    </div>
  );
}

// ─── Group column ─────────────────────────────────────────────────────────────
function GroupColumn({
  groupNum,
  matches,
}: {
  groupNum: number;
  matches: any[];
}) {
  const completed = matches.filter((m) => m.status === 'completed').length;
  const total = matches.length;
  const allDone = completed === total && total > 0;

  return (
    <div style={{ width: COL_W, flexShrink: 0 }}>
      {/* Column header */}
      <div
        style={{
          background: '#161c25',
          border: `1px solid ${BORDER}`,
          borderRadius: 4,
          padding: '5px 10px',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: FONT,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.04em' }}>
          Grupo {groupNum}
        </span>
        <span style={{ fontSize: 9, color: allDone ? GREEN : MUTED, fontWeight: 600 }}>
          {completed}/{total}
        </span>
      </div>

      {matches.map((m) => (
        <GroupMatchCard key={m.id} match={m} />
      ))}
    </div>
  );
}

// ─── Transition arrow (between phases) ───────────────────────────────────────
function TransitionArrow() {
  return (
    <div
      style={{
        width: 56,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingTop: 34, // align with match cards (below column header)
        alignSelf: 'stretch',
      }}
    >
      {/* Dashed vertical line top */}
      <div
        style={{
          flex: 1,
          width: 1,
          background: `repeating-linear-gradient(to bottom, ${BORDER} 0, ${BORDER} 4px, transparent 4px, transparent 8px)`,
          minHeight: 24,
        }}
      />
      {/* Arrow SVG */}
      <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
        <path
          d="M2 10 H26 M18 3 L26 10 L18 17"
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          fontSize: 7,
          fontWeight: 700,
          color: '#374151',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: FONT,
          writingMode: 'horizontal-tb',
        }}
      >
        Clasificados
      </span>
      {/* Dashed vertical line bottom */}
      <div
        style={{
          flex: 1,
          width: 1,
          background: `repeating-linear-gradient(to bottom, ${BORDER} 0, ${BORDER} 4px, transparent 4px, transparent 8px)`,
          minHeight: 24,
        }}
      />
    </div>
  );
}

// ─── Bracket helpers ──────────────────────────────────────────────────────────
const getRoundLabel = (round: number, totalRounds: number): string => {
  const diff = totalRounds - round;
  if (diff === 0) return 'Final';
  if (diff === 1) return 'Semifinal';
  if (diff === 2) return 'Cuartos de Final';
  if (diff === 3) return 'Octavos de Final';
  return `Ronda ${round}`;
};

const toLibraryMatches = (rawMatches: any[], totalRoundsFromBackend: number): any[] => {
  if (!rawMatches.length) return [];

  const matchMap: Record<string, any> = {};
  rawMatches.forEach((m) => { matchMap[`${m.round}_${m.position}`] = m; });

  const round1Count = rawMatches.filter((m) => m.round === 1).length;
  const totalRounds =
    round1Count <= 1
      ? Math.max(totalRoundsFromBackend, 1)
      : Math.ceil(Math.log2(round1Count)) + 1;

  const idMap: Record<string, string> = {};
  for (let r = 1; r <= totalRounds; r++) {
    const count = Math.ceil(round1Count / Math.pow(2, r - 1));
    for (let p = 1; p <= count; p++) {
      const key = `${r}_${p}`;
      idMap[key] = matchMap[key]?.id ?? `placeholder_${r}_${p}`;
    }
  }

  const result: any[] = [];

  for (let r = 1; r <= totalRounds; r++) {
    const count = Math.ceil(round1Count / Math.pow(2, r - 1));
    for (let p = 1; p <= count; p++) {
      const key = `${r}_${p}`;
      const m = matchMap[key];
      const id = idMap[key];
      const nextMatchId = r < totalRounds ? (idMap[`${r + 1}_${Math.ceil(p / 2)}`] ?? null) : null;

      if (m) {
        const state =
          m.status === 'completed' ? 'SCORE_DONE' : m.status === 'walkover' ? 'WALK_OVER' : 'SCHEDULED';

        const scores: any[] = Array.isArray(m.set_scores) ? m.set_scores : [];
        const setsP1 = scores.filter((s: any) => s.player1 > s.player2).length;
        const setsP2 = scores.filter((s: any) => s.player2 > s.player1).length;
        const hasSets = setsP1 > 0 || setsP2 > 0;
        const p1Won = !!(m.winner_id && m.winner_id === m.player1_id);
        const p2Won = !!(m.winner_id && m.winner_id === m.player2_id);

        const rt = (won: boolean, sets: number) =>
          !m.winner_id ? null : hasSets ? String(sets) : won ? 'W' : 'L';

        result.push({
          id,
          name: `M${p}`,
          nextMatchId,
          tournamentRoundText: getRoundLabel(r, totalRounds),
          startTime: '',
          state,
          participants: [
            {
              id: m.player1_id ?? `tbd_${id}_1`,
              name: m.player1_id ? m.player1_name : 'TBD',
              isWinner: p1Won,
              resultText: rt(p1Won, setsP1),
              status: m.winner_id ? 'PLAYED' : null,
            },
            {
              id: m.player2_id ?? `tbd_${id}_2`,
              name: m.player2_id ? m.player2_name : 'TBD',
              isWinner: p2Won,
              resultText: rt(p2Won, setsP2),
              status: m.winner_id ? 'PLAYED' : null,
            },
          ],
        });
      } else {
        result.push({
          id,
          name: `M${p}`,
          nextMatchId,
          tournamentRoundText: getRoundLabel(r, totalRounds),
          startTime: '',
          state: 'SCHEDULED',
          participants: [
            { id: `tbd_${id}_1`, name: 'TBD', isWinner: false, resultText: null, status: null },
            { id: `tbd_${id}_2`, name: 'TBD', isWinner: false, resultText: null, status: null },
          ],
        });
      }
    }
  }

  return result;
};

// ─── Custom elimination match card ────────────────────────────────────────────
function buildMatchCard(
  onMatchClick: (matchId: string, player1: { id: string; name: string }, player2: { id: string; name: string }) => void,
) {
  return function MatchCard({
    match,
    topParty,
    bottomParty,
    topWon,
    bottomWon,
    topHovered,
    bottomHovered,
    onMouseEnter,
    onMouseLeave,
    computedStyles,
  }: any) {
    const w: number = computedStyles?.width ?? 220;
    const h: number = computedStyles?.boxHeight ?? 90;
    const isPending = match.state === 'SCHEDULED';
    const isReal = (p: any) => p?.id && !String(p.id).startsWith('tbd_');
    const rowH = Math.floor((h - 15) / 2);
    const bothReal = isReal(topParty) && isReal(bottomParty);

    const rowStyle = (party: any, won: boolean, hovered: boolean): React.CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: rowH,
      padding: '0 8px',
      background: won
        ? 'rgba(5,46,22,0.7)'
        : hovered && isPending && bothReal
          ? 'rgba(31,41,55,0.9)'
          : 'transparent',
      borderLeft: won
        ? `2px solid ${GREEN}`
        : hovered && isPending && bothReal
          ? '2px solid #374151'
          : '2px solid transparent',
      cursor: isPending && bothReal ? 'pointer' : 'default',
      transition: 'background 0.12s, border-color 0.12s',
      boxSizing: 'border-box',
    });

    const handleClick = () => {
      if (!isPending || !bothReal) return;
      onMatchClick(
        match.id,
        { id: topParty.id, name: topParty.name || 'TBD' },
        { id: bottomParty.id, name: bottomParty.name || 'TBD' },
      );
    };

    return (
      <div
        style={{
          width: w,
          height: h,
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 4,
          overflow: 'hidden',
          fontFamily: FONT,
          boxSizing: 'border-box',
        }}
      >
        {/* Player 1 */}
        <div
          style={rowStyle(topParty, topWon, topHovered)}
          onMouseEnter={() => onMouseEnter?.(topParty?.id)}
          onMouseLeave={onMouseLeave}
          onClick={handleClick}
        >
          <span
            style={{
              fontSize: 11,
              color: topWon ? GREEN_TEXT : TEXT,
              fontWeight: topWon ? 700 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {topParty?.name || 'TBD'}
          </span>
          {topParty?.resultText != null && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: topWon ? GREEN_TEXT : MUTED,
                marginLeft: 6,
                minWidth: 14,
                textAlign: 'center',
              }}
            >
              {topParty.resultText}
            </span>
          )}
        </div>

        <div style={{ height: 1, background: BORDER }} />

        {/* Player 2 */}
        <div
          style={rowStyle(bottomParty, bottomWon, bottomHovered)}
          onMouseEnter={() => onMouseEnter?.(bottomParty?.id)}
          onMouseLeave={onMouseLeave}
          onClick={handleClick}
        >
          <span
            style={{
              fontSize: 11,
              color: bottomWon ? GREEN_TEXT : TEXT,
              fontWeight: bottomWon ? 700 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {bottomParty?.name || 'TBD'}
          </span>
          {bottomParty?.resultText != null && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: bottomWon ? GREEN_TEXT : MUTED,
                marginLeft: 6,
                minWidth: 14,
                textAlign: 'center',
              }}
            >
              {bottomParty.resultText}
            </span>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            height: 14,
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            borderTop: `1px solid ${BORDER}`,
            background: BG,
          }}
        >
          {isPending && bothReal && (
            <span style={{ fontSize: 8, color: '#374151', letterSpacing: '0.04em' }}>
              Clic para registrar resultado
            </span>
          )}
          {(match.state === 'SCORE_DONE' || match.state === 'WALK_OVER') && (
            <span style={{ fontSize: 8, color: GREEN, letterSpacing: '0.04em' }}>
              ✓ Completado
            </span>
          )}
        </div>
      </div>
    );
  };
}

// ─── Main component ────────────────────────────────────────────────────────────
interface TournamentBracketProps {
  bracketData: {
    matches: any[];
    total_rounds: number;
    tournament_name?: string;
    event_type?: string;
  } | null;
  onMatchClick: (matchId: string, player1: { id: string; name: string }, player2: { id: string; name: string }) => void;
  groupMatches?: any[];
  groups?: any[];
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  bracketData,
  onMatchClick,
  groupMatches = [],
  groups = [],
}) => {
  const rawMatches: any[] = bracketData?.matches ?? [];
  const totalRounds: number = bracketData?.total_rounds ?? 0;

  const bracketMatches = useMemo(
    () => toLibraryMatches(rawMatches, totalRounds),
    [rawMatches, totalRounds],
  );

  const MatchCard = useMemo(() => buildMatchCard(onMatchClick), [onMatchClick]);

  // Build group number map and bucket matches
  const { groupOrder, matchesByGroup, groupNumMap } = useMemo(() => {
    const groupNumMap: Record<string, number> = {};
    groups.forEach((g, i) => {
      groupNumMap[g.id] = g.group_number ?? g.groupNumber ?? i + 1;
    });

    const groupOrder: string[] = [];
    const matchesByGroup: Record<string, any[]> = {};
    groupMatches.forEach((m) => {
      const key = m.group_id ?? 'unknown';
      if (!matchesByGroup[key]) {
        matchesByGroup[key] = [];
        groupOrder.push(key);
      }
      matchesByGroup[key].push(m);
    });

    return { groupOrder, matchesByGroup, groupNumMap };
  }, [groups, groupMatches]);

  const hasGroupStage = groupOrder.length > 0;
  const hasBracket = bracketMatches.length > 0;

  if (!hasGroupStage && !hasBracket) return null;

  return (
    // Single scrollable canvas — the entire tournament lives here
    <div
      style={{
        overflowX: 'auto',
        overflowY: 'visible',
        WebkitOverflowScrolling: 'touch' as any,
        // Outer background so the canvas feels solid
        background: BG,
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        padding: '20px 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          width: 'max-content',
          gap: 0,
        }}
      >
        {/* ── GROUP STAGE ──────────────────────────────────────────────────── */}
        {hasGroupStage && (
          <div style={{ flexShrink: 0 }}>
            <ZoneHeader label="Fase de Grupos" accent="#3b82f6" />

            {/* Group columns side-by-side */}
            <div style={{ display: 'flex', gap: 16 }}>
              {groupOrder.map((groupId) => (
                <GroupColumn
                  key={groupId}
                  groupNum={groupNumMap[groupId] ?? groupOrder.indexOf(groupId) + 1}
                  matches={matchesByGroup[groupId]}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── TRANSITION ARROW ─────────────────────────────────────────────── */}
        {hasGroupStage && hasBracket && <TransitionArrow />}

        {/* ── ELIMINATION BRACKET ──────────────────────────────────────────── */}
        {hasBracket && (
          <div style={{ flexShrink: 0 }}>
            <ZoneHeader label="Eliminación Directa" accent="#ace600" />

            {/* SingleEliminationBracket — inline SVG, no extra scroll wrapper */}
            <SingleEliminationBracket
              matches={bracketMatches}
              matchComponent={MatchCard}
              theme={darkTheme}
              svgWrapper={({ children, bracketWidth, bracketHeight }: any) => (
                <div style={{ width: bracketWidth, height: bracketHeight }}>
                  {children}
                </div>
              )}
              options={{
                style: {
                  width: 220,
                  boxHeight: 90,
                  canvasPadding: 20,
                  spaceBetweenColumns: 56,
                  spaceBetweenRows: 20,
                  connectorColor: BORDER,
                  connectorColorHighlight: '#22c55e40',
                  roundHeader: {
                    isShown: true,
                    height: 26,
                    marginBottom: 12,
                    fontSize: 11,
                    fontColor: MUTED,
                    backgroundColor: '#161c25',
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentBracket;
