import { useSyncExternalStore } from "react";
import { SESSION } from "../lib/session";

export function useIsAdmin() {
  return useSyncExternalStore(
    SESSION.subscribeSession,
    SESSION.getSessionSnapshot,
  ).isAdmin;
}
