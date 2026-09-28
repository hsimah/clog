import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { Stack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Text } from "@astryxdesign/core/Text";
import { useUserChangePasswordMutation } from "./password-dialog/useUserChangePasswordMutation";

export function UserPasswordDialog(props: UserPasswordDialogProps) {
  const {
    current, setCurrent, password, setPassword, confirmation, setConfirmation,
    error, pending, submit, close,
  } = useUserPasswordDialog(props);
  return (
    <Dialog
      isOpen
      onOpenChange={close}
      width={480}
      purpose={pending ? "required" : "form"}
      padding={4}
    >
      <DialogHeader title="Change password" onOpenChange={close} />
      <form onSubmit={submit}>
        <Stack gap={4}>
          <TextInput
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={setCurrent}
            isRequired
            isDisabled={pending}
          />
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
          {error && <Text role="alert">{error}</Text>}
          <Stack direction="horizontal" gap={2}>
            <Button
              label="Cancel"
              variant="ghost"
              onClick={() => close(false)}
              isDisabled={pending}
            />
            <Button
              label="Change password"
              variant="primary"
              type="submit"
              isLoading={pending}
            />
          </Stack>
        </Stack>
      </form>
    </Dialog>
  );
}

function useUserPasswordDialog({
  userId, onClose, onCompleted,
}: UserPasswordDialogProps) {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const { save, pending } = useUserChangePasswordMutation();

  function close(open: boolean) {
    if (!open && !inFlight.current) onClose();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    const length = new TextEncoder().encode(password).length;
    if (!current) return setError("Enter your current password.");
    if (length < 12 || length > 72 || password.includes("\0")) {
      return setError("New password must be 12–72 bytes and contain no null characters.");
    }
    if (password !== confirmation) return setError("New passwords do not match.");
    setError("");
    inFlight.current = true;
    save(
      { input: { id: userId, currentPassword: current, newPassword: password } },
      () => {
        inFlight.current = false;
        onCompleted();
      },
      (failure) => {
        inFlight.current = false;
        setError(failure.message);
      },
    );
  }
  return {
    current, setCurrent, password, setPassword, confirmation, setConfirmation,
    error, pending, submit, close,
  };
}

interface UserPasswordDialogProps {
  userId: string;
  onClose: () => void;
  onCompleted: () => void;
}
