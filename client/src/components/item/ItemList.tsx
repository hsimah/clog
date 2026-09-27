import { useWorkspaceContext } from "../../app/useWorkspaceContext";
import { Text } from "@astryxdesign/core/Text";
import { useState } from "react";
import { graphql, usePaginationFragment } from "react-relay";
import { Button } from "@astryxdesign/core/Button";
import { Link } from "@astryxdesign/core/Link";
import { Stack } from "@astryxdesign/core/Stack";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@astryxdesign/core/Table";
import type { ItemList_query$key } from "./__generated__/ItemList_query.graphql";
import type { ItemListPaginationQuery } from "./__generated__/ItemListPaginationQuery.graphql";

export function ItemList({ queryRef }: { queryRef: ItemList_query$key }) {
  const { itemPath } = useWorkspaceContext();
  const { error, hasNext, isLoadingNext, connection, items, loadMore } =
    useItemList({ queryRef });
  return (
    <Stack gap={3}>
      <Text>{connection?.totalCount ?? 0} items</Text>
      {items.length === 0 ? (
        <Text>No items found</Text>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Barcode</TableHeaderCell>
              <TableHeaderCell>Stock</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link href={itemPath(item.id)}>{item.name}</Link>
                </TableCell>
                <TableCell>{item.barcode ?? "—"}</TableCell>
                <TableCell>{item.stockCount}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {error && <Text role="alert">{error}</Text>}
      {hasNext && (
        <Button
          label="Load more items"
          isLoading={isLoadingNext}
          onClick={loadMore}
        />
      )}
    </Stack>
  );
}

function useItemList({ queryRef }: { queryRef: ItemList_query$key }) {
  const [error, setError] = useState("");
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment<
    ItemListPaginationQuery,
    ItemList_query$key
  >(
    graphql`
      fragment ItemList_query on RootQuery
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "String" }
        term: { type: "String" }
      )
      @refetchable(queryName: "ItemListPaginationQuery") {
        clogItemSearch(first: $count, after: $cursor, where: { term: $term })
          @connection(key: "ItemList__clogItemSearch", filters: ["where"]) {
          totalCount
          edges {
            node {
              id
              name
              barcode
              createdAt
              stockCount
            }
          }
        }
      }
    `,
    queryRef,
  );
  const connection = data.clogItemSearch;
  const items =
    connection?.edges?.flatMap((edge) => (edge?.node ? [edge.node] : [])) ?? [];

  function loadMore() {
    setError("");
    loadNext(25, {
      onComplete: (failure) => {
        if (failure) setError(failure.message);
      },
    });
  }
  return {
    error,
    setError,
    loadNext,
    hasNext,
    isLoadingNext,
    connection,
    items,
    loadMore,
  };
}
