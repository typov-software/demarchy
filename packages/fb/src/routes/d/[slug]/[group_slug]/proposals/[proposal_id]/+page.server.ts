import uniq from 'lodash/uniq';
import type { Doc, DocProps } from '$lib/models/docs';
import type { Amendment, Proposal, ProposalProps } from '$lib/models/proposals';
import {
  adminDB,
  adminGroupProposalRef,
  adminGroupRef,
  createdTimestamps,
  updatedTimestamps,
} from '$lib/server/admin';
import type { Actions, PageServerLoad } from './$types';
import { makeDocument } from '$lib/models/utils';
import { error, redirect } from '@sveltejs/kit';
import { isGroupMemberOrHigher, verifyDocument } from '$lib/server/access';
import type { Library, LibraryProps } from '$lib/models/libraries';
import {
  type Ballot,
  type BallotProps,
  type BallotTally,
  type BallotTallyProps,
} from '$lib/models/ballots';
import { type Vote, type VoteAction, type VoteProps } from '$lib/models/votes';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { createEmptyReactions, createEmptyReinforcements } from '$lib/models/reactions';
import type { Group } from '$lib/models/groups';
import type { ProposalSettings } from '$lib/models/settings';
import { DOCS, LIBRARIES } from '$lib/models/firestore';

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

  let library: null | Library = null;
  const libraryDoc = await adminGroupRef(data.organization.id)
    .doc(data.group.id)
    .collection(LIBRARIES)
    .doc(proposal.library_id)
    .get();
  if (libraryDoc.exists) {
    library = makeDocument<Library>(libraryDoc);
  }

  return {
    proposal,
    ballot,
    library,
  };
}) satisfies PageServerLoad;

async function updateProposalState(
  proposalPath: string,
  userId: string,
  state: ProposalProps['state'],
) {
  const proposalDoc = await verifyDocument(proposalPath, userId);
  const batch = adminDB.batch();
  // update proposal state
  batch.update(proposalDoc.ref, {
    ...updatedTimestamps(),
    state,
  });
  return batch;
}

async function acceptProposal(
  userId: string,
  proposalPath: string,
  organizationId: string,
  groupId: string,
) {
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
      ...latestLibrary?.docs,
    },
    assets: {
      ...latestLibrary?.assets,
    },
    // Toggle latest flag on new library
    latest: true,
  };

  const batch = adminDB.batch();

  for (const amendment of Object.values(proposal.amendments)) {
    if (amendment.type === 'create') {
      const createdDoc = proposalDocs.find((d) => d.id === amendment.doc.id);
      if (!createdDoc) {
        throw new Error('Unexpected proposal doc state');
      }
      const destRef = adminDB.doc(
        `/organizations/${organizationId}/groups/${groupId}/docs/${createdDoc.id}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, path, created_at, updated_at, archived_at, ...copiedProps } = createdDoc;
      // Copy proposal doc to group docs
      batch.set(destRef, {
        ...copiedProps,
        ...createdTimestamps(),
      });
      // Update next library doc map
      nextLibraryProps.docs[amendment.doc.name] = {
        id: amendment.doc.id,
        path: destRef.path,
        name: createdDoc.name,
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
        `/organizations/${organizationId}/groups/${groupId}/docs/${createdDoc.id}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, path, created_at, updated_at, archived_at, ...copiedProps } = createdDoc;
      // Copy proposal doc to group docs
      batch.set(destRef, {
        ...copiedProps,
        ...createdTimestamps(),
      });
      // Update next library doc map
      nextLibraryProps.docs[amendment.doc.name] = {
        id: amendment.doc.id,
        path: destRef.path,
        name: createdDoc.name,
      };
    } else if (amendment.type === 'destroy') {
      delete nextLibraryProps.docs[amendment.doc.name];
    }
  }

  if (latestLibraryDoc.exists) {
    // Toggle latest flag on old library
    const lastRef = adminDB
      .collection(`/organizations/${organizationId}/groups/${groupId}/libraries`)
      .doc(latestLibrary!.uid);
    batch.update(lastRef, {
      ...updatedTimestamps(),
      latest: false,
    });
  }
  // Create next latest libary
  batch.set(nextLibraryRef, {
    ...createdTimestamps(),
    ...nextLibraryProps,
  });
  batch.set(latestLibraryRef, {
    ...createdTimestamps(),
    ...nextLibraryProps,
  });
  // Update proposal state
  batch.update(proposalDoc.ref, {
    ...updatedTimestamps(),
    state: 'adopted',
  });

  await batch.commit();
}

