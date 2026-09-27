import { graphql, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { Text } from "@astryxdesign/core/Text";
import { LocationDetails } from "./LocationDetails";
import { LocationForm } from "./LocationForm";
import type { LocationRecordQuery } from "./__generated__/LocationRecordQuery.graphql";

const QUERY = graphql`
  query LocationRecordQuery($id: ID!) {
    clogLocation(id: $id) {
      id
      ...LocationDetails_location
      ...LocationForm_location
    }
  }
`;

export function LocationRecord({
  reference,
  edit = false,
}: {
  reference: PreloadedQuery<LocationRecordQuery>;
  edit?: boolean;
}) {
  const { clogLocation } = usePreloadedQuery<LocationRecordQuery>(
    QUERY,
    reference,
  );
  if (!clogLocation) return <Text>Location not found</Text>;
  return edit ? (
    <LocationForm key={clogLocation.id} locationRef={clogLocation} />
  ) : (
    <LocationDetails locationRef={clogLocation} />
  );
}
