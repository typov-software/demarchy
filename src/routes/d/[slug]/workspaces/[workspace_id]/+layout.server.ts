import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, params }) => {
  const { workspaces } = await parent();
  return {
    workspace: workspaces.find((ws) => ws.id === params.workspace_id)
  };
}) satisfies LayoutServerLoad;
