import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminVoucherRef } from '$lib/server/admin';
import type { Voucher } from '$lib/models/vouchers';
import { makeDocument } from '$lib/models/utils';

/**
 * Returns list of vouchers for this user from firestore.
 * @cached
 */
export const load = (async ({ locals, setHeaders }) => {
  const uid = locals.user_id;
  if (!uid) {
    redirect(301, '/login');
  }

  const snapshot = await adminVoucherRef().where('uid', '==', uid).get();
  const vouchers: Voucher[] = snapshot.docs.map((doc) => makeDocument(doc));

  setHeaders({
    'cache-control': 'max-age=60'
  });

  return {
    vouchers
  };
}) satisfies PageServerLoad;
