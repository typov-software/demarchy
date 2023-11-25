import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminAuth } from '$lib/server/admin';

const supportedProviderIds = ['google.com', 'apple.com', 'microsoft.com', 'github.com'];

export const load = (async ({ locals }) => {
  const uid = locals.user_id;
  if (!uid) {
    throw redirect(301, '/login');
  }

  const user = await adminAuth.getUser(uid);
  const providerData = user.providerData ?? [];
  const connected = providerData.map((p) => p.providerId);
  const disconnected = supportedProviderIds.filter((id) => !connected.includes(id));

  return {
    connected: user.providerData.map((data) => ({
      providerId: data.providerId,
      email: data.email
    })),
    disconnected
  };
}) satisfies PageServerLoad;
