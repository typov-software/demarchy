import type { DocumentMeta } from './utils';

export type ActivityType = 'proposal/opened' | 'proposal/adopted' | 'proposal/rejected';

export interface ActivityProps {
  organization_id: string;
  group_id: string;
  type: ActivityType;
  description: string;
  link?: {
    route: string;
    title?: string;
  };
}

export type Activity = ActivityProps & DocumentMeta;
