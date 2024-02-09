import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminVoucherRef, updatedTimestamps } from '$lib/server/admin';
import { makeDocument } from '$lib/models/utils';
import type { Voucher } from '$lib/models/vouchers';
// import { RateLimiter } from 'sveltekit-rate-limiter/server';
// import { LIMITER_KEY } from '$env/static/private';

// See: https://github.com/ciscoheat/sveltekit-rate-limiter
// const limiter = new RateLimiter({
//   // A rate is defined as [number, unit]
//   IP: [10, 'h'], // IP address limiter
//   IPUA: [5, 'm'], // IP + User Agent limiter
//   cookie: {
//     // Cookie limiter
//     name: 'voucher_limiter', // Unique cookie name for this limiter
//     secret: LIMITER_KEY, // Use $env/static/private
//     rate: [2, 'm'],
//     preflight: true // Require preflight call (see load function)
//   }
// });

export const load = (async (event) => {
  // await limiter.cookieLimiter?.preflight(event);
  return {};
}) satisfies PageServerLoad;

export const actions = {
  redeem: async (event) => {
    // if (await limiter.isLimited(event)) error(429);
    const { request, locals } = event;
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
