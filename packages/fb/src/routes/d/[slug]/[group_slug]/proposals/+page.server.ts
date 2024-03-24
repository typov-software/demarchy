import { adminDB, adminGroupProposalRef, createdTimestamps } from "$lib/server/admin";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { Proposal, ProposalProps } from "$lib/models/proposals";
import { makeDocument } from "$lib/models/utils";
import type { Library, LibraryProps } from "$lib/models/libraries";

export const load = (async ({ locals, parent }) => {
  const user_id = locals.user_id!;

  const data = await parent();
  const groupId = data.group.id;

  // get user draft proposals and open group proposals
  const draftSnap = await adminGroupProposalRef(data.organization.id, groupId)
    .where("user_id", "==", user_id)
    .where("state", "==", "draft")
    .orderBy("updated_at", "desc")
    .get();
  const drafts: Proposal[] = draftSnap.docs.map((doc) => makeDocument(doc));

  const openSnap = await adminGroupProposalRef(data.organization.id, groupId)
    .where("state", "==", "open")
    .orderBy("updated_at", "desc")
    .get();
  const open: Proposal[] = openSnap.docs.map((doc) => makeDocument(doc));

  const adoptedSnap = await adminGroupProposalRef(data.organization.id, groupId)
    .where("state", "==", "adopted")
    .orderBy("updated_at", "desc")
    .get();
  const adopted: Proposal[] = adoptedSnap.docs.map((doc) => makeDocument(doc));

  return {
    drafts,
    open,
    adopted
  };
}) satisfies PageServerLoad;

export const actions = {
  createProposal: async ({ request, params, locals }) => {
    const formData = await request.formData();
    const user_id = locals.user_id!;
    const profile_handle = formData.get("profile_handle") as string;
    const organization_id = formData.get("organization_id") as string;
    const group_id = formData.get("group_id") as string;
    const latestLibraryRef = adminDB
      .collection(`/organizations/${organization_id}/groups/${group_id}/libraries`)
      .doc("latest");
    const latestLibraryDoc = await latestLibraryRef.get();
    const latestLibrary = latestLibraryDoc.exists
      ? makeDocument<Library>(latestLibraryDoc)
      : undefined;

    const props: Omit<ProposalProps, "created_at" | "updated_at"> = {
      user_id,
      profile_handle: profile_handle,
      group_id,
      state: "draft",
      title: `Unnamed proposal by @${profile_handle}`,
      description: "",
      library_id: latestLibrary?.uid ?? "latest",
      amendments: {},
      links: {}
    };
    const proposalRef = adminGroupProposalRef(organization_id, group_id).doc();

    // Create the candidate library that this proposal uses for its final output
    const proposalLibraryRef = proposalRef.collection("libraries").doc("proposal");
    const proposalLibraryProps: LibraryProps = {
      uid: proposalLibraryRef.id,
      extends_library_id: latestLibrary?.uid ?? null,
      organization_id,
      group_id,
      docs: {
        ...latestLibrary?.docs
      },
      assets: {
        ...latestLibrary?.assets
      },
      latest: false
    };

    const batch = adminDB.batch();
    batch.set(proposalRef, {
      ...createdTimestamps(),
      ...props
    });
    batch.set(proposalLibraryRef, {
      ...createdTimestamps(),
      ...proposalLibraryProps
    });
    await batch.commit();

    redirect(301, `/d/${params.slug}/${params.group_slug}/proposals/${proposalRef.id}`);
  }
} satisfies Actions;
