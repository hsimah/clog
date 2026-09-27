import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useItemDetailsDeleteMutation as useItemDetailsDeleteMutationOperation } from "./__generated__/useItemDetailsDeleteMutation.graphql";

export function useItemDetailsDeleteMutation() {
  return useSaveMutation<useItemDetailsDeleteMutationOperation>(graphql`
    mutation useItemDetailsDeleteMutation($input: DeleteClogItemInput!) {
      deleteClogItem(input: $input) {
        deletedId @deleteRecord
      }
    }
  `);
}
