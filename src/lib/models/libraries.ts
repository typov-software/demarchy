import type { DocumentMeta } from './utils';

export interface DocSummary {
  id: string;
  path: string;
  name: string;
  // updated_at: FirebaseFirestore.FieldValue | Date;
}

export interface LibraryProps {
  // the unique id for this library, duplicate of the firestore id. this let's us have a document with a 'latest' id
  // and keep the unique 'uid' reference
  uid: string;
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
