import { Fragment, useMemo, useState } from 'react';
import { graphql, usePaginationFragment, usePreloadedQuery, type PreloadedQuery } from 'react-relay';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { Stack } from '@astryxdesign/core/Stack';
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@astryxdesign/core/Table';
import { StockUnits } from '@/components/inventory/StockUnits';
import { QueryBoundary } from '@/relay/QueryBoundary';
import { useRouteQuery } from '@/relay/useRouteQuery';
import type { StockLocationsQuery } from './__generated__/StockLocationsQuery.graphql';
import type { StockLocationsPaginationQuery } from './__generated__/StockLocationsPaginationQuery.graphql';
import type { StockLocations_query$key } from './__generated__/StockLocations_query.graphql';

interface Props { item: string; location: string | null; inventoryPath: (path: string) => string }
const query = graphql`query StockLocationsQuery($item: ID!, $location: ID!, $filtered: Boolean!) {
  ...StockLocations_query @arguments(item: $item) @skip(if: $filtered) @alias(as: "allLocations")
  clogLocation(id: $location) @include(if: $filtered) { id name stockCount(item: $item) }
}`;
export function StockLocations(props: Props) {
  const [revision, setRevision] = useState(0);
  const variables = useMemo(() => ({ item: props.item, location: props.location ?? '', filtered: !!props.location }), [props.item, props.location]);
  const reference = useRouteQuery<StockLocationsQuery>(query, variables, revision);
  return <QueryBoundary key={reference?.fetchKey ?? 'initial'} retry={() => setRevision((value) => value + 1)}>
    {reference ? <Results reference={reference} {...props} /> : <p role="status">Loading stock locations...</p>}
  </QueryBoundary>;
}
function Results({ reference, ...props }: Props & { reference: PreloadedQuery<StockLocationsQuery> }) {
  const data = usePreloadedQuery<StockLocationsQuery>(query, reference);
  return props.location ? <Rows locations={data.clogLocation ? [data.clogLocation] : []} {...props} /> : data.allLocations ? <Locations queryRef={data.allLocations} {...props} /> : null;
}
function Locations({ queryRef, ...props }: Props & { queryRef: StockLocations_query$key }) {
  const [error, setError] = useState('');
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<StockLocationsPaginationQuery, StockLocations_query$key>(graphql`
    fragment StockLocations_query on RootQuery
    @argumentDefinitions(count: { type: "Int", defaultValue: 25 }, cursor: { type: "String" }, item: { type: "ID!" })
    @refetchable(queryName: "StockLocationsPaginationQuery") {
      clogLocationSearch(first: $count, after: $cursor, where: {item: $item})
      @connection(key: "StockLocations__clogLocationSearch", filters: ["where"]) {
        totalCount edges { node { id name stockCount(item: $item) } }
      }
    }
  `, queryRef);
  const locations = data.clogLocationSearch?.edges?.flatMap((edge) => edge?.node ? [edge.node] : []) ?? [];
  return <Stack gap={2}>
    <p>{data.clogLocationSearch?.totalCount ?? 0} occupied locations</p>
    <Rows locations={locations} {...props} />
    {error && <p role="alert">{error}</p>}
    {hasNext && <Button label="More stock locations" isLoading={isLoadingNext} onClick={() => {
      setError(''); loadNext(25, { onComplete: (failure) => { if (failure) setError(failure.message); } });
    }} />}
  </Stack>;
}
function Rows({ locations, item, inventoryPath }: Props & { locations: ReadonlyArray<{ id: string; name: string; stockCount: number }> }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  return <Table>
    <TableHeader><TableRow><TableHeaderCell>Location</TableHeaderCell><TableHeaderCell>Quantity</TableHeaderCell><TableHeaderCell>Details</TableHeaderCell></TableRow></TableHeader>
    <TableBody>{locations.map((location) => <Fragment key={location.id}><TableRow>
      <TableCell><Stack gap={2}><Link href={inventoryPath(`/locations/${encodeURIComponent(location.id)}`)}>{location.name}</Link>
        <Button children={expanded.has(location.id) ? 'Hide units' : 'Units'} label={`${expanded.has(location.id) ? 'Hide' : 'Show'} units at ${location.name}`} variant="ghost" aria-expanded={expanded.has(location.id)} onClick={() => setExpanded((current) => {
          const next = new Set(current); if (next.has(location.id)) next.delete(location.id); else next.add(location.id); return next;
        })} /></Stack></TableCell>
      <TableCell>{location.stockCount}</TableCell>
      <TableCell><Button children="Details" label={`Details at ${location.name}`} variant="ghost" href={inventoryPath(`/stock/${encodeURIComponent(item)}/${encodeURIComponent(location.id)}`)} /></TableCell>
    </TableRow>
      {expanded.has(location.id) && <TableRow><TableCell colSpan={3}><StockUnits item={item} location={location.id} inventoryPath={inventoryPath} /></TableCell></TableRow>}
    </Fragment>)}</TableBody>
  </Table>;
}
