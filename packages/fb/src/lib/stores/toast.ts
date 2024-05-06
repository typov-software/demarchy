import type { Alert } from "$lib/models/alerts";
import { writable } from "svelte/store";

export function toastStore() {
  const alerts = writable<Alert[]>([]);
  const add = (props: Omit<Alert, "uid">) => {
    const uid = crypto.randomUUID();
    const alert: Alert = {
      timeout_ms: 6000,
      ...props,
      uid
    };
    alerts.update((state) => {
      return [...state, alert];
    });
    if (alert.timeout_ms) {
      setTimeout(() => {
        remove(alert);
      }, alert.timeout_ms);
    }
    return alert;
  };
  const remove = (alert: Alert) => {
    alerts.update((state) => {
      return [...state.filter((a) => a.uid !== alert.uid)];
    });
  };
  return {
    subscribe: alerts.subscribe,
    add,
    remove
  };
}

export const toast = toastStore();
