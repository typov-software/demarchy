import type { WithId } from './utils';

export interface ProposalProps {
  archived: boolean;
}

export type Proposal = ProposalProps & WithId;
