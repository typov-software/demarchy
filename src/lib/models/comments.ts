import type { ReactionType, ReenforcementType } from './reactions';
import type { WithId } from './utils';

export type CommentContext = 'feedback' | 'proposals' | 'polls';

type ReactionCounts = {
  [key in ReactionType]: number;
};

type ReenforcementCounts = {
  [key in ReenforcementType]: number;
};

// https://fireship.io/courses/firestore-data-modeling/models-tree/
export interface CommentProps extends ReactionCounts, ReenforcementCounts {
  organization_id: string;
  group_id: string;
  context: CommentContext;
  /**
   * This should be the ID of the contextual document linked to this comment. In the case of
   * a context without a document, like "feedback", use the comment id here.
   */
  context_id: string;
  parent: string | null;
  depth: number;
  user_id: string | null; // allow anonymous comments
  user_handle: string | null; // allow anonymous comments
  created_at: Date;
  body: string;

  seen: number;
  // reaction_counts: Record<ReactionType, number>;
  // reenforcement_counts: Record<ReenforcementType, number>;
}

export type Comment = CommentProps &
  WithId & {
    path: string;
  };
