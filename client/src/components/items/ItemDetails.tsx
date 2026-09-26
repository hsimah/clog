import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import { Button } from '@astryxdesign/core/Button';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { BarcodeScannerDialog } from '@/components/barcode/BarcodeScannerDialog';
import { useSaveMutation } from '@/relay/useSaveMutation';
import { useCanWrite } from '@/relay/useCanWrite';
import type { ItemRouteContext } from '@/pages/items/ItemsPage';
import type { ItemDetails_item$key } from './__generated__/ItemDetails_item.graphql';
import type { ItemDetailsDeleteMutation } from './__generated__/ItemDetailsDeleteMutation.graphql';
import type { ItemDetailsBarcodeMutation } from './__generated__/ItemDetailsBarcodeMutation.graphql';

export function ItemDetails({ itemRef }: { itemRef: ItemDetails_item$key }) {
  const item = useFragment(graphql`fragment ItemDetails_item on ClogItem { id name barcode createdAt stockCount }`, itemRef);
  const remove = useSaveMutation<ItemDetailsDeleteMutation>(graphql`
    mutation ItemDetailsDeleteMutation($input: DeleteClogItemInput!) { deleteClogItem(input: $input) { deletedId @deleteRecord } }
  `);
  const barcode = useSaveMutation<ItemDetailsBarcodeMutation>(graphql`
    mutation ItemDetailsBarcodeMutation($input: UpdateClogItemInput!) { updateClogItem(input: $input) { clogItem { ...ItemDetails_item } } }
  `);
  const { refreshItems, onClose, itemPath } = useOutletContext<ItemRouteContext>();
  const heading = useRef<HTMLElement>(null);
  useEffect(() => { heading.current?.focus(); }, [item.id]);
  const [error, setError] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const canWrite = useCanWrite();
  const pending = remove.pending || barcode.pending;
  const failed = (failure: Error) => setError(`${failure.message} Check inventory before retrying; changes may have been saved.`);
  return <Stack gap={4}>
    <Text as="h2" type="display-3" tabIndex={-1} ref={heading}>{item.name}</Text>
    <p>Barcode: {item.barcode ?? 'None'}</p>
    <p>Created {new Date(item.createdAt).toLocaleDateString()}</p>
    <p>{item.stockCount} stocked units</p>
    {error && <p role="alert">{error}</p>}
    <Stack direction="horizontal" gap={2} wrap="wrap">
      <Button label="Edit" href={itemPath?.(item.id, true) ?? `/items/${encodeURIComponent(item.id)}/edit`} isDisabled={!canWrite || pending} />
      <Button label="Scan Barcode" variant="ghost" onClick={() => setScannerOpen(true)} isDisabled={!canWrite || pending} />
      <Button label="Delete" variant="destructive" isLoading={remove.pending} isDisabled={!canWrite || pending} onClick={() => {
        if (!window.confirm(`Delete ${item.name} and all ${item.stockCount} stocked units?`)) return;
        setError('');
        remove.save({ input: { id: item.id } }, (response) => {
          if (!response.deleteClogItem?.deletedId) { failed(new Error('Deletion was not confirmed.')); return; }
          refreshItems(); onClose();
        }, failed);
      }} />
      <Button label="Close" variant="ghost" onClick={onClose} isDisabled={pending} />
    </Stack>
    <BarcodeScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onScan={(value) => {
      setError('');
      barcode.save({ input: { id: item.id, barcode: value } }, () => refreshItems(), failed);
    }} />
  </Stack>;
}
