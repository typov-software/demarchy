import { adminProfileRef } from '$lib/server/admin';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Profile, ProfileProps } from '$lib/models/profiles';

export const load = (async ({ params }) => {
  const handle = params.handle;
  const snapshot = await adminProfileRef().where('handle', '==', handle).limit(1).get();
  const doc = snapshot.docs.at(0);
  if (!doc) {
    error(404, 'No profile with this handle');
  }
  const userProfile: Profile = {
    id: doc.id,
    ...(doc.data() as ProfileProps)
  };
  return {
    userProfile
  };
}) satisfies PageServerLoad;
