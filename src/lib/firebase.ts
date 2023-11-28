import { initializeApp } from 'firebase/app';
import { doc, getFirestore, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { derived, writable, type Readable } from 'svelte/store';
import type { Profile } from './models/profiles';

const firebaseConfig = {
  apiKey: 'AIzaSyCKo_Q3VhZDpYlHWd9__-yFpYdqTi6ZW9s',
  authDomain: 'demarchy.app',
  projectId: 'typov-demarchy',
  storageBucket: 'typov-demarchy.appspot.com',
  messagingSenderId: '298582394066',
  appId: '1:298582394066:web:396a237c4f41c8553c190b',
  measurementId: 'G-YCREJWHNRD'
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

/**
 * @returns a store with the current firebase user
 */
function userStore() {
  let unsubscribe: () => void;

  if (!auth || !globalThis.window) {
    console.warn('Auth is not initialized or not in browser');
    const { subscribe } = writable<User | null>(null);
    return {
      subscribe
    };
  }

  const { subscribe } = writable(auth?.currentUser ?? null, (set) => {
    unsubscribe = onAuthStateChanged(auth, (user) => {
      set(user);
    });

    return () => unsubscribe();
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
export function docStore<T>(path: string) {
  let unsubscribe: () => void;

  const docRef = doc(db, path);

  const { subscribe } = writable<T | null>(null, (set) => {
    unsubscribe = onSnapshot(docRef, (snapshot) => {
      set((snapshot.data() as T) ?? null);
    });

    return () => unsubscribe();
  });

  return {
    subscribe,
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
