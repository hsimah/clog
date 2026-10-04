import { graphql } from "react-relay";
import { useSaveMutation } from "../../../relay/useSaveMutation";
import type { useUserDetailsResetPasswordMutation as useUserDetailsResetPasswordMutationOperation } from "./__generated__/useUserDetailsResetPasswordMutation.graphql";

export function useUserDetailsResetPasswordMutation() {
  return useSaveMutation<useUserDetailsResetPasswordMutationOperation>(graphql`
    mutation useUserDetailsResetPasswordMutation(
      $input: ResetClogUserPasswordInput!
    ) {
      resetClogUserPassword(input: $input) {
        clogUser {
          id
        }
      }
    }
  `);
}
