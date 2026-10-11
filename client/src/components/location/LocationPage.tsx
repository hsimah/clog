import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { graphql, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { Stack, Grid, Text, TextInput, Button } from "@astryxdesign/core";
import * as stylex from "@stylexjs/stylex";
import { LocationList } from "./LocationList";
import { QueryBoundary } from "../../relay/QueryBoundary";
import { useRouteQuery } from "../../relay/useRouteQuery";
import { useCanWrite } from "../../relay/useCanWrite";
import { WORKSPACE_CONTEXT } from "../../app/WorkspaceContext";
import { useWorkspaceActions } from "../../app/useWorkspaceActions";
import { useLocationRouteContext } from "../../routes/__generated__/routes";
import type { LocationPageQuery } from "./__generated__/LocationPageQuery.graphql";

const QUERY = graphql`
  query LocationPageQuery($term: String = "") {
    ...LocationList_query @arguments(term: $term)
  }
`;

export function LocationPage({
  reference,
  detail,
}: {
  reference: PreloadedQuery<LocationPageQuery>;
  detail: ReactNode;
}) {
  const state = useLocationPage(reference);
  return (
    <WORKSPACE_CONTEXT value={state.actions}>
      <Stack gap={4}>
        <Text as="h1" type="display-2">
          Locations
        </Text>
        <Grid gap={6} columns={1} xstyle={!!detail && styles.withDetail}>
          <Stack gap={4} xstyle={styles.content}>
            <Stack direction="horizontal" gap={3} wrap="wrap" hAlign="between">
              <TextInput
                label="Search locations"
                placeholder="Search locations..."
                value={state.term}
                onChange={state.search}
              />
              <Button
                label="Add Location"
                href={state.actions.newPath}
                isDisabled={!state.canWrite}
              />
            </Stack>
            <QueryBoundary
              key={state.reference.fetchKey ?? "initial"}
              retry={state.refresh}
            >
              <LocationPage_Results reference={state.reference} />
            </QueryBoundary>
          </Stack>
          {detail && (
            <Stack
              as="aside"
              aria-label="Location details"
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

function useLocationPage(initial: PreloadedQuery<LocationPageQuery>) {
  const route = useLocationRouteContext();
  const term = route.input.term ?? "";
  const navigate = useNavigate();
  const [revision, setRevision] = useState(0);
  const refresh = () => setRevision((value) => value + 1);
  const variables = useMemo(() => ({ term }), [term]);
  const reference = useRouteQuery<LocationPageQuery>(
    QUERY,
    variables,
    revision,
    initial,
  )!;
  const actions = useWorkspaceActions("location", route.input, refresh);
  const canWrite = useCanWrite();
  const search = (value: string) =>
    navigate(route.updateURI({ term: value || undefined }), { replace: true });
  return { term, reference, revision, refresh, actions, canWrite, search };
}

function LocationPage_Results({
  reference,
  ...props
}: {
  reference: PreloadedQuery<LocationPageQuery>;
}) {
  const data = usePreloadedQuery<LocationPageQuery>(QUERY, reference);
  return <LocationList queryRef={data} {...props} />;
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
