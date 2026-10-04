import { useState, type ReactNode } from "react";
import { graphql, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { Stack, Grid, Text, Button } from "@astryxdesign/core";
import * as stylex from "@stylexjs/stylex";
import { UserList } from "./UserList";
import { QueryBoundary } from "../../relay/QueryBoundary";
import { useRouteQuery } from "../../relay/useRouteQuery";
import { useIsAdminDenied } from "../../relay/useIsAdminDenied";
import { WORKSPACE_CONTEXT } from "../../app/WorkspaceContext";
import { useWorkspaceActions } from "../../app/useWorkspaceActions";
import type { UserPageQuery } from "./__generated__/UserPageQuery.graphql";

const QUERY = graphql`
  query UserPageQuery {
    ...UserList_query
  }
`;
const VARIABLES = {};

export function UserPage({
  reference,
  detail,
}: {
  reference: PreloadedQuery<UserPageQuery>;
  detail: ReactNode;
}) {
  const state = useUserPage(reference);
  if (state.isAdminDenied) {
    return (
      <Stack gap={4}>
        <Text as="h1" type="display-2">
          Users
        </Text>
        <Text>Administrator access is required to manage users.</Text>
      </Stack>
    );
  }
  return (
    <WORKSPACE_CONTEXT value={state.actions}>
      <Stack gap={4}>
        <Text as="h1" type="display-2">
          Users
        </Text>
        <Grid gap={6} columns={1} xstyle={!!detail && styles.withDetail}>
          <Stack gap={4} xstyle={styles.content}>
            <Stack direction="horizontal" gap={3} wrap="wrap" hAlign="end">
              <Button label="Add User" href={state.actions.newPath} />
            </Stack>
            <QueryBoundary
              key={state.reference.fetchKey ?? "initial"}
              retry={state.refresh}
            >
              <UserPage_Results reference={state.reference} />
            </QueryBoundary>
          </Stack>
          {detail && (
            <Stack
              as="aside"
              aria-label="User details"
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

function useUserPage(initial: PreloadedQuery<UserPageQuery>) {
  const [revision, setRevision] = useState(0);
  const refresh = () => setRevision((value) => value + 1);
  const reference = useRouteQuery<UserPageQuery>(
    QUERY,
    VARIABLES,
    revision,
    initial,
  )!;
  const actions = useWorkspaceActions("user", {}, refresh);
  const isAdminDenied = useIsAdminDenied();
  return { reference, refresh, actions, isAdminDenied };
}

function UserPage_Results({
  reference,
}: {
  reference: PreloadedQuery<UserPageQuery>;
}) {
  const data = usePreloadedQuery<UserPageQuery>(QUERY, reference);
  return <UserList queryRef={data} />;
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
