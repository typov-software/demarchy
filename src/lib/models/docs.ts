import type { Block } from './blocks';
import type { WithId } from './utils';

export interface DocProps {
  group_id: string;
  library_id: string;

  draft: boolean;

  name: string;
  blocks: Block[];
}

export type Doc = DocProps & WithId;
