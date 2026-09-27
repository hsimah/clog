import { useInventoryDetailsDeleteMutation } from "./details/useInventoryDetailsDeleteMutation";
import { useWorkspaceContext } from "../../app/useWorkspaceContext";
import { useEffect, useRef, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { Button } from "@astryxdesign/core/Button";
import { Link } from "@astryxdesign/core/Link";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { INVENTORY_STOCK } from "../inventory/InventoryStock";
import { useCanWrite } from "../../relay/useCanWrite";
import type { InventoryDetails_inventory$key } from "./__generated__/InventoryDetails_inventory.graphql";

export function InventoryDetails({
  inventoryRef,
  onChanged,
}: {
  inventoryRef: InventoryDetails_inventory$key;
  onChanged?: () => void;
}) {
  const {
    inventory,
    remove,
    add,
    onClose,
    itemPath,
    locationPath,
    inventoryRecordPath,
    heading,
    error,
    canWrite,
    pending,
    addUnit,
    deleteUnit,
  } = useInventoryDetails({ inventoryRef, onChanged });
  return (
    <Stack gap={4}>
      <Text as="h2" type="display-3" tabIndex={-1} ref={heading}>
        Inventory Entry
      </Text>
      <Text>
        Item:{" "}
        {inventory.item ? (
          <Link href={itemPath(inventory.item.id)}>{inventory.item.name}</Link>
        ) : (
          "Unavailable"
        )}
      </Text>
      <Text>
        Location:{" "}
        {inventory.location ? (
          <Link href={locationPath(inventory.location.id)}>
            {inventory.location.name}
          </Link>
        ) : (
          "Unavailable"
        )}
      </Text>
      <Text>
        Date Added: {new Date(inventory.dateAdded).toLocaleDateString()}
      </Text>
      <Text>Created: {new Date(inventory.createdAt).toLocaleDateString()}</Text>
      {error && <Text role="alert">{error}</Text>}
      <Stack direction="horizontal" gap={2} wrap="wrap">
        <Button
          label="Edit"
          href={inventoryRecordPath(inventory.id, true)}
          isDisabled={!canWrite || pending}
        />
        <Button
          label="Add one here"
          isLoading={add.pending}
          isDisabled={
            !canWrite || pending || !inventory.item || !inventory.location
          }
          onClick={addUnit}
        />
        <Button
          label="Delete"
          variant="destructive"
          isLoading={remove.pending}
          isDisabled={!canWrite || pending}
          onClick={deleteUnit}
        />
        <Button
          label="Close"
          variant="ghost"
          onClick={onClose}
          isDisabled={pending}
        />
      </Stack>
    </Stack>
  );
}

function useInventoryDetails({
  inventoryRef,
  onChanged,
}: {
  inventoryRef: InventoryDetails_inventory$key;
  onChanged?: () => void;
}) {
  const inventory = useFragment(
    graphql`
      fragment InventoryDetails_inventory on ClogInventory {
        id
        dateAdded
        createdAt
        item {
          id
          name
        }
        location {
          id
          name
        }
      }
    `,
    inventoryRef,
  );
  const remove = useInventoryDetailsDeleteMutation();
  const add = INVENTORY_STOCK.useAdd();
  const {
    refreshInventory,
    onClose,
    itemPath,
    locationPath,
    inventoryRecordPath,
  } = useWorkspaceContext();
  const heading = useRef<HTMLElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [inventory.id]);
  const [error, setError] = useState("");
  const canWrite = useCanWrite();
  const pending = remove.pending || add.pending;
  const failed = (failure: Error) => {
    setError(
      `${failure.message} Check inventory before retrying; changes may have been saved.`,
    );
    refreshInventory();
  };
  function addUnit() {
    if (!inventory.item || !inventory.location) return;
    setError("");
    add.save(
      {
        input: {
          item: inventory.item.id,
          location: inventory.location.id,
          dateAdded: new Date().toISOString(),
        },
      },
      (response) => {
        if (!response.createClogInventory?.clogInventory?.id) {
          failed(new Error("The stock addition was not confirmed."));
          return;
        }
        refreshInventory();
        onChanged?.();
      },
      failed,
    );
  }
  function deleteUnit() {
    if (!window.confirm("Remove this one stocked unit?")) return;
    setError("");
    remove.save(
      { input: { id: inventory.id } },
      (response) => {
        if (!response.deleteClogInventory?.deletedId) {
          failed(new Error("Deletion was not confirmed."));
          return;
        }
        refreshInventory();
        if (onChanged) onChanged();
        else onClose();
      },
      failed,
    );
  }
  return {
    inventory,
    remove,
    add,
    onClose,
    itemPath,
    locationPath,
    inventoryRecordPath,
    heading,
    error,
    canWrite,
    pending,
    addUnit,
    deleteUnit,
  };
}
