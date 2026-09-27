import { useWorkspaceContext } from "../../app/useWorkspaceContext";
import { Text } from "@astryxdesign/core/Text";
import { useMemo, useState } from "react";
import {
  graphql,
  usePaginationFragment,
  usePreloadedQuery,
  type PreloadedQuery,
} from "react-relay";
import { Button } from "@astryxdesign/core/Button";
import { Stack } from "@astryxdesign/core/Stack";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@astryxdesign/core/Table";
import { QueryBoundary } from "../../relay/QueryBoundary";
import { useRouteQuery } from "../../relay/useRouteQuery";
import type { StockUnitsQuery } from "./__generated__/StockUnitsQuery.graphql";
import type { StockUnitsPaginationQuery } from "./__generated__/StockUnitsPaginationQuery.graphql";
import type { StockUnits_query$key } from "./__generated__/StockUnits_query.graphql";

const QUERY = graphql`
  query StockUnitsQuery($item: ID!, $location: ID!) {
    ...StockUnits_query @arguments(item: $item, location: $location)
  }
`;

export function StockUnits(props: Props) {
  const [revision, setRevision] = useState(0);
  const variables = useMemo(
    () => ({ item: props.item, location: props.location }),
    [props.item, props.location],
  );
  const reference = useRouteQuery<StockUnitsQuery>(QUERY, variables, revision);
  return (
    <QueryBoundary
      key={reference?.fetchKey ?? "initial"}
      retry={() => setRevision((value) => value + 1)}
    >
      {reference ? (
        <StockUnits_Results reference={reference} {...props} />
      ) : (
        <Text role="status">Loading units...</Text>
      )}
    </QueryBoundary>
  );
}

interface Props {
  item: string;
  location: string;
}

function StockUnits_Results({
  reference,
  ...props
}: Props & { reference: PreloadedQuery<StockUnitsQuery> }) {
  const data = usePreloadedQuery<StockUnitsQuery>(QUERY, reference);
  return <StockUnits_Units queryRef={data} {...props} />;
}

function StockUnits_Units({
  queryRef,
}: Props & { queryRef: StockUnits_query$key }) {
  const { inventoryRecordPath } = useWorkspaceContext();
  const { error, data, hasNext, isLoadingNext, units, loadMore } =
    useStockUnitsUnits({ queryRef });
  return (
    <Stack gap={2}>
      <Text>{data.clogInventorySearch?.totalCount ?? 0} physical units</Text>
      <Table aria-label="Physical stock units">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Date Added</TableHeaderCell>
            <TableHeaderCell>Quantity</TableHeaderCell>
            <TableHeaderCell>Details</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit, index) => (
            <TableRow key={unit.id}>
              <TableCell>
                {new Date(unit.dateAdded).toLocaleDateString()}
              </TableCell>
              <TableCell>1</TableCell>
              <TableCell>
                <Button
                  children="Details"
                  label={`Details for unit ${index + 1}`}
                  variant="ghost"
                  href={inventoryRecordPath(unit.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {error && <Text role="alert">{error}</Text>}
      {hasNext && (
        <Button
          label="Load more stock units"
          isLoading={isLoadingNext}
          onClick={loadMore}
        />
      )}
    </Stack>
  );
}

function useStockUnitsUnits({ queryRef }: { queryRef: StockUnits_query$key }) {
  const [error, setError] = useState("");
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    StockUnitsPaginationQuery,
    StockUnits_query$key
  >(
    graphql`
      fragment StockUnits_query on RootQuery
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "String" }
        item: { type: "ID!" }
        location: { type: "ID!" }
      )
      @refetchable(queryName: "StockUnitsPaginationQuery") {
        clogInventorySearch(
          first: $count
          after: $cursor
          where: { item: $item, location: $location }
        )
          @connection(
            key: "StockUnits__clogInventorySearch"
            filters: ["where"]
          ) {
          totalCount
          edges {
            node {
              id
              dateAdded
            }
          }
        }
      }
    `,
    queryRef,
  );
  const units =
    data.clogInventorySearch?.edges?.flatMap((edge) =>
      edge?.node ? [edge.node] : [],
    ) ?? [];

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
    data,
    hasNext,
    loadNext,
    isLoadingNext,
    units,
    loadMore,
  };
}
