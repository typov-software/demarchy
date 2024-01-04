import type { WithRef } from './utils';

export interface LibraryProps {
  organization_id: string;
  group_id: string | null;

  docs: {
    // [filepath]: doc_id
    [key: string]: string;
  };

  assets: {
    [key: string]: string;
  };
}

export type Library = LibraryProps & WithRef;
