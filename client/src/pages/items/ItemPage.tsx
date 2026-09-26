import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { graphql, usePreloadedQuery, type PreloadedQuery } from 'react-relay';
import { ItemDetails } from '@/components/items/ItemDetails';
import { ItemForm } from '@/components/items/ItemForm';
import { QueryBoundary } from '@/relay/QueryBoundary';
import { useRouteQuery } from '@/relay/useRouteQuery';
import type { ItemPageQuery } from './__generated__/ItemPageQuery.graphql';

const query = graphql`
  query ItemPageQuery($id: ID!) {
    clogItem(id: $id) { id ...ItemDetails_item ...ItemForm_item }
  }
`;
export function ItemPage() { return <ItemRoute edit={false} />; }
export function EditItemPage() { return <ItemRoute edit />; }
function ItemRoute({ edit }: { edit: boolean }) {
  const { id = '' } = useParams();
  const [revision, setRevision] = useState(0);
  const variables = useMemo(() => ({ id }), [id]);
  const reference = useRouteQuery<ItemPageQuery>(query, variables, revision);
  return <QueryBoundary key={reference?.fetchKey ?? "initial"} retry={() => setRevision((value) => value + 1)}>
    {reference ? <Detail reference={reference} edit={edit} /> : <p role="status">Loading...</p>}
  </QueryBoundary>;
}
function Detail({ reference, edit }: { reference: PreloadedQuery<ItemPageQuery>; edit: boolean }) {
  const { clogItem } = usePreloadedQuery<ItemPageQuery>(query, reference);
  if (!clogItem) return <p>Item not found</p>;
  return edit ? <ItemForm key={clogItem.id} itemRef={clogItem} /> : <ItemDetails itemRef={clogItem} />;
}
