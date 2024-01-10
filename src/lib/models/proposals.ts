import type { DocumentMeta } from './utils';

export interface Amendment {
  doc_id: string;
  doc_name: string;
  doc_path: string;
  type: 'create' | 'update' | 'destroy';
}

export interface LinkedResource {
  resource_type: 'comment' | 'discussion' | 'feedback' | 'proposal';
  resource_id: string;
}

export interface ProposalProps {
  user_id: string;
  user_handle: string;
  group_id: string;

  state: 'draft' | 'open' | 'dropped' | 'adopted' | 'archived';

  title: string;
  description: string;

  created_at: Date;
  updated_at: Date;

  amendments: Record<string, Amendment>;
  links: Record<string, LinkedResource>;
}

export type Proposal = ProposalProps & DocumentMeta;
