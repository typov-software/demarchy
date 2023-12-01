import { useWritable } from './use-shared-store';

export const useWorkingStore = () =>
  useWritable('working', {
    jobs: [] as string[]
  });
