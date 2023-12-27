import type { WithId } from './utils';

export interface ProposalProps {
  state: 'draft' | 'open' | 'closed' | 'archived';

  title: string;
  description: string;

  created_by: string;
  created_at: Date;

  // doc.id: doc.name
  linked_docs: Record<string, string>;
}

export type Proposal = ProposalProps & WithId & { path: string };
