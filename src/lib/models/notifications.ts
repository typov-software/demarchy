import type { DocumentMeta } from './utils';

export type NotificationType = 'application' | 'invitation' | 'uninvite' | 'welcome';

export interface NotificationProps<T = unknown> {
  seen: number;
  type: NotificationType;
  data: T;
}

export type Notification<T = unknown> = NotificationProps<T> & DocumentMeta;

export interface ApplicationNotificationData {
  text: string;
}

export interface InvitationNotificationData {
  invitation_id: string;
  organization_id: string;
  organization_name: string;
  group_id: string;
  group_name: string;
  invited_by_id: string;
  invited_by_handle: string;
}

export interface UninviteNotificationData {
  invitation_id: string;
  organization_id: string;
  organization_name: string;
  group_id: string;
  group_name: string;
}

export interface WelcomeNotificationData {
  profile_handle: string;
}
