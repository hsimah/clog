import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useLocationDetailsDeleteMutation as useLocationDetailsDeleteMutationOperation } from "./__generated__/useLocationDetailsDeleteMutation.graphql";

export function useLocationDetailsDeleteMutation() {
  return useSaveMutation<useLocationDetailsDeleteMutationOperation>(graphql`
    mutation useLocationDetailsDeleteMutation(
      $input: DeleteClogLocationInput!
    ) {
      deleteClogLocation(input: $input) {
        deletedId @deleteRecord
      }
    }
  `);
}
