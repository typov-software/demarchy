<script lang="ts">
  import type { Notification, WelcomeNotificationData } from "$lib/models/notifications";
  import ProfileLink from "../ProfileLink.svelte";

  export let notification: Notification<WelcomeNotificationData>;
</script>

<p>
  Welcome to Demarchy, <ProfileLink handle={notification.data.profile_handle} />!
</p>
