import { useSyncExternalStore } from "react";
import { SESSION } from "../lib/session";

export function useCanWrite() {
  return useSyncExternalStore(
    SESSION.subscribeSession,
    SESSION.getSessionSnapshot,
  ).canWrite;
}
