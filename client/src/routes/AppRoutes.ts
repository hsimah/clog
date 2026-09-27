import { defineRoute } from "@tsquid/routes/entrypoint";
import type { RouteState } from "./RouteState";
import { HOME_ENTRY_POINT } from "../components/home/Home.entrypoint";
import { ITEM_ENTRY_POINT } from "../components/item/Item.entrypoint";
import { LOCATION_ENTRY_POINT } from "../components/location/Location.entrypoint";
import { INVENTORY_ENTRY_POINT } from "../components/inventory/Inventory.entrypoint";
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
} from "./__generated__/routes";

export const APP_ROUTES = [
  defineRoute({
    uri: LocationNewURI,
    context: LocationNewRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "location",
      view: "new",
    }),
    entryPoint: LOCATION_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryNewURI,
    context: InventoryNewRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "inventory",
      view: "new",
    }),
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: ItemNewURI,
    context: ItemNewRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "item",
      view: "new",
    }),
    entryPoint: ITEM_ENTRY_POINT,
  }),
  defineRoute({
    uri: LocationIndexURI,
    context: LocationIndexRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "location",
      view: "list",
    }),
    entryPoint: LOCATION_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryIndexURI,
    context: InventoryIndexRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "inventory",
      view: "list",
    }),
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: ItemIndexURI,
    context: ItemIndexRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "item",
      view: "list",
    }),
    entryPoint: ITEM_ENTRY_POINT,
  }),
  defineRoute({
    uri: HomeURI,
    context: HomeRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "home",
      view: "list",
    }),
    entryPoint: HOME_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryStockLocationURI,
    context: InventoryStockLocationRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "inventory",
      view: "stock",
    }),
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryLocationEditURI,
    context: InventoryLocationEditRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "inventory",
      view: "location-edit",
    }),
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryItemEditURI,
    context: InventoryItemEditRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "inventory",
      view: "item-edit",
    }),
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryLocationDetailURI,
    context: InventoryLocationDetailRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "inventory",
      view: "location",
    }),
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryStockURI,
    context: InventoryStockRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "inventory",
      view: "stock",
    }),
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryItemDetailURI,
    context: InventoryItemDetailRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "inventory",
      view: "item",
    }),
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: LocationEditURI,
    context: LocationEditRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "location",
      view: "edit",
    }),
    entryPoint: LOCATION_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryEditURI,
    context: InventoryEditRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "inventory",
      view: "edit",
    }),
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: ItemEditURI,
    context: ItemEditRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "item",
      view: "edit",
    }),
    entryPoint: ITEM_ENTRY_POINT,
  }),
  defineRoute({
    uri: LocationDetailURI,
    context: LocationDetailRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "location",
      view: "detail",
    }),
    entryPoint: LOCATION_ENTRY_POINT,
  }),
  defineRoute({
    uri: InventoryDetailURI,
    context: InventoryDetailRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "inventory",
      view: "detail",
    }),
    entryPoint: INVENTORY_ENTRY_POINT,
  }),
  defineRoute({
    uri: ItemDetailURI,
    context: ItemDetailRouteContext,
    getRouteType: (input): RouteState => ({
      ...input,
      section: "item",
      view: "detail",
    }),
    entryPoint: ITEM_ENTRY_POINT,
  }),
];
