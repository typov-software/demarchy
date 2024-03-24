import type { Doc } from "$lib/models/docs";
import type { Library } from "$lib/models/libraries";
import { makeDocument } from "$lib/models/utils";
import { adminGroupDocRef, adminGroupLibraryRef } from "$lib/server/admin";
import type { PageServerLoad } from "./$types";

export const load = (async ({ parent, url }) => {
  const viewingDocId = url.searchParams.get("doc");
  const viewingLibraryId = url.searchParams.get("library");
  const data = await parent();
  let doc: Doc | undefined = undefined;

  // get last x versions
  const versionsSnap = await adminGroupLibraryRef(data.organization.id, data.group.id)
    .orderBy("created_at", "desc")
    .limit(5)
    .get();
  const versions = versionsSnap.docs.map((d) => makeDocument<Library>(d));

  // get latest library doc
  const libraryDoc = await adminGroupLibraryRef(data.organization.id, data.group.id)
    .doc(viewingLibraryId ?? "latest")
    .get();
  if (!libraryDoc || !libraryDoc.exists) {
    return { library: undefined, doc, versions };
  }
  const library: Library = makeDocument(libraryDoc);
  if (viewingDocId) {
    const docDoc = await adminGroupDocRef(data.organization.id, data.group.id)
      .doc(viewingDocId)
      .get();
    if (docDoc.exists) {
      doc = makeDocument<Doc>(docDoc);
    }
  }
  return { library, doc, versions };
}) satisfies PageServerLoad;
