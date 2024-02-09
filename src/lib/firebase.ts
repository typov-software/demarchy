import { initializeApp } from 'firebase/app';
import {
  FirestoreError,
  collection,
  doc,
  getFirestore,
  initializeFirestore,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { derived, writable, type Readable } from 'svelte/store';
import type { Profile } from './models/profiles';
import {
  PUBLIC_FB_API_KEY,
  PUBLIC_FB_APP_ID,
  PUBLIC_FB_AUTH_DOMAIN,
  PUBLIC_FB_MESSAGING_SENDER_ID,
  PUBLIC_FB_PROJECT_ID,
  PUBLIC_FB_STORAGE_BUCKET,
  PUBLIC_USE_EMULATORS
} from '$env/static/public';
import { makeDocument, type DocumentMeta } from './models/utils';
import type { Voucher } from './models/vouchers';
import type { Inbox } from './models/inboxes';
import { working } from './stores/working';

const firebaseConfig = {
  apiKey: PUBLIC_FB_API_KEY,
  authDomain: PUBLIC_FB_AUTH_DOMAIN,
  projectId: PUBLIC_FB_PROJECT_ID,
  storageBucket: PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: PUBLIC_FB_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
initializeFirestore(app, {
  ignoreUndefinedProperties: true
});
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

if (import.meta.env.DEV && PUBLIC_USE_EMULATORS === 'YES') {
  console.warn('Dev environment detected');
  const { connectAuthEmulator } = await import('firebase/auth');
  const { connectFirestoreEmulator } = await import('firebase/firestore');
  const { connectStorageEmulator } = await import('firebase/storage');
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}

/**
 * @returns a store with the current firebase user
 */
function userStore() {
  let unsubscribe: () => void;

  if (!auth) {
    console.warn('Auth is not initialized');
  }

  if (!auth || !globalThis.window) {
    const { subscribe } = writable<User | null>(null);
    return {
      subscribe
    };
  }

  let job: string | undefined = working.add();
  const endJob = () => {
    if (job) {
      working.remove(job);
      job = undefined;
    }
  };

  const { subscribe } = writable(auth?.currentUser ?? null, (set) => {
    unsubscribe = onAuthStateChanged(auth, (user) => {
      set(user);
      endJob();
    });

    return () => {
      endJob();
      unsubscribe();
    };
  });

  return {
    subscribe
  };
}

export const user = userStore();

/**
 * @param  {string} path document path or reference
 * @returns a store with realtime updates on document data
 */
export function docStore<T extends DocumentMeta>(path: string) {
  let unsubscribe: () => void;

  const docRef = doc(db, path);

  let job: string | undefined = working.add();
  const endJob = () => {
    if (job) {
      working.remove(job);
      job = undefined;
    }
  };
  const { subscribe, set, update } = writable<T | null>(null, (set) => {
    unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = makeDocument<T>(snapshot);
          // if (import.meta.env.DEV) {
          //   console.debug(`[${path}]`, { data });
          // }
          set(data);
        } else {
          set(null);
        }
        endJob();
      },
      function onError(error: FirestoreError) {
        if (import.meta.env.DEV) {
          console.warn('docStore error:', path);
        }
        console.error(error);
        endJob();
      }
    );

    return () => {
      endJob();
      unsubscribe();
    };
  });

  return {
    subscribe,
    set,
    update,
    ref: docRef,
    id: docRef.id
  };
}

export const profile: Readable<Profile | null> = derived(user, ($user, set) => {
  if ($user) {
    return docStore<Profile>(`profiles/${$user.uid}`).subscribe(set);
  } else {
    set(null);
  }
});

export const inbox: Readable<Inbox | null> = derived(user, ($user, set) => {
  if ($user) {
    return docStore<Inbox>(`inboxes/${$user.uid}`).subscribe(set);
  } else {
    set(null);
  }
});

export const joinVoucher: Readable<Voucher | null> = derived(user, ($user, set) => {
  if ($user) {
    let job: string | undefined = working.add();
    const endJob = () => {
      if (job) {
        working.remove(job);
        job = undefined;
      }
    };
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'vouchers'),
        where('user_id', '==', $user.uid),
        where('type', '==', '/join')
      ),
      (snapshot) => {
        if (snapshot.empty) {
          set(null);
        } else {
          set(makeDocument<Voucher>(snapshot.docs[0]));
        }
        endJob();
      },
      function onError(error: FirestoreError) {
        console.error(error);
        endJob();
      }
    );

    return () => {
      endJob();
      unsubscribe();
    };
  } else {
    set(null);
  }
});
