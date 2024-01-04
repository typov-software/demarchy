import type { Block } from './blocks';
import type { WithRef } from './utils';

export interface DocProps {
  user_id: string;
  user_handle: string;
  group_id: string;

  created_at: Date;
  updated_at: Date;

  name: string;
  blocks: Block[];
}

export type Doc = DocProps & WithRef;
