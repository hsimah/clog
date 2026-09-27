import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useItemDetailsBarcodeMutation as useItemDetailsBarcodeMutationOperation } from "./__generated__/useItemDetailsBarcodeMutation.graphql";

export function useItemDetailsBarcodeMutation() {
  return useSaveMutation<useItemDetailsBarcodeMutationOperation>(graphql`
    mutation useItemDetailsBarcodeMutation($input: UpdateClogItemInput!) {
      updateClogItem(input: $input) {
        clogItem {
          ...ItemDetails_item
        }
      }
    }
  `);
}
