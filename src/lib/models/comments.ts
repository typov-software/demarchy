import type { WithId } from './utils';

export type CommentContext = 'proposal' | 'poll';

export interface CommentProps {
	context: CommentContext;
	context_id: string;
	parent: string | null;
	depth: number;
}

export type Comment = CommentProps & WithId;

// https://fireship.io/courses/firestore-data-modeling/models-tree/
