import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import { Button } from '@astryxdesign/core/Button';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { useSaveMutation } from '@/relay/useSaveMutation';
import { useCanWrite } from '@/relay/useCanWrite';
import type { LocationRouteContext } from '@/pages/locations/LocationsPage';
import type { LocationDetails_location$key } from './__generated__/LocationDetails_location.graphql';
import type { LocationDetailsDeleteMutation } from './__generated__/LocationDetailsDeleteMutation.graphql';

export function LocationDetails({ locationRef }: { locationRef: LocationDetails_location$key }) {
  const location = useFragment(graphql`
    fragment LocationDetails_location on ClogLocation { id name createdAt stockCount }
  `, locationRef);
  const { save, pending } = useSaveMutation<LocationDetailsDeleteMutation>(graphql`
    mutation LocationDetailsDeleteMutation($input: DeleteClogLocationInput!) {
      deleteClogLocation(input: $input) { deletedId @deleteRecord }
    }
  `);
  const { refreshLocations, onClose } = useOutletContext<LocationRouteContext>();
  const heading = useRef<HTMLElement>(null);
  useEffect(() => { heading.current?.focus(); }, [location.id]);
  const [error, setError] = useState('');
  const canWrite = useCanWrite();
  return <Stack gap={4}>
    <Text as="h2" type="display-3" tabIndex={-1} ref={heading}>{location.name}</Text>
    <p>Created {new Date(location.createdAt).toLocaleDateString()}</p>
    <p>{location.stockCount} stocked units</p>
    {location.stockCount > 0 && <p>Remove or move the stock before deleting this location.</p>}
    {error && <p role="alert">{error}</p>}
    <Stack direction="horizontal" gap={2} wrap="wrap">
      <Button label="Edit" href={`/locations/${encodeURIComponent(location.id)}/edit`} isDisabled={!canWrite || pending} />
      <Button label="Delete" isLoading={pending} isDisabled={!canWrite || location.stockCount > 0} onClick={() => {
        if (!window.confirm(`Delete ${location.name}?`)) return;
        setError('');
        save({ input: { id: location.id } }, (response) => {
          if (!response.deleteClogLocation?.deletedId) { setError('The server did not confirm deletion. Check inventory before retrying.'); return; }
          refreshLocations(); onClose();
        }, (failure) => setError(`${failure.message} Check inventory before retrying; changes may have been saved.`));
      }} />
      <Button label="Close" variant="ghost" onClick={onClose} isDisabled={pending} />
    </Stack>
  </Stack>;
}
