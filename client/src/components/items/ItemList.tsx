import { useState } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { Stack } from '@astryxdesign/core/Stack';
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@astryxdesign/core/Table';
import type { ItemList_query$key } from './__generated__/ItemList_query.graphql';
import type { ItemListPaginationQuery } from './__generated__/ItemListPaginationQuery.graphql';

export function ItemList({ queryRef }: { queryRef: ItemList_query$key }) {
  const [error, setError] = useState('');
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment<ItemListPaginationQuery, ItemList_query$key>(graphql`
    fragment ItemList_query on RootQuery
    @argumentDefinitions(count: { type: "Int", defaultValue: 25 }, cursor: { type: "String" }, term: { type: "String" })
    @refetchable(queryName: "ItemListPaginationQuery") {
      clogItemSearch(first: $count, after: $cursor, where: { term: $term })
      @connection(key: "ItemList__clogItemSearch", filters: ["where"]) {
        totalCount
        edges { node { id name barcode createdAt stockCount } }
      }
    }
  `, queryRef);
  const connection = data.clogItemSearch;
  const items = connection?.edges?.flatMap((edge) => edge?.node ? [edge.node] : []) ?? [];
  return <Stack gap={3}>
    <p>{connection?.totalCount ?? 0} items</p>
    {items.length === 0 ? <p>No items found</p> : <Table>
      <TableHeader><TableRow><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Barcode</TableHeaderCell><TableHeaderCell>Stock</TableHeaderCell><TableHeaderCell>Created</TableHeaderCell></TableRow></TableHeader>
      <TableBody>{items.map((item) => <TableRow key={item.id}>
        <TableCell><Link href={`/items/${encodeURIComponent(item.id)}`}>{item.name}</Link></TableCell>
        <TableCell>{item.barcode ?? "—"}</TableCell><TableCell>{item.stockCount}</TableCell>
        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
      </TableRow>)}</TableBody>
    </Table>}
    {error && <p role="alert">{error}</p>}
    {hasNext && <Button label="Load more items" isLoading={isLoadingNext} onClick={() => {
      setError('');
      loadNext(25, { onComplete: (failure) => { if (failure) setError(failure.message); } });
    }} />}
  </Stack>;
}
