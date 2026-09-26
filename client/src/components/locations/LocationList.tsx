import { useState } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { Stack } from '@astryxdesign/core/Stack';
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@astryxdesign/core/Table';
import type { LocationList_query$key } from './__generated__/LocationList_query.graphql';
import type { LocationListPaginationQuery } from './__generated__/LocationListPaginationQuery.graphql';

export function LocationList({ queryRef }: { queryRef: LocationList_query$key }) {
  const [error, setError] = useState('');
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment<LocationListPaginationQuery, LocationList_query$key>(graphql`
    fragment LocationList_query on RootQuery
    @argumentDefinitions(count: { type: "Int", defaultValue: 25 }, cursor: { type: "String" }, term: { type: "String" })
    @refetchable(queryName: "LocationListPaginationQuery") {
      clogLocationSearch(first: $count, after: $cursor, where: { term: $term })
      @connection(key: "LocationList__clogLocationSearch", filters: ["where"]) {
        totalCount
        edges { node { id name createdAt stockCount } }
      }
    }
  `, queryRef);
  const connection = data.clogLocationSearch;
  const locations = connection?.edges?.flatMap((edge) => edge?.node ? [edge.node] : []) ?? [];
  return <Stack gap={3}>
    <p>{connection?.totalCount ?? 0} locations</p>
    {locations.length === 0 ? <p>No locations found</p> : <Table>
      <TableHeader><TableRow><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Stock</TableHeaderCell><TableHeaderCell>Created</TableHeaderCell></TableRow></TableHeader>
      <TableBody>{locations.map((location) => <TableRow key={location.id}>
        <TableCell><Link href={`/locations/${encodeURIComponent(location.id)}`}>{location.name}</Link></TableCell>
        <TableCell>{location.stockCount}</TableCell>
        <TableCell>{new Date(location.createdAt).toLocaleDateString()}</TableCell>
      </TableRow>)}</TableBody>
    </Table>}
    {error && <p role="alert">{error}</p>}
    {hasNext && <Button label="Load more locations" isLoading={isLoadingNext} onClick={() => {
      setError('');
      loadNext(25, { onComplete: (failure) => { if (failure) setError(failure.message); } });
    }} />}
  </Stack>;
}
