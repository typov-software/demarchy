import type { PageServerLoad } from "./$types";
import { adminAuth } from "$lib/server/admin";
import { SUPPORTED_PROVIDER_IDS, type AuthProvider } from "$lib/models/profiles";

export const load = (async ({ locals }) => {
  const user_id = locals.user_id!;
  const user = await adminAuth.getUser(user_id);
  const providerData = user.providerData ?? [];
  const connected = providerData.map((p) => p.providerId);
  const disconnected = SUPPORTED_PROVIDER_IDS.filter(
    (id) => !connected.includes(id)
  ) as AuthProvider[];

  return {
    connected: user.providerData.map((data) => ({
      providerId: data.providerId as AuthProvider,
      email: data.email
    })),
    disconnected
  };
}) satisfies PageServerLoad;
