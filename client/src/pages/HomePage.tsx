import { useState } from 'react';
import { graphql, usePreloadedQuery, type PreloadedQuery } from 'react-relay';
import { Card } from '@astryxdesign/core/Card';
import { Layout, LayoutHeader, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import * as stylex from '@stylexjs/stylex';
import { QueryBoundary } from '@/relay/QueryBoundary';
import { useRouteQuery } from '@/relay/useRouteQuery';
import { useCanWrite } from '@/relay/useCanWrite';
import type { HomePageQuery } from './__generated__/HomePageQuery.graphql';

const query = graphql`
  query HomePageQuery { clogSummary { items locations inventory } }
`;
const variables = {};
const styles = stylex.create({
  card: {
    borderTopWidth: 3,
    borderTopStyle: 'solid',
    borderTopColor: '#ff5722',
    backgroundImage: 'linear-gradient(145deg, #ff572212, transparent 60%)',
  },
  count: { color: '#ff7043', fontWeight: 700 },

  cards: {
    display: 'grid', gap: 'var(--spacing-4)',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', '@media (min-width: 900px)': 'repeat(3, minmax(0, 1fr))' },
  },
});

export function HomePage() {
  const [revision, setRevision] = useState(0);
  const reference = useRouteQuery<HomePageQuery>(query, variables, revision);
  return <Stack gap={6}>
    <Stack gap={2}>
      <Text as="h1" type="display-2">Overview</Text>
      <Text>Cave Log - Inventory Management System</Text>
    </Stack>
    <QueryBoundary key={reference?.fetchKey ?? 'initial'} retry={() => setRevision((value) => value + 1)}>
      {reference ? <Summary reference={reference} /> : <p role="status">Loading...</p>}
    </QueryBoundary>
  </Stack>;
}

function Summary({ reference }: { reference: PreloadedQuery<HomePageQuery> }) {
  const { clogSummary } = usePreloadedQuery<HomePageQuery>(query, reference);
  const canWrite = useCanWrite();
  if (!clogSummary) throw new Error('Inventory totals are unavailable.');
  const cards = [
    { title: 'Items', description: 'Manage your inventory items', count: clogSummary.items, label: 'Total items', path: '/items' },
    { title: 'Locations', description: 'Manage storage locations', count: clogSummary.locations, label: 'Total locations', path: '/locations' },
    { title: 'Inventory', description: 'Track item quantities', count: clogSummary.inventory, label: 'Total items in stock', path: '/inventory' },
  ];
  return <div {...stylex.props(styles.cards)}>
    {cards.map(({ title, description, count, label, path }) => <Card key={path} role="region" aria-label={title} padding={0} xstyle={styles.card}>
      <Layout height="auto"
        header={<LayoutHeader padding={6}><Stack gap={2}>
          <Text as="h2" type="display-3">{title}</Text>
          <Text>{description}</Text>
        </Stack></LayoutHeader>}
        content={<LayoutContent padding={6}><Stack gap={2}>
          <Text type="display-2" xstyle={styles.count} aria-label={label}>{count}</Text>
          <Text>{label}</Text>
        </Stack></LayoutContent>}
        footer={<LayoutFooter padding={6}><Stack direction="horizontal" gap={2} wrap="wrap">
          <Button href={path} label="View All" variant="secondary" />
          <Button href={`${path}/new`} label="Add New" variant="secondary" isDisabled={!canWrite} />
        </Stack></LayoutFooter>}
      />
    </Card>)}
  </div>;
}
