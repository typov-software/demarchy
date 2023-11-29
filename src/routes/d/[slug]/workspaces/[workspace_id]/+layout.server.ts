import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';
import type { Workspace, WorkspaceProps } from '$lib/models/workspaces';

export const load = (async ({ locals, parent, params }) => {
  const uid = locals.user_id;
  if (!uid) {
    throw redirect(301, '/login');
  }
  const data = await parent();
  const workspaceDoc = await adminDB
    .collection('organizations')
    .doc(data.organization!.id)
    .collection('workspaces')
    .doc(params.workspace_id)
    .get();
  const workspace: Workspace = {
    id: workspaceDoc.id,
    ...(workspaceDoc.data() as WorkspaceProps)
  };
  return {
    workspace
  };
}) satisfies LayoutServerLoad;
