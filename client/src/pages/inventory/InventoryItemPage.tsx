import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { graphql, usePreloadedQuery, type PreloadedQuery } from 'react-relay';
import { InventoryDetails } from '@/components/inventory/InventoryDetails';
import { InventoryForm } from '@/components/inventory/InventoryForm';
import { QueryBoundary } from '@/relay/QueryBoundary';
import { useRouteQuery } from '@/relay/useRouteQuery';
import type { InventoryItemPageQuery } from './__generated__/InventoryItemPageQuery.graphql';

const query = graphql`
  query InventoryItemPageQuery($id: ID!) {
    clogInventory(id: $id) { id ...InventoryDetails_inventory ...InventoryForm_inventory }
  }
`;
export function InventoryItemPage() { return <InventoryRoute edit={false} />; }
export function EditInventoryPage() { return <InventoryRoute edit />; }
function InventoryRoute({ edit }: { edit: boolean }) {
  const { id = '' } = useParams();
  const [revision, setRevision] = useState(0);
  const variables = useMemo(() => ({ id }), [id]);
  const reference = useRouteQuery<InventoryItemPageQuery>(query, variables, revision);
  return <QueryBoundary key={reference?.fetchKey ?? "initial"} retry={() => setRevision((value) => value + 1)}>
    {reference ? <Detail reference={reference} edit={edit} /> : <p role="status">Loading...</p>}
  </QueryBoundary>;
}
function Detail({ reference, edit }: { reference: PreloadedQuery<InventoryItemPageQuery>; edit: boolean }) {
  const { clogInventory } = usePreloadedQuery<InventoryItemPageQuery>(query, reference);
  if (!clogInventory) return <p>Inventory not found</p>;
  return edit ? <InventoryForm key={clogInventory.id} inventoryRef={clogInventory} /> : <InventoryDetails inventoryRef={clogInventory} />;
}
