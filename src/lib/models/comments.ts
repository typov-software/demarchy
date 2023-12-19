import type { WithId } from './utils';

export type CommentContext = 'feedback' | 'proposal' | 'poll';

// https://fireship.io/courses/firestore-data-modeling/models-tree/
export interface CommentProps {
  context: CommentContext;
  /**
   * This should be the ID of the contextual document linked to this comment. In the case of
   * a context without a document, like "feedback", use the comment id here.
   */
  context_id: string;
  parent: string | null;
  depth: number;
  user_id: string | null; // allow anonymous comments
  created_at: Date;
  body: string;
}

export type Comment = CommentProps & WithId;
