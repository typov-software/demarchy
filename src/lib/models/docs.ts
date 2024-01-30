import type { Block } from './blocks';
import type { DocumentMeta } from './utils';

export interface DocProps {
  contributor_ids: string[];
  user_id: string;
  profile_handle: string;
  group_id: string;

  created_at: Date;
  updated_at: Date;

  name: string;
  blocks: Block[];
}

export type Doc = DocProps & DocumentMeta;
