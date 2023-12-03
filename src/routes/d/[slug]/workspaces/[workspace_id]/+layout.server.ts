import { isWorkspaceObserverOrHigher } from '$lib/server/access';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, params, locals }) => {
  const { workspaces, organization, organization_memberships } = await parent();

  const allowed = await isWorkspaceObserverOrHigher(
    organization.id,
    params.workspace_id,
    locals.user_id!,
    organization_memberships
  );

  if (!allowed) {
    throw error(403, 'forbidden');
  }

  return {
    workspace: workspaces.find((ws) => ws.id === params.workspace_id)
  };
}) satisfies LayoutServerLoad;
