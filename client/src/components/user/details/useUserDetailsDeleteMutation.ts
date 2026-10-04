import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useUserDetailsDeleteMutation as useUserDetailsDeleteMutationOperation } from "./__generated__/useUserDetailsDeleteMutation.graphql";

export function useUserDetailsDeleteMutation() {
  return useSaveMutation<useUserDetailsDeleteMutationOperation>(graphql`
    mutation useUserDetailsDeleteMutation($input: DeleteClogUserInput!) {
      deleteClogUser(input: $input) {
        deletedId @deleteRecord
      }
    }
  `);
}
