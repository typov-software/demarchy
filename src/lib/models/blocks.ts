import type { WithId } from './utils';

export type BlockType = 'text' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'asset';

export interface BlockProps {
	content: string;
	type: BlockType;

	link?: {
		href: string;
		title?: string;
	};
}

export type Block = BlockProps & WithId;
