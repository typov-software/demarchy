import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  adminDB,
  adminMemberRef,
  adminMembershipRef,
  adminOrganizationRef,
  adminProfileRef,
  adminSlugRef,
  adminVoucherRef,
  adminGroupRef,
  createdTimestamps,
  updatedTimestamps
} from '$lib/server/admin';
import type { Voucher } from '$lib/models/vouchers';
import { makeDocument } from '$lib/models/utils';

export const load = (async ({ locals }) => {
  const uid = locals.user_id;
  if (!uid) {
    redirect(301, '/login');
  }
  const snapshot = await adminVoucherRef()
    .where('uid', '==', uid)
    .where('type', '==', '/d/organizations/new')
    .where('redeemed', '==', false)
    .get();
  const vouchers: Voucher[] = snapshot.docs.map((doc) => makeDocument(doc));
  return {
    vouchers
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals }) => {
    const uid = locals.user_id;
    if (!uid) {
      redirect(301, '/login');
    }
    const formData = await request.formData();
    const voucher_id = formData.get('voucher_id') as string;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    const profile = await adminProfileRef().doc(uid).get();
    const orgRef = adminOrganizationRef().doc();
    const batch = adminDB.batch();
    // Update the vouchers document so it can't be used again
    batch.update(adminDB.doc(`vouchers/${voucher_id}`), {
      ...updatedTimestamps(),
      redeemed: true
    });
    // Create the slug document
    batch.set(adminSlugRef().doc(slug), { organization_id: orgRef.id });
    // Create the organization document
    batch.set(orgRef, {
      ...createdTimestamps(),
      name,
      slug
    });
    // Create the membership document for this user with member access to this organization
    batch.set(adminMembershipRef(orgRef.id).doc(uid), {
      ...createdTimestamps(),
      uid,
      organization_id: orgRef.id,
      roles: {
        [orgRef.id]: 'mem'
      },
      standing: 'ok'
    });
    // Create the group associated with this organization
    batch.set(adminGroupRef(orgRef.id).doc(orgRef.id), {
      ...createdTimestamps(),
      name: 'Organization',
      description: name,
      library_id: null,
      organization_id: orgRef.id,
      created_by: uid
    });
    // Create the member document within the new group to record this user as member for all to see
    batch.set(adminMemberRef(orgRef.id, orgRef.id).doc(uid), {
      ...createdTimestamps(),
      uid,
      group_id: orgRef.id,
      organization_id: orgRef.id,
      role: 'mem',
      name: profile.data()!.name,
      handle: profile.data()!.handle
    });
    await batch.commit();

    redirect(301, `/d/${slug}`);
  }
} satisfies Actions;
