import { getContext, hasContext, setContext } from 'svelte';
import { readable, writable } from 'svelte/store';

/**
 * Taken from:
 * https://dev.to/jdgamble555/the-correct-way-to-use-stores-in-sveltekit-3h6i
 */

// context for any type of store
export const useSharedStore = <T, A>(name: string, fn: (value?: A) => T, defaultValue?: A) => {
  if (hasContext(name)) {
    return getContext<T>(name);
  }
  const _value = fn(defaultValue);
  setContext(name, _value);
  return _value;
};

// writable store context
export const useWritable = <T>(name: string, value: T) => useSharedStore(name, writable, value);

// readable store context
export const useReadable = <T>(name: string, value: T) => useSharedStore(name, readable, value);
