import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { adminVoucherRef } from '$lib/server/admin';
import type { Voucher } from '$lib/models/vouchers';
import { makeDocument } from '$lib/models/utils';
import { createOrganization } from '$lib/server/group-actions';

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

    const { organization_id, group_id } = await createOrganization({
      user_id,
      voucher_id,
      name,
      slug
    });

    console.log('created', { organization_id, group_id });

    redirect(301, `/d/${slug}`);
  }
} satisfies Actions;
