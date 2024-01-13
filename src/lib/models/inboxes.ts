import type { DocumentMeta } from './utils';

export interface InboxProps {
  unread: number;
}

export type Inbox = InboxProps & DocumentMeta;
