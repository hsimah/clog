import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { graphql, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { Stack, Grid, Text, TextInput, Button } from "@astryxdesign/core";
import * as stylex from "@stylexjs/stylex";
import { ItemList } from "./ItemList";
import { QueryBoundary } from "../../relay/QueryBoundary";
import { useRouteQuery } from "../../relay/useRouteQuery";
import { useCanWrite } from "../../relay/useCanWrite";
import { WORKSPACE_CONTEXT } from "../../app/WorkspaceContext";
import { useWorkspaceActions } from "../../app/useWorkspaceActions";
import { useItemRouteContext } from "../../routes/__generated__/routes";
import type { ItemPageQuery } from "./__generated__/ItemPageQuery.graphql";
import { BarcodeScannerDialog } from "../barcode/BarcodeScannerDialog";
import { ItemNewURI } from "../../routes/__generated__/routes";

const QUERY = graphql`
  query ItemPageQuery($term: String) {
    ...ItemList_query @arguments(term: $term)
  }
`;

export function ItemPage({
  reference,
  detail,
}: {
  reference: PreloadedQuery<ItemPageQuery>;
  detail: ReactNode;
}) {
  const state = useItemPage(reference);
  return (
    <WORKSPACE_CONTEXT value={state.actions}>
      <Stack gap={4}>
        <Text as="h1" type="display-2">
          Items
        </Text>
        <Grid gap={6} columns={1} xstyle={!!detail && styles.withDetail}>
          <Stack gap={4} xstyle={styles.content}>
            <Stack direction="horizontal" gap={3} wrap="wrap" hAlign="between">
              <TextInput
                label="Search items"
                placeholder="Search items..."
                value={state.term}
                onChange={state.search}
              />
              <Button
                label="Add Item"
                href={state.actions.newPath}
                isDisabled={!state.canWrite}
              />
              <Button
                label="Scan Barcode"
                variant="ghost"
                isDisabled={!state.canWrite}
                onClick={() => state.setScannerOpen(true)}
              />
            </Stack>
            <QueryBoundary
              key={state.reference.fetchKey ?? "initial"}
              retry={state.refresh}
            >
              <ItemPage_Results reference={state.reference} />
            </QueryBoundary>
          </Stack>
          {detail && (
            <Stack
              as="aside"
              aria-label="Item details"
              gap={4}
              paddingBlockStart={4}
              xstyle={styles.panel}
            >
              {detail}
            </Stack>
          )}
        </Grid>
        <BarcodeScannerDialog
          open={state.scannerOpen}
          onOpenChange={state.setScannerOpen}
          onScan={state.scanned}
        />
      </Stack>
    </WORKSPACE_CONTEXT>
  );
}

function useItemPage(initial: PreloadedQuery<ItemPageQuery>) {
  const route = useItemRouteContext();
  const term = route.input.term ?? "";
  const navigate = useNavigate();
  const [revision, setRevision] = useState(0);
  const refresh = () => setRevision((value) => value + 1);
  const variables = useMemo(() => ({ term }), [term]);
  const reference = useRouteQuery<ItemPageQuery>(
    QUERY,
    variables,
    revision,
    initial,
  )!;
  const actions = useWorkspaceActions("item", route.input, refresh);
  const canWrite = useCanWrite();
  const search = (value: string) =>
    navigate(route.updateURI({ term: value || undefined }), { replace: true });
  const [scannerOpen, setScannerOpen] = useState(false);
  const scanned = (barcode: string) =>
    navigate(ItemNewURI.getURI({ term: route.input.term, barcode }));
  return {
    term,
    reference,
    revision,
    refresh,
    actions,
    canWrite,
    search,
    scannerOpen,
    setScannerOpen,
    scanned,
  };
}

function ItemPage_Results({
  reference,
  ...props
}: {
  reference: PreloadedQuery<ItemPageQuery>;
}) {
  const data = usePreloadedQuery<ItemPageQuery>(QUERY, reference);
  return <ItemList queryRef={data} {...props} />;
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
