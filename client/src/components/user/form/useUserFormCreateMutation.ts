import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useUserFormCreateMutation as useUserFormCreateMutationOperation } from "./__generated__/useUserFormCreateMutation.graphql";

export function useUserFormCreateMutation() {
  return useSaveMutation<useUserFormCreateMutationOperation>(graphql`
    mutation useUserFormCreateMutation($input: CreateClogUserInput!) {
      createClogUser(input: $input) {
        clogUser {
          id
        }
      }
    }
  `);
}
