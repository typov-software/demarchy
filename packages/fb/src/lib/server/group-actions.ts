import type { WriteBatch } from "firebase-admin/firestore";
import {
  adminDB,
  adminGroupRef,
  adminMemberRef,
  adminMembershipRef,
  adminOrganizationRef,
  adminProfileRef,
  adminSlugRef,
  createdTimestamps,
  updatedTimestamps
} from "./admin";
import type { GroupProps } from "$lib/models/groups";
import type { MembershipProps } from "$lib/models/memberships";
import type { MemberProps } from "$lib/models/members";
import type { ProposalSettingsProps } from "$lib/models/settings";
import { makeDocument } from "$lib/models/utils";
import type { Profile } from "$lib/models/profiles";
import type { VoucherProps } from "$lib/models/vouchers";
import type { OrganizationProps } from "$lib/models/organizations";
import { SLUGS } from "$lib/models/firestore";
import type { LibraryProps } from "$lib/models/libraries";

interface CreateOrganizationParams {
  // Who is creating the org?
  user_id: string;
  // Which voucher should be consumed?
  voucher_id: string;
  // What are the org properties?
  name: string;
  slug: string;
}

export async function createOrganization(params: CreateOrganizationParams) {
  const { user_id, voucher_id, name, slug } = params;
  const orgRef = adminOrganizationRef().doc();
  const profileDoc = await adminProfileRef().doc(user_id).get();
  const { name: profile_name, handle: profile_handle } = makeDocument<Profile>(profileDoc);

  const batch = adminDB.batch();

  // Update the vouchers document so it can't be used again
  const voucherProps: Partial<VoucherProps> = {
    redeemed: true
  };
  batch.update(adminDB.doc(`vouchers/${voucher_id}`), {
    ...updatedTimestamps(),
    ...voucherProps
  });

  // Create the slug document for this organization
  batch.set(adminSlugRef().doc(slug), { organization_id: orgRef.id });

  // Create the organization document
  const organizationProps: OrganizationProps = {
    name,
    slug,
    user_id,
    profile_handle
  };
  batch.set(orgRef, {
    ...createdTimestamps(),
    ...organizationProps
  });

  // Create the organization group and memberships
  const { group_id } = await createGroup(
    {
      user_id,
      profile_handle,
      profile_name,
      organization_id: orgRef.id,
      // Manually set organization group reserved names
      name: "Organization",
      slug: "org",
      description: `Main group for ${name}`,
      creatingOrgGroup: true
    },
    batch
  );
  return {
    organization_id: orgRef.id,
    group_id
  };
}

interface CreateGroupParams {
  // Who is creating the group?
  user_id: string;
  profile_handle: string;
  profile_name: string;
  // Which org does this group belong to?
  organization_id: string;
  // What are the group properties?
  name: string;
  slug: string;
  description: string;
  // Are we creating the main group for an organization?
  creatingOrgGroup?: boolean;
}

export async function createGroup(params: CreateGroupParams, batch?: WriteBatch) {
  const {
    user_id,
    profile_handle,
    profile_name,
    organization_id,
    name,
    slug,
    description,
    creatingOrgGroup = false
  } = params;
  if (!batch) {
    batch = adminDB.batch();
  }
  // Create the group firestore reference based on organization or fresh id
  let groupRef;
  if (creatingOrgGroup) {
    groupRef = adminGroupRef(organization_id).doc(organization_id);
  } else {
    groupRef = adminGroupRef(organization_id).doc();
  }

  const membershipRef = adminMembershipRef(organization_id).doc(user_id);
  const memberRef = adminMemberRef(organization_id, groupRef.id).doc(user_id);
  const proposalSettingsRef = groupRef.collection("settings").doc("proposals");
  const slugRef = adminOrganizationRef().doc(organization_id).collection(SLUGS).doc(slug);

  // Create the slug document for this group
  batch.set(slugRef, { organization_id, group_id: groupRef.id });

  const groupProps: GroupProps = {
    name,
    slug,
    description,
    library_id: null,
    organization_id,
    user_id,
    profile_handle,
    member_count: 1
  };
  batch.create(groupRef, {
    ...createdTimestamps(),
    ...groupProps
  });

  const proposalSettingsProps: ProposalSettingsProps = {
    acceptance_threshold_ratio: 0.9,
    block_threshold_ratio: 0.02
  };
  batch.create(proposalSettingsRef, {
    ...createdTimestamps(),
    ...proposalSettingsProps
  });

  const membershipProps: MembershipProps = {
    user_id,
    organization_id,
    roles: {
      [groupRef.id]: "mem"
    },
    standing: "ok"
  };
  batch.set(
    membershipRef,
    {
      ...(creatingOrgGroup ? createdTimestamps() : updatedTimestamps()),
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
    role: "mem",
    name: profile_name,
    handle: profile_handle
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

  // bootstrap libraries
  const libraryRef = groupRef.collection("libraries").doc();
  const libraryProps: LibraryProps = {
    uid: libraryRef.id,
    organization_id,
    group_id: groupRef.id,
    extends_library_id: null,
    assets: {},
    docs: {},
    latest: true
  };
  batch.set(libraryRef, {
    ...createdTimestamps(),
    ...libraryProps
  });
  batch.set(groupRef.collection("libraries").doc("latest"), {
    ...createdTimestamps(),
    ...libraryProps
  });
  await batch.commit();

  return {
    group_id: groupRef.id
  };
}
