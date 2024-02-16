import type { DocSummary } from './libraries';
import type { DocumentMeta } from './utils';

export interface Amendment {
  doc: DocSummary;
  type: 'create' | 'update' | 'destroy';
  update?: {
    doc: DocSummary;
    // from_library: string;
  };
}

export interface LinkedResource {
  resource_type: 'comment' | 'discussion' | 'feedback' | 'proposal';
  resource_id: string;
}

export interface ProposalProps {
  user_id: string;
  profile_handle: string;
  group_id: string;

  state: 'draft' | 'open' | 'dropped' | 'adopted' | 'archived';

  title: string;
  description: string;

  created_at: Date;
  updated_at: Date;

  library_id: string;
  amendments: Record<string, Amendment>;
  links: Record<string, LinkedResource>;
}

export type Proposal = ProposalProps & DocumentMeta;
