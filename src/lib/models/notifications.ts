import type { DocumentMeta } from './utils';

export type NotificationType = 'invitation';

export interface NotificationProps<T = unknown> {
  created_at: Date;
  seen: boolean;
  type: NotificationType;
  data: T;
}

export type Notification<T = unknown> = NotificationProps<T> & DocumentMeta;

export interface NotificationInvitationData {
  invitation_id: string;
  organization_id: string;
  organization_name: string;
  group_id: string;
  group_name: string;
}
