import type { GroupProps } from '$lib/models/groups';
import type { MemberProps } from '$lib/models/members';
import type { MembershipProps } from '$lib/models/memberships';
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
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const organization_id = formData.get('organization_id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const profileName = formData.get('profileName') as string;
    const profileHandle = formData.get('profileHandle') as string;

    const groupRef = adminGroupRef(organization_id).doc();
    const membershipRef = adminMembershipRef(organization_id).doc(user_id);
    const memberRef = adminMemberRef(organization_id, groupRef.id).doc(user_id);

    const batch = adminDB.batch();
    const groupProps: GroupProps = {
      name,
      description,
      library_id: null,
      organization_id,
      user_id,
      profile_handle: profileHandle,
      member_count: 1
    };
    batch.create(groupRef, {
      ...createdTimestamps(),
      ...groupProps
    });
    const membershipProps: MembershipProps = {
      user_id,
      organization_id,
      roles: {
        [groupRef.id]: 'mem'
      },
      standing: 'ok'
    };
    batch.set(
      membershipRef,
      {
        ...updatedTimestamps(),
        ...membershipProps
      },
      {
        merge: true
      }
    );
    const memberProps: MemberProps = {
      user_id,
      group_id: groupRef.id,
      organization_id,
      role: 'mem',
      name: profileName,
      handle: profileHandle
    };
    batch.set(
      memberRef,
      {
        ...createdTimestamps(),
        ...memberProps
      },
      {
        merge: true
      }
    );
    await batch.commit();

    redirect(301, `/d/${params.slug}/${groupRef.id}`);
  }
} satisfies Actions;
