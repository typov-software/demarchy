import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminVoucherRef } from '$lib/server/admin';
import type { Voucher, VoucherProps } from '$lib/models/vouchers';

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
  const vouchers: Voucher[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as VoucherProps)
  }));

  setHeaders({
    'cache-control': 'max-age=60'
  });

  return {
    vouchers
  };
}) satisfies PageServerLoad;
