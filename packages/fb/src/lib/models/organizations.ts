import type { DocumentMeta } from "./utils";

export interface OrganizationProps {
  user_id: string;
  profile_handle: string;

  name: string;
  slug: string;
}

export type Organization = OrganizationProps & DocumentMeta;
