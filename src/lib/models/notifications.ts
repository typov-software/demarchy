import type { WithId } from './utils';

export type NotificationType = 'invitation';

export interface NotificationProps<T = unknown> {
  created_at: Date;
  read: boolean;
  type: NotificationType;
  data: T;
}

export type Notification<T = unknown> = NotificationProps<T> & WithId;

export interface NotificationInvitationData {
  invitation_id: string;
  organization_id: string;
  group_id: string;
}
