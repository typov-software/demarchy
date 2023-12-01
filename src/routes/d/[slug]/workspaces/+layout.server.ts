import type { LayoutServerLoad } from './$types';
import { adminDB, adminWorkspaceRef } from '$lib/server/admin';
import type { Workspace, WorkspaceProps } from '$lib/models/workspaces';
import type { Timestamp } from 'firebase-admin/firestore';

export const load = (async ({ parent }) => {
  const { organization, organization_memberships } = await parent();
  // Loaded workspaces are determined by user org memberships
  const workspaceIds = Object.keys(organization_memberships.roles);
  const workspaceRefs = workspaceIds.map((id) => adminWorkspaceRef(organization.id).doc(id));
  const snapshot = await adminDB.getAll(...workspaceRefs);
  const workspaces: Workspace[] = snapshot.map((doc) => ({
    id: doc.id,
    ...(doc.data() as WorkspaceProps),
    created_at: (doc.data()!.created_at as Timestamp).toDate()
  }));
  return {
    workspaces
  };
}) satisfies LayoutServerLoad;
