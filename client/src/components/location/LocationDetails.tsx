import { useLocationDetailsDeleteMutation } from "./details/useLocationDetailsDeleteMutation";
import { useWorkspaceContext } from "../../app/useWorkspaceContext";
import { useEffect, useRef, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { Button } from "@astryxdesign/core/Button";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useCanWrite } from "../../relay/useCanWrite";
import type { LocationDetails_location$key } from "./__generated__/LocationDetails_location.graphql";

export function LocationDetails({
  locationRef,
}: {
  locationRef: LocationDetails_location$key;
}) {
  const {
    location,
    pending,
    onClose,
    locationPath,
    heading,
    error,
    canWrite,
    deleteLocation,
  } = useLocationDetails({ locationRef });
  return (
    <Stack gap={4}>
      <Text as="h2" type="display-3" tabIndex={-1} ref={heading}>
        {location.name}
      </Text>
      <Text>Created {new Date(location.createdAt).toLocaleDateString()}</Text>
      <Text>{location.stockCount} stocked units</Text>
      {location.stockCount > 0 && (
        <Text>Remove or move the stock before deleting this location.</Text>
      )}
      {error && <Text role="alert">{error}</Text>}
      <Stack direction="horizontal" gap={2} wrap="wrap">
        <Button
          label="Edit"
          href={locationPath(location.id, true)}
          isDisabled={!canWrite || pending}
        />
        <Button
          label="Delete"
          variant="destructive"
          isLoading={pending}
          isDisabled={!canWrite || location.stockCount > 0}
          onClick={deleteLocation}
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

function useLocationDetails({
  locationRef,
}: {
  locationRef: LocationDetails_location$key;
}) {
  const location = useFragment(
    graphql`
      fragment LocationDetails_location on ClogLocation {
        id
        name
        createdAt
        stockCount
      }
    `,
    locationRef,
  );
  const { save, pending } = useLocationDetailsDeleteMutation();
  const { refreshLocations, onClose, locationPath } = useWorkspaceContext();
  const heading = useRef<HTMLElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [location.id]);
  const [error, setError] = useState("");
  const canWrite = useCanWrite();
  function deleteLocation() {
    if (!window.confirm(`Delete ${location.name}?`)) return;
    setError("");
    save(
      { input: { id: location.id } },
      (response) => {
        if (!response.deleteClogLocation?.deletedId) {
          setError(
            "The server did not confirm deletion. Check inventory before retrying.",
          );
          return;
        }
        refreshLocations();
        onClose();
      },
      (failure) =>
        setError(
          `${failure.message} Check inventory before retrying; changes may have been saved.`,
        ),
    );
  }
  return {
    location,
    pending,
    onClose,
    locationPath,
    heading,
    error,
    canWrite,
    deleteLocation,
  };
}
