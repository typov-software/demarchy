import type { LayoutServerLoad } from './$types';
import { adminWorkspaceRef } from '$lib/server/admin';
import type { Workspace, WorkspaceProps } from '$lib/models/workspaces';
import type { Timestamp } from 'firebase-admin/firestore';

export const load = (async ({ parent }) => {
  const { organization } = await parent();
  // Load all org workspaces not just workspaces the user is a member of
  // this way all users can discover other groups and request access (obs, mem)
  const snapshot = await adminWorkspaceRef(organization.id).get();
  const workspaces: Workspace[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as WorkspaceProps),
    created_at: (doc.data()!.created_at as Timestamp).toDate()
  }));
  return {
    workspaces
  };
}) satisfies LayoutServerLoad;
