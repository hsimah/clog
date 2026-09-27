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
import type { ItemPickerQuery } from "./__generated__/ItemPickerQuery.graphql";
import type { ItemPickerPaginationQuery } from "./__generated__/ItemPickerPaginationQuery.graphql";
import type { ItemPicker_query$key } from "./__generated__/ItemPicker_query.graphql";

const QUERY = graphql`
  query ItemPickerQuery($term: String) {
    ...ItemPicker_query @arguments(term: $term)
  }
`;

export interface ItemPickerSelection {
  id: string;
  name: string;
}

export function ItemPicker(props: ItemPickerProps) {
  const [term, setTerm] = useState("");
  const [revision, setRevision] = useState(0);
  const variables = useMemo(() => ({ term }), [term]);
  const reference = useRouteQuery<ItemPickerQuery>(QUERY, variables, revision);
  return (
    <Stack gap={2}>
      <TextInput
        label="Find an item"
        value={term}
        onChange={setTerm}
        isDisabled={props.disabled}
        placeholder="Search all items..."
      />
      <QueryBoundary
        key={reference?.fetchKey ?? "initial"}
        retry={() => setRevision((value) => value + 1)}
      >
        {reference ? (
          <ItemPicker_PickerQuery reference={reference} {...props} />
        ) : (
          <Text role="status">Loading items...</Text>
        )}
      </QueryBoundary>
    </Stack>
  );
}

interface ItemPickerProps {
  value: ItemPickerSelection | null;
  onChange: (value: ItemPickerSelection | null) => void;
  disabled?: boolean;
}

function ItemPicker_PickerQuery({
  reference,
  ...props
}: ItemPickerProps & { reference: PreloadedQuery<ItemPickerQuery> }) {
  const data = usePreloadedQuery<ItemPickerQuery>(QUERY, reference);
  return <ItemPicker_Picker queryRef={data} {...props} />;
}

function ItemPicker_Picker({
  queryRef,
  value,
  onChange,
  disabled,
}: ItemPickerProps & { queryRef: ItemPicker_query$key }) {
  const { error, hasNext, isLoadingNext, entries, loadMore } =
    useItemPickerChoices({ queryRef, value, onChange, disabled });
  return (
    <Stack gap={2}>
      <Selector
        label="Item"
        value={value?.id ?? ""}
        isDisabled={disabled}
        options={[
          { value: "", label: "Select an item" },
          ...entries.map((entry) => ({ value: entry.id, label: entry.name })),
        ]}
        onChange={(id) =>
          onChange(entries.find((entry) => entry.id === id) ?? null)
        }
      />
      {error && <Text role="alert">{error}</Text>}
      {hasNext && (
        <Button
          label="Load more item choices"
          variant="ghost"
          isDisabled={disabled}
          isLoading={isLoadingNext}
          onClick={loadMore}
        />
      )}
    </Stack>
  );
}

function useItemPickerChoices({
  queryRef,
  value,
}: ItemPickerProps & { queryRef: ItemPicker_query$key }) {
  const [error, setError] = useState("");
  const { data, hasNext, loadNext, isLoadingNext } = usePaginationFragment<
    ItemPickerPaginationQuery,
    ItemPicker_query$key
  >(
    graphql`
      fragment ItemPicker_query on RootQuery
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 25 }
        cursor: { type: "String" }
        term: { type: "String" }
      )
      @refetchable(queryName: "ItemPickerPaginationQuery") {
        clogItemSearch(first: $count, after: $cursor, where: { term: $term })
          @connection(key: "ItemPicker__clogItemSearch", filters: ["where"]) {
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
    data.clogItemSearch?.edges?.flatMap((edge) =>
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
