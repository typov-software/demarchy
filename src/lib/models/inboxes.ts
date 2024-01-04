import type { WithRef } from './utils';

export interface InboxProps {
  unread: number;
}

export type Inbox = InboxProps & WithRef;
