import type { Library } from '$lib/models/libraries';
import { makeDocument } from '$lib/models/utils';
import { adminGroupLibraryRef } from '$lib/server/admin';
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
  return { library };
}) satisfies PageServerLoad;
