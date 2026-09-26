import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { BarcodeScannerDialog } from '@/components/barcode/BarcodeScannerDialog';
import { LocationPicker, type LocationSelection } from '@/components/shared/LocationPicker';
import { useSaveMutation } from '@/relay/useSaveMutation';
import { useAddStock } from '@/relay/useAddStock';
import { useCanWrite } from '@/relay/useCanWrite';
import type { ItemRouteContext } from '@/pages/items/ItemsPage';
import type { ItemForm_item$key } from './__generated__/ItemForm_item.graphql';
import type { ItemFormCreateMutation } from './__generated__/ItemFormCreateMutation.graphql';
import type { ItemFormUpdateMutation } from './__generated__/ItemFormUpdateMutation.graphql';

interface ItemFormProps { itemRef?: ItemForm_item$key; initialBarcode?: string }
export function ItemForm({ itemRef, initialBarcode }: ItemFormProps) {
  const item = useFragment(graphql`fragment ItemForm_item on ClogItem { id name barcode }`, itemRef ?? null);
  const create = useSaveMutation<ItemFormCreateMutation>(graphql`
    mutation ItemFormCreateMutation($input: CreateClogItemInput!) {
      createClogItem(input: $input) { clogItem { id ...ItemDetails_item ...ItemForm_item } }
    }
  `);
  const update = useSaveMutation<ItemFormUpdateMutation>(graphql`
    mutation ItemFormUpdateMutation($input: UpdateClogItemInput!) {
      updateClogItem(input: $input) { clogItem { id ...ItemDetails_item ...ItemForm_item } }
    }
  `);
  const stock = useAddStock();
  const navigate = useNavigate();
  const { refreshItems, onClose, itemPath } = useOutletContext<ItemRouteContext>();
  const canWrite = useCanWrite();
  const [name, setName] = useState(item?.name ?? '');
  const [barcode, setBarcode] = useState(item?.barcode ?? initialBarcode ?? '');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [location, setLocation] = useState<LocationSelection | null>(null);
  const [count, setCount] = useState(0);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'saving' | 'stocking' | 'stopped'>('idle');
  const [error, setError] = useState('');
  const busy = phase === 'saving' || phase === 'stocking';
  const locked = !canWrite || busy || savedId !== null;
  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);
  function finish(id: string) {
    setPhase('idle'); refreshItems(); navigate(itemPath?.(id) ?? `/items/${encodeURIComponent(id)}`);
  }
  function failed(failure: Error) {
    setPhase('stopped');
    setError(`${failure.message} Check inventory before retrying; changes may have been saved.`);
    refreshItems();
  }
  function addInitialStock(id: string, locationId: string, total: number, completed: number) {
    if (completed === total) { finish(id); return; }
    setPhase('stocking');
    stock.save({ input: { item: id, location: locationId, dateAdded: new Date().toISOString() } }, (response) => {
      if (!response.createClogInventory?.clogInventory?.id) { failed(new Error('The next stock addition was not confirmed.')); return; }
      setConfirmed(completed + 1);
      addInitialStock(id, locationId, total, completed + 1);
    }, failed);
  }
  return <Stack gap={4}>
    <Text as="h2" type="display-3">{item ? 'Edit Item' : 'New Item'}</Text>
    {savedId && <Stack gap={2}>
      <p>Item saved. {confirmed} of {count} initial stock additions confirmed.</p>
      {phase === 'stopped' && <p>The next addition may also have been saved. Review the stock before adding any remaining units. The item will not be created again.</p>}
      <Link href={`/items/${encodeURIComponent(savedId)}`}>Review saved item</Link>
    </Stack>}
    {busy && <p role="status">{phase === 'saving' ? 'Saving item…' : 'Adding stock…'} Stay on this page. Leaving stops the batch, but the current change may still be saved.</p>}
    <form onSubmit={(event) => {
      event.preventDefault();
      if (locked) return;
      if (!Number.isSafeInteger(count) || count < 0) { setError('Enter a whole, non-negative count.'); return; }
      if (!item && count > 0 && !location) { setError('Choose a location for the initial stock.'); return; }
      setError(''); setPhase('saving');
      const fields = { name, barcode: barcode.trim() || null };
      if (item) update.save({ input: { id: item.id, ...fields } }, (response) => {
        const id = response.updateClogItem?.clogItem?.id;
        if (id) finish(id); else failed(new Error('The item update was not confirmed.'));
      }, failed);
      else create.save({ input: fields }, (response) => {
        const id = response.createClogItem?.clogItem?.id;
        if (!id) { failed(new Error('Item creation was not confirmed.')); return; }
        setSavedId(id); refreshItems();
        if (location && count > 0) addInitialStock(id, location.id, count, 0);
        else finish(id);
      }, failed);
    }}>
      <Stack gap={4}>
        {error && <p role="alert">{error}</p>}
        <TextInput hasAutoFocus label="Name" value={name} onChange={setName} placeholder="Enter item name" isRequired isDisabled={locked} />
        <TextInput label="Barcode (optional)" value={barcode} onChange={setBarcode} placeholder="Enter barcode" isDisabled={locked} />
        <Button label="Scan barcode" type="button" variant="ghost" onClick={() => setScannerOpen(true)} isDisabled={locked} />
        {!item && <Stack gap={3}>
          <Text as="h3" type="label">Initial inventory (optional)</Text>
          <NumberInput label="Count" value={count} onChange={setCount} min={0} isIntegerOnly isDisabled={locked} />
          {count > 0 && <LocationPicker value={location} onChange={setLocation} disabled={locked} />}
        </Stack>}
        <Stack direction="horizontal" gap={2}>
          <Button type="submit" label={item ? 'Update' : 'Create'} isLoading={busy} isDisabled={locked || !name.trim()} />
          <Button type="button" label="Cancel" variant="ghost" isDisabled={busy} onClick={onClose} />
        </Stack>
      </Stack>
    </form>
    <BarcodeScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onScan={setBarcode} />
  </Stack>;
}
