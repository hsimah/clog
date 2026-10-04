import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { graphql, useFragment } from "react-relay";
import { Button } from "@astryxdesign/core/Button";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useWorkspaceContext } from "../../app/useWorkspaceContext";
import { getUserAccessLabel } from "./__private__/getUserAccessLabel";
import { getPasswordError } from "./__private__/getPasswordError";
import { useUserDetailsDeleteMutation } from "./details/useUserDetailsDeleteMutation";
import { useUserDetailsResetPasswordMutation } from "./details/useUserDetailsResetPasswordMutation";
import type { UserDetails_user$key } from "./__generated__/UserDetails_user.graphql";

export function UserDetails({ userRef }: { userRef: UserDetails_user$key }) {
  const {
    user, heading, onClose, pending, error, message,
    password, setPassword, confirmation, setConfirmation,
    resetPassword, deleteUser,
  } = useUserDetails({ userRef });
  return (
    <Stack gap={4}>
      <Text as="h2" type="display-3" tabIndex={-1} ref={heading}>
        {user.username}
      </Text>
      <Text>Access: {getUserAccessLabel(user)}</Text>
      <Text>Status: {user.isEnabled ? "Active" : "Disabled"}</Text>
      {user.isViewer ? (
        <Text>
          This is your account. Use Change password in the account menu; you
          cannot delete your own account.
        </Text>
      ) : (
        <form onSubmit={resetPassword}>
          <Stack gap={4}>
            <Text as="h3" type="large">
              Reset password
            </Text>
            <TextInput
              label="New password"
              type="password"
              autoComplete="new-password"
              description="Use 12–72 bytes (usually 12–72 characters)."
              value={password}
              onChange={setPassword}
              isRequired
              isDisabled={pending}
            />
            <TextInput
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={setConfirmation}
              isRequired
              isDisabled={pending}
            />
            <Button
              type="submit"
              label="Reset password"
              isLoading={pending}
              isDisabled={!password || !confirmation}
            />
          </Stack>
        </form>
      )}
      {error && <Text role="alert">{error}</Text>}
      {message && <Text role="status">{message}</Text>}
      <Stack direction="horizontal" gap={2} wrap="wrap">
        <Button
          label="Delete user"
          variant="destructive"
          isLoading={pending}
          isDisabled={user.isViewer}
          onClick={deleteUser}
        />
        <Button
          label="Close"
          variant="ghost"
          onClick={onClose}
          isDisabled={pending}
        />
      </Stack>
    </Stack>
  );
}

function useUserDetails({ userRef }: { userRef: UserDetails_user$key }) {
  const user = useFragment(
    graphql`
      fragment UserDetails_user on ClogUser {
        id
        username
        role
        isAdmin
        isEnabled
        isViewer
      }
    `,
    userRef,
  );
  const reset = useUserDetailsResetPasswordMutation();
  const remove = useUserDetailsDeleteMutation();
  const { refreshUsers, onClose } = useWorkspaceContext();
  const heading = useRef<HTMLElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [user.id]);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const pending = reset.pending || remove.pending;

  function resetPassword(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setMessage("");
    const invalid = getPasswordError(password, confirmation);
    if (invalid) return setError(invalid);
    setError("");
    reset.save(
      { input: { id: user.id, newPassword: password } },
      () => {
        setPassword("");
        setConfirmation("");
        setMessage(`Password reset for ${user.username}. They have been signed out.`);
      },
      (failure) =>
        setError(
          `${failure.message} The password may have changed; check before retrying.`,
        ),
    );
  }

  function deleteUser() {
    if (pending || user.isViewer) return;
    if (!window.confirm(`Delete ${user.username}? They will be signed out.`)) {
      return;
    }
    setError("");
    setMessage("");
    remove.save(
      { input: { id: user.id } },
      (response) => {
        if (!response.deleteClogUser?.deletedId) {
          setError(
            "The server did not confirm deletion. Check the user list before retrying.",
          );
          return;
        }
        refreshUsers();
        onClose();
      },
      (failure) =>
        setError(
          `${failure.message} Check the user list before retrying; the user may have been deleted.`,
        ),
    );
  }

  return {
    user, heading, onClose, pending, error, message,
    password, setPassword, confirmation, setConfirmation,
    resetPassword, deleteUser,
  };
}
