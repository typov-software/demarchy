import type { ApplicationProps } from '$lib/models/applications';
import { adminDB, adminGroupRef, createdTimestamps } from './admin';

interface SubmitApplicationParams {
  user_id: string;
  profile_handle: string;

  organization_id: string;
  group_id: string;
}

export async function submitApplication(params: SubmitApplicationParams) {
  const { user_id, profile_handle, organization_id, group_id } = params;
  const applicationProps: ApplicationProps = {
    user_id,
    profile_handle,
    organization_id,
    group_id
  };

  const applicationRef = adminGroupRef(organization_id)
    .doc(group_id)
    .collection('applications')
    .doc(user_id);

  const batch = adminDB.batch();
  batch.set(applicationRef, {
    ...createdTimestamps(),
    ...applicationProps
  });
  try {
    await batch.commit();
  } catch (e) {
    console.error(e);
  }
}
