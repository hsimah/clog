import { defineRoute } from "@tsquid/routes/entrypoint";
import { HOME_ENTRY_POINT } from "../components/home/Home.entrypoint";
import { ITEM_ENTRY_POINT } from "../components/item/Item.entrypoint";
import { LOCATION_ENTRY_POINT } from "../components/location/Location.entrypoint";
import { INVENTORY_ENTRY_POINT } from "../components/inventory/Inventory.entrypoint";
import { USER_ENTRY_POINT } from "../components/user/User.entrypoint";
import {
  HomeURI,
  HomeRouteContext,
  ItemIndexURI,
  ItemIndexRouteContext,
  ItemNewURI,
  ItemNewRouteContext,
  ItemDetailURI,
  ItemDetailRouteContext,
  ItemEditURI,
  ItemEditRouteContext,
  LocationIndexURI,
  LocationIndexRouteContext,
  LocationNewURI,
  LocationNewRouteContext,
  LocationDetailURI,
  LocationDetailRouteContext,
  LocationEditURI,
  LocationEditRouteContext,
  InventoryIndexURI,
  InventoryIndexRouteContext,
  InventoryNewURI,
  InventoryNewRouteContext,
  InventoryDetailURI,
  InventoryDetailRouteContext,
  InventoryEditURI,
  InventoryEditRouteContext,
  InventoryItemDetailURI,
  InventoryItemDetailRouteContext,
  InventoryItemEditURI,
  InventoryItemEditRouteContext,
  InventoryLocationDetailURI,
  InventoryLocationDetailRouteContext,
  InventoryLocationEditURI,
  InventoryLocationEditRouteContext,
  InventoryStockURI,
  InventoryStockRouteContext,
  InventoryStockLocationURI,
  InventoryStockLocationRouteContext,
  UserIndexURI,
  UserIndexRouteContext,
  UserNewURI,
  UserNewRouteContext,
  UserDetailURI,
  UserDetailRouteContext,
} from "./__generated__/routes";

export const APP_ROUTES = [
  defineRoute({
    uri: UserNewURI,
    context: UserNewRouteContext,
    entryPoint: USER_ENTRY_POINT,
  }),
  defineRoute({
    uri: UserIndexURI,
    context: UserIndexRouteContext,
    entryPoint: USER_ENTRY_POINT,
  }),
  defineRoute({
    uri: UserDetailURI,
    context: UserDetailRouteContext,
    entryPoint: USER_ENTRY_POINT,
  }),
  defineRoute({
    uri: LocationNewURI,
    context: LocationNewRouteContext,
    entryPoint: LOCATION_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryNewURI,
    context: InventoryNewRouteContext,
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: ItemNewURI,
    context: ItemNewRouteContext,
    entryPoint: ITEM_ENTRY_POINT,
  }),
  defineRoute({
    uri: LocationIndexURI,
    context: LocationIndexRouteContext,
    entryPoint: LOCATION_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryIndexURI,
    context: InventoryIndexRouteContext,
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: ItemIndexURI,
    context: ItemIndexRouteContext,
    entryPoint: ITEM_ENTRY_POINT,
  }),
  defineRoute({
    uri: HomeURI,
    context: HomeRouteContext,
    entryPoint: HOME_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryStockLocationURI,
    context: InventoryStockLocationRouteContext,
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryLocationEditURI,
    context: InventoryLocationEditRouteContext,
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryItemEditURI,
    context: InventoryItemEditRouteContext,
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryLocationDetailURI,
    context: InventoryLocationDetailRouteContext,
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryStockURI,
    context: InventoryStockRouteContext,
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryItemDetailURI,
    context: InventoryItemDetailRouteContext,
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: LocationEditURI,
    context: LocationEditRouteContext,
    entryPoint: LOCATION_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryEditURI,
    context: InventoryEditRouteContext,
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: ItemEditURI,
    context: ItemEditRouteContext,
    entryPoint: ITEM_ENTRY_POINT,
  }),
  defineRoute({
    uri: LocationDetailURI,
    context: LocationDetailRouteContext,
    entryPoint: LOCATION_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryDetailURI,
    context: InventoryDetailRouteContext,
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: ItemDetailURI,
    context: ItemDetailRouteContext,
    entryPoint: ITEM_ENTRY_POINT,
  }),
];
