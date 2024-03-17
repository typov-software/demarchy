import type { SubmitFunction } from '@sveltejs/kit';
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

export const workingCallback = (
  options: {
    onStart?: () => void;
    onEnd?: () => void;
    reset?: boolean;
    invalidateAll?: boolean;
  } = {}
) => {
  return (() => {
    const jobId = working.add();
    options.onStart && options.onStart();
    return ({ update }) => {
      options.onEnd && options.onEnd();
      working.remove(jobId);
      update({
        reset: options.reset ?? false,
        invalidateAll: options.invalidateAll ?? false
      });
    };
  }) as SubmitFunction;
};
