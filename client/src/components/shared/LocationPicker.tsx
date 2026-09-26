import { useMemo, useState } from 'react';
import { graphql, usePaginationFragment, usePreloadedQuery, type PreloadedQuery } from 'react-relay';
import { Stack } from '@astryxdesign/core/Stack';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Button } from '@astryxdesign/core/Button';
import { QueryBoundary } from '@/relay/QueryBoundary';
import { useRouteQuery } from '@/relay/useRouteQuery';
import type { LocationPickerQuery } from './__generated__/LocationPickerQuery.graphql';
import type { LocationPickerPaginationQuery } from './__generated__/LocationPickerPaginationQuery.graphql';
import type { LocationPicker_query$key } from './__generated__/LocationPicker_query.graphql';

export interface LocationSelection { id: string; name: string }
interface LocationPickerProps { value: LocationSelection | null; onChange: (value: LocationSelection | null) => void; disabled?: boolean }
const query = graphql`query LocationPickerQuery($term: String) { ...LocationPicker_query @arguments(term: $term) }`;
export function LocationPicker(props: LocationPickerProps) {
  const [term, setTerm] = useState('');
  const [revision, setRevision] = useState(0);
  const variables = useMemo(() => ({ term }), [term]);
  const reference = useRouteQuery<LocationPickerQuery>(query, variables, revision);
  return <Stack gap={2}>
    <TextInput label="Find a location" value={term} onChange={setTerm} isDisabled={props.disabled} placeholder="Search all locations..." />
    <QueryBoundary key={reference?.fetchKey ?? 'initial'} retry={() => setRevision((value) => value + 1)}>
      {reference ? <PickerQuery reference={reference} {...props} /> : <p role="status">Loading locations...</p>}
    </QueryBoundary>
  </Stack>;
}
function PickerQuery({ reference, ...props }: LocationPickerProps & { reference: PreloadedQuery<LocationPickerQuery> }) {
  const data = usePreloadedQuery<LocationPickerQuery>(query, reference);
  return <Picker queryRef={data} {...props} />;
}
function Picker({ queryRef, value, onChange, disabled }: LocationPickerProps & { queryRef: LocationPicker_query$key }) {
  const [error, setError] = useState('');
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<LocationPickerPaginationQuery, LocationPicker_query$key>(graphql`
    fragment LocationPicker_query on RootQuery
    @argumentDefinitions(count: { type: "Int", defaultValue: 25 }, cursor: { type: "String" }, term: { type: "String" })
    @refetchable(queryName: "LocationPickerPaginationQuery") {
      clogLocationSearch(first: $count, after: $cursor, where: { term: $term })
      @connection(key: "LocationPicker__clogLocationSearch", filters: ["where"]) {
        edges { node { id name } }
      }
    }
  `, queryRef);
  const entries = data.clogLocationSearch?.edges?.flatMap((edge) => edge?.node ? [edge.node] : []) ?? [];
  if (value && !entries.some((entry) => entry.id === value.id)) entries.unshift(value);
  return <Stack gap={2}>
    <Selector label="Location" value={value?.id ?? ''} isDisabled={disabled}
      options={[{ value: '', label: 'Select a location' }, ...entries.map((entry) => ({ value: entry.id, label: entry.name }))]}
      onChange={(id) => onChange(entries.find((entry) => entry.id === id) ?? null)} />
    {error && <p role="alert">{error}</p>}
    {hasNext && <Button label="Load more location choices" variant="ghost" isDisabled={disabled} isLoading={isLoadingNext}
      onClick={() => { setError(''); loadNext(25, { onComplete: (failure) => { if (failure) setError(failure.message); } }); }} />}
  </Stack>;
}
