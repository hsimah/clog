import { useNavigate } from "react-router";
import {
  ItemIndexURI,
  ItemNewURI,
  ItemDetailURI,
  ItemEditURI,
  LocationIndexURI,
  LocationNewURI,
  LocationDetailURI,
  LocationEditURI,
  InventoryDetailURI,
  InventoryEditURI,
  InventoryStockURI,
  InventoryStockLocationURI,
  InventoryIndexURI,
  InventoryNewURI,
  InventoryItemDetailURI,
  InventoryItemEditURI,
  InventoryLocationDetailURI,
  InventoryLocationEditURI,
  UserIndexURI,
  UserNewURI,
  UserDetailURI,
} from "../routes/__generated__/routes";
import type { WorkspaceContext } from "./WorkspaceContext";

export function useWorkspaceActions(
  section: "item" | "location" | "inventory" | "user",
  input: { term?: string; location?: string },
  refresh: () => void,
): WorkspaceContext {
  const navigate = useNavigate();
  const filters = { term: input.term, location: input.location };
  const parent =
    section === "item"
      ? ItemIndexURI.getURI(filters)
      : section === "location"
        ? LocationIndexURI.getURI(filters)
        : section === "user"
          ? UserIndexURI.getURI({})
          : InventoryIndexURI.getURI(filters);
  return {
    refreshItems: refresh,
    refreshLocations: refresh,
    refreshInventory: refresh,
    refreshUsers: refresh,
    onClose: () => navigate(parent),
    newPath:
      section === "item"
        ? ItemNewURI.getURI(filters)
        : section === "location"
          ? LocationNewURI.getURI(filters)
          : section === "user"
            ? UserNewURI.getURI({})
            : InventoryNewURI.getURI(filters),
    itemPath: (id, edit = false) =>
      section === "inventory"
        ? (edit ? InventoryItemEditURI : InventoryItemDetailURI).getURI({
            ...filters,
            id,
          })
        : (edit ? ItemEditURI : ItemDetailURI).getURI({ ...filters, id }),
    locationPath: (id, edit = false) =>
      section === "inventory"
        ? (edit ? InventoryLocationEditURI : InventoryLocationDetailURI).getURI(
            { ...filters, id },
          )
        : (edit ? LocationEditURI : LocationDetailURI).getURI({
            ...filters,
            id,
          }),
    inventoryRecordPath: (id, edit = false) =>
      (edit ? InventoryEditURI : InventoryDetailURI).getURI({ ...filters, id }),
    stockPath: (itemId, locationId) =>
      locationId
        ? InventoryStockLocationURI.getURI({ ...filters, itemId, locationId })
        : InventoryStockURI.getURI({ ...filters, itemId }),
    userPath: (id) => UserDetailURI.getURI({ id }),
  };
}
