import type { DocumentMeta } from "./utils";

export type VoteContext = "proposals";
export type VoteAction = "accept" | "reject" | "abstain" | "block";

export interface VoteProps {
  context: VoteContext;
  context_id: string;
  user_id: string;
  action: VoteAction;
}

export type Vote = VoteProps & DocumentMeta;
