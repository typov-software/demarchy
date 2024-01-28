import type { Doc } from '$lib/models/docs';
import type { Proposal, ProposalProps } from '$lib/models/proposals';
import {
  adminDB,
  adminGroupProposalRef,
  createdTimestamps,
  updatedTimestamps
} from '$lib/server/admin';
import type { Actions, PageServerLoad } from './$types';
import { makeDocument } from '$lib/models/utils';
import { error } from '@sveltejs/kit';
import { isGroupMemberOrHigher, verifyDocument } from '$lib/server/access';
import type { Library, LibraryProps } from '$lib/models/libraries';
import type { Ballot, BallotProps, BallotTallyProps } from '$lib/models/ballots';
import { type Vote, type VoteAction, type VoteProps } from '$lib/models/votes';
import { FieldValue } from 'firebase-admin/firestore';
import { createEmptyReactions, createEmptyReinforcements } from '$lib/models/reactions';

export const load = (async ({ params, parent }) => {
  const data = await parent();
  const proposalId = params.proposal_id;
  const proposalRef = adminGroupProposalRef(data.organization.id, data.group!.id).doc(proposalId);
  const proposalDoc = await proposalRef.get();
  const proposal = makeDocument<Proposal>(proposalDoc);
  let ballot: null | Ballot = null;
  if (proposal.state === 'open') {
    const ballotDoc = await proposalRef.collection('ballots').doc('consensus').get();
    if (ballotDoc.exists) {
      ballot = makeDocument<Ballot>(ballotDoc);
    }
  }
  return {
    proposal,
    ballot
  };
}) satisfies PageServerLoad;

async function updateProposalState(
  proposalPath: string,
  userId: string,
  state: ProposalProps['state']
) {
  const proposalDoc = await verifyDocument(proposalPath, userId);
  const batch = adminDB.batch();
  // update proposal state
  batch.update(proposalDoc.ref, {
    ...updatedTimestamps(),
    state
  });
  return batch;
}

export const actions = {
  openProposal: async ({ request, params, locals }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const proposalPath = formData.get('path') as string;
    const ballotProps: BallotProps = {
      context: 'proposals',
      context_id: params.proposal_id,
      description: ''
    };
    const ballotTallyProps: BallotTallyProps = {
      accept: 0,
      reject: 0,
      abstain: 0,
      block: 0
    };
    const batch = await updateProposalState(proposalPath, userId, 'open');
    batch.set(adminDB.doc(`${proposalPath}/ballots/consensus`), {
      ...ballotProps,
      ...createdTimestamps()
    });
    batch.set(adminDB.doc(`${proposalPath}/tallies/reactions`), {
      ...createEmptyReactions(),
      ...createEmptyReinforcements(),
      ...createdTimestamps()
    });
    batch.set(adminDB.doc(`${proposalPath}/tallies/consensus`), {
      ...ballotTallyProps,
      ...createdTimestamps()
    });
    await batch.commit();
  },
  dropProposal: async ({ request, locals }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const proposalPath = formData.get('path') as string;
    const batch = await updateProposalState(proposalPath, userId, 'dropped');
    await batch.commit();
  },
  revertToDraft: async ({ request, locals }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const proposalPath = formData.get('path') as string;
    const batch = await updateProposalState(proposalPath, userId, 'draft');
    await batch.commit();
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
    const proposalDoc = await verifyDocument(proposalPath);
    const proposal: Proposal = makeDocument(proposalDoc);
    const docsSnapshot = await proposalDoc.ref.collection('docs').get();
    const proposalDocs: Doc[] = docsSnapshot.docs.map((doc) => makeDocument(doc));
    const latestLibraryRef = adminDB
      .collection(`/organizations/${organizationId}/groups/${groupId}/libraries`)
      .doc('latest');
    const latestLibraryDoc = await latestLibraryRef.get();
    const latestLibrary = latestLibraryDoc.exists
      ? makeDocument<Library>(latestLibraryDoc)
      : undefined;
    const nextLibraryRef = adminDB
      .collection(`/organizations/${organizationId}/groups/${groupId}/libraries`)
      .doc();
    const nextLibraryProps: LibraryProps = {
      uid: nextLibraryRef.id,
      extends_library_id: latestLibrary?.uid ?? null,
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

    const batch = adminDB.batch();

    for (const amendment of Object.values(proposal.amendments)) {
      if (amendment.type === 'create') {
        const createdDoc = proposalDocs.find((d) => d.id === amendment.doc.id);
        if (!createdDoc) {
          throw new Error('Unexpected proposal doc state');
        }
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
        // Update next library doc map
        nextLibraryProps.docs[amendment.doc.id] = {
          id: amendment.doc.id,
          path: destRef.path,
          name: createdDoc.name
        };
      } else if (amendment.type === 'update') {
        const update = amendment.update;
        if (!update) {
          throw new Error('Unexpected amendment state');
        }
        const createdDoc = proposalDocs.find((d) => d.id === amendment.doc.id);
        if (!createdDoc) {
          throw new Error('Unexpected proposal doc state');
        }
        // add updated doc to latest library
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
        // Update next library doc map
        nextLibraryProps.docs[amendment.doc.id] = {
          id: amendment.doc.id,
          path: destRef.path,
          name: createdDoc.name
        };
        // remove source doc from latest library
        delete nextLibraryProps.docs[update.doc.id];
      } else if (amendment.type === 'destroy') {
        delete nextLibraryProps.docs[amendment.doc.id];
      }
    }

    if (latestLibraryDoc.exists) {
      // Toggle latest flag on old library
      const lastRef = adminDB
        .collection(`/organizations/${organizationId}/groups/${groupId}/libraries`)
        .doc(latestLibrary!.uid);
      batch.update(lastRef, {
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
  },

  vote: async ({ request, locals }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const ballotPath = formData.get('path') as string;
    const contextPath = formData.get('context_path') as string;
    const action = formData.get('action') as VoteAction;

    const ballotDoc = await verifyDocument(ballotPath);
    const ballot = makeDocument<Ballot>(ballotDoc);
    const voteRef = adminDB.doc(`${ballotPath}/votes/${userId}`);
    const tallyRef = adminDB.doc(`${contextPath}/tallies/consensus`);

    const batch = adminDB.batch();
    const voteProps: VoteProps = {
      context: ballot.context,
      context_id: ballot.context_id,
      user_id: userId,
      action
    };
    const voteDoc = await voteRef.get();
    if (voteDoc.exists) {
      const prevVote = makeDocument<Vote>(voteDoc);
      if (prevVote.action !== action) {
        batch.update(voteRef, {
          ...voteProps,
          ...updatedTimestamps()
        });
        batch.update(tallyRef, {
          [prevVote.action]: FieldValue.increment(-1),
          [action]: FieldValue.increment(1),
          ...updatedTimestamps()
        });
      }
    } else {
      // Using "create" here will throw an error is the vote already exists, preventing double voting
      batch.create(voteRef, {
        ...voteProps,
        ...createdTimestamps()
      });
      batch.update(tallyRef, {
        [action]: FieldValue.increment(1),
        ...updatedTimestamps()
      });
    }
    await batch.commit();
  }
} satisfies Actions;
