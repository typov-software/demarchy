import type { WithRef } from './utils';

export type ActivityType = 'proposal_opened' | 'proposal_adopted' | 'proposal_rejected';

export interface ActivityProps {
  group_id: string;
  type: ActivityType;
}

export type Activity = ActivityProps & WithRef;