export const actions = {
  addDoc: async ({ request, params, locals }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const name = formData.get('name') as string;
    const profile_handle = formData.get('profile_handle') as string;
    const organization_id = formData.get('organization_id') as string;
    const group_id = formData.get('group_id') as string;
    const docProps: DocProps = {
      extends_doc_id: null,
      contributors: [profile_handle],
      user_id: userId,
      profile_handle: profile_handle,
      organization_id,
      group_id,
      name,
      blocks: [
        {
          uid: crypto.randomUUID(),
          type: 'text',
          content: '',
        },
      ],
    };
    const proposalRef = adminGroupProposalRef(organization_id, group_id).doc(params.proposal_id);
    const docRef = proposalRef.collection(DOCS).doc();
    const amendment: Amendment = {
      doc: {
        id: docRef.id,
        path: docRef.path,
        name,
      },
      type: 'create',
    };
    const proposalProps: Partial<ProposalProps> = {
      amendments: { [docProps.name]: amendment },
    };
    const batch = adminDB.batch();
    batch.set(
      proposalRef,
      {
        ...updatedTimestamps(),
        ...proposalProps,
      },
      { merge: true },
    );
    batch.set(docRef, {
      ...createdTimestamps(),
      ...docProps,
    });
    await batch.commit();
    redirect(301, `?doc_name=${docProps.name}&doc_id=${amendment.doc.id}`);
  },
  removeAmendment: async ({ request, locals }) => {
    const userId = locals.user_id!;
    const formData = await request.formData();
    const path = formData.get('path') as string;
    const docName = formData.get('doc_name') as string;
    await adminDB.runTransaction(async (tx): Promise<void> => {
      const proposalDoc = await tx.get(adminDB.doc(path));
      const proposal = makeDocument<Proposal>(proposalDoc);
      if (!proposalDoc.exists || proposal.user_id !== userId) {
        error(401, 'unauthorized');
      }
      const amendment = proposal.amendments[docName];
      if (amendment.type === 'create' || amendment.type === 'update') {
        tx.delete(adminDB.doc(amendment.doc.path));
      }
      delete proposal.amendments[docName];
      tx.update(adminDB.doc(path), {
        ...updatedTimestamps(),
        ...proposal,
      });
    });
  },
  editDoc: async ({ request, locals }) => {
    const formData = await request.formData();
    const user_id = locals.user_id!;
    const profile_handle = formData.get('profile_handle') as string;
    const proposal_path = formData.get('proposal_path') as string;
    const source_path = formData.get('doc_path') as string;
    const proposalDoc = await adminDB.doc(proposal_path).get();
    const sourceDoc = await adminDB.doc(source_path).get();
    if (!sourceDoc.exists || !proposalDoc.exists) {
      error(401, 'unauthorized');
    }
    const proposal = makeDocument<Proposal>(proposalDoc);
    if (proposal.user_id !== user_id) {
      error(401, 'unauthorized');
    }
    const source = makeDocument<Doc>(sourceDoc);
    const proposedDocRef = proposalDoc.ref.collection('docs').doc();
    const proposedProps: DocProps = {
      extends_doc_id: source.id,
      user_id,
      contributors: uniq([...source.contributors, profile_handle]),
      organization_id: source.organization_id,
      group_id: source.group_id,
      profile_handle,
      name: source.name,
      blocks: source.blocks,
    };
    const amendment: Amendment = {
      type: 'update',
      doc: {
        id: proposedDocRef.id,
        name: source.name,
        path: proposedDocRef.path,
      },
      update: {
        doc: {
          id: source.id,
          name: source.name,
          path: source.path,
        },
      },
    };
    const proposalProps: Partial<ProposalProps> = {
      amendments: { [amendment.doc.name]: amendment },
    };
    const batch = adminDB.batch();
    batch.set(proposedDocRef, {
      ...createdTimestamps(),
      ...proposedProps,
      created_at: Timestamp.fromDate(source.created_at),
    });
    batch.set(
      proposalDoc.ref,
      {
        ...updatedTimestamps(),
        ...proposalProps,
      },
      { merge: true },
    );
    await batch.commit();
    redirect(301, `?doc_name=${source.name}&doc_id=${amendment.doc.id}`);
  },
  destroyDoc: async ({ request, locals }) => {
    const formData = await request.formData();
    const user_id = locals.user_id!;
    const proposal_path = formData.get('proposal_path') as string;
    const source_path = formData.get('doc_path') as string;
    const proposalDoc = await adminDB.doc(proposal_path).get();
    const sourceDoc = await adminDB.doc(source_path).get();
    if (!sourceDoc.exists || !proposalDoc.exists) {
      error(401, 'unauthorized');
    }
    const proposal = makeDocument<Proposal>(proposalDoc);
    if (proposal.user_id !== user_id) {
      error(401, 'unauthorized');
    }
    const source = makeDocument<Doc>(sourceDoc);
    const amendment: Amendment = {
      doc: {
        id: source.id,
        name: source.name,
        path: source.path,
      },
      type: 'destroy',
    };
    const proposalProps: Partial<ProposalProps> = {
      amendments: { [source.name]: amendment },
    };
    const batch = adminDB.batch();
    batch.set(
      proposalDoc.ref,
      {
        ...updatedTimestamps(),
        ...proposalProps,
      },
      { merge: true },
    );
    await batch.commit();
    redirect(301, `?doc_name=${source.name}&doc_id=${source.id}`);
  },
  openProposal: async ({ request, params, locals }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const organization_id = formData.get('organization_id') as string;
    const group_id = formData.get('group_id') as string;
    const proposalPath = formData.get('path') as string;
    const ballotProps: BallotProps = {
      organization_id,
      group_id,
      context: 'proposals',
      context_id: params.proposal_id,
      description: '',
      state: 'open',
    };
    const ballotTallyProps: BallotTallyProps = {
      accept: 0,
      reject: 0,
      abstain: 0,
      block: 0,
    };
    const batch = await updateProposalState(proposalPath, userId, 'open');
    batch.set(adminDB.doc(`${proposalPath}/ballots/consensus`), {
      ...ballotProps,
      ...createdTimestamps(),
    });
    batch.set(adminDB.doc(`${proposalPath}/tallies/reactions`), {
      ...createEmptyReactions(),
      ...createEmptyReinforcements(),
      ...createdTimestamps(),
    });
    batch.set(adminDB.doc(`${proposalPath}/tallies/consensus`), {
      ...ballotTallyProps,
      ...createdTimestamps(),
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
  adoptProposal: async ({ request, locals }) => {
    // Once the ballot has surpassed acceptance thresholds, the proposal author
    // and group mods can manually adopt the proposal and accept changes.
    const formData = await request.formData();
    const userId = locals.user_id!;
    const proposalPath = formData.get('path') as string;
    const ballotId = formData.get('ballot_id') as string;
    const organizationId = formData.get('organization_id') as string;
    const groupId = formData.get('group_id') as string;
    const ballotPath = `${proposalPath}/ballots/${ballotId}`;

    const ballotRef = adminDB.doc(ballotPath);
    const tallyRef = adminDB.doc(`${proposalPath}/tallies/consensus`);
    const groupRef = adminGroupRef(organizationId).doc(groupId);
    const proposalSettingsRef = groupRef.collection('settings').doc('proposals');

    let adoptProposal = false;
    try {
      await adminDB.runTransaction(async (tx) => {
        const groupDoc = await tx.get(groupRef);
        const tallyDoc = await tx.get(tallyRef);
        const ballotDoc = await tx.get(ballotRef);
        const ballot = makeDocument<Ballot>(ballotDoc);
        const group = makeDocument<Group>(groupDoc);
        const tally = makeDocument<BallotTally>(tallyDoc);
        if (ballot.state !== 'open') {
          return;
        }
        if (tally.accept >= Math.floor(group.member_count / 2)) {
          // we're at least halfway, let's check the group settings
          const proposalSettingsDoc = await tx.get(proposalSettingsRef);
          const proposalSettings = makeDocument<ProposalSettings>(proposalSettingsDoc);
          const accepted = tally.accept / group.member_count;
          const blocked = tally.block / group.member_count;
          if (blocked >= proposalSettings.block_threshold_ratio) {
            error(401, 'unauthorized');
          }
          if (accepted >= proposalSettings.acceptance_threshold_ratio) {
            adoptProposal = true;
            tx.update(ballotDoc.ref, { state: 'closed' });
          }
        }
      });
    } catch (e) {
      console.error('Transaction failed', e);
    }
    if (adoptProposal) {
      await acceptProposal(userId, proposalPath, organizationId, groupId);
    } else {
      console.debug('Proposal not ready');
    }
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
      action,
    };
    const voteDoc = await voteRef.get();
    if (voteDoc.exists) {
      const prevVote = makeDocument<Vote>(voteDoc);
      if (prevVote.action !== action) {
        batch.update(voteRef, {
          ...voteProps,
          ...updatedTimestamps(),
        });
        batch.update(tallyRef, {
          [prevVote.action]: FieldValue.increment(-1),
          [action]: FieldValue.increment(1),
          ...updatedTimestamps(),
        });
      }
    } else {
      // Using "create" here will throw an error is the vote already exists, preventing double voting
      batch.create(voteRef, {
        ...voteProps,
        ...createdTimestamps(),
      });
      batch.update(tallyRef, {
        [action]: FieldValue.increment(1),
        ...updatedTimestamps(),
      });
    }
    await batch.commit();
  },
  updateProposal: async ({ request, locals }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const path = formData.get('path') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const proposalDoc = await adminDB.doc(path).get();
    const proposal = makeDocument<Proposal>(proposalDoc);
    if (!proposalDoc.exists || proposal.user_id !== user_id) {
      error(401, 'unauthorized');
    }
    await proposalDoc.ref.update({
      ...updatedTimestamps(),
      title,
      description,
    });
  },
} satisfies Actions;
