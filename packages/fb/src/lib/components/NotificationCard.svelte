<script lang="ts">
  import type { Notification } from "$lib/models/notifications";
  import { createEventDispatcher } from "svelte";
  import InvitationNotification from "./notifications/InvitationNotification.svelte";
  import WelcomeNotification from "./notifications/WelcomeNotification.svelte";
  import NotificationSeen from "./NotificationSeen.svelte";
  import { formatRelative } from "date-fns";
  import UninviteNotification from "./notifications/UninviteNotification.svelte";
  import ApplicationNotification from "./notifications/ApplicationNotification.svelte";
  import VoucherRequestedNotification from "./notifications/VoucherRequestedNotification.svelte";

  const dispatch = createEventDispatcher();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let notification: Notification<any>;

  function handleDeleted(e: CustomEvent<Notification>) {
    // Forward event
    dispatch("deleted", e.detail);
  }
</script>

<li class="card bg-base-200 w-full">
  <div class="flex items-center p-3 gap-1">
    <small class="text-xs text-neutral">
      {formatRelative(notification.created_at, new Date())}
    </small>
    <span class="flex-1"> </span>
    <NotificationSeen {notification} on:deleted={handleDeleted} />
  </div>
  <div class="card-body px-3 pt-0 pb-3">
    {#if notification.type === "application"}
      <ApplicationNotification {notification} />
    {:else if notification.type === "invitation"}
      <InvitationNotification {notification} on:deleted={handleDeleted} />
    {:else if notification.type === "uninvite"}
      <UninviteNotification {notification} />
    {:else if notification.type === "voucher-requested"}
      <VoucherRequestedNotification {notification} />
    {:else if notification.type === "welcome"}
      <WelcomeNotification {notification} />
    {/if}
  </div>
</li>
