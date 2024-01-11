import type { Doc } from '$lib/models/docs';
import type { Proposal, ProposalProps } from '$lib/models/proposals';
import {
  adminDB,
  adminGroupProposalRef,
  createdTimestamps,
  updatedTimestamps
} from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Actions, PageServerLoad } from './$types';
import { makeDocument } from '$lib/models/utils';
import { error } from '@sveltejs/kit';
import { isGroupMemberOrHigher } from '$lib/server/access';
import type { Library, LibraryProps } from '$lib/models/libraries';

export const load = (async ({ params, parent }) => {
  const data = await parent();
  const proposalId = params.proposal_id;
  const proposalRef = adminGroupProposalRef(data.organization.id, data.group!.id).doc(proposalId);
  const proposalDoc = await proposalRef.get();
  const proposal = makeDocument<Proposal>(proposalDoc);
  return {
    proposal
  };
}) satisfies PageServerLoad;

async function verifyProposalDocument(proposalPath: string) {
  if (!proposalPath) {
    // ensure form has not been tampered with
    return error(403, 'unauthorized');
  }
  const proposalDoc = await adminDB.doc(proposalPath).get();
  if (!proposalDoc.exists) {
    // proposal must exist, sanity check
    return error(403, 'unauthorized');
  }
  return proposalDoc;
}

async function updateProposalState(
  proposalPath: string,
  userId: string,
  state: ProposalProps['state']
) {
  const proposalDoc = await verifyProposalDocument(proposalPath);
  const proposalData = proposalDoc.data() ?? {};
  if (proposalData.user_id !== userId) {
    // only the author can open their proposal drafts
    return error(403, 'unauthorized');
  }
  const batch = adminDB.batch();
  // update proposal state
  batch.update(proposalDoc.ref, {
    ...updatedTimestamps(),
    state
  });
  await batch.commit();
}

export const actions = {
  openProposal: async ({ request, locals }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const proposalPath = formData.get('path') as string;
    await updateProposalState(proposalPath, userId, 'open');
  },
  dropProposal: async ({ request, locals }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const proposalPath = formData.get('path') as string;
    await updateProposalState(proposalPath, userId, 'dropped');
  },
  revertToDraft: async ({ request, locals }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const proposalPath = formData.get('path') as string;
    await updateProposalState(proposalPath, userId, 'draft');
  },
  DEV_adoptProposal: async ({ request, locals, params }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const proposalPath = formData.get('path') as string;
    const organizationId = formData.get('organization_id') as string;
    const groupId = params.group_id;
    // check if user can accept proposal
    const allowed = await isGroupMemberOrHigher(organizationId, groupId, userId);
    if (!allowed) {
      return error(403, 'unauthorized');
    }
    const proposalDoc = await verifyProposalDocument(proposalPath);
    const proposal: Proposal = makeDocument(proposalDoc);
    const docsSnapshot = await proposalDoc.ref.collection('docs').get();
    const proposalDocs: Doc[] = docsSnapshot.docs.map((doc) => makeDocument(doc));
    const latestLibraryDocs = await adminDB
      .collection(`/organizations/${organizationId}/groups/${groupId}/libraries`)
      .where('latest', '==', true)
      .limit(1)
      .get();
    const latestLibraryDoc = latestLibraryDocs.docs[0];
    const latestLibrary = latestLibraryDoc ? makeDocument<Library>(latestLibraryDoc) : undefined;

    const batch = adminDB.batch();

    const nextLibraryRef = adminDB
      .collection(`/organizations/${organizationId}/groups/${groupId}/libraries`)
      .doc();
    const latestLibraryRef = adminDB
      .collection(`/organizations/${organizationId}/groups/${groupId}/libraries`)
      .doc('latest');
    const nextLibraryProps: LibraryProps = {
      extends_library_id: latestLibrary?.id ?? null,
      organization_id: organizationId,
      group_id: groupId,
      docs: {
        ...latestLibrary?.docs
      },
      assets: {
        ...latestLibrary?.assets
      },
      // Toggle latest flag on new library
      latest: true
    };

    for (const amendment of Object.values(proposal.amendments)) {
      if (amendment.type === 'create') {
        const createdDoc = proposalDocs.find((d) => d.id === amendment.doc_id);
        // TODO: this is an unexpected state error
        if (!createdDoc) continue;
        const destRef = adminDB.doc(
          `/organizations/${organizationId}/groups/${groupId}/docs/${createdDoc.id}`
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, path, created_at, updated_at, archived_at, ...copiedProps } = createdDoc;
        // Copy proposal doc to group docs
        batch.set(destRef, {
          ...copiedProps,
          ...createdTimestamps()
        });
        // Update next library doc map, with doc name to doc id
        // nextLibraryProps.docs[createdDoc.name] = createdDoc.id;
        nextLibraryProps.docs[destRef.id] = {
          id: destRef.id,
          path: destRef.path,
          name: createdDoc.name,
          updated_at: FieldValue.serverTimestamp()
        };
      } else if (amendment.type === 'destroy') {
        delete nextLibraryProps.docs[amendment.doc_id];
      }
    }

    if (latestLibraryDoc) {
      // Toggle latest flag on old library
      batch.update(latestLibraryDoc.ref, {
        ...updatedTimestamps(),
        latest: false
      });
    }
    // Create next latest libary
    batch.set(nextLibraryRef, {
      ...createdTimestamps(),
      ...nextLibraryProps
    });
    batch.set(latestLibraryRef, {
      ...createdTimestamps(),
      ...nextLibraryProps
    });
    // Update proposal state
    batch.update(proposalDoc.ref, {
      ...updatedTimestamps(),
      state: 'adopted'
    });

    await batch.commit();
  }
} satisfies Actions;
