import type { Block } from "./blocks";
import type { DocumentMeta } from "./utils";

export type PinType = "block" | "clarification" | "concern";

export interface Pin {
  comment_id: string;
  type: PinType;
  resolved: boolean;
  // number of milliseconds elapsed since the epoch, which is defined as the midnight at the beginning of January 1, 1970, UTC
  pinned_timestamp: number;
}

export interface DiscussionProps {
  organization_id: string;
  group_id: string;

  user_id: string;
  profile_handle: string;

  blocks: Block[];
  state: "draft" | "open" | "dropped" | "archived";

  pins: Record<string, Pin>;
}

export type Discussion = DiscussionProps & DocumentMeta;
