import type { DocumentMeta } from './utils';

export interface BallotProps {
  prompt: string;
  description: null | string;
}

export type Ballot = BallotProps & DocumentMeta;
