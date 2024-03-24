import type { DocumentMeta } from "./utils";

export interface ProposalSettingsProps {
  // percent of voting population required to accept proposal amendments
  acceptance_threshold_ratio: number;
  // percent of voting population required to fully block a proposal
  block_threshold_ratio: number;
}

export type ProposalSettings = ProposalSettingsProps & DocumentMeta;
