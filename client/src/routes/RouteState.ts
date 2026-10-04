/** URL inputs are validated by tsquid; the view determines the required selection. */
export type RouteState = {
  section: "home" | "item" | "location" | "inventory" | "user";
  term?: string;
  location?: string;
  barcode?: string;
} & (
  | { view: "list" | "new" }
  | {
      view:
        | "detail"
        | "edit"
        | "item"
        | "item-edit"
        | "location"
        | "location-edit";
      id: string;
    }
  | { view: "stock"; itemId: string; locationId?: string }
);
