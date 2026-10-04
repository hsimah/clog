import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "@astryxdesign/core/Button";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { Stack } from "@astryxdesign/core/Stack";
import { Switch } from "@astryxdesign/core/Switch";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useWorkspaceContext } from "../../app/useWorkspaceContext";
import { getPasswordError } from "./__private__/getPasswordError";
import { useUserFormCreateMutation } from "./form/useUserFormCreateMutation";
import type { ClogUserRole } from "./form/__generated__/useUserFormCreateMutation.graphql";

const USERNAME_PATTERN = /^[a-zA-Z0-9_.@-]{1,100}$/;

export function UserForm() {
  const {
    onClose, pending, error,
    username, setUsername, password, setPassword,
    confirmation, setConfirmation, role, setRole, isAdmin, setIsAdmin,
    submit,
  } = useUserForm();
  return (
    <Stack gap={4}>
      <Text as="h2" type="display-3">
        New User
      </Text>
      <form onSubmit={submit}>
        <Stack gap={4}>
          {error && <Text role="alert">{error}</Text>}
          <TextInput
            hasAutoFocus
            label="Username"
            autoComplete="off"
            description="Letters, digits, and . _ @ - (up to 100 characters)."
            value={username}
            onChange={setUsername}
            isRequired
            isDisabled={pending}
          />
          <TextInput
            label="Password"
            type="password"
            autoComplete="new-password"
            description="Use 12–72 bytes (usually 12–72 characters)."
            value={password}
            onChange={setPassword}
            isRequired
            isDisabled={pending}
          />
          <TextInput
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={setConfirmation}
            isRequired
            isDisabled={pending}
          />
          <RadioList
            label="Role"
            value={role}
            onChange={setRole}
            isDisabled={pending}
          >
            <RadioListItem
              label="Reader"
              value="READER"
              description="Can view inventory."
            />
            <RadioListItem
              label="Editor"
              value="EDITOR"
              description="Can view and change inventory."
            />
          </RadioList>
          <Switch
            label="Administrator"
            description="Can add users, reset passwords, and delete users."
            value={isAdmin}
            onChange={setIsAdmin}
            isDisabled={pending}
          />
          <Stack direction="horizontal" gap={2}>
            <Button
              type="submit"
              label="Create user"
              isLoading={pending}
              isDisabled={!username.trim() || !password || !confirmation}
            />
            <Button
              type="button"
              label="Cancel"
              variant="ghost"
              isDisabled={pending}
              onClick={onClose}
            />
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
}

function useUserForm() {
  const create = useUserFormCreateMutation();
  const navigate = useNavigate();
  const { refreshUsers, onClose, userPath } = useWorkspaceContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [role, setRoleValue] = useState<ClogUserRole>("READER");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const pending = create.pending;

  function setRole(value: string) {
    setRoleValue(value === "EDITOR" ? "EDITOR" : "READER");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const name = username.trim();
    if (!USERNAME_PATTERN.test(name)) {
      return setError(
        "Username must be 1–100 letters, digits, or . _ @ - characters.",
      );
    }
    const invalid = getPasswordError(password, confirmation, "Password");
    if (invalid) return setError(invalid);
    setError("");
    create.save(
      { input: { username: name, password, role, isAdmin } },
      (response) => {
        const id = response.createClogUser?.clogUser.id;
        if (!id) {
          setError(
            "The server did not confirm the new user. Check the user list before retrying.",
          );
          return;
        }
        refreshUsers();
        navigate(userPath(id));
      },
      (failure) =>
        setError(
          `${failure.message} Check the user list before retrying; the user may have been created.`,
        ),
    );
  }

  return {
    onClose, pending, error,
    username, setUsername, password, setPassword,
    confirmation, setConfirmation, role, setRole, isAdmin, setIsAdmin,
    submit,
  };
}
