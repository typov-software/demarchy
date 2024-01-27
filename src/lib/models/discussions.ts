import type { Block } from './blocks';
import type { DocumentMeta } from './utils';

export interface DiscussionProps {
  organization_id: string;
  group_id: string;

  user_id: string;
  user_handle: string;

  blocks: Block[];
  state: 'draft' | 'open' | 'dropped' | 'archived';
}

export type Discussion = DiscussionProps & DocumentMeta;
