import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { useSaveMutation } from '@/relay/useSaveMutation';
import { useAddStock } from '@/relay/useAddStock';
import { useCanWrite } from '@/relay/useCanWrite';
import type { InventoryRouteContext } from '@/pages/inventory/InventoryPage';
import type { InventoryDetails_inventory$key } from './__generated__/InventoryDetails_inventory.graphql';
import type { InventoryDetailsDeleteMutation } from './__generated__/InventoryDetailsDeleteMutation.graphql';

export function InventoryDetails({ inventoryRef, onChanged }: { inventoryRef: InventoryDetails_inventory$key; onChanged?: () => void }) {
  const inventory = useFragment(graphql`fragment InventoryDetails_inventory on ClogInventory {
    id dateAdded createdAt item { id name } location { id name }
  }`, inventoryRef);
  const remove = useSaveMutation<InventoryDetailsDeleteMutation>(graphql`
    mutation InventoryDetailsDeleteMutation($input: DeleteClogInventoryInput!) { deleteClogInventory(input: $input) { deletedId @deleteRecord } }
  `);
  const add = useAddStock();
  const { refreshInventory, onClose, inventoryPath } = useOutletContext<InventoryRouteContext>();
  const heading = useRef<HTMLElement>(null);
  useEffect(() => { heading.current?.focus(); }, [inventory.id]);
  const [error, setError] = useState('');
  const canWrite = useCanWrite();
  const pending = remove.pending || add.pending;
  const failed = (failure: Error) => { setError(`${failure.message} Check inventory before retrying; changes may have been saved.`); refreshInventory(); };
  return <Stack gap={4}>
    <Text as="h2" type="display-3" tabIndex={-1} ref={heading}>Inventory Entry</Text>
    <p>Item: {inventory.item ? <Link href={inventoryPath(`/items/${encodeURIComponent(inventory.item.id)}`)}>{inventory.item.name}</Link> : 'Unavailable'}</p>
    <p>Location: {inventory.location ? <Link href={inventoryPath(`/locations/${encodeURIComponent(inventory.location.id)}`)}>{inventory.location.name}</Link> : 'Unavailable'}</p>
    <p>Date Added: {new Date(inventory.dateAdded).toLocaleDateString()}</p>
    <p>Created: {new Date(inventory.createdAt).toLocaleDateString()}</p>
    {error && <p role="alert">{error}</p>}
    <Stack direction="horizontal" gap={2} wrap="wrap">
      <Button label="Edit" href={inventoryPath(`/${encodeURIComponent(inventory.id)}/edit`)} isDisabled={!canWrite || pending} />
      <Button label="Add one here" isLoading={add.pending} isDisabled={!canWrite || pending || !inventory.item || !inventory.location} onClick={() => {
        if (!inventory.item || !inventory.location) return;
        setError('');
        add.save({ input: { item: inventory.item.id, location: inventory.location.id, dateAdded: new Date().toISOString() } }, (response) => {
          if (!response.createClogInventory?.clogInventory?.id) { failed(new Error('The stock addition was not confirmed.')); return; }
          refreshInventory(); onChanged?.();
        }, failed);
      }} />
      <Button label="Delete" variant="destructive" isLoading={remove.pending} isDisabled={!canWrite || pending} onClick={() => {
        if (!window.confirm('Remove this one stocked unit?')) return;
        setError(''); remove.save({ input: { id: inventory.id } }, (response) => {
          if (!response.deleteClogInventory?.deletedId) { failed(new Error('Deletion was not confirmed.')); return; }
          refreshInventory(); if (onChanged) onChanged(); else onClose();
        }, failed);
      }} />
      <Button label="Close" variant="ghost" onClick={onClose} isDisabled={pending} />
    </Stack>
  </Stack>;
}
