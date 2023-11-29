import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminDB } from '$lib/server/admin';
import type { Workspace, WorkspaceProps } from '$lib/models/workspaces';

export const load = (async ({ locals, parent, setHeaders }) => {
  const uid = locals.user_id;
  if (!uid) {
    throw redirect(301, '/login');
  }
  const { organization, memberships } = await parent();
  const orgMemberships = memberships.find(
    (membership) => membership.organization_id === organization!.id
  );
  if (!orgMemberships || !organization) {
    throw error(401, 'unauthorized');
  }
  const workspaceIds = Object.keys(orgMemberships.roles);
  const workspaceRefs = workspaceIds.map((id) =>
    adminDB.collection('organizations').doc(organization.id).collection('workspaces').doc(id)
  );
  const snapshot = await adminDB.getAll(...workspaceRefs);
  const workspaces: Workspace[] = snapshot.map((doc) => ({
    id: doc.id,
    ...(doc.data() as WorkspaceProps)
  }));

  setHeaders({
    'cache-control': 'max-age=60'
  });

  return {
    workspaces
  };
}) satisfies PageServerLoad;
