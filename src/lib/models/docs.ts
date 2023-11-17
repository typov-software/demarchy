import type { Block } from './blocks';
import type { WithId } from './utils';

export interface DocProps {
	name: string;
	blocks: Block[];
}

export type Doc = DocProps & WithId;
