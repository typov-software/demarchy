import _get from 'lodash/get';
import _set from 'lodash/set';
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

export interface LibraryDirectory {
  [key: string]: LibraryDirectory;
}

export interface LibraryShelf {
  library_id: string;
  docs: Map<string, DocSummary[]>;
  dirs: LibraryDirectory;
}

export function addDocToShelf(doc: DocSummary, shelf: LibraryShelf): LibraryShelf {
  const parts = doc.name.split('/');
  parts.pop(); // remove the doc name from array
  const path = parts.join('/'); // rejoin dir path
  // get the existing docs at this path
  const row = shelf.docs.get(path) ?? [];
  row.push(doc);
  shelf.docs.set(path, row);
  if (parts.length) {
    // reformat path to something lodash expects
    const keypath = path.replaceAll('/', '.');
    // get existings dirs at this path
    const existing = _get(shelf.dirs, keypath) ?? {};
    // ensure this path exists while keeping other nested dirs
    _set(shelf.dirs, keypath, { ...existing });
  }
  return shelf;
}

export function organizeLibrary(library: Library): LibraryShelf {
  let shelf: LibraryShelf = {
    library_id: library.id,
    docs: new Map([]),
    dirs: {}
  };
  for (const id of Object.keys(library.docs)) {
    shelf = addDocToShelf(library.docs[id], shelf);
  }
  return shelf;
}
