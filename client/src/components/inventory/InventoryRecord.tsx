import { graphql, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { Text } from "@astryxdesign/core/Text";
import { InventoryDetails } from "./InventoryDetails";
import { InventoryForm } from "./InventoryForm";
import type { InventoryRecordQuery } from "./__generated__/InventoryRecordQuery.graphql";

const QUERY = graphql`
  query InventoryRecordQuery($id: ID!) {
    clogInventory(id: $id) {
      id
      ...InventoryDetails_inventory
      ...InventoryForm_inventory
    }
  }
`;

export function InventoryRecord({
  reference,
  edit = false,
}: {
  reference: PreloadedQuery<InventoryRecordQuery>;
  edit?: boolean;
}) {
  const { clogInventory } = usePreloadedQuery<InventoryRecordQuery>(
    QUERY,
    reference,
  );
  if (!clogInventory) return <Text>Inventory not found</Text>;
  return edit ? (
    <InventoryForm key={clogInventory.id} inventoryRef={clogInventory} />
  ) : (
    <InventoryDetails inventoryRef={clogInventory} />
  );
}
