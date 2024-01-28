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
import type { Voucher, VoucherProps } from '$lib/models/vouchers';
import { makeDocument } from '$lib/models/utils';
import type { OrganizationProps } from '$lib/models/organizations';
import type { MembershipProps } from '$lib/models/memberships';
import type { GroupProps } from '$lib/models/groups';
import type { MemberProps } from '$lib/models/members';

export const load = (async ({ locals }) => {
  const user_id = locals.user_id;
  if (!user_id) {
    redirect(301, '/login');
  }
  const snapshot = await adminVoucherRef()
    .where('user_id', '==', user_id)
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
    const user_id = locals.user_id;
    if (!user_id) {
      redirect(301, '/login');
    }
    const formData = await request.formData();
    const voucher_id = formData.get('voucher_id') as string;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    const profile = await adminProfileRef().doc(user_id).get();
    const orgRef = adminOrganizationRef().doc();

    const profile_handle = profile.data()!.handle;

    const batch = adminDB.batch();
    // Update the vouchers document so it can't be used again
    const voucherProps: Partial<VoucherProps> = {
      redeemed: true
    };
    batch.update(adminDB.doc(`vouchers/${voucher_id}`), {
      ...updatedTimestamps(),
      ...voucherProps
    });
    // Create the slug document
    batch.set(adminSlugRef().doc(slug), { organization_id: orgRef.id });
    // Create the organization document
    const organizationProps: OrganizationProps = {
      name,
      slug,
      user_id,
      profile_handle
    };
    batch.set(orgRef, {
      ...createdTimestamps(),
      ...organizationProps
    });
    // Create the membership document for this user with member access to this organization
    const membershipProps: MembershipProps = {
      user_id,
      organization_id: orgRef.id,
      roles: {
        [orgRef.id]: 'mem'
      },
      standing: 'ok'
    };
    batch.set(adminMembershipRef(orgRef.id).doc(user_id), {
      ...createdTimestamps(),
      ...membershipProps
    });
    // Create the group associated with this organization
    const groupProps: GroupProps = {
      name: 'Organization',
      description: `Main group from ${name}`,
      library_id: null,
      organization_id: orgRef.id,
      user_id,
      profile_handle,
      member_count: 1
    };
    batch.set(adminGroupRef(orgRef.id).doc(orgRef.id), {
      ...createdTimestamps(),
      ...groupProps
    });
    // Create the member document within the new group to record this user as member for all to see
    const memberProps: MemberProps = {
      user_id,
      group_id: orgRef.id,
      organization_id: orgRef.id,
      role: 'mem',
      name: profile.data()!.name,
      handle: profile_handle
    };
    batch.set(adminMemberRef(orgRef.id, orgRef.id).doc(user_id), {
      ...createdTimestamps(),
      ...memberProps
    });
    await batch.commit();

    redirect(301, `/d/${slug}`);
  }
} satisfies Actions;
