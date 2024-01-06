import type { WithRef } from './utils';

export interface LibraryProps {
  extends_library_id: string | null;
  organization_id: string;
  group_id: string | null;
  latest: boolean;

  docs: {
    // [filepath]: doc_id
    [key: string]: string;
  };

  assets: {
    [key: string]: string;
  };
}

export type Library = LibraryProps & WithRef;
