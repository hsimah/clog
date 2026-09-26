import { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import { Button } from '@astryxdesign/core/Button';
import type { ISODateString } from '@astryxdesign/core/Calendar';
import { DateInput } from '@astryxdesign/core/DateInput';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { ItemPicker, type ItemSelection } from '@/components/shared/ItemPicker';
import { LocationPicker, type LocationSelection } from '@/components/shared/LocationPicker';
import { useSaveMutation } from '@/relay/useSaveMutation';
import { useAddStock } from '@/relay/useAddStock';
import { useCanWrite } from '@/relay/useCanWrite';
import type { InventoryRouteContext } from '@/pages/inventory/InventoryPage';
import type { InventoryForm_inventory$key } from './__generated__/InventoryForm_inventory.graphql';
import type { InventoryFormUpdateMutation } from './__generated__/InventoryFormUpdateMutation.graphql';

export function InventoryForm({ inventoryRef }: { inventoryRef?: InventoryForm_inventory$key }) {
  const inventory = useFragment(graphql`fragment InventoryForm_inventory on ClogInventory { id dateAdded item { id name } location { id name } }`, inventoryRef ?? null);
  const create = useAddStock();
  const update = useSaveMutation<InventoryFormUpdateMutation>(graphql`
    mutation InventoryFormUpdateMutation($input: UpdateClogInventoryInput!) {
      updateClogInventory(input: $input) { clogInventory { id ...InventoryDetails_inventory ...InventoryForm_inventory } }
    }
  `);
  const navigate = useNavigate();
  const { refreshInventory, onClose, inventoryPath } = useOutletContext<InventoryRouteContext>();
  const canWrite = useCanWrite();
  const [item, setItem] = useState<ItemSelection | null>(inventory?.item ?? null);
  const [location, setLocation] = useState<LocationSelection | null>(inventory?.location ?? null);
  const [date, setDate] = useState<ISODateString | undefined>((inventory?.dateAdded.slice(0, 10) ?? new Date().toISOString().slice(0, 10)) as ISODateString);
  const heading = useRef<HTMLElement>(null);
  useEffect(() => { heading.current?.focus(); }, [inventory?.id]);
  const [error, setError] = useState('');
  const pending = create.pending || update.pending;
  const failed = (failure: Error) => setError(`${failure.message} Check inventory before retrying; changes may have been saved.`);
  function completed(id?: string) {
    if (!id) { failed(new Error('The stock change was not confirmed.')); return; }
    refreshInventory(); navigate(inventoryPath(`/${encodeURIComponent(id)}`));
  }
  return <Stack gap={4}>
    <Text as="h2" type="display-3" ref={heading} tabIndex={-1}>{inventory ? 'Edit Inventory' : 'New Inventory Entry'}</Text>
    <form onSubmit={(event) => {
      event.preventDefault();
      if (pending || !canWrite) return;
      if (!item || !location || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { setError('Choose an item, location and valid date.'); return; }
      const dateAdded = `${date}T00:00:00.000Z`;
      if (Number.isNaN(Date.parse(dateAdded)) || new Date(dateAdded).toISOString().slice(0, 10) !== date) { setError('Enter a valid date.'); return; }
      setError('');
      if (inventory) update.save({ input: { id: inventory.id, dateAdded } }, (response) => completed(response.updateClogInventory?.clogInventory?.id), failed);
      else create.save({ input: { item: item.id, location: location.id, dateAdded } }, (response) => completed(response.createClogInventory?.clogInventory?.id), failed);
    }}>
      <Stack gap={4}>
        {error && <p role="alert">{error}</p>}
        {inventory ? <><p>Item: {item?.name}</p><p>Location: {location?.name}</p></> : <>
          <ItemPicker value={item} onChange={setItem} disabled={!canWrite || pending} />
          <LocationPicker value={location} onChange={setLocation} disabled={!canWrite || pending} />
        </>}
        <DateInput label="Date Added" value={date} onChange={setDate} format="system_date" nativePicker="always" isDisabled={!canWrite || pending || !inventory} />
        <Stack direction="horizontal" gap={2}>
          <Button type="submit" label={inventory ? 'Update' : 'Create'} isLoading={pending} isDisabled={!canWrite || pending || !item || !location || !date} />
          <Button type="button" label="Cancel" variant="ghost" isDisabled={pending} onClick={onClose} />
        </Stack>
      </Stack>
    </form>
  </Stack>;
}
