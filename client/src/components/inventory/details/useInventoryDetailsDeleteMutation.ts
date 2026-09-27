import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useInventoryDetailsDeleteMutation as useInventoryDetailsDeleteMutationOperation } from "./__generated__/useInventoryDetailsDeleteMutation.graphql";

export function useInventoryDetailsDeleteMutation() {
  return useSaveMutation<useInventoryDetailsDeleteMutationOperation>(graphql`
    mutation useInventoryDetailsDeleteMutation(
      $input: DeleteClogInventoryInput!
    ) {
      deleteClogInventory(input: $input) {
        deletedId @deleteRecord
      }
    }
  `);
}
