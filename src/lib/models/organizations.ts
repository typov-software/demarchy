import type { DocumentMeta } from './utils';

export interface OrganizationProps {
  name: string;
  slug: string;
}

export type Organization = OrganizationProps & DocumentMeta;
