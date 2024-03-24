import { adminGroupDocRef } from "$lib/server/admin";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { makeDocument } from "$lib/models/utils";
import type { Doc } from "$lib/models/docs";

export const load = (async ({ params, parent }) => {
  const data = await parent();
  const ref = adminGroupDocRef(data.organization.id, data.group.id).doc(params.doc_id);
  const snap = await ref.get();
  if (!snap) {
    return error(404, "not found");
  }
  const doc = makeDocument<Doc>(snap);
  return { doc };
}) satisfies PageServerLoad;
