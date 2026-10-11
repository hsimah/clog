import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { graphql, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { Stack, Grid, Text, TextInput, Button } from "@astryxdesign/core";
import * as stylex from "@stylexjs/stylex";
import { InventoryList } from "./InventoryList";
import { QueryBoundary } from "../../relay/QueryBoundary";
import { useRouteQuery } from "../../relay/useRouteQuery";
import { useCanWrite } from "../../relay/useCanWrite";
import { WORKSPACE_CONTEXT } from "../../app/WorkspaceContext";
import { useWorkspaceActions } from "../../app/useWorkspaceActions";
import { useInventoryRouteContext } from "../../routes/__generated__/routes";
import type { InventoryPageQuery } from "./__generated__/InventoryPageQuery.graphql";
import { InventoryLocations } from "./InventoryLocations";
import type { InventoryLocationsQuery } from "./__generated__/InventoryLocationsQuery.graphql";

const QUERY = graphql`
  query InventoryPageQuery($term: String = "", $location: ID) {
    ...InventoryList_query @arguments(term: $term, location: $location)
  }
`;

export function InventoryPage({
  reference,
  detail,
  locationsReference,
}: {
  reference: PreloadedQuery<InventoryPageQuery>;
  detail: ReactNode;
  locationsReference: PreloadedQuery<InventoryLocationsQuery>;
}) {
  const state = useInventoryPage(reference);
  return (
    <WORKSPACE_CONTEXT value={state.actions}>
      <Stack gap={4}>
        <Text as="h1" type="display-2">
          Inventory
        </Text>
        <Grid gap={6} columns={1} xstyle={!!detail && styles.withDetail}>
          <Stack gap={4} xstyle={styles.content}>
            <Stack direction="horizontal" gap={3} wrap="wrap" hAlign="between">
              <TextInput
                label="Search inventory"
                placeholder="Search inventory..."
                value={state.term}
                onChange={state.search}
              />
              <Button
                label="Add Inventory"
                href={state.actions.newPath}
                isDisabled={!state.canWrite}
              />
            </Stack>
            <InventoryLocations
              reference={locationsReference}
              value={state.location}
              onChange={state.selectLocation}
              revision={state.revision}
            />
            <QueryBoundary
              key={state.reference.fetchKey ?? "initial"}
              retry={state.refresh}
            >
              <InventoryPage_Results
                reference={state.reference}
                location={state.location}
              />
            </QueryBoundary>
          </Stack>
          {detail && (
            <Stack
              as="aside"
              aria-label="Inventory details"
              gap={4}
              paddingBlockStart={4}
              xstyle={styles.panel}
            >
              {detail}
            </Stack>
          )}
        </Grid>
      </Stack>
    </WORKSPACE_CONTEXT>
  );
}

function useInventoryPage(initial: PreloadedQuery<InventoryPageQuery>) {
  const route = useInventoryRouteContext();
  const term = route.input.term ?? "";
  const navigate = useNavigate();
  const [revision, setRevision] = useState(0);
  const refresh = () => setRevision((value) => value + 1);
  const location = route.input.location ?? null;
  const variables = useMemo(() => ({ term, location }), [term, location]);
  const reference = useRouteQuery<InventoryPageQuery>(
    QUERY,
    variables,
    revision,
    initial,
  )!;
  const actions = useWorkspaceActions("inventory", route.input, refresh);
  const canWrite = useCanWrite();
  const search = (value: string) =>
    navigate(route.updateURI({ term: value || undefined }), { replace: true });
  const selectLocation = (value: string) =>
    navigate(route.updateURI({ location: value || undefined }));
  return {
    term,
    reference,
    revision,
    refresh,
    actions,
    canWrite,
    search,
    location,
    selectLocation,
  };
}

function InventoryPage_Results({
  reference,
  ...props
}: {
  reference: PreloadedQuery<InventoryPageQuery>;
  location: string | null;
}) {
  const data = usePreloadedQuery<InventoryPageQuery>(QUERY, reference);
  return <InventoryList queryRef={data} {...props} />;
}

// At 1000px the detail occupies a 384px end column; below it, details lead a single column.
const styles = stylex.create({
  content: { minWidth: 0 },
  withDetail: {
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (min-width: 1000px)": "minmax(0, 1fr) minmax(0, 24rem)",
    },
  },
  panel: {
    order: { default: -1, "@media (min-width: 1000px)": 1 },
    minWidth: 0,
    borderTop: "1px solid var(--color-border)",
  },
});
