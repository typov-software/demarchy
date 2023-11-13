import type { WithId } from './utils';

export interface InboxProps {
  unread: number;
}

export type Inbox = InboxProps & WithId;
