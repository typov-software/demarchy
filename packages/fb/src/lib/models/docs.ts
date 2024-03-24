import type { Block } from "./blocks";
import type { DocumentMeta } from "./utils";

export interface DocProps {
  // array of handles
  contributors: string[];
  user_id: string;
  profile_handle: string;
  organization_id: string;
  group_id: string;
  extends_doc_id: string | null;

  name: string;
  blocks: Block[];
}

export type Doc = DocProps & DocumentMeta;
