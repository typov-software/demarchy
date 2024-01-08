import {
  adminDB,
  adminMemberRef,
  adminMembershipRef,
  adminGroupRef,
  createdTimestamps,
  updatedTimestamps
} from '$lib/server/admin';
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, locals, params }) => {
    const uid = locals.user_id!;
    const formData = await request.formData();
    const organization_id = formData.get('organization_id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const profileName = formData.get('profileName') as string;
    const profileHandle = formData.get('profileHandle') as string;

    const groupRef = adminGroupRef(organization_id).doc();
    const membershipRef = adminMembershipRef(organization_id).doc(uid);
    const memberRef = adminMemberRef(organization_id, groupRef.id).doc(uid);
    const batch = adminDB.batch();
    batch.create(groupRef, {
      ...createdTimestamps(),
      name,
      description,
      library_id: null,
      organization_id,
      created_by: uid
    });
    batch.set(
      membershipRef,
      {
        ...updatedTimestamps(),
        uid,
        organization_id,
        roles: {
          [groupRef.id]: 'mem'
        },
        standing: 'ok'
      },
      {
        merge: true
      }
    );
    batch.set(
      memberRef,
      {
        ...createdTimestamps(),
        uid,
        group_id: groupRef.id,
        organization_id,
        role: 'mem',
        name: profileName,
        handle: profileHandle
      },
      {
        merge: true
      }
    );
    await batch.commit();

    redirect(301, `/d/${params.slug}/${groupRef.id}`);
  }
} satisfies Actions;
