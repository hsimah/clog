import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useItemFormUpdateMutation as useItemFormUpdateMutationOperation } from "./__generated__/useItemFormUpdateMutation.graphql";

export function useItemFormUpdateMutation() {
  return useSaveMutation<useItemFormUpdateMutationOperation>(graphql`
    mutation useItemFormUpdateMutation($input: UpdateClogItemInput!) {
      updateClogItem(input: $input) {
        clogItem {
          id
          ...ItemDetails_item
          ...ItemForm_item
        }
      }
    }
  `);
}
