import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { useSaveMutation } from '@/relay/useSaveMutation';
import { useCanWrite } from '@/relay/useCanWrite';
import type { LocationRouteContext } from '@/pages/locations/LocationsPage';
import type { LocationForm_location$key } from './__generated__/LocationForm_location.graphql';
import type { LocationFormCreateMutation } from './__generated__/LocationFormCreateMutation.graphql';
import type { LocationFormUpdateMutation } from './__generated__/LocationFormUpdateMutation.graphql';

export function LocationForm({ locationRef }: { locationRef?: LocationForm_location$key }) {
  const location = useFragment(graphql`
    fragment LocationForm_location on ClogLocation { id name }
  `, locationRef ?? null);
  const create = useSaveMutation<LocationFormCreateMutation>(graphql`
    mutation LocationFormCreateMutation($input: CreateClogLocationInput!) {
      createClogLocation(input: $input) { clogLocation { id name ...LocationDetails_location ...LocationForm_location } }
    }
  `);
  const update = useSaveMutation<LocationFormUpdateMutation>(graphql`
    mutation LocationFormUpdateMutation($input: UpdateClogLocationInput!) {
      updateClogLocation(input: $input) { clogLocation { id name ...LocationDetails_location ...LocationForm_location } }
    }
  `);
  const navigate = useNavigate();
  const { refreshLocations, onClose, locationPath } = useOutletContext<LocationRouteContext>();
  const canWrite = useCanWrite();
  const [name, setName] = useState(location?.name ?? '');
  const [error, setError] = useState('');
  const pending = create.pending || update.pending;
  const failed = (failure: Error) => setError(`${failure.message} Check inventory before retrying; changes may have been saved.`);
  function completed(id?: string) {
    if (!id) { failed(new Error('The server did not confirm the saved location.')); return; }
    refreshLocations();
    navigate(locationPath?.(id) ?? `/locations/${encodeURIComponent(id)}`);
  }
  return <Stack gap={4}>
    <Text as="h2" type="display-3">{location ? 'Edit Location' : 'New Location'}</Text>
    <form onSubmit={(event) => {
      event.preventDefault();
      if (pending || !canWrite) return;
      setError('');
      if (location) update.save({ input: { id: location.id, name } }, (response) => completed(response.updateClogLocation?.clogLocation?.id), failed);
      else create.save({ input: { name } }, (response) => completed(response.createClogLocation?.clogLocation?.id), failed);
    }}>
      <Stack gap={4}>
        {error && <p role="alert">{error}</p>}
        <TextInput hasAutoFocus label="Name" value={name} onChange={setName} placeholder="Enter location name" isRequired isDisabled={!canWrite || pending} />
        <Stack direction="horizontal" gap={2}>
          <Button type="submit" label={location ? 'Update' : 'Create'} isLoading={pending} isDisabled={!canWrite || !name.trim()} />
          <Button type="button" label="Cancel" variant="ghost" isDisabled={pending} onClick={onClose} />
        </Stack>
      </Stack>
    </form>
  </Stack>;
}
