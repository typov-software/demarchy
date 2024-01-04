import type { WithRef } from './utils';

export interface OrganizationProps {
  name: string;
  slug: string;
}

export type Organization = OrganizationProps & WithRef;
