import { createGroup } from "$lib/server/group-actions";
import type { Actions } from "./$types";
import { redirect } from "@sveltejs/kit";

export const actions = {
  // Create a new group
  default: async ({ request, locals, params }) => {
    const user_id = locals.user_id!;
    const formData = await request.formData();
    const organization_id = formData.get("organization_id") as string;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const profile_name = formData.get("profile_name") as string;
    const profile_handle = formData.get("profile_handle") as string;

    await createGroup({
      user_id,
      profile_handle,
      profile_name,
      organization_id,
      name,
      slug,
      description
    });

    redirect(301, `/d/${params.slug}/${slug}`);
  }
} satisfies Actions;
