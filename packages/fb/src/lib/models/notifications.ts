import type { InboxCategory } from "./inboxes";
import type { DocumentMeta } from "./utils";
import type { VoucherType } from "./vouchers";

export type NotificationType =
  | "application"
  | "invitation"
  | "uninvite"
  | "voucher-requested"
  | "welcome";

export interface NotificationProps<T = unknown> {
  category: InboxCategory;
  type: NotificationType;
  seen: number;
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

export interface VoucherRequestedNotificationData {
  type: VoucherType;
}

export interface WelcomeNotificationData {
  profile_handle: string;
}
