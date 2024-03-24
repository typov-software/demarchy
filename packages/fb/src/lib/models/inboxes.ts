import type { DocumentMeta } from "./utils";

export const INBOX_CATEGORIES = {
  applications: "Applications",
  invitations: "Invitations",
  uncategorized: "Uncategorized",
  vouchers: "Vouchers"
};

export type InboxCategory = keyof typeof INBOX_CATEGORIES;

export function makeEmptyInboxCategories() {
  const out: Record<string, number> = {};
  for (const cat of Object.keys(INBOX_CATEGORIES)) {
    out[cat] = 0;
  }
  return out as Record<InboxCategory, number>;
}

export interface InboxProps extends Record<InboxCategory, number> {
  unread: number;
}

export type Inbox = InboxProps & DocumentMeta;
