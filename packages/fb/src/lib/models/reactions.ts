import type { CommentContext } from './comments';
import type { DocumentMeta } from './utils';

export type ReactionType =
  | 'joy'
  | 'sadness'
  | 'disappointment'
  | 'anger'
  | 'frustration'
  | 'cool'
  | 'neutral'
  | 'confusion'
  | 'fear'
  | 'disgust'
  | 'love'
  | 'laughter'
  | 'gratitude'
  | 'sarcasm';

export type ReinforcementType = 'endorse' | 'promote' | 'demote' | 'shun';
export const REINFORCEMENT_TYPES: ReinforcementType[] = ['shun', 'demote', 'promote', 'endorse'];
export const REINFORCEMENTS: Record<ReinforcementType, string> = Object.freeze({
  endorse: 'stars',
  promote: 'thumb_up',
  demote: 'thumb_down',
  shun: 'crisis_alert'
});

export const REACTIONS: Record<ReactionType, string> = Object.freeze({
  love: '😍',
  joy: '😄',
  laughter: '😂',
  gratitude: '🤗',
  sarcasm: '😉',
  cool: '😎',
  neutral: '😐',
  confusion: '😕',
  disappointment: '😞',
  sadness: '😢',
  fear: '😨',
  frustration: '😖',
  anger: '😡',
  disgust: '🤢'
});

export function createEmptyReactions() {
  const keys = Object.keys(REACTIONS);
  const out: Record<string, number> = {};
  for (const key of keys) {
    out[key] = 0;
  }
  return out as Record<ReactionType, number>;
}

export function createEmptyReinforcements() {
  const out: Record<string, number> = {};
  for (const key of REINFORCEMENT_TYPES) {
    out[key] = 0;
  }
  return out as Record<ReinforcementType, number>;
}

export type ReactionCounts = {
  [key in ReactionType]: number;
};

export type ReinforcementCounts = {
  [key in ReinforcementType]: number;
};

export interface ReactionProps {
  context: CommentContext;
  context_id: string;
  reaction: ReactionType | null;
  reinforcement: ReinforcementType | null;
}

export type Reaction = ReactionProps & DocumentMeta;

export type ReactionTallyProps = { seen: number; replies: number } & ReactionCounts &
  ReinforcementCounts;
export type ReactionTally = ReactionTallyProps & DocumentMeta;
