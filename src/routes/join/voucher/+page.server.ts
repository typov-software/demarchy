import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminVoucherRef, updatedTimestamps } from '$lib/server/admin';
import { makeDocument } from '$lib/models/utils';
import type { Voucher } from '$lib/models/vouchers';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  redeem: async ({ request, locals }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const voucher_id = formData.get('voucher_id') as string;
    const voucherDoc = await adminVoucherRef().doc(voucher_id).get();
    if (!voucherDoc.exists) {
      error(401, 'unauthorized');
    }
    const voucher = makeDocument<Voucher>(voucherDoc);
    if (voucher.redeemed) {
      error(401, 'unauthorized');
    }
    await voucherDoc.ref.update({
      ...updatedTimestamps(),
      // not exposed in view model, but could be handy to keep track of
      original_user_id: voucher.user_id,
      // swap voucher owners
      user_id,
      redeemed: true
    });
  }
} satisfies Actions;
