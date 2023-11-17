import type { GroupProps } from './groups';
import type { WithId } from './utils';

export interface CommunityProps extends GroupProps {}

export type Community = CommunityProps & WithId;
