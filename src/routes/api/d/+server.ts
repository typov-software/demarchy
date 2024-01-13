import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminDB, adminOrganizationRef, adminProfileRef } from '$lib/server/admin';
import type { Profile } from '$lib/models/profiles';
import type { Membership } from '$lib/models/memberships';
import type { Organization } from '$lib/models/organizations';
import { MEMBERSHIPS } from '$lib/models/firestore';
import { getComparator, stableSort } from '$lib/utils/sorting';
import { makeDocument } from '$lib/models/utils';

/**
 *
 * @returns data used to populate app /d route
 * @cached
 */
export const GET: RequestHandler = async ({ locals, setHeaders }) => {
  const uid = locals.user_id;
  if (!uid) {
    error(401, 'unauthorized');
  }

  const profileDoc = await adminProfileRef().doc(uid).get();
  const profile: Profile = makeDocument(profileDoc);
  const snapshot = await adminDB.collectionGroup(MEMBERSHIPS).where('uid', '==', uid).get();
  const memberships: Membership[] = snapshot.docs.map((doc) => makeDocument(doc));
  const organizationIds = memberships.map((membership) => membership.organization_id);

  const refs = organizationIds.map((oid) => adminOrganizationRef().doc(oid));
  const orgDocs = refs.length ? await adminDB.getAll(...refs) : [];
  const organizations: Organization[] = stableSort(
    orgDocs.map((doc) => makeDocument(doc)),
    getComparator('asc', 'name')
  );

  setHeaders({
    'cache-control': 'max-age=60'
  });

  return json({
    memberships,
    organizations,
    profile
  });
};
