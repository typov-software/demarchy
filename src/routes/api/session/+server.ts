import { adminAuth } from '$lib/server/admin';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { idToken } = await request.json();
  const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
  const decodedIdToken = await adminAuth.verifyIdToken(idToken);

  // if the token has been created within the last 5 minutes
  if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
    const cookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    const options = { maxAge: expiresIn, httpOnly: true, secure: true, path: '/' };
    cookies.set('__session', cookie, options); // special key for firebase cdn caching
    return json({ status: 'started' });
  } else {
    error(401, 'Recent session required');
  }
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  cookies.delete('__session', { path: '/' });
  return json({ status: 'ended' });
};
