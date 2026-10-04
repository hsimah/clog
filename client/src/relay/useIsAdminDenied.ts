import { useSyncExternalStore } from "react";
import { SESSION } from "../lib/session";

// Only a verified session denies administration. While SessionBoundary hides an
// unverified or expired session, admin forms stay mounted so drafts survive.
export function useIsAdminDenied() {
  const session = useSyncExternalStore(
    SESSION.subscribeSession,
    SESSION.getSessionSnapshot,
  );
  return session.status === "active" && !session.isAdmin;
}
