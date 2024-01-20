import type { Block } from './blocks';
import type { ReactionTally } from './reactions';
import type { DocumentMeta } from './utils';

export type CommentContext = 'feedback' | 'proposals' | 'polls';

// https://fireship.io/courses/firestore-data-modeling/models-tree/
export interface CommentProps extends ReactionTally {
  organization_id: string;
  group_id: string;
  context: CommentContext;
  /**
   * This should be the ID of the contextual document linked to this comment. In the case of
   * a context without a document, like "feedback", use null;
   */
  context_id: string | null;
  parent: string | null;
  depth: number;
  user_id: string | null; // allow anonymous comments
  user_handle: string | null; // allow anonymous comments
  // body: string;
  blocks: Block[];

  seen: number;
}

export type Comment = CommentProps & DocumentMeta;
