import { useLocationFormCreateMutation } from "./form/useLocationFormCreateMutation";
import { useLocationFormUpdateMutation } from "./form/useLocationFormUpdateMutation";
import { useWorkspaceContext } from "../../app/useWorkspaceContext";
import { useState } from "react";
import { useNavigate } from "react-router";
import { graphql, useFragment } from "react-relay";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useCanWrite } from "../../relay/useCanWrite";
import type { LocationForm_location$key } from "./__generated__/LocationForm_location.graphql";

export function LocationForm({
  locationRef,
}: {
  locationRef?: LocationForm_location$key;
}) {
  const { location, onClose, canWrite, name, setName, error, pending, submit } =
    useLocationForm({ locationRef });
  return (
    <Stack gap={4}>
      <Text as="h2" type="display-3">
        {location ? "Edit Location" : "New Location"}
      </Text>
      <form onSubmit={submit}>
        <Stack gap={4}>
          {error && <Text role="alert">{error}</Text>}
          <TextInput
            hasAutoFocus
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Enter location name"
            isRequired
            isDisabled={!canWrite || pending}
          />
          <Stack direction="horizontal" gap={2}>
            <Button
              type="submit"
              label={location ? "Update" : "Create"}
              isLoading={pending}
              isDisabled={!canWrite || !name.trim()}
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

function useLocationForm({
  locationRef,
}: {
  locationRef?: LocationForm_location$key;
}) {
  const location = useFragment(
    graphql`
      fragment LocationForm_location on ClogLocation {
        id
        name
      }
    `,
    locationRef ?? null,
  );
  const create = useLocationFormCreateMutation();
  const update = useLocationFormUpdateMutation();
  const navigate = useNavigate();
  const { refreshLocations, onClose, locationPath } = useWorkspaceContext();
  const canWrite = useCanWrite();
  const [name, setName] = useState(location?.name ?? "");
  const [error, setError] = useState("");
  const pending = create.pending || update.pending;
  const failed = (failure: Error) =>
    setError(
      `${failure.message} Check inventory before retrying; changes may have been saved.`,
    );
  function completed(id?: string) {
    if (!id) {
      failed(new Error("The server did not confirm the saved location."));
      return;
    }
    refreshLocations();
    navigate(locationPath(id));
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !canWrite) return;
    setError("");
    if (location)
      update.save(
        { input: { id: location.id, name } },
        (response) => completed(response.updateClogLocation?.clogLocation?.id),
        failed,
      );
    else
      create.save(
        { input: { name } },
        (response) => completed(response.createClogLocation?.clogLocation?.id),
        failed,
      );
  }
  return { location, onClose, canWrite, name, setName, error, pending, submit };
}
