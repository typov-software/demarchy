import { GithubAuthProvider, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

// We're using `any` here because firebase/auth does not export abstract class
// BaseOauthProvider that all providers implement.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getProviders(): Record<string, any> {
  return {
    'google.com': new GoogleAuthProvider(),
    'github.com': new GithubAuthProvider(),
    'microsoft.com': new OAuthProvider('microsoft.com'),
    'apple.com': new OAuthProvider('apple.com'),
  };
}
