import { useMemo, useState } from 'react';
import { graphql, usePaginationFragment, usePreloadedQuery, type PreloadedQuery } from 'react-relay';
import { Button } from '@astryxdesign/core/Button';
import { Stack } from '@astryxdesign/core/Stack';
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@astryxdesign/core/Table';
import { QueryBoundary } from '@/relay/QueryBoundary';
import { useRouteQuery } from '@/relay/useRouteQuery';
import type { StockUnitsQuery } from './__generated__/StockUnitsQuery.graphql';
import type { StockUnitsPaginationQuery } from './__generated__/StockUnitsPaginationQuery.graphql';
import type { StockUnits_query$key } from './__generated__/StockUnits_query.graphql';

interface Props { item: string; location: string; inventoryPath: (path: string) => string }
const query = graphql`query StockUnitsQuery($item: ID!, $location: ID!) { ...StockUnits_query @arguments(item: $item, location: $location) }`;
export function StockUnits(props: Props) {
  const [revision, setRevision] = useState(0);
  const variables = useMemo(() => ({ item: props.item, location: props.location }), [props.item, props.location]);
  const reference = useRouteQuery<StockUnitsQuery>(query, variables, revision);
  return <QueryBoundary key={reference?.fetchKey ?? 'initial'} retry={() => setRevision((value) => value + 1)}>
    {reference ? <Results reference={reference} {...props} /> : <p role="status">Loading units...</p>}
  </QueryBoundary>;
}
function Results({ reference, ...props }: Props & { reference: PreloadedQuery<StockUnitsQuery> }) {
  const data = usePreloadedQuery<StockUnitsQuery>(query, reference);
  return <Units queryRef={data} {...props} />;
}
function Units({ queryRef, inventoryPath }: Props & { queryRef: StockUnits_query$key }) {
  const [error, setError] = useState('');
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<StockUnitsPaginationQuery, StockUnits_query$key>(graphql`
    fragment StockUnits_query on RootQuery
    @argumentDefinitions(count: { type: "Int", defaultValue: 25 }, cursor: { type: "String" }, item: { type: "ID!" }, location: { type: "ID!" })
    @refetchable(queryName: "StockUnitsPaginationQuery") {
      clogInventorySearch(first: $count, after: $cursor, where: {item: $item, location: $location})
      @connection(key: "StockUnits__clogInventorySearch", filters: ["where"]) {
        totalCount edges { node { id dateAdded } }
      }
    }
  `, queryRef);
  const units = data.clogInventorySearch?.edges?.flatMap((edge) => edge?.node ? [edge.node] : []) ?? [];
  return <Stack gap={2}>
    <p>{data.clogInventorySearch?.totalCount ?? 0} physical units</p>
    <Table aria-label="Physical stock units">
      <TableHeader><TableRow><TableHeaderCell>Date Added</TableHeaderCell><TableHeaderCell>Quantity</TableHeaderCell><TableHeaderCell>Details</TableHeaderCell></TableRow></TableHeader>
      <TableBody>{units.map((unit, index) => <TableRow key={unit.id}>
        <TableCell>{new Date(unit.dateAdded).toLocaleDateString()}</TableCell><TableCell>1</TableCell>
        <TableCell><Button children="Details" label={`Details for unit ${index + 1}`} variant="ghost" href={inventoryPath(`/${encodeURIComponent(unit.id)}`)} /></TableCell>
      </TableRow>)}</TableBody>
    </Table>
    {error && <p role="alert">{error}</p>}
    {hasNext && <Button label="Load more stock units" isLoading={isLoadingNext} onClick={() => {
      setError(''); loadNext(25, { onComplete: (failure) => { if (failure) setError(failure.message); } });
    }} />}
  </Stack>;
}
