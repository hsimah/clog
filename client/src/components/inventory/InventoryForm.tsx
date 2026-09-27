import { useInventoryFormUpdateMutation } from "./form/useInventoryFormUpdateMutation";
import { useWorkspaceContext } from "../../app/useWorkspaceContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { graphql, useFragment } from "react-relay";
import { Button } from "@astryxdesign/core/Button";
import type { ISODateString } from "@astryxdesign/core/Calendar";
import { DateInput } from "@astryxdesign/core/DateInput";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { ItemPicker, type ItemPickerSelection } from "../item/ItemPicker";
import {
  LocationPicker,
  type LocationPickerSelection,
} from "../location/LocationPicker";
import { INVENTORY_STOCK } from "../inventory/InventoryStock";
import { useCanWrite } from "../../relay/useCanWrite";
import type { InventoryForm_inventory$key } from "./__generated__/InventoryForm_inventory.graphql";

export function InventoryForm({
  inventoryRef,
}: {
  inventoryRef?: InventoryForm_inventory$key;
}) {
  const {
    inventory,
    onClose,
    canWrite,
    item,
    setItem,
    location,
    setLocation,
    date,
    setDate,
    heading,
    error,
    pending,
    submit,
  } = useInventoryForm({ inventoryRef });
  return (
    <Stack gap={4}>
      <Text as="h2" type="display-3" ref={heading} tabIndex={-1}>
        {inventory ? "Edit Inventory" : "New Inventory Entry"}
      </Text>
      <form onSubmit={submit}>
        <Stack gap={4}>
          {error && <Text role="alert">{error}</Text>}
          {inventory ? (
            <>
              <Text>Item: {item?.name}</Text>
              <Text>Location: {location?.name}</Text>
            </>
          ) : (
            <>
              <ItemPicker
                value={item}
                onChange={setItem}
                disabled={!canWrite || pending}
              />
              <LocationPicker
                value={location}
                onChange={setLocation}
                disabled={!canWrite || pending}
              />
            </>
          )}
          <DateInput
            label="Date Added"
            value={date}
            onChange={setDate}
            format="system_date"
            nativePicker="always"
            isDisabled={!canWrite || pending || !inventory}
          />
          <Stack direction="horizontal" gap={2}>
            <Button
              type="submit"
              label={inventory ? "Update" : "Create"}
              isLoading={pending}
              isDisabled={!canWrite || pending || !item || !location || !date}
            />
            <Button
              type="button"
              label="Cancel"
              variant="ghost"
              isDisabled={pending}
              onClick={onClose}
            />
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
}

function useInventoryForm({
  inventoryRef,
}: {
  inventoryRef?: InventoryForm_inventory$key;
}) {
  const inventory = useFragment(
    graphql`
      fragment InventoryForm_inventory on ClogInventory {
        id
        dateAdded
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
    inventoryRef ?? null,
  );
  const create = INVENTORY_STOCK.useAdd();
  const update = useInventoryFormUpdateMutation();
  const navigate = useNavigate();
  const { refreshInventory, onClose, inventoryRecordPath } =
    useWorkspaceContext();
  const canWrite = useCanWrite();
  const [item, setItem] = useState<ItemPickerSelection | null>(
    inventory?.item ?? null,
  );
  const [location, setLocation] = useState<LocationPickerSelection | null>(
    inventory?.location ?? null,
  );
  const [date, setDate] = useState<ISODateString | undefined>(
    (inventory?.dateAdded.slice(0, 10) ??
      new Date().toISOString().slice(0, 10)) as ISODateString,
  );
  const heading = useRef<HTMLElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [inventory?.id]);
  const [error, setError] = useState("");
  const pending = create.pending || update.pending;
  const failed = (failure: Error) =>
    setError(
      `${failure.message} Check inventory before retrying; changes may have been saved.`,
    );
  function completed(id?: string) {
    if (!id) {
      failed(new Error("The stock change was not confirmed."));
      return;
    }
    refreshInventory();
    navigate(inventoryRecordPath(id));
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !canWrite) return;
    if (!item || !location || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("Choose an item, location and valid date.");
      return;
    }
    const dateAdded = `${date}T00:00:00.000Z`;
    if (
      Number.isNaN(Date.parse(dateAdded)) ||
      new Date(dateAdded).toISOString().slice(0, 10) !== date
    ) {
      setError("Enter a valid date.");
      return;
    }
    setError("");
    if (inventory)
      update.save(
        { input: { id: inventory.id, dateAdded } },
        (response) =>
          completed(response.updateClogInventory?.clogInventory?.id),
        failed,
      );
    else
      create.save(
        { input: { item: item.id, location: location.id, dateAdded } },
        (response) =>
          completed(response.createClogInventory?.clogInventory?.id),
        failed,
      );
  }
  return {
    inventory,
    onClose,
    canWrite,
    item,
    setItem,
    location,
    setLocation,
    date,
    setDate,
    heading,
    error,
    pending,
    submit,
  };
}
