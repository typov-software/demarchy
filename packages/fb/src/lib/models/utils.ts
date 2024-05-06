export interface DocumentMeta {
  id: string;
  path: string;
  created_at: Date;
  updated_at: Date;
  archived_at: Date | null;
}

export function makeDocument<T extends DocumentMeta>(d: {
  id: string;
  ref: { path: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: () => any | null;
}): T {
  const data = d.data() ?? {};
  const created = data.created_at;
  const updated = data.updated_at;
  if (!created || !updated) {
    console.debug(d.ref.path, { created, updated });
  }
  const created_at = created?.toDate();
  const updated_at = updated?.toDate();
  const archived_at = data.archived_at?.toDate() ?? null;
  return {
    ...data,
    id: d.id,
    path: d.ref.path,
    created_at,
    updated_at,
    archived_at,
  } as T;
}
