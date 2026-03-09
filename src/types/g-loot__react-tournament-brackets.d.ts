declare module '@g-loot/react-tournament-brackets' {
  import { ReactElement } from 'react';

  export interface ParticipantType {
    id: string | number;
    name?: string;
    isWinner?: boolean;
    resultText?: string | null;
    status?: string | null;
    [key: string]: any;
  }

  export interface MatchType {
    id: string | number;
    name?: string;
    nextMatchId: string | number | null;
    nextLooserMatchId?: string | number;
    tournamentRoundText?: string;
    startTime: string;
    state: string;
    participants: ParticipantType[];
    [key: string]: any;
  }

  export interface MatchComponentProps {
    match: MatchType;
    onMatchClick: (args: { match: MatchType; topWon: boolean; bottomWon: boolean; event: any }) => void;
    onPartyClick: (party: ParticipantType, partyWon: boolean) => void;
    onMouseEnter: (partyId: string | number) => void;
    onMouseLeave: () => void;
    topParty: ParticipantType;
    bottomParty: ParticipantType;
    topWon: boolean;
    bottomWon: boolean;
    topHovered: boolean;
    bottomHovered: boolean;
    topText: string;
    bottomText: string;
    connectorColor?: string;
    computedStyles?: { width: number; boxHeight: number; [key: string]: any };
    teamNameFallback: string;
    resultFallback: (participant: ParticipantType) => string;
  }

  export interface ThemeType {
    fontFamily?: string;
    transitionTimingFunction?: string;
    disabledColor?: string;
    roundHeaders?: { background?: string };
    matchBackground?: { wonColor?: string; lostColor?: string };
    border?: { color?: string; highlightedColor?: string };
    textColor?: { highlighted?: string; main?: string; dark?: string; disabled?: string };
    score?: {
      text?: { highlightedWonColor?: string; highlightedLostColor?: string };
      background?: { wonColor?: string; lostColor?: string };
    };
    canvasBackground?: string;
    connectorColor?: string;
    connectorColorHighlight?: string;
    svgBackground?: string;
    roundHeader?: { backgroundColor?: string; fontColor?: string };
    [key: string]: any;
  }

  export interface StyleOptions {
    width?: number;
    boxHeight?: number;
    canvasPadding?: number;
    spaceBetweenColumns?: number;
    spaceBetweenRows?: number;
    connectorColor?: string;
    connectorColorHighlight?: string;
    roundSeparatorWidth?: number;
    horizontalOffset?: number;
    wonBywalkOverText?: string;
    lostByNoShowText?: string;
    roundHeader?: {
      isShown?: boolean;
      height?: number;
      marginBottom?: number;
      fontSize?: number;
      fontColor?: string;
      backgroundColor?: string;
      fontFamily?: string;
      roundTextGenerator?: (currentRound: number, totalRounds: number) => string | undefined;
    };
    lineInfo?: { separation?: number; homeVisitorSpread?: number };
  }

  export interface SvgWrapperProps {
    bracketWidth: number;
    bracketHeight: number;
    startAt?: number[];
    children: ReactElement;
  }

  export interface SingleEliminationProps {
    matches: MatchType[];
    matchComponent: (props: MatchComponentProps) => JSX.Element;
    currentRound?: string;
    onMatchClick?: (args: { match: MatchType; topWon: boolean; bottomWon: boolean }) => void;
    onPartyClick?: (party: ParticipantType, partyWon: boolean) => void;
    svgWrapper?: (props: SvgWrapperProps & { children: ReactElement }) => ReactElement;
    theme?: ThemeType;
    options?: { style: StyleOptions };
  }

  export interface DoubleEliminationProps extends Omit<SingleEliminationProps, 'matches'> {
    matches: { upper: MatchType[]; lower: MatchType[] };
  }

  export function SingleEliminationBracket(props: SingleEliminationProps): JSX.Element;
  export function DoubleEliminationBracket(props: DoubleEliminationProps): JSX.Element;
  export function Match(props: MatchComponentProps): JSX.Element;
  export function SVGViewer(props: {
    height: number;
    width: number;
    bracketWidth: number;
    bracketHeight: number;
    children: ReactElement;
    startAt?: number[];
    scaleFactor?: number;
    [key: string]: any;
  }): JSX.Element;
  export function createTheme<T>(customTheme?: Partial<ThemeType> | T): ThemeType;

  export const MATCH_STATES: {
    PLAYED: 'PLAYED';
    NO_SHOW: 'NO_SHOW';
    WALK_OVER: 'WALK_OVER';
    NO_PARTY: 'NO_PARTY';
    DONE: 'DONE';
    SCORE_DONE: 'SCORE_DONE';
  };
}
