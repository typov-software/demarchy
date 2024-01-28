import type { DocumentMeta } from './utils';

export interface SettingsProps {
  // percent of voting population required to accept proposal amendments
  proposal_acceptance_threshold_percent: number;
  // percent of voting population required to fully block a proposal
  proposal_block_threshold_percent: number;
}

export type Settings = SettingsProps & DocumentMeta;
