import { graphql, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { Text } from "@astryxdesign/core/Text";
import { ItemDetails } from "./ItemDetails";
import { ItemForm } from "./ItemForm";
import type { ItemRecordQuery } from "./__generated__/ItemRecordQuery.graphql";

const QUERY = graphql`
  query ItemRecordQuery($id: ID!) {
    clogItem(id: $id) {
      id
      ...ItemDetails_item
      ...ItemForm_item
    }
  }
`;

export function ItemRecord({
  reference,
  edit = false,
}: {
  reference: PreloadedQuery<ItemRecordQuery>;
  edit?: boolean;
}) {
  const { clogItem } = usePreloadedQuery<ItemRecordQuery>(QUERY, reference);
  if (!clogItem) return <Text>Item not found</Text>;
  return edit ? (
    <ItemForm key={clogItem.id} itemRef={clogItem} />
  ) : (
    <ItemDetails itemRef={clogItem} />
  );
}
