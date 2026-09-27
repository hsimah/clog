import { useWorkspaceContext } from "../../app/useWorkspaceContext";
import { Text } from "@astryxdesign/core/Text";
import { Fragment, useState } from "react";
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
import { StockLocations } from "../stock/StockLocations";
import type { InventoryList_query$key } from "./__generated__/InventoryList_query.graphql";
import type { InventoryListPaginationQuery } from "./__generated__/InventoryListPaginationQuery.graphql";

export function InventoryList({ queryRef, location }: Props) {
  const { itemPath, stockPath } = useWorkspaceContext();
  const {
    expanded,
    toggleExpanded,
    error,
    hasNext,
    isLoadingNext,
    connection,
    items,
    loadMore,
  } = useInventoryList({ queryRef });
  return (
    <Stack gap={3}>
      <Text>{connection?.totalCount ?? 0} stocked items</Text>
      {items.length === 0 ? (
        <Text>No inventory found</Text>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Item / Location</TableHeaderCell>
              <TableHeaderCell>Quantity</TableHeaderCell>
              <TableHeaderCell>Details</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <Fragment key={item.id}>
                <TableRow>
                  <TableCell>
                    <Stack gap={2}>
                      <Link href={itemPath(item.id)}>{item.name}</Link>
                      <Button
                        children={
                          expanded.has(item.id) ? "Hide locations" : "Locations"
                        }
                        label={`${expanded.has(item.id) ? "Hide" : "Show"} locations for ${item.name}`}
                        variant="ghost"
                        aria-expanded={expanded.has(item.id)}
                        onClick={() => toggleExpanded(item.id)}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell>{item.stockCount}</TableCell>
                  <TableCell>
                    <Button
                      children="Details"
                      label={`Details for ${item.name}`}
                      variant="ghost"
                      href={stockPath(item.id, location)}
                    />
                  </TableCell>
                </TableRow>
                {expanded.has(item.id) && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <StockLocations item={item.id} location={location} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      )}
      {error && <Text role="alert">{error}</Text>}
      {hasNext && (
        <Button
          label="Load more stocked items"
          isLoading={isLoadingNext}
          onClick={loadMore}
        />
      )}
    </Stack>
  );
}

interface Props {
  queryRef: InventoryList_query$key;
  location: string | null;
}

function useInventoryList({ queryRef }: Pick<Props, "queryRef">) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment<
    InventoryListPaginationQuery,
    InventoryList_query$key
  >(
    graphql`
      fragment InventoryList_query on RootQuery
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "String" }
        term: { type: "String" }
        location: { type: "ID" }
      )
      @refetchable(queryName: "InventoryListPaginationQuery") {
        clogStockedItems(
          first: $count
          after: $cursor
          where: { term: $term, location: $location }
        )
          @connection(
            key: "InventoryList__clogStockedItems"
            filters: ["where"]
          ) {
          totalCount
          edges {
            node {
              id
              name
              stockCount(location: $location)
            }
          }
        }
      }
    `,
    queryRef,
  );
  const connection = data.clogStockedItems;
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
  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  return {
    expanded,
    toggleExpanded,
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
