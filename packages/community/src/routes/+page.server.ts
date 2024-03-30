import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ url, locals: { getSession } }) => {
  const session = await getSession();
  if (session) {
    redirect(303, "/community");
  }
  return {
    url: url.origin
  };
}) satisfies PageServerLoad;
