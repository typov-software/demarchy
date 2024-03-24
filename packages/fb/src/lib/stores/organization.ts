import type { Organization } from "$lib/models/organizations";
import { useWritable } from "./use-shared-store";

export const useOrganization = () =>
  useWritable<Organization | undefined>("organization", undefined);
