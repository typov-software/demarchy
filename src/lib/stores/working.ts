import { writable } from 'svelte/store';

export function workingStore() {
  const jobs = writable<string[]>([]);
  const add = () => {
    const id = crypto.randomUUID();
    jobs.update((state) => {
      return [...state, id];
    });
    return id;
  };
  const remove = (id: string) => {
    jobs.update((state) => {
      return [...state.filter((i) => i !== id)];
    });
  };
  return {
    subscribe: jobs.subscribe,
    add,
    remove
  };
}

export const working = workingStore();
