import { createContext } from "react";

export const WORKSPACE_CONTEXT = createContext<WorkspaceContext | null>(null);

export type WorkspaceContext = {
  refreshItems: () => void;
  refreshLocations: () => void;
  refreshInventory: () => void;
  refreshUsers: () => void;
  onClose: () => void;
  newPath: string;
  itemPath: (id: string, edit?: boolean) => string;
  locationPath: (id: string, edit?: boolean) => string;
  inventoryRecordPath: (id: string, edit?: boolean) => string;
  stockPath: (itemId: string, locationId?: string | null) => string;
  userPath: (id: string) => string;
};
