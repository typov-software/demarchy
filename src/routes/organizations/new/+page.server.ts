import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';
import type { Voucher, VoucherProps } from '$lib/models/vouchers';

export const load = (async ({ locals }) => {
  const uid = locals.user_id;
  if (!uid) {
    throw redirect(301, '/login');
  }

  const snapshot = await adminDB
    .collection('vouchers')
    .where('uid', '==', uid)
    .where('type', '==', '/organizations/new')
    .where('redeemed', '==', false)
    .get();
  const vouchers: Voucher[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as VoucherProps)
  }));

  return {
    vouchers
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals }) => {
    const uid = locals.user_id;
    if (!uid) {
      throw redirect(301, '/login');
    }
    const formData = await request.formData();
    const voucher_id = formData.get('voucher_id') as string;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    const profile = await adminDB.collection('profiles').doc(uid).get();
    const orgRef = adminDB.collection('organizations').doc();
    const batch = adminDB.batch();
    // Update the vouchers document so it can't be used again
    batch.update(adminDB.doc(`vouchers/${voucher_id}`), { redeemed: true });
    // Create the slug document
    batch.set(adminDB.collection('slugs').doc(slug), { organization_id: orgRef.id });
    // Create the organization document
    batch.set(orgRef, { name, slug });
    // Create the membership document for this user with member access to this organization
    batch.set(orgRef.collection('memberships').doc(uid), {
      uid,
      roles: {
        [orgRef.id]: 'mem'
      },
      standing: 'ok'
    });
    // Create the workspace associated with this organization
    batch.set(orgRef.collection('workspaces').doc(orgRef.id), {
      name,
      description: 'Organization library',
      library_id: null
    });
    // Create the member document within the new workspace to record this user as member for all to see
    batch.set(orgRef.collection('workspaces').doc(orgRef.id).collection('members').doc(uid), {
      uid,
      workspace_id: orgRef.id,
      role: 'mem',
      name: profile.data()!.name,
      handle: profile.data()!.handle
    });
    await batch.commit();

    throw redirect(301, `/d/${slug}`);
  }
} satisfies Actions;
