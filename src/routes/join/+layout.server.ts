import type { Profile } from '$lib/models/profiles';
import { makeDocument } from '$lib/models/utils';
import { adminProfileRef } from '$lib/server/admin';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
  let profile: Profile | null = null;
  const uid = locals.user_id;
  if (!uid) {
    return {
      profile
    };
  }
  const profileDoc = await adminProfileRef().doc(uid).get();
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
