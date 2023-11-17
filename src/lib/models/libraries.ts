import type { WithId } from './utils';

export interface LibraryProps {
	community_id: string;
	group_id?: string;
	docs: {
		// [filepath]: doc_id
		[key: string]: string;
	};
	assets: {
		[key: string]: string;
	};
}

export type Library = LibraryProps & WithId;
