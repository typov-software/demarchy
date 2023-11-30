import type { LayoutServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';
import type { Workspace, WorkspaceProps } from '$lib/models/workspaces';

export const load = (async ({ parent }) => {
  const { organization, organization_memberships } = await parent();
  // Loaded workspaces are determined by user org memberships
  const workspaceIds = Object.keys(organization_memberships.roles);
  const workspaceRefs = workspaceIds.map((id) =>
    adminDB.collection('organizations').doc(organization.id).collection('workspaces').doc(id)
  );
  const snapshot = await adminDB.getAll(...workspaceRefs);
  const workspaces: Workspace[] = snapshot.map((doc) => ({
    id: doc.id,
    ...(doc.data() as WorkspaceProps)
  }));
  return {
    workspaces
  };
}) satisfies LayoutServerLoad;
