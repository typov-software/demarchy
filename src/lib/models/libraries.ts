import type { DocumentMeta } from './utils';

export interface DocSummary {
  id: string;
  path: string;
  name: string;
  updated_at: FirebaseFirestore.FieldValue | Date;
}

export interface LibraryProps {
  extends_library_id: string | null;
  organization_id: string;
  group_id: string | null;
  latest: boolean;

  docs: {
    [key: string]: DocSummary;
  };

  assets: {
    [key: string]: string;
  };
}

export type Library = LibraryProps & DocumentMeta;
