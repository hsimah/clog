import { useCallback, useMemo, useState } from 'react';
import { Outlet, useNavigate, useOutlet, useSearchParams } from 'react-router-dom';
import { graphql, usePreloadedQuery, type PreloadedQuery } from 'react-relay';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import * as stylex from '@stylexjs/stylex';
import { InventoryList } from '@/components/inventory/InventoryList';
import { InventoryLocations } from '@/components/inventory/InventoryLocations';
import { QueryBoundary } from '@/relay/QueryBoundary';
import { useRouteQuery } from '@/relay/useRouteQuery';
import { useCanWrite } from '@/relay/useCanWrite';
import type { InventoryPageQuery } from './__generated__/InventoryPageQuery.graphql';

const query = graphql`query InventoryPageQuery($term: String, $location: ID) {
  ...InventoryList_query @arguments(term: $term, location: $location)
}`;
const styles = stylex.create({
  columns: { display: 'grid', gap: 'var(--spacing-6)', minWidth: 0 },
  detail: { gridTemplateColumns: { default: 'minmax(0, 1fr)', '@media (min-width: 1000px)': 'minmax(0, 1fr) minmax(0, 24rem)' } },
  panel: { order: { default: -1, '@media (min-width: 1000px)': 1 }, minWidth: 0, borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-4)' },
});
export interface InventoryRouteContext {
  refreshInventory: () => void; onClose: () => void;
  inventoryPath: (path: string) => string;
}
export function InventoryPage() {
  const [params, setParams] = useSearchParams();
  const term = params.get('term') ?? '';
  const location = params.get('location');
  const [revision, setRevision] = useState(0);
  const variables = useMemo(() => ({ term, location }), [term, location]);
  const reference = useRouteQuery<InventoryPageQuery>(query, variables, revision);
  const refreshInventory = useCallback(() => setRevision((value) => value + 1), []);
  const navigate = useNavigate();
  const outlet = useOutlet();
  const canWrite = useCanWrite();
  const inventoryPath = (path: string) => `/inventory${path}${params.size ? `?${params}` : ''}`;
  const updateFilter = (key: string, value: string, replace = false) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace });
  };
  return <Stack gap={4}>
    <Text as="h1" type="display-2">Inventory</Text>
    <div {...stylex.props(styles.columns, !!outlet && styles.detail)}>
      <Stack gap={4}>
        <Stack direction="horizontal" gap={3} wrap="wrap" hAlign="between">
          <TextInput label="Search inventory" placeholder="Search inventory..." value={term} onChange={(value) => updateFilter('term', value, true)} />
          <Button label="Add Inventory" href={inventoryPath('/new')} isDisabled={!canWrite} />
        </Stack>
        <InventoryLocations value={location} onChange={(value) => updateFilter('location', value)} revision={revision} />
        <QueryBoundary key={reference?.fetchKey ?? 'initial'} retry={refreshInventory}>
          {reference ? <Results reference={reference} location={location} inventoryPath={inventoryPath} /> : <p role="status">Loading...</p>}
        </QueryBoundary>
      </Stack>
      {outlet && <aside aria-label="Inventory details" {...stylex.props(styles.panel)}>
        <Outlet context={{ refreshInventory, onClose: () => navigate(inventoryPath('')), inventoryPath,
          refreshItems: refreshInventory, refreshLocations: refreshInventory,
          itemPath: (id: string, edit = false) => inventoryPath(`/items/${encodeURIComponent(id)}${edit ? '/edit' : ''}`),
          locationPath: (id: string, edit = false) => inventoryPath(`/locations/${encodeURIComponent(id)}${edit ? '/edit' : ''}`),
        }} />
      </aside>}
    </div>
  </Stack>;
}
function Results({ reference, ...props }: { reference: PreloadedQuery<InventoryPageQuery>; location: string | null; inventoryPath: (path: string) => string }) {
  const data = usePreloadedQuery<InventoryPageQuery>(query, reference);
  return <InventoryList queryRef={data} {...props} />;
}
