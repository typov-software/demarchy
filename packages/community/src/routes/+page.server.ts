import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase } }) => {
	const { data: communities, error } = await supabase.from('communities').select('*');
	if (error) {
		console.error(error);
	}
	console.log(communities);
	return {
		communities
	};
}) satisfies PageServerLoad;

export const actions = {
	createCommunity: async () => {
		//
	}
} satisfies Actions;
