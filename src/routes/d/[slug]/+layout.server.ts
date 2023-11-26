import type { Organization } from '$lib/models/organizations';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, parent }) => {
  const slug = params.slug;

  const data = await parent();
  const organization = data.organizations.find((o: Organization) => o.slug === slug);

  return {
    slug,
    organization
  };
}) satisfies LayoutServerLoad;
