import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useItemFormCreateMutation as useItemFormCreateMutationOperation } from "./__generated__/useItemFormCreateMutation.graphql";

export function useItemFormCreateMutation() {
  return useSaveMutation<useItemFormCreateMutationOperation>(graphql`
    mutation useItemFormCreateMutation($input: CreateClogItemInput!) {
      createClogItem(input: $input) {
        clogItem {
          id
          ...ItemDetails_item
          ...ItemForm_item
        }
      }
    }
  `);
}
