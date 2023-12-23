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
  adminGroupRef
} from '$lib/server/admin';
import type { Voucher, VoucherProps } from '$lib/models/vouchers';
import type { MembershipProps } from '$lib/models/memberships';
import { FieldValue } from 'firebase-admin/firestore';

export const load = (async ({ locals }) => {
  const uid = locals.user_id;
  if (!uid) {
    throw redirect(301, '/login');
  }

  const snapshot = await adminVoucherRef()
    .where('uid', '==', uid)
    .where('type', '==', '/d/organizations/new')
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

    const profile = await adminProfileRef().doc(uid).get();
    const orgRef = adminOrganizationRef().doc();
    const batch = adminDB.batch();
    // Update the vouchers document so it can't be used again
    batch.update(adminDB.doc(`vouchers/${voucher_id}`), { redeemed: true });
    // Create the slug document
    batch.set(adminSlugRef().doc(slug), { organization_id: orgRef.id });
    // Create the organization document
    batch.set(orgRef, { name, slug });
    // Create the membership document for this user with member access to this organization
    batch.set(adminMembershipRef(orgRef.id).doc(uid), {
      uid,
      organization_id: orgRef.id,
      roles: {
        [orgRef.id]: 'mem'
      },
      standing: 'ok'
    } as MembershipProps);
    // Create the group associated with this organization
    batch.set(adminGroupRef(orgRef.id).doc(orgRef.id), {
      name,
      description: 'Organization',
      library_id: null,
      organization_id: orgRef.id,
      created_at: FieldValue.serverTimestamp(),
      created_by: uid
    });
    // Create the member document within the new group to record this user as member for all to see
    batch.set(adminMemberRef(orgRef.id, orgRef.id).doc(uid), {
      uid,
      group_id: orgRef.id,
      organization_id: orgRef.id,
      role: 'mem',
      joined_at: FieldValue.serverTimestamp(),
      name: profile.data()!.name,
      handle: profile.data()!.handle
    });
    await batch.commit();

    throw redirect(301, `/d/${slug}`);
  }
} satisfies Actions;
