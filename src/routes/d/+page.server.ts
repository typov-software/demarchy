import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { submitApplication } from '$lib/server/application-actions';
import { emptyString } from '$lib/utils/string';
import type { VoucherType } from '$lib/models/vouchers';
import type {
  NotificationProps,
  VoucherRequestedNotificationData
} from '$lib/models/notifications';
import {
  adminDB,
  adminInboxRef,
  adminNotificationRef,
  createdTimestamps,
  updatedTimestamps
} from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';

export const load = (async () => {
  return {};
}) satisfies PageServerLoad;

export const actions = {
  requestVoucher: async ({ request, locals }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const type = formData.get('type') as VoucherType;
    if (!['/join', '/d/organizations/new'].includes(type)) {
      error(401, 'unauthorized');
    }
    const batch = adminDB.batch();
    batch.set(
      adminDB.collection('voucher_requests').doc(user_id),
      {
        ...createdTimestamps(),
        user_id,
        [type]: true
      },
      { merge: true }
    );

    // create the notifcation
    const voucherNotification: VoucherRequestedNotificationData = {
      type
    };
    const notificationProps: NotificationProps = {
      type: 'voucher-requested',
      seen: 0,
      data: voucherNotification
    };
    batch.create(adminNotificationRef(user_id).doc(), {
      ...createdTimestamps(),
      ...notificationProps
    });
    batch.set(
      adminInboxRef().doc(user_id),
      {
        ...updatedTimestamps(),
        unread: FieldValue.increment(1)
      },
      {
        merge: true
      }
    );
    try {
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  },
  subscribeToDevlog: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    if (emptyString(email)) {
      error(401, 'unauthorized');
    }
    // search for existing subscriptions
    const existingSnap = await adminDB
      .collection('devlog_subscriptions')
      .where('email', '==', email)
      .limit(1)
      .get();
    if (existingSnap.empty) {
      await adminDB
        .collection('devlog_subscriptions')
        .doc()
        .create({
          ...createdTimestamps(),
          email
        });
    }
  },
  submitApplication: async ({ request, locals }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const profile_handle = formData.get('profile_handle') as string;
    const organization_id = formData.get('organization_id') as string;
    const group_id = formData.get('group_id') as string;
    const text = formData.get('text') as string;

    await submitApplication({
      user_id,
      profile_handle,
      organization_id,
      group_id,
      text
    });
  }
} satisfies Actions;
