import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
	apiKey: 'AIzaSyCKo_Q3VhZDpYlHWd9__-yFpYdqTi6ZW9s',
	authDomain: 'typov-demarchy.firebaseapp.com',
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
