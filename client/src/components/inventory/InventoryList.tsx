import { Fragment, useState } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { Stack } from '@astryxdesign/core/Stack';
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@astryxdesign/core/Table';
import { StockLocations } from '@/components/inventory/StockLocations';
import type { InventoryList_query$key } from './__generated__/InventoryList_query.graphql';
import type { InventoryListPaginationQuery } from './__generated__/InventoryListPaginationQuery.graphql';

interface Props { queryRef: InventoryList_query$key; location: string | null; inventoryPath: (path: string) => string }
export function InventoryList({ queryRef, location, inventoryPath }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment<InventoryListPaginationQuery, InventoryList_query$key>(graphql`
    fragment InventoryList_query on RootQuery
    @argumentDefinitions(count: { type: "Int", defaultValue: 25 }, cursor: { type: "String" }, term: { type: "String" }, location: { type: "ID" })
    @refetchable(queryName: "InventoryListPaginationQuery") {
      clogStockedItems(first: $count, after: $cursor, where: { term: $term, location: $location })
      @connection(key: "InventoryList__clogStockedItems", filters: ["where"]) {
        totalCount edges { node { id name stockCount(location: $location) } }
      }
    }
  `, queryRef);
  const connection = data.clogStockedItems;
  const items = connection?.edges?.flatMap((edge) => edge?.node ? [edge.node] : []) ?? [];
  return <Stack gap={3}>
    <p>{connection?.totalCount ?? 0} stocked items</p>
    {items.length === 0 ? <p>No inventory found</p> : <Table>
      <TableHeader><TableRow><TableHeaderCell>Item / Location</TableHeaderCell><TableHeaderCell>Quantity</TableHeaderCell><TableHeaderCell>Details</TableHeaderCell></TableRow></TableHeader>
      <TableBody>{items.map((item) => <Fragment key={item.id}>
        <TableRow>
          <TableCell><Stack gap={2}>
            <Link href={inventoryPath(`/items/${encodeURIComponent(item.id)}`)}>{item.name}</Link>
            <Button children={expanded.has(item.id) ? 'Hide locations' : 'Locations'} label={`${expanded.has(item.id) ? 'Hide' : 'Show'} locations for ${item.name}`} variant="ghost" aria-expanded={expanded.has(item.id)} onClick={() => setExpanded((current) => {
              const next = new Set(current); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next;
            })} />
          </Stack></TableCell>
          <TableCell>{item.stockCount}</TableCell>
          <TableCell><Button children="Details" label={`Details for ${item.name}`} variant="ghost" href={inventoryPath(`/stock/${encodeURIComponent(item.id)}${location ? `/${encodeURIComponent(location)}` : ''}`)} /></TableCell>
        </TableRow>
        {expanded.has(item.id) && <TableRow><TableCell colSpan={3}>
          <StockLocations item={item.id} location={location} inventoryPath={inventoryPath} />
        </TableCell></TableRow>}
      </Fragment>)}</TableBody>
    </Table>}
    {error && <p role="alert">{error}</p>}
    {hasNext && <Button label="Load more stocked items" isLoading={isLoadingNext} onClick={() => {
      setError(''); loadNext(25, { onComplete: (failure) => { if (failure) setError(failure.message); } });
    }} />}
  </Stack>;
}
