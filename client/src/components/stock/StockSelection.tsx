import { Text } from "@astryxdesign/core/Text";
import { useWorkspaceContext } from "../../app/useWorkspaceContext";
import { useMemo, useState } from "react";
import {
  RouteName,
  useInventoryRouteContext,
} from "../../routes/__generated__/routes";
import {
  graphql,
  usePaginationFragment,
  usePreloadedQuery,
  type PreloadedQuery,
} from "react-relay";
import { Button } from "@astryxdesign/core/Button";
import { Stack } from "@astryxdesign/core/Stack";
import { InventoryDetails } from "../inventory/InventoryDetails";
import { QueryBoundary } from "../../relay/QueryBoundary";
import { useRouteQuery } from "../../relay/useRouteQuery";
import type { StockSelectionQuery } from "./__generated__/StockSelectionQuery.graphql";
import type { StockSelectionPaginationQuery } from "./__generated__/StockSelectionPaginationQuery.graphql";
import type { StockSelection_query$key } from "./__generated__/StockSelection_query.graphql";

const QUERY = graphql`
  query StockSelectionQuery($item: ID!, $location: ID) {
    ...StockSelection_query @arguments(item: $item, location: $location)
  }
`;
export function StockSelection({
  reference: initial,
}: {
  reference: PreloadedQuery<StockSelectionQuery>;
}) {
  const route = useInventoryRouteContext();
  if (
    route.currentRoute !== RouteName.InventoryStock &&
    route.currentRoute !== RouteName.InventoryStockLocation
  )
    throw new Error("Stock selection requires a stock route.");
  const itemId = route.input.itemId;
  const locationId =
    route.currentRoute === RouteName.InventoryStockLocation
      ? route.input.locationId
      : undefined;
  const [revision, setRevision] = useState(0);
  const variables = useMemo(
    () => ({ item: itemId, location: locationId ?? null }),
    [itemId, locationId],
  );
  const reference = useRouteQuery<StockSelectionQuery>(
    QUERY,
    variables,
    revision,
    initial,
  );
  const refresh = () => setRevision((value) => value + 1);
  return (
    <QueryBoundary key={reference?.fetchKey ?? "initial"} retry={refresh}>
      {reference ? (
        <StockSelection_Results
          key={String(reference.fetchKey)}
          reference={reference}
          refresh={refresh}
        />
      ) : (
        <Text role="status">Loading stock...</Text>
      )}
    </QueryBoundary>
  );
}
function StockSelection_Results({
  reference,
  refresh,
}: {
  reference: PreloadedQuery<StockSelectionQuery>;
  refresh: () => void;
}) {
  const data = usePreloadedQuery<StockSelectionQuery>(QUERY, reference);
  return <StockSelection_Selection queryRef={data} refresh={refresh} />;
}
function StockSelection_Selection({
  queryRef,
  refresh,
}: {
  queryRef: StockSelection_query$key;
  refresh: () => void;
}) {
  const {
    index,
    setIndex,
    error,
    onClose,
    data,
    nextUnit,
    hasNext,
    isLoadingNext,
    units,
    unit,
  } = useStockSelectionSelection({ queryRef, refresh });
  return (
    <Stack gap={4}>
      {unit ? (
        <>
          <Text aria-live="polite">
            Unit {index + 1} of {data.clogInventorySearch?.totalCount ?? 0}
          </Text>
          <Stack direction="horizontal" gap={2}>
            <Button
              label="Previous unit"
              variant="ghost"
              isDisabled={index === 0 || isLoadingNext}
              onClick={() => setIndex((value) => value - 1)}
            />
            <Button
              label="Next unit"
              variant="ghost"
              isLoading={isLoadingNext}
              isDisabled={
                isLoadingNext || (index + 1 >= units.length && !hasNext)
              }
              onClick={nextUnit}
            />
          </Stack>
          <InventoryDetails
            key={unit.id}
            inventoryRef={unit}
            onChanged={refresh}
          />
        </>
      ) : (
        <>
          <Text>No stock remains in this selection.</Text>
          <Button label="Close" variant="ghost" onClick={onClose} />
        </>
      )}
      {error && <Text role="alert">{error}</Text>}
    </Stack>
  );
}

function useStockSelectionSelection({
  queryRef,
}: {
  queryRef: StockSelection_query$key;
  refresh: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const { onClose } = useWorkspaceContext();
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment<
    StockSelectionPaginationQuery,
    StockSelection_query$key
  >(
    graphql`
      fragment StockSelection_query on RootQuery
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "String" }
        item: { type: "ID!" }
        location: { type: "ID" }
      )
      @refetchable(queryName: "StockSelectionPaginationQuery") {
        clogInventorySearch(
          first: $count
          after: $cursor
          where: { item: $item, location: $location }
        )
          @connection(
            key: "StockSelection__clogInventorySearch"
            filters: ["where"]
          ) {
          totalCount
          edges {
            node {
              id
              ...InventoryDetails_inventory
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
  const unit = units[Math.min(index, units.length - 1)];

  function nextUnit() {
    if (index + 1 < units.length) setIndex((value) => value + 1);
    else {
      setError("");
      loadNext(25, {
        onComplete: (failure) => {
          if (failure) setError(failure.message);
          else setIndex((value) => value + 1);
        },
      });
    }
  }
  return {
    index,
    setIndex,
    error,
    onClose,
    data,
    nextUnit,
    hasNext,
    isLoadingNext,
    units,
    unit,
  };
}
