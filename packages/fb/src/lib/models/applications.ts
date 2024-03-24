import type { DocumentMeta } from "./utils";

export interface ApplicationProps {
  user_id: string;
  profile_handle: string;
  organization_id: string;
  group_id: string;
  text: string;
}

export type Application = ApplicationProps & DocumentMeta;
