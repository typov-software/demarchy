import type { Profile, ProfileProps } from '$lib/models/profiles';
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
  profile = {
    id: profileDoc.id,
    ...(profileDoc.data() as ProfileProps)
  };
  return {
    profile
  };
}) satisfies LayoutServerLoad;
