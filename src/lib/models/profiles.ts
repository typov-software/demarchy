import type { WithId } from './utils';

export interface ProfileProps {
  handle: string;
  name: string;
  photo_url?: string;
}

export type Profile = ProfileProps & WithId;

export type AuthProvider = 'google.com' | 'github.com' | 'microsoft.com' | 'apple.com';

export const SUPPORTED_PROVIDER_IDS: AuthProvider[] = [
  'google.com',
  'github.com',
  'microsoft.com' /*, 'apple.com' */
];
