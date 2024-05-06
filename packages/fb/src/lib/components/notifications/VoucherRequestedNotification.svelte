<script lang="ts">
  import type { Notification, VoucherRequestedNotificationData } from "$lib/models/notifications";
  import type { VoucherType } from "$lib/models/vouchers";

  export let notification: Notification<VoucherRequestedNotificationData>;
  const copy: Record<VoucherType, string> = {
    "/join": "You requested a voucher to allow a new member to join",
    "/d/organizations/new": "You requested a voucher to create an organization"
  };
</script>

<p>
  {copy[notification.data.type]}
</p>
