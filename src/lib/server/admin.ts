import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import pkg from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';

try {
	pkg.initializeApp({
		credential: applicationDefault()
		// credential: pkg.credential.cert({
		// 	projectId: FB_PROJECT_ID,
		// 	clientEmail: FB_CLIENT_EMAIL,
		// 	privateKey: `"${FB_PRIVATE_KEY}"`
		// })
	});
} catch (err: unknown) {
	const error = err as Error;
	if (!/already exists/u.test(error.message)) {
		console.error('Firebase Admin Error: ', error.stack);
	}
}

export const adminDB = getFirestore();
export const adminAuth = getAuth();
