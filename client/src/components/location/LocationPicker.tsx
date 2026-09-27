import { Text } from "@astryxdesign/core/Text";
import { useMemo, useState } from "react";
import {
  graphql,
  usePaginationFragment,
  usePreloadedQuery,
  type PreloadedQuery,
} from "react-relay";
import { Stack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Button } from "@astryxdesign/core/Button";
import { QueryBoundary } from "../../relay/QueryBoundary";
import { useRouteQuery } from "../../relay/useRouteQuery";
import type { LocationPickerQuery } from "./__generated__/LocationPickerQuery.graphql";
import type { LocationPickerPaginationQuery } from "./__generated__/LocationPickerPaginationQuery.graphql";
import type { LocationPicker_query$key } from "./__generated__/LocationPicker_query.graphql";

const QUERY = graphql`
  query LocationPickerQuery($term: String) {
    ...LocationPicker_query @arguments(term: $term)
  }
`;

export interface LocationPickerSelection {
  id: string;
  name: string;
}

export function LocationPicker(props: LocationPickerProps) {
  const [term, setTerm] = useState("");
  const [revision, setRevision] = useState(0);
  const variables = useMemo(() => ({ term }), [term]);
  const reference = useRouteQuery<LocationPickerQuery>(
    QUERY,
    variables,
    revision,
  );
  return (
    <Stack gap={2}>
      <TextInput
        label="Find a location"
        value={term}
        onChange={setTerm}
        isDisabled={props.disabled}
        placeholder="Search all locations..."
      />
      <QueryBoundary
        key={reference?.fetchKey ?? "initial"}
        retry={() => setRevision((value) => value + 1)}
      >
        {reference ? (
          <LocationPicker_PickerQuery reference={reference} {...props} />
        ) : (
          <Text role="status">Loading locations...</Text>
        )}
      </QueryBoundary>
    </Stack>
  );
}

interface LocationPickerProps {
  value: LocationPickerSelection | null;
  onChange: (value: LocationPickerSelection | null) => void;
  disabled?: boolean;
}

function LocationPicker_PickerQuery({
  reference,
  ...props
}: LocationPickerProps & { reference: PreloadedQuery<LocationPickerQuery> }) {
  const data = usePreloadedQuery<LocationPickerQuery>(QUERY, reference);
  return <LocationPicker_Picker queryRef={data} {...props} />;
}

function LocationPicker_Picker({
  queryRef,
  value,
  onChange,
  disabled,
}: LocationPickerProps & { queryRef: LocationPicker_query$key }) {
  const { error, hasNext, isLoadingNext, entries, loadMore } =
    useLocationPickerChoices({ queryRef, value, onChange, disabled });
  return (
    <Stack gap={2}>
      <Selector
        label="Location"
        value={value?.id ?? ""}
        isDisabled={disabled}
        options={[
          { value: "", label: "Select a location" },
          ...entries.map((entry) => ({ value: entry.id, label: entry.name })),
        ]}
        onChange={(id) =>
          onChange(entries.find((entry) => entry.id === id) ?? null)
        }
      />
      {error && <Text role="alert">{error}</Text>}
      {hasNext && (
        <Button
          label="Load more location choices"
          variant="ghost"
          isDisabled={disabled}
          isLoading={isLoadingNext}
          onClick={loadMore}
        />
      )}
    </Stack>
  );
}

function useLocationPickerChoices({
  queryRef,
  value,
}: LocationPickerProps & { queryRef: LocationPicker_query$key }) {
  const [error, setError] = useState("");
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    LocationPickerPaginationQuery,
    LocationPicker_query$key
  >(
    graphql`
      fragment LocationPicker_query on RootQuery
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "String" }
        term: { type: "String" }
      )
      @refetchable(queryName: "LocationPickerPaginationQuery") {
        clogLocationSearch(
          first: $count
          after: $cursor
          where: { term: $term }
        )
          @connection(
            key: "LocationPicker__clogLocationSearch"
            filters: ["where"]
          ) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    queryRef,
  );
  const entries =
    data.clogLocationSearch?.edges?.flatMap((edge) =>
      edge?.node ? [edge.node] : [],
    ) ?? [];
  if (value && !entries.some((entry) => entry.id === value.id))
    entries.unshift(value);

  function loadMore() {
    setError("");
    loadNext(25, {
      onComplete: (failure) => {
        if (failure) setError(failure.message);
      },
    });
  }
  return {
    error,
    setError,
    hasNext,
    loadNext,
    isLoadingNext,
    entries,
    loadMore,
  };
}
