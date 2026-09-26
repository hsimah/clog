import { useCallback, useMemo, useState } from 'react';
import { Outlet, useNavigate, useOutlet } from 'react-router-dom';
import { graphql, usePreloadedQuery, type PreloadedQuery } from 'react-relay';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import * as stylex from '@stylexjs/stylex';
import { LocationList } from '@/components/locations/LocationList';
import { QueryBoundary } from '@/relay/QueryBoundary';
import { useRouteQuery } from '@/relay/useRouteQuery';
import { useCanWrite } from '@/relay/useCanWrite';
import type { LocationsPageQuery } from './__generated__/LocationsPageQuery.graphql';

const query = graphql`
  query LocationsPageQuery($term: String) {
    ...LocationList_query @arguments(term: $term)
  }
`;
const styles = stylex.create({
  columns: { display: 'grid', gap: 'var(--spacing-6)', minWidth: 0 },
  withDetail: { gridTemplateColumns: { default: 'minmax(0, 1fr)', '@media (min-width: 1000px)': 'minmax(0, 1fr) minmax(0, 24rem)' } },
  panel: { order: { default: -1, '@media (min-width: 1000px)': 1 }, minWidth: 0, borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-4)' },
});
export interface LocationRouteContext { refreshLocations: () => void; onClose: () => void }

export function LocationsPage() {
  const [term, setTerm] = useState('');
  const [revision, setRevision] = useState(0);
  const variables = useMemo(() => ({ term }), [term]);
  const reference = useRouteQuery<LocationsPageQuery>(query, variables, revision);
  const refreshLocations = useCallback(() => setRevision((value) => value + 1), []);
  const navigate = useNavigate();
  const outlet = useOutlet();
  const canWrite = useCanWrite();
  return <Stack gap={4}>
    <Text as="h1" type="display-2">Locations</Text>
    <div {...stylex.props(styles.columns, !!outlet && styles.withDetail)}>
      <Stack gap={4}>
        <Stack direction="horizontal" gap={3} wrap="wrap" hAlign="between">
          <TextInput label="Search locations" placeholder="Search locations..." value={term} onChange={setTerm} />
          <Button label="Add Location" href="/locations/new" isDisabled={!canWrite} />
        </Stack>
        <QueryBoundary key={reference?.fetchKey ?? "initial"} retry={refreshLocations}>
          {reference ? <Results reference={reference} /> : <p role="status">Loading...</p>}
        </QueryBoundary>
      </Stack>
      {outlet && <aside aria-label="Location details" {...stylex.props(styles.panel)}>
        <Outlet context={{ refreshLocations, onClose: () => navigate('/locations') } satisfies LocationRouteContext} />
      </aside>}
    </div>
  </Stack>;
}

function Results({ reference }: { reference: PreloadedQuery<LocationsPageQuery> }) {
  const data = usePreloadedQuery<LocationsPageQuery>(query, reference);
  return <LocationList queryRef={data} />;
}
