create or replace function match_communities (
    query_embedding vector(384),
    match_threshold float,
    match_count int
  ) returns table (
    id bigint,
    name varchar,
    slug varchar,
    headline varchar,
    similarity float
  ) language sql stable as $$
select communities.id,
  communities.name,
  communities.slug,
  communities.headline,
  1 - (communities.embedding_small <=> query_embedding) as similarity
from communities
where communities.embedding_small <=> query_embedding < 1 - match_threshold
order by communities.embedding_small <=> query_embedding
limit match_count;
$$;