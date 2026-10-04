import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router";
import { Avatar } from "@astryxdesign/core/Avatar";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import { Text } from "@astryxdesign/core/Text";
import { SESSION } from "../../lib/session";
import { UserIndexURI } from "../../routes/__generated__/routes";
import { UserPasswordDialog } from "./UserPasswordDialog";

export function UserMenu() {
  const { open, setOpen, message, completed, session, triggerRef, items } =
    useUserMenu();
  return (
    <>
      <DropdownMenu
        button={{
          label: "Account menu",
          ref: triggerRef,
          variant: "ghost",
          isIconOnly: true,
          icon: <Avatar size="sm" alt="Account" tooltip={false} />,
        }}
        hasChevron={false}
        presentation="popover"
        alignment="end"
        items={items}
      />
      {message && <Text role="status">{message}</Text>}
      {open && session.status === "active" && session.userId && (
        <UserPasswordDialog
          userId={session.userId}
          onClose={() => setOpen(false)}
          onCompleted={completed}
        />
      )}
    </>
  );
}

function useUserMenu() {
  const navigate = useNavigate();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const session = useSyncExternalStore(
    SESSION.subscribeSession,
    SESSION.getSessionSnapshot,
  );
  // The menu item that opened the dialog unmounts, so restore its stable trigger.
  useEffect(() => {
    if (wasOpen.current && !open && session.status === "active") {
      triggerRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open, session.status]);
  function completed() {
    setOpen(false);
    setMessage("Password changed.");
  }
  const items = [
    ...(session.isAdmin
      ? [{ label: "Manage users", onClick: () => navigate(UserIndexURI.getURI({})) }]
      : []),
    { label: "Change password", onClick: () => setOpen(true) },
    { label: "Sign out", onClick: signOut },
  ];
  function signOut() {
    if (window.confirm("Sign out? Unsaved changes in Clog tabs will be discarded.")) {
      void SESSION.logout().catch(() => setMessage("Could not sign out. Please try again."));
    }
  }
  return { open, setOpen, message, completed, session, triggerRef, items };
}
