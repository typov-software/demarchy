import type { Doc, DocProps } from '$lib/models/docs';
import type { Amendment, Proposal } from '$lib/models/proposals';
import { adminDB, adminGroupProposalRef } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Actions, PageServerLoad } from './$types';
import { makeDocument } from '$lib/models/utils';

export const load = (async ({ params, parent }) => {
  const data = await parent();
  const proposalId = params.proposal_id;
  const proposalRef = adminGroupProposalRef(data.organization.id, data.group!.id).doc(proposalId);
  const proposalDoc = await proposalRef.get();
  const proposal = makeDocument<Proposal>(proposalDoc);
  const docsSnapshot = await proposalRef.collection('docs').orderBy('name', 'asc').get();
  const docs: Doc[] = docsSnapshot.docs.map((doc) => makeDocument(doc));
  return {
    proposal,
    docs
  };
}) satisfies PageServerLoad;

export const actions = {
  addDoc: async ({ request, locals }) => {
    const formData = await request.formData();
    const userId = locals.user_id!;
    const userHandle = formData.get('user_handle') as string;
    const organizationId = formData.get('organization_id') as string;
    const groupId = formData.get('group_id') as string;
    const proposalId = formData.get('proposal_id') as string;

    const proposalRef = adminGroupProposalRef(organizationId, groupId).doc(proposalId);
    const docRef = proposalRef.collection('docs').doc();

    const docProps: Omit<DocProps, 'created_at' | 'updated_at'> = {
      user_id: userId,
      user_handle: userHandle,
      group_id: groupId,
      name: 'Unnamed',
      blocks: [
        {
          id: crypto.randomUUID(),
          type: 'text',
          content: ''
        }
      ]
    };
    const amendment: Amendment = {
      doc_id: docRef.id,
      doc_name: docProps.name,
      type: 'create'
    };
    const batch = adminDB.batch();
    batch.set(docRef, {
      ...docProps,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    });
    batch.set(
      proposalRef,
      {
        amendments: { [docRef.id]: amendment }
      },
      { merge: true }
    );
    await batch.commit();
  },
  updateDoc: async () => {},
  destroyDoc: async () => {}
} satisfies Actions;
