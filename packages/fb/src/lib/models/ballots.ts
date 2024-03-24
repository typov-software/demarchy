import type { DocumentMeta } from "./utils";
import type { VoteContext } from "./votes";

export interface BallotProps {
  organization_id: string;
  group_id: string;
  context: VoteContext;
  context_id: string;
  description: null | string;
  state: "open" | "closed";
}

export type Ballot = BallotProps & DocumentMeta;

export interface BallotTallyProps {
  accept: number;
  reject: number;
  abstain: number;
  block: number;
}

export type BallotTally = BallotTallyProps & DocumentMeta;
