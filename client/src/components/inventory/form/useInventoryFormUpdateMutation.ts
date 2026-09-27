import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useInventoryFormUpdateMutation as useInventoryFormUpdateMutationOperation } from "./__generated__/useInventoryFormUpdateMutation.graphql";

export function useInventoryFormUpdateMutation() {
  return useSaveMutation<useInventoryFormUpdateMutationOperation>(graphql`
    mutation useInventoryFormUpdateMutation($input: UpdateClogInventoryInput!) {
      updateClogInventory(input: $input) {
        clogInventory {
          id
          ...InventoryDetails_inventory
          ...InventoryForm_inventory
        }
      }
    }
  `);
}
