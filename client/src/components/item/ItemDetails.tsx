import { useItemDetailsDeleteMutation } from "./details/useItemDetailsDeleteMutation";
import { useItemDetailsBarcodeMutation } from "./details/useItemDetailsBarcodeMutation";
import { useWorkspaceContext } from "../../app/useWorkspaceContext";
import { useEffect, useRef, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { Button } from "@astryxdesign/core/Button";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { BarcodeScannerDialog } from "../barcode/BarcodeScannerDialog";
import { useCanWrite } from "../../relay/useCanWrite";
import type { ItemDetails_item$key } from "./__generated__/ItemDetails_item.graphql";

export function ItemDetails({ itemRef }: { itemRef: ItemDetails_item$key }) {
  const {
    item,
    remove,
    onClose,
    itemPath,
    heading,
    error,
    scannerOpen,
    setScannerOpen,
    canWrite,
    pending,
    deleteItem,
    saveBarcode,
  } = useItemDetails({ itemRef });
  return (
    <Stack gap={4}>
      <Text as="h2" type="display-3" tabIndex={-1} ref={heading}>
        {item.name}
      </Text>
      <Text>Barcode: {item.barcode ?? "None"}</Text>
      <Text>Created {new Date(item.createdAt).toLocaleDateString()}</Text>
      <Text>{item.stockCount} stocked units</Text>
      {error && <Text role="alert">{error}</Text>}
      <Stack direction="horizontal" gap={2} wrap="wrap">
        <Button
          label="Edit"
          href={itemPath(item.id, true)}
          isDisabled={!canWrite || pending}
        />
        <Button
          label="Scan Barcode"
          variant="ghost"
          onClick={() => setScannerOpen(true)}
          isDisabled={!canWrite || pending}
        />
        <Button
          label="Delete"
          variant="destructive"
          isLoading={remove.pending}
          isDisabled={!canWrite || pending}
          onClick={deleteItem}
        />
        <Button
          label="Close"
          variant="ghost"
          onClick={onClose}
          isDisabled={pending}
        />
      </Stack>
      <BarcodeScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={saveBarcode}
      />
    </Stack>
  );
}

function useItemDetails({ itemRef }: { itemRef: ItemDetails_item$key }) {
  const item = useFragment(
    graphql`
      fragment ItemDetails_item on ClogItem {
        id
        name
        barcode
        createdAt
        stockCount
      }
    `,
    itemRef,
  );
  const remove = useItemDetailsDeleteMutation();
  const barcode = useItemDetailsBarcodeMutation();
  const { refreshItems, onClose, itemPath } = useWorkspaceContext();
  const heading = useRef<HTMLElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [item.id]);
  const [error, setError] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const canWrite = useCanWrite();
  const pending = remove.pending || barcode.pending;
  const failed = (failure: Error) =>
    setError(
      `${failure.message} Check inventory before retrying; changes may have been saved.`,
    );
  function deleteItem() {
    if (
      !window.confirm(
        `Delete ${item.name} and all ${item.stockCount} stocked units?`,
      )
    )
      return;
    setError("");
    remove.save(
      { input: { id: item.id } },
      (response) => {
        if (!response.deleteClogItem?.deletedId) {
          failed(new Error("Deletion was not confirmed."));
          return;
        }
        refreshItems();
        onClose();
      },
      failed,
    );
  }
  function saveBarcode(value: string) {
    setError("");
    barcode.save(
      { input: { id: item.id, barcode: value } },
      () => refreshItems(),
      failed,
    );
  }
  return {
    item,
    remove,
    onClose,
    itemPath,
    heading,
    error,
    scannerOpen,
    setScannerOpen,
    canWrite,
    pending,
    deleteItem,
    saveBarcode,
  };
}
