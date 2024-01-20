import type { CommentContext } from './comments';
import type { DocumentMeta } from './utils';

export type ReactionType =
  | 'joy'
  | 'sadness'
  | 'disappointment'
  | 'anger'
  | 'frustration'
  | 'neutral'
  | 'confusion'
  | 'fear'
  | 'disgust'
  | 'love'
  | 'laughter'
  | 'gratitude'
  | 'sarcasm';

export type ReenforcementType = 'endorse' | 'promote' | 'demote' | 'shun';
export const REENFORCEMENT_TYPES: ReenforcementType[] = ['endorse', 'promote', 'demote', 'shun'];
export const REENFORCEMENTS: Record<ReenforcementType, string> = Object.freeze({
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

export function createEmptyReenforcements() {
  const out: Record<string, number> = {};
  for (const key of REENFORCEMENT_TYPES) {
    out[key] = 0;
  }
  return out as Record<ReenforcementType, number>;
}

export type ReactionCounts = {
  [key in ReactionType]: number;
};

export type ReenforcementCounts = {
  [key in ReenforcementType]: number;
};

export interface ReactionProps {
  context: CommentContext;
  context_id: string;
  reaction: ReactionType | null;
  reenforcement: ReenforcementType | null;
}

export type Reaction = ReactionProps & DocumentMeta;

export type ReactionTally = ReactionCounts & ReenforcementCounts;
