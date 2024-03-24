import type { Profile } from "$lib/models/profiles";
import { makeDocument } from "$lib/models/utils";
import { adminProfileRef } from "$lib/server/admin";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  let profile: Profile | null = null;
  const user_id = locals.user_id;
  if (!user_id) {
    return {
      profile
    };
  }
  const profileDoc = await adminProfileRef().doc(user_id).get();
  if (!profileDoc.exists) {
    return {
      profile
    };
  }
  profile = makeDocument<Profile>(profileDoc);
  return {
    profile
  };
}) satisfies LayoutServerLoad;
