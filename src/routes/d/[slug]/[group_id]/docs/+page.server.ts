import type { Library } from '$lib/models/libraries';
import { makeDocument } from '$lib/models/utils';
import { adminGroupLibraryRef } from '$lib/server/admin';
import type { Timestamp } from 'firebase-admin/firestore';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
  const data = await parent();
  // get latest library doc
  const libraryDoc = await adminGroupLibraryRef(data.organization.id, data.group.id)
    .doc('latest')
    .get();
  if (!libraryDoc || !libraryDoc.exists) {
    return { library: undefined };
  }
  const library: Library = makeDocument(libraryDoc);
  for (const key of Object.keys(library.docs)) {
    library.docs[key].updated_at = (library.docs[key].updated_at as Timestamp).toDate();
  }
  return { library };
}) satisfies PageServerLoad;
