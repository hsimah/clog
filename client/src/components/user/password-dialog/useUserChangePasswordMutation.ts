import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useUserChangePasswordMutation as Mutation } from "./__generated__/useUserChangePasswordMutation.graphql";

export function useUserChangePasswordMutation() {
  return useSaveMutation<Mutation>(graphql`
    mutation useUserChangePasswordMutation($input: ChangeClogUserPasswordInput!) {
      changeClogUserPassword(input: $input) {
        clogUser { id }
      }
    }
  `);
}
