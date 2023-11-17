import type { WithId } from './utils';

export interface GroupProps {
	name: string;
	description: string;
	// latest published library id
	library_id: string;
}

export type Group = GroupProps & WithId;
