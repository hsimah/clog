import { useMemo, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { graphql, usePaginationFragment, usePreloadedQuery, type PreloadedQuery } from 'react-relay';
import { Button } from '@astryxdesign/core/Button';
import { Stack } from '@astryxdesign/core/Stack';
import { InventoryDetails } from '@/components/inventory/InventoryDetails';
import { QueryBoundary } from '@/relay/QueryBoundary';
import { useRouteQuery } from '@/relay/useRouteQuery';
import type { InventoryRouteContext } from '@/pages/inventory/InventoryPage';
import type { StockSelectionPageQuery } from './__generated__/StockSelectionPageQuery.graphql';
import type { StockSelectionPagePaginationQuery } from './__generated__/StockSelectionPagePaginationQuery.graphql';
import type { StockSelectionPage_query$key } from './__generated__/StockSelectionPage_query.graphql';

const query = graphql`query StockSelectionPageQuery($item: ID!, $location: ID) {
  ...StockSelectionPage_query @arguments(item: $item, location: $location)
}`;
export function StockSelectionPage() {
  const { itemId = '', locationId } = useParams();
  const [revision, setRevision] = useState(0);
  const variables = useMemo(() => ({ item: itemId, location: locationId ?? null }), [itemId, locationId]);
  const reference = useRouteQuery<StockSelectionPageQuery>(query, variables, revision);
  const refresh = () => setRevision((value) => value + 1);
  return <QueryBoundary key={reference?.fetchKey ?? 'initial'} retry={refresh}>
    {reference ? <Results key={String(reference.fetchKey)} reference={reference} refresh={refresh} /> : <p role="status">Loading stock...</p>}
  </QueryBoundary>;
}
function Results({ reference, refresh }: { reference: PreloadedQuery<StockSelectionPageQuery>; refresh: () => void }) {
  const data = usePreloadedQuery<StockSelectionPageQuery>(query, reference);
  return <Selection queryRef={data} refresh={refresh} />;
}
function Selection({ queryRef, refresh }: { queryRef: StockSelectionPage_query$key; refresh: () => void }) {
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');
  const { onClose } = useOutletContext<InventoryRouteContext>();
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment<StockSelectionPagePaginationQuery, StockSelectionPage_query$key>(graphql`
    fragment StockSelectionPage_query on RootQuery
    @argumentDefinitions(count: { type: "Int", defaultValue: 25 }, cursor: { type: "String" }, item: { type: "ID!" }, location: { type: "ID" })
    @refetchable(queryName: "StockSelectionPagePaginationQuery") {
      clogInventorySearch(first: $count, after: $cursor, where: {item: $item, location: $location})
      @connection(key: "StockSelectionPage__clogInventorySearch", filters: ["where"]) {
        totalCount edges { node { id ...InventoryDetails_inventory } }
      }
    }
  `, queryRef);
  const units = data.clogInventorySearch?.edges?.flatMap((edge) => edge?.node ? [edge.node] : []) ?? [];
  const unit = units[Math.min(index, units.length - 1)];
  return <Stack gap={4}>
    {unit ? <>
      <p aria-live="polite">Unit {index + 1} of {data.clogInventorySearch?.totalCount ?? 0}</p>
      <Stack direction="horizontal" gap={2}>
        <Button label="Previous unit" variant="ghost" isDisabled={index === 0 || isLoadingNext} onClick={() => setIndex((value) => value - 1)} />
        <Button label="Next unit" variant="ghost" isLoading={isLoadingNext} isDisabled={isLoadingNext || (index + 1 >= units.length && !hasNext)} onClick={() => {
          if (index + 1 < units.length) setIndex((value) => value + 1);
          else { setError(''); loadNext(25, { onComplete: (failure) => {
            if (failure) setError(failure.message); else setIndex((value) => value + 1);
          } }); }
        }} />
      </Stack>
      <InventoryDetails key={unit.id} inventoryRef={unit} onChanged={refresh} />
    </> : <><p>No stock remains in this selection.</p><Button label="Close" variant="ghost" onClick={onClose} /></>}
    {error && <p role="alert">{error}</p>}
  </Stack>;
}
