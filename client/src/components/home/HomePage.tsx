import {
  ItemIndexURI,
  ItemNewURI,
  LocationIndexURI,
  LocationNewURI,
  InventoryIndexURI,
  InventoryNewURI,
} from "../../routes/__generated__/routes";
import { Grid } from "@astryxdesign/core/Grid";
import { useState } from "react";
import { graphql, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { Card } from "@astryxdesign/core/Card";
import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
} from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import * as stylex from "@stylexjs/stylex";
import { QueryBoundary } from "../../relay/QueryBoundary";
import { useRouteQuery } from "../../relay/useRouteQuery";
import { useCanWrite } from "../../relay/useCanWrite";
import type { HomePageQuery } from "./__generated__/HomePageQuery.graphql";

const QUERY = graphql`
  query HomePageQuery {
    clogSummary {
      items
      locations
      inventory
    }
  }
`;

const VARIABLES = {};

export function HomePage({
  reference: initial,
}: {
  reference: PreloadedQuery<HomePageQuery>;
}) {
  const [revision, setRevision] = useState(0);
  const reference = useRouteQuery<HomePageQuery>(
    QUERY,
    VARIABLES,
    revision,
    initial,
  );
  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Text as="h1" type="display-2">
          Overview
        </Text>
        <Text>Cave Log - Inventory Management System</Text>
      </Stack>
      <QueryBoundary
        key={reference?.fetchKey ?? "initial"}
        retry={() => setRevision((value) => value + 1)}
      >
        {reference ? (
          <HomePage_Summary reference={reference} />
        ) : (
          <Text role="status">Loading...</Text>
        )}
      </QueryBoundary>
    </Stack>
  );
}

function HomePage_Summary({
  reference,
}: {
  reference: PreloadedQuery<HomePageQuery>;
}) {
  const { clogSummary } = usePreloadedQuery<HomePageQuery>(QUERY, reference);
  const canWrite = useCanWrite();
  if (!clogSummary) throw new Error("Inventory totals are unavailable.");
  const cards = [
    {
      title: "Items",
      description: "Manage your inventory items",
      count: clogSummary.items,
      label: "Total items",
      path: ItemIndexURI.getURI({}),
      newPath: ItemNewURI.getURI({}),
    },
    {
      title: "Locations",
      description: "Manage storage locations",
      count: clogSummary.locations,
      label: "Total locations",
      path: LocationIndexURI.getURI({}),
      newPath: LocationNewURI.getURI({}),
    },
    {
      title: "Inventory",
      description: "Track item quantities",
      count: clogSummary.inventory,
      label: "Total items in stock",
      path: InventoryIndexURI.getURI({}),
      newPath: InventoryNewURI.getURI({}),
    },
  ];
  return (
    <Grid columns={{ minWidth: 280, max: 3 }} gap={4}>
      {cards.map(({ title, description, count, label, path, newPath }) => (
        <Card
          key={path}
          role="region"
          aria-label={title}
          padding={0}
          xstyle={styles.card}
        >
          <Layout
            height="auto"
            header={
              <LayoutHeader padding={6}>
                <Stack gap={2}>
                  <Text as="h2" type="display-3">
                    {title}
                  </Text>
                  <Text>{description}</Text>
                </Stack>
              </LayoutHeader>
            }
            content={
              <LayoutContent padding={6}>
                <Stack gap={2}>
                  <Text
                    type="display-2"
                    xstyle={styles.count}
                    aria-label={label}
                  >
                    {count}
                  </Text>
                  <Text>{label}</Text>
                </Stack>
              </LayoutContent>
            }
            footer={
              <LayoutFooter padding={6}>
                <Stack direction="horizontal" gap={2} wrap="wrap">
                  <Button href={path} label="View All" variant="secondary" />
                  <Button
                    href={newPath}
                    label="Add New"
                    variant="secondary"
                    isDisabled={!canWrite}
                  />
                </Stack>
              </LayoutFooter>
            }
          />
        </Card>
      ))}
    </Grid>
  );
}

const styles = stylex.create({
  card: {
    borderTopWidth: 3,
    borderTopStyle: "solid",
    borderTopColor: "var(--color-accent)",
    backgroundImage:
      "linear-gradient(145deg, var(--color-accent-muted), transparent 60%)",
  },
  count: { color: "var(--color-text-accent)", fontWeight: 700 },
});
