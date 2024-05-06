import { adminAuth } from '$lib/server/admin';
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
  if (import.meta.env.PROD) {
    event = {
      ...event,
      getClientAddress() {
        const addresses = event.request.headers.get('x-forwarded-for') ?? '';
        if (Array.isArray(addresses)) {
          return addresses.join(',');
        }
        return addresses;
      },
    };
  }

  const sessionCookie = event.cookies.get('__session');
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie!);
    event.locals.user_id = decodedClaims.uid;
  } catch (e) {
    event.locals.user_id = null;
    return resolve(event);
  }
  return resolve(event);
}) satisfies Handle;
