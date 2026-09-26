import { useMemo, useState } from 'react';
import { graphql, usePaginationFragment, usePreloadedQuery, type PreloadedQuery } from 'react-relay';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Stack } from '@astryxdesign/core/Stack';
import { Button } from '@astryxdesign/core/Button';
import { QueryBoundary } from '@/relay/QueryBoundary';
import { useRouteQuery } from '@/relay/useRouteQuery';
import type { InventoryLocationsQuery } from './__generated__/InventoryLocationsQuery.graphql';
import type { InventoryLocationsPaginationQuery } from './__generated__/InventoryLocationsPaginationQuery.graphql';
import type { InventoryLocations_query$key } from './__generated__/InventoryLocations_query.graphql';

interface Props { value: string | null; onChange: (value: string) => void; revision: number }
const query = graphql`query InventoryLocationsQuery($id: ID!, $selected: Boolean!) {
  ...InventoryLocations_query
  clogLocation(id: $id) @include(if: $selected) { id name }
}`;
export function InventoryLocations(props: Props) {
  const [retry, setRetry] = useState(0);
  const variables = useMemo(() => ({ id: props.value ?? '', selected: !!props.value }), [props.value]);
  const reference = useRouteQuery<InventoryLocationsQuery>(query, variables, props.revision + retry);
  return <QueryBoundary key={reference?.fetchKey ?? 'initial'} retry={() => setRetry((value) => value + 1)}>
    {reference ? <Locations reference={reference} {...props} /> : <p role="status">Loading locations...</p>}
  </QueryBoundary>;
}
function Locations({ reference, ...props }: Props & { reference: PreloadedQuery<InventoryLocationsQuery> }) {
  const data = usePreloadedQuery<InventoryLocationsQuery>(query, reference);
  return <Tabs queryRef={data} selected={data.clogLocation} {...props} />;
}
function Tabs({ queryRef, selected, value, onChange }: Props & { queryRef: InventoryLocations_query$key; selected?: { id: string; name: string } | null }) {
  const [error, setError] = useState('');
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<InventoryLocationsPaginationQuery, InventoryLocations_query$key>(graphql`
    fragment InventoryLocations_query on RootQuery
    @argumentDefinitions(count: { type: "Int", defaultValue: 25 }, cursor: { type: "String" })
    @refetchable(queryName: "InventoryLocationsPaginationQuery") {
      clogLocationSearch(first: $count, after: $cursor) @connection(key: "InventoryLocations__clogLocationSearch") {
        edges { node { id name } }
      }
    }
  `, queryRef);
  const locations = data.clogLocationSearch?.edges?.flatMap((edge) => edge?.node ? [edge.node] : []) ?? [];
  if (selected && !locations.some((entry) => entry.id === selected.id)) locations.unshift(selected);
  return <Stack gap={2}>
    <TabList aria-label="Inventory locations" value={selected?.id ?? value ?? ''} onChange={onChange} hasDivider>
      <Tab value="" label="All locations" />
      {locations.map((location) => <Tab key={location.id} value={location.id} label={location.name} />)}
    </TabList>
    {value && !selected && <p>This location is unavailable. Select All locations to clear the filter.</p>}
    {error && <p role="alert">{error}</p>}
    {hasNext && <Button label="More locations" variant="ghost" isLoading={isLoadingNext} onClick={() => {
      setError(''); loadNext(25, { onComplete: (failure) => { if (failure) setError(failure.message); } });
    }} />}
  </Stack>;
}
