import type { Timestamp } from 'firebase/firestore';

export interface WithId {
	id: string;
}

export interface FirestoreDocument {
	created_at: Timestamp;
	updated_at: Timestamp;
	archived_at: Timestamp | null;
}
