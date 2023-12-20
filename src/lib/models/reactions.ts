import type { CommentContext } from './comments';
import type { WithId } from './utils';

export type ReactionType =
  | 'joy'
  | 'sadness'
  | 'disappointment'
  | 'anger'
  | 'frustration'
  | 'confusion'
  | 'fear'
  | 'disgust'
  | 'love'
  | 'laughter'
  | 'gratitude'
  | 'sarcasm';

export type ReenforcementType = 'endorse' | 'promote' | 'demote' | 'shun';
export const REENFORCEMENT_TYPES: ReenforcementType[] = ['endorse', 'promote', 'demote', 'shun'];

export const REACTIONS: Record<ReactionType, string> = Object.freeze({
  joy: '😄',
  sadness: '😢',
  disappointment: '😞',
  anger: '😡',
  frustration: '😖',
  confusion: '😕',
  fear: '😨',
  disgust: '🤢',
  love: '😍',
  laughter: '😂',
  gratitude: '🤗',
  sarcasm: '😉'
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

export interface ReactionProps {
  context: CommentContext;
  context_id: string;
  created_at: Date;
  reaction: ReactionType | null;
  reenforcement: ReenforcementType | null;
}

export type Reaction = ReactionProps & WithId;
