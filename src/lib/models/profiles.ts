import type { WithId } from './utils';

export interface ProfileProps {
	name: string;
	photo_url?: string;
}

export type Profile = ProfileProps & WithId;
