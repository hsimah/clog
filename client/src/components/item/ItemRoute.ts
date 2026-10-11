import { createElement } from "react";
import { RouteName, useItemRouteContext } from "../../routes/__generated__/routes";
import type { EntryPointProps } from "@tsquid/routes/entrypoint";
import type { ItemPageQuery } from "../item/__generated__/ItemPageQuery.graphql";
import type { ItemRecordQuery } from "../item/__generated__/ItemRecordQuery.graphql";
import { ItemPage } from "./ItemPage";
import { ItemRecord } from "../item/ItemRecord";
import { ItemForm } from "../item/ItemForm";

export function ItemRoute({ queries }: ItemRouteProps) {
  const route = useItemRouteContext();
  const edit = route.currentRoute === RouteName.ItemEdit;
  const detail =
    route.currentRoute === RouteName.ItemNew
      ? createElement(ItemForm, { initialBarcode: route.input.barcode })
      : queries.record
        ? createElement(ItemRecord, { reference: queries.record, edit })
        : null;
  return createElement(ItemPage, { reference: queries.page, detail });
}

export type ItemRouteProps = EntryPointProps<ItemRouteQueries>;

export type ItemRouteQueries = {
  page: ItemPageQuery;
  record?: ItemRecordQuery;
};
