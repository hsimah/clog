import { useCallback, useMemo, useState } from 'react';
import { Outlet, useNavigate, useOutlet } from 'react-router-dom';
import { graphql, usePreloadedQuery, type PreloadedQuery } from 'react-relay';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import * as stylex from '@stylexjs/stylex';
import { BarcodeScannerDialog } from '@/components/barcode/BarcodeScannerDialog';
import { ItemList } from '@/components/items/ItemList';
import { QueryBoundary } from '@/relay/QueryBoundary';
import { useRouteQuery } from '@/relay/useRouteQuery';
import { useCanWrite } from '@/relay/useCanWrite';
import type { ItemsPageQuery } from './__generated__/ItemsPageQuery.graphql';

const query = graphql`
  query ItemsPageQuery($term: String) {
    ...ItemList_query @arguments(term: $term)
  }
`;
const styles = stylex.create({
  columns: { display: 'grid', gap: 'var(--spacing-6)', minWidth: 0 },
  withDetail: { gridTemplateColumns: { default: 'minmax(0, 1fr)', '@media (min-width: 1000px)': 'minmax(0, 1fr) minmax(0, 24rem)' } },
  panel: { order: { default: -1, '@media (min-width: 1000px)': 1 }, minWidth: 0, borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-4)' },
});
export interface ItemRouteContext { refreshItems: () => void; onClose: () => void; itemPath?: (id: string, edit?: boolean) => string }

export function ItemsPage() {
  const [term, setTerm] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const variables = useMemo(() => ({ term }), [term]);
  const reference = useRouteQuery<ItemsPageQuery>(query, variables, revision);
  const refreshItems = useCallback(() => setRevision((value) => value + 1), []);
  const navigate = useNavigate();
  const outlet = useOutlet();
  const canWrite = useCanWrite();
  return <Stack gap={4}>
    <Text as="h1" type="display-2">Items</Text>
    <div {...stylex.props(styles.columns, !!outlet && styles.withDetail)}>
      <Stack gap={4}>
        <Stack direction="horizontal" gap={3} wrap="wrap" hAlign="between">
          <TextInput label="Search items" placeholder="Search items..." value={term} onChange={setTerm} />
          <Button label="Add Item" href="/items/new" isDisabled={!canWrite} />
          <Button label="Scan Barcode" variant="ghost" isDisabled={!canWrite} onClick={() => setScannerOpen(true)} />
        </Stack>
        <QueryBoundary key={reference?.fetchKey ?? "initial"} retry={refreshItems}>
          {reference ? <Results reference={reference} /> : <p role="status">Loading...</p>}
        </QueryBoundary>
      </Stack>
      {outlet && <aside aria-label="Item details" {...stylex.props(styles.panel)}>
        <Outlet context={{ refreshItems, onClose: () => navigate('/items') } satisfies ItemRouteContext} />
      </aside>}
    </div>
    <BarcodeScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onScan={(scannedBarcode) => navigate('/items/new', { state: { scannedBarcode } })} />
  </Stack>;
}

function Results({ reference }: { reference: PreloadedQuery<ItemsPageQuery> }) {
  const data = usePreloadedQuery<ItemsPageQuery>(query, reference);
  return <ItemList queryRef={data} />;
}
